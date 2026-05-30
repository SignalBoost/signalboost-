"use client";

import { useI18n } from "@/components/i18n/I18nProvider";
import { t as translate } from "@/lib/i18n/t";

type LocaleType = "en" | "es" | "pt" | "pl" | "ru";

function useTranslation() {
  const { dict, lang, setLang } = useI18n();

  function t(key: string): string {
    return translate(dict, key, key);
  }

  return { t, lang: lang as LocaleType, setLang: setLang as (lang: LocaleType) => void };
}

export default useTranslation;
