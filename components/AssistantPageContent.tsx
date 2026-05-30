"use client";

import Concierge from "@/components/Concierge";
import { CockpitShell } from "@/components/CockpitShell";
import { saasModules } from "@/lib/saas-modules";
import useTranslation from "@/components/i18n/useTranslation";

function fallbackText(value: string, fallback: string) {
  return value.includes(".") ? fallback : value;
}

export default function AssistantPageContent() {
  const { t } = useTranslation();
  const assistant = saasModules.find((module) => module.slug === "assistant");

  return (
    <CockpitShell
      eyebrow={fallbackText(t(assistant?.eyebrowKey || "modules.assistant.eyebrow"), assistant?.eyebrow || "Concierge AI core")}
      title={fallbackText(t(assistant?.titleKey || "modules.assistant.title"), assistant?.title || "Concierge")}
      subtitle={fallbackText(
        t(assistant?.summaryKey || "modules.assistant.summary"),
        assistant?.summary || "A shared-agency assistant that understands, routes, refines, and keeps SaaS workflows moving."
      )}
    >
      <Concierge />
    </CockpitShell>
  );
}
