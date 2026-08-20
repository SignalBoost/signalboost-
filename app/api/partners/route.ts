// File: app/api/partners/route.ts
//
// Public partner directory endpoint.
//
// Supabase is authoritative because partners added through the admin UI are
// written there. Only SUCCESSFUL Supabase directory reads are cached. A failed
// live read may use the bundled JSON for that one response, but the fallback is
// explicitly non-cacheable so a transient failure can never pin the site back
// to the stale bundled count.

import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import partnersFallback from "@/partners.json";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type PartnerRow = Record<string, unknown>;
type CredentialSource = "service-role" | "anon";

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
  credentialSource: CredentialSource;
};

async function queryPartners(
  baseUrl: string,
  key: string,
  credentialSource: CredentialSource
): Promise<LiveDirectory> {
  const supabase = createSupabaseClient(baseUrl, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase
    .from("affiliate_partners")
    .select(PUBLIC_PARTNER_COLUMNS);

  if (error) throw new Error(`affiliate_partners read failed (${credentialSource}): ${error.message}`);
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error(`affiliate_partners returned no rows (${credentialSource})`);
  }

  // Supabase cannot infer a row shape from a runtime-built select string, so
  // cross the SDK boundary through unknown and normalize every public field below.
  const rows = data as unknown as PartnerRow[];
  const partners = rows
    .map(normalizePartner)
    .filter((partner) => partner.id && partner.name);

  if (partners.length === 0) {
    throw new Error(`affiliate_partners returned no usable rows (${credentialSource})`);
  }

  return { partners, credentialSource };
}

const loadCachedLivePartners = unstable_cache(
  async (): Promise<LiveDirectory> => {
    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!baseUrl) throw new Error("NEXT_PUBLIC_SUPABASE_URL is missing");

    const credentials: Array<{ key: string; source: CredentialSource }> = [];
    if (serviceRoleKey) credentials.push({ key: serviceRoleKey, source: "service-role" });
    if (anonKey && anonKey !== serviceRoleKey) credentials.push({ key: anonKey, source: "anon" });
    if (credentials.length === 0) throw new Error("No Supabase directory credential is configured");

    let lastError: unknown = null;
    for (const credential of credentials) {
      try {
        return await queryPartners(baseUrl, credential.key, credential.source);
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError instanceof Error ? lastError : new Error("Unable to read affiliate_partners");
  },
  ["public-partner-directory-v3"],
  { revalidate: 300, tags: [PARTNER_CACHE_TAG] }
);

export async function GET() {
  try {
    const live = await loadCachedLivePartners();
    return NextResponse.json(live.partners, {
      headers: {
        "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=86400",
        "X-Partner-Source": `supabase-${live.credentialSource}-cached`,
        "X-Partner-Count": String(live.partners.length),
      },
    });
  } catch (error) {
    console.error(
      "PARTNER_DIRECTORY_LIVE_READ_FAILED:",
      error instanceof Error ? error.message : "unknown error"
    );

    return NextResponse.json(partnersFallback, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
        "X-Partner-Source": "bundled-static-fallback-retryable",
        "X-Partner-Count": String(partnersFallback.length),
      },
    });
  }
}
