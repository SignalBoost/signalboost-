"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

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

const STARTER = "Plan a launch next week, collect reviews, organize the data, and draft outreach.";

function dataLabel(value: string | number | boolean | string[]) {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

export default function Concierge() {
  const [message, setMessage] = useState(STARTER);
  const [selectedModule, setSelectedModule] = useState<ModuleName | "auto">("auto");
  const [isLoading, setIsLoading] = useState(false);
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [snapshots, setSnapshots] = useState<ModuleResult[]>([]);

  useEffect(() => {
    let alive = true;
    Promise.all(
      MODULES.filter((module) => module.key !== "concierge").map((module) =>
        fetch(`/api/saas/${module.key}`, { cache: "no-store" })
          .then((res) => (res.ok ? res.json() : null))
          .catch(() => null)
      )
    ).then((items) => {
      if (alive) setSnapshots(items.filter(Boolean));
    });
    return () => {
      alive = false;
    };
  }, []);

  const latest = useMemo(() => [...turns].reverse().find((turn) => turn.response)?.response, [turns]);

  async function submit(raw?: string) {
    const content = (raw ?? message).trim();
    if (!content || isLoading) return;

    setIsLoading(true);
    setTurns((current) => [...current, { role: "user", content }]);
    setMessage("");

    try {
      const res = await fetch("/api/orchestrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content, module: selectedModule }),
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
        understood: `I understood this as: “${content}”. The live orchestrator did not respond, so I am continuing with demo-safe defaults.`,
        status: "demo_fallback",
        answer: "I will not stop the task. Use the Concierge fallback path: clarify the goal, choose Calendar/Reviews/Spreadsheets/Outreach, and continue with demo data until live APIs recover.",
        activeModules: ["concierge"],
        modules: [],
        options: ["Retry live orchestration", "Use demo data", "Switch modules"],
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

  return (
    <section className="concierge-console" aria-label="SignalBoost Concierge AI orchestrator">
      <div className="concierge-console__intro">
        <p className="cockpit-eyebrow">Persistent AI orchestration</p>
        <h2>Concierge understands, routes, refines, and keeps going.</h2>
        <p>
          The assistant coordinates Promote, Calendar, Reviews, Spreadsheets, Outreach, and Concierge intelligence. If a module is missing data, it shows fallback demo data instead of ending the task.
        </p>
      </div>

      <div className="concierge-console__grid">
        <div className="concierge-chat-panel">
          <div className="concierge-module-switcher" aria-label="Module routing options">
            <button className={selectedModule === "auto" ? "active" : ""} onClick={() => setSelectedModule("auto")} type="button">
              Auto-route
            </button>
            {MODULES.map((module) => (
              <button
                className={selectedModule === module.key ? "active" : ""}
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
                <strong>What I understand so far</strong>
                <p>You want a persistent assistant that asks or defaults when details are vague, then routes work across SaaS modules.</p>
                <div className="concierge-options">
                  <button onClick={() => submit(STARTER)} type="button">Run launch plan</button>
                  <button onClick={() => submit("Summarize my reviews and draft outreach")} type="button">Reviews + outreach</button>
                  <button onClick={() => submit("What can SignalBoost Concierge do?")} type="button">General answer</button>
                </div>
              </div>
            ) : (
              turns.map((turn, index) => (
                <div className={`concierge-message ${turn.role}`} key={`${turn.role}-${index}`}>
                  <span>{turn.role === "user" ? "You" : "Concierge"}</span>
                  <p>{turn.content}</p>
                  {turn.response && (
                    <div className="concierge-response-detail">
                      <strong>{turn.response.understood}</strong>
                      {turn.response.persistence.clarificationQuestion && <p>{turn.response.persistence.clarificationQuestion}</p>}
                      <div className="concierge-status-row">
                        <span>Status: {turn.response.status.replace("_", " ")}</span>
                        <span>Continue: {turn.response.persistence.shouldContinue ? "yes" : "no"}</span>
                        <span>Fallback: {turn.response.persistence.fallbackApplied ? "active" : "not needed"}</span>
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
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Ask for a plan, module task, or general answer..."
              rows={4}
              value={message}
            />
            <button disabled={isLoading} type="submit">{isLoading ? "Routing..." : "Send to Concierge"}</button>
          </form>
        </div>

        <aside className="concierge-side-panel" aria-label="Orchestration output">
          <div className="concierge-cardlet">
            <span className="telemetry-label">Shared agency</span>
            <h3>Confirm or adjust</h3>
            <ul>
              {(latest?.options || ["Send a request to see confirmation options."]).map((option) => (
                <li key={option}>{option}</li>
              ))}
            </ul>
          </div>

          <div className="concierge-cardlet">
            <span className="telemetry-label">Next refinement</span>
            <h3>Smaller steps</h3>
            <ol>
              {(latest?.nextSteps || ["Describe the goal", "Pick modules", "Run/refine"]).map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>

          <div className="concierge-cardlet module-results-card">
            <span className="telemetry-label">SaaS APIs</span>
            <h3>Module signals</h3>
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
