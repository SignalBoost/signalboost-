"use client";

export {};

import React from "react";
import ConciergeHero from "./ConciergeHero";
import ModuleGrid from "@/components/ModuleGrid";
import useTranslation from "@/components/i18n/useTranslation";
import partners from "@/partners.json";

interface HomeAppProps {
  lang?: string;
  regionName?: string;
  afterHero?: React.ReactNode;
}

export default function HomeApp({ lang, regionName = "", afterHero }: HomeAppProps) {
  const { t } = useTranslation();

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
        <div style={styles.sectionHeaderZone}>
          <span style={styles.sectionBadge}>Partner showcase</span>
          <h2 style={styles.sectionHeading}>Trusted affiliate credibility badges</h2>
        </div>

        <div style={styles.brandGrid}>
          {brandPartners.map((partner) => (
            <a
              key={partner.id}
              href={`/partners/${partner.id}`}
              style={styles.glassCard}
              aria-label={`${partner.name} credibility badge`}
            >
              <span style={styles.iconBox}>
                {partner.logo ? (
                  <img
                    src={`/logos/${partner.logo}`}
                    alt={`${partner.name} logo`}
                    loading="lazy"
                    style={styles.partnerLogo}
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  partner.name.charAt(0).toUpperCase()
                )}
              </span>
              <span style={styles.partnerCopy}>
                <span style={styles.brandName}>{partner.name}</span>
                <span style={styles.partnerMeta}>
                  {(partner.category_label || partner.category || t('partner.category'))} • {partner.network || t('partner.platform')}
                </span>
                <span style={styles.partnerDescription}>{partner.description}</span>
              </span>
            </a>
          ))}
        </div>

        <div style={styles.workspaceSection}>
          <div style={styles.sectionHeaderZone}>
            <span style={styles.sectionBadge}>Workspace modules</span>
            <h2 style={styles.sectionHeading}>Promote, assist, price, and report after the hero flow</h2>
          </div>
          <ModuleGrid />
        </div>

        <div style={styles.sectionSpacing}>
          <div style={styles.sectionHeaderZone}>
            <span style={styles.sectionBadge}>{t('partner.category')}</span>
            <h2 style={styles.sectionHeading}>{t('navbar.calendar')} &amp; {t('navbar.spreadsheets')}</h2>
          </div>
          
          <div style={styles.stepsGrid}>
            <div style={styles.stepGlassCard}>
              <div style={styles.stepNumberBadge}>01</div>
              <p style={styles.stepBodyText}>{t('homepage.search_placeholder')}</p>
            </div>
            <div style={styles.stepGlassCard}>
              <div style={styles.stepNumberBadge}>02</div>
              <p style={styles.stepBodyText}>{t('partner.regions')}</p>
            </div>
            <div style={styles.stepGlassCard}>
              <div style={styles.stepNumberBadge}>03</div>
              <p style={styles.stepBodyText}>{t('partner.more')}</p>
            </div>
            <div style={styles.stepGlassCard}>
              <div style={styles.stepNumberBadge}>04</div>
              <p style={styles.stepBodyText}>{t('partner.visit')}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

type HomepagePartner = {
  id: string;
  name: string;
  logo?: string;
  description?: string;
  category_label?: string;
  category?: string;
  network?: string;
  featured?: boolean;
};

const brandPartners = (partners as HomepagePartner[])
  .filter((partner) => partner.featured)
  .slice(0, 12);

const styles: Record<string, React.CSSProperties> = {
  mainCanvas: { backgroundColor: "#030305", minHeight: "100vh" },
  contentWrapper: { maxWidth: "1200px", margin: "0 auto", padding: "80px 24px 120px 24px" },
  sectionHeaderZone: { textAlign: "center", marginBottom: "48px" },
  sectionBadge: { fontSize: "11px", fontWeight: 600, color: "#dfa837", letterSpacing: "0.2em", textTransform: "uppercase" },
  sectionHeading: { fontSize: "28px", fontWeight: 600, color: "#ffffff", marginTop: "8px", letterSpacing: "-0.02em" },
  sectionSpacing: { marginTop: "120px" },
  workspaceSection: { marginTop: "18px" },
  brandGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "16px", marginBottom: "78px" },
  glassCard: { display: "flex", alignItems: "flex-start", gap: "14px", backgroundColor: "rgba(15, 15, 22, 0.72)", border: "1px solid rgba(245, 197, 66, 0.14)", borderRadius: "18px", padding: "18px", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", boxShadow: "0 18px 50px rgba(0, 0, 0, 0.28), inset 0 1px 0 rgba(255,255,255,.05)", textDecoration: "none", minHeight: "156px" },
  iconBox: { backgroundColor: "#ffffff", width: "48px", height: "48px", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(245, 197, 66, 0.28)", flexShrink: 0, color: "#111827", fontWeight: 900, overflow: "hidden" },
  partnerLogo: { width: "36px", height: "36px", objectFit: "contain" },
  partnerCopy: { display: "flex", flexDirection: "column", alignItems: "flex-start", minWidth: 0 },
  brandName: { fontSize: "15px", fontWeight: 800, color: "#f8fafc" },
  partnerMeta: { fontSize: "11px", color: "#dfa837", fontWeight: 800, marginTop: "3px" },
  partnerDescription: { fontSize: "12px", color: "#94a3b8", lineHeight: 1.45, marginTop: "9px" },
  stepsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "24px" },
  stepGlassCard: { backgroundColor: "rgba(10, 10, 15, 0.4)", border: "1px solid rgba(255, 255, 255, 0.04)", padding: "32px 24px", borderRadius: "16px", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", textAlign: "left" },
  stepNumberBadge: { width: "32px", height: "32px", backgroundColor: "rgba(223, 168, 55, 0.08)", border: "1px solid rgba(223, 168, 55, 0.25)", color: "#dfa837", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "13px", marginBottom: "20px" },
  stepBodyText: { fontSize: "15px", color: "#94a3b8", fontWeight: 500, margin: 0, lineHeight: "1.6" }
};
