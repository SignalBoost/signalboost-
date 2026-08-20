// File: app/api/partners/route.ts
//
// Public partner directory endpoint.
//
// Supabase is the authoritative source because partners added through the admin
// UI are written there. The read happens server-side with the existing service
// role so RLS cannot make the public directory silently fall back to stale JSON.
// To avoid the historical cached-egress problem, this route uses two cache layers:
//   1) the Supabase REST fetch is revalidated only every 5 minutes;
//   2) the API response is cached at the edge for 5 minutes.
//
// The service-role credential is used only in the server-to-server request and
// is never included in the response. If Supabase is unavailable or misconfigured,
// the bundled partners.json remains a safe fallback so the marketplace never empties.

import { NextResponse } from "next/server";
import partnersFallback from "@/partners.json";

export const revalidate = 300;

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

async function loadLivePartners() {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!baseUrl || !serviceRoleKey) return null;

  const url = `${baseUrl.replace(/\/$/, "")}/rest/v1/affiliate_partners?select=*`;
  const response = await fetch(url, {
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      Accept: "application/json",
    },
    next: { revalidate: 300 },
  });

  if (!response.ok) return null;
  const data = (await response.json()) as unknown;
  if (!Array.isArray(data) || data.length === 0) return null;

  return (data as PartnerRow[])
    .map(normalizePartner)
    .filter((partner) => partner.id && partner.name);
}

export async function GET() {
  let partners: ReturnType<typeof normalizePartner>[] | null = null;

  try {
    partners = await loadLivePartners();
  } catch {
    partners = null;
  }

  const live = partners !== null && partners.length > 0;
  const body = live && partners ? partners : partnersFallback;

  return NextResponse.json(body, {
    headers: {
      "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=86400",
      "X-Partner-Source": live ? "supabase-service-role-cached" : "bundled-static-fallback",
      "X-Partner-Count": String(body.length),
    },
  });
}
