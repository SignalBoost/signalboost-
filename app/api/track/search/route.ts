// File: app/api/track/search/route.ts
// Logs a concierge search to the partner_searches table. Anonymous — records
// WHAT was searched (query, detected intent/category, region, how many results,
// whether it found nothing) but never WHO.
//
// The no_results flag is the "unmet demand" signal: searches that returned
// nothing are opportunities for new partners.
//
// Fire-and-forget: always returns 200 fast so analytics never blocks the user.

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function genId(): string {
  return `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const query = String(body.query || "").slice(0, 200);
    if (!query) return NextResponse.json({ ok: false }, { status: 200 });

    const country = req.headers.get("x-vercel-ip-country") || "";
    const region = String(body.region || country || "ot").slice(0, 20);
    const results_count = Number.isFinite(Number(body.results_count))
      ? Number(body.results_count)
      : 0;

    const row = {
      id: genId(),
      query,
      intent: String(body.intent || "").slice(0, 60),
      region,
      results_count,
      no_results: results_count === 0,
    };

    const supabase = await createClient();
    await supabase.from("partner_searches").insert(row);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
