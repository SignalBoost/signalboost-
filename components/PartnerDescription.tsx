"use client";

export {}; // Garante o escopo isolado do módulo para o parser do TypeScript

import React from "react";
import { useTranslation } from "./i18n/useTranslation";

interface I18n {
  en?: string;
  es?: string;
  pt?: string;
  pl?: string;
  ru?: string;
}

export default function PartnerDescription({
  description,
  descriptionI18n
}: {
  description?: string;
  descriptionI18n?: I18n;
}) {
  const { lang } = useTranslation();

  const resolve = (): string => {
    if (descriptionI18n) {
      const targetLang = lang as keyof I18n;
      return descriptionI18n[targetLang] || descriptionI18n.en || description || "";
    }
    return description || "";
  };

  return (
    <p style={styles.descText}>
      {resolve()}
    </p>
  );
}

const styles: Record<string, React.CSSProperties> = {
  descText: {
    fontSize: "14px",
    lineHeight: "1.6",
    color: "#94a3b8",
    margin: 0
  }
};
