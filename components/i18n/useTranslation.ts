"use client";

import { useI18n } from "@/components/i18n/I18nProvider";
import { t as translate } from "@/lib/i18n/t";
import { type SupportedLocale } from "@/lib/i18n/language";

function useTranslation() {
  const { dict, lang, setLang } = useI18n();

  function t(key: string): string {
    return translate(dict, key, key);
  }

  return { t, lang: lang as SupportedLocale, setLang: setLang as (lang: SupportedLocale) => void };
}

export default useTranslation;
