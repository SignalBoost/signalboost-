"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { stationWorkflows, workflowConnectorSecurityNotes } from "@/lib/station-workflows";
import useTranslation from "@/components/i18n/useTranslation";
import { createClient } from "@/lib/supabase/client";
import partnersSeed from "@/partners.json";
import { partnerFaviconOrNull } from "@/lib/partner-logo";
import { useRegion, partnerVisibleInRegion } from "@/lib/region";

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

// Rotating-population ("tide") settings
const POOL_SIZE = 30;          // signals visible on the field at one time
const SWAP_INTERVAL_MS = 3500; // gentle tide: one swap every ~3.5s
const FADE_MS = 1000;          // slow fade in/out

function fallbackText(value: string, fallback: string) {
  return /^[a-zA-Z][\w$]*(\.[\w$]+)+$/.test(value) ? fallback : value;
}

// Sort partners by tier (top tier first). Used for both the static seed and
// the live list fetched from /api/partners at runtime.
function sortPartners(list: DirPartner[]): DirPartner[] {
  return [...list].sort((a, b) => (a.tier ?? 99) - (b.tier ?? 99));
}

// Derive the category list (with counts) from a partner list.
function buildCategories(list: DirPartner[]): Array<{ key: string; label: string; count: number }> {
  const map = new Map<string, { key: string; label: string; count: number }>();
  for (const p of list) {
    const key = p.category_key || p.category || "other";
    const label = p.category_label || p.category || "Other";
    const existing = map.get(key);
    if (existing) existing.count += 1;
    else map.set(key, { key, label, count: 1 });
  }
  return Array.from(map.values());
}

// Static seed: shown instantly on first paint, then replaced by the live
// database list once /api/partners responds.
const seedPartners: DirPartner[] = sortPartners(partnersSeed as DirPartner[]);

// Categories shown as chips in the hero: travel only (the rest are still in
// the field, search, and the sections below — just not chipped up top).
const TRAVEL_HINTS = ["flight", "hotel", "sim", "connect", "tour", "activit", "transfer", "car", "insurance", "claim", "travel"];
function isTravel(c: { key: string; label: string }) {
  const hay = `${c.key} ${c.label}`.toLowerCase();
  return TRAVEL_HINTS.some((h) => hay.includes(h));
}

const STATION_COMING_SOON: Record<string, string> = {
  en: "Coming soon",
  es: "Próximamente",
  pt: "Em breve",
  pl: "Wkrótce",
  ru: "Скоро",
};

const stationTools = [
  { label: "Calendar", note: "Schedule & sync", href: "/calendar", nameKey: "hero.tools.calendar.name", descKey: "hero.tools.calendar.desc", comingSoon: true },
  { label: "Spreadsheets", note: "Data & models", href: "/spreadsheets", nameKey: "hero.tools.spreadsheets.name", descKey: "hero.tools.spreadsheets.desc" },
  { label: "Reviews", note: "Reputation", href: "/reviews", nameKey: "hero.tools.reviews.name", descKey: "hero.tools.reviews.desc" },
  { label: "Outreach", note: "Campaigns", href: "/outreach", nameKey: "hero.tools.outreach.name", descKey: "hero.tools.outreach.desc", comingSoon: true },
  { label: "Promote", note: "Marketing", href: "/promote", nameKey: "hero.tools.promote.name", descKey: "hero.tools.promote.desc" },
  { label: "Personal Assistant", note: "AI tasks", href: "/assistant", nameKey: "hero.tools.assistant.name", descKey: "hero.tools.assistant.desc" },
];

// Each drifting signal's runtime state
type SignalNode = {
  p: DirPartner;
  el: HTMLAnchorElement | null;
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  hover: boolean;
  eligible: boolean;  // matches the current filter
  inPool: boolean;    // currently occupying the field
  fading: "in" | "out" | null;
  fadeStart: number;
};

export default function ConciergeHero({ lang = "en" }: ConciergeHeroProps) {
  const { t, lang: uiLang } = useTranslation();
  const comingSoonLabel = STATION_COMING_SOON[uiLang] ?? STATION_COMING_SOON.en;
  const router = useRouter();

  // Directory state
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [query, setQuery] = useState("");

  // Partner list: seeded from the static file for an instant first paint, then
  // replaced by the LIVE database list (via /api/partners, which reads the
  // Supabase affiliate_partners table). This is why partners added through the
  // admin template now appear on the homepage with no redeploy.
  const [allPartners, setAllPartners] = useState<DirPartner[]>(seedPartners);

  useEffect(() => {
    let active = true;
    fetch("/api/partners")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (active && Array.isArray(data) && data.length > 0) {
          setAllPartners(sortPartners(data as DirPartner[]));
        }
      })
      .catch(() => {
        /* keep the static seed on any error */
      });
    return () => {
      active = false;
    };
  }, []);

  const totalPartners = allPartners.length;
  const categories = useMemo(() => buildCategories(allPartners), [allPartners]);
  const chipCategories = useMemo(() => categories.filter(isTravel), [categories]);

  // Visitor region (worldwide by default; auto-detected, user-overridable).
  // A partner shows when it's tagged worldwide OR matches the chosen region.
  const [region] = useRegion();
  const regionPartners = useMemo(
    () => allPartners.filter((p) => partnerVisibleInRegion(p, region)),
    [region, allPartners]
  );

  // Living-field refs
  const fieldRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const nodesRef = useRef<SignalNode[]>([]);
  const filterRef = useRef({ cat: "all", q: "" });
  const regionRef = useRef(region);

  // Station / trial state
  const [isAuthed, setIsAuthed] = useState(false);
  const [triesUsed, setTriesUsed] = useState(0);
  const [ranWorkflows, setRanWorkflows] = useState<Record<string, boolean>>({});
  const [showTrialModal, setShowTrialModal] = useState(false);

  const connectorList = useMemo(
    () => Array.from(new Set(stationWorkflows.flatMap((w) => w.connectors))),
    []
  );
  const compactWorkflows = stationWorkflows.slice(0, 3);
  const visibleConnectors = connectorList.slice(0, 6);
  const extraConnectors = connectorList.length - visibleConnectors.length;

  // Keep latest filter in a ref for the animation loop
  useEffect(() => {
    filterRef.current = { cat: activeCategory, q: query.trim().toLowerCase() };
    rebuildPool();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory, query]);

  // When the region changes, the rendered node set changes too; sync the ref,
  // drop any nodes whose partner is no longer present, and rebuild the pool.
  useEffect(() => {
    regionRef.current = region;
    const liveIds = new Set(regionPartners.map((p) => p.id));
    nodesRef.current = nodesRef.current.filter((n) => liveIds.has(n.p.id));
    rebuildPool();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [region, regionPartners]);

  function nodeEligible(p: DirPartner) {
    const { cat, q } = filterRef.current;
    // Region gate: only worldwide or current-region partners are eligible.
    if (!partnerVisibleInRegion(p, regionRef.current)) return false;
    const catKey = p.category_key || p.category || "other";
    if (cat !== "all" && catKey !== cat) return false;
    if (!q) return true;
    return `${p.name} ${p.category_label || ""} ${p.network || ""}`.toLowerCase().includes(q);
  }

  // Rebuild which signals are eligible, then seed a fresh pool of up to POOL_SIZE.
  function rebuildPool() {
    const nodes = nodesRef.current;
    const field = fieldRef.current;
    const w = field?.clientWidth || 900;
    const h = field?.clientHeight || 520;
    const eligible: SignalNode[] = [];
    nodes.forEach((n) => {
      n.eligible = nodeEligible(n.p);
      if (!n.eligible) {
        n.inPool = false;
        n.fading = null;
        if (n.el) { n.el.style.opacity = "0"; n.el.style.pointerEvents = "none"; }
      } else {
        eligible.push(n);
      }
    });
    // shuffle eligible for variety
    for (let i = eligible.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [eligible[i], eligible[j]] = [eligible[j], eligible[i]];
    }
    const take = Math.min(POOL_SIZE, eligible.length);
    eligible.forEach((n, idx) => {
      const chosen = idx < take;
      n.inPool = chosen;
      n.fading = null;
      if (n.el) {
        n.el.style.opacity = chosen ? "1" : "0";
        n.el.style.pointerEvents = chosen ? "auto" : "none";
      }
      if (chosen) {
        n.w = n.el?.offsetWidth || 160;
        n.h = n.el?.offsetHeight || 52;
        n.x = Math.random() * Math.max(1, w - n.w);
        n.y = Math.random() * Math.max(1, h - n.h);
        const a = Math.random() * Math.PI * 2;
        const s = 0.25 + Math.random() * 0.35;
        n.vx = Math.cos(a) * s;
        n.vy = Math.sin(a) * s;
      }
    });
  }

  // ---- The living signal-wave field (canvas + drifting DOM nodes) ----------
  useEffect(() => {
    const field = fieldRef.current;
    const canvas = canvasRef.current;
    if (!field || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const W = () => field.clientWidth;
    const H = () => field.clientHeight;

    function sizeCanvas() {
      const dpr = window.devicePixelRatio || 1;
      canvas!.width = W() * dpr;
      canvas!.height = H() * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    // seed the initial pool via rebuildPool (already defined in component scope)
    const nodes = nodesRef.current;

    // ---- Tide cycling: swap one pool member for a waiting one ----
    let lastSwap = performance.now();
    function cycleTide(now: number) {
      if (now - lastSwap < SWAP_INTERVAL_MS) return;
      lastSwap = now;
      const eligible = nodes.filter((n) => n.eligible);
      if (eligible.length <= POOL_SIZE) return; // nothing waiting; keep all
      const inPool = eligible.filter((n) => n.inPool && n.fading !== "out");
      const waiting = eligible.filter((n) => !n.inPool && n.fading !== "in");
      if (!inPool.length || !waiting.length) return;
      // prefer to retire a non-hovered signal
      const retireable = inPool.filter((n) => !n.hover);
      const out = (retireable.length ? retireable : inPool)[Math.floor(Math.random() * (retireable.length ? retireable.length : inPool.length))];
      const incoming = waiting[Math.floor(Math.random() * waiting.length)];
      out.fading = "out";
      out.fadeStart = now;
      incoming.fading = "in";
      incoming.fadeStart = now;
      // place incoming somewhere fresh
      const w = W(); const h = H();
      incoming.w = incoming.el?.offsetWidth || 160;
      incoming.h = incoming.el?.offsetHeight || 52;
      incoming.x = Math.random() * Math.max(1, w - incoming.w);
      incoming.y = Math.random() * Math.max(1, h - incoming.h);
      const a = Math.random() * Math.PI * 2; const s = 0.25 + Math.random() * 0.35;
      incoming.vx = Math.cos(a) * s; incoming.vy = Math.sin(a) * s;
      incoming.inPool = true;
      if (incoming.el) incoming.el.style.pointerEvents = "auto";
    }
    function tickFades(now: number) {
      for (const n of nodes) {
        if (!n.fading || !n.el) continue;
        const k = Math.min(1, (now - n.fadeStart) / FADE_MS);
        if (n.fading === "in") {
          n.el.style.opacity = String(k);
          if (k >= 1) n.fading = null;
        } else {
          n.el.style.opacity = String(1 - k);
          if (k >= 1) { n.fading = null; n.inPool = false; n.el.style.pointerEvents = "none"; }
        }
      }
    }

    // cosmic reaction state
    let flash = 0;
    let nextReaction = performance.now() + 1500 + Math.random() * 2500;
    type Arc = { pts: { x: number; y: number }[]; life: number; max: number; hue: "gold" | "cyan" };
    let arcs: Arc[] = [];

    function jagged(x1: number, y1: number, x2: number, y2: number, seg: number, jit: number) {
      const pts = [{ x: x1, y: y1 }];
      for (let i = 1; i < seg; i++) {
        const tt = i / seg;
        pts.push({ x: x1 + (x2 - x1) * tt + (Math.random() - 0.5) * jit, y: y1 + (y2 - y1) * tt + (Math.random() - 0.5) * jit });
      }
      pts.push({ x: x2, y: y2 });
      return pts;
    }
    function fireReaction(cx: number, cy: number) {
      const live = nodes.filter((n) => n.inPool);
      let ax: number, ay: number, bx: number, by: number;
      if (live.length >= 2 && Math.random() < 0.7) {
        const a = live[Math.floor(Math.random() * live.length)];
        let b = live[Math.floor(Math.random() * live.length)];
        let g = 0;
        while (b === a && g++ < 5) b = live[Math.floor(Math.random() * live.length)];
        ax = a.x + a.w / 2; ay = a.y + a.h / 2; bx = b.x + b.w / 2; by = b.y + b.h / 2;
      } else if (live.length >= 1) {
        const a = live[Math.floor(Math.random() * live.length)];
        ax = cx; ay = cy; bx = a.x + a.w / 2; by = a.y + a.h / 2;
      } else return;
      const dist = Math.hypot(bx - ax, by - ay);
      const seg = Math.max(5, Math.min(14, Math.round(dist / 40)));
      const hue: "gold" | "cyan" = Math.random() < 0.5 ? "gold" : "cyan";
      arcs.push({ pts: jagged(ax, ay, bx, by, seg, dist * 0.16), life: 1, max: 1, hue });
      if (Math.random() < 0.5) {
        const mid = arcs[arcs.length - 1].pts[Math.floor(seg / 2)];
        arcs.push({ pts: jagged(mid.x, mid.y, mid.x + (Math.random() - 0.5) * 120, mid.y + (Math.random() - 0.5) * 120, 5, 40), life: 0.8, max: 0.8, hue });
      }
      flash = Math.min(1, flash + 0.55);
    }
    function drawArcs(dt: number) {
      for (const a of arcs) {
        a.life -= dt * 0.004;
        if (a.life <= 0) continue;
        const al = a.life / a.max;
        const col = a.hue === "gold" ? "245,197,66" : "56,196,255";
        ctx!.save();
        ctx!.shadowBlur = 14; ctx!.shadowColor = `rgba(${col},${al})`;
        ctx!.strokeStyle = `rgba(${col},${al})`;
        ctx!.lineWidth = 1.6; ctx!.lineJoin = "round";
        ctx!.beginPath(); ctx!.moveTo(a.pts[0].x, a.pts[0].y);
        for (let i = 1; i < a.pts.length; i++) ctx!.lineTo(a.pts[i].x, a.pts[i].y);
        ctx!.stroke();
        ctx!.shadowBlur = 0; ctx!.strokeStyle = `rgba(255,255,255,${al * 0.8})`; ctx!.lineWidth = 0.7;
        ctx!.stroke();
        ctx!.restore();
      }
      arcs = arcs.filter((a) => a.life > 0);
    }

    let t = 0;
    let last = performance.now();
    let raf = 0;
    const drift = 0.42;
    const waveSpeed = 0.5;

    function frame(now: number) {
      const dt = Math.min(40, now - last);
      last = now;
      t += dt * 0.001 * (0.4 + waveSpeed);
      const w = W();
      const h = H();
      const cx = w / 2;
      const cy = h / 2;
      ctx!.clearRect(0, 0, w, h);

      if (!reduce && now >= nextReaction) {
        fireReaction(cx, cy);
        nextReaction = now + 2200 + Math.random() * 4200;
      }
      flash = Math.max(0, flash - dt * 0.0022);
      if (flash > 0) {
        const fg = ctx!.createRadialGradient(cx, cy, 0, cx, cy, Math.hypot(w, h) / 1.3);
        fg.addColorStop(0, `rgba(120,160,220,${flash * 0.1})`);
        fg.addColorStop(1, "rgba(0,0,0,0)");
        ctx!.fillStyle = fg; ctx!.fillRect(0, 0, w, h);
      }

      const maxR = Math.hypot(w, h) / 1.4;
      const rings = 6;
      for (let i = 0; i < rings; i++) {
        const phase = ((t * 0.18) + i / rings) % 1;
        const r = phase * maxR;
        const alpha = (1 - phase) * 0.5;
        ctx!.beginPath(); ctx!.arc(cx, cy, r, 0, Math.PI * 2);
        ctx!.strokeStyle = `rgba(245,197,66,${alpha * 0.5})`; ctx!.lineWidth = 2; ctx!.stroke();
      }
      for (let i = 0; i < rings; i++) {
        const phase = ((t * 0.135) + i / rings + 0.5) % 1;
        const r = phase * maxR;
        const alpha = (1 - phase) * 0.55;
        ctx!.beginPath(); ctx!.arc(cx, cy, r, 0, Math.PI * 2);
        ctx!.strokeStyle = `rgba(56,196,255,${alpha * 0.5})`; ctx!.lineWidth = 1.6; ctx!.stroke();
      }
      const core = 6 + Math.sin(t * 2) * 2;
      const gc = ctx!.createRadialGradient(cx, cy, 0, cx, cy, 80);
      gc.addColorStop(0, "rgba(56,196,255,.18)"); gc.addColorStop(1, "rgba(56,196,255,0)");
      ctx!.fillStyle = gc; ctx!.beginPath(); ctx!.arc(cx, cy, 80, 0, Math.PI * 2); ctx!.fill();
      const g = ctx!.createRadialGradient(cx, cy, 0, cx, cy, 60);
      g.addColorStop(0, "rgba(245,197,66,.5)"); g.addColorStop(1, "rgba(245,197,66,0)");
      ctx!.fillStyle = g; ctx!.beginPath(); ctx!.arc(cx, cy, 60, 0, Math.PI * 2); ctx!.fill();
      ctx!.fillStyle = "rgba(245,197,66,.9)"; ctx!.beginPath(); ctx!.arc(cx, cy, core, 0, Math.PI * 2); ctx!.fill();

      drawArcs(dt);

      if (!reduce) cycleTide(now);
      tickFades(now);

      for (const n of nodes) {
        if (!n.inPool || !n.el) continue;
        if (!(n.hover) && !reduce) {
          n.x += n.vx * drift * (dt / 16);
          n.y += n.vy * drift * (dt / 16);
          if (n.x <= 0) { n.x = 0; n.vx = Math.abs(n.vx); } else if (n.x >= w - n.w) { n.x = w - n.w; n.vx = -Math.abs(n.vx); }
          if (n.y <= 0) { n.y = 0; n.vy = Math.abs(n.vy); } else if (n.y >= h - n.h) { n.y = h - n.h; n.vy = -Math.abs(n.vy); }
        }
        n.el.style.transform = `translate(${n.x}px, ${n.y}px)`;
      }
      raf = requestAnimationFrame(frame);
    }

    sizeCanvas();
    // wait one frame so node sizes are measured, then build the first pool
    raf = requestAnimationFrame(() => {
      rebuildPool();
      raf = requestAnimationFrame(frame);
    });

    const onResize = () => {
      sizeCanvas();
      const w = W();
      const h = H();
      nodes.forEach((n) => { n.x = Math.min(n.x, Math.max(0, w - n.w)); n.y = Math.min(n.y, Math.max(0, h - n.h)); });
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Trial / auth ---------------------------------------------------------
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

  const visibleCount = useMemo(() => {
    const cat = activeCategory;
    const q = query.trim().toLowerCase();
    return regionPartners.filter((p) => {
      const k = p.category_key || p.category || "other";
      if (cat !== "all" && k !== cat) return false;
      if (!q) return true;
      return `${p.name} ${p.category_label || ""} ${p.network || ""}`.toLowerCase().includes(q);
    }).length;
  }, [activeCategory, query, regionPartners]);

  const idle = activeCategory === "all" && !query.trim();

  return (
    <section style={styles.heroSection} aria-labelledby="partner-hero-title">
      <div style={styles.glowLeft} aria-hidden="true" />
      <div style={styles.glowRight} aria-hidden="true" />

      <div className="sb-hero-shell">
        {/* ============ FAR-LEFT: headline + search + travel chips ============ */}
        <div style={styles.infoCol}>
          <span style={styles.badgeContainer}>
            <span style={styles.badgePulse} />
            <span style={styles.badgeText}>{fallbackText(t("hero.badge"), "Trusted partner network")}</span>
          </span>
          <h1 id="partner-hero-title" style={styles.infoHeading}>
            {fallbackText(t("hero.title"), "Trusted partners, all in one place")}
          </h1>
          <p style={styles.infoSub}>
            {fallbackText(t("hero.subtitle"), `${totalPartners}+ vetted partners — a living network of signals. Search or pick a category to tune the field.`).replace("{count}", String(totalPartners))}
          </p>
          <input type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={fallbackText(t("hero.searchPlaceholder"), "Search partners…")}
            style={styles.infoSearch}
            aria-label={fallbackText(t("hero.searchPlaceholder"), "Search partners")}
          />
          <div style={styles.infoChips} role="tablist" aria-label="Partner categories">
            <button type="button"
              onClick={() => setActiveCategory("all")}
              style={{ ...styles.infoChip, ...(activeCategory === "all" ? styles.infoChipActive : {}) }}
            >
              {fallbackText(t("hero.all"), "All")} <span style={styles.infoChipCount}>{totalPartners}</span>
            </button>
            {chipCategories.map((c) => (
              <button type="button"
                key={c.key}
                onClick={() => setActiveCategory(c.key)}
                style={{ ...styles.infoChip, ...(activeCategory === c.key ? styles.infoChipActive : {}) }}
              >
                {fallbackText(t(`categories.${c.key}`), c.label)} <span style={styles.infoChipCount}>{c.count}</span>
              </button>
            ))}
          </div>
          <div style={styles.infoActions}>
            <Link href="/marketplace" style={styles.brandButtonPrimary}>
              {fallbackText(t("hero.seeAll"), `See all ${totalPartners} →`).replace("{count}", String(totalPartners))}
            </Link>
            <Link href="/promote" style={styles.brandButtonSecondary}>
              {fallbackText(t("hero.becomePartner"), "Become a partner")}
            </Link>
          </div>
        </div>

        {/* ============ CENTER: LIVING SIGNAL FIELD ============ */}
        <div style={styles.dirZone}>
          {/* The field: canvas waves + drifting clickable signals */}
          <div ref={fieldRef} style={styles.field}>
            <canvas ref={canvasRef} style={styles.canvas} aria-hidden="true" />
            {regionPartners.map((p) => (
              <a key={p.id}
                ref={(el) => {
                  const existing = nodesRef.current.find((n) => n.p.id === p.id);
                  if (existing) {
                    existing.el = el;
                  } else {
                    nodesRef.current.push({ p, el, x: 0, y: 0, vx: 0, vy: 0, w: 160, h: 52, hover: false, eligible: true, inPool: false, fading: null, fadeStart: 0 });
                  }
                }}
                href={`/partners/${p.id}`}
                className="sb-signal"
                style={{ opacity: 0 }}
                title={p.description || p.name}
                aria-label={`${p.name} — ${p.category_label || p.category || "partner"}`}
                onMouseEnter={() => {
                  const n = nodesRef.current.find((x) => x.p.id === p.id);
                  if (n) n.hover = true;
                }}
                onMouseLeave={() => {
                  const n = nodesRef.current.find((x) => x.p.id === p.id);
                  if (n) n.hover = false;
                }}
                onTouchStart={() => {
                  const n = nodesRef.current.find((x) => x.p.id === p.id);
                  if (n) n.hover = true;
                }}
              >
                <span className="sb-signal-logo">
                  {(() => {
                    const src = partnerFaviconOrNull({ id: p.id, name: p.name, logo: p.logo });
                    return src ? (
                      <img src={src} alt={`${p.name} logo`} loading="lazy" onError={(e) => { e.currentTarget.style.display = "none"; const sib = e.currentTarget.nextElementSibling; if (sib instanceof HTMLElement) sib.style.display = "flex"; }} />
                    ) : null;
                  })()}
                  <span className="sb-signal-mono" style={{ display: partnerFaviconOrNull({ id: p.id, name: p.name, logo: p.logo }) ? "none" : "flex" }} aria-hidden="true">
                    {p.name.charAt(0).toUpperCase()}
                  </span>
                </span>
                <span className="sb-signal-meta">
                  <span className="sb-signal-name">{p.name}</span>
                  <span className="sb-signal-cat">{fallbackText(t(`categories.${p.category_key || p.category || ""}`), p.category_label || p.category || p.network || "")}</span>
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* ============ RIGHT: SaaS STATION (compact) ============ */}
        <aside className="saas-station-panel" style={styles.stationPanel} aria-label="SaaS Stationary Station feature">
          <div style={styles.stationGlow} aria-hidden="true" />
          <div style={styles.stationHeader}>
            <span style={styles.stationEyebrow}>{fallbackText(t("hero.station.eyebrow"), "Feature • SaaS Station")}</span>
            <h2 style={styles.stationTitle}>
              {fallbackText(t("hero.station.title"), "Your SaaS Stationary Station")}
            </h2>
            <p style={styles.stationSubtitle}>
              {fallbackText(t("hero.station.subtitle"), "Office tasks — calendar, spreadsheets, reviews, outreach, promotion and assistant — in one cockpit. Try 3 free.")}
            </p>
          </div>

          <div style={{
              ...styles.trialStatus,
              ...(isAuthed ? styles.trialStatusAuthed : remaining === 0 ? styles.trialStatusEmpty : {}),
            }}
            aria-live="polite"
          >
            <span style={styles.trialStatusDot} />
            {isAuthed
              ? fallbackText(t("hero.station.signedIn"), "Signed in — unlimited")
              : remaining > 0
              ? fallbackText(t("hero.station.triesLeft"), `${remaining} free tries left`).replace("{n}", String(remaining))
              : fallbackText(t("hero.station.triesUsed"), "Free tries used — sign up to keep using")}
          </div>

          <div style={styles.toolsGrid} aria-label="Station tools">
            {stationTools.map((tool) => (
              <button type="button" key={tool.href} style={styles.toolTile} onClick={() => openTool(tool.href)}>
                <span style={styles.toolTileLabel}>{fallbackText(t(tool.nameKey), tool.label)}</span>
                <span style={styles.toolTileNote}>{fallbackText(t(tool.descKey), tool.note)}</span>
                {tool.comingSoon && (
                  <span style={{ marginTop: 7, alignSelf: "flex-start", fontSize: 10, fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase", color: "#06060a", background: "linear-gradient(135deg,#f5c542,#dfa837)", borderRadius: 999, padding: "3px 10px" }}>{comingSoonLabel}</span>
                )}
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
                <button type="button"
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
            <button type="button"
              style={styles.stationCta}
              onClick={() => attemptStationAction(() => router.push("/dashboard"))}
            >
              {fallbackText(t("hero.station.open"), "Open the station")} →
            </button>
            <div style={styles.stationManageRow}>
              {isAuthed ? (
                <button type="button" style={styles.stationManageBtn} onClick={() => void handleLogout()}>
                  {fallbackText(t("hero.station.logout"), "Log out")}
                </button>
              ) : (
                <button type="button" style={styles.stationManageBtn} onClick={handleResetTries}>
                  {fallbackText(t("hero.station.resetTries"), "Reset tries")}
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
            <span style={styles.modalEyebrow}>{fallbackText(t("hero.station.modalEyebrow"), "Concierge says")}</span>
            <h3 id="station-trial-title" style={styles.modalTitle}>{fallbackText(t("hero.station.signupTitle"), "Sign up to keep using your SaaS Station")}</h3>
            <p style={styles.modalCopy}>
              {fallbackText(t("hero.station.signupBody"), "You have used your free tries. Create an account to keep Concierge guidance, connector sync, and your office tools active. Browsing partners stays free either way.")}
            </p>
            <div style={styles.modalActions}>
              <Link href="/auth/login" style={styles.brandButtonPrimary}>{fallbackText(t("hero.station.signupCta"), "Sign Up")}</Link>
              <Link href="/pricing" style={styles.brandButtonSecondary}>{fallbackText(t("hero.station.upgradeCta"), "Upgrade to Pro")}</Link>
              <button type="button" style={styles.modalDismiss} onClick={() => setShowTrialModal(false)}>{fallbackText(t("hero.station.notNow"), "Not now")}</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .sb-hero-shell{
          position:relative;z-index:10;width:100%;
          display:grid;grid-template-columns:270px minmax(0,1fr) 340px;gap:24px;align-items:stretch;
          max-width:1360px;margin:0 auto;
        }
        @media (max-width:1100px){
          .sb-hero-shell{ grid-template-columns:1fr; }
        }
        @media (max-width:1024px){ .sb-hero-shell{ grid-template-columns:1fr; gap:30px; } }

        .sb-signal{
          position:absolute;top:0;left:0;z-index:2;
          display:flex;align-items:center;gap:10px;text-decoration:none;color:#f5f6f8;
          border:1px solid rgba(245,197,66,.2);border-radius:14px;white-space:nowrap;
          background:linear-gradient(180deg, rgba(18,18,26,.86), rgba(8,8,14,.86));
          -webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);
          padding:9px 13px 9px 9px;cursor:pointer;
          box-shadow:0 10px 30px rgba(0,0,0,.45);
          transition:opacity .5s, border-color .2s, box-shadow .2s;will-change:transform;
        }
        .sb-signal:hover{ border-color:rgba(245,197,66,.6); box-shadow:0 16px 44px rgba(0,0,0,.55), 0 0 26px rgba(245,197,66,.2); z-index:30; }
        .sb-signal-logo{ width:34px;height:34px;flex-shrink:0;border-radius:9px;overflow:hidden;display:flex;align-items:center;justify-content:center;background:#fff;border:1px solid rgba(245,197,66,.28); }
        .sb-signal-logo img{ width:26px;height:26px;object-fit:contain; }
        .sb-signal-mono{ width:100%;height:100%;align-items:center;justify-content:center;color:#11151c;font-weight:900;font-size:15px;background:linear-gradient(135deg,#f5c542,#dfa837); }
        .sb-signal-meta{ display:flex;flex-direction:column;min-width:0; }
        .sb-signal-name{ font-size:13px;font-weight:800; }
        .sb-signal-cat{ color:#dfa837;font-size:10.5px;font-weight:700; }
      `}</style>
    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  heroSection: { position: "relative", backgroundColor: "#030305", padding: "28px 24px 40px 24px", overflow: "hidden", borderBottom: "1px solid rgba(245, 197, 66, 0.13)", minHeight: "calc(100vh - 56px)", display: "flex", flexDirection: "column", justifyContent: "center" },
  srOnly: { position: "absolute", width: "1px", height: "1px", padding: 0, margin: "-1px", overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap", border: 0 },
  glowLeft: { position: "absolute", top: "-14%", left: "8%", width: "520px", height: "520px", background: "radial-gradient(circle, rgba(245, 197, 66, 0.16) 0%, transparent 68%)", pointerEvents: "none" },
  glowRight: { position: "absolute", top: "8%", right: "8%", width: "620px", height: "620px", background: "radial-gradient(circle, rgba(34, 211, 238, 0.1) 0%, transparent 62%)", pointerEvents: "none" },

  dirZone: { display: "flex", flexDirection: "column", gap: "8px", minWidth: 0, minHeight: 0, height: "100%" },
  dirHeader: { display: "flex", flexDirection: "column", gap: "10px" },

  infoCol: { display: "flex", flexDirection: "column", gap: "14px", minWidth: 0, justifyContent: "flex-start", paddingTop: "2px" },
  infoHeading: { color: "#fff", fontFamily: "inherit", fontSize: "clamp(22px, 2.4vw, 30px)", lineHeight: 1.06, letterSpacing: "-0.03em", margin: 0 },
  infoSub: { color: "rgba(255,255,255,.66)", fontSize: "14px", lineHeight: 1.5, margin: 0 },
  infoSearch: { width: "100%", height: "44px", background: "rgba(255,255,255,.05)", color: "#fff", border: "1px solid rgba(255,255,255,.12)", borderRadius: "13px", padding: "0 14px", outline: "none", fontFamily: "inherit", fontSize: "14px" },
  infoChips: { display: "flex", flexWrap: "wrap", gap: "7px" },
  infoChip: { display: "inline-flex", alignItems: "center", gap: "6px", border: "1px solid rgba(255,255,255,.12)", background: "rgba(255,255,255,.05)", color: "#fff", borderRadius: "999px", padding: "7px 11px", fontSize: "12px", fontWeight: 800, cursor: "pointer", fontFamily: "inherit" },
  infoChipActive: { borderColor: "rgba(245,197,66,.6)", background: "rgba(245,197,66,.14)", color: "#f5c542" },
  infoChipCount: { color: "rgba(255,255,255,.5)", fontSize: "10.5px", fontWeight: 800 },
  infoActions: { display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "4px" },

  dirBody: { display: "grid", gridTemplateColumns: "210px minmax(0,1fr)", gap: "16px", flex: 1, minHeight: 0 },
  rail: { display: "flex", flexDirection: "column", gap: "4px", overflowY: "auto", paddingRight: "4px", maxHeight: "100%" },
  railSearch: { width: "100%", height: "40px", background: "rgba(255,255,255,.05)", color: "#fff", border: "1px solid rgba(255,255,255,.12)", borderRadius: "12px", padding: "0 12px", outline: "none", fontFamily: "inherit", fontSize: "13px", marginBottom: "6px" },
  railItem: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", width: "100%", textAlign: "left", border: "1px solid transparent", background: "transparent", color: "rgba(255,255,255,.82)", borderRadius: "10px", padding: "8px 10px", fontSize: "12.5px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" },
  railItemActive: { borderColor: "rgba(245,197,66,.5)", background: "rgba(245,197,66,.12)", color: "#f5c542" },
  railItemLabel: { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  railCount: { color: "rgba(255,255,255,.45)", fontSize: "11px", fontWeight: 800, flexShrink: 0 },
  railGroupLabel: { color: "rgba(255,255,255,.4)", fontSize: "10px", fontWeight: 900, letterSpacing: ".12em", textTransform: "uppercase", margin: "12px 4px 4px" },

  fieldWrap: { display: "flex", flexDirection: "column", gap: "8px", minWidth: 0, minHeight: 0 },
  badgeContainer: { display: "inline-flex", alignItems: "center", gap: "10px", border: "1px solid rgba(245, 197, 66, 0.32)", background: "rgba(245, 197, 66, 0.08)", borderRadius: "999px", padding: "7px 12px", alignSelf: "flex-start" },
  badgePulse: { width: "8px", height: "8px", borderRadius: "999px", background: "#f5c542", boxShadow: "0 0 18px rgba(245, 197, 66, 0.9)" },
  badgeText: { color: "#f5c542", fontSize: "11px", fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase" },
  dirHeading: { color: "#fff", fontSize: "clamp(20px, 2.4vw, 28px)", lineHeight: 1.05, letterSpacing: "-0.03em", margin: 0 },
  dirSub: { color: "rgba(255,255,255,.66)", fontSize: "15px", lineHeight: 1.55, margin: 0, maxWidth: "640px" },

  dirControls: { display: "flex", flexDirection: "column", gap: "12px" },
  dirSearch: { width: "100%", height: "46px", background: "rgba(255,255,255,.05)", color: "#fff", border: "1px solid rgba(255,255,255,.12)", borderRadius: "14px", padding: "0 16px", outline: "none", fontFamily: "inherit", fontSize: "15px" },
  dirChips: { display: "flex", flexWrap: "wrap", gap: "8px" },
  dirChip: { display: "inline-flex", alignItems: "center", gap: "7px", border: "1px solid rgba(255,255,255,.12)", background: "rgba(255,255,255,.05)", color: "#fff", borderRadius: "999px", padding: "8px 13px", fontSize: "12.5px", fontWeight: 800, cursor: "pointer", fontFamily: "inherit" },
  dirChipActive: { borderColor: "rgba(245,197,66,.6)", background: "rgba(245,197,66,.14)", color: "#f5c542" },
  dirChipCount: { color: "rgba(255,255,255,.5)", fontSize: "11px", fontWeight: 800 },

  dirCount: { color: "rgba(255,255,255,.5)", fontSize: "12px", fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase" },

  field: { position: "relative", width: "100%", flex: 1, minHeight: "300px", border: "1px solid rgba(255,255,255,.1)", borderRadius: "22px", overflow: "hidden", background: "radial-gradient(circle at 50% 50%, #0a0a14, #040408 70%)" },
  canvas: { position: "absolute", inset: 0, display: "block", zIndex: 0 },

  dirActions: { display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "4px" },
  brandButtonPrimary: { display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: "999px", border: 0, background: "linear-gradient(135deg, #f5c542, #dfa837)", color: "#11151c", minHeight: "46px", padding: "0 22px", fontWeight: 900, fontSize: "14px", boxShadow: "0 18px 42px rgba(245, 197, 66, 0.24)", cursor: "pointer", textDecoration: "none", fontFamily: "inherit" },
  brandButtonSecondary: { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px", border: "1px solid rgba(255,255,255,.14)", borderRadius: "999px", background: "rgba(255,255,255,.06)", color: "#fff", minHeight: "46px", padding: "0 20px", fontWeight: 900, fontSize: "14px", textDecoration: "none", fontFamily: "inherit", cursor: "pointer" },

  stationPanel: { position: "relative", overflow: "hidden", width: "100%", height: "100%", border: "1px solid rgba(245, 197, 66, 0.30)", borderRadius: "24px", background: "linear-gradient(180deg, rgba(17, 24, 39, 0.86), rgba(4, 7, 13, 0.94))", padding: "24px", boxShadow: "0 22px 70px rgba(0,0,0,.42), 0 0 48px rgba(245, 197, 66, 0.1)", display: "flex", flexDirection: "column" },
  stationGlow: { position: "absolute", inset: "-35% -20% auto auto", width: "240px", height: "240px", background: "radial-gradient(circle, rgba(245,197,66,.18), transparent 65%)", pointerEvents: "none" },
  stationHeader: { position: "relative", zIndex: 1, marginBottom: "14px" },
  stationEyebrow: { color: "#f5c542", fontSize: "10px", fontWeight: 900, letterSpacing: "0.18em", textTransform: "uppercase" },
  stationTitle: { color: "#fff", fontSize: "clamp(20px, 2vw, 25px)", lineHeight: 1.1, margin: "8px 0 6px" },
  stationSubtitle: { color: "rgba(255,255,255,.62)", fontSize: "12px", lineHeight: 1.5, margin: 0 },

  trialStatus: { position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: "8px", borderRadius: "999px", padding: "8px 12px", marginBottom: "14px", fontSize: "11.5px", fontWeight: 800, color: "#f5c542", border: "1px solid rgba(245,197,66,.28)", background: "rgba(245,197,66,.08)" },
  trialStatusAuthed: { color: "#34d399", border: "1px solid rgba(52,211,153,.3)", background: "rgba(52,211,153,.08)" },
  trialStatusEmpty: { color: "#fca5a5", border: "1px solid rgba(248,113,113,.3)", background: "rgba(248,113,113,.08)" },
  trialStatusDot: { width: "7px", height: "7px", borderRadius: "999px", background: "currentColor", flexShrink: 0 },

  toolsGrid: { position: "relative", zIndex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "14px" },
  toolTile: { display: "flex", flexDirection: "column", gap: "3px", textAlign: "left", border: "1px solid rgba(245,197,66,.18)", borderRadius: "12px", padding: "13px", background: "rgba(245,197,66,.05)", minHeight: "66px", justifyContent: "center", cursor: "pointer", fontFamily: "inherit" },
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
