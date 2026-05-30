"use client";

import React, { useState } from "react";
import ConciergeHero from "./ConciergeHero";

interface HomeAppProps {
  lang?: string;
  regionName?: string;
}

export default function HomeApp({ lang = "en", regionName = "" }: HomeAppProps) {
  const [activeChip, setActiveChip] = useState("all");

  const runQuery = async (rawQuery: string) => {
    console.log("Query executada:", rawQuery);
  };

  return (
    <main className="relative z-10 min-h-screen" style={styles.mainCanvas}>
      {/* 1. O Novo Hero isolado */}
      <ConciergeHero
        lang={lang}
        regionName={regionName}
        onSubmit={runQuery}
        onChip={(cat) => setActiveChip(cat)}
        onBrowseAll={() => setActiveChip("all")}
      />

      {/* 2. Vitrine de Marcas e Seções Organizadas por Flexbox/Grid Nativo */}
      <div style={styles.contentWrapper}>
        
        {/* Seção: Vitrine de Marcas */}
        <p style={styles.vitrinaBadge}>VITRINA</p>
        <h2 style={styles.sectionHeading}>Con marcas en las que ya confías</h2>

        {/* Grid de Marcas Parceiras Auto-Responsivo */}
        <div style={styles.brandGrid}>
          {brandPartners.map((partner, idx) => (
            <div key={idx} style={styles.brandCard}>
              <span style={styles.brandIcon}>{partner.icon}</span>
              <span style={styles.brandName}>{partner.name}</span>
            </div>
          ))}
        </div>

        {/* Seção: Cómo funciona */}
        <div style={styles.sectionSpacing}>
          <h2 style={styles.sectionTitle}>Cómo funciona</h2>
          <div style={styles.stepsGrid}>
            {stepsData.map((step, idx) => (
              <div key={idx} style={styles.stepCard}>
                <div style={styles.stepNumber}>{step.num}</div>
                <p style={styles.stepText}>{step.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Seção: Popular ahora */}
        <div style={styles.sectionSpacing}>
          <h2 style={styles.sectionTitle}>Popular ahora</h2>
          <div style={styles.pillContainer}>
            <button style={styles.popularPill}>✈️ Vuelos a Europa</button>
            <button style={styles.popularPill}>🌐 eSIM para viajar</button>
            <button style={styles.popularPill}>🏨 Hoteles en Brasil</button>
          </div>
        </div>

      </div>
    </main>
  );
}

// Folha de Estilos Injetada para blindar o Layout de bugs de compilação
const styles: Record<string, React.CSSProperties> = {
  mainCanvas: { backgroundColor: "#070709", paddingTop: "120px" },
  contentWrapper: { maxWidth: "1200px", margin: "0 auto", padding: "0 24px 96px 24px", textAlign: "center" },
  vitrinaBadge: { fontSize: "12px", fontWeight: 600, color: "#dfa837", letterSpacing: "0.15em", textTransform: "uppercase", margin: 0 },
  sectionHeading: { fontSize: "20px", fontWeight: 500, color: "#cbd5e1", marginTop: "8px", marginBottom: "40px" },
  sectionSpacing: { marginTop: "80px" },
  sectionTitle: { fontSize: "24px", fontWeight: 600, color: "#ffffff", marginBottom: "40px", letterSpacing: "-0.02em" },
  
  // Layout da Grade de Marcas
  brandGrid: { display: "flex", flexWrap: "wrap", gap: "16px", justifyContent: "center", alignItems: "center" },
  brandCard: { display: "flex", alignItems: "center", gap: "12px", backgroundColor: "rgba(20, 20, 25, 0.7)", border: "1px solid rgba(255, 255, 255, 0.05)", borderRadius: "12px", padding: "14px 20px", minWidth: "180px", flex: "1 1 calc(16.66% - 16px)", boxSizing: "border-box" },
  brandIcon: { fontSize: "20px" },
  brandName: { fontSize: "14px", fontWeight: 500, color: "#e2e8f0", whiteSpace: "nowrap" },
  
  // Layout dos Passos (Como Funciona)
  stepsGrid: { display: "flex", flexWrap: "wrap", gap: "24px", justifyContent: "center" },
  stepCard: { display: "flex", flexDirection: "column", alignItems: "center", backgroundColor: "rgba(20, 20, 25, 0.4)", border: "1px solid rgba(255, 255, 255, 0.05)", padding: "28px 24px", borderRadius: "16px", flex: "1 1 calc(25% - 24px)", minWidth: "220px", boxSizing: "border-box" },
  stepNumber: { width: "36px", height: "36px", backgroundColor: "rgba(223, 168, 55, 0.1)", border: "1px solid rgba(223, 168, 55, 0.3)", color: "#dfa837", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "14px", marginBottom: "16px" },
  stepText: { fontSize: "14px", color: "#cbd5e1", fontWeight: 500, margin: 0, lineHeight: "1.5" },
  
  // Layout dos Botões Populares
  pillContainer: { display: "flex", flexWrap: "wrap", gap: "16px", justifyContent: "center" },
  popularPill: { backgroundColor: "#0e0e12", border: "1px solid rgba(255, 255, 255, 0.1)", padding: "10px 22px", borderRadius: "9999px", fontSize: "14px", color: "#e2e8f0", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }
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

const stepsData = [
  { num: "1", text: "Dime qué necesitas" },
  { num: "2", text: "Busco socios confiables para tu región" },
  { num: "3", text: "Compara tus opciones" },
  { num: "4", text: "Elige y continúa" }
];
