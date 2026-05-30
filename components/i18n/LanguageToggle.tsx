"use client";

import useTranslation from "@/components/i18n/useTranslation";
import { LOCALE_LABELS, SUPPORTED_LOCALES, type SupportedLocale } from "@/lib/i18n/language";

export default function LanguageToggle() {
  const { lang, setLang } = useTranslation();
  const current = lang.toUpperCase();

  return (
    <label className="language-switcher" aria-label="Select site language">
      <span className="language-switcher__current">{current}</span>
      <select
        className="language-switcher__select"
        value={lang}
        onChange={(event) => setLang(event.target.value as SupportedLocale)}
      >
        {SUPPORTED_LOCALES.map((locale) => (
          <option key={locale} value={locale}>
            {LOCALE_LABELS[locale]}
          </option>
        ))}
      </select>
    </label>
  );
}
