"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import { saasModules } from "@/lib/saas-modules";
import { CockpitShell } from "@/components/CockpitShell";
import ModuleBackendPanel from "@/components/ModuleBackendPanel";
import useTranslation from "@/components/i18n/useTranslation";

function fallbackText(value: string, fallback: string) {
  return value.includes(".") ? fallback : value;
}

export default function SaasModulePage({ slug }: { slug: string }) {
  const module = saasModules.find((item) => item.slug === slug);
  const { t } = useTranslation();
  if (!module) notFound();

  const title = fallbackText(t(module.titleKey), module.title);
  const eyebrow = fallbackText(t(module.eyebrowKey), module.eyebrow);
  const summary = fallbackText(t(module.summaryKey), module.summary);

  return (
    <CockpitShell eyebrow={eyebrow} title={title} subtitle={summary}>
      <section className="cockpit-section module-detail" style={{ "--module-accent": module.accent } as CSSProperties}>
        <div className="module-detail-panel module-prime">
          <span className="telemetry-label">Mission signal</span>
          <strong>{module.signal}</strong>
          <p>{module.telemetry}</p>
        </div>
        <div className="module-detail-panel">
          <span className="telemetry-label">Core systems</span>
          <ul>
            {module.features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </div>
        <div className="module-detail-panel">
          <span className="telemetry-label">Concierge AI automations</span>
          <ul>
            {module.automations.map((automation) => (
              <li key={automation}>{automation}</li>
            ))}
          </ul>
        </div>
      </section>
      <ModuleBackendPanel slug={module.slug} />
      <section className="cockpit-section concierge-band">
        <div>
          <p className="cockpit-eyebrow">Concierge AI</p>
          <h2>Connected to marketplace discovery and SaaS execution</h2>
          <p>
            SignalBoost routes buyer intent, partner data, and operational tasks through a single assistant layer so teams can move from question to action.
          </p>
        </div>
        <Link className="cockpit-primary" href="/assistant">Open Concierge</Link>
      </section>
    </CockpitShell>
  );
}
