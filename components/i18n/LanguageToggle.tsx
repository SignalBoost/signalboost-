"use client";

import React from "react";
import { useTranslation } from "./useTranslation";

export default function LanguageToggle() {
  const { currentLocale, changeLanguage } = useTranslation();

  return (
    <div style={styles.toggleContainer}>
      <button
        onClick={() => changeLanguage("en")}
        style={{
          ...styles.toggleBtn,
          ...(currentLocale === "en" ? styles.activeBtn : {}),
        }}
      >
        EN
      </button>
      <button
        onClick={() => changeLanguage("es")}
        style={{
          ...styles.toggleBtn,
          ...(currentLocale === "es" ? styles.activeBtn : {}),
        }}
      >
        ES
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  toggleContainer: { display: "inline-flex", gap: "4px", backgroundColor: "rgba(255,255,255,0.03)", padding: "4px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.06)" },
  toggleBtn: { backgroundColor: "transparent", color: "#94a3b8", border: "none", padding: "6px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: 600, cursor: "pointer", transition: "all 0.2s ease" },
  activeBtn: { backgroundColor: "#dfa837", color: "#030305" }
};
