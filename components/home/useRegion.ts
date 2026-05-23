// File: components/home/useRegion.ts
// Phase B1 of the homepage conversion — the client "brain".
//
// Runs the SAME detection chain as public/index.html and persists choices to the
// SAME localStorage keys, so behavior + returning-visitor state are identical:
//   region:  ?region/?country override -> /api/geo -> ipapi -> ipwho ->
//            timezone -> browser language -> 'ot'
//   language: ?lang override -> manual saved (sb_lang_<region>) ->
//             region default (REGION_LANGUAGE) ; normalized to allowed set
//
// localStorage keys (unchanged): sb_lang_<region>, sb_lang_manual_<region>,
// sb_region, sb_region_manual, sb_lang (legacy compat).

"use client";

import { useCallback, useEffect, useState } from "react";
import {
  REGIONS,
  isValidRegion,
  normalizeRegionKey,
  regionFromCountry,
  browserRegion,
  parseGeoPayload,
} from "@/lib/home/regions";
import {
  REGION_LANGUAGE,
  normalizeLangForRegion,
  allowedLanguagesForRegion,
} from "@/lib/home/i18n-home";

const langKeyForRegion = (region: string) => "sb_lang_" + region;
const langManualKeyForRegion = (region: string) => "sb_lang_manual_" + region;

function getParam(name: string): string | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get(name);
}

function getSavedLang(region: string): string {
  if (typeof localStorage === "undefined")
    return normalizeLangForRegion(region, REGION_LANGUAGE[region] || "en");
  const regionalSaved = localStorage.getItem(langKeyForRegion(region));
  if (regionalSaved) return normalizeLangForRegion(region, regionalSaved);
  const oldGlobal = localStorage.getItem("sb_lang");
  if (oldGlobal) {
    // Legacy migration guard: never reuse Portuguese outside Brazil.
    if (oldGlobal === "pt-BR" && region !== "br")
      return normalizeLangForRegion(region, REGION_LANGUAGE[region] || "en");
    return normalizeLangForRegion(region, oldGlobal);
  }
  return normalizeLangForRegion(region, REGION_LANGUAGE[region] || "en");
}

function saveLang(region: string, lang: string, manual = true) {
  const safe = normalizeLangForRegion(region, lang);
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(langKeyForRegion(region), safe);
    if (manual) localStorage.setItem(langManualKeyForRegion(region), "1");
    localStorage.setItem("sb_lang", safe); // legacy compat
  }
  return safe;
}

async function fetchJsonWithTimeout(url: string, timeoutMs = 1800): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { cache: "no-store", signal: controller.signal });
    if (!res.ok) throw new Error(url + " status " + res.status);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

async function detectRegion(): Promise<string> {
  const urlRegion = normalizeRegionKey(getParam("region"));
  if (urlRegion && isValidRegion(urlRegion)) return urlRegion; // ?region=pl etc.

  const urlCountry = getParam("country");
  if (urlCountry) {
    const byUrlCountry = regionFromCountry(urlCountry);
    if (isValidRegion(byUrlCountry)) return byUrlCountry;
  }

  const providers = ["/api/geo", "https://ipapi.co/json/", "https://ipwho.is/"];
  for (const provider of providers) {
    try {
      const detected = parseGeoPayload(await fetchJsonWithTimeout(provider));
      if (detected && isValidRegion(detected)) return detected;
    } catch {
      /* provider unavailable; try next */
    }
  }
  return browserRegion();
}

export interface UseRegion {
  region: string;
  lang: string;
  ready: boolean;
  regions: typeof REGIONS;
  allowedLangs: string[];
  setRegion: (region: string) => void;
  setLanguage: (lang: string, manual?: boolean) => void;
}

export function useRegion(): UseRegion {
  // Start from a synchronous best-guess so first paint isn't empty; the async
  // chain refines it once /api/geo resolves (same as the current page).
  const [region, setRegionState] = useState<string>("ot");
  const [lang, setLangState] = useState<string>("en");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const initial =
        (normalizeRegionKey(getParam("region")) &&
          isValidRegion(normalizeRegionKey(getParam("region"))!)
          ? normalizeRegionKey(getParam("region"))
          : browserRegion()) || "ot";
      if (!cancelled) {
        setRegionState(initial);
        setLangState(normalizeLangForRegion(initial, getSavedLang(initial)));
      }

      const detected = await detectRegion();
      if (cancelled || !isValidRegion(detected)) {
        if (!cancelled) setReady(true);
        return;
      }
      const requestedLang = getParam("lang");
      const manual =
        typeof localStorage !== "undefined" &&
        localStorage.getItem(langManualKeyForRegion(detected)) === "1";
      const nextLang = requestedLang
        ? normalizeLangForRegion(detected, requestedLang)
        : manual
        ? getSavedLang(detected)
        : normalizeLangForRegion(detected, REGION_LANGUAGE[detected] || "en");
      if (!cancelled) {
        setRegionState(detected);
        setLangState(nextLang);
        setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setRegion = useCallback((next: string) => {
    if (!isValidRegion(next)) return;
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("sb_region", next);
      localStorage.setItem("sb_region_manual", "1");
    }
    setRegionState(next);
    // If the user hasn't manually chosen a language for that region, use default.
    const manual =
      typeof localStorage !== "undefined" &&
      localStorage.getItem(langManualKeyForRegion(next)) === "1";
    setLangState(
      manual ? getSavedLang(next) : normalizeLangForRegion(next, REGION_LANGUAGE[next] || "en")
    );
  }, []);

  const setLanguage = useCallback(
    (next: string, manual = true) => {
      const safe = saveLang(region, next, manual);
      setLangState(safe);
    },
    [region]
  );

  return {
    region,
    lang,
    ready,
    regions: REGIONS,
    allowedLangs: allowedLanguagesForRegion(region),
    setRegion,
    setLanguage,
  };
}
