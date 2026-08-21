// File: lib/home/partners-source.ts
// Single source of truth for loading the partner directory.
//
// Partner data lives only in the dedicated secondary Supabase project. Public
// directory reads use that project's publishable key and never query the primary
// Supabase project. If secondary is unavailable, return no partners rather than
// silently showing the obsolete bundled 125-row directory.

import "server-only";
import { createPartnerReadClient } from "@/lib/supabase/partners-server";
import type { HomePartner } from "@/lib/home/partners-home";

function parseMaybeJson<T>(val: unknown, fallback: T): T {
  if (val === null || val === undefined || val === "") return fallback;
  if (typeof val === "object") return val as T;
  if (typeof val === "string") {
    try {
      return JSON.parse(val) as T;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

function rowToPartner(row: Record<string, unknown>): HomePartner {
  const asBool = (v: unknown) =>
    v === true || v === "true" || v === "TRUE" || v === 1 || v === "1";
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

export async function loadPartners(): Promise<HomePartner[]> {
  try {
    const partnerDb = createPartnerReadClient();
    const { data, error } = await partnerDb
      .from("affiliate_partners")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    if (!data || data.length === 0) {
      throw new Error("secondary affiliate_partners returned no rows");
    }

    return (data as Record<string, unknown>[])
      .map(rowToPartner)
      .filter((partner) => partner.id && partner.name);
  } catch (error) {
    console.error(
      "PARTNER_SECONDARY_LOAD_FAILED:",
      error instanceof Error ? error.message : "unknown error"
    );
    return [];
  }
}
