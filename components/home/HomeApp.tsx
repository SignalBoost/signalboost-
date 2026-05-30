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
    <main className="relative z-10 min-h-screen pt-32" style={{ backgroundColor: "#070709" }}>
      {/* 1. O Novo Hero centralizado e com espaço para não ser coberto pelo header */}
      <ConciergeHero
        lang={lang}
        regionName={regionName}
        onSubmit={runQuery}
        onChip={(cat) => setActiveChip(cat)}
        onBrowseAll={() => setActiveChip("all")}
      />

      {/* 2. Restauração Completa da Vitrine de Marcas e Seções Inferiores */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 mt-16 pb-24 text-center">
        
        {/* Seção: Vitrine de Marcas */}
        <p className="text-xs font-semibold tracking-wider uppercase text-amber-500" style={{ letterSpacing: '0.15em' }}>
          VITRINA
        </p>
        <h2 className="text-xl font-medium text-gray-300 mt-2 mb-10">
          Con marcas en las que ya confías
        </h2>

        {/* Grid de Parceiros (Marquees) */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 justify-center items-center opacity-80">
          {brandPartners.map((partner, idx) => (
            <div key={idx} className="flex items-center gap-3 bg-zinc-900/50 border border-white/5 rounded-xl p-4 text-left hover:border-white/10 transition-all">
              <span className="text-xl">{partner.icon}</span>
              <span className="text-sm font-medium text-gray-200">{partner.name}</span>
            </div>
          ))}
        </div>

        {/* Seção: Cómo funciona */}
        <div className="mt-24">
          <h2 className="text-2xl font-semibold text-white mb-12">Cómo funciona</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stepsData.map((step, idx) => (
              <div key={idx} className="bg-zinc-900/40 border border-white/5 p-6 rounded-2xl flex flex-col items-center text-center">
                <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/30 text-amber-500 rounded-full flex items-center justify-center font-bold mb-4">
                  {step.num}
                </div>
                <p className="text-sm text-gray-300 font-medium">{step.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Seção: Popular ahora */}
        <div className="mt-24">
          <h2 className="text-xl font-semibold text-white mb-8">Popular ahora</h2>
          <div className="flex flex-wrap gap-4 justify-center">
            <button className="bg-zinc-950 border border-white/10 px-5 py-2.5 rounded-full text-sm text-gray-200 flex items-center gap-2 hover:bg-zinc-900 transition-colors">
              ✈️ Vuelos a Europa
            </button>
            <button className="bg-zinc-950 border border-white/10 px-5 py-2.5 rounded-full text-sm text-gray-200 flex items-center gap-2 hover:bg-zinc-900 transition-colors">
              🌐 eSIM para viajar
            </button>
            <button className="bg-zinc-950 border border-white/10 px-5 py-2.5 rounded-full text-sm text-gray-200 flex items-center gap-2 hover:bg-zinc-900 transition-colors">
              🏨 Hoteles en Brasil
            </button>
          </div>
        </div>

      </div>
    </main>
  );
}

// Mocks estruturais das marcas parceiras que aparecem na sua foto
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

// Dados das etapas do fluxo
const stepsData = [
  { num: "1", text: "Dime qué necesitas" },
  { num: "2", text: "Busco socios confiables para tu región" },
  { num: "3", text: "Compara tus opciones" },
  { num: "4", text: "Elige y continúa" }
];
