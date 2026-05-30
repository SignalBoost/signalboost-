export type SupportedLocale = "en" | "es" | "pt" | "pl" | "ru";

export const SUPPORTED_LOCALES: SupportedLocale[] = ["en", "es", "pt", "pl", "ru"];

export const LANGUAGE_COOKIE = "signalboost_language";
export const LEGACY_LANGUAGE_COOKIE = "site-language";
export const MANUAL_LANGUAGE_COOKIE = "signalboost_language_manual";

export const LOCALE_LABELS: Record<SupportedLocale, string> = {
  en: "English (en)",
  es: "Español (es)",
  pt: "Português (pt)",
  pl: "Polski (pl)",
  ru: "Русский (ru)",
};

export function normalizeLocale(value: string | null | undefined): SupportedLocale {
  if (!value) return "en";
  const lower = value.toLowerCase();
  if (lower.startsWith("es")) return "es";
  if (lower.startsWith("pt")) return "pt";
  if (lower.startsWith("pl")) return "pl";
  if (lower.startsWith("ru")) return "ru";
  if (lower.startsWith("en")) return "en";
  return "en";
}

export function isSupportedLocale(value: string | null | undefined): value is SupportedLocale {
  return Boolean(value && SUPPORTED_LOCALES.includes(value as SupportedLocale));
}
