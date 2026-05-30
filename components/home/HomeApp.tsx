"use client";

export {}; // Garante o escopo isolado do módulo para o parser do TypeScript

import React, { useState } from "react";
import ConciergeHero from "./ConciergeHero";

// Correção: Importando como Named Export utilizando as chaves { useTranslation }
import { useTranslation } from "@/components/i18n/useTranslation";

interface HomeAppProps {
  lang?: string;
  regionName?: string;
}

export default function HomeApp({ lang, regionName = "" }: HomeAppProps) {
  const [activeChip, setActiveChip] = useState("all");
  
  // Consome as traduções reativas gerenciadas pelo seu sistema de i18n
  const { t } = useTranslation();

  return (
    <main style={styles.mainCanvas}>
      <ConciergeHero
        lang={lang}
        regionName={regionName}
        onSubmit={async () => {}}
        onChip={(cat) => setActiveChip(cat)}
        onBrowseAll={() => setActiveChip("all")}
      />

      <div style={styles.contentWrapper}>
        
        {/* Seção: Vitrine de Marcas */}
        <div style={styles.sectionHeaderZone}>
          <span style={styles.sectionBadge}>
            {t('partner.featured') || "DESTACADO"}
          </span>
          <h2 style={styles.sectionHeading}>
            {t('homepage.title') || "Con marcas en las que ya confías"} ({t('partner.allOffers') || "Todas las ofertas"})
          </h2>
        </div>

        {/* Grid Glassmorphism de Marcas */}
        <div style={styles.brandGrid}>
          {brandPartners.map((partner, idx) => (
            <div key={idx} style={styles.glassCard}>
              <div style={styles.iconBox}>{partner.icon}</div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                <span style={styles.brandName}>{partner.name}</span>
                <span style={{ fontSize: "11px", color: "#64748b" }}>
                  {t('partner.tier') || "Nivel"} • {t('partner.travel') || "Viajes"}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Seção: Cómo funciona */}
        <div style={styles.sectionSpacing}>
          <div style={styles.sectionHeaderZone}>
            <span style={styles.sectionBadge}>
              {t('partner.category') || "PIPELINE"}
            </span>
            <h2 style={styles.sectionHeading}>
              {t('navbar.spreadsheets') ? "Workflow" : "Cómo funciona"}
            </h2>
          </div>
          
          <div style={styles.stepsGrid}>
            <div style={styles.stepGlassCard}>
              <div style={styles.stepNumberBadge}>01</div>
              <p style={styles.stepBodyText}>
                {t('homepage.search_placeholder') || "Dime qué necesitas"}
              </p>
            </div>
            <div style={styles.stepGlassCard}>
              <div style={styles.stepNumberBadge}>02</div>
              <p style={styles.stepBodyText}>
                {t('partner.regions') || "Busco socios confiables para tu región"}
              </p>
            </div>
            <div style={styles.stepGlassCard}>
              <div style={styles.stepNumberBadge}>03</div>
              <p style={styles.stepBodyText}>
                {t('partner.more') || "Compara tus opciones"}
              </p>
            </div>
            <div style={styles.stepGlassCard}>
              <div style={styles.stepNumberBadge}>04</div>
              <p style={styles.stepBodyText}>
                {t('partner.visit') || "Elige y continúa"}
              </p>
            </div>
          </div>
        </div>

        {/* Seção: Idiomas e Parâmetros */}
        <div style={styles.sectionSpacing}>
          <div style={styles.sectionHeaderZone}>
            <span style={styles.sectionBadge}>
              {t('language.label') || "LANGUAGE"}
            </span>
            <h2 style={styles.sectionHeading}>
              {t('language.choose') || "Elige el idioma"}
            </h2>
          </div>
          
          <div style={styles.pillFlexContainer}>
            <button style={styles.interactivePill}>✈️ {t('partner.travel') || "Viajes"}</button>
            <button style={styles.interactivePill}>🌐 {t('language.local') || "Local"}</button>
            <button style={styles.interactivePill}>⚙️ {t('partner.network') || "Red"}</button>
          </div>
        </div>

      </div>
    </main>
  );
}

const brandPartners = [
  { name: "WeGoTrip", icon: "🗺️" },
  { name: "Kiwitaxi", icon: "🚕" },
  { name: "Welcome Pickups", icon: "🤝" },
  { name: "Alamo", icon: "🚘" },
  { name: "Economybookings", icon: "📉" },
  { name: "Aviasales", icon: "✈️" },
  { name: "CVC", icon: "🧳" },
  { name: "Oman Airlines", icon: "🦅" },
  { name: "AirHelp", icon: "⚖️" },
  { name: "AURAS Insurance", icon: "🛡️" },
  { name: "EKTA", icon: "🌍" },
  { name: "Melhor Seguro", icon: "🔒" },
  { name: "Go! Go! España", icon: "🇪🇸" },
  { name: "Proton VPN", icon: "🛡️" },
  { name: "SuperSim", icon: "⚡" }
];

const styles: Record<string, React.CSSProperties> = {
  mainCanvas: { backgroundColor: "#030305", minHeight: "100vh" },
  contentWrapper: { maxWidth: "1200px", margin: "0 auto", padding: "80px 24px 120px 24px" },
  sectionHeaderZone: { textAlign: "center", marginBottom: "48px" },
  sectionBadge: { fontSize: "11px", fontWeight: 600, color: "#dfa837", letterSpacing: "0.2em", textTransform: "uppercase" },
  sectionHeading: { fontSize: "28px", fontWeight: 600, color: "#ffffff", marginTop: "8px", letterSpacing: "-0.02em" },
  sectionSpacing: { marginTop: "120px" },
  brandGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" },
  glassCard: { display: "flex", alignItems: "center", gap: "14px", backgroundColor: "rgba(15, 15, 22, 0.65)", border: "1px solid rgba(255, 255, 255, 0.05)", borderRadius: "14px", padding: "16px 20px", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", boxShadow: "0 4px 30px rgba(0, 0, 0, 0.2)" },
  iconBox: { backgroundColor: "rgba(255, 255, 255, 0.03)", width: "36px", height: "36px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255, 255, 255, 0.05)", flexShrink: 0 },
  brandName: { fontSize: "14px", fontWeight: 500, color: "#e2e8f0" },
  stepsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "24px" },
  stepGlassCard: { backgroundColor: "rgba(10, 10, 15, 0.4)", border: "1px solid rgba(255, 255, 255, 0.04)", padding: "32px 24px", borderRadius: "16px", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", textAlign: "left" },
  stepNumberBadge: { width: "32px", height: "32px", backgroundColor: "rgba(223, 168, 55, 0.08)", border: "1px solid rgba(223, 168, 55, 0.25)", color: "#dfa837", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "13px", marginBottom: "20px" },
  stepBodyText: { fontSize: "15px", color: "#94a3b8", fontWeight: 500, margin: 0, lineHeight: "1.6" },
  pillFlexContainer: { display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "center" },
  interactivePill: { backgroundColor: "rgba(20, 20, 25, 0.6)", border: "1px solid rgba(255, 255, 255, 0.06)", padding: "12px 26px", borderRadius: "9999px", fontSize: "14px", color: "#f1f5f9", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }
};
