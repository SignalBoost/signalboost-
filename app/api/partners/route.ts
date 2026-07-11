// File: app/api/partners/route.ts
// Returns the public partner directory from the bundled static JSON file.
//
// This endpoint intentionally does not query Supabase. The homepage and other
// public components can be requested frequently by visitors, crawlers, and
// monitoring services; serving the bundled directory prevents those requests
// from generating database egress on every cache miss.

import { NextResponse } from "next/server";
import partners from "@/public/partners.json";

export const dynamic = "force-static";
export const revalidate = false;

export async function GET() {
  return NextResponse.json(partners, {
    headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
