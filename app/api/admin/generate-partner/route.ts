// → app/api/admin/generate-partner/route.ts   (admin-only)
//
// Partner generator. Admin pastes a partner URL; we fetch the page and ask
// Claude to produce a partners.json entry in YOUR EXACT SCHEMA, including:
//   - description_i18n  (5 langs, faithful translations of one description)
//   - pitch_i18n        (5 langs, each written FOR THAT CULTURE — see prompt)
// Returned for the admin to REVIEW, paste real affiliate URLs into, and commit.
// The AI never produces affiliate URLs (placeholders only).
//
// Auth: logged-in Supabase session (Step 3 SSO) + optional ADMIN_EMAILS.
// Request : { url: string }
// Response: { partner: GeneratedPartner } | { error: string }
// ENV: ANTHROPIC_API_KEY, ANTHROPIC_MODEL?, ADMIN_EMAILS?

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60; // pitch generation adds work; allow more time.

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5-20250929";
const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const FETCH_TIMEOUT_MS = 10000;
const MAX_CONTENT_CHARS = 6000;

const URL_PLACEHOLDER = "PASTE_AFFILIATE_URL_HERE";

const CATEGORY_LABELS: Record<string, string> = {
  flights: "Flights",
  hotels: "Hotels",
  car_rentals: "Car Rentals",
  esim: "eSIM & Connectivity",
  insurance: "Insurance & Claims",
  tours: "Tours & Activities",
  transfers: "Transfers",
  marketplace: "Marketplace",
  products_tools: "Products & Tools",
  finance: "Finance",
  travel_services: "Travel Services",
  specialty_other: "Specialty & Other",
  health_fitness: "Health & Fitness",
  sports_outdoors: "Sports & Outdoors",
};
const CATEGORY_KEYS = Object.keys(CATEGORY_LABELS);

const REGION_KEYS = [
  "us", "br", "uk", "pl", "ru", "es-latam", "ca", "au", "nz",
  "de", "fr", "it", "ar", "co", "pe", "ot",
];

const LANGS = ["en", "pt", "es", "pl", "ru"] as const;

interface I18n {
  en: string;
  pt: string;
  es: string;
  pl: string;
  ru: string;
}

interface GeneratedPartner {
  id: string;
  name: string;
  regions: string[];
  url: string;
  category: string;
  category_key: string;
  category_label: string;
  network: string;
  logo: string;
  description: string;
  description_i18n: I18n;
  pitch_i18n: I18n;
  tier: number;
  featured: boolean;
  travel_related: boolean;
  regional_urls: Record<string, string>;
  placements: Record<string, string[]>;
}

/* ---- URL hygiene + fetch -------------------------------------------------- */
function normalizeUrl(raw: string): string | null {
  if (!raw) return null;
  let candidate = raw.trim();
  if (!/^https?:\/\//i.test(candidate)) candidate = `https://${candidate}`;
  try {
    const u = new URL(candidate);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    const host = u.hostname.toLowerCase();
    if (
      host === "localhost" || host === "127.0.0.1" || host === "0.0.0.0" ||
      host.endsWith(".local") || host.startsWith("192.168.") || host.startsWith("10.") ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(host)
    ) return null;
    return u.toString();
  } catch {
    return null;
  }
}

function decodeEntities(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&nbsp;/g, " ");
}

function extractHtml(html: string): string {
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i);
  const ogTitle = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']*)["']/i);
  const ogDesc = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)["']/i);

  const headings: string[] = [];
  const hRe = /<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi;
  let hm: RegExpExecArray | null;
  while ((hm = hRe.exec(html)) && headings.length < 20) {
    const h = decodeEntities(hm[1]).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (h) headings.push(h);
  }

  const body = decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<[^>]+>/g, " ")
  ).replace(/\s+/g, " ").trim();

  return [
    titleMatch ? `TITLE: ${decodeEntities(titleMatch[1]).trim()}` : "",
    ogTitle ? `\nOG_TITLE: ${decodeEntities(ogTitle[1]).trim()}` : "",
    descMatch ? `\nDESCRIPTION: ${decodeEntities(descMatch[1]).trim()}` : "",
    ogDesc ? `\nOG_DESC: ${decodeEntities(ogDesc[1]).trim()}` : "",
    headings.length ? `\n\nHEADINGS:\n${headings.join("\n")}` : "",
    `\n\nBODY:\n${body}`,
  ].join("").trim();
}

async function fetchContent(url: string): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "SignalBoostAdminBot/1.0 (+https://signalboostapp.com)",
        Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
      },
    });
    if (!res.ok) return null;
    const raw = await res.text();
    return extractHtml(raw).slice(0, MAX_CONTENT_CHARS);
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/* ---- Prompt --------------------------------------------------------------- */
function buildPrompt(url: string, content: string): string {
  return `You are SignalBoost's partner cataloguer and a native-level marketing copywriter for 5 markets. Given a company's website, produce a single catalog entry for the SignalBoost affiliate marketplace.

PARTNER URL: ${url}

CONTENT EXTRACTED:
"""
${content || "(no readable content)"}
"""

Allowed category_key (choose exactly one best fit): ${CATEGORY_KEYS.join(", ")}.
Allowed regions (those the company clearly serves; ["ot"] if global/unclear): ${REGION_KEYS.join(", ")}.

Respond with ONLY a valid JSON object (no markdown, no backticks, no preamble):
{
  "id": "lowercase-hyphenated-slug-from-name",
  "name": "Official brand name (NEVER translate this in any language)",
  "category_key": "one value from the allowed list",
  "regions": ["region", "..."],
  "network": "Awin | Admitad | Travelpayouts | Amazon | other (best guess)",
  "travel_related": true or false,
  "description_i18n": {
    "en": "1-2 sentence factual description in English",
    "pt": "the SAME description, faithfully translated to Portuguese",
    "es": "the SAME description in Spanish",
    "pl": "the SAME description in Polish",
    "ru": "the SAME description in Russian"
  },
  "pitch_i18n": {
    "en": "growth pitch for an English-speaking (US/UK) reader",
    "pt": "growth pitch written FOR A BRAZILIAN reader",
    "es": "growth pitch written FOR A HISPANIC/LATIN-AMERICAN reader",
    "pl": "growth pitch written FOR A POLISH reader",
    "ru": "growth pitch written FOR A RUSSIAN reader"
  }
}

DESCRIPTION rules:
- Concrete, specific, ~160 chars max. The 5 descriptions are the SAME message translated. Brand name stays untranslated.

PITCH rules (this is the important part):
- A pitch is 2-3 warm, persuasive sentences on why pairing this partner with SignalBoost helps the reader grow.
- The 5 pitches are NOT translations of each other. Each is written natively FOR ITS OWN CULTURE.
- Ground each pitch in that market's real customs, holidays, gifting seasons, and shopping moments — but ONLY where they genuinely fit this partner's category. Examples of relevance:
    * Poland (pl): imieniny (name days) often matter as much as birthdays — relevant for gifts, flowers, marketplace, beauty; Boże Narodzenie / Black Week shopping.
    * Russia (ru): именины / name days, 8 Marta (Women's Day) gifting, New Year as the peak gift season — relevant for gifts, marketplace, flowers.
    * Brazil (pt): Dia das Mães (huge), Black Friday BR, Carnaval travel, festas juninas.
    * Hispanic/LATAM (es): Día de Reyes (Jan 6 gifting), Día de la Madre, Buen Fin, local travel seasons.
    * US/UK (en): Black Friday/Cyber Monday, Christmas, Mother's/Father's Day.
- Do NOT force a custom where it does not fit the category. A VPN, car rental, insurance, or finance partner should NOT mention name days or flowers — for those, ground the pitch in locally relevant needs (e.g. travel seasons, connectivity abroad, local payment habits) instead.
- Never invent fake holidays. If no specific custom fits, write a culturally natural pitch without forcing one.
- Keep the brand name untranslated inside every pitch.

GENERAL:
- id: lowercase, hyphens only, from the brand name.
- category_key MUST be exactly one allowed value.
- Output strictly valid JSON, nothing else.`;
}

/* ---- Parse + normalize ---------------------------------------------------- */
function readAnthropicText(data: unknown): string {
  if (!data || typeof data !== "object") return "";
  const content = (data as { content?: unknown }).content;
  if (Array.isArray(content)) {
    return content
      .map((b) =>
        b && typeof b === "object" && typeof (b as { text?: unknown }).text === "string"
          ? (b as { text: string }).text
          : ""
      )
      .join("").trim();
  }
  return "";
}

function parseJson(text: string): Record<string, unknown> | null {
  if (!text) return null;
  const cleaned = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const s = cleaned.indexOf("{");
    const e = cleaned.lastIndexOf("}");
    if (s >= 0 && e > s) {
      try { return JSON.parse(cleaned.slice(s, e + 1)); } catch { return null; }
    }
    return null;
  }
}

function slugify(s: string): string {
  return s.toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "partner";
}

function readI18n(raw: unknown, max: number, backfillEn: boolean): I18n {
  const o = (raw || {}) as Record<string, unknown>;
  const str = (v: unknown) => String(v ?? "").slice(0, max);
  const out: I18n = {
    en: str(o.en),
    pt: str(o.pt),
    es: str(o.es),
    pl: str(o.pl),
    ru: str(o.ru),
  };
  // Descriptions backfill to English (a translation gap is harmless).
  // Pitches do NOT backfill — a missing culture-specific pitch should stay
  // empty so the page renders nothing rather than a culturally-wrong pitch.
  if (backfillEn) for (const l of LANGS) if (!out[l]) out[l] = out.en;
  return out;
}

function normalize(parsed: Record<string, unknown>): GeneratedPartner {
  const str = (v: unknown, max: number) => String(v ?? "").slice(0, max);

  const name = str(parsed.name, 120) || "Unnamed partner";
  const id = parsed.id ? slugify(String(parsed.id)) : slugify(name);

  let category = String(parsed.category_key || "");
  if (!CATEGORY_KEYS.includes(category)) category = "specialty_other";

  const regionsRaw = Array.isArray(parsed.regions) ? parsed.regions.map((r) => String(r)) : [];
  const regions = regionsRaw.filter((r) => REGION_KEYS.includes(r));
  if (regions.length === 0) regions.push("ot");

  const description_i18n = readI18n(parsed.description_i18n, 200, true);
  const pitch_i18n = readI18n(parsed.pitch_i18n, 400, false);

  const regional_urls: Record<string, string> = {};
  const placements: Record<string, string[]> = {};
  for (const r of regions) {
    regional_urls[r] = URL_PLACEHOLDER;
    placements[r] = ["header"];
  }

  return {
    id,
    name,
    regions,
    url: URL_PLACEHOLDER,
    category,
    category_key: category,
    category_label: CATEGORY_LABELS[category],
    network: str(parsed.network, 60) || "Awin",
    logo: `${id}.png`,
    description: description_i18n.en,
    description_i18n,
    pitch_i18n,
    tier: 2,
    featured: false,
    travel_related: Boolean(parsed.travel_related),
    regional_urls,
    placements,
  };
}

/* ========================================================================== */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }
  const allow = (process.env.ADMIN_EMAILS || "")
    .split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  if (allow.length > 0 && (!user.email || !allow.includes(user.email.toLowerCase()))) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Server is not configured." }, { status: 500 });
  }

  let body: { url?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const url = normalizeUrl(body.url || "");
  if (!url) {
    return NextResponse.json({ error: "Enter a valid partner URL." }, { status: 400 });
  }

  const content = await fetchContent(url);
  if (!content) {
    return NextResponse.json(
      { error: "Couldn't read that URL. Make sure it's public and try again." },
      { status: 422 }
    );
  }

  try {
    const aiRes = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 2500,
        messages: [{ role: "user", content: buildPrompt(url, content) }],
      }),
    });

    if (!aiRes.ok) {
      const detail = await aiRes.text().catch(() => "");
      console.error("Anthropic error", aiRes.status, detail.slice(0, 500));
      return NextResponse.json({ error: "Generation service is busy. Try again." }, { status: 502 });
    }

    const data = await aiRes.json();
    const parsed = parseJson(readAnthropicText(data));
    if (!parsed) {
      return NextResponse.json({ error: "Could not generate a partner entry. Try another URL." }, { status: 502 });
    }

    return NextResponse.json({ partner: normalize(parsed) });
  } catch (err) {
    console.error("generate-partner error", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
