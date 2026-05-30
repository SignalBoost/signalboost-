"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
import partnersJson from "@/public/partners.json";
import useTranslation from "@/components/i18n/useTranslation";
import { saasModules } from "@/lib/saas-modules";

type Partner = {
  id: string;
  name: string;
  logo?: string;
  description?: string;
  network?: string;
  category_label?: string;
  category?: string;
  featured?: boolean;
  tier?: number;
};

const TRIAL_LIMIT = 3;
const STORAGE_KEY = "signalboost_stationary_station_trial_tasks";
const stationSlugs = new Set(["calendar", "spreadsheets", "reviews", "outreach"]);

function fallbackText(value: string, fallback: string) {
  return value.includes(".") ? fallback : value;
}

function partnerLogoSrc(logo?: string) {
  return logo ? `/logos/${logo}` : "";
}

export default function StationaryStationHeroPanel() {
  const { t } = useTranslation();
  const [tasksUsed, setTasksUsed] = useState(0);
  const [activeModule, setActiveModule] = useState("calendar");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const parsed = Number.parseInt(stored || "0", 10);
    if (Number.isFinite(parsed)) setTasksUsed(Math.min(Math.max(parsed, 0), TRIAL_LIMIT));
  }, []);

  const stationModules = useMemo(
    () => saasModules.filter((module) => stationSlugs.has(module.slug)),
    [],
  );

  const partners = useMemo(
    () =>
      (partnersJson as Partner[])
        .filter((partner) => partner.featured)
        .sort((a, b) => (a.tier ?? 99) - (b.tier ?? 99))
        .slice(0, 4),
    [],
  );

  const tasksRemaining = Math.max(TRIAL_LIMIT - tasksUsed, 0);
  const trialStatus = fallbackText(
    t("station.trialStatus"),
    "{remaining} of {limit} free tasks remaining",
  )
    .replace("{remaining}", String(tasksRemaining))
    .replace("{limit}", String(TRIAL_LIMIT));

  const runTrialTask = (slug: string) => {
    setActiveModule(slug);
    if (tasksUsed >= TRIAL_LIMIT) {
      setShowModal(true);
      return;
    }

    const nextUsage = tasksUsed + 1;
    setTasksUsed(nextUsage);
    window.localStorage.setItem(STORAGE_KEY, String(nextUsage));
    if (nextUsage >= TRIAL_LIMIT) setShowModal(true);
  };

  return (
    <aside style={styles.panel} aria-labelledby="station-title">
      <div style={styles.telemetryGlow} />
      <div style={styles.panelHeader}>
        <span style={styles.eyebrow}>{fallbackText(t("station.eyebrow"), "Hero workspace")}</span>
        <h2 id="station-title" style={styles.title}>
          {fallbackText(t("station.title"), "Your SaaS Stationary Station")}
        </h2>
        <p style={styles.description}>
          {fallbackText(
            t("station.description"),
            "Let Concierge guide three free trial tasks across scheduling, sheets, reviews, and outreach before sign-up.",
          )}
        </p>
      </div>

      <div style={styles.telemetryGrid} aria-label="Station telemetry">
        <div style={styles.telemetryCard}>
          <span style={styles.telemetryValue}>{TRIAL_LIMIT}</span>
          <span style={styles.telemetryLabel}>{fallbackText(t("station.freeTasks"), "free tasks")}</span>
        </div>
        <div style={styles.telemetryCard}>
          <span style={styles.telemetryValue}>{tasksRemaining}</span>
          <span style={styles.telemetryLabel}>{fallbackText(t("station.remaining"), "remaining")}</span>
        </div>
        <div style={styles.telemetryCard}>
          <span style={styles.telemetryValue}>4</span>
          <span style={styles.telemetryLabel}>{fallbackText(t("station.modules"), "modules")}</span>
        </div>
      </div>

      <div style={styles.conciergeStrip}>
        <span style={styles.conciergeOrb}>✦</span>
        <div>
          <strong style={styles.conciergeTitle}>{fallbackText(t("station.conciergeTitle"), "Concierge guidance")}</strong>
          <p style={styles.conciergeText}>
            {tasksUsed >= TRIAL_LIMIT
              ? fallbackText(t("station.conciergeLimit"), "Concierge says: sign up to keep your Stationary SaaS Station running.")
              : fallbackText(t("station.conciergeGuide"), "Concierge will walk you through the next trial task and save the context locally.")}
          </p>
        </div>
      </div>

      <div style={styles.moduleStack}>
        {stationModules.map((module) => {
          const active = activeModule === module.slug;
          return (
            <button
              key={module.slug}
              type="button"
              onClick={() => runTrialTask(module.slug)}
              style={{
                ...styles.moduleButton,
                borderColor: active ? module.accent : "rgba(255,255,255,0.08)",
                boxShadow: active ? `0 0 24px ${module.accent}30` : "none",
              }}
            >
              <span style={{ ...styles.moduleDot, backgroundColor: module.accent }} />
              <span style={styles.moduleCopy}>
                <strong>{fallbackText(t(module.titleKey), module.title)}</strong>
                <small>{fallbackText(t(module.summaryKey), module.summary)}</small>
              </span>
              <span style={styles.moduleSignal}>{module.signal}</span>
            </button>
          );
        })}
      </div>

      <div style={styles.trialFooter}>
        <div>
          <strong style={styles.trialStatus}>{trialStatus}</strong>
          <p style={styles.trialNote}>{fallbackText(t("station.trialNote"), "No account needed until task four.")}</p>
        </div>
        <button type="button" onClick={() => runTrialTask(activeModule)} style={styles.runButton}>
          {fallbackText(t("station.startTask"), "Run trial task")}
        </button>
      </div>

      <div style={styles.partnerSection}>
        <span style={styles.partnerEyebrow}>{fallbackText(t("station.partnersTitle"), "Credibility badges")}</span>
        <div style={styles.partnerGrid}>
          {partners.map((partner) => (
            <Link key={partner.id} href={`/partners/${partner.id}`} style={styles.partnerBadge} title={partner.description}>
              <span style={styles.logoChip}>
                {partner.logo ? (
                  <img
                    src={partnerLogoSrc(partner.logo)}
                    alt={`${partner.name} logo`}
                    loading="lazy"
                    style={styles.logoImage}
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                      const fallback = event.currentTarget.nextElementSibling;
                      if (fallback instanceof HTMLElement) fallback.style.display = "inline";
                    }}
                  />
                ) : null}
                <span style={styles.logoFallback} aria-hidden="true">
                  {partner.name.charAt(0).toUpperCase()}
                </span>
              </span>
              <span style={styles.partnerCopy}>
                <strong>{partner.name}</strong>
                <small>{partner.description || partner.network || partner.category_label || partner.category}</small>
              </span>
            </Link>
          ))}
        </div>
      </div>

      {showModal ? (
        <div style={styles.modalBackdrop} role="dialog" aria-modal="true" aria-labelledby="station-trial-modal-title">
          <div style={styles.modalCard}>
            <button type="button" onClick={() => setShowModal(false)} style={styles.modalClose} aria-label="Close trial modal">
              ×
            </button>
            <span style={styles.modalEyebrow}>{fallbackText(t("station.trialComplete"), "Trial limit reached")}</span>
            <h3 id="station-trial-modal-title" style={styles.modalTitle}>
              {fallbackText(t("station.limitModalTitle"), "Sign up to continue using your Stationary SaaS Station")}
            </h3>
            <p style={styles.modalText}>
              {fallbackText(
                t("station.limitModalBody"),
                "Concierge has saved your first three guided tasks. Create an account or upgrade to Pro to keep operating.",
              )}
            </p>
            <div style={styles.modalActions}>
              <Link href="/auth/login?mode=signup&next=/" style={styles.modalPrimary}>
                {fallbackText(t("station.signUp"), "Sign Up")}
              </Link>
              <Link href="/pricing" style={styles.modalSecondary}>
                {fallbackText(t("station.upgradePro"), "Upgrade to Pro")}
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </aside>
  );
}

const styles: Record<string, CSSProperties> = {
  panel: {
    position: "relative",
    overflow: "hidden",
    border: "1px solid rgba(223,168,55,0.35)",
    borderRadius: "28px",
    background: "linear-gradient(145deg, rgba(20,18,12,0.94), rgba(7,9,14,0.96) 55%, rgba(3,3,5,0.98))",
    boxShadow: "0 30px 90px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.08)",
    padding: "28px",
    textAlign: "left",
    minHeight: "620px",
  },
  telemetryGlow: {
    position: "absolute",
    inset: "-20% -10% auto auto",
    width: "260px",
    height: "260px",
    background: "radial-gradient(circle, rgba(223,168,55,0.28), transparent 68%)",
    pointerEvents: "none",
  },
  panelHeader: { position: "relative", zIndex: 1 },
  eyebrow: { color: "#dfa837", fontSize: "11px", fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase" },
  title: { color: "#fff8dc", fontSize: "34px", lineHeight: 1, letterSpacing: "-0.04em", margin: "12px 0" },
  description: { color: "#b9c2d0", fontSize: "14px", lineHeight: 1.6, margin: 0 },
  telemetryGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", margin: "22px 0" },
  telemetryCard: { border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "12px", background: "rgba(255,255,255,0.035)" },
  telemetryValue: { display: "block", color: "#fff", fontSize: "24px", fontWeight: 800 },
  telemetryLabel: { color: "#94a3b8", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.08em" },
  conciergeStrip: { display: "flex", gap: "12px", alignItems: "flex-start", padding: "14px", borderRadius: "18px", background: "linear-gradient(90deg, rgba(223,168,55,0.14), rgba(255,255,255,0.03))", border: "1px solid rgba(223,168,55,0.22)" },
  conciergeOrb: { display: "grid", placeItems: "center", width: "30px", height: "30px", borderRadius: "999px", background: "#dfa837", color: "#030305", fontWeight: 900, flexShrink: 0 },
  conciergeTitle: { color: "#fff", fontSize: "13px" },
  conciergeText: { color: "#cbd5e1", fontSize: "12px", lineHeight: 1.45, margin: "4px 0 0" },
  moduleStack: { display: "grid", gap: "10px", marginTop: "18px" },
  moduleButton: { display: "grid", gridTemplateColumns: "12px minmax(0, 1fr) auto", gap: "12px", alignItems: "center", width: "100%", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", background: "rgba(2,6,12,0.62)", padding: "13px", cursor: "pointer", textAlign: "left" },
  moduleDot: { width: "10px", height: "10px", borderRadius: "999px", boxShadow: "0 0 14px currentColor" },
  moduleCopy: { display: "flex", minWidth: 0, flexDirection: "column", gap: "3px", color: "#f8fafc" },
  moduleSignal: { color: "#dfa837", fontSize: "11px", fontWeight: 700, whiteSpace: "nowrap" },
  trialFooter: { display: "flex", justifyContent: "space-between", gap: "16px", alignItems: "center", marginTop: "18px", paddingTop: "18px", borderTop: "1px solid rgba(255,255,255,0.08)" },
  trialStatus: { color: "#f8fafc", fontSize: "13px" },
  trialNote: { color: "#94a3b8", fontSize: "12px", margin: "4px 0 0" },
  runButton: { background: "#dfa837", color: "#030305", border: "none", borderRadius: "12px", padding: "11px 14px", fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap" },
  partnerSection: { marginTop: "22px" },
  partnerEyebrow: { color: "#dfa837", fontSize: "11px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em" },
  partnerGrid: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "10px", marginTop: "10px" },
  partnerBadge: { display: "flex", gap: "10px", alignItems: "center", padding: "10px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.035)", textDecoration: "none", minWidth: 0 },
  logoChip: { display: "grid", placeItems: "center", width: "30px", height: "30px", borderRadius: "8px", background: "#fff", color: "#111827", fontWeight: 900, flexShrink: 0 },
  logoImage: { width: "22px", height: "22px", objectFit: "contain" },
  logoFallback: { display: "none", fontSize: "12px" },
  partnerCopy: { display: "flex", flexDirection: "column", gap: "2px", minWidth: 0, color: "#f8fafc" },
  modalBackdrop: { position: "fixed", inset: 0, zIndex: 1000, display: "grid", placeItems: "center", padding: "20px", background: "rgba(0,0,0,0.72)", backdropFilter: "blur(8px)" },
  modalCard: { position: "relative", width: "min(460px, 100%)", padding: "30px", borderRadius: "24px", background: "linear-gradient(145deg, #12151d, #05070b)", border: "1px solid rgba(223,168,55,0.34)", boxShadow: "0 30px 120px rgba(0,0,0,0.65)", textAlign: "left" },
  modalClose: { position: "absolute", top: "12px", right: "14px", border: "none", background: "transparent", color: "#fff", fontSize: "26px", cursor: "pointer" },
  modalEyebrow: { color: "#dfa837", fontSize: "11px", fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase" },
  modalTitle: { color: "#fff", fontSize: "27px", lineHeight: 1.1, margin: "10px 0" },
  modalText: { color: "#b9c2d0", fontSize: "14px", lineHeight: 1.6 },
  modalActions: { display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "20px" },
  modalPrimary: { background: "#dfa837", color: "#030305", borderRadius: "12px", padding: "12px 18px", textDecoration: "none", fontWeight: 800 },
  modalSecondary: { background: "rgba(255,255,255,0.04)", color: "#f8fafc", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "12px", padding: "12px 18px", textDecoration: "none", fontWeight: 700 },
};
