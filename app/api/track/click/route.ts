// File: app/api/track/click/route.ts
// Logs a partner click to the partner_clicks table. Anonymous — records WHAT
// was clicked (partner, the query that led there, region) but never WHO.
// Region is taken from Vercel's geo header, falling back to a body value.
//
// Fire-and-forget from the client: failures here must never affect the user's
// click-through, so we always return 200 quickly.

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function genId(): string {
  return `c_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const partner_id = String(body.partner_id || "").slice(0, 80);
    if (!partner_id) return NextResponse.json({ ok: false }, { status: 200 });

    // Region: prefer the client-detected region, else Vercel geo, else "ot".
    const country = req.headers.get("x-vercel-ip-country") || "";
    const region = String(body.region || country || "ot").slice(0, 20);

    const row = {
      id: genId(),
      partner_id,
      partner_name: String(body.partner_name || "").slice(0, 120),
      query: String(body.query || "").slice(0, 200),
      region,
    };

    const supabase = await createClient();
    await supabase.from("partner_clicks").insert(row);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    // Never let analytics break the experience.
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
