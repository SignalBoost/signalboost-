"use client";

export {};

import React from "react";
import ConciergeHero from "./ConciergeHero";
import ModuleGrid from "@/components/ModuleGrid";

interface HomeAppProps {
  lang?: string;
  regionName?: string;
  afterHero?: React.ReactNode;
}

export default function HomeApp({ lang, regionName = "", afterHero }: HomeAppProps) {
  return (
    <main style={styles.mainCanvas}>
      <ConciergeHero
        lang={lang}
        regionName={regionName}
        onSubmit={async () => {}}
      />

      {afterHero}

      <div style={styles.contentWrapper}>
        <ModuleGrid slugs={["promote", "assistant", "executive", "pricing"]} />
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  mainCanvas: { backgroundColor: "#030305", minHeight: "100vh" },
  contentWrapper: { maxWidth: "1200px", margin: "0 auto", padding: "56px 24px 120px" },
};
