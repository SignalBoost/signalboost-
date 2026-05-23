// File: app/api/geo/route.ts
// Phase A1 of the homepage conversion.
//
// Returns the visitor's country (and a derived region hint) from Vercel's edge
// geo headers. The homepage client calls /api/geo FIRST in its detection chain;
// this makes that real and removes reliance on third-party IP services.
//
// Region detection itself stays CLIENT-side (per finalized decisions); this
// endpoint only supplies the country code the client already knows how to map.

import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge"; // geo headers are populated at the edge

export async function GET(req: NextRequest) {
  // Vercel populates these on the incoming request at the edge.
  const country =
    req.headers.get("x-vercel-ip-country") ||
    req.headers.get("x-vercel-ip-country-region") ||
    "";

  return NextResponse.json(
    { country: country.toUpperCase() },
    {
      // Per-visitor value; never cache across users.
      headers: { "Cache-Control": "no-store" },
    }
  );
}
