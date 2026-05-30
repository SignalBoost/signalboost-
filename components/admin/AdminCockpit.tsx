// File: components/admin/AdminCockpit.tsx
// Project: SignalBoost (main production repo)

import type { CSSProperties } from "react";

const panels = [
  { name: "Overview", metric: "98%", detail: "Marketplace + SaaS cockpit health nominal" },
  { name: "Logs", metric: "12.4K", detail: "Operational events, review submissions, sentiment scans, and moderation actions" },
  { name: "Outreach", metric: "31%", detail: "Campaign success rate with testimonial triggers from positive reviews" },
  { name: "Insights", metric: "+17%", detail: "Forecast lift across bookings, subscriptions, and review trust signals" },
  { name: "Role Management", metric: "Owner/Admin", detail: "Restricted access gates for executive and admin telemetry" },
  { name: "Marketplace Monitor", metric: "130+", detail: "Trusted partners, categories, bookings, and traffic telemetry" },
  { name: "SaaS Monitor", metric: "6", detail: "Promote, Reviews, Calendar, Spreadsheets, Outreach, and Assistant usage" },
  { name: "Concierge Monitor", metric: "24/7", detail: "Localized guidance, SaaS routing, moderation suggestions, and action logs" },
];

const reviewVolume = [
  ["EN", 42],
  ["ES", 31],
  ["PT", 24],
  ["PL", 17],
  ["RU", 13],
] as const;

export default function AdminCockpit() {
  return (
    <section className="cockpit-section admin-console" aria-label="NASA-style Admin Console telemetry">
      {panels.map((panel) => (
        <article className="executive-panel" key={panel.name}>
          <span className="telemetry-label">Admin Console</span>
          <strong>{panel.name}</strong>
          <p>{panel.metric} · {panel.detail}</p>
        </article>
      ))}
      <article className="executive-panel admin-wide" aria-label="Review volume per locale">
        <span className="telemetry-label">Reviews telemetry</span>
        <strong>Locale volume</strong>
        <div className="bar-chart">
          {reviewVolume.map(([locale, value]) => (
            <span key={locale} style={{ "--bar-height": `${value * 2}px` } as CSSProperties}>{locale}</span>
          ))}
        </div>
      </article>
      <article className="executive-panel admin-wide" aria-label="Sentiment trend chart">
        <span className="telemetry-label">Sentiment analysis</span>
        <strong>Positive → Neutral → Negative</strong>
        <div className="trend-chart"><span className="positive" /><span className="neutral" /><span className="negative" /></div>
      </article>
    </section>
  );
}
