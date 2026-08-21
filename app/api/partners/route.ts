// File: app/api/partners/route.ts
// Public partner directory endpoint.
//
// Single source of truth: secondary Supabase project vdtxulrusfvyxdtatryx.
// This route deliberately uses one raw PostgREST request with the project's
// publishable key. No primary Supabase, no service-role dependency, no static
// partners.json fallback, and no framework data cache.

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const PARTNER_PROJECT_REF = "vdtxulrusfvyxdtatryx";
const PARTNER_URL = `https://${PARTNER_PROJECT_REF}.supabase.co`;
const PARTNER_PUBLISHABLE_KEY = "sb_publishable_RibKPLEHTX20TO_6gWaRSQ_H7D6K4aR";
const PUBLIC_PARTNER_COLUMNS = [
  "id",
  "name",
  "category",
  "category_key",
  "category_label",
  "network",
  "logo",
  "description",
  "tier",
  "featured",
  "travel_related",
  "regions",
  "url",
  "regional_urls",
  "placements",
].join(",");

const RESPONSE_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
  "CDN-Cache-Control": "no-store",
  "Vercel-CDN-Cache-Control": "no-store",
};

type PartnerRow = Record<string, unknown>;

function parseMaybeJson<T>(value: unknown, fallback: T): T {
  if (value === null || value === undefined || value === "") return fallback;
  if (typeof value === "object") return value as T;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

function normalizePartner(row: PartnerRow) {
  const asBool = (value: unknown) =>
    value === true || value === "true" || value === "TRUE" || value === 1 || value === "1";
  const asNum = (value: unknown) => {
    const n = typeof value === "number" ? value : Number.parseInt(String(value ?? ""), 10);
    return Number.isFinite(n) ? n : 3;
  };

  return {
    ...row,
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
  };
}

export async function GET() {
  const endpoint = new URL(`${PARTNER_URL}/rest/v1/affiliate_partners`);
  endpoint.searchParams.set("select", PUBLIC_PARTNER_COLUMNS);
  endpoint.searchParams.set("order", "name.asc");

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      cache: "no-store",
      headers: {
        apikey: PARTNER_PUBLISHABLE_KEY,
        Authorization: `Bearer ${PARTNER_PUBLISHABLE_KEY}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const detail = (await response.text()).slice(0, 240);
      throw new Error(`secondary PostgREST ${response.status}: ${detail}`);
    }

    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error("secondary PostgREST returned a non-array payload");
    }

    const partners = (data as PartnerRow[])
      .map(normalizePartner)
      .filter((partner) => partner.id && partner.name);

    if (partners.length === 0) {
      throw new Error("secondary PostgREST returned zero usable partners");
    }

    return NextResponse.json(partners, {
      headers: {
        ...RESPONSE_HEADERS,
        "X-Partner-Source": "secondary-postgrest-direct",
        "X-Partner-Database-Ref": PARTNER_PROJECT_REF,
        "X-Partner-Count": String(partners.length),
      },
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "unknown error";
    console.error("PARTNER_DIRECTORY_DIRECT_READ_FAILED:", detail);

    return NextResponse.json([], {
      status: 503,
      headers: {
        ...RESPONSE_HEADERS,
        "X-Partner-Source": "secondary-postgrest-error",
        "X-Partner-Database-Ref": PARTNER_PROJECT_REF,
        "X-Partner-Count": "0",
        "X-Partner-Error": detail.slice(0, 180),
      },
    });
  }
}
