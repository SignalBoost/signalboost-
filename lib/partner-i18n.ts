// → lib/partner-i18n.ts   (NEW, additive)
//
// Multilingual description layer for partners. Imports the Partner type from
// lib/partners.ts (which now carries optional description_i18n). The partner
// page calls these helpers to render the right-language description, falling
// back to English wherever a translation is absent.
//
// Language rule (your spec):
//   - 5 supported languages: en, pt, es, pl, ru
//   - region -> local language map below
//   - every region NOT mapped (us, uk, ca, au, nz, de, fr, it, ot, ...) -> English
//   - brand names are never translated (handled in the data, not here)

import type { Partner } from "@/lib/partners";

export type Lang = "en" | "pt" | "es" | "pl" | "ru";
export const SUPPORTED_LANGS: Lang[] = ["en", "pt", "es", "pl", "ru"];

// Region -> local language. Anything not listed falls back to English.
const REGION_LANG: Record<string, Lang> = {
  pl: "pl",
  br: "pt",
  ru: "ru",
  "es-latam": "es",
  ar: "es",
  co: "es",
  pe: "es",
  // us, uk, ca, au, nz, de, fr, it, ot -> English (omitted on purpose)
};

/** Map a region code to its local language (English if unmapped). */
export function langForRegion(region: string | null | undefined): Lang {
  if (!region) return "en";
  return REGION_LANG[region] ?? "en";
}

/** Is a real local (non-English) language available for this region? */
export function regionHasLocalLanguage(region: string | null | undefined): boolean {
  return langForRegion(region) !== "en";
}

/**
 * Resolve a partner's description for a target language.
 * Order: requested language -> English (i18n) -> legacy `description` -> "".
 */
export function descriptionFor(partner: Partner, lang: Lang): string {
  const i18n = partner.description_i18n;
  if (i18n) {
    const wanted = i18n[lang];
    if (wanted && wanted.trim()) return wanted;
    if (i18n.en && i18n.en.trim()) return i18n.en;
  }
  return partner.description ?? "";
}

/**
 * Convenience for the page: resolve description from a region + an optional
 * manual override. If the user toggled English, `english` short-circuits.
 */
export function descriptionForRegion(
  partner: Partner,
  region: string | null | undefined,
  english = false
): string {
  const lang: Lang = english ? "en" : langForRegion(region);
  return descriptionFor(partner, lang);
}
