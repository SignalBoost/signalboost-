import Link from "next/link";
import type { ReactNode } from "react";

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
  return (
    <main className="cockpit-page">
      <section className="cockpit-hero" aria-labelledby="cockpit-title">
        <div className="cockpit-orbit" aria-hidden="true" />
        <p className="cockpit-eyebrow">{eyebrow}</p>
        <h1 id="cockpit-title">{title}</h1>
        <p className="cockpit-subtitle">{subtitle}</p>
        <div className="cockpit-actions">
          <Link className="cockpit-primary" href="/pricing">
            View SaaS pricing
          </Link>
          <Link className="cockpit-secondary" href="/dashboard">
            Executive dashboard
          </Link>
          <Link className="cockpit-secondary concierge-shell-link" href="/assistant">
            Open Concierge
          </Link>
        </div>
      </section>
      {children}
    </main>
  );
}
