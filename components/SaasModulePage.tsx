"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import { saasModules } from "@/lib/saas-modules";
import { CockpitShell } from "@/components/CockpitShell";
import ModuleBackendPanel from "@/components/ModuleBackendPanel";
import ReviewsStageOne from "@/components/ReviewsStageOne";
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
  const features = module.featureKeys.map((key, index) => fallbackText(t(key), module.features[index]));
  const automations = module.automationKeys.map((key, index) => fallbackText(t(key), module.automations[index]));

  return (
    <CockpitShell eyebrow={eyebrow} title={title} subtitle={summary}>
      <section className="cockpit-section module-detail" style={{ "--module-accent": module.accent } as CSSProperties}>
        <div className="module-detail-panel module-prime">
          <span className="telemetry-label">{fallbackText(t("modulePage.missionSignal"), "Mission signal")}</span>
          <strong>{signal}</strong>
          <p>{telemetry}</p>
        </div>
        <div className="module-detail-panel">
          <span className="telemetry-label">{fallbackText(t("modulePage.coreSystems"), "Core systems")}</span>
          <ul>
            {features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </div>
        <div className="module-detail-panel">
          <span className="telemetry-label">{fallbackText(t("modulePage.conciergeAutomations"), "Concierge AI automations")}</span>
          <ul>
            {automations.map((automation) => (
              <li key={automation}>{automation}</li>
            ))}
          </ul>
        </div>
      </section>
      {module.slug === "reviews" && <ReviewsStageOne />}
      <ModuleBackendPanel slug={module.slug} />
      <section className="cockpit-section concierge-band">
        <div>
          <p className="cockpit-eyebrow">{fallbackText(t("modulePage.conciergeEyebrow"), "Concierge AI")}</p>
          <h2>{fallbackText(t("modulePage.conciergeTitle"), "Connected to marketplace discovery and SaaS execution")}</h2>
          <p>
            {fallbackText(t("modulePage.conciergeDescription"), "SignalBoost routes buyer intent, partner data, and operational tasks through a single assistant layer so teams can move from question to action.")}
          </p>
        </div>
        <Link className="cockpit-primary" href="/assistant">{fallbackText(t("modulePage.conciergeCta"), "Open Concierge")}</Link>
      </section>
    </CockpitShell>
  );
}
