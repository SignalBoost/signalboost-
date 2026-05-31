"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { saasModules } from "@/lib/saas-modules";
import useTranslation from "@/components/i18n/useTranslation";

export default function ModuleGrid() {
  const { t } = useTranslation();

  return (
    <section className="cockpit-section" aria-labelledby="modules-title">
      <div className="cockpit-section-heading">
        <p className="cockpit-eyebrow">{t("modules.section.eyebrow")}</p>
        <h2 id="modules-title">{t("modules.section.title")}</h2>
        <p>{t("modules.section.description")}</p>
      </div>
      <div className="module-grid">
        {saasModules.map((module) => (
          <Link className="module-card" href={module.href} key={module.slug} style={{ "--module-accent": module.accent } as CSSProperties}>
            <div className="module-card-topline">
              <span>{t(module.eyebrowKey)}</span>
              <strong>{t(module.statusKey)}</strong>
            </div>
            <h3>{t(module.titleKey)}</h3>
            <p>{t(module.summaryKey)}</p>
            <div className="module-signal">{t(module.signalKey)}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}
