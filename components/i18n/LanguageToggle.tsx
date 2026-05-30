"use client";

import { useI18n } from "@/components/i18n/I18nProvider";

const LOCALES = ["en", "es", "pt", "pl", "ru"] as const;

export function LanguageToggle() {
  const { lang, setLang } = useI18n();

  return (
    <div className="sb-language-toggle" role="group" aria-label="Language selector">
      {LOCALES.map((loc) => (
        <button
          key={loc}
          type="button"
          onClick={() => setLang(loc)}
          disabled={lang === loc}
          className={lang === loc ? "is-active" : ""}
          aria-pressed={lang === loc}
        >
          {loc.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

export default LanguageToggle;
