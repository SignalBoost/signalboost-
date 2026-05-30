"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { stationWorkflows, workflowConnectorSecurityNotes } from "@/lib/station-workflows";
import useTranslation from "@/components/i18n/useTranslation";
import partners from "@/partners.json";

interface ConciergeHeroProps {
  lang?: string;
  regionName?: string;
  onSubmit?: (rawQuery: string) => Promise<void>;
  onChip?: (category: string) => void;
  onBrowseAll?: () => void;
}

type HeroPartner = {
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

function fallbackText(value: string, fallback: string) {
  return value.includes(".") ? fallback : value;
}

// ---- Hero partners: the star of the page ----------------------------------
// Pick ONE featured partner per category so the hero shows the breadth of the
// network (flights, hotels, eSIM, tours, transfers, car rentals...) instead of
// six lookalikes. Falls back gracefully if there aren't 6 distinct categories.
const partnerList = partners as HeroPartner[];
const heroPartners: HeroPartner[] = (() => {
  const pool = partnerList.filter((p) => p.featured);
  const source = pool.length ? pool : partnerList;
  const seenCategory = new Set<string>();
  const picked: HeroPartner[] = [];

  for (const partner of source) {
    const key = partner.category_key || partner.category || partner.id;
    if (!seenCategory.has(key)) {
      seenCategory.add(key);
      picked.push(partner);
    }
    if (picked.length >= 6) break;
  }
  if (picked.length < 6) {
    for (const partner of source) {
      if (!picked.includes(partner)) picked.push(partner);
      if (picked.length >= 6) break;
    }
  }
  return picked.slice(0, 6);
})();

// ---- Station tools: the pages that now live inside the SaaS Station --------
const stationTools = [
  { label: "Calendar", note: "Schedule & sync", href: "/calendar" },
  { label: "Spreadsheets", note: "Data & models", href: "/spreadsheets" },
  { label: "Reviews", note: "Reputation", href: "/reviews" },
  { label: "Outreach", note: "Campaigns", href: "/outreach" },
  { label: "Promote", note: "Marketing", href: "/promote" },
  { label: "Personal Assistant", note: "AI tasks", href: "/assistant" },
];

export default function ConciergeHero({ lang = "en" }: ConciergeHeroProps) {
  const { t } = useTranslation();
  const [taskCounts, setTaskCounts] = useState<Record<string, number>>({});
  const [activeWorkflow, setActiveWorkflow] = useState(stationWorkflows[0]);
  const [showTrialModal, setShowTrialModal] = useState(false);

  const connectorList = useMemo(
    () => Array.from(new Set(stationWorkflows.flatMap((workflow) => workflow.connectors))),
    []
  );

  const compactWorkflows = stationWorkflows.slice(0, 3);
  const visibleConnectors = connectorList.slice(0, 6);
  const extraConnectors = connectorList.length - visibleConnectors.length;

  const runWorkflowTask = (workflowSlug: string) => {
    const workflow = stationWorkflows.find((candidate) => candidate.slug === workflowSlug) || stationWorkflows[0];
    const nextCount = (taskCounts[workflowSlug] || 0) + 1;
    setActiveWorkflow(workflow);

    if (nextCount > workflow.trialLimit) {
      setShowTrialModal(true);
      return;
    }

    setTaskCounts((current) => ({ ...current, [workflowSlug]: nextCount }));
  };

  return (
    <section style={styles.heroSection} aria-labelledby="partner-hero-title">
      <div style={styles.glowLeft} aria-hidden="true" />
      <div style={styles.glowRight} aria-hidden="true" />
      <div style={styles.gridOverlay} aria-hidden="true" />

      <div className="sb-hero-shell">
        {/* ============ LEFT: PARTNERS — the hero / the star ============ */}
        <div style={styles.heroCopy}>
          <div style={styles.badgeContainer}>
            <span style={styles.badgePulse} />
            <span style={styles.badgeText}>Trusted partner network</span>
          </div>

          <h1 id="partner-hero-title" style={styles.mainHeading}>
            {fallbackText(t("homepage.partnerHeroTitle"), "Trusted partners, all in one place")}
          </h1>

          <p style={styles.subtext}>
            {fallbackText(
              t("homepage.partnerHeroSubtitle"),
              "Vetted, affiliate-backed partners across flights, hotels, eSIM, tours, car rentals and more — with credibility badges you can trust and one Concierge to guide you."
            )}
          </p>

          <div style={styles.partnerGrid} aria-label="Featured partners">
            {heroPartners.map((partner) => (
              <Link
                key={partner.id}
                href={`/partners/${partner.id}`}
                style={styles.partnerCard}
                aria-label={`${partner.name} partner`}
              >
                <span style={styles.partnerLogoBox}>
                  {partner.logo ? (
                    <img
                      src={`/logos/${partner.logo}`}
                      alt={`${partner.name} logo`}
                      loading="lazy"
                      style={styles.partnerLogoImg}
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    partner.name.charAt(0).toUpperCase()
                  )}
                </span>
                <span style={styles.partnerCardCopy}>
                  <span style={styles.partnerCardName}>{partner.name}</span>
                  <span style={styles.partnerCardMeta}>
                    {partner.category_label || partner.category || t("partner.category")}
                  </span>
                </span>
              </Link>
            ))}
          </div>

          <div style={styles.actionGroup}>
            <Link href="/marketplace" style={styles.brandButtonPrimary}>
              Browse the marketplace
            </Link>
            <Link href="/promote" style={styles.brandButtonSecondary}>
              Become a partner <span style={styles.arrow}>→</span>
            </Link>
          </div>

          <div style={styles.trustLine}>
            <span style={styles.trustDot} />
            Affiliate-backed credibility badges • Concierge-guided • Secure connector vault
          </div>
        </div>

        {/* ============ RIGHT: SaaS STATION — compact feature card ============ */}
        <aside
          className="saas-station-panel"
          style={styles.stationPanel}
          aria-label="SaaS Stationary Station feature"
        >
          <div style={styles.stationGlow} aria-hidden="true" />

          <div style={styles.stationHeader}>
            <span style={styles.stationEyebrow}>Feature • SaaS Station</span>
            <h2 style={styles.stationTitle}>
              {fallbackText(t("homepage.saasStationTitle"), "Your SaaS Stationary Station")}
            </h2>
            <p style={styles.stationSubtitle}>
              Your traditional office tasks — calendar, spreadsheets, reviews, outreach, promotion and assistant — in one
              gold cockpit with connector-backed telemetry.
            </p>
          </div>

          {/* Calendar / Spreadsheets / Reviews / Outreach — the station's core tools */}
          <div style={styles.toolsGrid} aria-label="Station tools">
            {stationTools.map((tool) => (
              <Link key={tool.href} href={tool.href} style={styles.toolTile}>
                <span style={styles.toolTileLabel}>{tool.label}</span>
                <span style={styles.toolTileNote}>{tool.note}</span>
              </Link>
            ))}
          </div>

          <div style={styles.stationTelemetryStrip} aria-label="SaaS station telemetry">
            <span style={styles.telemetryDot} />
            <strong>98.2%</strong>
            <span style={styles.telemetryStripText}>
              {fallbackText(t("homepage.saasStationTelemetry"), "sync health across finance, CRM, email & payments")}
            </span>
          </div>

          <div style={styles.connectorRail} aria-label="Connected SMB apps">
            {visibleConnectors.map((connector) => (
              <span key={connector} style={styles.connectorPill}>{connector}</span>
            ))}
            {extraConnectors > 0 && <span style={styles.connectorPill}>+{extraConnectors}</span>}
          </div>

          <div style={styles.compactWorkflowList} aria-label="Station workflows">
            {compactWorkflows.map((workflow) => {
              const used = taskCounts[workflow.slug] || 0;
              return (
                <button
                  type="button"
                  key={workflow.slug}
                  style={{ ...styles.compactWorkflowRow, borderColor: `${workflow.accent}55` }}
                  onClick={() => runWorkflowTask(workflow.slug)}
                  aria-label={`Run ${workflow.title} workflow task`}
                >
                  <span style={{ ...styles.workflowAccent, background: workflow.accent }} />
                  <span style={styles.workflowRowMain}>
                    <strong style={styles.workflowRowTitle}>{workflow.title}</strong>
                    <span style={styles.workflowRowMetric}>{workflow.metric}</span>
                  </span>
                  <span style={styles.workflowRowCounter}>{used}/{workflow.trialLimit}</span>
                </button>
              );
            })}
          </div>

          <div style={styles.stationFooter}>
            <Link href="/dashboard" style={styles.stationCta}>
              Open the station →
            </Link>
            <span style={styles.securityNote}>{workflowConnectorSecurityNotes[0]}</span>
          </div>
        </aside>
      </div>

      {showTrialModal && (
        <div style={styles.modalBackdrop} role="dialog" aria-modal="true" aria-labelledby="station-trial-title">
          <div style={styles.modalCard}>
            <span style={styles.modalEyebrow}>Concierge says</span>
            <h3 id="station-trial-title" style={styles.modalTitle}>Sign up to continue using your Stationary SaaS Station</h3>
            <p style={styles.modalCopy}>
              You have used the 3 free {activeWorkflow.title} tasks. Create an account to keep Concierge guidance,
              connector sync, and telemetry history active.
            </p>
            <div style={styles.modalActions}>
              <Link href="/auth/login" style={styles.brandButtonPrimary}>Sign Up</Link>
              <Link href="/pricing" style={styles.brandButtonSecondary}>Upgrade to Pro</Link>
              <button type="button" style={styles.modalDismiss} onClick={() => setShowTrialModal(false)}>Not now</button>
            </div>
          </div>
        </div>
      )}

      {/* Scoped responsive grid. Defined here (not in home.css) so the hero
          collapses cleanly on tablets/phones. Partners dominate; station is smaller. */}
      <style>{`
        .sb-hero-shell{
          position:relative;
          z-index:10;
          display:grid;
          grid-template-columns:minmax(0,1.35fr) minmax(0,0.65fr);
          gap:44px;
          align-items:center;
          max-width:1240px;
          margin:0 auto;
        }
        @media (max-width:1024px){
          .sb-hero-shell{
            grid-template-columns:1fr;
            gap:34px;
          }
        }
      `}</style>
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

  /* ---- badge ---- */
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
  badgePulse: { width: "8px", height: "8px", borderRadius: "999px", background: "#f5c542", boxShadow: "0 0 18px rgba(245, 197, 66, 0.9)" },
  badgeText: { color: "#f5c542", fontSize: "11px", fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase" },

  /* ---- hero headline / copy ---- */
  mainHeading: {
    color: "#fff",
    fontSize: "clamp(44px, 6vw, 84px)",
    lineHeight: 0.95,
    letterSpacing: "-0.045em",
    margin: "0 0 22px",
    textShadow: "0 0 44px rgba(245, 197, 66, 0.18)",
  },
  subtext: { maxWidth: "560px", color: "rgba(255, 255, 255, 0.72)", fontSize: "18px", lineHeight: 1.62, margin: "0 0 30px" },

  /* ---- featured partner grid (the star) ---- */
  partnerGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px", marginBottom: "30px" },
  partnerCard: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    border: "1px solid rgba(245, 197, 66, 0.16)",
    borderRadius: "16px",
    padding: "13px",
    background: "rgba(15, 15, 22, 0.72)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    boxShadow: "0 14px 40px rgba(0,0,0,.26), inset 0 1px 0 rgba(255,255,255,.05)",
    textDecoration: "none",
  },
  partnerLogoBox: {
    width: "44px",
    height: "44px",
    flexShrink: 0,
    borderRadius: "12px",
    background: "#fff",
    border: "1px solid rgba(245, 197, 66, 0.28)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#111827",
    fontWeight: 900,
    overflow: "hidden",
  },
  partnerLogoImg: { width: "30px", height: "30px", objectFit: "contain" },
  partnerCardCopy: { display: "flex", flexDirection: "column", minWidth: 0 },
  partnerCardName: { color: "#f8fafc", fontSize: "15px", fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  partnerCardMeta: { color: "#dfa837", fontSize: "11px", fontWeight: 800, marginTop: "3px" },

  /* ---- CTAs ---- */
  actionGroup: { display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "18px" },
  brandButtonPrimary: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "999px",
    border: 0,
    background: "linear-gradient(135deg, #f5c542, #dfa837)",
    color: "#11151c",
    minHeight: "48px",
    padding: "0 24px",
    fontWeight: 900,
    boxShadow: "0 18px 42px rgba(245, 197, 66, 0.24)",
    cursor: "pointer",
    textDecoration: "none",
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
    textDecoration: "none",
  },
  arrow: { color: "#f5c542" },
  trustLine: { display: "inline-flex", alignItems: "center", gap: "9px", color: "rgba(255,255,255,.55)", fontSize: "12.5px", fontWeight: 600 },
  trustDot: { width: "8px", height: "8px", borderRadius: "999px", background: "#34d399", boxShadow: "0 0 14px #34d399" },

  /* ---- compact SaaS station feature card ---- */
  stationPanel: {
    position: "relative",
    overflow: "hidden",
    width: "100%",
    maxWidth: "440px",
    marginLeft: "auto",
    border: "1px solid rgba(245, 197, 66, 0.30)",
    borderRadius: "26px",
    background: "linear-gradient(180deg, rgba(17, 24, 39, 0.86), rgba(4, 7, 13, 0.94))",
    padding: "22px",
    boxShadow: "0 22px 70px rgba(0,0,0,.42), 0 0 48px rgba(245, 197, 66, 0.1)",
  },
  stationGlow: { position: "absolute", inset: "-35% -20% auto auto", width: "260px", height: "260px", background: "radial-gradient(circle, rgba(245,197,66,.18), transparent 65%)", pointerEvents: "none" },
  stationHeader: { position: "relative", zIndex: 1, marginBottom: "16px" },
  stationEyebrow: { color: "#f5c542", fontSize: "10px", fontWeight: 900, letterSpacing: "0.18em", textTransform: "uppercase" },
  stationTitle: { color: "#fff", fontSize: "clamp(20px, 2.4vw, 26px)", lineHeight: 1.05, margin: "8px 0 6px" },
  stationSubtitle: { color: "rgba(255,255,255,.62)", fontSize: "13px", lineHeight: 1.5, margin: 0 },

  /* ---- station tools (Calendar / Spreadsheets / Reviews / Outreach) ---- */
  toolsGrid: { position: "relative", zIndex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "9px", marginBottom: "16px" },
  toolTile: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    textDecoration: "none",
    border: "1px solid rgba(245,197,66,.18)",
    borderRadius: "14px",
    padding: "13px",
    background: "rgba(245,197,66,.05)",
    minHeight: "64px",
    justifyContent: "center",
  },
  toolTileLabel: { color: "#fff", fontSize: "14px", fontWeight: 800 },
  toolTileNote: { color: "rgba(255,255,255,.55)", fontSize: "11px", fontWeight: 600 },

  stationTelemetryStrip: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    alignItems: "center",
    gap: "9px",
    border: "1px solid rgba(245, 197, 66, 0.22)",
    borderRadius: "999px",
    padding: "9px 13px",
    color: "rgba(255,255,255,.72)",
    background: "rgba(245,197,66,.07)",
    marginBottom: "12px",
    fontSize: "13px",
  },
  telemetryDot: { width: "9px", height: "9px", borderRadius: "999px", background: "#34d399", boxShadow: "0 0 18px #34d399", flexShrink: 0 },
  telemetryStripText: { color: "rgba(255,255,255,.6)", fontSize: "12px", lineHeight: 1.35 },

  connectorRail: { position: "relative", zIndex: 1, display: "flex", flexWrap: "wrap", gap: "7px", marginBottom: "14px" },
  connectorPill: { color: "#f5c542", fontSize: "10.5px", fontWeight: 900, border: "1px solid rgba(245,197,66,.2)", borderRadius: "999px", padding: "6px 9px", background: "rgba(245,197,66,.055)" },

  compactWorkflowList: { position: "relative", zIndex: 1, display: "grid", gap: "8px", marginBottom: "16px" },
  compactWorkflowRow: {
    display: "flex",
    alignItems: "center",
    gap: "11px",
    width: "100%",
    textAlign: "left",
    cursor: "pointer",
    border: "1px solid rgba(255,255,255,.12)",
    borderRadius: "14px",
    padding: "11px 13px",
    background: "rgba(3, 7, 18, 0.6)",
  },
  workflowAccent: { width: "4px", height: "30px", borderRadius: "999px", flexShrink: 0 },
  workflowRowMain: { display: "flex", flexDirection: "column", minWidth: 0, flex: 1 },
  workflowRowTitle: { color: "#fff", fontSize: "14px", fontWeight: 800 },
  workflowRowMetric: { color: "#f5c542", fontSize: "11px", fontWeight: 800, marginTop: "2px" },
  workflowRowCounter: { color: "rgba(34,211,238,.86)", fontSize: "11px", fontWeight: 900, flexShrink: 0 },

  stationFooter: { position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: "8px" },
  stationCta: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "999px",
    background: "linear-gradient(135deg, #f5c542, #dfa837)",
    color: "#11151c",
    minHeight: "44px",
    padding: "0 18px",
    fontWeight: 900,
    fontSize: "13px",
    textDecoration: "none",
  },
  securityNote: { color: "rgba(255,255,255,.5)", fontSize: "11px", lineHeight: 1.35, textAlign: "center" },

  /* ---- trial modal (unchanged) ---- */
  modalBackdrop: { position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", background: "rgba(0,0,0,.72)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" },
  modalCard: { width: "min(520px, 100%)", border: "1px solid rgba(245,197,66,.38)", borderRadius: "28px", padding: "28px", background: "linear-gradient(180deg, rgba(17,24,39,.98), rgba(3,7,18,.98))", boxShadow: "0 0 80px rgba(245,197,66,.2)" },
  modalEyebrow: { color: "#f5c542", fontSize: "11px", fontWeight: 900, letterSpacing: ".16em", textTransform: "uppercase" },
  modalTitle: { color: "#fff", fontSize: "30px", lineHeight: 1.05, margin: "10px 0 12px" },
  modalCopy: { color: "rgba(255,255,255,.68)", fontSize: "15px", lineHeight: 1.6, margin: "0 0 22px" },
  modalActions: { display: "flex", flexWrap: "wrap", gap: "10px" },
  modalDismiss: { border: 0, background: "transparent", color: "rgba(255,255,255,.62)", fontWeight: 900, padding: "0 8px", cursor: "pointer" },
};
