// File: lib/home/regions.ts
// Phase A2 of the homepage conversion.
//
// Region data + pure detection helpers, ported VERBATIM from the current
// public/index.html so behavior is identical. No UI, no side effects.
// (Browser-only bits like timezone/navigator are guarded for SSR safety.)

export interface RegionDef {
  key: string;
  label: string;
}

export const REGIONS: RegionDef[] = [
  { key: "ot", label: "Global" },
  { key: "br", label: "Brazil" },
  { key: "us", label: "US" },
  { key: "uk", label: "UK" },
  { key: "pl", label: "Poland" },
  { key: "ru", label: "Russia" },
  { key: "es-latam", label: "LATAM" },
  { key: "ca", label: "Canada" },
  { key: "au", label: "Australia" },
  { key: "nz", label: "New Zealand" },
  { key: "de", label: "Germany" },
  { key: "fr", label: "France" },
  { key: "it", label: "Italy" },
  { key: "ar", label: "Argentina" },
  { key: "co", label: "Colombia" },
  { key: "pe", label: "Peru" },
];

export const REGION_ALIASES: Record<string, string> = {
  global: "ot", other: "ot", ot: "ot", worldwide: "ot",
  usa: "us", unitedstates: "us", united_states: "us", us: "us",
  uk: "uk", gb: "uk", greatbritain: "uk", unitedkingdom: "uk", united_kingdom: "uk",
  brazil: "br", brasil: "br", br: "br", poland: "pl", polska: "pl", pl: "pl",
  russia: "ru", ru: "ru", canada: "ca", ca: "ca", australia: "au", au: "au",
  newzealand: "nz", new_zealand: "nz", nz: "nz", germany: "de", deutschland: "de", de: "de",
  france: "fr", fr: "fr", italy: "it", italia: "it", it: "it", argentina: "ar", ar: "ar",
  colombia: "co", co: "co", peru: "pe", "perú": "pe", pe: "pe",
  latam: "es-latam", latinamerica: "es-latam", latin_america: "es-latam",
  mexico: "es-latam", "méxico": "es-latam", mx: "es-latam",
};

export const COUNTRY_TO_REGION: Record<string, string> = {
  US: "us", PR: "us", VI: "us", GU: "us", AS: "us", MP: "us",
  BR: "br", PL: "pl", GB: "uk", UK: "uk", IE: "uk", RU: "ru",
  CA: "ca", AU: "au", NZ: "nz",
  DE: "de", AT: "de", CH: "de", FR: "fr", MC: "fr", IT: "it", SM: "it", VA: "it",
  AR: "ar", CO: "co", PE: "pe",
  MX: "es-latam", CL: "es-latam", ES: "es-latam", UY: "es-latam", PY: "es-latam",
  BO: "es-latam", EC: "es-latam", VE: "es-latam", CR: "es-latam", PA: "es-latam",
  DO: "es-latam", GT: "es-latam", HN: "es-latam", SV: "es-latam", NI: "es-latam",
  CU: "es-latam", JM: "es-latam", HT: "es-latam", BZ: "es-latam", GQ: "es-latam",
};

export const TIMEZONE_TO_REGION: Record<string, string> = {
  "Europe/Warsaw": "pl", "Europe/Berlin": "de", "Europe/Vienna": "de", "Europe/Zurich": "de",
  "Europe/Paris": "fr", "Europe/Monaco": "fr", "Europe/Rome": "it", "Europe/San_Marino": "it", "Europe/Vatican": "it",
  "Europe/London": "uk", "Europe/Dublin": "uk", "Europe/Moscow": "ru",
  "America/Sao_Paulo": "br", "America/Bahia": "br", "America/Fortaleza": "br", "America/Recife": "br",
  "America/Manaus": "br", "America/Belem": "br", "America/Campo_Grande": "br", "America/Cuiaba": "br", "America/Rio_Branco": "br",
  "America/Toronto": "ca", "America/Vancouver": "ca", "America/Edmonton": "ca", "America/Winnipeg": "ca", "America/Halifax": "ca", "America/St_Johns": "ca",
  "Australia/Sydney": "au", "Australia/Melbourne": "au", "Australia/Brisbane": "au", "Australia/Perth": "au",
  "Australia/Adelaide": "au", "Australia/Darwin": "au", "Pacific/Auckland": "nz", "Pacific/Chatham": "nz",
  "America/New_York": "us", "America/Chicago": "us", "America/Denver": "us", "America/Los_Angeles": "us",
  "America/Phoenix": "us", "America/Anchorage": "us", "Pacific/Honolulu": "us",
  "America/Argentina/Buenos_Aires": "ar", "America/Argentina/Cordoba": "ar", "America/Argentina/Mendoza": "ar",
  "America/Bogota": "co", "America/Lima": "pe",
  "America/Mexico_City": "es-latam", "America/Cancun": "es-latam", "America/Monterrey": "es-latam",
  "America/Mazatlan": "es-latam", "America/Tijuana": "es-latam", "America/Merida": "es-latam",
  "America/Santiago": "es-latam", "America/Guatemala": "es-latam", "America/El_Salvador": "es-latam",
  "America/Tegucigalpa": "es-latam", "America/Managua": "es-latam", "America/Costa_Rica": "es-latam",
  "America/Panama": "es-latam", "America/Caracas": "es-latam", "America/Montevideo": "es-latam",
  "America/Asuncion": "es-latam", "America/La_Paz": "es-latam", "America/Guayaquil": "es-latam",
  "America/Santo_Domingo": "es-latam", "America/Havana": "es-latam", "America/Belize": "es-latam",
  "Atlantic/Canary": "es-latam", "Europe/Madrid": "es-latam",
};

export const isValidRegion = (key: string): boolean => REGIONS.some((r) => r.key === key);

export function normalizeRegionKey(value: string | null | undefined): string {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const compact = raw.toLowerCase().replace(/[^a-záéíóúüñ-]+/g, "").replace(/-/g, "_");
  const direct = raw.toLowerCase();
  return REGION_ALIASES[direct] || REGION_ALIASES[compact] || (isValidRegion(direct) ? direct : "");
}

export function regionFromCountry(countryCode: string | null | undefined): string {
  const code = String(countryCode || "").trim().toUpperCase();
  return COUNTRY_TO_REGION[code] || "ot";
}

export function regionFromTimezone(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    if (TIMEZONE_TO_REGION[tz]) return TIMEZONE_TO_REGION[tz];
    if (tz.startsWith("America/")) return "es-latam";
    if (tz.startsWith("Europe/Warsaw")) return "pl";
  } catch {
    /* SSR or unsupported */
  }
  return "";
}

export function browserRegion(): string {
  if (typeof navigator === "undefined") return "ot";
  const tzRegion = regionFromTimezone();
  if (tzRegion && tzRegion !== "ot") return tzRegion;
  const langs = (navigator.languages && navigator.languages.length
    ? navigator.languages
    : [navigator.language || ""]
  ).map((v) => String(v).toLowerCase());
  for (const lang of langs) {
    if (lang.startsWith("pt-br")) return "br";
    if (lang.startsWith("pl")) return "pl";
    if (lang.startsWith("ru")) return "ru";
    if (lang.startsWith("de")) return "de";
    if (lang.startsWith("fr")) return "fr";
    if (lang.startsWith("it")) return "it";
    if (lang.startsWith("es-ar")) return "ar";
    if (lang.startsWith("es-co")) return "co";
    if (lang.startsWith("es-pe")) return "pe";
    if (lang.startsWith("es")) return "es-latam";
    if (lang.startsWith("en-ca")) return "ca";
    if (lang.startsWith("en-gb")) return "uk";
    if (lang.startsWith("en-au")) return "au";
    if (lang.startsWith("en-nz")) return "nz";
    if (lang.startsWith("en-us")) return "us";
  }
  return "ot";
}

export function parseGeoPayload(geo: unknown): string {
  if (!geo || typeof geo !== "object") return "";
  const g = geo as Record<string, unknown>;
  const explicit = normalizeRegionKey(
    (g.region || g.regionKey || g.market || g.localeRegion) as string
  );
  if (explicit && isValidRegion(explicit)) return explicit;
  const country = (g.country || g.countryCode || g.country_code ||
    g.countryCodeAlpha2 || g.country_code_iso2) as string;
  const byCountry = regionFromCountry(country);
  return isValidRegion(byCountry) ? byCountry : "";
}
