"use client";

import Link from "next/link";
import { useI18n } from "@/components/i18n/I18nProvider";

function t(dict: Record<string, any>, key: string, fallback: string) {
  const value = key.split(".").reduce((obj, part) => obj?.[part], dict);
  return typeof value === "string" ? value : fallback;
}

const marketplace = [
  ["✈", "flights", "/partners/flights"],
  ["▣", "hotels", "/partners/hotels"],
  ["◈", "esim", "/partners/esim"],
  ["◎", "tours", "/partners/tours"],
  ["▰", "cars", "/partners/cars"],
  ["✦", "marketplace", "/marketplace"],
] as const;

const saas = [
  ["▲", "promoteBusiness", "/saas/promote-business"],
  ["★", "collectReviews", "/saas/collect-reviews"],
  ["◷", "aiCalendar", "/saas/ai-calendar"],
  ["▤", "aiSpreadsheets", "/saas/ai-spreadsheets"],
  ["⇄", "outreach", "/saas/outreach"],
  ["✓", "taskManager", "/saas/task-manager"],
  ["✎", "documents", "/saas/document-collaboration"],
] as const;

const telemetry = [
  ["admin.telemetry.partnerActivity", "182", "+14%"],
  ["admin.telemetry.saasUsage", "4.8k", "+31%"],
  ["admin.telemetry.marketplaceTraffic", "19.2k", "+22%"],
  ["admin.telemetry.securityLogs", "0 critical", "green"],
  ["admin.telemetry.apiHealth", "99.98%", "nominal"],
] as const;

export default function UnifiedHome() {
  const { dict } = useI18n();

  return (
    <main className="sb-mission-page">
      <section className="sb-hero sb-container" aria-labelledby="home-hero-title">
        <div className="sb-hero-copy">
          <p className="sb-kicker">SignalBoost Mission Control</p>
          <h1 id="home-hero-title">{t(dict, "homepage.hero", "Your AI-powered business hub + marketplace.")}</h1>
          <p className="sb-hero-subtitle">
            {t(dict, "homepage.cta", "Promote your company, manage your day, and grow.")}
          </p>
          <div className="sb-hero-actions">
            <Link className="sb-button sb-button-primary" href="/saas/promote-business">
              {t(dict, "homepage.startPromoting", "Start promoting")}
            </Link>
            <Link className="sb-button sb-button-secondary" href="/marketplace">
              {t(dict, "homepage.exploreMarketplace", "Explore marketplace")}
            </Link>
          </div>
        </div>
        <div className="sb-wireframe-card" aria-label="NASA-style admin console wireframe preview">
          <div className="sb-wire-top">SignalBoost Mission Control <span>Owner/Admin</span></div>
          <div className="sb-wire-body">
            <div className="sb-wire-sidebar">
              {["Overview", "Logs", "Outreach", "Insights", "Role Management", "Marketplace Monitor", "SaaS Monitor"].map((label) => (
                <div key={label}>{label} →</div>
              ))}
            </div>
            <div className="sb-wire-grid">
              {["Partner activity", "SaaS usage", "Marketplace traffic", "Security logs", "API health"].map((label) => (
                <div key={label} className="sb-wire-panel">{label}</div>
              ))}
            </div>
          </div>
          <div className="sb-wire-responsive">Desktop grid ⇄ Mobile stacked command deck</div>
        </div>
      </section>

      <section className="sb-container sb-tabs" aria-label="Hybrid platform sections">
        <article className="sb-glass-panel">
          <div className="sb-section-heading">
            <span className="sb-kicker">{t(dict, "homepage.marketplaceTab", "Marketplace")}</span>
            <h2>{t(dict, "homepage.marketplaceHeading", "Book trusted partners from one AI hub")}</h2>
          </div>
          <div className="sb-card-grid">
            {marketplace.map(([icon, key, href]) => (
              <Link className="sb-service-card" href={href} key={key}>
                <span className="sb-service-icon">{icon}</span>
                <strong>{t(dict, `marketplace.${key}`, key)}</strong>
                <small>{t(dict, "homepage.searchBookTrack", "Search, compare, book, and track activity.")}</small>
              </Link>
            ))}
          </div>
        </article>

        <article className="sb-glass-panel">
          <div className="sb-section-heading">
            <span className="sb-kicker">{t(dict, "homepage.saasTab", "SaaS Tools")}</span>
            <h2>{t(dict, "homepage.saasHeading", "Run campaigns, reviews, schedules, reports, and outreach")}</h2>
          </div>
          <div className="sb-card-grid">
            {saas.map(([icon, key, href]) => (
              <Link className="sb-service-card" href={href} key={key}>
                <span className="sb-service-icon">{icon}</span>
                <strong>{t(dict, `saas.${key}.title`, key)}</strong>
                <small>{t(dict, `saas.${key}.short`, "Guided workflow with AI suggestions and admin logs.")}</small>
              </Link>
            ))}
          </div>
        </article>
      </section>

      <section className="sb-container sb-telemetry-section" aria-labelledby="telemetry-heading">
        <div className="sb-section-heading">
          <span className="sb-kicker">Telemetry</span>
          <h2 id="telemetry-heading">{t(dict, "homepage.telemetryHeading", "Unified marketplace + SaaS command grid")}</h2>
        </div>
        <div className="sb-telemetry-grid">
          {telemetry.map(([key, value, trend]) => (
            <div className="sb-telemetry-panel" key={key}>
              <span>{t(dict, key, key)}</span>
              <strong>{value}</strong>
              <small>{trend}</small>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
