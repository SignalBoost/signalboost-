"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { saasModules } from "@/lib/saas-modules";
import useTranslation from "@/components/i18n/useTranslation";

function fallbackText(value: string, fallback: string) {
  return value.includes(".") ? fallback : value;
}

export default function ModuleGrid() {
  const { t } = useTranslation();

  return (
    <section className="cockpit-section" aria-labelledby="modules-title">
      <div className="cockpit-section-heading">
        <p className="cockpit-eyebrow">{fallbackText(t("modules.section.eyebrow"), "SaaS modules")}</p>
        <h2 id="modules-title">{fallbackText(t("modules.section.title"), "Unified operating bays")}</h2>
        <p>{fallbackText(t("modules.section.description"), "Promote, support, schedule, analyze, and follow up without leaving the SignalBoost cockpit.")}</p>
      </div>
      <div className="module-grid">
        {saasModules.map((module) => (
          <Link className="module-card" href={module.href} key={module.slug} style={{ "--module-accent": module.accent } as CSSProperties}>
            <div className="module-card-topline">
              <span>{fallbackText(t(module.eyebrowKey), module.eyebrow)}</span>
              <strong>{fallbackText(t(module.statusKey), module.status)}</strong>
            </div>
            <h3>{fallbackText(t(module.titleKey), module.title)}</h3>
            <p>{fallbackText(t(module.summaryKey), module.summary)}</p>
            <div className="module-signal">{fallbackText(t(module.signalKey), module.signal)}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}
