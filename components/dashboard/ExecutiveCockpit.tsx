"use client";

// File: components/dashboard/ExecutiveCockpit.tsx
// Project: SignalBoost (main production repo)

import { CockpitShell } from "@/components/CockpitShell";
import useTranslation from "@/components/i18n/useTranslation";
import { executivePanels } from "@/lib/saas-modules";

export default function ExecutiveCockpit() {
  const { t } = useTranslation();

  return (
    <CockpitShell
      eyebrow={t("executive.eyebrow")}
      title={t("executive.title")}
      subtitle={t("executive.subtitle")}
    >
      <section className="cockpit-section executive-grid" aria-label={t("executive.panelsAriaLabel")}>
        {executivePanels.map((panel) => (
          <article className="executive-panel" key={panel.titleKey}>
            <span className="telemetry-label">{t(panel.titleKey)}</span>
            <strong>{panel.metric}</strong>
            <p>{t(panel.detailKey)}</p>
          </article>
        ))}
      </section>
      <section className="cockpit-section telemetry-strip" aria-label={t("executive.telemetryAriaLabel")}>
        <div>
          <span className="telemetry-label">{t("executive.adminConsole.label")}</span>
          <strong>{t("executive.adminConsole.status")}</strong>
          <p>{t("executive.adminConsole.detail")}</p>
        </div>
        <div>
          <span className="telemetry-label">{t("executive.qaPipeline.label")}</span>
          <strong>{t("executive.qaPipeline.status")}</strong>
          <p>{t("executive.qaPipeline.detail")}</p>
        </div>
      </section>
    </CockpitShell>
  );
}
