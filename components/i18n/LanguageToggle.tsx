"use client";

import useTranslation from "@/components/i18n/useTranslation";
import type { SupportedLocale } from "@/lib/i18n/language";

const HEADER_LOCALES: Array<{ locale: SupportedLocale; label: string }> = [
  { locale: "en", label: "EN" },
  { locale: "es", label: "ES" },
];

export default function LanguageToggle() {
  const { lang, setLang } = useTranslation();

  return (
    <div className="language-switcher" aria-label="Manual language toggle">
      {HEADER_LOCALES.map(({ locale, label }) => (
        <button
          key={locale}
          type="button"
          className={lang === locale ? "language-switcher__button active" : "language-switcher__button"}
          aria-pressed={lang === locale}
          onClick={() => setLang(locale)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
