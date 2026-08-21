// File: app/api/partners/route.ts
// Public partner directory endpoint.
//
// The dedicated secondary Supabase project is authoritative for partner data.
// Public reads use that project's publishable key and therefore do not depend on
// hidden Vercel service-role secrets. Successful reads are cached internally for
// five minutes and invalidated after partner writes; the HTTP response itself is
// not CDN-cached so a save is visible on the next request.

import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import {
  createPartnerReadClient,
  getPartnerDatabaseRef,
} from "@/lib/supabase/partners-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type PartnerRow = Record<string, unknown>;

const PARTNER_CACHE_TAG = "affiliate-partners";
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

type NormalizedPartner = ReturnType<typeof normalizePartner>;

type LiveDirectory = {
  partners: NormalizedPartner[];
  databaseRef: string;
};

async function queryPartners(): Promise<LiveDirectory> {
  const partnerDb = createPartnerReadClient();
  const { data, error } = await partnerDb
    .from("affiliate_partners")
    .select(PUBLIC_PARTNER_COLUMNS)
    .order("name", { ascending: true });

  if (error) throw new Error(`affiliate_partners read failed: ${error.message}`);
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("affiliate_partners returned no rows from secondary database");
  }

  const rows = data as unknown as PartnerRow[];
  const partners = rows
    .map(normalizePartner)
    .filter((partner) => partner.id && partner.name);

  if (partners.length === 0) {
    throw new Error("affiliate_partners returned no usable rows from secondary database");
  }

  return { partners, databaseRef: getPartnerDatabaseRef() };
}

const loadCachedLivePartners = unstable_cache(
  queryPartners,
  ["public-partner-directory-secondary-v2"],
  { revalidate: 300, tags: [PARTNER_CACHE_TAG] }
);

const RESPONSE_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
  "CDN-Cache-Control": "no-store",
  "Vercel-CDN-Cache-Control": "no-store",
};

export async function GET() {
  try {
    const live = await loadCachedLivePartners();
    return NextResponse.json(live.partners, {
      headers: {
        ...RESPONSE_HEADERS,
        "X-Partner-Source": "supabase-secondary-public-cached",
        "X-Partner-Database-Ref": live.databaseRef,
        "X-Partner-Count": String(live.partners.length),
      },
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "unknown error";
    console.error("PARTNER_DIRECTORY_SECONDARY_READ_FAILED:", detail);

    // Secondary is the single source of truth. Do not silently serve the old
    // bundled 125-row directory because that makes a database outage look like
    // valid current data.
    return NextResponse.json([], {
      status: 503,
      headers: {
        ...RESPONSE_HEADERS,
        "X-Partner-Source": "supabase-secondary-unavailable",
        "X-Partner-Database-Ref": getPartnerDatabaseRef(),
        "X-Partner-Count": "0",
        "X-Partner-Error": detail.slice(0, 180),
      },
    });
  }
}
