"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
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
  persistence: {
    shouldContinue: boolean;
    fallbackApplied: boolean;
    clarificationQuestion?: string;
  };
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

const VISIBLE_DATA_KEYS = new Set(["averageRating", "pendingResponses", "replyRate", "queuedLeads", "rowsReady", "forecastDelta", "campaignLift"]);

function fallbackText(value: string, fallback: string) {
  return /^[a-zA-Z][\w$]*(\.[\w$]+)+$/.test(value) ? fallback : value;
}

function dataLabel(value: string | number | boolean | string[]) {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

function statusText(status: OrchestrationResponse["status"]) {
  if (status === "completed") return "completed";
  if (status === "needs_clarification") return "needs clarification";
  return "fallback";
}

const COMPACT_STYLES = `
  .concierge-console { gap: 12px !important; }
  .concierge-console__intro { padding: 14px 18px !important; border-radius: 16px !important; }
  .concierge-console__intro h2 { font-size: clamp(16px, 2vw, 24px) !important; margin: 4px 0 6px !important; letter-spacing: -0.03em !important; }
  .concierge-console__intro p { font-size: 12px !important; line-height: 1.5 !important; }
  .cockpit-eyebrow { font-size: 10px !important; }
  .concierge-console__grid { gap: 12px !important; grid-template-columns: minmax(0,1.4fr) minmax(220px,0.6fr) !important; }
  .concierge-chat-panel { border-radius: 16px !important; grid-template-rows: auto minmax(180px,1fr) auto !important; }
  .concierge-module-switcher { gap: 5px !important; padding: 10px 12px !important; }
  .concierge-module-switcher button { font-size: 10px !important; padding: 5px 9px !important; }
  .concierge-turns { gap: 8px !important; max-height: 360px !important; padding: 12px !important; }
  .concierge-message p { font-size: 13px !important; line-height: 1.5 !important; margin-top: 4px !important; }
  .concierge-message span { font-size: 10px !important; }
  .concierge-empty-state, .concierge-message, .concierge-response-detail, .concierge-module-result { padding: 10px 12px !important; border-radius: 12px !important; }
  .concierge-response-detail { font-size: 11px !important; margin-top: 6px !important; }
  .concierge-status-row { gap: 5px !important; margin-top: 6px !important; }
  .concierge-status-row span { font-size: 9px !important; padding: 2px 6px !important; }
  .concierge-composer { gap: 7px !important; padding: 10px 12px !important; }
  .concierge-composer textarea { min-height: 56px !important; font-size: 13px !important; padding: 8px 10px !important; border-radius: 12px !important; }
  .concierge-composer button { font-size: 12px !important; min-width: 120px !important; border-radius: 12px !important; }
  .concierge-side-panel { gap: 10px !important; }
  .concierge-cardlet { padding: 12px 14px !important; border-radius: 14px !important; }
  .concierge-cardlet h3 { font-size: 13px !important; margin: 3px 0 8px !important; letter-spacing: -0.01em !important; }
  .concierge-cardlet ul, .concierge-cardlet ol { gap: 5px !important; font-size: 11px !important; padding-left: 14px !important; }
  .module-results-card { gap: 6px !important; }
  .concierge-module-result { gap: 4px !important; padding: 8px 10px !important; border-radius: 10px !important; }
  .concierge-module-result strong { font-size: 12px !important; }
  .concierge-module-result p { font-size: 11px !important; }
  .concierge-module-result span { font-size: 9px !important; padding: 2px 6px !important; }
  .telemetry-label { font-size: 9px !important; letter-spacing: 0.16em !important; }
  @media (max-width: 980px) {
    .concierge-console__grid { grid-template-columns: 1fr !important; }
  }
`;

export default function Concierge() {
  const { t, lang } = useTranslation();

  const STARTER = fallbackText(t("assistant.starterText"), "Plan a launch next week, collect reviews, organize the data, and draft outreach.");

  const [message, setMessage] = useState(STARTER);
  const [composerTouched, setComposerTouched] = useState(false);
  const [selectedModule, setSelectedModule] = useState<ModuleName | "auto">("auto");
  const [isLoading, setIsLoading] = useState(false);
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [snapshots, setSnapshots] = useState<ModuleResult[]>([]);

  useEffect(() => {
    if (!composerTouched) setMessage(STARTER);
  }, [STARTER, composerTouched]);

  useEffect(() => {
    let alive = true;
    Promise.all(
      MODULES.filter((m) => m.key !== "concierge").map((m) =>
        fetch(`/api/saas/${m.key}?lang=${encodeURIComponent(lang)}`, { cache: "no-store" })
          .then((res) => (res.ok ? res.json() : null))
          .catch(() => null)
      )
    ).then((items) => {
      if (alive) setSnapshots(items.filter(Boolean));
    });
    return () => { alive = false; };
  }, [lang]);

  const latest = useMemo(() => [...turns].reverse().find((turn) => turn.response)?.response, [turns]);

  function handleReset() {
    setTurns([]);
    setMessage(STARTER);
    setComposerTouched(false);
  }

  async function submit(raw?: string) {
    const content = (raw ?? message).trim();
    if (!content || isLoading) return;
    setIsLoading(true);
    setTurns((current) => [...current, { role: "user", content }]);
    setMessage("");
    const priorHistory = turns
      .filter((tn) => tn.role === "user" || tn.role === "assistant")
      .map((tn) => ({ role: tn.role, content: tn.content }))
      .slice(-40);
    try {
      const res = await fetch("/api/orchestrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content, module: selectedModule, lang, history: priorHistory }),
      });
      const data = (await res.json()) as OrchestrationResponse;
      setTurns((current) => [...current, { role: "assistant", content: data.answer, response: data }]);
    } catch {
      const fallback: OrchestrationResponse = {
        understood: `I understood: "${content}". Continuing with safe defaults.`,
        status: "demo_fallback",
        answer: fallbackText(t("assistant.fbAnswer"), "I will not stop the task. Use the Concierge fallback path: clarify the goal, choose a module, and continue."),
        activeModules: ["concierge"],
        modules: [],
        options: ["Retry", "Use demo data", "Switch modules"],
        nextSteps: ["Confirm the fallback", "Pick a module", "Continue refining"],
        persistence: { shouldContinue: true, fallbackApplied: true },
      };
      setTurns((current) => [...current, { role: "assistant", content: fallback.answer, response: fallback }]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit();
  }

  const activeModules = latest?.modules.length ? latest.modules : snapshots;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: COMPACT_STYLES }} />
      <section className="concierge-console" aria-label="SignalBoost Concierge AI orchestrator">
        <div className="concierge-console__intro">
          <p className="cockpit-eyebrow">{fallbackText(t("assistant.eyebrow"), "Persistent AI orchestration")}</p>
          <h2>{fallbackText(t("assistant.heading"), "Concierge understands, routes, and keeps going.")}</h2>
          <p>{fallbackText(t("assistant.intro"), "Coordinates Promote, Calendar, Reviews, Spreadsheets, Outreach, and Concierge intelligence.")}</p>
        </div>

        <div className="concierge-console__grid">
          {/* Chat panel */}
          <div className="concierge-chat-panel">
            <div className="concierge-module-switcher">
              <button className={selectedModule === "auto" ? "active" : ""} onClick={() => setSelectedModule("auto")} type="button">
                {fallbackText(t("assistant.autoRoute"), "Auto")}
              </button>
              {MODULES.map((module) => (
                <button className={selectedModule === module.key ? "active" : ""} key={module.key} onClick={() => setSelectedModule(module.key)} type="button">
                  {module.label}
                </button>
              ))}
            </div>

            <div className="concierge-turns" aria-live="polite">
              {turns.length === 0 ? (
                <div className="concierge-empty-state">
                  <strong>{fallbackText(t("assistant.understandTitle"), "What I understand so far")}</strong>
                  <p>{fallbackText(t("assistant.understandBody"), "A persistent assistant that routes work across SignalBoost modules.")}</p>
                  <div className="concierge-options">
                    <button onClick={() => submit(STARTER)} type="button">{fallbackText(t("assistant.starterLaunch"), "Run launch plan")}</button>
                    <button onClick={() => submit(fallbackText(t("assistant.quickReviews"), "Summarize my reviews and draft outreach"))} type="button">{fallbackText(t("assistant.starterReviews"), "Reviews + outreach")}</button>
                    <button onClick={() => submit(fallbackText(t("assistant.quickGeneral"), "What can SignalBoost do?"))} type="button">{fallbackText(t("assistant.starterGeneral"), "General answer")}</button>
                  </div>
                </div>
              ) : (
                turns.map((turn, index) => (
                  <div className={`concierge-message ${turn.role}`} key={`${turn.role}-${index}`}>
                    <span>{turn.role === "user" ? fallbackText(t("assistant.you"), "You") : fallbackText(t("assistant.concierge"), "Concierge")}</span>
                    <p>{turn.content}</p>
                    {turn.response && (
                      <div className="concierge-response-detail">
                        <strong>{turn.response.understood}</strong>
                        {turn.response.persistence.clarificationQuestion && <p>{turn.response.persistence.clarificationQuestion}</p>}
                        <div className="concierge-status-row">
                          <span>{fallbackText(t("assistant.statusLabel"), "Status")}: {statusText(turn.response.status)}</span>
                          <span>{fallbackText(t("assistant.continueLabel"), "Continue")}: {turn.response.persistence.shouldContinue ? "yes" : "no"}</span>
                          <span>{fallbackText(t("assistant.fallbackLabel"), "Fallback")}: {turn.response.persistence.fallbackApplied ? "active" : "not needed"}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <form className="concierge-composer" onSubmit={handleSubmit}>
              <textarea
                aria-label="Ask SignalBoost Concierge"
                onChange={(event) => { setComposerTouched(true); setMessage(event.target.value); }}
                placeholder={fallbackText(t("assistant.placeholder"), "Ask for a plan, module task, or general answer...")}
                rows={3}
                value={message}
              />
              <div style={{ display: "flex", gap: 8, alignSelf: "stretch" }}>
                <button disabled={isLoading} type="submit" style={{ flex: 1 }}>
                  {isLoading ? fallbackText(t("assistant.routing"), "Routing...") : fallbackText(t("assistant.send"), "Send to Concierge")}
                </button>
                {turns.length > 0 && (
                  <button
                    type="button"
                    onClick={handleReset}
                    title="New conversation"
                    style={{ padding: "0 14px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 12, color: "rgba(255,255,255,0.55)", cursor: "pointer", fontSize: 16 }}
                  >↺</button>
                )}
              </div>
            </form>
          </div>

          {/* Side panel */}
          <aside className="concierge-side-panel">
            <div className="concierge-cardlet">
              <span className="telemetry-label">{fallbackText(t("assistant.sharedAgency"), "Options")}</span>
              <h3>{fallbackText(t("assistant.confirmAdjust"), "Confirm or adjust")}</h3>
              <ul>
                {(latest?.options || [fallbackText(t("assistant.optionsEmpty"), "Send a request to see options.")]).map((option) => (
                  <li key={option}>{option}</li>
                ))}
              </ul>
            </div>

            <div className="concierge-cardlet">
              <span className="telemetry-label">{fallbackText(t("assistant.nextRefinement"), "Next refinement")}</span>
              <h3>{fallbackText(t("assistant.nextSteps"), "Next steps")}</h3>
              <ol>
                {(latest?.nextSteps || [
                  fallbackText(t("assistant.stepDescribe"), "Describe the goal"),
                  fallbackText(t("assistant.stepPick"), "Pick modules"),
                  fallbackText(t("assistant.stepRun"), "Run and refine"),
                ]).map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>

            <div className="concierge-cardlet module-results-card">
              <span className="telemetry-label">{fallbackText(t("assistant.activeModules"), "Active modules")}</span>
              <h3>{fallbackText(t("assistant.moduleSignals"), "Module signals")}</h3>
              {activeModules.map((module) => (
                <article className="concierge-module-result" key={`${module.module}-${module.summary}`}>
                  <div>
                    <strong>{module.label}</strong>
                    <span>{module.status === "ok" ? "OK" : "fallback"}</span>
                  </div>
                  <p>{module.summary}</p>
                  {Object.entries(module.data)
                    .filter(([key]) => VISIBLE_DATA_KEYS.has(key))
                    .slice(0, 2)
                    .map(([key, value]) => (
                      <div key={key} style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                        {key}: {dataLabel(value)}
                      </div>
                    ))}
                </article>
              ))}
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
