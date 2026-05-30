"use client";

import React, { useState } from "react";
import ConciergeHero from "./ConciergeHero";

interface HomeAppProps {
  lang?: string;
  regionName?: string;
}

export default function HomeApp({ lang = "en", regionName = "" }: HomeAppProps) {
  const [activeChip, setActiveChip] = useState("all");

  // Handlers para os parâmetros do Hero
  const runQuery = async (rawQuery: string) => {
    console.log("Query executada:", rawQuery);
  };

  const onChip = (category: string) => {
    setActiveChip(category);
  };

  const onBrowseAll = () => {
    setActiveChip("all");
  };

  return (
    <main className="relative z-10 min-h-screen" style={{ backgroundColor: "#070709" }}>
      {/* 1. O Novo Hero limpo e isolado no topo */}
      <ConciergeHero
        lang={lang}
        regionName={regionName}
        onSubmit={runQuery}
        onChip={onChip}
        onBrowseAll={onBrowseAll}
      />

      {/* 2. Container inferior para o restante da Vitrine (Marcas, Como Funciona, etc.) */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 mt-12 pb-24">
        {/* O Next.js vai injetar os componentes de parceiros e links populares aqui abaixo sem colidir com o título */}
      </div>
    </main>
  );
}
