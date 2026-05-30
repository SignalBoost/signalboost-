"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { saasModules } from "@/lib/saas-modules";
import { stationaryWorkflows } from "@/lib/stationary-workflows";
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

export default function ConciergeHero({ lang = "en" }: ConciergeHeroProps) {
  const { t } = useTranslation();
  const stationModules = stationModuleSlugs
    .map((slug) => saasModules.find((module) => module.slug === slug))
    .filter((module): module is NonNullable<typeof module> => Boolean(module));
  const [selectedWorkflowSlug, setSelectedWorkflowSlug] = useState(stationaryWorkflows[0].slug);
  const [taskUsage, setTaskUsage] = useState<Record<string, number>>(() => {
    if (typeof window === "undefined") return {};
    try {
      return JSON.parse(window.localStorage.getItem("signalboost-stationary-workflow-usage") || "{}") as Record<string, number>;
    } catch {
      return {};
    }
  });
  const [showTrialModal, setShowTrialModal] = useState(false);

  const selectedWorkflow = useMemo(
    () => stationaryWorkflows.find((workflow) => workflow.slug === selectedWorkflowSlug) || stationaryWorkflows[0],
    [selectedWorkflowSlug]
  );
  const selectedUsage = taskUsage[selectedWorkflow.slug] || 0;
  const remainingTasks = Math.max(selectedWorkflow.freeTaskLimit - selectedUsage, 0);

  const runWorkflowTask = () => {
    const currentUsage = taskUsage[selectedWorkflow.slug] || 0;
    if (currentUsage >= selectedWorkflow.freeTaskLimit) {
      setShowTrialModal(true);
      return;
    }

    const nextUsage = currentUsage + 1;
    const nextTaskUsage = { ...taskUsage, [selectedWorkflow.slug]: nextUsage };
    setTaskUsage(nextTaskUsage);

    if (typeof window !== "undefined") {
      window.localStorage.setItem("signalboost-stationary-workflow-usage", JSON.stringify(nextTaskUsage));
    }

    if (nextUsage >= selectedWorkflow.freeTaskLimit) {
      setShowTrialModal(true);
    }
  };
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
                "Calendar, spreadsheets, reviews, and outreach stay in one highlighted operating dock."
              )}
            </p>
          </div>

          <div style={styles.stationTelemetryStrip} aria-label="SaaS station telemetry">
            <span style={styles.telemetryDot} />
            <strong>98.2%</strong>
            <span>{fallbackText(t("homepage.saasStationTelemetry"), "module sync health")}</span>
          </div>

          <div style={styles.stationWorkflowGrid} aria-label="Stationary SaaS Station workflows">
            {stationaryWorkflows.map((workflow) => {
              const used = taskUsage[workflow.slug] || 0;
              const isActive = workflow.slug === selectedWorkflow.slug;
              return (
                <button
                  aria-pressed={isActive}
                  key={workflow.slug}
                  onClick={() => setSelectedWorkflowSlug(workflow.slug)}
                  style={{
                    ...styles.workflowCard,
                    borderColor: isActive ? `${workflow.accent}cc` : "rgba(245, 197, 66, 0.24)",
                    boxShadow: isActive ? `0 0 32px ${workflow.accent}33` : "0 12px 32px rgba(0, 0, 0, 0.22)",
                  }}
                  type="button"
                >
                  <span style={{ ...styles.stationModuleAccent, background: workflow.accent }} />
                  <span style={styles.stationModuleTopline}>{workflow.connectors.slice(0, 2).map((connector) => connector.name).join(" + ")}</span>
                  <strong style={styles.workflowTitle}>{workflow.title}</strong>
                  <span style={styles.stationModuleSignal}>{Math.max(workflow.freeTaskLimit - used, 0)} free tasks left</span>
                </button>
              );
            })}
          </div>

          <div style={styles.workflowDetailPanel}>
            <div style={styles.workflowDetailHeader}>
              <div>
                <span style={styles.stationModuleTopline}>Concierge-guided workflow</span>
                <h3 style={styles.workflowDetailTitle}>{selectedWorkflow.title}</h3>
              </div>
              <span style={styles.trialBadge}>{remainingTasks}/3 free tasks</span>
            </div>

            <p style={styles.conciergePrompt}>{selectedWorkflow.conciergePrompt}</p>

            <div style={styles.telemetryGrid} aria-label={`${selectedWorkflow.title} telemetry`}>
              {selectedWorkflow.telemetry.map((item) => (
                <div style={styles.telemetryCard} key={item.label}>
                  <span style={styles.telemetryLabel}>{item.label}</span>
                  <strong style={styles.telemetryValue}>{item.value}</strong>
                  <small style={styles.telemetryDetail}>{item.detail}</small>
                </div>
              ))}
            </div>

            <div style={styles.connectorRail} aria-label={`${selectedWorkflow.title} connector integrations`}>
              {selectedWorkflow.connectors.map((connector) => (
                <span style={styles.connectorPill} key={`${selectedWorkflow.slug}-${connector.name}`}>
                  <span style={styles.connectorStatusDot} />
                  {connector.name}
                  <small>{connector.status}</small>
                </span>
              ))}
            </div>

            <div style={styles.workflowActions}>
              {selectedWorkflow.tasks.map((task) => (
                <span key={task} style={styles.taskChip}>{task}</span>
              ))}
            </div>

            <button onClick={runWorkflowTask} style={styles.runWorkflowButton} type="button">
              Ask Concierge to run next task
            </button>
          </div>

          <div style={styles.legacyModuleRow} aria-label="Original SaaS station module shortcuts">
            {stationModules.map((module) => (
              <Link href={module.href} key={module.slug} style={styles.legacyModuleLink}>
                {fallbackText(t(module.titleKey), module.title)} · {module.signal}
              </Link>
            ))}
          </div>

          {showTrialModal && (
            <div aria-modal="true" role="dialog" style={styles.modalBackdrop}>
              <div style={styles.trialModal}>
                <span style={styles.stationEyebrow}>Concierge says</span>
                <h3 style={styles.modalTitle}>Sign up to continue using your Stationary SaaS Station</h3>
                <p style={styles.modalCopy}>
                  You used the 3 free {selectedWorkflow.shortTitle} tasks. Create an account to save connector tokens in Supabase, or upgrade to Pro for unlimited Concierge-guided workflows.
                </p>
                <div style={styles.modalActions}>
                  <Link href="/auth/login?mode=signup" style={styles.modalPrimary}>Sign Up</Link>
                  <Link href="/pricing" style={styles.modalSecondary}>Upgrade to Pro</Link>
                </div>
                <button onClick={() => setShowTrialModal(false)} style={styles.modalDismiss} type="button">Close</button>
              </div>
            </div>
          )}
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
    margin: "24px 0 0"
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

  stationWorkflowGrid: {
    position: "relative",
    zIndex: 1,
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "12px"
  },
  workflowCard: {
    position: "relative",
    minHeight: "132px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    overflow: "hidden",
    padding: "16px",
    border: "1px solid rgba(245, 197, 66, 0.34)",
    borderRadius: "20px",
    background: "linear-gradient(180deg, rgba(255, 255, 255, 0.115), rgba(255, 255, 255, 0.045))",
    color: "#ffffff",
    textAlign: "left",
    cursor: "pointer",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease"
  },
  workflowTitle: {
    color: "#fff",
    fontSize: "17px",
    lineHeight: 1.06,
    letterSpacing: "-0.035em"
  },
  workflowDetailPanel: {
    position: "relative",
    zIndex: 1,
    marginTop: "16px",
    padding: "18px",
    borderRadius: "24px",
    border: "1px solid rgba(245, 197, 66, 0.28)",
    background: "linear-gradient(145deg, rgba(8, 10, 16, 0.72), rgba(245, 197, 66, 0.075))",
    boxShadow: "inset 0 0 38px rgba(245, 197, 66, 0.08)"
  },
  workflowDetailHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "12px"
  },
  workflowDetailTitle: {
    color: "#fff7db",
    fontSize: "25px",
    letterSpacing: "-0.04em",
    margin: "6px 0 0"
  },
  trialBadge: {
    flexShrink: 0,
    color: "#030305",
    background: "#f5c542",
    borderRadius: "999px",
    padding: "7px 10px",
    fontSize: "11px",
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.06em"
  },
  conciergePrompt: {
    color: "rgba(255, 248, 220, 0.78)",
    fontSize: "13px",
    lineHeight: 1.55,
    margin: "12px 0 16px"
  },
  telemetryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "10px",
    marginBottom: "12px"
  },
  telemetryCard: {
    border: "1px solid rgba(245, 197, 66, 0.22)",
    borderRadius: "16px",
    padding: "12px",
    background: "radial-gradient(circle at 20% 0%, rgba(245, 197, 66, 0.14), rgba(255, 255, 255, 0.035))",
    boxShadow: "0 0 24px rgba(245, 197, 66, 0.06)"
  },
  telemetryLabel: {
    display: "block",
    color: "rgba(255, 255, 255, 0.54)",
    fontSize: "10px",
    fontWeight: 800,
    letterSpacing: "0.12em",
    textTransform: "uppercase"
  },
  telemetryValue: {
    display: "block",
    color: "#f8d777",
    fontSize: "24px",
    margin: "3px 0"
  },
  telemetryDetail: {
    color: "rgba(255, 248, 220, 0.62)",
    lineHeight: 1.4
  },
  connectorRail: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    margin: "12px 0"
  },
  connectorPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    border: "1px solid rgba(245, 197, 66, 0.2)",
    borderRadius: "999px",
    padding: "7px 9px",
    color: "#fff7db",
    background: "rgba(0, 0, 0, 0.22)",
    fontSize: "12px",
    fontWeight: 800
  },
  connectorStatusDot: {
    width: "7px",
    height: "7px",
    borderRadius: "999px",
    background: "#34d399",
    boxShadow: "0 0 14px #34d399"
  },
  workflowActions: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginBottom: "14px"
  },
  taskChip: {
    color: "rgba(255, 248, 220, 0.72)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "10px",
    padding: "7px 9px",
    fontSize: "12px",
    background: "rgba(255, 255, 255, 0.035)"
  },
  runWorkflowButton: {
    width: "100%",
    border: "none",
    borderRadius: "14px",
    padding: "13px 16px",
    background: "linear-gradient(135deg, #f5c542, #dfa837)",
    color: "#030305",
    fontSize: "14px",
    fontWeight: 900,
    cursor: "pointer",
    boxShadow: "0 12px 34px rgba(245, 197, 66, 0.22)"
  },
  legacyModuleRow: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "14px"
  },
  legacyModuleLink: {
    color: "rgba(255, 248, 220, 0.72)",
    border: "1px solid rgba(245, 197, 66, 0.18)",
    borderRadius: "999px",
    padding: "7px 10px",
    textDecoration: "none",
    fontSize: "11px",
    fontWeight: 800,
    background: "rgba(255, 255, 255, 0.035)"
  },
  modalBackdrop: {
    position: "fixed",
    inset: 0,
    zIndex: 50,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    background: "rgba(0, 0, 0, 0.72)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)"
  },
  trialModal: {
    width: "min(480px, 100%)",
    border: "1px solid rgba(245, 197, 66, 0.52)",
    borderRadius: "28px",
    padding: "28px",
    background: "linear-gradient(145deg, rgba(43, 30, 8, 0.98), rgba(8, 10, 16, 0.98))",
    boxShadow: "0 0 70px rgba(245, 197, 66, 0.24), 0 30px 90px rgba(0, 0, 0, 0.64)",
    textAlign: "left"
  },
  modalTitle: {
    color: "#fff7db",
    fontSize: "30px",
    lineHeight: 1.05,
    letterSpacing: "-0.045em",
    margin: "10px 0 12px"
  },
  modalCopy: {
    color: "rgba(255, 248, 220, 0.74)",
    lineHeight: 1.6,
    margin: 0
  },
  modalActions: {
    display: "flex",
    gap: "10px",
    marginTop: "22px"
  },
  modalPrimary: {
    flex: 1,
    textAlign: "center",
    borderRadius: "12px",
    padding: "12px 14px",
    color: "#030305",
    background: "#f5c542",
    textDecoration: "none",
    fontWeight: 900
  },
  modalSecondary: {
    flex: 1,
    textAlign: "center",
    borderRadius: "12px",
    padding: "12px 14px",
    color: "#fff7db",
    border: "1px solid rgba(245, 197, 66, 0.28)",
    textDecoration: "none",
    fontWeight: 900
  },
  modalDismiss: {
    marginTop: "12px",
    width: "100%",
    border: "none",
    background: "transparent",
    color: "rgba(255, 248, 220, 0.62)",
    cursor: "pointer"
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
