"use client";

import React from "react";
import Link from "next/link";
import { saasModules } from "@/lib/saas-modules";
import useTranslation from "@/components/i18n/useTranslation";

interface ConciergeHeroProps {
  lang?: string;
  regionName?: string;
  onSubmit?: (rawQuery: string) => Promise<void>;
  onChip?: (category: string) => void;
  onBrowseAll?: () => void;
}

function fallbackText(value: string, fallback: string) {
  return value.includes(".") ? fallback : value;
}

const stationModuleSlugs = ["promote", "assistant", "executive", "pricing"];

export default function ConciergeHero({ lang = "en" }: ConciergeHeroProps) {
  const { t } = useTranslation();
  const stationModules = stationModuleSlugs
    .map((slug) => saasModules.find((module) => module.slug === slug))
    .filter((module): module is NonNullable<typeof module> => Boolean(module));
  const handleScrollToPortal = () => {
    window.location.href = "/promote";
  };

  return (
    <section style={styles.heroSection}>
      {/* Background Glows Complexos para profundidade */}
      <div style={styles.glowLeft} />
      <div style={styles.glowRight} />
      <div style={styles.gridOverlay} />

      <div className="concierge-hero-layout" style={styles.innerContainer}>
        <div style={styles.heroCopy}>
          <div style={styles.badgeContainer}>
            <span style={styles.badgePulse} />
            <span style={styles.badgeText}>Trial gate active · Live telemetry online</span>
          </div>

          <h1 style={styles.mainHeading}>
            {fallbackText(t("homepage.saasStationTitle"), "Your SaaS Stationary Station")}
          </h1>

          <p style={styles.subtext}>
            {fallbackText(
              t("homepage.saasStationHeroCopy"),
              "Start with Promote, hand work to your Personal Assistant, review Executive telemetry, and choose Pricing without losing context."
            )}
          </p>

          <div style={styles.trialGateCard} aria-label="Trial gate and telemetry">
            <div>
              <span style={styles.trialGateLabel}>Trial gate</span>
              <strong style={styles.trialGateValue}>14 days unlocked</strong>
            </div>
            <div>
              <span style={styles.trialGateLabel}>Telemetry</span>
              <strong style={styles.trialGateValue}>98.2% healthy</strong>
            </div>
          </div>

          <div style={styles.actionGroup}>
            <button onClick={handleScrollToPortal} style={styles.brandButtonPrimary}>
              Start with Promote
            </button>
            <Link href="/pricing" style={styles.brandButtonSecondary}>
              View Pricing <span style={styles.arrow}>→</span>
            </Link>
          </div>
        </div>

        <aside className="saas-station-panel" style={styles.stationPanel} aria-labelledby="saas-station-title">
          <div style={styles.stationGlow} aria-hidden="true" />
          <div style={styles.stationHeader}>
            <span style={styles.stationEyebrow}>Live SaaS Command</span>
            <h2 id="saas-station-title" style={styles.stationTitle}>
              {fallbackText(t("homepage.saasStationTitle"), "Your SaaS Stationary Station")}
            </h2>
            <p style={styles.stationSubtitle}>
              {fallbackText(
                t("homepage.saasStationSubtitle"),
                "Promote, Personal Assistant, Executive telemetry, and Pricing stay in one highlighted operating dock."
              )}
            </p>
          </div>

          <div style={styles.stationTelemetryStrip} aria-label="SaaS station telemetry">
            <span style={styles.telemetryDot} />
            <strong>98.2%</strong>
            <span>{fallbackText(t("homepage.saasStationTelemetry"), "module sync health")}</span>
          </div>

          <div style={styles.stationGrid}>
            {stationModules.map((module) => (
              <Link
                href={module.href}
                key={module.slug}
                style={{
                  ...styles.stationModuleCard,
                  borderColor: `${module.accent}66`,
                  boxShadow: `0 18px 48px ${module.accent}18`,
                }}
              >
                <span style={{ ...styles.stationModuleAccent, background: module.accent }} />
                <span style={styles.stationModuleTopline}>
                  {fallbackText(t(module.eyebrowKey), module.eyebrow)}
                </span>
                <strong style={styles.stationModuleTitle}>
                  {fallbackText(t(module.titleKey), module.title)}
                </strong>
                <span style={styles.stationModuleSignal}>{module.telemetry}</span>
              </Link>
            ))}
          </div>
        </aside>
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
  innerContainer: {
    position: "relative",
    zIndex: 10,
    maxWidth: "1180px",
    margin: "0 auto"
  },
  heroCopy: {
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
  subtext: {
    fontSize: "17px",
    color: "#94a3b8",
    lineHeight: "1.6",
    maxWidth: "640px",
    margin: "24px 0 0"
  },
  trialGateCard: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "12px",
    maxWidth: "520px",
    marginTop: "26px"
  },
  trialGateLabel: {
    display: "block",
    color: "#64748b",
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    marginBottom: "8px"
  },
  trialGateValue: {
    display: "block",
    color: "#fff7db",
    border: "1px solid rgba(245, 197, 66, 0.18)",
    background: "rgba(245, 197, 66, 0.07)",
    borderRadius: "16px",
    padding: "14px 16px",
    fontSize: "16px"
  },
  actionGroup: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: "16px",
    marginTop: "40px"
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
  },
  stationPanel: {
    position: "relative",
    minHeight: "560px",
    overflow: "hidden",
    padding: "30px",
    borderRadius: "34px",
    border: "1px solid rgba(223, 168, 55, 0.55)",
    background: "linear-gradient(145deg, rgba(43, 30, 8, 0.92), rgba(8, 10, 16, 0.95) 58%, rgba(223, 168, 55, 0.14))",
    boxShadow: "0 0 0 1px rgba(245, 197, 66, 0.14), 0 0 68px rgba(223, 168, 55, 0.24), 0 34px 100px rgba(0, 0, 0, 0.46)",
    textAlign: "left"
  },
  stationGlow: {
    position: "absolute",
    inset: "-28% -22% auto auto",
    width: "360px",
    height: "360px",
    borderRadius: "999px",
    background: "radial-gradient(circle, rgba(245, 197, 66, 0.34), transparent 68%)",
    filter: "blur(6px)",
    pointerEvents: "none"
  },
  stationHeader: {
    position: "relative",
    zIndex: 1
  },
  stationEyebrow: {
    color: "#f5c542",
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: "0.2em",
    textTransform: "uppercase"
  },
  stationTitle: {
    color: "#fff7db",
    fontSize: "clamp(34px, 4.5vw, 58px)",
    lineHeight: 0.96,
    letterSpacing: "-0.055em",
    margin: "12px 0 16px",
    maxWidth: "520px"
  },
  stationSubtitle: {
    color: "rgba(255, 248, 220, 0.76)",
    fontSize: "15px",
    lineHeight: 1.55,
    margin: 0,
    maxWidth: "520px"
  },
  stationTelemetryStrip: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    alignItems: "center",
    gap: "10px",
    margin: "26px 0",
    padding: "13px 16px",
    border: "1px solid rgba(245, 197, 66, 0.28)",
    borderRadius: "999px",
    background: "linear-gradient(90deg, rgba(245, 197, 66, 0.18), rgba(255, 255, 255, 0.045), rgba(245, 197, 66, 0.10))",
    color: "rgba(255, 248, 220, 0.82)",
    fontSize: "12px",
    letterSpacing: "0.08em",
    textTransform: "uppercase"
  },
  telemetryDot: {
    width: "8px",
    height: "8px",
    borderRadius: "999px",
    background: "#f5c542",
    boxShadow: "0 0 18px #f5c542",
    flexShrink: 0
  },
  stationGrid: {
    position: "relative",
    zIndex: 1,
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "14px"
  },
  stationModuleCard: {
    position: "relative",
    minHeight: "148px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    overflow: "hidden",
    padding: "18px",
    border: "1px solid rgba(245, 197, 66, 0.34)",
    borderRadius: "22px",
    background: "linear-gradient(180deg, rgba(255, 255, 255, 0.105), rgba(255, 255, 255, 0.045))",
    color: "#ffffff",
    textDecoration: "none",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)"
  },
  stationModuleAccent: {
    position: "absolute",
    inset: "0 auto auto 0",
    width: "100%",
    height: "4px"
  },
  stationModuleTopline: {
    color: "rgba(255, 255, 255, 0.62)",
    fontSize: "10px",
    fontWeight: 800,
    letterSpacing: "0.13em",
    textTransform: "uppercase"
  },
  stationModuleTitle: {
    color: "#fff",
    fontSize: "21px",
    letterSpacing: "-0.035em"
  },
  stationModuleSignal: {
    color: "#f8d777",
    fontSize: "12px",
    fontWeight: 800
  }
};
