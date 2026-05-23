// File: components/home/ConciergeThread.tsx
// R5 — results / conversation view (Claude-style mini-thread).
//
// Renders the user's query as a message, a short Concierge response line, and
// the matched partner cards inline (logo, name, localized description, affiliate
// button). Clicks record to visitor memory (R2) then open the partner in a new
// tab with rel="sponsored". 3–5 results. Refine box continues the thread.
//
// Presentational + memory side-effect on click. Matching is done by the parent
// (HomeApp, R7) using conciergeMatch (R3); results are passed in as turns.

"use client";

import { useState } from "react";
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
  const catName = (key: string) =>
    (CATEGORY_META[key] as unknown as Record<string, string>)?.[lang] ||
    CATEGORY_META[key]?.en ||
    key;

  const handleClick = (m: MatchResult, query: string, intentCat: string | undefined) => {
    recordClick({
      partnerId: m.partner.id,
      query,
      intent: intentCat,
      region,
      affiliateUrl: m.url,
    });
    // Link itself handles opening in a new tab (rel set on the anchor).
  };

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
                <a
                  key={m.partner.id}
                  className="concierge-card"
                  href={m.url}
                  target="_blank"
                  rel="noopener sponsored"
                  onClick={() => handleClick(m, turn.query, m.partner.category_key)}
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
                  <span className="concierge-card-cta">→</span>
                </a>
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
    </section>
  );
}
