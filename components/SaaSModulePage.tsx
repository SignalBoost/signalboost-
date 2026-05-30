"use client";

import { useMemo, useState } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";
import { OUTREACH_CONNECTORS, enforceOutreachRateLimit } from "@/lib/outreach/connectors";

type ModuleKey = "promote-business" | "collect-reviews" | "ai-calendar" | "ai-spreadsheets" | "outreach" | "task-manager" | "document-collaboration";

const modules: Record<ModuleKey, { i18n: string; icon: string; workflow: string[]; fields: string[]; ctas: string[] }> = {
  "promote-business": { i18n: "promoteBusiness", icon: "▲", workflow: ["Define audience", "Upload creative", "Launch campaign"], fields: ["Campaign goal", "Landing URL", "Creative upload"], ctas: ["Generate ads", "Launch campaign"] },
  "collect-reviews": { i18n: "collectReviews", icon: "★", workflow: ["Import customers", "Request testimonials", "Publish social proof"], fields: ["Customer list", "Review URL", "Brand voice"], ctas: ["Draft request", "Collect reviews"] },
  "ai-calendar": { i18n: "aiCalendar", icon: "◷", workflow: ["Describe event", "Sync Google/Outlook", "Confirm reminders"], fields: ["Event title", "Calendar URL", "Attachment"], ctas: ["Suggest schedule", "Sync calendar"] },
  "ai-spreadsheets": { i18n: "aiSpreadsheets", icon: "▤", workflow: ["Upload CSV", "Choose metrics", "Export report"], fields: ["Report prompt", "Source URL", "Spreadsheet upload"], ctas: ["Generate report", "Export CSV"] },
  outreach: { i18n: "outreach", icon: "⇄", workflow: ["Queue posts", "Approve/reject", "Track engagement"], fields: ["Post copy", "Media upload", "Destination URL"], ctas: ["Queue post", "Approve post"] },
  "task-manager": { i18n: "taskManager", icon: "✓", workflow: ["Capture task", "Set reminder", "Mark complete"], fields: ["Task title", "Reminder URL", "Attachment"], ctas: ["Add task", "Create reminder"] },
  "document-collaboration": { i18n: "documents", icon: "✎", workflow: ["Create document", "Invite collaborators", "Apply AI suggestions"], fields: ["Document title", "Source URL", "Reference upload"], ctas: ["Create document", "Share draft"] },
};

function read(dict: Record<string, any>, key: string, fallback: string) {
  const value = key.split(".").reduce((obj, part) => obj?.[part], dict);
  return typeof value === "string" ? value : fallback;
}

export default function SaaSModulePage({ moduleKey }: { moduleKey: ModuleKey }) {
  const config = modules[moduleKey] || modules["promote-business"];
  const { dict } = useI18n();
  const [result, setResult] = useState(read(dict, "saas.common.emptyResult", "Run the workflow to generate results."));
  const rate = useMemo(() => enforceOutreachRateLimit(12, 50), []);
  const title = read(dict, `saas.${config.i18n}.title`, config.i18n);

  return (
    <main className="sb-mission-page sb-container sb-module-page">
      <section className="sb-module-hero">
        <span className="sb-service-icon" aria-hidden="true">{config.icon}</span>
        <div>
          <p className="sb-kicker">{read(dict, "saas.common.module", "SaaS module")}</p>
          <h1>{title}</h1>
          <p>{read(dict, `saas.${config.i18n}.description`, "Guided workflow, AI suggestions, inputs, results, and admin logging for every action.")}</p>
        </div>
      </section>

      <section className="sb-module-grid" aria-label={`${title} workflow`}>
        <article className="sb-glass-panel">
          <h2>{read(dict, "saas.common.workflow", "Guided workflow")}</h2>
          <ol className="sb-workflow-list">
            {config.workflow.map((step, index) => <li key={step}><span>{String(index + 1).padStart(2, "0")}</span>{read(dict, `saas.${config.i18n}.workflow.${index}`, step)}</li>)}
          </ol>
        </article>

        <article className="sb-glass-panel">
          <h2>{read(dict, "saas.common.aiSuggestions", "AI suggestions")}</h2>
          <ul className="sb-suggestion-list">
            <li>{read(dict, "saas.common.suggestion1", "Prioritize high-intent audiences and short approval loops.")}</li>
            <li>{read(dict, "saas.common.suggestion2", "Use measurable CTAs and localize copy before publishing.")}</li>
            <li>{read(dict, "saas.common.suggestion3", "Log every action for Mission Control auditability.")}</li>
          </ul>
        </article>

        <article className="sb-glass-panel">
          <h2>{read(dict, "saas.common.inputs", "Inputs")}</h2>
          <form className="sb-module-form" onSubmit={(event) => { event.preventDefault(); setResult(`${title}: ${read(dict, "saas.common.generated", "AI-generated plan queued and logged in Admin Console.")}`); }}>
            {config.fields.map((field, index) => (
              <label key={field}>
                <span>{read(dict, `saas.${config.i18n}.fields.${index}`, field)}</span>
                {field.toLowerCase().includes("upload") || field.toLowerCase().includes("attachment") ? <input type="file" /> : <input type={field.toLowerCase().includes("url") ? "url" : "text"} placeholder={field} />}
              </label>
            ))}
            <div className="sb-button-row">
              {config.ctas.map((cta, index) => <button className={index === 0 ? "sb-button sb-button-primary" : "sb-button sb-button-secondary"} key={cta} type="submit">{read(dict, `saas.${config.i18n}.ctas.${index}`, cta)}</button>)}
            </div>
          </form>
        </article>

        <article className="sb-glass-panel">
          <h2>{read(dict, "saas.common.results", "Results")}</h2>
          <div className="sb-results-panel" role="status" aria-live="polite">{result}</div>
          {moduleKey === "outreach" && (
            <div className="sb-social-outreach" aria-label="Social Outreach tab">
              <h3>{read(dict, "saas.outreach.socialTab", "Social Outreach")}</h3>
              <p>{read(dict, "saas.outreach.rateLimit", "Queue posts for approval. Limit 50 posts/day.")} {rate.remaining}/50 remaining.</p>
              <div className="sb-connector-grid">
                {OUTREACH_CONNECTORS.map((connector) => <span key={connector.channel}>{connector.label}</span>)}
              </div>
            </div>
          )}
        </article>
      </section>
    </main>
  );
}
