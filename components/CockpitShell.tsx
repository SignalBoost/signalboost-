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
      <section className="cockpit-hero" aria-labelledby="cockpit-title">
        <div className="cockpit-orbit" aria-hidden="true" />
        <p className="cockpit-eyebrow">{eyebrow}</p>
        <h1 id="cockpit-title">{title}</h1>
        <p className="cockpit-subtitle">{subtitle}</p>
        <div className="cockpit-actions">
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
