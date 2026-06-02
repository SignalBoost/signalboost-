import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { saveMessage } from "@/lib/outreach";

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const AI_MODEL = "claude-sonnet-4-6";

const PLAYBOOK = `You are writing a warm, consultative outreach email on behalf of SignalBoost to an existing affiliate partner.

ABOUT SIGNALBOOST:
SignalBoost is a geo-aware affiliate marketplace. The recipient is already a partner in our network. We are now expanding into SaaS tools for small businesses: Reviews collection, Email Outreach, Calendar, Spreadsheets, Promote, and more — all under one roof at saas.signalboostapp.com.

TONE RULES:
- Warm, partner-update feel — they already know us, this is not cold outreach
- Lead with THEIR benefit (these tools help their business grow, not ours)
- Subtly mention that this very message was sent using our Outreach tool (once, naturally — e.g. "we used our own outreach tool to reach out")
- CTA: invite them to explore at saas.signalboostapp.com
- 4–6 short paragraphs maximum
- No salesy language, no urgency tactics, no "limited time offer"
- Sign off: "The SignalBoost Team"

OUTPUT FORMAT:
Respond with valid JSON only — no markdown, no extra text:
{"subject":"...","body":"..."}
The body must be plain text (no HTML, no markdown). Use newlines for paragraph breaks.`;

// POST /api/outreach/draft → generate AI draft and save it
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { leadId, name, company, category, network, notes } = await req.json();
    if (!leadId) return NextResponse.json({ error: "leadId required" }, { status: 400 });

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "AI drafting not configured (missing ANTHROPIC_API_KEY)" }, { status: 503 });
    }

    const partnerContext = [
      `Company/Partner: ${company || name}`,
      category ? `Category: ${category}` : null,
      network ? `Affiliate Network: ${network}` : null,
      notes ? `Additional context: ${notes}` : null,
    ].filter(Boolean).join("\n");

    const userPrompt = `Write a personalized outreach email for this partner:\n\n${partnerContext}\n\nRemember to follow the playbook and output valid JSON only.`;

    const res = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: AI_MODEL,
        max_tokens: 800,
        system: PLAYBOOK,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ error: "AI service error" }, { status: 502 });
    }

    const aiData = await res.json();
    const rawText = (aiData.content as { type: string; text?: string }[])
      ?.filter((b) => b.type === "text")
      .map((b) => b.text || "")
      .join("")
      .trim();

    // Strip any accidental markdown fences
    const clean = rawText.replace(/^```json\s*/i, "").replace(/\s*```$/, "").trim();

    let subject = "";
    let body = "";
    try {
      const parsed = JSON.parse(clean);
      subject = parsed.subject || "";
      body = parsed.body || "";
    } catch {
      // Fallback: couldn't parse JSON — return raw as body
      subject = `Update from SignalBoost for ${company || name}`;
      body = rawText;
    }

    if (!subject || !body) {
      return NextResponse.json({ error: "AI returned an empty draft" }, { status: 502 });
    }

    const message = await saveMessage(user.id, leadId, subject, body);
    return NextResponse.json({ message });
  } catch (err) {
    console.error("POST /api/outreach/draft:", err);
    return NextResponse.json({ error: "Draft generation failed" }, { status: 500 });
  }
}
