import { NextRequest, NextResponse } from "next/server";

/**
 * SignalBoost Live Demo — content analysis endpoint
 * -----------------------------------------------------------------------------
 * POST { url: string, lang?: "en"|"pt"|"es"|"pl"|"ru" }
 * 200  {
 *        contentType: "podcast" | "website" | "blog" | "unknown",
 *        title: string,
 *        summary: string,
 *        recommendations: { title: string; detail: string }[],
 *        partnerCategories: string[],   // category_key values from partners.json
 *        ctaLabel: string,
 *        ctaContext: string             // short string pre-filled into SaaS ?q=
 *      }
 * 4xx/5xx { error: string }
 *
 * Native fetch only (no @anthropic-ai/sdk — matches the chat route + lessons
 * learned about SDK install failures on Vercel build cache).
 *
 * ENV:
 *   ANTHROPIC_API_KEY   (already configured on Vercel)
 *   ANTHROPIC_MODEL     (optional) — set to the SAME model your /api/chat route
 *                       uses so the demo and concierge stay consistent.
 * -----------------------------------------------------------------------------
 */

export const runtime = "nodejs";
export const maxDuration = 30;

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5-20250929";
const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";

type Lang = "en" | "pt" | "es" | "pl" | "ru";
const LANGS: Lang[] = ["en", "pt", "es", "pl", "ru"];
const LANG_NAMES: Record<Lang, string> = {
  en: "English",
  pt: "Portuguese",
  es: "Spanish",
  pl: "Polish",
  ru: "Russian",
};

const MAX_CONTENT_CHARS = 6000;
const FETCH_TIMEOUT_MS = 10000;

/* ---- URL validation ------------------------------------------------------- */
function normalizeUrl(raw: string): string | null {
  if (!raw) return null;
  let candidate = raw.trim();
  if (!/^https?:\/\//i.test(candidate)) candidate = `https://${candidate}`;
  try {
    const u = new URL(candidate);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    // Block obvious internal / loopback targets (SSRF hygiene).
    const host = u.hostname.toLowerCase();
    if (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "0.0.0.0" ||
      host.endsWith(".local") ||
      host.startsWith("192.168.") ||
      host.startsWith("10.") ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(host)
    ) {
      return null;
    }
    return u.toString();
  } catch {
    return null;
  }
}

/* ---- Fetch + clean target content ----------------------------------------- */
async function fetchContent(
  url: string
): Promise<{ text: string; isFeed: boolean } | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "SignalBoostDemoBot/1.0 (+https://signalboostapp.com)",
        Accept: "text/html,application/xhtml+xml,application/xml,application/rss+xml;q=0.9,*/*;q=0.8",
      },
    });
    if (!res.ok) return null;

    const contentType = (res.headers.get("content-type") || "").toLowerCase();
    const raw = await res.text();
    const looksLikeFeed =
      contentType.includes("xml") ||
      contentType.includes("rss") ||
      /<rss[\s>]|<feed[\s>]/i.test(raw.slice(0, 2000));

    const text = looksLikeFeed ? extractFeed(raw) : extractHtml(raw);
    return { text: text.slice(0, MAX_CONTENT_CHARS), isFeed: looksLikeFeed };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function decodeEntities(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function extractFeed(xml: string): string {
  const pick = (tag: string, limit: number) => {
    const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "gi");
    const out: string[] = [];
    let m: RegExpExecArray | null;
    while ((m = re.exec(xml)) && out.length < limit) {
      const val = decodeEntities(m[1]).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      if (val) out.push(val);
    }
    return out;
  };
  const titles = pick("title", 25);
  const descriptions = pick("description", 12);
  return [
    titles.length ? `FEED TITLES:\n${titles.join("\n")}` : "",
    descriptions.length ? `\n\nDESCRIPTIONS:\n${descriptions.join("\n")}` : "",
  ]
    .join("")
    .trim();
}

function extractHtml(html: string): string {
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const descMatch = html.match(
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i
  );
  const ogDescMatch = html.match(
    /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)["']/i
  );

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
  )
    .replace(/\s+/g, " ")
    .trim();

  return [
    titleMatch ? `TITLE: ${decodeEntities(titleMatch[1]).trim()}` : "",
    descMatch ? `\nDESCRIPTION: ${decodeEntities(descMatch[1]).trim()}` : "",
    ogDescMatch ? `\nOG: ${decodeEntities(ogDescMatch[1]).trim()}` : "",
    headings.length ? `\n\nHEADINGS:\n${headings.join("\n")}` : "",
    `\n\nBODY:\n${body}`,
  ]
    .join("")
    .trim();
}

/* ---- Prompt --------------------------------------------------------------- */
function buildPrompt(url: string, content: string, isFeed: boolean, lang: Lang): string {
  const langName = LANG_NAMES[lang];
  return `You are SignalBoost's growth analyst. SignalBoost is a platform that helps creators and businesses grow through: an AI site builder, a review collector, native audio/video hosting, podcast tools (transcripts, clips, episodes), and a geo-aware affiliate partner marketplace (categories include flights, hotels, car_rentals, esim, insurance, tours, transfers, marketplace, products_tools, finance, travel_services, specialty_other, health_fitness, sports_outdoors).

A visitor submitted this ${isFeed ? "podcast RSS feed" : "website"} for analysis:
URL: ${url}

CONTENT EXTRACTED:
"""
${content || "(no readable content could be extracted)"}
"""

Analyze what this creator/business does and produce a SHORT, SPECIFIC, value-first analysis showing exactly how SignalBoost would help THEM. Reference concrete details from their content — never generic filler. Be encouraging and concrete.

Respond with ONLY a valid JSON object (no markdown, no backticks, no preamble) in this exact shape:
{
  "contentType": "podcast" | "website" | "blog" | "unknown",
  "title": "the name of their podcast/site/business",
  "summary": "2-3 sentences describing what they do, referencing real details from their content",
  "recommendations": [
    { "title": "short action title", "detail": "1-2 sentence specific recommendation tied to their content" }
  ],
  "partnerCategories": ["category_key", "..."],
  "ctaLabel": "a short button label inviting them to try it",
  "ctaContext": "one short sentence (max 200 chars) summarizing their use case to pre-fill in the app"
}

Rules:
- Provide 3 to 4 recommendations.
- partnerCategories: 1-3 category_key values from the list above that best match monetization opportunities for this creator (use [] if none clearly fit).
- Write ALL human-readable text fields (summary, recommendations, ctaLabel, ctaContext) in ${langName}.
- Keep category_key values in English (they are system identifiers).
- Output strictly valid JSON. Do not include any text outside the JSON object.`;
}

/* ---- Parse Claude's JSON (tolerant of stray fences/prose) ----------------- */
function parseModelJson(text: string): Record<string, unknown> | null {
  if (!text) return null;
  const cleaned = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

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
      .join("")
      .trim();
  }
  return "";
}

/* ========================================================================== */
export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Server is not configured." }, { status: 500 });
  }

  let body: { url?: string; lang?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const lang: Lang = LANGS.includes(body.lang as Lang) ? (body.lang as Lang) : "en";
  const url = normalizeUrl(body.url || "");
  if (!url) {
    return NextResponse.json(
      { error: "Please enter a valid public URL (a website or podcast RSS feed)." },
      { status: 400 }
    );
  }

  const fetched = await fetchContent(url);
  if (!fetched || !fetched.text) {
    return NextResponse.json(
      { error: "We couldn't read that URL. Make sure it's public and try again." },
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
        max_tokens: 1500,
        messages: [
          { role: "user", content: buildPrompt(url, fetched.text, fetched.isFeed, lang) },
        ],
      }),
    });

    if (!aiRes.ok) {
      const detail = await aiRes.text().catch(() => "");
      console.error("Anthropic error", aiRes.status, detail.slice(0, 500));
      return NextResponse.json({ error: "Analysis service is busy. Please try again." }, { status: 502 });
    }

    const data = await aiRes.json();
    const parsed = parseModelJson(readAnthropicText(data));
    if (!parsed) {
      return NextResponse.json({ error: "Could not analyze that content. Try another URL." }, { status: 502 });
    }

    // Shape + harden the output before returning.
    const recommendations = Array.isArray(parsed.recommendations)
      ? (parsed.recommendations as unknown[])
          .map((r) => {
            const o = (r || {}) as Record<string, unknown>;
            return {
              title: String(o.title || "").slice(0, 120),
              detail: String(o.detail || "").slice(0, 400),
            };
          })
          .filter((r) => r.title || r.detail)
          .slice(0, 4)
      : [];

    return NextResponse.json({
      contentType: ["podcast", "website", "blog", "unknown"].includes(String(parsed.contentType))
        ? parsed.contentType
        : "unknown",
      title: String(parsed.title || "").slice(0, 160),
      summary: String(parsed.summary || "").slice(0, 800),
      recommendations,
      partnerCategories: Array.isArray(parsed.partnerCategories)
        ? (parsed.partnerCategories as unknown[]).map((c) => String(c)).slice(0, 3)
        : [],
      ctaLabel: String(parsed.ctaLabel || "").slice(0, 80),
      ctaContext: String(parsed.ctaContext || "").slice(0, 200),
    });
  } catch (err) {
    console.error("analyze route error", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
