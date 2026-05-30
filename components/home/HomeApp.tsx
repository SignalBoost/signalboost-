"use client";

export {}; // Garante o escopo isolado do módulo para o parser do TypeScript

import React, { useState } from "react";
import ConciergeHero from "./ConciergeHero";

// Importação direta dos seus arquivos físicos de tradução da pasta locales
import enTranslations from "../../locales/en.json";
import esTranslations from "../../locales/es.json";
import plTranslations from "../../locales/pl.json";
import ptTranslations from "../../locales/pt.json";
import ruTranslations from "../../locales/ru.json";

const localesMap: Record<string, any> = {
  en: enTranslations,
  es: esTranslations,
  pl: plTranslations,
  pt: ptTranslations,
  ru: ruTranslations,
};

interface HomeAppProps {
  lang?: string;
  regionName?: string;
}

export default function HomeApp({ lang, regionName = "" }: HomeAppProps) {
  const [activeChip, setActiveChip] = useState("all");

  // DETECÇÃO AVANÇADA POR LOCALE, NAVEGADOR E TIMEZONE REGIONAL (MÉXICO)
  const getActiveLocale = (): string => {
    // 1. Se o Next.js passou o parâmetro explicitamente pela rota
    if (lang) {
      return lang.toLowerCase().split("-")[0].split("_")[0].trim();
    }
    
    // 2. Verificação no lado do cliente (Browser)
    if (typeof window !== "undefined") {
      // Verificação por fuso horário nativo (Se for do México, força ES)
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (tz && tz.toLowerCase().includes("mexico")) {
          return "es";
        }
      } catch (e) {
        console.error("Erro ao ler timezone:", e);
      }

      // Verificação por idioma configurado no sistema do usuário
      if (window.navigator) {
        const browserLang = window.navigator.language;
        if (browserLang) {
          return browserLang.toLowerCase().split("-")[0].split("_")[0].trim();
        }
      }
    }
    
    return "en"; // Fallback internacional de segurança
  };

  const currentLang = getActiveLocale();
  const t = localesMap[currentLang] || localesMap["en"];

  // Dicionário de contexto para as seções visuais que não existem no arquivo JSON original
  const contextualFallback: Record<string, any> = {
    en: { trustBadge: "TRUST INFRASTRUCTURE", brandsTitle: "Brands you already trust", howTitle: "Execution Pipeline", popularTitle: "Popular now", step1: "State your operational payload parameters", step2: "Querying infrastructure and distributed networks", step3: "Compare optimization tiers", step4: "Execute node connectivity" },
    es: { trustBadge: "INFRAESTRUCTURA DE CONFIANZA", brandsTitle: "Con marcas en las que ya confías", howTitle: "Cómo funciona", popularTitle: "Popular ahora", step1: "Dime qué necesitas", step2: "Busco socios confiables para tu región", step3: "Compara tus opciones", step4: "Elige y continúa" },
    pt: { trustBadge: "INFRAESTRUTURA DE CONFIANÇA", brandsTitle: "Com marcas que você já confia", howTitle: "Como funciona", popularTitle: "Popular agora", step1: "Diga-me o que você precisa", step2: "Procuro parceiros confiáveis para sua região", step3: "Compare suas opções", step4: "Escolha e continue" },
    pl: { trustBadge: "INFRASTRUKTURA ZAUFANIA", brandsTitle: "Z markami, którym już ufasz", howTitle: "Jak to działa", popularTitle: "Popularne teraz", step1: "Powiedz mi, czego potrzebujesz", step2: "Szukam zaufanych partnerów dla Twojego regionu", step3: "Porównaj swoje opcje", step4: "Wybierz i kontynuuj" },
    ru: { trustBadge: "НАДЕЖНАЯ ИНФРАСТРУКТУРА", brandsTitle: "С брендами, которым вы доверяете", howTitle: "Как это работает", popularTitle: "Популярно сейчас", step1: "Скажите мне, что вам нужно", step2: "Я найду надежных партнеров для вашего региона", step3: "Сравните доступные варианты", step4: "Выберите оптимальный и продолжайте" }
  };

  const localCtx = contextualFallback[currentLang] || contextualFallback["en"];

  return (
    <main style={styles.mainCanvas}>
      <ConciergeHero
        lang={currentLang}
        regionName={regionName}
        onSubmit={async () => {}}
        onChip={(cat) => setActiveChip(cat)}
        onBrowseAll={() => setActiveChip("all")}
      />

      <div style={styles.contentWrapper}>
        {/* Seção: Vitrine de Marcas */}
        <div style={styles.sectionHeaderZone}>
          <span style={styles.sectionBadge}>
            {t.partner?.featured ? t.partner.featured.toUpperCase() : localCtx.trustBadge}
          </span>
          <h2 style={styles.sectionHeading}>
            {localCtx.brandsTitle} ({t.partner?.allOffers || "Offers"})
          </h2>
        </div>

        {/* Grid de Marcas */}
        <div style={styles.brandGrid}>
          {brandPartners.map((partner, idx) => (
            <div key={idx} style={styles.glassCard}>
              <div style={styles.iconBox}>{partner.icon}</div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                <span style={styles.brandName}>{partner.name}</span>
                <span style={{ fontSize: "11px", color: "#64748b" }}>
                  {t.partner?.tier || "Tier"} • {t.partner?.travel || "Travel"}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Seção: Cómo funciona */}
        <div style={styles.sectionSpacing}>
          <div style={styles.sectionHeaderZone}>
            <span style={styles.sectionBadge}>
              {t.partner?.category ? t.partner.category.toUpperCase() : "PIPELINE"}
            </span>
            <h2 style={styles.sectionHeading}>{localCtx.howTitle}</h2>
          </div>
          
          <div style={styles.stepsGrid}>
            <div style={styles.stepGlassCard}>
              <div style={styles.stepNumberBadge}>01</div>
              <p style={styles.stepBodyText}>{localCtx.step1}</p>
            </div>
            <div style={styles.stepGlassCard}>
              <div style={styles.stepNumberBadge}>02</div>
              <p style={styles.stepBodyText}>{localCtx.step2}</p>
            </div>
            <div style={styles.stepGlassCard}>
              <div style={styles.stepNumberBadge}>03</div>
              <p style={styles.stepBodyText}>{localCtx.step3}</p>
            </div>
            <div style={styles.stepGlassCard}>
              <div style={styles.stepNumberBadge}>04</div>
              <p style={styles.stepBodyText}>{localCtx.step4}</p>
            </div>
          </div>
        </div>

        {/* Seção: Popular ahora */}
        <div style={styles.sectionSpacing}>
          <div style={styles.sectionHeaderZone}>
            <span style={styles.sectionBadge}>
              {t.language?.label ? t.language.label.toUpperCase() : "REGIONS"}
            </span>
            <h2 style={styles.sectionHeading}>{localCtx.popularTitle}</h2>
          </div>
          
          <div style={styles.pillFlexContainer}>
            <button style={styles.interactivePill}>✈️ {t.partner?.travel || "Travel"}</button>
            <button style={styles.interactivePill}>🌐 {t.language?.local || "Local"}</button>
            <button style={styles.interactivePill}>⚙️ {t.partner?.network || "Network"}</button>
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
