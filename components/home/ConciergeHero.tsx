"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  stationWorkflows,
  workflowConnectorSecurityNotes,
} from "@/lib/station-workflows";
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

const trialTasks = [
  "Calendar booking audit",
  "Spreadsheet cleanup",
  "Review reply draft",
  "Outreach sequence test",
];
const stationaryModuleSlugs = new Set([
  "calendar",
  "spreadsheets",
  "reviews",
  "outreach",
]);
const stationaryModules = saasModules.filter((module) =>
  stationaryModuleSlugs.has(module.slug),
);
const telemetryDeck = [
  {
    label: "Sync health",
    value: "98.2%",
    detail: "QuickBooks + HubSpot nominal",
  },
  {
    label: "Overdue invoices",
    value: "7",
    detail: "PayPal, Stripe, Square watch",
  },
  { label: "Reply rate", value: "31%", detail: "Gmail/Outlook campaigns" },
];

export default function ConciergeHero({ lang = "en" }: ConciergeHeroProps) {
  const { t } = useTranslation();
  const [taskCounts, setTaskCounts] = useState<Record<string, number>>({});
  const [activeWorkflow, setActiveWorkflow] = useState(stationWorkflows[0]);
  const [showTrialModal, setShowTrialModal] = useState(false);

  const connectorList = useMemo(
    () =>
      Array.from(
        new Set(stationWorkflows.flatMap((workflow) => workflow.connectors)),
      ),
    [],
  );

  const runWorkflowTask = (workflowSlug: string) => {
    const workflow =
      stationWorkflows.find((candidate) => candidate.slug === workflowSlug) ||
      stationWorkflows[0];
    const nextCount = (taskCounts[workflowSlug] || 0) + 1;
    setActiveWorkflow(workflow);

    if (nextCount > workflow.trialLimit) {
      setShowTrialModal(true);
      return;
    }

    setTaskCounts((current) => ({ ...current, [workflowSlug]: nextCount }));
  };

  return (
    <section
      style={styles.heroSection}
      aria-labelledby="saas-station-hero-title"
    >
      <div style={styles.glowLeft} aria-hidden="true" />
      <div style={styles.glowRight} aria-hidden="true" />
      <div style={styles.gridOverlay} aria-hidden="true" />

      <div className="concierge-hero-layout" style={styles.innerContainer}>
        <div style={styles.heroCopy}>
          <div style={styles.badgeContainer}>
            <span style={styles.badgePulse} />
            <span style={styles.badgeText}>
              Gold cockpit • SaaS Station online
            </span>
          </div>

          <h1 id="saas-station-hero-title" style={styles.mainHeading}>
            {fallbackText(
              t("homepage.saasStationTitle"),
              "Your SaaS Stationary Station",
            )}
          </h1>

          <p style={styles.subtext}>
            Concierge now guides payroll, close, growth, weekly reporting, tax,
            and contract workflows with connector-backed telemetry, secure
            Supabase token vaulting, and cockpit-style trial gates.
          </p>

          <div style={styles.conciergePanel}>
            <span style={styles.conciergeAvatar}>✦</span>
            <span>
              <strong style={styles.conciergeTitle}>Concierge guide</strong>
              <span style={styles.conciergeCopy}>
                {activeWorkflow.conciergePrompt}
              </span>
            </span>
          </div>

          <div style={styles.actionGroup}>
            <button
              type="button"
              style={styles.brandButtonPrimary}
              onClick={() => runWorkflowTask(activeWorkflow.slug)}
            >
              Run Concierge workflow
            </button>
            <Link href="/pricing" style={styles.brandButtonSecondary}>
              Upgrade to Pro <span style={styles.arrow}>→</span>
            </Link>
          </div>
        </div>

        <aside
          className="saas-station-panel"
          style={styles.stationPanel}
          aria-label="Your SaaS Stationary Station workflow cockpit"
        >
          <div style={styles.stationGlow} aria-hidden="true" />
          <div style={styles.stationHeader}>
            <span style={styles.stationEyebrow}>Live SMB telemetry</span>
            <h2 style={styles.stationTitle}>Your SaaS Stationary Station</h2>
            <p style={styles.stationSubtitle}>
              Calendar, Spreadsheets, Reviews, and Outreach now live inside the
              Stationary cockpit with connector health, trial usage, and
              Concierge next steps.
            </p>
          </div>

          <div style={styles.trialPanel} aria-label="Stationary trial gating">
            <div>
              <span style={styles.trialEyebrow}>Trial gate</span>
              <strong style={styles.trialTitle}>
                3 free tasks per workflow, then sign-up required
              </strong>
            </div>
            <div style={styles.trialDots} aria-hidden="true">
              <span style={styles.trialDot} />
              <span style={styles.trialDot} />
              <span style={styles.trialDot} />
            </div>
          </div>

          <ul
            style={styles.trialList}
            aria-label="Included Stationary free tasks"
          >
            {trialTasks.map((task) => (
              <li key={task} style={styles.trialListItem}>
                {task}
              </li>
            ))}
          </ul>

          <div
            style={styles.telemetryVisual}
            aria-label="Station telemetry visuals"
          >
            {telemetryDeck.map((item, index) => (
              <div key={item.label} style={styles.telemetryCard}>
                <span style={styles.telemetryCardLabel}>{item.label}</span>
                <strong style={styles.telemetryCardValue}>{item.value}</strong>
                <span style={styles.telemetryCardDetail}>{item.detail}</span>
                <span
                  style={{
                    ...styles.telemetryBeam,
                    width: `${62 + index * 14}%`,
                  }}
                />
              </div>
            ))}
          </div>

          <div
            style={styles.stationTelemetryStrip}
            aria-label="SaaS station telemetry"
          >
            <span style={styles.telemetryDot} />
            <strong>98.2%</strong>
            <span>
              {fallbackText(
                t("homepage.saasStationTelemetry"),
                "sync health across finance, CRM, email, payments, and contracts",
              )}
            </span>
          </div>

          <div style={styles.connectorRail} aria-label="Connected SMB apps">
            {connectorList.map((connector) => (
              <span key={connector} style={styles.connectorPill}>
                {connector}
              </span>
            ))}
          </div>

          <div style={styles.moduleSectionHeader}>Stationary modules</div>
          <div
            style={styles.moduleAccessGrid}
            aria-label="Calendar, Spreadsheets, Reviews, and Outreach modules"
          >
            {stationaryModules.map((module) => (
              <Link
                key={module.slug}
                href={module.href}
                style={{
                  ...styles.stationModuleCard,
                  ...styles.moduleAccessCard,
                  borderColor: `${module.accent}7a`,
                  boxShadow: `0 18px 48px ${module.accent}20, inset 0 1px 0 rgba(255,255,255,.08)`,
                }}
                aria-label={`Open ${module.title} Stationary module`}
              >
                <span
                  style={{
                    ...styles.stationModuleAccent,
                    background: module.accent,
                  }}
                />
                <span style={styles.stationModuleTopline}>
                  {module.eyebrow}
                </span>
                <strong style={styles.stationModuleTitle}>
                  {module.title}
                </strong>
                <span style={styles.stationModuleSignal}>{module.signal}</span>
                <span style={styles.stationModuleTelemetry}>
                  {module.telemetry}
                </span>
                <span style={styles.trialCounter}>Station cockpit module</span>
              </Link>
            ))}
          </div>

          <div style={styles.moduleSectionHeader}>Concierge workflows</div>
          <div style={styles.stationGrid}>
            {stationWorkflows.map((workflow) => {
              const used = taskCounts[workflow.slug] || 0;
              return (
                <button
                  type="button"
                  key={workflow.slug}
                  style={{
                    ...styles.stationModuleCard,
                    borderColor: `${workflow.accent}7a`,
                    boxShadow: `0 18px 48px ${workflow.accent}20, inset 0 1px 0 rgba(255,255,255,.08)`,
                  }}
                  onClick={() => runWorkflowTask(workflow.slug)}
                  aria-label={`Run ${workflow.title} workflow task`}
                >
                  <span
                    style={{
                      ...styles.stationModuleAccent,
                      background: workflow.accent,
                    }}
                  />
                  <span style={styles.stationModuleTopline}>
                    {workflow.connectors.join(" + ")}
                  </span>
                  <strong style={styles.stationModuleTitle}>
                    {workflow.title}
                  </strong>
                  <span style={styles.stationModuleSignal}>
                    {workflow.metric}
                  </span>
                  <span style={styles.stationModuleTelemetry}>
                    {workflow.telemetry}
                  </span>
                  <span style={styles.trialCounter}>
                    {used}/{workflow.trialLimit} free tasks used
                  </span>
                </button>
              );
            })}
          </div>

          <div
            style={styles.securityPanel}
            aria-label="Secure Supabase token storage"
          >
            <strong style={styles.securityTitle}>Secure connector vault</strong>
            {workflowConnectorSecurityNotes.map((note) => (
              <span key={note} style={styles.securityNote}>
                {note}
              </span>
            ))}
          </div>
        </aside>
      </div>

      {showTrialModal && (
        <div
          style={styles.modalBackdrop}
          role="dialog"
          aria-modal="true"
          aria-labelledby="station-trial-title"
        >
          <div style={styles.modalCard}>
            <span style={styles.modalEyebrow}>Concierge says</span>
            <h3 id="station-trial-title" style={styles.modalTitle}>
              Sign up to continue using your Stationary SaaS Station
            </h3>
            <p style={styles.modalCopy}>
              You have used the 3 free {activeWorkflow.title} tasks. Create an
              account to keep Concierge guidance, connector sync, and telemetry
              history active.
            </p>
            <div style={styles.modalActions}>
              <Link href="/auth/login" style={styles.brandButtonPrimary}>
                Sign Up
              </Link>
              <Link href="/pricing" style={styles.brandButtonSecondary}>
                Upgrade to Pro
              </Link>
              <button
                type="button"
                style={styles.modalDismiss}
                onClick={() => setShowTrialModal(false)}
              >
                Not now
              </button>
            </div>
          </div>
        </div>
      )}
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
    gridTemplateColumns: "minmax(0, 0.86fr) minmax(420px, 1.14fr)",
    gap: "34px",
    alignItems: "center",
    maxWidth: "1240px",
    margin: "0 auto",
  },
  heroCopy: { textAlign: "left" },
  glowLeft: {
    position: "absolute",
    top: "-14%",
    left: "8%",
    width: "520px",
    height: "520px",
    background:
      "radial-gradient(circle, rgba(245, 197, 66, 0.16) 0%, transparent 68%)",
    pointerEvents: "none",
  },
  glowRight: {
    position: "absolute",
    top: "8%",
    right: "8%",
    width: "620px",
    height: "620px",
    background:
      "radial-gradient(circle, rgba(34, 211, 238, 0.1) 0%, transparent 62%)",
    pointerEvents: "none",
  },
  gridOverlay: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(245, 197, 66, 0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(245, 197, 66, 0.035) 1px, transparent 1px)",
    backgroundSize: "44px 44px",
    maskImage: "radial-gradient(circle at 50% 38%, black, transparent 74%)",
    WebkitMaskImage:
      "radial-gradient(circle at 50% 38%, black, transparent 74%)",
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
    background:
      "linear-gradient(135deg, rgba(245, 197, 66, 0.14), rgba(255,255,255,0.04))",
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
  trialTitle: {
    display: "block",
    color: "#fff",
    fontSize: "18px",
    marginTop: "3px",
  },
  trialDots: { display: "flex", gap: "8px" },
  trialDot: {
    width: "13px",
    height: "13px",
    borderRadius: "999px",
    background: "#f5c542",
    boxShadow: "0 0 16px rgba(245,197,66,.55)",
  },
  trialList: {
    display: "grid",
    gap: "8px",
    listStyle: "none",
    margin: "16px 0 16px",
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
  conciergePanel: {
    display: "flex",
    gap: "13px",
    maxWidth: "560px",
    border: "1px solid rgba(34,211,238,.22)",
    borderRadius: "20px",
    background: "rgba(34,211,238,.065)",
    padding: "14px 16px",
    marginBottom: "24px",
  },
  conciergeAvatar: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "34px",
    height: "34px",
    borderRadius: "999px",
    color: "#06121a",
    background: "linear-gradient(135deg, #22d3ee, #f5c542)",
    boxShadow: "0 0 24px rgba(34,211,238,.35)",
    flexShrink: 0,
  },
  conciergeTitle: { display: "block", color: "#fff", fontSize: "14px" },
  conciergeCopy: {
    display: "block",
    color: "rgba(255,255,255,.66)",
    fontSize: "13px",
    lineHeight: 1.5,
    marginTop: "3px",
  },
  actionGroup: { display: "flex", flexWrap: "wrap", gap: "12px" },
  brandButtonPrimary: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "999px",
    border: 0,
    background: "linear-gradient(135deg, #f5c542, #dfa837)",
    color: "#11151c",
    minHeight: "48px",
    padding: "0 22px",
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
  stationPanel: {
    position: "relative",
    overflow: "hidden",
    border: "1px solid rgba(245, 197, 66, 0.34)",
    borderRadius: "34px",
    background:
      "linear-gradient(180deg, rgba(17, 24, 39, 0.86), rgba(4, 7, 13, 0.94))",
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
  stationTitle: {
    color: "#fff",
    fontSize: "clamp(28px, 4vw, 44px)",
    lineHeight: 1,
    margin: "9px 0",
  },
  stationSubtitle: {
    color: "rgba(255,255,255,.66)",
    fontSize: "15px",
    lineHeight: 1.55,
    margin: 0,
  },
  telemetryVisual: {
    position: "relative",
    zIndex: 1,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
    gap: "10px",
    marginBottom: "14px",
  },
  telemetryCard: {
    position: "relative",
    overflow: "hidden",
    border: "1px solid rgba(245,197,66,.18)",
    borderRadius: "18px",
    padding: "13px",
    background:
      "linear-gradient(135deg, rgba(255,255,255,.055), rgba(245,197,66,.045))",
    minHeight: "112px",
  },
  telemetryCardLabel: {
    display: "block",
    color: "rgba(255,255,255,.52)",
    fontSize: "10px",
    fontWeight: 900,
    letterSpacing: ".11em",
    textTransform: "uppercase",
  },
  telemetryCardValue: {
    display: "block",
    color: "#fff",
    fontSize: "26px",
    marginTop: "8px",
  },
  telemetryCardDetail: {
    display: "block",
    color: "rgba(255,255,255,.58)",
    fontSize: "11px",
    lineHeight: 1.35,
    marginTop: "4px",
  },
  telemetryBeam: {
    position: "absolute",
    left: "13px",
    bottom: "11px",
    height: "4px",
    borderRadius: "999px",
    background: "linear-gradient(90deg, #f5c542, rgba(34,211,238,.65))",
    boxShadow: "0 0 18px rgba(245,197,66,.45)",
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
    marginBottom: "12px",
  },
  telemetryDot: {
    width: "9px",
    height: "9px",
    borderRadius: "999px",
    background: "#34d399",
    boxShadow: "0 0 18px #34d399",
  },
  connectorRail: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginBottom: "16px",
  },
  connectorPill: {
    color: "#f5c542",
    fontSize: "11px",
    fontWeight: 900,
    border: "1px solid rgba(245,197,66,.2)",
    borderRadius: "999px",
    padding: "7px 10px",
    background: "rgba(245,197,66,.055)",
  },
  moduleSectionHeader: {
    position: "relative",
    zIndex: 1,
    color: "#f5c542",
    fontSize: "11px",
    fontWeight: 900,
    letterSpacing: ".14em",
    textTransform: "uppercase",
    marginTop: "16px",
  },
  moduleAccessGrid: {
    position: "relative",
    zIndex: 1,
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "14px",
  },
  moduleAccessCard: { textDecoration: "none", cursor: "pointer" },
  stationGrid: {
    position: "relative",
    zIndex: 1,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
    gap: "14px",
  },
  stationModuleCard: {
    position: "relative",
    minHeight: "178px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    textAlign: "left",
    border: "1px solid rgba(255,255,255,.12)",
    borderRadius: "22px",
    padding: "18px",
    background: "rgba(3, 7, 18, 0.68)",
    cursor: "pointer",
  },
  stationModuleAccent: { width: "34px", height: "4px", borderRadius: "999px" },
  stationModuleTopline: {
    color: "rgba(255,255,255,.55)",
    fontSize: "10px",
    fontWeight: 900,
    letterSpacing: ".1em",
    textTransform: "uppercase",
  },
  stationModuleTitle: { color: "#fff", fontSize: "20px" },
  stationModuleSignal: {
    color: "#f5c542",
    fontSize: "13px",
    fontWeight: 900,
    marginTop: "auto",
  },
  stationModuleTelemetry: { color: "rgba(255,255,255,.52)", fontSize: "12px" },
  trialCounter: {
    color: "rgba(34,211,238,.86)",
    fontSize: "11px",
    fontWeight: 900,
  },
  securityPanel: {
    position: "relative",
    zIndex: 1,
    display: "grid",
    gap: "6px",
    border: "1px solid rgba(34,211,238,.16)",
    borderRadius: "18px",
    padding: "14px",
    marginTop: "14px",
    background: "rgba(34,211,238,.045)",
  },
  securityTitle: { color: "#fff", fontSize: "13px" },
  securityNote: {
    color: "rgba(255,255,255,.56)",
    fontSize: "11px",
    lineHeight: 1.35,
  },
  modalBackdrop: {
    position: "fixed",
    inset: 0,
    zIndex: 50,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    background: "rgba(0,0,0,.72)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
  },
  modalCard: {
    width: "min(520px, 100%)",
    border: "1px solid rgba(245,197,66,.38)",
    borderRadius: "28px",
    padding: "28px",
    background: "linear-gradient(180deg, rgba(17,24,39,.98), rgba(3,7,18,.98))",
    boxShadow: "0 0 80px rgba(245,197,66,.2)",
  },
  modalEyebrow: {
    color: "#f5c542",
    fontSize: "11px",
    fontWeight: 900,
    letterSpacing: ".16em",
    textTransform: "uppercase",
  },
  modalTitle: {
    color: "#fff",
    fontSize: "30px",
    lineHeight: 1.05,
    margin: "10px 0 12px",
  },
  modalCopy: {
    color: "rgba(255,255,255,.68)",
    fontSize: "15px",
    lineHeight: 1.6,
    margin: "0 0 22px",
  },
  modalActions: { display: "flex", flexWrap: "wrap", gap: "10px" },
  modalDismiss: {
    border: 0,
    background: "transparent",
    color: "rgba(255,255,255,.62)",
    fontWeight: 900,
    padding: "0 8px",
    cursor: "pointer",
  },
};
