"use client";

import React, { useEffect, useState } from "react";
import { useTranslation } from "./i18n/useTranslation";

export function LanguageToggle() {
  // Ajustado para usar as propriedades corretas expostas pelo hook unificado
  const { currentLocale, changeLanguage } = useTranslation();

  // Mantém estável a referência do idioma local do visitante (não-inglês)
  const [localTarget, setLocalTarget] = useState("es");

  useEffect(() => {
    // Se o idioma inicial detectado não for inglês, fixa ele como o alvo alternável
    if (currentLocale !== "en") {
      setLocalTarget(currentLocale);
    }
  }, []);

  const handleToggle = () => {
    // Alterna estritamente entre inglês e o locale regional ativo
    const nextLocale = currentLocale === "en" ? localTarget : "en";
    changeLanguage(nextLocale);
  };

  return (
    <button onClick={handleToggle} style={styles.toggleBtn}>
      <span style={styles.globeIcon}>🌐</span>
      <span style={styles.textLabel}>
        {currentLocale === "en" ? "EN" : currentLocale.toUpperCase()}
      </span>
    </button>
  );
}

const styles: Record<string, React.CSSProperties> = {
  toggleBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    padding: "6px 14px",
    borderRadius: "8px",
    color: "#f1f5f9",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease"
  },
  globeIcon: {
    fontSize: "14px"
  },
  textLabel: {
    letterSpacing: "0.05em"
  }
};
