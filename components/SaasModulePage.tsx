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
  const signal = fallbackText(t(module.signalKey), module.signal);
  const telemetry = fallbackText(t(module.telemetryKey), module.telemetry);
  const features = module.features.map((f, i) => fallbackText(t(module.featureKeys[i]), f));
  const automations = module.automations.map((a, i) => fallbackText(t(module.automationKeys[i]), a));

  const missionSignalLabel = fallbackText(t("modules.detail.missionSignal"), "Mission signal");
  const coreSystemsLabel = fallbackText(t("modules.detail.coreSystems"), "Core systems");
  const automationsLabel = fallbackText(t("modules.detail.automations"), "Concierge AI automations");

  const conciergeEyebrow = fallbackText(t("modules.concierge.eyebrow"), "Concierge AI");
  const conciergeTitle = fallbackText(
    t("modules.concierge.title"),
    "Connected to marketplace discovery and SaaS execution"
  );
  const conciergeBody = fallbackText(
    t("modules.concierge.body"),
    "SignalBoost routes buyer intent, partner data, and operational tasks through a single assistant layer so teams can move from question to action."
  );
  const conciergeCta = fallbackText(t("modules.concierge.cta"), "Open Concierge");

  return (
    <CockpitShell eyebrow={eyebrow} title={title} subtitle={summary}>
      <section className="cockpit-section module-detail" style={{ "--module-accent": module.accent } as CSSProperties}>
        <div className="module-detail-panel module-prime">
          <span className="telemetry-label">{missionSignalLabel}</span>
          <strong>{signal}</strong>
          <p>{telemetry}</p>
        </div>
        <div className="module-detail-panel">
          <span className="telemetry-label">{coreSystemsLabel}</span>
          <ul>
            {features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </div>
        <div className="module-detail-panel">
          <span className="telemetry-label">{automationsLabel}</span>
          <ul>
            {automations.map((automation) => (
              <li key={automation}>{automation}</li>
            ))}
          </ul>
        </div>
      </section>
      <ModuleBackendPanel slug={module.slug} />
      <section className="cockpit-section concierge-band">
        <div>
          <p className="cockpit-eyebrow">{conciergeEyebrow}</p>
          <h2>{conciergeTitle}</h2>
          <p>{conciergeBody}</p>
        </div>
        <Link className="cockpit-primary" href="/assistant">{conciergeCta}</Link>
      </section>
    </CockpitShell>
  );
}
