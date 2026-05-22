// File: app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getAllPartners } from "@/lib/partners";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { messages, language = "en" } = await request.json();

    // Load partner data for context
    const partners = getAllPartners();
    const partnerContext = partners
      .slice(0, 20) // Top 20 partners to keep context manageable
      .map((p) => `${p.name} (${p.category_label}) - ${p.description}`)
      .join("\n");

    const systemPrompt = `You are SignalBoost's multilingual AI assistant. Help visitors understand our partner marketplace and SaaS platform.

PARTNER DIRECTORY (sample):
${partnerContext}

CAPABILITIES:
- Partner marketplace: 100+ travel, eSIM, finance, and lifestyle partners across 16 regions
- SaaS platform: Podcast studio with AI clips, transcripts, native audio/video, review collector
- Languages: English, Portuguese, Spanish, Polish, Russian

GUIDELINES:
- Respond in ${language === "pt" ? "Portuguese" : language === "es" ? "Spanish" : language === "pl" ? "Polish" : language === "ru" ? "Russian" : "English"}
- Be concise and helpful
- When users want to try the SaaS, say: "I can connect you to our platform - would you like to see how SignalBoost works with your content?"
- For partner questions, mention relevant partners from the directory
- Keep responses under 3 sentences unless asked for details`;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      system: systemPrompt,
      messages: messages,
    });

    const textContent = response.content.find((c) => c.type === "text");
    const reply = textContent ? textContent.text : "I'm having trouble responding right now.";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process chat" },
      { status: 500 }
    );
  }
}
