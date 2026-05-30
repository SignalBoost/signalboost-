"use client";

export {};

import React, { useMemo } from "react";
import Link from "next/link";
import ConciergeHero from "./ConciergeHero";
import ModuleGrid from "@/components/ModuleGrid";
import useTranslation from "@/components/i18n/useTranslation";
import partners from "@/partners.json";

interface HomeAppProps {
  lang?: string;
  regionName?: string;
  afterHero?: React.ReactNode;
}

type HomepagePartner = {
  id: string;
  name: string;
  logo?: string;
  description?: string;
  category_key?: string;
  category_label?: string;
  category?: string;
  network?: string;
  featured?: boolean;
};

export default function HomeApp({ lang, regionName = "", afterHero }: HomeAppProps) {
  const { t } = useTranslation();

  // Browse-by-category: derived live from partners.json (insertion order
  // preserved). Replaces the old "credibility badges" grid that duplicated
  // the partners now shown in the hero.
  const categories = useMemo(() => {
    const map = new Map<string, { key: string; label: string; count: number }>();
    for (const partner of partners as HomepagePartner[]) {
      const key = partner.category_key || partner.category || "other";
      const label = partner.category_label || partner.category || "Other";
      const existing = map.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(key, { key, label, count: 1 });
      }
    }
    return Array.from(map.values());
  }, []);

  return (
    <main style={styles.mainCanvas}>
      <ConciergeHero
        lang={lang}
        regionName={regionName}
        onSubmit={async () => {}}
        onChip={() => {}}
        onBrowseAll={() => {}}
      />

      {afterHero}

      <div style={styles.contentWrapper}>
        {/* ---- Browse by category (complements the hero, no duplication) ---- */}
        <div style={styles.sectionHeaderZone}>
          <span style={styles.sectionBadge}>Partner marketplace</span>
          <h2 style={styles.sectionHeading}>Browse trusted partners by category</h2>
        </div>

        <div style={styles.categoryGrid}>
          {categories.map((category) => (
            <Link
              key={category.key}
              href={`/marketplace?category=${category.key}`}
              style={styles.categoryCard}
              aria-label={`Browse ${category.label} partners`}
            >
              <span style={styles.categoryCardCopy}>
                <span style={styles.categoryName}>{category.label}</span>
                <span style={styles.categoryMeta}>
                  {category.count} {category.count === 1 ? "partner" : "partners"}
                </span>
              </span>
              <span style={styles.categoryArrow} aria-hidden="true">→</span>
            </Link>
          ))}
        </div>

        <div style={styles.browseAllRow}>
          <Link href="/marketplace" style={styles.browseAllButton}>
            View the full marketplace
          </Link>
        </div>

        {/* ---- Workspace modules ---- */}
        <div style={styles.workspaceSection}>
          <div style={styles.sectionHeaderZone}>
            <span style={styles.sectionBadge}>Workspace modules</span>
            <h2 style={styles.sectionHeading}>Promote, assist, price, and report after the hero flow</h2>
          </div>
          <ModuleGrid />
        </div>

        {/* ---- How it works ---- */}
        <div style={styles.sectionSpacing}>
          <div style={styles.sectionHeaderZone}>
            <span style={styles.sectionBadge}>How it works</span>
            <h2 style={styles.sectionHeading}>From discovery to booking in four steps</h2>
          </div>

          <div style={styles.stepsGrid}>
            <div style={styles.stepGlassCard}>
              <div style={styles.stepNumberBadge}>01</div>
              <p style={styles.stepBodyText}>{t("homepage.search_placeholder")}</p>
            </div>
            <div style={styles.stepGlassCard}>
              <div style={styles.stepNumberBadge}>02</div>
              <p style={styles.stepBodyText}>{t("partner.regions")}</p>
            </div>
            <div style={styles.stepGlassCard}>
              <div style={styles.stepNumberBadge}>03</div>
              <p style={styles.stepBodyText}>{t("partner.more")}</p>
            </div>
            <div style={styles.stepGlassCard}>
              <div style={styles.stepNumberBadge}>04</div>
              <p style={styles.stepBodyText}>{t("partner.visit")}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  mainCanvas: { backgroundColor: "#030305", minHeight: "100vh" },
  contentWrapper: { maxWidth: "1200px", margin: "0 auto", padding: "80px 24px 120px 24px" },
  sectionHeaderZone: { textAlign: "center", marginBottom: "48px" },
  sectionBadge: { fontSize: "11px", fontWeight: 600, color: "#dfa837", letterSpacing: "0.2em", textTransform: "uppercase" },
  sectionHeading: { fontSize: "28px", fontWeight: 600, color: "#ffffff", marginTop: "8px", letterSpacing: "-0.02em" },
  sectionSpacing: { marginTop: "120px" },
  workspaceSection: { marginTop: "120px" },

  // Browse-by-category grid
  categoryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
    gap: "14px",
  },
  categoryCard: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    backgroundColor: "rgba(15, 15, 22, 0.72)",
    border: "1px solid rgba(245, 197, 66, 0.14)",
    borderRadius: "18px",
    padding: "18px 20px",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    boxShadow: "0 18px 50px rgba(0, 0, 0, 0.28), inset 0 1px 0 rgba(255,255,255,.05)",
    textDecoration: "none",
    minHeight: "84px",
  },
  categoryCardCopy: { display: "flex", flexDirection: "column", minWidth: 0 },
  categoryName: { fontSize: "16px", fontWeight: 800, color: "#f8fafc" },
  categoryMeta: { fontSize: "12px", color: "#dfa837", fontWeight: 800, marginTop: "4px" },
  categoryArrow: { color: "#f5c542", fontSize: "18px", fontWeight: 900, flexShrink: 0 },

  browseAllRow: { display: "flex", justifyContent: "center", marginTop: "36px" },
  browseAllButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "999px",
    border: "1px solid rgba(255,255,255,.14)",
    background: "rgba(255,255,255,.06)",
    color: "#fff",
    minHeight: "48px",
    padding: "0 26px",
    fontWeight: 900,
    fontSize: "14px",
    textDecoration: "none",
  },

  // How it works steps
  stepsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "24px" },
  stepGlassCard: { backgroundColor: "rgba(10, 10, 15, 0.4)", border: "1px solid rgba(255, 255, 255, 0.04)", padding: "32px 24px", borderRadius: "16px", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", textAlign: "left" },
  stepNumberBadge: { width: "32px", height: "32px", backgroundColor: "rgba(223, 168, 55, 0.08)", border: "1px solid rgba(223, 168, 55, 0.25)", color: "#dfa837", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "13px", marginBottom: "20px" },
  stepBodyText: { fontSize: "15px", color: "#94a3b8", fontWeight: 500, margin: 0, lineHeight: "1.6" },
};
