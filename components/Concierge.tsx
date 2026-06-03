"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import useTranslation from "@/components/i18n/useTranslation";

type ModuleName = "concierge" | "promote" | "calendar" | "reviews" | "spreadsheets" | "outreach";

type ModuleResult = {
  module: ModuleName;
  label: string;
  status: "ok" | "fallback";
  summary: string;
  actions: string[];
  data: Record<string, string | number | boolean | string[]>;
};

type OrchestrationResponse = {
  understood: string;
  status: "completed" | "needs_clarification" | "demo_fallback";
  answer: string;
  activeModules: ModuleName[];
  modules: ModuleResult[];
  options: string[];
  nextSteps: string[];
  persistence: { shouldContinue: boolean; fallbackApplied: boolean; clarificationQuestion?: string };
};

type ChatTurn = {
  role: "user" | "assistant";
  content: string;
  response?: OrchestrationResponse;
};

const MODULES: { key: ModuleName; label: string }[] = [
  { key: "concierge", label: "Concierge" },
  { key: "promote", label: "Promote" },
  { key: "calendar", label: "Calendar" },
  { key: "reviews", label: "Reviews" },
  { key: "spreadsheets", label: "Spreadsheets" },
  { key: "outreach", label: "Outreach" },
];

const VISIBLE_KEYS = new Set(["averageRating", "pendingResponses", "replyRate", "queuedLeads", "rowsReady", "campaignLift"]);

function ft(v: string, f: string) {
  return /^[a-zA-Z][\w$]*(\.[\w$]+)+$/.test(v) ? f : v;
}

const gold = "#f5c542";
const border = "rgba(255,255,255,0.08)";
const muted = "rgba(255,255,255,0.45)";
const cardBg = "rgba(255,255,255,0.03)";

export default function Concierge() {
  const { t, lang } = useTranslation();
  const STARTER = ft(t("assistant.starterText"), "Plan a launch, collect reviews, organize data, and draft outreach.");
  const [message, setMessage] = useState(STARTER);
  const [touched, setTouched] = useState(false);
  const [mod, setMod] = useState<ModuleName | "auto">("auto");
  const [loading, setLoading] = useState(false);
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [snaps, setSnaps] = useState<ModuleResult[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (!touched) setMessage(STARTER); }, [STARTER, touched]);

  useEffect(() => {
    let alive = true;
    Promise.all(MODULES.filter(m => m.key !== "concierge").map(m =>
      fetch(`/api/saas/${m.key}?lang=${encodeURIComponent(lang)}`, { cache: "no-store" })
        .then(r => r.ok ? r.json() : null).catch(() => null)
    )).then(items => { if (alive) setSnaps(items.filter(Boolean)); });
    return () => { alive = false; };
  }, [lang]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [turns]);

  const latest = useMemo(() => [...turns].reverse().find(t => t.response)?.response, [turns]);

  function reset() { setTurns([]); setMessage(STARTER); setTouched(false); }

  async function submit(raw?: string) {
    const content = (raw ?? message).trim();
    if (!content || loading) return;
    setLoading(true);
    setTurns(c => [...c, { role: "user", content }]);
    setMessage("");
    const history = turns.filter(t => t.role === "user" || t.role === "assistant")
      .map(t => ({ role: t.role, content: t.content })).slice(-40);
    try {
      const res = await fetch("/api/orchestrate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content, module: mod, lang, history }),
      });
      const data = await res.json() as OrchestrationResponse;
      setTurns(c => [...c, { role: "assistant", content: data.answer, response: data }]);
    } catch {
      setTurns(c => [...c, { role: "assistant", content: ft(t("assistant.fbAnswer"), "Continuing with safe defaults. Please try again."), response: undefined }]);
    } finally { setLoading(false); }
  }

  function handleSubmit(e: FormEvent) { e.preventDefault(); submit(); }

  const activeModules = latest?.modules.length ? latest.modules : snaps;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 64px)", fontFamily: "Arial,Helvetica,sans-serif" }}>
      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 20px", borderBottom: `1px solid ${border}`, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ color: gold, fontSize: 10, fontWeight: 900, letterSpacing: "0.18em", textTransform: "uppercase" }}>SignalBoost</span>
          <span style={{ color: "#fff", fontWeight: 900, fontSize: 15 }}>Concierge</span>
          <span style={{ color: muted, fontSize: 12 }}>— AI orchestration across all modules</span>
        </div>
        {turns.length > 0 && (
          <button onClick={reset} title="New conversation" style={{ background: "none", border: `1px solid ${border}`, borderRadius: 8, color: muted, cursor: "pointer", fontSize: 14, padding: "4px 10px" }}>↺ New</button>
        )}
      </div>

      {/* Main grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", flex: 1, minHeight: 0, gap: 0 }}>

        {/* Left: chat */}
        <div style={{ display: "flex", flexDirection: "column", minHeight: 0, borderRight: `1px solid ${border}` }}>

          {/* Module tabs */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, padding: "8px 14px", borderBottom: `1px solid ${border}`, flexShrink: 0 }}>
            {[{ key: "auto" as const, label: "Auto" }, ...MODULES].map(m => (
              <button key={m.key} onClick={() => setMod(m.key)} style={{
                background: mod === m.key ? "rgba(245,197,66,0.14)" : "rgba(255,255,255,0.05)",
                border: `1px solid ${mod === m.key ? "rgba(245,197,66,0.46)" : border}`,
                borderRadius: 20, color: mod === m.key ? gold : muted,
                cursor: "pointer", fontFamily: "inherit", fontSize: 11, fontWeight: 700, padding: "4px 10px",
              }}>{m.label}</button>
            ))}
          </div>

          {/* Messages */}
          <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
            {turns.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "12px 0" }}>
                <p style={{ color: muted, fontSize: 13 }}>{ft(t("assistant.understandBody"), "A persistent assistant that routes work across SignalBoost modules.")}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                  {[
                    { label: ft(t("assistant.starterLaunch"), "Run launch plan"), msg: STARTER },
                    { label: ft(t("assistant.starterReviews"), "Reviews + outreach"), msg: ft(t("assistant.quickReviews"), "Summarize my reviews and draft outreach") },
                    { label: ft(t("assistant.starterGeneral"), "What can SignalBoost do?"), msg: ft(t("assistant.quickGeneral"), "What can SignalBoost do?") },
                  ].map(({ label, msg }) => (
                    <button key={label} onClick={() => submit(msg)} style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 8, color: "rgba(255,255,255,0.75)", cursor: "pointer", fontFamily: "inherit", fontSize: 12, padding: "7px 12px" }}>{label}</button>
                  ))}
                </div>
              </div>
            ) : turns.map((turn, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: turn.role === "user" ? "flex-end" : "flex-start", gap: 3 }}>
                <span style={{ fontSize: 10, fontWeight: 900, color: muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {turn.role === "user" ? ft(t("assistant.you"), "You") : "Concierge"}
                </span>
                <div style={{
                  background: turn.role === "user" ? "rgba(245,197,66,0.1)" : cardBg,
                  border: `1px solid ${turn.role === "user" ? "rgba(245,197,66,0.2)" : border}`,
                  borderRadius: 12, maxWidth: "88%", padding: "10px 13px",
                }}>
                  <p style={{ fontSize: 13, lineHeight: 1.55, color: "rgba(255,255,255,0.88)", margin: 0 }}>{turn.content}</p>
                  {turn.response && (
                    <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${border}`, fontSize: 11, color: muted }}>
                      <p style={{ margin: "0 0 4px", color: "rgba(255,255,255,0.6)", fontWeight: 700 }}>{turn.response.understood}</p>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <span style={{ background: "rgba(34,211,238,0.1)", color: "#a5f3fc", borderRadius: 6, padding: "2px 7px", fontSize: 10, fontWeight: 700 }}>
                          {turn.response.status}
                        </span>
                        <span style={{ background: "rgba(34,211,238,0.1)", color: "#a5f3fc", borderRadius: 6, padding: "2px 7px", fontSize: 10, fontWeight: 700 }}>
                          {ft(t("assistant.continueLabel"), "continue")}: {turn.response.persistence.shouldContinue ? "yes" : "no"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: "flex-start" }}>
                <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 12, padding: "10px 14px", color: muted, fontSize: 13 }}>…</div>
              </div>
            )}
          </div>

          {/* Composer */}
          <div style={{ flexShrink: 0, borderTop: `1px solid ${border}`, padding: "10px 14px", display: "flex", gap: 8, alignItems: "flex-end" }}>
            <textarea
              value={message}
              onChange={e => { setTouched(true); setMessage(e.target.value); }}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }}
              placeholder={ft(t("assistant.placeholder"), "Ask for a plan, task, or general answer... (Enter to send)")}
              rows={2}
              style={{ flex: 1, background: cardBg, border: `1px solid ${border}`, borderRadius: 10, color: "#fff", fontFamily: "inherit", fontSize: 13, padding: "9px 12px", resize: "none", outline: "none" }}
            />
            <button
              onClick={() => submit()} disabled={loading}
              style={{ background: gold, border: "none", borderRadius: 10, color: "#11151c", cursor: loading ? "not-allowed" : "pointer", fontWeight: 900, fontSize: 13, padding: "9px 18px", opacity: loading ? 0.6 : 1, whiteSpace: "nowrap" }}
            >
              {loading ? "…" : ft(t("assistant.send"), "Send")}
            </button>
          </div>
        </div>

        {/* Right: side panel */}
        <div style={{ display: "flex", flexDirection: "column", overflowY: "auto", gap: 0 }}>

          {/* Options */}
          <div style={{ padding: "14px 14px 10px", borderBottom: `1px solid ${border}` }}>
            <p style={{ color: gold, fontSize: 9, fontWeight: 900, letterSpacing: "0.18em", textTransform: "uppercase", margin: "0 0 4px" }}>{ft(t("assistant.sharedAgency"), "Options")}</p>
            <p style={{ color: "#fff", fontWeight: 900, fontSize: 13, margin: "0 0 8px" }}>{ft(t("assistant.confirmAdjust"), "Confirm or adjust")}</p>
            <ul style={{ paddingLeft: 14, margin: 0, display: "flex", flexDirection: "column", gap: 4 }}>
              {(latest?.options || [ft(t("assistant.optionsEmpty"), "Send a request to see options.")]).map(o => (
                <li key={o} style={{ fontSize: 11, color: muted, lineHeight: 1.4 }}>{o}</li>
              ))}
            </ul>
          </div>

          {/* Next steps */}
          <div style={{ padding: "12px 14px 10px", borderBottom: `1px solid ${border}` }}>
            <p style={{ color: gold, fontSize: 9, fontWeight: 900, letterSpacing: "0.18em", textTransform: "uppercase", margin: "0 0 4px" }}>{ft(t("assistant.nextRefinement"), "Next refinement")}</p>
            <p style={{ color: "#fff", fontWeight: 900, fontSize: 13, margin: "0 0 8px" }}>{ft(t("assistant.nextSteps"), "Next steps")}</p>
            <ol style={{ paddingLeft: 16, margin: 0, display: "flex", flexDirection: "column", gap: 4 }}>
              {(latest?.nextSteps || [
                ft(t("assistant.stepDescribe"), "Describe the goal"),
                ft(t("assistant.stepPick"), "Pick modules"),
                ft(t("assistant.stepRun"), "Run and refine"),
              ]).map(s => (
                <li key={s} style={{ fontSize: 11, color: muted, lineHeight: 1.4 }}>{s}</li>
              ))}
            </ol>
          </div>

          {/* Active modules */}
          <div style={{ padding: "12px 14px", flex: 1, overflowY: "auto" }}>
            <p style={{ color: gold, fontSize: 9, fontWeight: 900, letterSpacing: "0.18em", textTransform: "uppercase", margin: "0 0 4px" }}>{ft(t("assistant.activeModules"), "Active modules")}</p>
            <p style={{ color: "#fff", fontWeight: 900, fontSize: 13, margin: "0 0 10px" }}>{ft(t("assistant.moduleSignals"), "Module signals")}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {activeModules.map(m => (
                <div key={m.module} style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 10, padding: "9px 11px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontWeight: 900, fontSize: 12, color: "#fff" }}>{m.label}</span>
                    <span style={{ background: m.status === "ok" ? "rgba(16,185,129,0.12)" : "rgba(245,197,66,0.1)", color: m.status === "ok" ? "#34d399" : gold, border: `1px solid ${m.status === "ok" ? "rgba(16,185,129,0.3)" : "rgba(245,197,66,0.3)"}`, borderRadius: 6, fontSize: 9, fontWeight: 900, padding: "2px 6px" }}>
                      {m.status === "ok" ? "OK" : "fallback"}
                    </span>
                  </div>
                  <p style={{ fontSize: 11, color: muted, margin: 0, lineHeight: 1.4 }}>{m.summary}</p>
                  {Object.entries(m.data).filter(([k]) => VISIBLE_KEYS.has(k)).slice(0, 1).map(([k, v]) => (
                    <p key={k} style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", margin: "3px 0 0" }}>{k}: {Array.isArray(v) ? v.join(", ") : String(v)}</p>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
