"use client";

import React from "react";
import StationaryStationHeroPanel from "./StationaryStationHeroPanel";
import useTranslation from "@/components/i18n/useTranslation";

interface ConciergeHeroProps {
  lang?: string;
  regionName?: string;
  onSubmit?: (rawQuery: string) => Promise<void>;
  onChip?: (category: string) => void;
  onBrowseAll?: () => void;
}

export default function ConciergeHero({ lang = "en" }: ConciergeHeroProps) {
  const { t } = useTranslation();
  const handleScrollToPortal = () => {
    window.location.href = "/promote";
  };

  return (
    <section style={styles.heroSection}>
      {/* Background Glows Complexos para profundidade */}
      <div style={styles.glowLeft} />
      <div style={styles.glowRight} />
      <div style={styles.gridOverlay} />

      <div style={styles.heroLayout}>
        <div style={styles.innerContainer}>
          {/* Badge Interativo */}
          <div style={styles.badgeContainer}>
            <span style={styles.badgePulse} />
            <span style={styles.badgeText}>SignalOffice Enterprise Portal v2.0</span>
          </div>

          {/* Título Principal de Alto Impacto */}
          <h1 style={styles.mainHeading}>
            Decentralized Office Tools <br />
            <span style={styles.gradientText}>For Elite Teams.</span>
          </h1>
          
          {/* Subtítulo Sofisticado */}
          <p style={styles.subtext}>
            Secure your critical business guidelines, manage structural project workflows, 
            and coordinate localized data vaults on an iron-clad platform designed for modern operators.
          </p>

          <p style={styles.conciergeCue}>
            {t("station.conciergeHero").includes(".")
              ? "Concierge is ready to guide your free Stationary Station tasks and prompt sign-up when the trial ends."
              : t("station.conciergeHero")}
          </p>

          {/* Grupo de Ações Core */}
          <div style={styles.actionGroup}>
            <button onClick={handleScrollToPortal} style={styles.brandButtonPrimary}>
              Open marketing tools
            </button>
            <a href="#features" style={styles.brandButtonSecondary}>
              Explore Infrastructure <span style={styles.arrow}>→</span>
            </a>
          </div>
        </div>
        <StationaryStationHeroPanel />
      </div>
    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  heroSection: {
    position: "relative",
    backgroundColor: "#030305",
    padding: "160px 24px 100px 24px",
    overflow: "hidden",
    textAlign: "center",
    borderBottom: "1px solid rgba(255, 255, 255, 0.03)"
  },
  heroLayout: {
    position: "relative",
    zIndex: 10,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 420px), 1fr))",
    alignItems: "center",
    gap: "48px",
    maxWidth: "1240px",
    margin: "0 auto"
  },
  innerContainer: {
    position: "relative",
    zIndex: 10,
    maxWidth: "720px",
    margin: "0",
    textAlign: "left"
  },
  glowLeft: {
    position: "absolute",
    top: "-10%",
    left: "15%",
    width: "400px",
    height: "400px",
    background: "radial-gradient(circle, rgba(223, 168, 55, 0.05) 0%, transparent 70%)",
    pointerEvents: "none"
  },
  glowRight: {
    position: "absolute",
    top: "10%",
    right: "15%",
    width: "500px",
    height: "500px",
    background: "radial-gradient(circle, rgba(255, 255, 255, 0.02) 0%, transparent 60%)",
    pointerEvents: "none"
  },
  gridOverlay: {
    position: "absolute",
    inset: 0,
    backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.005) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.005) 1px, transparent 1px)",
    backgroundSize: "40px 40px",
    maskImage: "radial-gradient(circle at 50% 40%, black, transparent 70%)",
    WebkitMaskImage: "radial-gradient(circle at 50% 40%, black, transparent 70%)",
    pointerEvents: "none"
  },
  badgeContainer: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "rgba(223, 168, 55, 0.05)",
    border: "1px solid rgba(223, 168, 55, 0.15)",
    padding: "6px 16px",
    borderRadius: "9999px",
    marginBottom: "32px"
  },
  badgePulse: {
    width: "6px",
    height: "6px",
    backgroundColor: "#dfa837",
    borderRadius: "50%",
    boxShadow: "0 0 10px #dfa837"
  },
  badgeText: {
    color: "#dfa837",
    fontSize: "12px",
    fontWeight: 600,
    letterSpacing: "0.05em",
    textTransform: "uppercase"
  },
  mainHeading: {
    fontSize: "56px",
    fontWeight: 700,
    color: "#ffffff",
    lineHeight: "1.1",
    letterSpacing: "-0.03em",
    margin: 0
  },
  gradientText: {
    background: "linear-gradient(135deg, #ffffff 30%, #dfa837 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent"
  },
  subtext: {
    fontSize: "17px",
    color: "#94a3b8",
    lineHeight: "1.6",
    maxWidth: "640px",
    margin: "24px 0 0 0"
  },
  conciergeCue: {
    color: "#f6d27a",
    fontSize: "14px",
    lineHeight: 1.5,
    margin: "18px 0 0 0"
  },
  actionGroup: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: "16px",
    marginTop: "40px",
    flexWrap: "wrap"
  },
  brandButtonPrimary: {
    backgroundColor: "#dfa837",
    color: "#030305",
    border: "none",
    padding: "14px 28px",
    borderRadius: "8px",
    fontWeight: 600,
    fontSize: "15px",
    cursor: "pointer",
    boxShadow: "0 4px 20px rgba(223, 168, 55, 0.15)",
    transition: "transform 0.2s ease"
  },
  brandButtonSecondary: {
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    color: "#f1f5f9",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    padding: "14px 28px",
    borderRadius: "8px",
    fontWeight: 500,
    fontSize: "15px",
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    transition: "background 0.2s ease"
  },
  arrow: {
    transition: "transform 0.2s ease"
  }
};
