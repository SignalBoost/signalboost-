"use client";

import Concierge from "@/components/Concierge";
import { CockpitShell } from "@/components/CockpitShell";
import { saasModules } from "@/lib/saas-modules";
import useTranslation from "@/components/i18n/useTranslation";

export default function AssistantPageContent() {
  const { t } = useTranslation();
  const assistant = saasModules.find((module) => module.slug === "assistant");

  return (
    <CockpitShell
      eyebrow={t(assistant?.eyebrowKey || "modules.assistant.eyebrow")}
      title={t(assistant?.titleKey || "modules.assistant.title")}
      subtitle={t(assistant?.summaryKey || "modules.assistant.summary")}
    >
      <Concierge />
    </CockpitShell>
  );
}
