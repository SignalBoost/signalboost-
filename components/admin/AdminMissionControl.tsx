"use client";

import { useI18n } from "@/components/i18n/I18nProvider";
import { LanguageToggle } from "@/components/i18n/LanguageToggle";

function read(dict: Record<string, any>, key: string, fallback: string) {
  const value = key.split(".").reduce((obj, part) => obj?.[part], dict);
  return typeof value === "string" ? value : fallback;
}

const sections = ["overview", "logs", "outreach", "insights", "roleManagement", "marketplaceMonitor", "saasMonitor"];
const telemetry = [
  ["partnerActivity", "186 partners", "affiliate clicks +14%"],
  ["saasUsage", "4,812 actions", "Calendar, Spreadsheets, Tasks nominal"],
  ["marketplaceTraffic", "19,240 searches", "bookings conversion +8%"],
  ["securityLogs", "0 critical", "2 MFA prompts reviewed"],
  ["apiHealth", "99.98%", "telemetry refresh < 5s"],
];
const auditLogs = ["Owner reviewed outreach queue", "Admin promoted partner manager", "Rate limit enforced for Twitter/X queue"];

export default function AdminMissionControl({ email }: { email: string }) {
  const { dict } = useI18n();
  return (
    <main className="sb-admin-shell">
      <aside className="sb-admin-sidebar" aria-label="Mission Control sections">
        <div className="sb-ai-brand sb-admin-brand"><span className="sb-ai-brand-orb" />SignalBoost</div>
        {sections.map((section) => (
          <a key={section} href={`#${section}`} className="sb-admin-side-link">
            {read(dict, `admin.sidebar.${section}`, section)} <span aria-hidden="true">→</span>
          </a>
        ))}
      </aside>

      <section className="sb-admin-main">
        <header className="sb-admin-topbar">
          <div>
            <p className="sb-kicker">NASA-style command deck</p>
            <h1>{read(dict, "admin.title", "SignalBoost Mission Control")}</h1>
          </div>
          <div className="sb-admin-role" aria-label="Restricted role indicator">
            <span>{read(dict, "admin.restricted", "Owner/Admin only")}</span>
            <strong>{email}</strong>
            <LanguageToggle />
          </div>
        </header>

        <section id="overview" className="sb-admin-grid" aria-label="Dashboard telemetry panels">
          {telemetry.map(([key, value, meta]) => (
            <article className="sb-telemetry-panel" key={key}>
              <span>{read(dict, `admin.telemetry.${key}`, key)}</span>
              <strong>{value}</strong>
              <small>{meta}</small>
            </article>
          ))}
        </section>

        <section className="sb-admin-two-col">
          <article id="roleManagement" className="sb-glass-panel">
            <h2>{read(dict, "admin.roleManagement.title", "Role Management")}</h2>
            <p>{read(dict, "admin.roleManagement.description", "Promote or demote admins, transfer ownership, and preserve audit logs.")}</p>
            <div className="sb-button-row">
              <button className="sb-button sb-button-primary" type="button">{read(dict, "admin.roleManagement.promote", "Promote admin")}</button>
              <button className="sb-button sb-button-secondary" type="button">{read(dict, "admin.roleManagement.demote", "Demote admin")}</button>
              <button className="sb-button sb-button-secondary" type="button">{read(dict, "admin.roleManagement.transfer", "Transfer ownership")}</button>
            </div>
          </article>

          <article id="logs" className="sb-glass-panel">
            <h2>{read(dict, "admin.auditLogs", "Audit logs")}</h2>
            <ul className="sb-suggestion-list">
              {auditLogs.map((log) => <li key={log}>{log}</li>)}
            </ul>
          </article>
        </section>

        <section className="sb-admin-two-col">
          <article id="outreach" className="sb-glass-panel">
            <h2>{read(dict, "admin.outreachControl", "Outreach Control")}</h2>
            <p>{read(dict, "admin.outreachDescription", "Approve/reject queued posts, inspect connector OAuth state, and enforce 50 posts/day.")}</p>
          </article>
          <article id="insights" className="sb-glass-panel">
            <h2>{read(dict, "admin.predictiveInsights", "Predictive Insights")}</h2>
            <p>{read(dict, "admin.insightsDescription", "Forecast partner demand, SaaS adoption, marketplace searches, and API pressure.")}</p>
          </article>
          <article id="marketplaceMonitor" className="sb-glass-panel">
            <h2>{read(dict, "admin.sidebar.marketplaceMonitor", "Marketplace Monitor")}</h2>
            <p>Flights, hotels, eSIM, tours, cars, search queries, bookings.</p>
          </article>
          <article id="saasMonitor" className="sb-glass-panel">
            <h2>{read(dict, "admin.sidebar.saasMonitor", "SaaS Monitor")}</h2>
            <p>Promote Business, Reviews, Calendar, Spreadsheets, Tasks, Docs, Outreach.</p>
          </article>
        </section>
      </section>
    </main>
  );
}
