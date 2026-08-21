// File: app/api/admin/save-partner/route.ts
// Saves (inserts or updates) one partner into the dedicated secondary Supabase
// `affiliate_partners` table. Login + admin protected.
//
// Authentication remains on the application's primary Supabase project, but
// partner data is intentionally isolated behind createPartnerDatabaseClient().
// The partner client fails closed if its dedicated secondary connection is
// missing or accidentally points at the primary project.

import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { createClient as createAuthClient } from "@/lib/supabase/server";
import {
  createPartnerDatabaseClient,
  getPartnerDatabaseRef,
} from "@/lib/supabase/partners-server";

export const runtime = "nodejs";

const PARTNER_CACHE_TAG = "affiliate-partners";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

const CATEGORY_LABELS: Record<string, string> = {
  flights: "Flights",
  hotels: "Hotels",
  car_rentals: "Car Rentals",
  esim: "SIM & Connectivity",
  tours: "Tours & Activities",
  transfers: "Transfers",
  insurance: "Insurance & Claims",
  travel_services: "Travel Services",
  marketplace: "Marketplace",
  products_tools: "Products & Tools",
  finance: "Finance",
  specialty_other: "Specialty & Other",
  health_fitness: "Health & Fitness",
  sports_outdoors: "Sports & Outdoors",
};

const TRAVEL_CATS = new Set([
  "flights",
  "hotels",
  "car_rentals",
  "esim",
  "tours",
  "transfers",
  "insurance",
  "travel_services",
]);

export async function POST(req: NextRequest) {
  // --- authenticate against the primary application database ---
  const authSupabase = await createAuthClient();
  const {
    data: { user },
  } = await authSupabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  }

  const admins = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  const email = (user.email || "").toLowerCase();
  if (admins.length > 0 && !admins.includes(email)) {
    return NextResponse.json({ error: "Not an admin account." }, { status: 403 });
  }

  // --- dedicated partner database: never fall back to primary ---
  let partnerDb;
  try {
    partnerDb = createPartnerDatabaseClient();
  } catch (error) {
    console.error(
      "PARTNER_DATABASE_CONFIGURATION_FAILED:",
      error instanceof Error ? error.message : "unknown error"
    );
    return NextResponse.json(
      { error: "Partner database is not configured correctly." },
      { status: 503 }
    );
  }

  // --- parse body ---
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const name = String(body.name || "").trim();
  const url = String(body.url || "").trim();
  const category = String(body.category || "specialty_other").trim();
  const network = String(body.network || "").trim();
  const description = String(body.description || "").trim();
  const tier = Number(body.tier) || 2;
  const featured = Boolean(body.featured);
  const regions: string[] =
    Array.isArray(body.regions) && body.regions.length > 0
      ? (body.regions as string[])
      : ["ot"];
  const id = String(body.id || slugify(name));

  if (!name || !url) {
    return NextResponse.json({ error: "Name and URL are required." }, { status: 400 });
  }

  const regional_urls: Record<string, string> = {};
  const placements: Record<string, string[]> = {};
  for (const r of regions) {
    regional_urls[r] = url;
    placements[r] = ["header"];
  }

  const row = {
    id,
    name,
    category,
    category_key: category,
    category_label: CATEGORY_LABELS[category] || "Specialty & Other",
    network: network || null,
    logo: `${id}.png`,
    description: description || `Explore ${name}.`,
    tier,
    featured,
    travel_related: TRAVEL_CATS.has(category),
    regions: JSON.stringify(regions),
    url,
    regional_urls: JSON.stringify(regional_urls),
    placements: JSON.stringify(placements),
  };

  const { data: existing, error: lookupError } = await partnerDb
    .from("affiliate_partners")
    .select("id")
    .eq("id", id)
    .maybeSingle();

  if (lookupError) {
    return NextResponse.json({ error: lookupError.message }, { status: 500 });
  }

  let dbError = null;
  if (existing) {
    const { error } = await partnerDb
      .from("affiliate_partners")
      .update(row)
      .eq("id", id);
    dbError = error;
  } else {
    const { error } = await partnerDb.from("affiliate_partners").insert(row);
    dbError = error;
  }

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  // Read back from the dedicated secondary database before reporting success.
  // This prevents a false-positive save response if a future SDK/configuration
  // regression ever routes the write incorrectly.
  const { data: verified, error: verificationError } = await partnerDb
    .from("affiliate_partners")
    .select("id, name")
    .eq("id", id)
    .maybeSingle();

  if (verificationError || !verified) {
    console.error(
      "PARTNER_SAVE_VERIFICATION_FAILED:",
      verificationError?.message || `Missing partner after write: ${id}`
    );
    return NextResponse.json(
      { error: "Partner write could not be verified in the secondary database." },
      { status: 500 }
    );
  }

  let cacheInvalidated = false;
  try {
    revalidateTag(PARTNER_CACHE_TAG);
    cacheInvalidated = true;
  } catch (error) {
    console.warn(
      "PARTNER_CACHE_INVALIDATION_FAILED:",
      error instanceof Error ? error.message : "unknown error"
    );
  }

  return NextResponse.json({
    ok: true,
    id,
    cacheInvalidated,
    partnerDatabaseRef: getPartnerDatabaseRef(),
  });
}
