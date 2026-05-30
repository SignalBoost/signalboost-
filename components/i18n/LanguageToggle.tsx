"use client";

import useTranslation from "@/components/i18n/useTranslation";
import type { SupportedLocale } from "@/lib/i18n/language";

const HEADER_LOCALES: Array<{ locale: SupportedLocale; label: string }> = [
  { locale: "en", label: "English" },
  { locale: "es", label: "Español" },
  { locale: "pt", label: "Português" },
  { locale: "pl", label: "Polski" },
  { locale: "ru", label: "Русский" },
];

export default function LanguageToggle() {
  const { lang, setLang } = useTranslation();

  return (
    <label className="language-switcher" aria-label="Manual language selector">
      <span className="language-switcher__label">Language</span>
      <select
        className="language-switcher__select"
        value={lang}
        onChange={(event) => setLang(event.target.value as SupportedLocale)}
      >
        {HEADER_LOCALES.map(({ locale, label }) => (
          <option key={locale} value={locale}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}
