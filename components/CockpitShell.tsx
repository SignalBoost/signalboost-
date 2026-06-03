"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import useTranslation from "@/components/i18n/useTranslation";

function fallbackText(value: string, fallback: string) {
  return /^[a-zA-Z][\w$]*(\.[\w$]+)+$/.test(value) ? fallback : value;
}

export function CockpitShell({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <main className="cockpit-page">
      {/* Compact header strip — overrides the default 430px min-height hero */}
      <section
        className="cockpit-hero"
        aria-labelledby="cockpit-title"
        style={{ minHeight: "auto", padding: "28px 0 18px" }}
      >
        {/* Hide the decorative orbit ring — it takes up too much space */}
        <div className="cockpit-orbit" aria-hidden="true" style={{ display: "none" }} />
        <p className="cockpit-eyebrow">{eyebrow}</p>
        <h1
          id="cockpit-title"
          style={{ fontSize: "clamp(22px, 3.5vw, 42px)", margin: "8px 0 10px", letterSpacing: "-0.04em" }}
        >
          {title}
        </h1>
        <p
          className="cockpit-subtitle"
          style={{ fontSize: "clamp(13px, 1.5vw, 16px)", maxWidth: 560 }}
        >
          {subtitle}
        </p>
        <div className="cockpit-actions" style={{ marginTop: 18 }}>
          <Link className="cockpit-primary" href="/pricing">
            {fallbackText(t("cockpit.viewPricing"), "View SaaS pricing")}
          </Link>
          <Link className="cockpit-secondary" href="/dashboard">
            {fallbackText(t("cockpit.executiveDashboard"), "Executive dashboard")}
          </Link>
          <Link className="cockpit-secondary concierge-shell-link" href="/assistant">
            {fallbackText(t("cockpit.openConcierge"), "Open Concierge")}
          </Link>
        </div>
      </section>
      {children}
    </main>
  );
}
