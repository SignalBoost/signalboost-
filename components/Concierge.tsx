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

function fallbackText(value: string, fallback: string) {
  return /^[a-zA-Z][\w$]*(\.[\w$]+)+$/.test(value) ? fallback : value;
}

export default function Concierge() {
  const { t, lang } = useTranslation();

  const STARTER = fallbackText(t("assistant.starterText"), "Plan a launch next week, collect reviews, organize the data, and draft outreach.");

  const [message, setMessage] = useState(STARTER);
  const [composerTouched, setComposerTouched] = useState(false);
  const [selectedModule, setSelectedModule] = useState<ModuleName | "auto">("auto");

  // The translation dictionary loads after the first render, so STARTER is the
  // English fallback initially. Sync the composer to the localized starter text
  // once it resolves (and when the language changes) — but stop overwriting as
  // soon as the user edits the field.
  useEffect(() => {
    if (!composerTouched) setMessage(STARTER);
  }, [STARTER, composerTouched]);
  const [isLoading, setIsLoading] = useState(false);
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [snapshots, setSnapshots] = useState<ModuleResult[]>([]);

  function dataLabel(value: string | number | boolean | string[]) {
    if (Array.isArray(value)) return value.join(", ");
    if (typeof value === "boolean") return value ? fallbackText(t("assistant.dataYes"), "Yes") : fallbackText(t("assistant.dataNo"), "No");
    return String(value);
  }

  function statusText(status: OrchestrationResponse["status"]) {
    if (status === "completed") return fallbackText(t("assistant.statusCompleted"), "completed");
    if (status === "needs_clarification") return fallbackText(t("assistant.statusNeedsClarification"), "needs clarification");
    return fallbackText(t("assistant.statusDemoFallback"), "demo fallback");
  }

  useEffect(() => {
    let alive = true;
    Promise.all(
      MODULES.filter((module) => module.key !== "concierge").map((module) =>
        fetch(`/api/saas/${module.key}?lang=${encodeURIComponent(lang)}`, { cache: "no-store" })
          .then((res) => (res.ok ? res.json() : null))
          .catch(() => null)
      )
    ).then((items) => {
      if (alive) setSnapshots(items.filter(Boolean));
    });
    return () => {
      alive = false;
    };
  }, [lang]);

  const latest = useMemo(() => [...turns].reverse().find((turn) => turn.response)?.response, [turns]);

  async function submit(raw?: string) {
    const content = (raw ?? message).trim();
    if (!content || isLoading) return;

    setIsLoading(true);
    setTurns((current) => [...current, { role: "user", content }]);
    setMessage("");

    // Send the prior conversation so the AI has memory of earlier turns
    // (e.g. a company it just described). Map to {role, content} and cap length.
    const priorHistory = turns
      .filter((tn) => tn.role === "user" || tn.role === "assistant")
      .map((tn) => ({ role: tn.role, content: tn.content }))
      .slice(-10);

    try {
      const res = await fetch("/api/orchestrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content, module: selectedModule, lang, history: priorHistory }),
      });
      const data = (await res.json()) as OrchestrationResponse;
      setTurns((current) => [
        ...current,
        {
          role: "assistant",
          content: data.answer,
          response: data,
        },
      ]);
    } catch {
      const fallback: OrchestrationResponse = {
        understood: fallbackText(t("assistant.fbUnderstood"), `I understood this as: “${content}”. The live orchestrator did not respond, so I am continuing with demo-safe defaults.`).replace("{msg}", content),
        status: "demo_fallback",
        answer: fallbackText(t("assistant.fbAnswer"), "I will not stop the task. Use the Concierge fallback path: clarify the goal, choose Calendar/Reviews/Spreadsheets/Outreach, and continue with demo data until live APIs recover."),
        activeModules: ["concierge"],
        modules: [],
        options: [
          fallbackText(t("assistant.fbOpt1"), "Retry live orchestration"),
          fallbackText(t("assistant.fbOpt2"), "Use demo data"),
          fallbackText(t("assistant.fbOpt3"), "Switch modules"),
        ],
        nextSteps: [
          fallbackText(t("assistant.fbStep1"), "Confirm the fallback"),
          fallbackText(t("assistant.fbStep2"), "Pick a module"),
          fallbackText(t("assistant.fbStep3"), "Continue refining"),
        ],
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

  return (
    <section className="concierge-console" aria-label="SignalBoost Concierge AI orchestrator">
      <div className="concierge-console__intro">
        <p className="cockpit-eyebrow">{fallbackText(t("assistant.eyebrow"), "Persistent AI orchestration")}</p>
        <h2>{fallbackText(t("assistant.heading"), "Concierge understands, routes, refines, and keeps going.")}</h2>
        <p>{fallbackText(t("assistant.intro"), "The assistant coordinates Promote, Calendar, Reviews, Spreadsheets, Outreach, and Concierge intelligence. If a module is missing data, it shows fallback demo data instead of ending the task.")}</p>
      </div>

      <div className="concierge-console__grid">
        <div className="concierge-chat-panel">
          <div className="concierge-module-switcher" aria-label="Module routing options">
            <button className={selectedModule === "auto" ? "active" : ""} onClick={() => setSelectedModule("auto")} type="button">
              {fallbackText(t("assistant.autoRoute"), "Auto-route")}
            </button>
            {MODULES.map((module) => (
              <button className={selectedModule === module.key ? "active" : ""}
                key={module.key}
                onClick={() => setSelectedModule(module.key)}
                type="button"
              >
                {module.label}
              </button>
            ))}
          </div>

          <div className="concierge-turns" aria-live="polite">
            {turns.length === 0 ? (
              <div className="concierge-empty-state">
                <strong>{fallbackText(t("assistant.understandTitle"), "What I understand so far")}</strong>
                <p>{fallbackText(t("assistant.understandBody"), "You want a persistent assistant that asks or defaults when details are vague, then routes work across SaaS modules.")}</p>
                <div className="concierge-options">
                  <button onClick={() => submit(STARTER)} type="button">{fallbackText(t("assistant.starterLaunch"), "Run launch plan")}</button>
                  <button onClick={() => submit(fallbackText(t("assistant.quickReviews"), "Summarize my reviews and draft outreach"))} type="button">{fallbackText(t("assistant.starterReviews"), "Reviews + outreach")}</button>
                  <button onClick={() => submit(fallbackText(t("assistant.quickGeneral"), "What can SignalBoost Concierge do?"))} type="button">{fallbackText(t("assistant.starterGeneral"), "General answer")}</button>
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
                        <span>{fallbackText(t("assistant.continueLabel"), "Continue")}: {turn.response.persistence.shouldContinue ? fallbackText(t("assistant.yes"), "yes") : fallbackText(t("assistant.no"), "no")}</span>
                        <span>{fallbackText(t("assistant.fallbackLabel"), "Fallback")}: {turn.response.persistence.fallbackApplied ? fallbackText(t("assistant.active"), "active") : fallbackText(t("assistant.notNeeded"), "not needed")}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <form className="concierge-composer" onSubmit={handleSubmit}>
            <textarea aria-label="Ask SignalBoost Concierge"
              onChange={(event) => { setComposerTouched(true); setMessage(event.target.value); }}
              placeholder={fallbackText(t("assistant.placeholder"), "Ask for a plan, module task, or general answer...")}
              rows={4}
              value={message}
            />
            <button disabled={isLoading} type="submit">{isLoading ? fallbackText(t("assistant.routing"), "Routing...") : fallbackText(t("assistant.send"), "Send to Concierge")}</button>
          </form>
        </div>

        <aside className="concierge-side-panel" aria-label="Orchestration output">
          <div className="concierge-cardlet">
            <span className="telemetry-label">{fallbackText(t("assistant.sharedAgency"), "Shared agency")}</span>
            <h3>{fallbackText(t("assistant.confirmAdjust"), "Confirm or adjust")}</h3>
            <ul>
              {(latest?.options || [fallbackText(t("assistant.optionsEmpty"), "Send a request to see confirmation options.")]).map((option) => (
                <li key={option}>{option}</li>
              ))}
            </ul>
          </div>

          <div className="concierge-cardlet">
            <span className="telemetry-label">{fallbackText(t("assistant.nextRefinement"), "Next refinement")}</span>
            <h3>{fallbackText(t("assistant.smallerSteps"), "Smaller steps")}</h3>
            <ol>
              {(latest?.nextSteps || [
                fallbackText(t("assistant.stepDescribe"), "Describe the goal"),
                fallbackText(t("assistant.stepPick"), "Pick modules"),
                fallbackText(t("assistant.stepRun"), "Run/refine"),
              ]).map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>

          <div className="concierge-cardlet module-results-card">
            <span className="telemetry-label">{fallbackText(t("assistant.saasApis"), "SaaS APIs")}</span>
            <h3>{fallbackText(t("assistant.moduleSignals"), "Module signals")}</h3>
            {(latest?.modules.length ? latest.modules : snapshots).map((module) => (
              <article className="concierge-module-result" key={`${module.module}-${module.summary}`}>
                <div>
                  <strong>{module.label}</strong>
                  <span>{module.status}</span>
                </div>
                <p>{module.summary}</p>
                <dl>
                  {Object.entries(module.data).slice(0, 3).map(([key, value]) => (
                    <div key={key}>
                      <dt>{key}</dt>
                      <dd>{dataLabel(value)}</dd>
                    </div>
                  ))}
                </dl>
              </article>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}
