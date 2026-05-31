"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import { saasModules } from "@/lib/saas-modules";
import { CockpitShell } from "@/components/CockpitShell";
import ModuleBackendPanel from "@/components/ModuleBackendPanel";
import useTranslation from "@/components/i18n/useTranslation";

export default function SaasModulePage({ slug }: { slug: string }) {
  const module = saasModules.find((item) => item.slug === slug);
  const { t } = useTranslation();
  if (!module) notFound();

  const title = t(module.titleKey);
  const eyebrow = t(module.eyebrowKey);
  const summary = t(module.summaryKey);

  return (
    <CockpitShell eyebrow={eyebrow} title={title} subtitle={summary}>
      <section className="cockpit-section module-detail" style={{ "--module-accent": module.accent } as CSSProperties}>
        <div className="module-detail-panel module-prime">
          <span className="telemetry-label">{t("modules.labels.missionSignal")}</span>
          <strong>{t(module.signalKey)}</strong>
          <p>{t(module.telemetryKey)}</p>
        </div>
        <div className="module-detail-panel">
          <span className="telemetry-label">{t("modules.labels.coreSystems")}</span>
          <ul>
            {module.featureKeys.map((featureKey) => (
              <li key={featureKey}>{t(featureKey)}</li>
            ))}
          </ul>
        </div>
        <div className="module-detail-panel">
          <span className="telemetry-label">{t("modules.labels.conciergeAutomations")}</span>
          <ul>
            {module.automationKeys.map((automationKey) => (
              <li key={automationKey}>{t(automationKey)}</li>
            ))}
          </ul>
        </div>
      </section>
      <ModuleBackendPanel slug={module.slug} />
      <section className="cockpit-section concierge-band">
        <div>
          <p className="cockpit-eyebrow">{t("modules.conciergeBand.eyebrow")}</p>
          <h2>{t("modules.conciergeBand.title")}</h2>
          <p>{t("modules.conciergeBand.summary")}</p>
        </div>
        <Link className="cockpit-primary" href="/assistant">{t("modules.conciergeBand.cta")}</Link>
      </section>
    </CockpitShell>
  );
}
