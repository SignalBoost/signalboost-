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

const stationModuleSlugs = ["calendar", "spreadsheets", "reviews", "outreach"];
const trialTasks = ["Generate an outreach brief", "Clean up a spreadsheet", "Schedule a review follow-up"];

export default function ConciergeHero({ lang = "en" }: ConciergeHeroProps) {
  const { t } = useTranslation();
  const stationModules = stationModuleSlugs
    .map((slug) => saasModules.find((module) => module.slug === slug))
    .filter((module): module is NonNullable<typeof module> => Boolean(module));

  return (
    <section style={styles.heroSection} aria-labelledby="saas-station-hero-title">
      <div style={styles.glowLeft} aria-hidden="true" />
      <div style={styles.glowRight} aria-hidden="true" />
      <div style={styles.gridOverlay} aria-hidden="true" />

      <div className="concierge-hero-layout" style={styles.innerContainer}>
        <div style={styles.heroCopy}>
          <div style={styles.badgeContainer}>
            <span style={styles.badgePulse} />
            <span style={styles.badgeText}>Gold cockpit • SaaS Station online</span>
          </div>

          <h1 id="saas-station-hero-title" style={styles.mainHeading}>
            {fallbackText(t("homepage.saasStationTitle"), "Your SaaS Stationary Station")}
          </h1>

          <p style={styles.subtext}>
            Calendar, Spreadsheets, Reviews, and Outreach are now the command center for office work —
            with glowing telemetry, guided task flow, and affiliate credibility signals under one cockpit.
          </p>

          <div style={styles.trialPanel} aria-label="Trial gating">
            <div>
              <span style={styles.trialEyebrow}>Trial gate</span>
              <strong style={styles.trialTitle}>3 free tasks, then sign-up required</strong>
            </div>
            <div style={styles.trialDots} aria-hidden="true">
              <span style={styles.trialDot} />
              <span style={styles.trialDot} />
              <span style={styles.trialDot} />
            </div>
          </div>

          <ul style={styles.trialList} aria-label="Included free tasks">
            {trialTasks.map((task) => (
              <li key={task} style={styles.trialListItem}>{task}</li>
            ))}
          </ul>

          <div style={styles.actionGroup}>
            <Link href="/assistant" style={styles.brandButtonPrimary}>
              Start free task run
            </Link>
            <Link href="/pricing" style={styles.brandButtonSecondary}>
              Unlock station access <span style={styles.arrow}>→</span>
            </Link>
          </div>
        </div>

        <aside className="saas-station-panel" style={styles.stationPanel} aria-label="SaaS station telemetry cockpit">
          <div style={styles.stationGlow} aria-hidden="true" />
          <div style={styles.stationHeader}>
            <span style={styles.stationEyebrow}>Live office telemetry</span>
            <h2 style={styles.stationTitle}>Stationary SaaS Station</h2>
            <p style={styles.stationSubtitle}>
              Four office modules stay prioritized before the workspace grid so visitors understand the flow first.
            </p>
          </div>

          <div style={styles.telemetryVisual} aria-hidden="true">
            <span style={{ ...styles.telemetryBar, height: "52%" }} />
            <span style={{ ...styles.telemetryBar, height: "72%" }} />
            <span style={{ ...styles.telemetryBar, height: "44%" }} />
            <span style={{ ...styles.telemetryBar, height: "86%" }} />
            <span style={{ ...styles.telemetryBar, height: "64%" }} />
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
                  borderColor: `${module.accent}7a`,
                  boxShadow: `0 18px 48px ${module.accent}20, inset 0 1px 0 rgba(255,255,255,.08)`,
                }}
              >
                <span style={{ ...styles.stationModuleAccent, background: module.accent }} />
                <span style={styles.stationModuleTopline}>
                  {fallbackText(t(module.eyebrowKey), module.eyebrow)}
                </span>
                <strong style={styles.stationModuleTitle}>
                  {fallbackText(t(module.titleKey), module.title)}
                </strong>
                <span style={styles.stationModuleSignal}>{module.signal}</span>
                <span style={styles.stationModuleTelemetry}>{module.telemetry}</span>
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
    padding: "150px 24px 86px 24px",
    overflow: "hidden",
    borderBottom: "1px solid rgba(245, 197, 66, 0.13)",
  },
  innerContainer: {
    position: "relative",
    zIndex: 10,
    display: "grid",
    gridTemplateColumns: "minmax(0, 0.92fr) minmax(360px, 1.08fr)",
    gap: "34px",
    alignItems: "center",
    maxWidth: "1180px",
    margin: "0 auto",
  },
  heroCopy: { textAlign: "left" },
  glowLeft: {
    position: "absolute",
    top: "-14%",
    left: "8%",
    width: "520px",
    height: "520px",
    background: "radial-gradient(circle, rgba(245, 197, 66, 0.16) 0%, transparent 68%)",
    pointerEvents: "none",
  },
  glowRight: {
    position: "absolute",
    top: "8%",
    right: "8%",
    width: "620px",
    height: "620px",
    background: "radial-gradient(circle, rgba(34, 211, 238, 0.1) 0%, transparent 62%)",
    pointerEvents: "none",
  },
  gridOverlay: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(245, 197, 66, 0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(245, 197, 66, 0.035) 1px, transparent 1px)",
    backgroundSize: "44px 44px",
    maskImage: "radial-gradient(circle at 50% 38%, black, transparent 74%)",
    WebkitMaskImage: "radial-gradient(circle at 50% 38%, black, transparent 74%)",
    pointerEvents: "none",
  },
  badgeContainer: {
    display: "inline-flex",
    alignItems: "center",
    gap: "10px",
    border: "1px solid rgba(245, 197, 66, 0.32)",
    background: "rgba(245, 197, 66, 0.08)",
    borderRadius: "999px",
    padding: "8px 13px",
    marginBottom: "22px",
  },
  badgePulse: {
    width: "8px",
    height: "8px",
    borderRadius: "999px",
    background: "#f5c542",
    boxShadow: "0 0 18px rgba(245, 197, 66, 0.9)",
  },
  badgeText: {
    color: "#f5c542",
    fontSize: "11px",
    fontWeight: 900,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
  },
  mainHeading: {
    color: "#fff",
    fontSize: "clamp(48px, 7vw, 92px)",
    lineHeight: 0.92,
    letterSpacing: "-0.075em",
    margin: "0 0 22px",
    textShadow: "0 0 44px rgba(245, 197, 66, 0.18)",
  },
  subtext: {
    maxWidth: "650px",
    color: "rgba(255, 255, 255, 0.72)",
    fontSize: "18px",
    lineHeight: 1.62,
    margin: "0 0 24px",
  },
  trialPanel: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    maxWidth: "560px",
    border: "1px solid rgba(245, 197, 66, 0.34)",
    borderRadius: "22px",
    background: "linear-gradient(135deg, rgba(245, 197, 66, 0.14), rgba(255,255,255,0.04))",
    padding: "16px 18px",
    boxShadow: "0 18px 54px rgba(245, 197, 66, 0.1)",
  },
  trialEyebrow: {
    display: "block",
    color: "#f5c542",
    fontSize: "11px",
    fontWeight: 900,
    letterSpacing: "0.16em",
    textTransform: "uppercase",
  },
  trialTitle: { display: "block", color: "#fff", fontSize: "18px", marginTop: "3px" },
  trialDots: { display: "flex", gap: "8px" },
  trialDot: { width: "13px", height: "13px", borderRadius: "999px", background: "#f5c542", boxShadow: "0 0 16px rgba(245,197,66,.55)" },
  trialList: {
    display: "grid",
    gap: "8px",
    listStyle: "none",
    margin: "16px 0 26px",
    padding: 0,
    maxWidth: "560px",
  },
  trialListItem: {
    color: "rgba(255,255,255,.78)",
    border: "1px solid rgba(255,255,255,.08)",
    borderRadius: "999px",
    padding: "9px 13px",
    background: "rgba(255,255,255,.035)",
    fontSize: "14px",
  },
  actionGroup: { display: "flex", flexWrap: "wrap", gap: "12px" },
  brandButtonPrimary: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "999px",
    background: "linear-gradient(135deg, #f5c542, #dfa837)",
    color: "#11151c",
    minHeight: "48px",
    padding: "0 22px",
    fontWeight: 900,
    boxShadow: "0 18px 42px rgba(245, 197, 66, 0.24)",
  },
  brandButtonSecondary: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    border: "1px solid rgba(255,255,255,.14)",
    borderRadius: "999px",
    background: "rgba(255,255,255,.06)",
    color: "#fff",
    minHeight: "48px",
    padding: "0 20px",
    fontWeight: 900,
  },
  arrow: { color: "#f5c542" },
  stationPanel: {
    position: "relative",
    overflow: "hidden",
    border: "1px solid rgba(245, 197, 66, 0.34)",
    borderRadius: "34px",
    background: "linear-gradient(180deg, rgba(17, 24, 39, 0.86), rgba(4, 7, 13, 0.94))",
    padding: "26px",
    boxShadow: "0 26px 90px rgba(0,0,0,.42), 0 0 64px rgba(245, 197, 66, 0.13)",
  },
  stationGlow: {
    position: "absolute",
    inset: "-35% -20% auto auto",
    width: "320px",
    height: "320px",
    background: "radial-gradient(circle, rgba(245,197,66,.2), transparent 65%)",
  },
  stationHeader: { position: "relative", zIndex: 1, marginBottom: "18px" },
  stationEyebrow: {
    color: "#f5c542",
    fontSize: "11px",
    fontWeight: 900,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
  },
  stationTitle: { color: "#fff", fontSize: "clamp(28px, 4vw, 44px)", lineHeight: 1, margin: "9px 0" },
  stationSubtitle: { color: "rgba(255,255,255,.66)", fontSize: "15px", lineHeight: 1.55, margin: 0 },
  telemetryVisual: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    alignItems: "end",
    gap: "10px",
    height: "92px",
    border: "1px solid rgba(255,255,255,.08)",
    borderRadius: "20px",
    padding: "14px",
    marginBottom: "14px",
    background: "linear-gradient(135deg, rgba(255,255,255,.05), rgba(245,197,66,.055))",
  },
  telemetryBar: {
    flex: 1,
    borderRadius: "999px 999px 6px 6px",
    background: "linear-gradient(180deg, #f5c542, rgba(245,197,66,.16))",
    boxShadow: "0 0 20px rgba(245,197,66,.3)",
  },
  stationTelemetryStrip: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    alignItems: "center",
    gap: "10px",
    border: "1px solid rgba(245, 197, 66, 0.22)",
    borderRadius: "999px",
    padding: "10px 14px",
    color: "rgba(255,255,255,.72)",
    background: "rgba(245,197,66,.07)",
    marginBottom: "16px",
  },
  telemetryDot: { width: "9px", height: "9px", borderRadius: "999px", background: "#34d399", boxShadow: "0 0 18px #34d399" },
  stationGrid: { position: "relative", zIndex: 1, display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "14px" },
  stationModuleCard: {
    position: "relative",
    minHeight: "158px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    border: "1px solid rgba(255,255,255,.12)",
    borderRadius: "22px",
    padding: "18px",
    background: "rgba(3, 7, 18, 0.68)",
  },
  stationModuleAccent: { width: "34px", height: "4px", borderRadius: "999px" },
  stationModuleTopline: { color: "rgba(255,255,255,.55)", fontSize: "10px", fontWeight: 900, letterSpacing: ".1em", textTransform: "uppercase" },
  stationModuleTitle: { color: "#fff", fontSize: "20px" },
  stationModuleSignal: { color: "#f5c542", fontSize: "13px", fontWeight: 900, marginTop: "auto" },
  stationModuleTelemetry: { color: "rgba(255,255,255,.52)", fontSize: "12px" },
};
