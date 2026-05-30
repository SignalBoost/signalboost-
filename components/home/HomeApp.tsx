"use client";

export {}; // Garante o escopo isolado do módulo para o parser do TypeScript

import React, { useState } from "react";
import ConciergeHero from "./ConciergeHero";

interface HomeAppProps {
  lang?: string;
  regionName?: string;
}

export default function HomeApp({ lang, regionName = "" }: HomeAppProps) {
  const [activeChip, setActiveChip] = useState("all");

  // SISTEMA ROBUSTO DE DETECÇÃO DE LOCALE
  // 1. Pega o parâmetro lang, remove espaços e transforma em minúsculo.
  // 2. Se vier estilo "es-MX", quebra no hífen e pega apenas o "es".
  // 3. Se não vier nada do Next.js, tenta ler o idioma nativo do navegador do usuário em tempo de execução.
  const getNormalizedLang = (): string => {
    if (lang) {
      return lang.toLowerCase().split("-")[0].split("_")[0].trim();
    }
    if (typeof window !== "undefined" && window.navigator) {
      const browserLang = window.navigator.language || (window.navigator as any).userLanguage;
      if (browserLang) {
        return browserLang.toLowerCase().split("-")[0].split("_")[0].trim();
      }
    }
    return "en"; // Fallback final de segurança
  };

  const currentLang = getNormalizedLang();
  
  // Seleciona a tradução correspondente ou cai no inglês se for um idioma não mapeado
  const t = translations[currentLang] || translations["en"];

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
          <span style={styles.sectionBadge}>{t.trustBadge}</span>
          <h2 style={styles.sectionHeading}>{t.brandsTitle}</h2>
        </div>

        {/* Grid Glassmorphism de Marcas */}
        <div style={styles.brandGrid}>
          {brandPartners.map((partner, idx) => (
            <div key={idx} style={styles.glassCard}>
              <div style={styles.iconBox}>{partner.icon}</div>
              <span style={styles.brandName}>{partner.name}</span>
            </div>
          ))}
        </div>

        {/* Seção: Cómo funciona */}
        <div style={styles.sectionSpacing}>
          <div style={styles.sectionHeaderZone}>
            <span style={styles.sectionBadge}>{t.pipelineBadge}</span>
            <h2 style={styles.sectionHeading}>{t.howItWorksTitle}</h2>
          </div>
          
          <div style={styles.stepsGrid}>
            {t.steps.map((step: { num: string; text: string }, idx: number) => (
              <div key={idx} style={styles.stepGlassCard}>
                <div style={styles.stepNumberBadge}>{step.num}</div>
                <p style={styles.stepBodyText}>{step.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Seção: Popular ahora */}
        <div style={styles.sectionSpacing}>
          <div style={styles.sectionHeaderZone}>
            <span style={styles.sectionBadge}>{t.trendingBadge}</span>
            <h2 style={styles.sectionHeading}>{t.popularTitle}</h2>
          </div>
          
          <div style={styles.pillFlexContainer}>
            <button style={styles.interactivePill}>{t.pills.vuelos}</button>
            <button style={styles.interactivePill}>{t.pills.esim}</button>
            <button style={styles.interactivePill}>{t.pills.hoteles}</button>
          </div>
        </div>

      </div>
    </main>
  );
}

// Dicionário de Idiomas Oficiais (en, es, pt, pl, ru)
const translations: Record<string, any> = {
  en: {
    trustBadge: "Trust Infrastructure",
    brandsTitle: "With brands you already trust",
    pipelineBadge: "Execution Pipeline",
    howItWorksTitle: "How it works",
    trendingBadge: "Trending Parameters",
    popularTitle: "Popular now",
    pills: { vuelos: "✈️ Flights to Europe", esim: "🌐 eSIM for travel", hoteles: "🏨 Hotels in Brazil" },
    steps: [
      { num: "01", text: "Tell me what you need" },
      { num: "02", text: "I search for reliable partners for your region" },
      { num: "03", text: "Compare your options" },
      { num: "04", text: "Choose and continue" }
    ]
  },
  es: {
    trustBadge: "Infraestructura de Confianza",
    brandsTitle: "Con marcas en las que ya confías",
    pipelineBadge: "Pipeline de Ejecución",
    howItWorksTitle: "Cómo funciona",
    trendingBadge: "Parámetros de Tendencia",
    popularTitle: "Popular ahora",
    pills: { vuelos: "✈️ Vuelos a Europa", esim: "🌐 eSIM para viajar", hoteles: "🏨 Hoteles en Brasil" },
    steps: [
      { num: "01", text: "Dime qué necesitas" },
      { num: "02", text: "Busco socios confiables para tu región" },
      { num: "03", text: "Compara tus opciones" },
      { num: "04", text: "Elige y continúa" }
    ]
  },
  pt: {
    trustBadge: "Infraestrutura de Confiança",
    brandsTitle: "Com marcas que você já confia",
    pipelineBadge: "Pipeline de Execução",
    howItWorksTitle: "Como funciona",
    trendingBadge: "Parâmetros em Alta",
    popularTitle: "Popular agora",
    pills: { vuelos: "✈️ Voos para Europa", esim: "🌐 eSIM para viajar", hoteles: "🏨 Hotéis no Brasil" },
    steps: [
      { num: "01", text: "Diga-me o que você precisa" },
      { num: "02", text: "Procuro parceiros confiáveis para sua região" },
      { num: "03", text: "Compare suas opções" },
      { num: "04", text: "Escolha e continue" }
    ]
  },
  pl: {
    trustBadge: "Infrastruktura Zaufania",
    brandsTitle: "Z markami, którym już ufasz",
    pipelineBadge: "Rurociąg Wykonawczy",
    howItWorksTitle: "Jak to działa",
    trendingBadge: "Trendy Parametry",
    popularTitle: "Popularne teraz",
    pills: { vuelos: "✈️ Loty do Europy", esim: "🌐 Karta eSIM na podróż", hoteles: "🏨 Hotele w Brazylii" },
    steps: [
      { num: "01", text: "Powiedz mi, czego potrzebujesz" },
      { num: "02", text: "Szukam zaufanych partnerów dla Twojego regionu" },
      { num: "03", text: "Porównaj swoje opcje" },
      { num: "04", text: "Wybierz i kontynuuj" }
    ]
  },
  ru: {
    trustBadge: "Надежная инфраструктура",
    brandsTitle: "С брендами, которым вы доверяете",
    pipelineBadge: "Конвейер исполнения",
    howItWorksTitle: "Как это работает",
    trendingBadge: "Популярные параметры",
    popularTitle: "Популярно сейчас",
    pills: { vuelos: "✈️ Рейсы в Европу", esim: "🌐 eSIM для путешествий", hoteles: "🏨 Отели в Бразилии" },
    steps: [
      { num: "01", text: "Скажите мне, что вам нужно" },
      { num: "02", text: "Я найду надежных партнеров для вашего региона" },
      { num: "03", text: "Сравните доступные варианты" },
      { num: "04", text: "Выберите оптимальный и продолжайте" }
    ]
  }
};

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
  brandGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px" },
  glassCard: { display: "flex", alignItems: "center", gap: "14px", backgroundColor: "rgba(15, 15, 22, 0.65)", border: "1px solid rgba(255, 255, 255, 0.05)", borderRadius: "14px", padding: "16px 20px", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", boxShadow: "0 4px 30px rgba(0, 0, 0, 0.2)" },
  iconBox: { backgroundColor: "rgba(255, 255, 255, 0.03)", width: "36px", height: "36px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255, 255, 255, 0.05)" },
  brandName: { fontSize: "14px", fontWeight: 500, color: "#e2e8f0" },
  stepsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "24px" },
  stepGlassCard: { backgroundColor: "rgba(10, 10, 15, 0.4)", border: "1px solid rgba(255, 255, 255, 0.04)", padding: "32px 24px", borderRadius: "16px", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", textAlign: "left" },
  stepNumberBadge: { width: "32px", height: "32px", backgroundColor: "rgba(223, 168, 55, 0.08)", border: "1px solid rgba(223, 168, 55, 0.25)", color: "#dfa837", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "13px", marginBottom: "20px" },
  stepBodyText: { fontSize: "15px", color: "#94a3b8", fontWeight: 500, margin: 0, lineHeight: "1.6" },
  pillFlexContainer: { display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "center" },
  interactivePill: { backgroundColor: "rgba(20, 20, 25, 0.6)", border: "1px solid rgba(255, 255, 255, 0.06)", padding: "12px 26px", borderRadius: "9999px", fontSize: "14px", color: "#f1f5f9", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }
};
