// File: components/home/NudgeBubble.tsx
// R6 — proactive marketing nudge + returning-visitor greeting.
//
// Two jobs, one component:
//  1) Idle / no-results nudge: after ~18s of no interaction, or when a search
//     returns nothing, surface a friendly bubble ("Can I help you find what you
//     need?") that focuses the Concierge on click.
//  2) Returning greeting: if memory has a previous search, show a SUBTLE,
//     NEUTRAL line ("Welcome back — need help continuing?"). Per brief: remember
//     intent, never imply a purchase happened.
//
// Dismissible; won't re-nag in the same session. Presentational + reads memory.

"use client";

import { useEffect, useRef, useState } from "react";
import { I18N } from "@/lib/home/i18n-home";
import { isReturningVisitor, lastSearchQuery } from "@/lib/home/visitor-memory";

const IDLE_MS = 18000;
const SESSION_DISMISS_KEY = "sb_nudge_dismissed_session";

export interface NudgeBubbleProps {
  lang: string;
  // Becomes true when a search returned no matches (immediate nudge trigger).
  noResults?: boolean;
  // Called when the user accepts the nudge — focus the Concierge input.
  onAccept: () => void;
}

export default function NudgeBubble({ lang, noResults, onAccept }: NudgeBubbleProps) {
  const t = (key: string, fallback: string) => I18N[lang]?.[key] || I18N.en[key] || fallback;
  const [open, setOpen] = useState(false);
  const [greeting, setGreeting] = useState<string | null>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Returning-visitor greeting (subtle, neutral). Built from last search intent.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isReturningVisitor()) return;
    const last = lastSearchQuery();
    if (!last) return;
    const templates: Record<string, string> = {
      en: `Welcome back. Last time you looked for "${last}". Need help continuing?`,
      "pt-BR": `Que bom te ver de novo. Da última vez você buscou "${last}". Quer ajuda para continuar?`,
      es: `Qué bueno verte de nuevo. La última vez buscaste "${last}". ¿Te ayudo a continuar?`,
      pl: `Miło Cię znów widzieć. Ostatnio szukałeś "${last}". Pomóc kontynuować?`,
      de: `Willkommen zurück. Zuletzt hast du nach "${last}" gesucht. Soll ich weiterhelfen?`,
      fr: `Content de vous revoir. La dernière fois, vous cherchiez "${last}". Besoin d'aide pour continuer ?`,
      it: `Bentornato. L'ultima volta cercavi "${last}". Vuoi aiuto per continuare?`,
    };
    setGreeting(templates[lang] || templates.en);
  }, [lang]);

  // No-results triggers the nudge immediately.
  useEffect(() => {
    if (noResults && !dismissedThisSession()) setOpen(true);
  }, [noResults]);

  // Idle trigger: open the nudge after IDLE_MS of no pointer/key/scroll activity.
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
    rememberDismiss();
  };
  const accept = () => {
    setOpen(false);
    rememberDismiss();
    onAccept();
  };

  if (!open && !greeting) return null;

  const nudgeText =
    {
      en: "Can I help you find what you need?",
      "pt-BR": "Posso te ajudar a encontrar o que você precisa?",
      es: "¿Puedo ayudarte a encontrar lo que buscas?",
      pl: "Czy mogę pomóc znaleźć to, czego szukasz?",
      de: "Kann ich dir helfen, das Richtige zu finden?",
      fr: "Puis-je vous aider à trouver ce qu'il vous faut ?",
      it: "Posso aiutarti a trovare ciò che cerchi?",
    }[lang] || "Can I help you find what you need?";

  const yesLabel =
    { en: "Yes, help me", "pt-BR": "Sim, me ajude", es: "Sí, ayúdame", pl: "Tak, pomóż", de: "Ja, hilf mir", fr: "Oui, aidez-moi", it: "Sì, aiutami" }[lang] || "Yes, help me";

  return (
    <div className="sb-nudge" role="dialog" aria-live="polite">
      <button className="sb-nudge-close" onClick={close} aria-label="Close">
        ×
      </button>
      <div className="sb-nudge-body">{greeting || nudgeText}</div>
      <button className="sb-nudge-cta" onClick={accept}>
        {yesLabel}
      </button>
    </div>
  );
}
