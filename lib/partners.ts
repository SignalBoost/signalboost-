// File: lib/partners.ts
// Reads partner data from public/partners.json at build time.
// This is a server-only module — never import in client components.
import fs from "fs";
import path from "path";

export interface Partner {
  id: string;
  name: string;
  regions: string[];
  url: string;
  category: string;
  category_key: string;
  category_label: string;
  network: string;
  logo: string;
  description: string;
  // Optional multilingual descriptions. Existing entries omit this and fall
  // back to `description`; new entries (from the generator) include all 5.
  description_i18n?: {
    en?: string;
    pt?: string;
    es?: string;
    pl?: string;
    ru?: string;
  };
  tier: number;
  featured: boolean;
  travel_related: boolean;
  regional_urls: Record<string, string>;
  placements: Record<string, string[]>;
}

const CATEGORY_LABELS: Record<string, string> = {
  flights:         "Flights",
  hotels:          "Hotels",
  car_rentals:     "Car Rentals",
  esim:            "eSIM & Connectivity",
  insurance:       "Insurance & Claims",
  tours:           "Tours & Activities",
  transfers:       "Transfers",
  marketplace:     "Marketplace",
  products_tools:  "Products & Tools",
  finance:         "Finance",
  travel_services: "Travel Services",
  specialty_other: "Specialty & Other",
  health_fitness:  "Health & Fitness",
  sports_outdoors: "Sports & Outdoors",
};
export function getCategoryLabel(key: string): string {
  return CATEGORY_LABELS[key] ?? key.replace(/_/g, " ");
}

const REGION_LABELS: Record<string, string> = {
  us:       "United States",
  br:       "Brazil",
  uk:       "United Kingdom",
  pl:       "Poland",
  ru:       "Russia",
  "es-latam": "Latin America",
  ca:       "Canada",
  au:       "Australia",
  nz:       "New Zealand",
  de:       "Germany",
  fr:       "France",
  it:       "Italy",
  ar:       "Argentina",
  co:       "Colombia",
  pe:       "Peru",
  ot:       "Global",
};
export function getRegionLabel(key: string): string {
  return REGION_LABELS[key] ?? key.toUpperCase();
}

// Reads public/partners.json once per build/request on the server.
export function getAllPartners(): Partner[] {
  const filePath = path.join(process.cwd(), "public", "partners.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  const list: Partner[] = JSON.parse(raw);
  // Deduplicate by id, keeping the first occurrence.
  const seen = new Set<string>();
  return list.filter((p) => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });
}

export function getPartnerById(id: string): Partner | undefined {
  return getAllPartners().find((p) => p.id === id);
}

export function getRelatedPartners(partner: Partner, limit = 6): Partner[] {
  return getAllPartners()
    .filter((p) => p.id !== partner.id && p.category_key === partner.category_key)
    .sort((a, b) => a.tier - b.tier)
    .slice(0, limit);
}
