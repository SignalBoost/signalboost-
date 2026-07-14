// File: app/api/partners/route.ts
//
// Public partner directory endpoint.
//
// IMPORTANT: This route must remain independent of Supabase. It is called by
// public homepage components and therefore receives crawler and bot traffic.
// Reading the affiliate_partners table here previously caused excessive
// Supabase cached egress and exhausted the organization's monthly quota.
//
// Update partners.json and redeploy when the public directory changes.

import { NextResponse } from "next/server";
import partners from "@/partners.json";

export const dynamic = "force-static";
export const revalidate = false;

export async function GET() {
  return NextResponse.json(partners, {
    headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      "X-Partner-Source": "bundled-static",
    },
  });
}
