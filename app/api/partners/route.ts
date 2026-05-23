// File: app/api/partners/route.ts
// Returns the partner directory as JSON for the homepage to consume.
// Reads from Supabase (affiliate_partners) via loadPartners(), which itself
// falls back to the static public/partners.json if the DB is empty/unreachable.
//
// This lets the client keep its simple fetch() pattern while the source of
// truth moves to the database. Edits/additions/deletions in Supabase now show
// on the site (after the short cache window below) with no redeploy.

import { NextResponse } from "next/server";
import { loadPartners } from "@/lib/home/partners-source";

export const runtime = "nodejs";
// Re-fetch from the DB at most once per 60s (fast for visitors, fresh enough
// for admin edits). Lower this if you want near-instant propagation.
export const revalidate = 60;

export async function GET() {
  try {
    const partners = await loadPartners();
    return NextResponse.json(partners, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
