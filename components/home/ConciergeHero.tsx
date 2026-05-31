"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { stationWorkflows, workflowConnectorSecurityNotes } from "@/lib/station-workflows";
import useTranslation from "@/components/i18n/useTranslation";
import { createClient } from "@/lib/supabase/client";
import partners from "@/partners.json";

interface ConciergeHeroProps {
  lang?: string;
  regionName?: string;
  onSubmit?: (rawQuery: string) => Promise<void>;
  onChip?: (category: string) => void;
  onBrowseAll?: () => void;
}

type DirPartner = {
  id: string;
  name: string;
  logo?: string;
  description?: string;
  category_key?: string;
  category_label?: string;
  category?: string;
  network?: string;
  featured?: boolean;
  tier?: number;
};

const FREE_TRIAL_LIMIT = 3;
const TRIAL_STORAGE_KEY = "sb_station_trials";

function fallbackText(value: string, fallback: string) {
  return value.includes(".") ? fallback : value;
}

// ---- Full partner directory data ------------------------------------------
const allPartners: DirPartner[] = ([...(partners as DirPartner[])]).sort(
  (a, b) => (a.tier ?? 99) - (b.tier ?? 99)
);
const totalPartners = allPartners.length;

const categories = (() => {
  const map = new Map<string, { key: string; label: string; count: number }>();
  for (const p of allPartners) {
    const key = p.category_key || p.category || "other";
    const label = p.category_label || p.category || "Other";
    const existing = map.get(key);
    if (existing) existing.count += 1;
    else map.set(key, { key, label, count: 1 });
  }
  return Array.from(map.values());
})();

// Split for two marquee rows
const marqueeHalf = Math.ceil(allPartners.length / 2);
const marqueeRowA = allPartners.slice(0, marqueeHalf);
const marqueeRowB = allPartners.slice(marqueeHalf);

const stationTools = [
  { label: "Calendar", note: "Schedule & sync", href: "/calendar" },
  { label: "Spreadsheets", note: "Data & models", href: "/spreadsheets" },
  { label: "Reviews", note: "Reputation", href: "/reviews" },
  { label: "Outreach", note: "Campaigns", href: "/outreach" },
  { label: "Promote", note: "Marketing", href: "/promote" },
  { label: "Personal Assistant", note: "AI tasks", href: "/assistant" },
];

// ---- A single partner tile (used in both marquee + grid) ------------------
function PartnerTile({ p, variant }: { p: DirPartner; variant: "marquee" | "grid" }) {
  const isGrid = variant === "grid";
  return (
    <Link
      href={`/partners/${p.id}`}
      className={isGrid ? "sb-dir-card" : "sb-dir-chip"}
      title={p.description || p.name}
      aria-label={`${p.name} — ${p.category_label || p.category || "partner"}`}
    >
      <span className="sb-dir-logo">
        {p.logo ? (
          <img
            src={`/logos/${p.logo}`}
            alt={`${p.name} logo`}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              const sib = e.currentTarget.nextElementSibling;
              if (sib instanceof HTMLElement) sib.style.display = "flex";
            }}
          />
          ) : null}
        <span className="sb-dir-mono" style={{ display: p.logo ? "none" : "flex" }} aria-hidden="true">
          {p.name.charAt(0).toUpperCase()}
        </span>
      </span>
      <span className="sb-dir-meta">
        <span className="sb-dir-name">{p.name}</span>
        <span className="sb-dir-cat">{p.category_label || p.category || p.network}</span>
      </span>
    </Link>
  );
}

export default function ConciergeHero({ lang = "en" }: ConciergeHeroProps) {
  const { t } = useTranslation();
  const router = useRouter();

  // Directory state
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [query, setQuery] = useState("");

  // Station / trial state
  const [isAuthed, setIsAuthed] = useState(false);
  const [triesUsed, setTriesUsed] = useState(0);
  const [ranWorkflows, setRanWorkflows] = useState<Record<string, boolean>>({});
  const [activeWorkflow, setActiveWorkflow] = useState(stationWorkflows[0]);
  const [showTrialModal, setShowTrialModal] = useState(false);

  const connectorList = useMemo(
    () => Array.from(new Set(stationWorkflows.flatMap((w) => w.connectors))),
    []
  );
  const compactWorkflows = stationWorkflows.slice(0, 3);
  const visibleConnectors = connectorList.slice(0, 6);
  const extraConnectors = connectorList.length - visibleConnectors.length;

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(TRIAL_STORAGE_KEY);
      if (stored) setTriesUsed(Math.min(parseInt(stored, 10) || 0, FREE_TRIAL_LIMIT));
    } catch {
      /* ignore */
    }
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return;
    const supabase = createClient();
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (mounted) setIsAuthed(Boolean(data.user));
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setIsAuthed(Boolean(session?.user));
    });
    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const remaining = Math.max(0, FREE_TRIAL_LIMIT - triesUsed);

  const attemptStationAction = (proceed: () => void) => {
    if (isAuthed) return proceed();
    if (triesUsed >= FREE_TRIAL_LIMIT) {
      setShowTrialModal(true);
      return;
    }
    const next = triesUsed + 1;
    setTriesUsed(next);
    try {
      window.localStorage.setItem(TRIAL_STORAGE_KEY, String(next));
    } catch {
      /* ignore */
    }
    proceed();
  };

  const openTool = (href: string) => attemptStationAction(() => router.push(href));
  const runWorkflow = (slug: string) => {
    const w = stationWorkflows.find((c) => c.slug === slug) || stationWorkflows[0];
    setActiveWorkflow(w);
    attemptStationAction(() => setRanWorkflows((cur) => ({ ...cur, [slug]: true })));
  };

  const handleLogout = async () => {
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        const supabase = createClient();
        await supabase.auth.signOut();
      }
    } catch {
      /* ignore */
    }
    try {
      window.localStorage.removeItem(TRIAL_STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setIsAuthed(false);
    setTriesUsed(0);
    setRanWorkflows({});
    router.refresh();
  };
  const handleResetTries = () => {
    try {
      window.localStorage.removeItem(TRIAL_STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setTriesUsed(0);
    setRanWorkflows({});
  };

  // ---- Directory filtering -------------------------------------------------
  const q = query.trim().toLowerCase();
  const filtered = useMemo(() => {
    return allPartners.filter((p) => {
      const catKey = p.category_key || p.category || "other";
      if (activeCategory !== "all" && catKey !== activeCategory) return false;
      if (!q) return true;
      return `${p.name} ${p.category_label || ""} ${p.network || ""}`.toLowerCase().includes(q);
    });
  }, [activeCategory, q]);

  const showGrid = activeCategory !== "all" || q.length > 0;
  const countText = showGrid
    ? `${filtered.length} ${filtered.length === 1 ? "partner" : "partners"}`
    : `Showing all ${totalPartners} partners`;

  return (
    <section style={styles.heroSection} aria-labelledby="partner-hero-title">
      <div style={styles.glowLeft} aria-hidden="true" />
      <div style={styles.glowRight} aria-hidden="true" />
      <div style={styles.gridOverlay} aria-hidden="true" />

      <div className="sb-hero-shell">
        {/* ============ LEFT: LIVE PARTNER DIRECTORY ============ */}
        <div style={styles.dirZone}>
          <div style={styles.dirHeader}>
            <span style={styles.badgeContainer}>
              <span style={styles.badgePulse} />
              <span style={styles.badgeText}>Trusted partner network</span>
            </span>
            <h1 id="partner-hero-title" style={styles.dirHeading}>
              {fallbackText(t("homepage.partnerHeroTitle"), "Trusted partners, all in one place")}
            </h1>
            <p style={styles.dirSub}>
              {totalPartners}+ vetted, affiliate-backed partners across flights, hotels, eSIM, tours, car rentals and
              more — browse freely, no sign-up needed.
            </p>
          </div>

          {/* Search + category filters */}
          <div style={styles.dirControls}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search partners (e.g. hotels, Brazil, eSIM)…"
              style={styles.dirSearch}
              aria-label="Search partners"
            />
            <div style={styles.dirChips} role="tablist" aria-label="Partner categories">
              <button
                type="button"
                onClick={() => setActiveCategory("all")}
                style={{ ...styles.dirChip, ...(activeCategory === "all" ? styles.dirChipActive : {}) }}
              >
                All <span style={styles.dirChipCount}>{totalPartners}</span>
              </button>
              {categories.map((c) => (
                <button
                  type="button"
                  key={c.key}
                  onClick={() => setActiveCategory(c.key)}
                  style={{ ...styles.dirChip, ...(activeCategory === c.key ? styles.dirChipActive : {}) }}
                >
                  {c.label} <span style={styles.dirChipCount}>{c.count}</span>
                </button>
              ))}
            </div>
          </div>

          <div style={styles.dirCount}>{countText}</div>

          {/* Directory body: marquee when idle, grid when filtering/searching */}
          {showGrid ? (
            filtered.length ? (
              <div style={styles.dirGridScroll}>
                <div style={styles.dirGrid}>
                  {filtered.map((p) => (
                    <PartnerTile key={p.id} p={p} variant="grid" />
                  ))}
                </div>
              </div>
            ) : (
              <div style={styles.dirEmpty}>No partners match “{query}”. Try another search or category.</div>
            )
          ) : (
            <div style={styles.dirMarquee}>
              <div className="sb-dir-row">
                <div className="sb-dir-track">
                  {[...marqueeRowA, ...marqueeRowA].map((p, i) => (
                    <PartnerTile key={`a-${p.id}-${i}`} p={p} variant="marquee" />
                  ))}
                </div>
              </div>
              <div className="sb-dir-row">
                <div className="sb-dir-track rev">
                  {[...marqueeRowB, ...marqueeRowB].map((p, i) => (
                    <PartnerTile key={`b-${p.id}-${i}`} p={p} variant="marquee" />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div style={styles.dirActions}>
            <Link href="/marketplace" style={styles.brandButtonPrimary}>
              See all {totalPartners} partners →
            </Link>
            <Link href="/promote" style={styles.brandButtonSecondary}>
              Become a partner
            </Link>
          </div>
        </div>

        {/* ============ RIGHT: SaaS STATION (compact, far right) ============ */}
        <aside className="saas-station-panel" style={styles.stationPanel} aria-label="SaaS Stationary Station feature">
          <div style={styles.stationGlow} aria-hidden="true" />

          <div style={styles.stationHeader}>
            <span style={styles.stationEyebrow}>Feature • SaaS Station</span>
            <h2 style={styles.stationTitle}>
              {fallbackText(t("homepage.saasStationTitle"), "Your SaaS Stationary Station")}
            </h2>
            <p style={styles.stationSubtitle}>
              Office tasks — calendar, spreadsheets, reviews, outreach, promotion and assistant — in one cockpit. Try{" "}
              {FREE_TRIAL_LIMIT} free.
            </p>
          </div>

          <div
            style={{
              ...styles.trialStatus,
              ...(isAuthed ? styles.trialStatusAuthed : remaining === 0 ? styles.trialStatusEmpty : {}),
            }}
            aria-live="polite"
          >
            <span style={styles.trialStatusDot} />
            {isAuthed
              ? "Signed in — unlimited"
              : remaining > 0
              ? `${remaining} of ${FREE_TRIAL_LIMIT} free tries left`
              : "Free tries used — sign up to keep using"}
          </div>

          <div style={styles.toolsGrid} aria-label="Station tools">
            {stationTools.map((tool) => (
              <button type="button" key={tool.href} style={styles.toolTile} onClick={() => openTool(tool.href)}>
                <span style={styles.toolTileLabel}>{tool.label}</span>
                <span style={styles.toolTileNote}>{tool.note}</span>
              </button>
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
            {visibleConnectors.map((c) => (
              <span key={c} style={styles.connectorPill}>{c}</span>
            ))}
            {extraConnectors > 0 && <span style={styles.connectorPill}>+{extraConnectors}</span>}
          </div>

          <div style={styles.compactWorkflowList} aria-label="Station workflows">
            {compactWorkflows.map((w) => {
              const ran = ranWorkflows[w.slug];
              return (
                <button
                  type="button"
                  key={w.slug}
                  style={{ ...styles.compactWorkflowRow, borderColor: `${w.accent}55` }}
                  onClick={() => runWorkflow(w.slug)}
                  aria-label={`Run ${w.title} workflow task`}
                >
                  <span style={{ ...styles.workflowAccent, background: w.accent }} />
                  <span style={styles.workflowRowMain}>
                    <strong style={styles.workflowRowTitle}>{w.title}</strong>
                    <span style={styles.workflowRowMetric}>{w.metric}</span>
                  </span>
                  <span style={styles.workflowRowCta}>{ran ? "✓ Ran" : "Try →"}</span>
                </button>
              );
            })}
          </div>

          <div style={styles.stationFooter}>
            <button
              type="button"
              style={styles.stationCta}
              onClick={() => attemptStationAction(() => router.push("/dashboard"))}
            >
              Open the station →
            </button>
            <div style={styles.stationManageRow}>
              {isAuthed ? (
                <button type="button" style={styles.stationManageBtn} onClick={() => void handleLogout()}>
                  Log out
                </button>
              ) : (
                <button type="button" style={styles.stationManageBtn} onClick={handleResetTries}>
                  Reset tries
                </button>
              )}
            </div>
            <span style={styles.securityNote}>{workflowConnectorSecurityNotes[0]}</span>
          </div>
        </aside>
      </div>

      {showTrialModal && (
        <div style={styles.modalBackdrop} role="dialog" aria-modal="true" aria-labelledby="station-trial-title">
          <div style={styles.modalCard}>
            <span style={styles.modalEyebrow}>Concierge says</span>
            <h3 id="station-trial-title" style={styles.modalTitle}>Sign up to keep using your SaaS Station</h3>
            <p style={styles.modalCopy}>
              You have used your {FREE_TRIAL_LIMIT} free tries. Create an account to keep Concierge guidance, connector
              sync, and your office tools active. Browsing partners stays free either way.
            </p>
            <div style={styles.modalActions}>
              <Link href="/auth/login" style={styles.brandButtonPrimary}>Sign Up</Link>
              <Link href="/pricing" style={styles.brandButtonSecondary}>Upgrade to Pro</Link>
              <button type="button" style={styles.modalDismiss} onClick={() => setShowTrialModal(false)}>Not now</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .sb-hero-shell{
          position:relative;z-index:10;
          display:grid;
          grid-template-columns:minmax(0,1fr) 340px;
          gap:36px;
          align-items:start;
          max-width:1320px;
          margin:0 auto;
        }
        @media (max-width:1024px){
          .sb-hero-shell{ grid-template-columns:1fr; gap:30px; }
        }

        /* Directory tiles */
        .sb-dir-card, .sb-dir-chip{
          display:flex;align-items:center;gap:11px;text-decoration:none;
          border:1px solid rgba(245,197,66,.16);border-radius:14px;
          background:rgba(15,15,22,.72);
          -webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);
        }
        .sb-dir-card{ padding:12px;min-height:64px; }
        .sb-dir-chip{ padding:10px 14px;white-space:nowrap;flex:0 0 auto; }
        .sb-dir-card:hover, .sb-dir-chip:hover{ border-color:rgba(245,197,66,.45);background:rgba(245,197,66,.06); }
        .sb-dir-logo{
          width:38px;height:38px;flex-shrink:0;border-radius:10px;background:#fff;
          display:flex;align-items:center;justify-content:center;overflow:hidden;
          border:1px solid rgba(245,197,66,.28);
        }
        .sb-dir-logo img{ width:26px;height:26px;object-fit:contain; }
        .sb-dir-mono{
          width:100%;height:100%;align-items:center;justify-content:center;
          color:#11151c;font-weight:900;font-size:16px;background:linear-gradient(135deg,#f5c542,#dfa837);
        }
        .sb-dir-meta{ display:flex;flex-direction:column;min-width:0; }
        .sb-dir-name{ color:#f8fafc;font-size:14px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:180px; }
        .sb-dir-cat{ color:#dfa837;font-size:11px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:180px; }

        /* Marquee */
        .sb-dir-row{ overflow:hidden;
          -webkit-mask-image:linear-gradient(to right,transparent,#000 6%,#000 94%,transparent);
          mask-image:linear-gradient(to right,transparent,#000 6%,#000 94%,transparent);
        }
        .sb-dir-track{ display:flex;gap:10px;width:max-content;animation:sbDirLeft 80s linear infinite; }
        .sb-dir-track.rev{ animation-name:sbDirRight; }
        .sb-dir-row:hover .sb-dir-track{ animation-play-state:paused; }
        @keyframes sbDirLeft{ from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes sbDirRight{ from{transform:translateX(-50%)} to{transform:translateX(0)} }
        @media(prefers-reduced-motion:reduce){ .sb-dir-track{ animation:none } }
      `}</style>
    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  heroSection: {
    position: "relative",
    backgroundColor: "#030305",
    padding: "120px 24px 64px 24px",
    overflow: "hidden",
    borderBottom: "1px solid rgba(245, 197, 66, 0.13)",
  },
  glowLeft: { position: "absolute", top: "-14%", left: "8%", width: "520px", height: "520px", background: "radial-gradient(circle, rgba(245, 197, 66, 0.16) 0%, transparent 68%)", pointerEvents: "none" },
  glowRight: { position: "absolute", top: "8%", right: "8%", width: "620px", height: "620px", background: "radial-gradient(circle, rgba(34, 211, 238, 0.1) 0%, transparent 62%)", pointerEvents: "none" },
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

  // ---- Directory zone ----
  dirZone: { display: "flex", flexDirection: "column", gap: "18px", minWidth: 0 },
  dirHeader: { display: "flex", flexDirection: "column", gap: "10px" },
  badgeContainer: { display: "inline-flex", alignItems: "center", gap: "10px", border: "1px solid rgba(245, 197, 66, 0.32)", background: "rgba(245, 197, 66, 0.08)", borderRadius: "999px", padding: "7px 12px", alignSelf: "flex-start" },
  badgePulse: { width: "8px", height: "8px", borderRadius: "999px", background: "#f5c542", boxShadow: "0 0 18px rgba(245, 197, 66, 0.9)" },
  badgeText: { color: "#f5c542", fontSize: "11px", fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase" },
  dirHeading: { color: "#fff", fontSize: "clamp(24px, 3vw, 34px)", lineHeight: 1.05, letterSpacing: "-0.03em", margin: 0 },
  dirSub: { color: "rgba(255,255,255,.66)", fontSize: "15px", lineHeight: 1.55, margin: 0, maxWidth: "640px" },

  dirControls: { display: "flex", flexDirection: "column", gap: "12px" },
  dirSearch: {
    width: "100%",
    height: "46px",
    background: "rgba(255,255,255,.05)",
    color: "#fff",
    border: "1px solid rgba(255,255,255,.12)",
    borderRadius: "14px",
    padding: "0 16px",
    outline: "none",
    fontFamily: "inherit",
    fontSize: "15px",
  },
  dirChips: { display: "flex", flexWrap: "wrap", gap: "8px" },
  dirChip: {
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    border: "1px solid rgba(255,255,255,.12)",
    background: "rgba(255,255,255,.05)",
    color: "#fff",
    borderRadius: "999px",
    padding: "8px 13px",
    fontSize: "12.5px",
    fontWeight: 800,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  dirChipActive: { borderColor: "rgba(245,197,66,.6)", background: "rgba(245,197,66,.14)", color: "#f5c542" },
  dirChipCount: { color: "rgba(255,255,255,.5)", fontSize: "11px", fontWeight: 800 },

  dirCount: { color: "rgba(255,255,255,.5)", fontSize: "12px", fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase" },

  dirMarquee: { display: "flex", flexDirection: "column", gap: "12px" },

  dirGridScroll: { maxHeight: "440px", overflowY: "auto", paddingRight: "4px" },
  dirGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: "10px" },
  dirEmpty: { color: "rgba(255,255,255,.6)", fontSize: "14px", border: "1px dashed rgba(255,255,255,.14)", borderRadius: "14px", padding: "20px", background: "rgba(255,255,255,.02)" },

  dirActions: { display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "4px" },
  brandButtonPrimary: { display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: "999px", border: 0, background: "linear-gradient(135deg, #f5c542, #dfa837)", color: "#11151c", minHeight: "46px", padding: "0 22px", fontWeight: 900, fontSize: "14px", boxShadow: "0 18px 42px rgba(245, 197, 66, 0.24)", cursor: "pointer", textDecoration: "none", fontFamily: "inherit" },
  brandButtonSecondary: { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px", border: "1px solid rgba(255,255,255,.14)", borderRadius: "999px", background: "rgba(255,255,255,.06)", color: "#fff", minHeight: "46px", padding: "0 20px", fontWeight: 900, fontSize: "14px", textDecoration: "none", fontFamily: "inherit", cursor: "pointer" },

  // ---- Station (compact, far right) ----
  stationPanel: { position: "relative", overflow: "hidden", width: "100%", maxWidth: "340px", marginLeft: "auto", border: "1px solid rgba(245, 197, 66, 0.30)", borderRadius: "24px", background: "linear-gradient(180deg, rgba(17, 24, 39, 0.86), rgba(4, 7, 13, 0.94))", padding: "20px", boxShadow: "0 22px 70px rgba(0,0,0,.42), 0 0 48px rgba(245, 197, 66, 0.1)" },
  stationGlow: { position: "absolute", inset: "-35% -20% auto auto", width: "240px", height: "240px", background: "radial-gradient(circle, rgba(245,197,66,.18), transparent 65%)", pointerEvents: "none" },
  stationHeader: { position: "relative", zIndex: 1, marginBottom: "14px" },
  stationEyebrow: { color: "#f5c542", fontSize: "10px", fontWeight: 900, letterSpacing: "0.18em", textTransform: "uppercase" },
  stationTitle: { color: "#fff", fontSize: "clamp(18px, 2vw, 22px)", lineHeight: 1.1, margin: "8px 0 6px" },
  stationSubtitle: { color: "rgba(255,255,255,.62)", fontSize: "12px", lineHeight: 1.5, margin: 0 },

  trialStatus: { position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: "8px", borderRadius: "999px", padding: "8px 12px", marginBottom: "14px", fontSize: "11.5px", fontWeight: 800, color: "#f5c542", border: "1px solid rgba(245,197,66,.28)", background: "rgba(245,197,66,.08)" },
  trialStatusAuthed: { color: "#34d399", border: "1px solid rgba(52,211,153,.3)", background: "rgba(52,211,153,.08)" },
  trialStatusEmpty: { color: "#fca5a5", border: "1px solid rgba(248,113,113,.3)", background: "rgba(248,113,113,.08)" },
  trialStatusDot: { width: "7px", height: "7px", borderRadius: "999px", background: "currentColor", flexShrink: 0 },

  toolsGrid: { position: "relative", zIndex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "14px" },
  toolTile: { display: "flex", flexDirection: "column", gap: "2px", textAlign: "left", border: "1px solid rgba(245,197,66,.18)", borderRadius: "12px", padding: "11px", background: "rgba(245,197,66,.05)", minHeight: "58px", justifyContent: "center", cursor: "pointer", fontFamily: "inherit" },
  toolTileLabel: { color: "#fff", fontSize: "13px", fontWeight: 800 },
  toolTileNote: { color: "rgba(255,255,255,.55)", fontSize: "10.5px", fontWeight: 600 },

  stationTelemetryStrip: { position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: "9px", border: "1px solid rgba(245, 197, 66, 0.22)", borderRadius: "999px", padding: "8px 12px", color: "rgba(255,255,255,.72)", background: "rgba(245,197,66,.07)", marginBottom: "12px", fontSize: "12px" },
  telemetryDot: { width: "8px", height: "8px", borderRadius: "999px", background: "#34d399", boxShadow: "0 0 18px #34d399", flexShrink: 0 },
  telemetryStripText: { color: "rgba(255,255,255,.6)", fontSize: "11px", lineHeight: 1.35 },

  connectorRail: { position: "relative", zIndex: 1, display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "14px" },
  connectorPill: { color: "#f5c542", fontSize: "10px", fontWeight: 900, border: "1px solid rgba(245,197,66,.2)", borderRadius: "999px", padding: "5px 8px", background: "rgba(245,197,66,.055)" },

  compactWorkflowList: { position: "relative", zIndex: 1, display: "grid", gap: "8px", marginBottom: "14px" },
  compactWorkflowRow: { display: "flex", alignItems: "center", gap: "10px", width: "100%", textAlign: "left", cursor: "pointer", border: "1px solid rgba(255,255,255,.12)", borderRadius: "12px", padding: "10px 12px", background: "rgba(3, 7, 18, 0.6)", fontFamily: "inherit" },
  workflowAccent: { width: "4px", height: "28px", borderRadius: "999px", flexShrink: 0 },
  workflowRowMain: { display: "flex", flexDirection: "column", minWidth: 0, flex: 1 },
  workflowRowTitle: { color: "#fff", fontSize: "13px", fontWeight: 800 },
  workflowRowMetric: { color: "#f5c542", fontSize: "10.5px", fontWeight: 800, marginTop: "2px" },
  workflowRowCta: { color: "rgba(34,211,238,.86)", fontSize: "10.5px", fontWeight: 900, flexShrink: 0 },

  stationFooter: { position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: "8px" },
  stationCta: { display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: "999px", background: "linear-gradient(135deg, #f5c542, #dfa837)", color: "#11151c", minHeight: "42px", padding: "0 16px", fontWeight: 900, fontSize: "12.5px", textDecoration: "none", border: 0, cursor: "pointer", fontFamily: "inherit" },
  stationManageRow: { display: "flex", justifyContent: "center", gap: "14px" },
  stationManageBtn: { border: 0, background: "transparent", color: "rgba(255,255,255,.55)", fontSize: "11.5px", fontWeight: 800, cursor: "pointer", fontFamily: "inherit", textDecoration: "underline", textUnderlineOffset: "3px", padding: "2px 4px" },
  securityNote: { color: "rgba(255,255,255,.5)", fontSize: "10.5px", lineHeight: 1.35, textAlign: "center" },

  modalBackdrop: { position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", background: "rgba(0,0,0,.72)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" },
  modalCard: { width: "min(520px, 100%)", border: "1px solid rgba(245,197,66,.38)", borderRadius: "28px", padding: "28px", background: "linear-gradient(180deg, rgba(17,24,39,.98), rgba(3,7,18,.98))", boxShadow: "0 0 80px rgba(245,197,66,.2)" },
  modalEyebrow: { color: "#f5c542", fontSize: "11px", fontWeight: 900, letterSpacing: ".16em", textTransform: "uppercase" },
  modalTitle: { color: "#fff", fontSize: "30px", lineHeight: 1.05, margin: "10px 0 12px" },
  modalCopy: { color: "rgba(255,255,255,.68)", fontSize: "15px", lineHeight: 1.6, margin: "0 0 22px" },
  modalActions: { display: "flex", flexWrap: "wrap", gap: "10px" },
  modalDismiss: { border: 0, background: "transparent", color: "rgba(255,255,255,.62)", fontWeight: 900, padding: "0 8px", cursor: "pointer", fontFamily: "inherit" },
};
