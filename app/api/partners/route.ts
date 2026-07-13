// File: app/api/partners/route.ts
// Returns the public partner directory.
//
// Source of truth is the `affiliate_partners` table in this project's
// Supabase — the live catalog the owner actually maintains. The old version
// served a bundled static JSON snapshot (public/partners.json, 61 entries)
// to avoid database egress; that protected the bill but froze the public
// site in the past while the real catalog grew.
//
// This version keeps the egress protection a different way: Next.js ISR.
// The route result is cached for an hour (`revalidate = 3600`), so no matter
// how many visitors, crawlers, or monitors hit it, Supabase sees at most
// ~24 queries per day. If the database is unreachable, empty, or the table
// is missing, it falls back to the bundled directory so the page never breaks.
//
// Env (already configured in Vercel for this project):
//   NEXT_PUBLIC_SUPABASE_URL     this project's Supabase (marketing)
//   SUPABASE_SERVICE_ROLE_KEY    used server-side only; bypasses RLS

import { NextResponse } from "next/server";
import fallbackPartners from "@/partners.json";

export const revalidate = 3600;

const TRAVEL_KEYS = [
  "flights", "hotels", "car_rentals", "esim", "insurance",
  "tours", "transfers", "travel_services",
];

const CATEGORY_LABELS: Record<string, string> = {
  flights: "Flights",
  hotels: "Hotels",
  car_rentals: "Car Rentals",
  esim: "eSIM & Connectivity",
  insurance: "Insurance & Claims",
  tours: "Tours & Activities",
  transfers: "Transfers",
  marketplace: "Marketplace",
  products_tools: "Products & Tools",
  finance: "Finance",
  travel_services: "Travel Services",
  specialty_other: "Specialty & Other",
  health_fitness: "Health & Fitness",
  sports_outdoors: "Sports & Outdoors",
};

function str(row: Record<string, unknown>, keys: string[]): string {
  for (const k of keys) {
    const v = row[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return "";
}

function bool(row: Record<string, unknown>, keys: string[], fallback: boolean): boolean {
  for (const k of keys) {
    const v = row[k];
    if (typeof v === "boolean") return v;
  }
  return fallback;
}

function num(row: Record<string, unknown>, keys: string[], fallback: number): number {
  for (const k of keys) {
    const v = row[k];
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string" && v.trim() && !isNaN(Number(v))) return Number(v);
  }
  return fallback;
}

function obj(row: Record<string, unknown>, keys: string[]): Record<string, unknown> {
  for (const k of keys) {
    const v = row[k];
    if (v && typeof v === "object" && !Array.isArray(v)) return v as Record<string, unknown>;
  }
  return {};
}

function regionsOf(row: Record<string, unknown>): string[] {
  const v = row.regions;
  if (Array.isArray(v)) {
    const list = v.map((x) => String(x).trim()).filter(Boolean);
    if (list.length) return list;
  }
  if (typeof v === "string" && v.trim()) {
    const list = v.split(",").map((x) => x.trim()).filter(Boolean);
    if (list.length) return list;
  }
  // No region data → show everywhere ("ot" alone means truly global).
  return ["ot"];
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function categoryKeyOf(row: Record<string, unknown>): string {
  const explicit = str(row, ["category_key"]);
  if (explicit) return explicit;
  const raw = str(row, ["category", "intent", "type", "vertical"]) || "specialty_other";
  const slug = slugify(raw).replace(/-/g, "_");
  return CATEGORY_LABELS[slug] ? slug : slug || "specialty_other";
}

function mapRow(raw: unknown) {
  const row = (raw ?? {}) as Record<string, unknown>;
  const name = str(row, ["name", "partner_name", "title", "brand", "company", "display_name"]) || "Partner";
  const key = categoryKeyOf(row);
  const label = str(row, ["category_label"]) || CATEGORY_LABELS[key] || (str(row, ["category"]) || "Other");
  return {
    id: str(row, ["id", "slug", "uid"]) || slugify(name),
    name,
    regions: regionsOf(row),
    url: str(row, ["url", "link", "website", "affiliate_url"]),
    category: str(row, ["category"]) || label,
    category_key: key,
    category_label: label,
    network: str(row, ["network", "affiliate_network", "source"]),
    logo: str(row, ["logo", "logo_url", "image", "icon"]),
    description: str(row, ["description", "desc", "summary", "blurb"]),
    tier: num(row, ["tier", "rank", "priority"], 3),
    featured: bool(row, ["featured", "is_featured"], false),
    travel_related: bool(row, ["travel_related", "is_travel"], TRAVEL_KEYS.indexOf(key) !== -1),
    regional_urls: obj(row, ["regional_urls"]),
    placements: obj(row, ["placements"]),
  };
}

async function fetchLivePartners(): Promise<unknown[] | null> {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/rest\/v1\/?$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key) return null;
  try {
    const res = await fetch(`${url}/rest/v1/affiliate_partners?select=*&limit=1000`, {
      headers: { apikey: key, Authorization: "Bearer " + key },
      // Let the route-level ISR own caching; this inner fetch stays fresh.
      cache: "no-store",
    });
    if (!res.ok) return null;
    const rows = await res.json();
    if (!Array.isArray(rows) || rows.length === 0) return null;
    return rows;
  } catch {
    return null;
  }
}

export async function GET() {
  const rows = await fetchLivePartners();
  const partners = rows ? rows.map(mapRow) : (fallbackPartners as unknown[]);

  return NextResponse.json(partners, {
    headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      "X-Partner-Source": rows ? "supabase" : "bundled-fallback",
    },
  });
}
