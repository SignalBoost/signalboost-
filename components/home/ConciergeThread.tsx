// File: components/home/ConciergeThread.tsx
// R5 — results / conversation view (Claude-style mini-thread).
//
// Renders the user's query as a message, a short Concierge response line, and
// the matched partner cards inline. Clicking a card records the click to visitor
// memory (R2) then tries to open the partner EMBEDDED in an in-page modal
// (iframe). Most affiliate sites block framing (X-Frame-Options / CSP
// frame-ancestors), so if the iframe hasn't signaled load within a short window
// we treat it as blocked and fall back to opening the affiliate URL in a new tab
// (rel/noopener, revenue-safe). Either way the visitor never sees a blank box.
//
// Presentational + memory side-effect on click. Matching is done by the parent
// (HomeApp, R7) using conciergeMatch (R3); results are passed in as turns.

"use client";

import { useEffect, useRef, useState } from "react";
import { CATEGORY_META } from "@/lib/home/i18n-home";
import { type MatchResult } from "@/lib/home/concierge-match";
import { recordClick } from "@/lib/home/visitor-memory";

export interface Turn {
  query: string;
  responseLine: string; // e.g. "I found 4 partners for flights to Peru."
  matches: MatchResult[];
}

export interface ConciergeThreadProps {
  lang: string;
  region: string;
  turns: Turn[];
  onRefine: (query: string) => void;
  refinePlaceholder: string;
  partnerDesc: (p: { description?: string; description_i18n?: Record<string, string>; category_key?: string }) => string;
  emptyHelp: string; // shown when a turn has no matches
}

// How long to wait for the iframe to confirm it loaded before assuming the
// partner site blocked embedding and falling back to a new tab.
const EMBED_WAIT_MS = 2500;

interface ActivePartner {
  name: string;
  url: string;
}

export default function ConciergeThread({
  lang,
  region,
  turns,
  onRefine,
  refinePlaceholder,
  partnerDesc,
  emptyHelp,
}: ConciergeThreadProps) {
  const [refine, setRefine] = useState("");

  // Embedded-viewer modal state.
  const [active, setActive] = useState<ActivePartner | null>(null);
  const [embedState, setEmbedState] = useState<"loading" | "ok" | "blocked">("loading");
  const loadedRef = useRef(false);
  const waitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const catName = (key: string) =>
    (CATEGORY_META[key] as unknown as Record<string, string>)?.[lang] ||
    CATEGORY_META[key]?.en ||
    key;

  // localized small labels for the modal
  const L = (en: string, map: Record<string, string>) => map[lang] || en;
  const openingLabel = L("Opening…", {
    "pt-BR": "Abrindo…", es: "Abriendo…", pl: "Otwieram…", de: "Wird geöffnet…", fr: "Ouverture…", it: "Apertura…",
  });
  const blockedLabel = L("This partner opens in a new tab.", {
    "pt-BR": "Este parceiro abre em uma nova aba.",
    es: "Este socio se abre en una pestaña nueva.",
    pl: "Ten partner otwiera się w nowej karcie.",
    de: "Dieser Partner öffnet in einem neuen Tab.",
    fr: "Ce partenaire s'ouvre dans un nouvel onglet.",
    it: "Questo partner si apre in una nuova scheda.",
  });
  const openTabLabel = L("Open in new tab", {
    "pt-BR": "Abrir em nova aba", es: "Abrir en pestaña nueva", pl: "Otwórz w nowej karcie", de: "In neuem Tab öffnen", fr: "Ouvrir dans un nouvel onglet", it: "Apri in nuova scheda",
  });
  const closeLabel = L("Close", {
    "pt-BR": "Fechar", es: "Cerrar", pl: "Zamknij", de: "Schließen", fr: "Fermer", it: "Chiudi",
  });

  const openInNewTab = (url: string) => {
    window.open(url, "_blank", "noopener");
  };

  const handleCardClick = (m: MatchResult, query: string, intentCat: string | undefined) => {
    recordClick({
      partnerId: m.partner.id,
      query,
      intent: intentCat,
      region,
      affiliateUrl: m.url,
    });
    // Open the embedded viewer; it will fall back to a new tab if blocked.
    loadedRef.current = false;
    setEmbedState("loading");
    setActive({ name: m.partner.name, url: m.url });
  };

  // When the modal opens, start the "did it load?" watchdog. If the iframe
  // never fires onLoad (cross-origin frame blocked), fall back to a new tab.
  useEffect(() => {
    if (!active) return;
    if (waitTimer.current) clearTimeout(waitTimer.current);
    waitTimer.current = setTimeout(() => {
      if (!loadedRef.current) {
        setEmbedState("blocked");
        openInNewTab(active.url);
      }
    }, EMBED_WAIT_MS);
    return () => {
      if (waitTimer.current) clearTimeout(waitTimer.current);
    };
  }, [active]);

  const closeModal = () => {
    if (waitTimer.current) clearTimeout(waitTimer.current);
    setActive(null);
    setEmbedState("loading");
    loadedRef.current = false;
  };

  // Esc closes the modal.
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  const submitRefine = () => {
    const q = refine.trim();
    if (q) {
      onRefine(q);
      setRefine("");
    }
  };

  return (
    <section className="concierge-thread">
      {turns.map((turn, ti) => (
        <div className="concierge-turn" key={ti}>
          <div className="concierge-user-msg">{turn.query}</div>
          <div className="concierge-reply">{turn.responseLine}</div>

          {turn.matches.length === 0 ? (
            <div className="concierge-empty">{emptyHelp}</div>
          ) : (
            <div className="concierge-cards">
              {turn.matches.map((m) => (
                <button
                  key={m.partner.id}
                  type="button"
                  className="concierge-card"
                  onClick={() => handleCardClick(m, turn.query, m.partner.category_key)}
                >
                  <div className="concierge-card-top">
                    <span className="concierge-card-cat">
                      {CATEGORY_META[m.partner.category_key || ""]?.icon || "•"}{" "}
                      {catName(m.partner.category_key || "")}
                    </span>
                    {m.partner.network && (
                      <span className="concierge-card-net">{m.partner.network}</span>
                    )}
                  </div>
                  <div className="concierge-card-name">{m.partner.name}</div>
                  <div className="concierge-card-desc">{partnerDesc(m.partner)}</div>
                  <span className="concierge-card-cta" aria-hidden="true">→</span>
                </button>
              ))}
            </div>
          )}
        </div>
      ))}

      <div className="concierge-refine-wrap">
        <input
          className="concierge-refine"
          value={refine}
          onChange={(e) => setRefine(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submitRefine();
          }}
          placeholder={refinePlaceholder}
        />
        <button className="concierge-refine-send" onClick={submitRefine} aria-label="Send">
          →
        </button>
      </div>

      {/* Embedded partner viewer (tries iframe, falls back to new tab) */}
      {active && (
        <div className="sb-embed-overlay" role="dialog" aria-modal="true" onClick={closeModal}>
          <div className="sb-embed-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sb-embed-bar">
              <span className="sb-embed-title">{active.name}</span>
              <div className="sb-embed-actions">
                <button className="sb-embed-newtab" onClick={() => openInNewTab(active.url)}>
                  ↗ {openTabLabel}
                </button>
                <button className="sb-embed-close" onClick={closeModal} aria-label={closeLabel}>
                  ×
                </button>
              </div>
            </div>

            <div className="sb-embed-body">
              {embedState === "blocked" ? (
                <div className="sb-embed-fallback">
                  <p>{blockedLabel}</p>
                  <button className="sb-embed-fallback-btn" onClick={() => openInNewTab(active.url)}>
                    ↗ {openTabLabel}
                  </button>
                </div>
              ) : (
                <>
                  {embedState === "loading" && (
                    <div className="sb-embed-loading">{openingLabel}</div>
                  )}
                  <iframe
                    className="sb-embed-frame"
                    src={active.url}
                    title={active.name}
                    referrerPolicy="no-referrer-when-downgrade"
                    onLoad={() => {
                      loadedRef.current = true;
                      setEmbedState("ok");
                    }}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
