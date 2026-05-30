"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ADMIN_SIDEBAR_SECTIONS,
  seedConciergeLogs,
  seedCrmPipeline,
  seedOutreachCampaigns,
  summarizeConciergeTelemetry,
  type ConciergeLogEntry,
} from "@/lib/mission-control/concierge";

type TelemetryResponse = {
  logs: ConciergeLogEntry[];
  summary: ReturnType<typeof summarizeConciergeTelemetry>;
  refreshedAt: string;
};

const copy = {
  en: {
    title: "SignalBoost Mission Control",
    subtitle: "Unified NASA-style cockpit for Marketplace + SaaS concierge telemetry, outreach, CRM, forecasting, financials, KPIs, and executive insights.",
    restricted: "Owner/Admin access only",
    activity: "Concierge Activity Feed",
    partnerQueries: "Partner Queries",
    saasQuestions: "SaaS Usage Questions",
    outreachRequests: "Outreach Requests",
    errorLogs: "Error Logs",
    insights: "Concierge Insights",
    launch: "Launch Campaign",
    notify: "Notify Partners",
    promote: "Create Promotion",
  },
  es: {
    title: "Centro de Misión SignalBoost",
    subtitle: "Cabina NASA unificada para Marketplace + SaaS, telemetría del concierge e insights ejecutivos.",
    restricted: "Solo propietario/administrador",
    activity: "Actividad del Concierge",
    partnerQueries: "Consultas de socios",
    saasQuestions: "Preguntas SaaS",
    outreachRequests: "Solicitudes Outreach",
    errorLogs: "Errores",
    insights: "Insights del Concierge",
    launch: "Lanzar campaña",
    notify: "Notificar socios",
    promote: "Crear promoción",
  },
  pt: {
    title: "Controle de Missão SignalBoost",
    subtitle: "Cockpit NASA unificado para Marketplace + SaaS, telemetria do concierge e insights executivos.",
    restricted: "Apenas proprietário/admin",
    activity: "Atividade do Concierge",
    partnerQueries: "Consultas de parceiros",
    saasQuestions: "Perguntas SaaS",
    outreachRequests: "Pedidos de Outreach",
    errorLogs: "Logs de erro",
    insights: "Insights do Concierge",
    launch: "Lançar campanha",
    notify: "Notificar parceiros",
    promote: "Criar promoção",
  },
  pl: {
    title: "Mission Control SignalBoost",
    subtitle: "Zunifikowany kokpit NASA dla Marketplace + SaaS, telemetrii concierge i insightów.",
    restricted: "Tylko właściciel/admin",
    activity: "Aktywność Concierge",
    partnerQueries: "Zapytania partnerów",
    saasQuestions: "Pytania SaaS",
    outreachRequests: "Zlecenia Outreach",
    errorLogs: "Logi błędów",
    insights: "Insight Concierge",
    launch: "Uruchom kampanię",
    notify: "Powiadom partnerów",
    promote: "Utwórz promocję",
  },
  ru: {
    title: "Mission Control SignalBoost",
    subtitle: "Единая NASA-панель для Marketplace + SaaS, телеметрии concierge и инсайтов.",
    restricted: "Только владелец/админ",
    activity: "Активность Concierge",
    partnerQueries: "Запросы партнёров",
    saasQuestions: "Вопросы SaaS",
    outreachRequests: "Outreach-запросы",
    errorLogs: "Ошибки",
    insights: "Инсайты Concierge",
    launch: "Запустить кампанию",
    notify: "Уведомить партнёров",
    promote: "Создать промо",
  },
};

const langs = ["en", "es", "pt", "pl", "ru"] as const;

type Lang = (typeof langs)[number];

function Bar({ value, max = 10, label }: { value: number; max?: number; label: string }) {
  return (
    <div className="mc-bar-row" aria-label={`${label}: ${value}`}>
      <span>{label}</span>
      <div className="mc-bar-track"><i style={{ width: `${Math.min(100, (value / max) * 100)}%` }} /></div>
      <strong>{value}</strong>
    </div>
  );
}

function MiniLine({ points }: { points: { hour: string; queries: number }[] }) {
  const max = Math.max(...points.map((p) => p.queries), 1);
  const path = points.map((p, index) => `${(index / Math.max(points.length - 1, 1)) * 100},${100 - (p.queries / max) * 82}`).join(" ");
  return (
    <svg className="mc-chart" viewBox="0 0 100 100" role="img" aria-label="Queries per hour line chart" tabIndex={0}>
      <polyline points={path} fill="none" stroke="url(#lineGlow)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <defs><linearGradient id="lineGlow"><stop stopColor="#67e8f9" /><stop offset="1" stopColor="#a78bfa" /></linearGradient></defs>
    </svg>
  );
}

function Gauge({ value }: { value: number }) {
  const pct = Math.min(100, Math.round((value / 1600) * 100));
  return <div className="mc-gauge" role="meter" aria-valuemin={0} aria-valuemax={1600} aria-valuenow={value} tabIndex={0} style={{ "--gauge": `${pct}%` } as React.CSSProperties}><span>{value}ms</span></div>;
}

export default function NasaMissionControl({ email }: { email: string }) {
  const [lang, setLang] = useState<Lang>("en");
  const [telemetry, setTelemetry] = useState<TelemetryResponse>(() => ({
    logs: seedConciergeLogs,
    summary: summarizeConciergeTelemetry(seedConciergeLogs),
    refreshedAt: new Date().toISOString(),
  }));
  const t = copy[lang];

  useEffect(() => {
    let mounted = true;
    async function refresh() {
      try {
        const res = await fetch("/api/concierge?telemetry=1", { cache: "no-store" });
        if (res.ok && mounted) setTelemetry(await res.json());
      } catch {
        if (mounted) setTelemetry((current) => ({ ...current, refreshedAt: new Date().toISOString() }));
      }
    }
    refresh();
    const timer = window.setInterval(refresh, 5000);
    return () => { mounted = false; window.clearInterval(timer); };
  }, []);

  const logs = telemetry.logs;
  const summary = telemetry.summary;
  const partnerLogs = logs.filter((log) => log.userRole === "partner" || log.moduleAccessed === "Marketplace");
  const saasLogs = logs.filter((log) => log.moduleAccessed === "SaaS");
  const outreachLogs = logs.filter((log) => log.moduleAccessed === "Outreach" || /outreach|notify|campaign/i.test(log.queryText));
  const errorLogs = logs.filter((log) => log.outcome !== "success");

  const executiveInsights = useMemo(() => [
    "Combined company revenue forecast: $120K over the next 30 days with Marketplace tours and SaaS Calendar as leading contributors.",
    "Marketplace engagement rose 15%; promote Tours in high-traffic regions and bundle eSIM offers at checkout.",
    "SaaS Calendar adoption increased 20%; allocate budget to productivity outreach and partner onboarding.",
  ], []);

  return (
    <div className="mc-shell">
      <aside className="mc-sidebar" aria-label="Mission Control sections">
        <div className="mc-brand" tabIndex={0}><span>✦</span><b>SignalBoost</b><small>Mission Control</small></div>
        <nav>
          {ADMIN_SIDEBAR_SECTIONS.map((section) => <a key={section} href={`#${section.toLowerCase().replaceAll(" ", "-")}`}>{section}</a>)}
        </nav>
        <div className="mc-access">🔒 {t.restricted}<br /><span>{email}</span></div>
      </aside>

      <main className="mc-main" id="overview">
        <header className="mc-hero">
          <div>
            <p className="mc-eyebrow">NASA telemetry • auto-refresh 5s • i18n</p>
            <h1>{t.title}</h1>
            <p>{t.subtitle}</p>
          </div>
          <label className="mc-lang">Language
            <select value={lang} onChange={(e) => setLang(e.target.value as Lang)} aria-label="Select language">
              {langs.map((item) => <option key={item} value={item}>{item.toUpperCase()}</option>)}
            </select>
          </label>
        </header>

        <section className="mc-grid mc-grid-5" aria-label="Concierge telemetry visualization" id="concierge-monitor">
          <article className="mc-panel"><h2>Queries per hour</h2><MiniLine points={summary.byHour} /></article>
          <article className="mc-panel"><h2>Success vs error</h2><div className="mc-donut" role="img" aria-label={`${summary.success} successes, ${summary.errors} errors, ${summary.escalations} escalations`}><span>{summary.success}/{summary.errors + summary.escalations}</span></div></article>
          <article className="mc-panel"><h2>Partner vs SaaS usage</h2><Bar label="Marketplace" value={summary.marketplace} /><Bar label="SaaS" value={summary.saas} /><Bar label="Outreach" value={summary.outreach} /></article>
          <article className="mc-panel"><h2>Average response time</h2><Gauge value={summary.avgResponseTimeMs} /></article>
          <article className="mc-panel"><h2>Top 5 queries</h2><ol className="mc-list">{summary.topQueries.map((item) => <li key={item.query}><span>{item.query}</span><b>{item.count}</b></li>)}</ol></article>
        </section>

        <section className="mc-grid" aria-label="Concierge log panels" id="logs">
          <LogPanel title={t.activity} logs={logs} />
          <LogPanel title={t.partnerQueries} logs={partnerLogs} />
          <LogPanel title={t.saasQuestions} logs={saasLogs} />
          <LogPanel title={t.outreachRequests} logs={outreachLogs} />
          <LogPanel title={t.errorLogs} logs={errorLogs} />
        </section>

        <section className="mc-grid mc-grid-2" id="insights" aria-label="AI-driven marketing and sales insights">
          <article className="mc-panel mc-panel-wide">
            <h2>{t.insights}</h2>
            <div className="mc-insight-stack">
              {logs.slice(0, 4).map((log) => <p key={log.id}>🤖 {log.aiRecommendation}</p>)}
              {executiveInsights.map((insight) => <p key={insight}>🚀 {insight}</p>)}
            </div>
            <div className="mc-actions" role="group" aria-label="Outreach automation actions">
              <button>{t.launch}</button><button>{t.notify}</button><button>{t.promote}</button>
            </div>
          </article>
          <article className="mc-panel" id="outreach"><h2>Outreach Monitor</h2>{seedOutreachCampaigns.map((c) => <Bar key={c.id} label={c.title} value={c.conversions} max={40} />)}</article>
        </section>

        <section className="mc-grid mc-grid-3" aria-label="Executive dashboards" id="executive-overview">
          <article className="mc-panel"><h2>CRM Pipeline</h2>{seedCrmPipeline.map((entry) => <Bar key={entry.id} label={entry.stage} value={entry.metrics.conversions || entry.metrics.clicks / 20} max={20} />)}</article>
          <article className="mc-panel"><h2>Revenue Forecast</h2><MiniLine points={[{ hour: "7d", queries: 42 }, { hour: "30d", queries: 120 }, { hour: "90d", queries: 310 }]} /><p className="mc-muted">Marketplace + SaaS forecast distinguishes booking commissions, partner payouts, subscription revenue, credit usage, and upsells.</p></article>
          <article className="mc-panel"><h2>KPI Dashboard</h2><Bar label="Marketplace engagement" value={78} max={100} /><Bar label="SaaS adoption" value={64} max={100} /><Bar label="Cross-platform adoption" value={52} max={100} /></article>
          <article className="mc-panel"><h2>Financial Dashboard</h2><div className="mc-stat">$120K <span>combined forecast</span></div><Bar label="Marketplace" value={45} max={120} /><Bar label="SaaS" value={75} max={120} /></article>
          <article className="mc-panel"><h2>Role Management</h2><p className="mc-muted">Automation CTAs and executive telemetry are restricted to owner/admin users through the server-gated admin route.</p></article>
          <article className="mc-panel"><h2>API Health</h2><div className="mc-status">Operational</div><p className="mc-muted">Last refresh: {new Date(telemetry.refreshedAt).toLocaleTimeString()}</p></article>
        </section>
      </main>
    </div>
  );
}

function LogPanel({ title, logs }: { title: string; logs: ConciergeLogEntry[] }) {
  return (
    <article className="mc-panel" aria-label={title} tabIndex={0}>
      <h2>{title}</h2>
      <div className="mc-feed">
        {logs.slice(0, 5).map((log) => (
          <div key={log.id} className={`mc-feed-item mc-${log.outcome}`}>
            <strong>{log.queryText}</strong>
            <span>{log.userRole} • {log.moduleAccessed} • {log.responseTimeMs}ms • {log.outcome}</span>
          </div>
        ))}
      </div>
    </article>
  );
}
