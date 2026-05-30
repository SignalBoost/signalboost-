"use client";

import { useI18n } from "@/components/i18n/I18nProvider";

function useTranslation() {
  const { dict, lang, setLang } = useI18n();

  function t(key: string): string {
    const value = key.split(".").reduce((obj: any, k) => obj?.[k], dict as any);
    return typeof value === "string" ? value : key;
  }

  return { t, lang, setLang };
}

export default useTranslation;
