"use client";

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

// Reusable Fathom-style floating panel. Every homepage section is wrapped in
// one so the whole page reads as a stack of embedded cards on a soft surface.
function Panel({ children }: { children: React.ReactNode }) {
  return <section style={styles.panel}>{children}</section>;
}

export default function HomeApp({ afterHero }: HomeAppProps) {
  const { t } = useTranslation();

  const categories = useMemo(() => {
    const map = new Map<string, { key: string; label: string; count: number }>();
    for (const partner of partners as HomepagePartner[]) {
      const key = partner.category_key || partner.category || "other";
      const label = partner.category_label || partner.category || "Other";
      const existing = map.get(key);
      if (existing) existing.count += 1;
      else map.set(key, { key, label, count: 1 });
    }
    return Array.from(map.values());
  }, []);

  return (
    <main style={styles.mainCanvas}>
      <div style={styles.bgGlow} aria-hidden="true" />
      <div style={styles.bgGrain} aria-hidden="true" />

      <div style={styles.pageStack}>
        {/* Hero (already a self-contained panel) */}
        <ConciergeHero />

        {afterHero}

        {/* ---- Browse by category ---- */}
        <Panel>
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
        </Panel>

        {/* ---- Workspace modules ---- */}
        <Panel>
          <div style={styles.sectionHeaderZone}>
            <span style={styles.sectionBadge}>Workspace modules</span>
            <h2 style={styles.sectionHeading}>Promote, assist, price, and report after the hero flow</h2>
          </div>
          <ModuleGrid />
        </Panel>

        {/* ---- How it works ---- */}
        <Panel>
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
        </Panel>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  mainCanvas: { position: "relative", backgroundColor: "#06060a", minHeight: "100vh", overflowX: "hidden" },

  bgGlow: {
    position: "fixed",
    inset: 0,
    zIndex: 0,
    pointerEvents: "none",
    background:
      "radial-gradient(60vw 50vh at 22% -5%, rgba(245,197,66,.10), transparent 60%), radial-gradient(50vw 46vh at 88% 8%, rgba(34,211,238,.06), transparent 60%), linear-gradient(180deg,#06060a,#08080f)",
  },
  bgGrain: {
    position: "fixed",
    inset: 0,
    zIndex: 0,
    pointerEvents: "none",
    opacity: 0.025,
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
  },

  pageStack: {
    position: "relative",
    zIndex: 1,
    maxWidth: "1240px",
    margin: "0 auto",
    padding: "24px 20px 110px",
    display: "flex",
    flexDirection: "column",
    gap: "28px",
  },

  panel: {
    position: "relative",
    borderRadius: "28px",
    border: "1px solid rgba(255,255,255,.08)",
    background: "linear-gradient(180deg, rgba(17,17,24,.72), rgba(9,9,15,.72))",
    backdropFilter: "saturate(140%) blur(14px)",
    WebkitBackdropFilter: "saturate(140%) blur(14px)",
    boxShadow: "0 30px 80px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.05)",
    padding: "clamp(28px, 4vw, 56px)",
  },

  sectionHeaderZone: { textAlign: "center", marginBottom: "36px" },
  sectionBadge: { fontSize: "11px", fontWeight: 700, color: "#dfa837", letterSpacing: "0.2em", textTransform: "uppercase" },
  sectionHeading: { fontSize: "clamp(22px, 3vw, 28px)", fontWeight: 600, color: "#ffffff", marginTop: "8px", letterSpacing: "-0.02em" },

  categoryGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: "14px" },
  categoryCard: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    backgroundColor: "rgba(15, 15, 22, 0.6)",
    border: "1px solid rgba(245, 197, 66, 0.14)",
    borderRadius: "18px",
    padding: "18px 20px",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,.05)",
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

  stepsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" },
  stepGlassCard: {
    backgroundColor: "rgba(10, 10, 15, 0.4)",
    border: "1px solid rgba(255, 255, 255, 0.06)",
    padding: "30px 24px",
    borderRadius: "18px",
    textAlign: "left",
  },
  stepNumberBadge: {
    width: "32px",
    height: "32px",
    backgroundColor: "rgba(223, 168, 55, 0.08)",
    border: "1px solid rgba(223, 168, 55, 0.25)",
    color: "#dfa837",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: "13px",
    marginBottom: "20px",
  },
  stepBodyText: { fontSize: "15px", color: "#94a3b8", fontWeight: 500, margin: 0, lineHeight: "1.6" },
};
