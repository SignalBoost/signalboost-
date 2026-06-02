import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

type CampaignPackage = {
  headline: string;
  subheadline: string;
  body: string;
  cta: string;
  links: { email: string; social: string; paid: string };
};

function addUtm(baseUrl: string, channel: "email" | "social" | "paid", campaignName: string) {
  const safeUrl = baseUrl || "https://www.signalboostapp.com";
  const url = new URL(safeUrl.startsWith("http") ? safeUrl : `https://${safeUrl}`);
  url.searchParams.set("utm_source", channel === "paid" ? "paid_media" : channel);
  url.searchParams.set("utm_medium", channel === "email" ? "email" : channel === "social" ? "organic_social" : "cpc");
  url.searchParams.set("utm_campaign", campaignName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "signalboost-campaign");
  return url.toString();
}

function fallbackPackage({ goal, audience, tone, offer, landingUrl }: Record<string, string>): CampaignPackage {
  const campaign = goal || "growth campaign";
  const target = audience || "business owners";
  const voice = tone || "confident";
  const value = offer || "a faster way to launch and measure growth";
  const headline = `${campaign.replace(/^./, (c) => c.toUpperCase())} for ${target}`;
  return {
    headline,
    subheadline: `A ${voice} campaign package built around ${value}.`,
    body: `Give ${target} a clear reason to act now: ${value}. This campaign connects the promise, proof, and next step in one focused message so every channel drives measurable demand.`,
    cta: "Launch the campaign",
    links: { email: addUtm(landingUrl, "email", campaign), social: addUtm(landingUrl, "social", campaign), paid: addUtm(landingUrl, "paid", campaign) },
  };
}

function parsePackage(text: string, context: Record<string, string>): CampaignPackage {
  const cleaned = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  try {
    const json = JSON.parse(cleaned) as Partial<CampaignPackage>;
    const fallback = fallbackPackage(context);
    return {
      headline: String(json.headline || fallback.headline),
      subheadline: String(json.subheadline || fallback.subheadline),
      body: String(json.body || fallback.body),
      cta: String(json.cta || fallback.cta),
      links: {
        email: String(json.links?.email || fallback.links.email),
        social: String(json.links?.social || fallback.links.social),
        paid: String(json.links?.paid || fallback.links.paid),
      },
    };
  } catch {
    return fallbackPackage(context);
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const action = String(body.action || "generate");
  const context = {
    goal: String(body.goal || body.campaign?.headline || "growth campaign"),
    audience: String(body.audience || "business owners"),
    tone: String(body.tone || "confident"),
    offer: String(body.offer || "measurable business growth"),
    landingUrl: String(body.landingUrl || body.baseUrl || "https://www.signalboostapp.com"),
  };
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ package: fallbackPackage(context), provider: "local-strategy-engine" });

  const anthropic = new Anthropic({ apiKey });
  const existing = body.campaign ? `\nExisting package to rewrite or vary: ${JSON.stringify(body.campaign)}` : "";
  const prompt = `Create a complete, production-ready marketing campaign package. Action: ${action}.
Goal: ${context.goal}
Audience: ${context.audience}
Tone: ${context.tone}
Offer/value proposition: ${context.offer}
Landing URL: ${context.landingUrl}${existing}
Return ONLY valid JSON with exactly this shape: {"headline":"","subheadline":"","body":"","cta":"","links":{"email":"","social":"","paid":""}}.
Every link must include channel-specific UTM parameters for email, social, and paid.`;

  const message = await anthropic.messages.create({
    model: process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-latest",
    max_tokens: 900,
    temperature: action === "vary" ? 0.85 : 0.55,
    messages: [{ role: "user", content: prompt }],
  });
  const text = message.content.map((part) => (part.type === "text" ? part.text : "")).join("");
  return NextResponse.json({ package: parsePackage(text, context), provider: "anthropic" });
}
