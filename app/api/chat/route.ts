// → app/api/chat/route.ts   (REPLACES the existing file)
//
// SignalBoost Concierge backend.
//  - Loads partners via STATIC IMPORT (guaranteed bundled into the function;
//    avoids the public/partners.json runtime-read failure that was throwing 500
//    and showing "Something went wrong" in the widget).
//  - Claude chooses WHICH partners match (by id); the SERVER resolves the exact
//    affiliate URL from regional_urls based on the visitor's country, so links
//    are always correct and geo-targeted (revenue-safe — no hallucinated URLs).
//
// Request : { messages: {role:"user"|"assistant"; content:string}[], lang?: Lang }
// Response: { reply: string, partners: PartnerCard[] }
//
// ENV: ANTHROPIC_API_KEY (set), ANTHROPIC_MODEL (optional; see note below).

import { NextRequest, NextResponse } from "next/server";
// Path is relative to app/api/chat/ -> repo root /public/partners.json.
// Static import => the data ships inside the serverless bundle.
import partnersData from "../../../public/partners.json";

export const runtime = "nodejs";
export const maxDuration = 30;

// If chat fails, the model string is the #1 thing to check. Override via env
// to whatever current model your account has access to.
// Hardcoded to a current model (claude-sonnet-4-5 was retired April 2026).
// No env-var dependency, so a stale ANTHROPIC_MODEL can never override it.
const MODEL = "claude-sonnet-4-6";
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

interface Partner {
  id: string;
  name: string;
  regions?: string[];
  url: string;
  category_key?: string;
  category_label?: string;
  network?: string;
  logo?: string;
  description?: string;
  tier?: number;
  featured?: boolean;
  travel_related?: boolean;
  regional_urls?: Record<string, string>;
  placements?: Record<string, string[]>;
}

interface PartnerCard {
  id: string;
  name: string;
  category: string;
  description: string;
  url: string;
}

// Tolerate both [ ... ] and { partners: [ ... ] } shapes.
const PARTNERS: Partner[] = (() => {
  const raw = partnersData as unknown;
  if (Array.isArray(raw)) return raw as Partner[];
  if (raw && typeof raw === "object" && Array.isArray((raw as { partners?: unknown }).partners)) {
    return (raw as { partners: Partner[] }).partners;
  }
  return [];
})();

const PARTNERS_BY_ID = new Map(PARTNERS.map((p) => [p.id, p]));

/* ---- Visitor region from Vercel geo headers ------------------------------- */
const COUNTRY_TO_REGION: Record<string, string> = {
  US: "us", BR: "br", GB: "uk", UK: "uk", PL: "pl", RU: "ru",
  CA: "ca", AU: "au", NZ: "nz", DE: "de", FR: "fr", IT: "it",
  AR: "ar", CO: "co", PE: "pe",
  MX: "es-latam", CL: "es-latam", EC: "es-latam", BO: "es-latam",
  PY: "es-latam", UY: "es-latam", VE: "es-latam", ES: "es-latam",
};

function regionFromRequest(req: NextRequest): string {
  const country = (req.headers.get("x-vercel-ip-country") || "").toUpperCase();
  return COUNTRY_TO_REGION[country] || "ot";
}

function pickUrl(p: Partner, region: string): string {
  if (p.regional_urls) {
    if (p.regional_urls[region]) return p.regional_urls[region];
    if (p.regional_urls["ot"]) return p.regional_urls["ot"];
  }
  return p.url;
}

/* ---- Compact directory for the model (region-prioritized) ----------------- */
function buildDirectory(region: string): string {
  const sorted = [...PARTNERS].sort((a, b) => {
    const ar = a.regions?.includes(region) ? 0 : 1;
    const br = b.regions?.includes(region) ? 0 : 1;
    if (ar !== br) return ar - br;
    return (a.tier ?? 9) - (b.tier ?? 9);
  });
  return sorted
    .slice(0, 120)
    .map(
      (p) =>
        `${p.id} | ${p.name} | ${p.category_key || "other"} | regions:${(p.regions || []).join(",") || "ot"} | ${(p.description || "").slice(0, 90)}`
    )
    .join("\n");
}

function systemPrompt(lang: Lang, region: string): string {
  const langName = LANG_NAMES[lang];
  return `You are the SignalBoost Concierge, a warm and concise assistant on signalboostapp.com.

SignalBoost runs a geo-aware affiliate marketplace plus a SaaS platform (AI site builder, review collector, audio/video hosting, podcast tools). Your job is to understand what the visitor needs and connect them to the most relevant affiliate PARTNERS from the directory below, and/or mention the SaaS when relevant.

The visitor's region is "${region}". PREFER partners that serve that region, but do NOT refuse to help when none perfectly match: a useful recommendation the visitor must check for availability is far better than nothing. Many travel partners (e.g. global booking sites, flight search engines) work worldwide even when their listed regions are limited.

PARTNER DIRECTORY (id | name | category | regions | description):
${buildDirectory(region)}

Match the visitor's intent to a category, e.g.: flights / plane ticket / fly to X -> flights; hotel / stay / accommodation -> hotels; rent a car -> car_rentals; sim / data / staying connected abroad -> esim; travel insurance -> insurance; tours / activities -> tours; airport transfer -> transfers. For a travel request like "plane ticket to Lima, Peru", recommend flights partners first (you may add a complementary one like esim or hotels if clearly useful).

Respond with ONLY a single valid JSON object — no markdown, no backticks, no text outside it:
{"reply": string, "partnerIds": string[]}

- "reply": 1-3 warm sentences written in ${langName}. If you found partners that serve the region, say so naturally and invite them to tap the cards. If the visitor's intent is clear but no partner perfectly serves their region, STILL recommend the closest useful options and be honest, e.g. "I don't have a partner dedicated to your region for this, but these can help — just confirm they cover your area." NEVER paste URLs or link text — the app renders clickable partner cards from the ids.
- "partnerIds": up to 4 ids taken EXACTLY from the directory above. When the intent is a real need (flights, hotels, travel, shopping, etc.), ALWAYS return at least the 1-3 closest useful partners even if their region isn't a perfect match — broaden to adjacent categories (a general booking/travel partner for a flight request, etc.) rather than returning none. Return [] ONLY for greetings or pure small talk where no product fits.`;
}

/* ---- Parse helpers -------------------------------------------------------- */
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

function parseModelJson(text: string): { reply?: unknown; partnerIds?: unknown } | null {
  if (!text) return null;
  const cleaned = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const s = cleaned.indexOf("{");
    const e = cleaned.lastIndexOf("}");
    if (s >= 0 && e > s) {
      try {
        return JSON.parse(cleaned.slice(s, e + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

/* ========================================================================== */
export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { reply: "The concierge isn't configured yet.", partners: [] },
      { status: 500 }
    );
  }

  let body: { messages?: unknown; lang?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ reply: "Invalid request.", partners: [] }, { status: 400 });
  }

  const lang: Lang = LANGS.includes(body.lang as Lang) ? (body.lang as Lang) : "en";
  const region = regionFromRequest(req);

  // Sanitize conversation: only user/assistant text, must start with a user turn.
  const rawMessages = Array.isArray(body.messages) ? body.messages : [];
  let conversation = rawMessages
    .map((m) => {
      const o = (m || {}) as Record<string, unknown>;
      const role = o.role === "assistant" ? "assistant" : "user";
      const content = typeof o.content === "string" ? o.content : "";
      return { role, content };
    })
    .filter((m) => m.content.trim().length > 0);

  const firstUser = conversation.findIndex((m) => m.role === "user");
  conversation = firstUser >= 0 ? conversation.slice(firstUser) : [];
  if (conversation.length === 0) {
    return NextResponse.json({ reply: "How can I help?", partners: [] });
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
        max_tokens: 1024,
        system: systemPrompt(lang, region),
        messages: conversation,
      }),
    });

    if (!aiRes.ok) {
      const detail = await aiRes.text().catch(() => "");
      // Surfaces the real cause (bad model string, auth, etc.) in Vercel logs.
      console.error("Anthropic error", aiRes.status, detail.slice(0, 600));
      return NextResponse.json(
        { reply: "The concierge is busy right now. Please try again.", partners: [] },
        { status: 502 }
      );
    }

    const data = await aiRes.json();
    const text = readAnthropicText(data);
    const parsed = parseModelJson(text);

    // If JSON parsing fails, still return the model's text so the user sees a reply.
    if (!parsed) {
      return NextResponse.json({ reply: text || "Sorry, could you rephrase that?", partners: [] });
    }

    const reply = typeof parsed.reply === "string" ? parsed.reply : (text || "");
    const ids = Array.isArray(parsed.partnerIds)
      ? (parsed.partnerIds as unknown[]).map((x) => String(x))
      : [];

    const partners: PartnerCard[] = ids
      .map((id) => PARTNERS_BY_ID.get(id))
      .filter((p): p is Partner => Boolean(p))
      .slice(0, 4)
      .map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category_label || p.category_key || "",
        description: p.description || "",
        url: pickUrl(p, region),
      }));

    return NextResponse.json({ reply: reply || "Here's what I found:", partners });
  } catch (err) {
    console.error("chat route error", err);
    return NextResponse.json(
      { reply: "Something went wrong. Please try again.", partners: [] },
      { status: 500 }
    );
  }
}
