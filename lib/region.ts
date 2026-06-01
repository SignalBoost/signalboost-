// File: lib/region.ts
// Visitor region: auto-detect via /api/geo on first load, default to worldwide
// ("ot") when unknown/unlisted, and let the user override with a picker. The
// chosen region drives which partners are shown (worldwide + their region) and
// which affiliate URL is used.
//
// No external store: a tiny in-module value + a custom-event bus keeps the
// header picker and the hero/marquee in sync within the session. We persist the
// user's explicit choice in localStorage so it survives navigation, but NEVER
// override an explicit choice with geo on later loads.
"use client";

import { useEffect, useState } from "react";

export const WORLDWIDE = "ot";

// The markets SignalBoost actually targets — kept short on purpose. Each maps
// to a region code present in partners.json with real exclusive partners.
// Anything else detected falls back to Global ("ot").
export const REGIONS: { code: string; label: string }[] = [
  { code: "ot", label: "🌍 Global" },
  { code: "us", label: "United States" },
  { code: "pl", label: "Poland" },
  { code: "br", label: "Brazil" },
  { code: "es-latam", label: "Latin America" },
  { code: "ru", label: "Russia" },
];

const SUPPORTED = new Set(REGIONS.map((r) => r.code));
const STORAGE_KEY = "sb_region";
const EVENT = "sb-region-change";

// Map a 2-letter country (from geo) to one of our region codes. Countries we
// don't specifically target fall through to Global.
function countryToRegion(country: string): string {
  const c = (country || "").toUpperCase();
  const map: Record<string, string> = {
    US: "us",
    PL: "pl",
    BR: "br",
    RU: "ru",
    // Latin America bucket
    MX: "es-latam",
    AR: "es-latam",
    CO: "es-latam",
    PE: "es-latam",
    CL: "es-latam",
    EC: "es-latam",
    GT: "es-latam",
    BO: "es-latam",
    UY: "es-latam",
    PY: "es-latam",
    VE: "es-latam",
  };
  return map[c] || WORLDWIDE;
}

// In-memory current value (seed from storage if a prior explicit choice exists).
let current = WORLDWIDE;
let userChose = false;
if (typeof window !== "undefined") {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved && SUPPORTED.has(saved)) {
      current = saved;
      userChose = true;
    }
  } catch {
    /* ignore */
  }
}

export function getRegion(): string {
  return current;
}

export function setRegion(code: string) {
  const next = SUPPORTED.has(code) ? code : WORLDWIDE;
  current = next;
  userChose = true;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new CustomEvent(EVENT, { detail: next }));
  }
}

// React hook: returns [region, setRegion]. Auto-detects via /api/geo once, but
// only if the user hasn't already made an explicit choice.
export function useRegion(): [string, (code: string) => void] {
  const [region, setLocal] = useState<string>(current);

  useEffect(() => {
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent).detail as string;
      setLocal(detail);
    };
    window.addEventListener(EVENT, onChange);

    // Auto-detect only when the user hasn't chosen.
    if (!userChose) {
      fetch("/api/geo", { cache: "no-store" })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (userChose) return; // user picked while we were fetching
          const detected = countryToRegion(data?.country || "");
          current = detected;
          setLocal(detected);
          // Notify others (e.g. the header picker) without marking as explicit.
          window.dispatchEvent(new CustomEvent(EVENT, { detail: detected }));
        })
        .catch(() => {
          /* stay on worldwide */
        });
    }

    return () => window.removeEventListener(EVENT, onChange);
  }, []);

  return [region, setRegion];
}

// --- Partner region visibility (the revenue rule, corrected) ---------------
// A partner shows for a region when it EXPLICITLY lists that region, OR when it
// is truly global (tagged "ot" and nothing else). A partner tagged "ot" PLUS
// specific regions is regionally targeted, so it only shows in those regions.
export function partnerVisibleInRegion(
  p: { regions?: string[] },
  region: string
): boolean {
  const r = Array.isArray(p.regions) ? p.regions : [];
  if (r.includes(region)) return true;
  if (r.length === 1 && r[0] === WORLDWIDE) return true;
  return false;
}
