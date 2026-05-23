// File: lib/home/partners-home.ts
// Phase A4 of the homepage conversion — REVENUE-CRITICAL.
//
// Strict region/placement/selection logic ported VERBATIM from public/index.html.
// The visibility rule protects affiliate attribution: a partner shows ONLY when
// it is explicitly tagged for the region AND has a regional_urls entry for that
// exact region. NO `ot` fallback except on the Global region. Do not "improve"
// this with helpful fallbacks — that would mis-attribute or leak revenue.
//
// Pure functions: every selector takes (partners, region, ...) explicitly so it
// can run on server or client identically. Partner data is loaded by the caller
// (HomeApp loads partners.json with the embedded fallback, mirroring current).

export interface HomePartner {
  id: string;
  name: string;
  regions?: string[];
  url?: string;
  category?: string;
  category_key?: string;
  category_label?: string;
  network?: string;
  logo?: string;
  description?: string;
  description_i18n?: Record<string, string>;
  tier?: number;
  featured?: boolean;
  travel_related?: boolean;
  regional_urls?: Record<string, string>;
  placements?: Record<string, string[] | string>;
}

export const TRAVEL_KEYS = new Set([
  "flights", "hotels", "car_rentals", "esim", "insurance", "tours", "transfers", "travel_services",
]);

// --- Strict visibility (the revenue rule) ----------------------------------
export const hasExactRegion = (p: HomePartner, region: string): boolean =>
  Array.isArray(p.regions) && p.regions.includes(region);

export const hasExactRegionUrl = (p: HomePartner, region: string): boolean =>
  !p.regional_urls || !!p.regional_urls[region];

export const partnerMatchesRegion = (p: HomePartner, region: string): boolean =>
  hasExactRegion(p, region) && hasExactRegionUrl(p, region);

export const isLocal = partnerMatchesRegion;

// --- Placements ------------------------------------------------------------
export function partnerPlacementsForRegion(p: HomePartner, region: string): string[] {
  const placements = p.placements || {};
  const value = placements[region] || [];
  return Array.isArray(value) ? value : [value].filter(Boolean) as string[];
}

export const partnerInPlacement = (p: HomePartner, placement: string, region: string): boolean =>
  partnerMatchesRegion(p, region) && partnerPlacementsForRegion(p, region).includes(placement);

export const promotedToHeader = (p: HomePartner, region: string): boolean =>
  partnerInPlacement(p, "header", region);

// --- Affiliate URL selection (monetized link) ------------------------------
export const partnerUrl = (p: HomePartner, region: string): string =>
  (p.regional_urls && p.regional_urls[region]) || p.url || "#";

export const isTravelPartner = (p: HomePartner): boolean =>
  TRAVEL_KEYS.has(p.category_key || "");

// --- Dedupe (lowest tier / featured wins) ----------------------------------
export function dedupePartners(list: HomePartner[]): HomePartner[] {
  const map = new Map<string, HomePartner>();
  list.forEach((p) => {
    const id = p.id || (p.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const existing = map.get(id);
    if (
      !existing ||
      Number(p.tier || 9) < Number(existing.tier || 9) ||
      (p.featured && !existing.featured)
    ) {
      map.set(id, p);
    }
  });
  return [...map.values()];
}

export function normalizePartners(list: unknown): HomePartner[] {
  const arr = Array.isArray(list) ? (list as HomePartner[]) : [];
  return dedupePartners(arr).map((p) => ({
    ...p,
    category_key: p.category_key || p.category || "specialty_other",
    placements: p.placements || {},
  }));
}

// --- Category ordering ------------------------------------------------------
const CATEGORY_ORDER = [
  "flights", "hotels", "esim", "tours", "transfers", "car_rentals",
  "insurance", "marketplace", "products_tools", "finance", "travel_services", "specialty_other",
];
export function categorySort(k: string): number {
  const i = CATEGORY_ORDER.indexOf(k);
  return i < 0 ? 99 : i;
}

// --- Search helper ----------------------------------------------------------
function matchesSearch(p: HomePartner, q: string, categoryName: (k: string) => string): boolean {
  const hay = [p.name, p.description, p.network, p.category_key, categoryName(p.category_key || "")]
    .join(" ").toLowerCase();
  return hay.includes(q);
}

// --- Selectors (mirror index.html exactly) ----------------------------------
export interface SelectOpts {
  region: string;
  search?: string;
  filter?: "featured" | "all" | "travel" | "local";
  categoryName: (k: string) => string;
}

export function baseFilteredPartners(all: HomePartner[], o: SelectOpts): HomePartner[] {
  let list = all.filter((p) => partnerMatchesRegion(p, o.region));
  if (o.filter === "featured") list = list.filter((p) => p.featured || Number(p.tier) === 1);
  if (o.filter === "travel")
    list = list.filter((p) => p.travel_related || TRAVEL_KEYS.has(p.category_key || ""));
  if (o.filter === "local") list = list.filter((p) => isLocal(p, o.region));
  const q = (o.search || "").trim().toLowerCase();
  if (q) list = list.filter((p) => matchesSearch(p, q, o.categoryName));
  list.sort(
    (a, b) =>
      (Number(isLocal(b, o.region)) - Number(isLocal(a, o.region))) ||
      Number(a.tier || 9) - Number(b.tier || 9) ||
      String(a.name).localeCompare(String(b.name))
  );
  return list;
}

export function sidebarPartners(all: HomePartner[], o: SelectOpts): HomePartner[] {
  let list = all.filter((p) => partnerInPlacement(p, "column1", o.region));
  const q = (o.search || "").trim().toLowerCase();
  if (q) list = list.filter((p) => matchesSearch(p, q, o.categoryName));
  list.sort(
    (a, b) =>
      Number(a.tier || 9) - Number(b.tier || 9) || String(a.name).localeCompare(String(b.name))
  );
  return list;
}

export function headerPartners(all: HomePartner[], o: SelectOpts): HomePartner[] {
  let list = all.filter((p) => promotedToHeader(p, o.region));
  const q = (o.search || "").trim().toLowerCase();
  if (q) {
    list = list.filter((p) =>
      [p.name, p.description, p.category_key, p.category_label, p.network]
        .join(" ").toLowerCase().includes(q)
    );
  }
  return list.sort(
    (a, b) =>
      (Number(b.featured || 0) - Number(a.featured || 0)) ||
      (Number(a.tier || 9) - Number(b.tier || 9)) ||
      (a.name || "").localeCompare(b.name || "")
  );
}

export function topPartners(all: HomePartner[], o: SelectOpts, n = 6): HomePartner[] {
  let list = all.filter((p) => partnerMatchesRegion(p, o.region));
  const q = (o.search || "").trim().toLowerCase();
  if (q) list = list.filter((p) => matchesSearch(p, q, o.categoryName));
  return list
    .sort(
      (a, b) =>
        (Number(b.featured || 0) - Number(a.featured || 0)) ||
        Number(a.tier || 9) - Number(b.tier || 9) ||
        String(a.name).localeCompare(String(b.name))
    )
    .slice(0, n);
}

export function groupedPartners(
  list: HomePartner[],
  categoryName: (k: string) => string
): [string, HomePartner[]][] {
  const grouped: Record<string, HomePartner[]> = {};
  for (const p of list) {
    const key = p.category_key || "specialty_other";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(p);
  }
  return Object.entries(grouped)
    .filter(([, items]) => items.length > 0)
    .sort(
      (a, b) =>
        categorySort(a[0]) - categorySort(b[0]) ||
        categoryName(a[0]).localeCompare(categoryName(b[0]))
    );
}
