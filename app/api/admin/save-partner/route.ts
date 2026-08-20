// File: app/api/admin/save-partner/route.ts
// Saves (inserts or updates) one partner into the Supabase `affiliate_partners`
// table. Login + admin protected.
//
// Auth: the user must be logged in (Supabase session) AND their email must be
// listed in the ADMIN_EMAILS env var (comma-separated). Returns 401 if not
// logged in, 403 if not an admin.
//
// The client form sends plain fields; this route builds the nested
// regions / regional_urls / placements correctly so the data stays consistent
// with the rest of the directory. URLs are stored as JSON strings (matching the
// CSV-imported rows), so the reader (lib/home/partners-source.ts) parses them
// back uniformly.

import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";

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
  "flights", "hotels", "car_rentals", "esim", "tours", "transfers", "insurance", "travel_services",
]);

export async function POST(req: NextRequest) {
  // --- auth ---
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
  // optional explicit id (for editing); otherwise derive from name
  const id = String(body.id || slugify(name));

  if (!name || !url) {
    return NextResponse.json({ error: "Name and URL are required." }, { status: 400 });
  }

  // Build the same URL map for every region this partner serves.
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
    // store nested fields as JSON text (consistent with CSV-imported rows)
    regions: JSON.stringify(regions),
    url,
    regional_urls: JSON.stringify(regional_urls),
    placements: JSON.stringify(placements),
  };

  // Insert if new, update if an entry with this id already exists. This avoids
  // depending on whether `id` is the table's primary key / unique constraint.
  const { data: existing } = await supabase
    .from("affiliate_partners")
    .select("id")
    .eq("id", id)
    .maybeSingle();

  let dbError = null;
  if (existing) {
    const { error } = await supabase
      .from("affiliate_partners")
      .update(row)
      .eq("id", id);
    dbError = error;
  } else {
    const { error } = await supabase.from("affiliate_partners").insert(row);
    dbError = error;
  }

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  // New/edited partners should be visible immediately. Cache invalidation is
  // best-effort because the database write has already succeeded; the directory
  // also has a 5-minute TTL as a safety net.
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

  return NextResponse.json({ ok: true, id, cacheInvalidated });
}
