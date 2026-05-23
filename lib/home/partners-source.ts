// File: lib/home/partners-source.ts
// Single source of truth for loading the partner directory.
//
// Reads from the Supabase `affiliate_partners` table when available, and FALLS
// BACK to the static public/partners.json if the table is empty or the query
// errors. This keeps the site fast + safe: live edits work via the database,
// but a DB hiccup never takes the partners offline.
//
// The CSV import stored the nested fields (regions, regional_urls, placements)
// as JSON TEXT, so we parse them back into real arrays/objects here. Rows that
// are already objects (e.g. if a column was typed as jsonb) pass through.

import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { HomePartner } from "@/lib/home/partners-home";

// ---- helpers ---------------------------------------------------------------

// Parse a field that may be a JSON string, an already-parsed value, or empty.
function parseMaybeJson<T>(val: unknown, fallback: T): T {
  if (val === null || val === undefined || val === "") return fallback;
  if (typeof val === "object") return val as T; // already parsed (jsonb column)
  if (typeof val === "string") {
    try {
      return JSON.parse(val) as T;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

// Coerce a DB row (with stringified bools/JSON) into a clean HomePartner.
function rowToPartner(row: Record<string, unknown>): HomePartner {
  const asBool = (v: unknown) => v === true || v === "true" || v === "TRUE" || v === 1 || v === "1";
  const asNum = (v: unknown) => {
    const n = typeof v === "number" ? v : parseInt(String(v ?? ""), 10);
    return Number.isFinite(n) ? n : 3;
  };
  return {
    id: String(row.id ?? ""),
    name: String(row.name ?? ""),
    category: String(row.category ?? row.category_key ?? "specialty_other"),
    category_key: String(row.category_key ?? row.category ?? "specialty_other"),
    category_label: String(row.category_label ?? ""),
    network: row.network ? String(row.network) : undefined,
    logo: row.logo ? String(row.logo) : undefined,
    description: row.description ? String(row.description) : undefined,
    tier: asNum(row.tier),
    featured: asBool(row.featured),
    travel_related: asBool(row.travel_related),
    regions: parseMaybeJson<string[]>(row.regions, []),
    url: String(row.url ?? "#"),
    regional_urls: parseMaybeJson<Record<string, string>>(row.regional_urls, {}),
    placements: parseMaybeJson<Record<string, string[]>>(row.placements, {}),
  } as HomePartner;
}

// ---- static fallback -------------------------------------------------------

async function loadStaticFallback(): Promise<HomePartner[]> {
  try {
    // Same import style the API routes use (relative to lib/home → public).
    const mod = await import("../../public/partners.json");
    const arr = (mod.default ?? mod) as unknown;
    return Array.isArray(arr) ? (arr as HomePartner[]) : [];
  } catch {
    return [];
  }
}

// ---- main loader -----------------------------------------------------------

export async function loadPartners(): Promise<HomePartner[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("affiliate_partners")
      .select("*");

    if (error || !data || data.length === 0) {
      return loadStaticFallback();
    }
    return (data as Record<string, unknown>[]).map(rowToPartner);
  } catch {
    return loadStaticFallback();
  }
}
