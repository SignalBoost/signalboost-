// File: components/home/NudgeBubble.tsx
// R6 — proactive nudge + returning-visitor greeting (now calmer + resettable).
//
// Two jobs:
//  1) Idle / no-results nudge: after ~20s of no interaction, or when a search
//     returns nothing, surface a friendly bubble that focuses the Concierge.
//  2) Returning greeting: if memory has a previous search, show a SUBTLE line
//     ("Welcome back — need help continuing?"). Per brief: remember intent,
//     never imply a purchase happened.
//
// New in this version:
//  - The returning greeting no longer fires on the very first paint; it waits a
//    moment so it never dominates a fresh landing.
//  - A small "Start fresh" link clears saved memory (forgets old searches) and
//    hides the bubble — fixes the "stuck on my old Frankfurt search" problem.
//  - Dismiss is remembered for the session so it won't re-nag.
//
// Dismissible; presentational + reads/clears memory.

"use client";

import { useEffect, useRef, useState } from "react";
import { I18N } from "@/lib/home/i18n-home";
import { isReturningVisitor, lastSearchQuery, clearMemory } from "@/lib/home/visitor-memory";

const IDLE_MS = 20000;
const GREETING_DELAY_MS = 1500; // let the hero land first
const SESSION_DISMISS_KEY = "sb_nudge_dismissed_session";

export interface NudgeBubbleProps {
  lang: string;
  noResults?: boolean;
  onAccept: () => void;
}

export default function NudgeBubble({ lang, noResults, onAccept }: NudgeBubbleProps) {
  const [open, setOpen] = useState(false);
  const [greeting, setGreeting] = useState<string | null>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const L = (en: string, map: Record<string, string>) => map[lang] || en;

  const dismissedThisSession = () => {
    try {
      return sessionStorage.getItem(SESSION_DISMISS_KEY) === "1";
    } catch {
      return false;
    }
  };
  const rememberDismiss = () => {
    try {
      sessionStorage.setItem(SESSION_DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  // Returning-visitor greeting — subtle, and delayed so it doesn't dominate the
  // first paint of the hero.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isReturningVisitor()) return;
    if (dismissedThisSession()) return;
    const last = lastSearchQuery();
    if (!last) return;
    const short = last.length > 42 ? last.slice(0, 42).trim() + "…" : last;
    const templates: Record<string, string> = {
      en: `Welcome back — want help continuing your search for "${short}"?`,
      "pt-BR": `Que bom te ver de novo — quer ajuda para continuar a busca por "${short}"?`,
      es: `Qué bueno verte de nuevo — ¿te ayudo a continuar con "${short}"?`,
      pl: `Miło Cię znów widzieć — pomóc kontynuować "${short}"?`,
      de: `Willkommen zurück — soll ich bei "${short}" weiterhelfen?`,
      fr: `Content de vous revoir — besoin d'aide pour continuer « ${short} » ?`,
      it: `Bentornato — vuoi aiuto per continuare "${short}"?`,
    };
    const id = setTimeout(() => setGreeting(templates[lang] || templates.en), GREETING_DELAY_MS);
    return () => clearTimeout(id);
  }, [lang]);

  // No-results triggers the nudge immediately.
  useEffect(() => {
    if (noResults && !dismissedThisSession()) setOpen(true);
  }, [noResults]);

  // Idle trigger.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const reset = () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      if (dismissedThisSession()) return;
      idleTimer.current = setTimeout(() => setOpen(true), IDLE_MS);
    };
    const events = ["mousemove", "keydown", "scroll", "touchstart", "click"];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();
    return () => {
      events.forEach((e) => window.removeEventListener(e, reset));
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, []);

  const close = () => {
    setOpen(false);
    setGreeting(null);
    rememberDismiss();
  };
  const accept = () => {
    setOpen(false);
    setGreeting(null);
    rememberDismiss();
    onAccept();
  };
  // Start fresh: forget saved searches so the greeting won't return.
  const startFresh = () => {
    clearMemory();
    setOpen(false);
    setGreeting(null);
    rememberDismiss();
    onAccept();
  };

  if (!open && !greeting) return null;

  const nudgeText = L("Can I help you find what you need?", {
    "pt-BR": "Posso te ajudar a encontrar o que você precisa?",
    es: "¿Puedo ayudarte a encontrar lo que buscas?",
    pl: "Czy mogę pomóc znaleźć to, czego szukasz?",
    de: "Kann ich dir helfen, das Richtige zu finden?",
    fr: "Puis-je vous aider à trouver ce qu'il vous faut ?",
    it: "Posso aiutarti a trovare ciò che cerchi?",
  });

  const yesLabel = L("Yes, help me", {
    "pt-BR": "Sim, me ajude", es: "Sí, ayúdame", pl: "Tak, pomóż", de: "Ja, hilf mir", fr: "Oui, aidez-moi", it: "Sì, aiutami",
  });

  const freshLabel = L("Start fresh", {
    "pt-BR": "Começar do zero", es: "Empezar de nuevo", pl: "Zacznij od nowa", de: "Neu starten", fr: "Recommencer", it: "Ricomincia",
  });

  // A returning greeting is the calmer variant; the idle/no-results nudge is the
  // standard prompt. Greeting takes priority if present.
  const isGreeting = Boolean(greeting);

  return (
    <div className={"sb-nudge" + (isGreeting ? " sb-nudge-greeting" : "")} role="dialog" aria-live="polite">
      <button className="sb-nudge-close" onClick={close} aria-label="Close">
        ×
      </button>
      <div className="sb-nudge-body">{greeting || nudgeText}</div>
      <button className="sb-nudge-cta" onClick={accept}>
        {yesLabel}
      </button>
      {isGreeting && (
        <button className="sb-nudge-fresh" onClick={startFresh}>
          {freshLabel}
        </button>
      )}
    </div>
  );
}
