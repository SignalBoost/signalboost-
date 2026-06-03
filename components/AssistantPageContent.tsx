"use client";

import Concierge from "@/components/Concierge";
import { saasModules } from "@/lib/saas-modules";
import useTranslation from "@/components/i18n/useTranslation";

export default function AssistantPageContent() {
  const { t } = useTranslation();
  const assistant = saasModules.find((m) => m.slug === "assistant");
  const title = t(assistant?.titleKey || "modules.assistant.title");
  const subtitle = t(assistant?.summaryKey || "modules.assistant.summary");

  return (
    <main className="cockpit-page">
      {/* Compact page header — no orbit, no min-height, no giant hero */}
      <div style={{
        position: "relative",
        zIndex: 1,
        width: "min(1180px, calc(100% - 32px))",
        margin: "0 auto",
        padding: "28px 0 16px",
      }}>
        <p style={{
          color: "#f5c542",
          fontSize: 10,
          fontWeight: 900,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          marginBottom: 6,
        }}>
          {t(assistant?.eyebrowKey || "modules.assistant.eyebrow")}
        </p>
        <h1 style={{
          fontSize: "clamp(22px, 3vw, 36px)",
          fontWeight: 900,
          letterSpacing: "-0.04em",
          lineHeight: 1.1,
          marginBottom: 6,
        }}>
          {/^[a-zA-Z][\w$]*(\.[\w$]+)+$/.test(title) ? "Concierge" : title}
        </h1>
        <p style={{
          color: "rgba(255,255,255,0.6)",
          fontSize: 13,
          maxWidth: 560,
        }}>
          {/^[a-zA-Z][\w$]*(\.[\w$]+)+$/.test(subtitle)
            ? "AI orchestration across all SignalBoost modules."
            : subtitle}
        </p>
      </div>

      {/* Concierge console — full width, no extra wrapper */}
      <div style={{
        position: "relative",
        zIndex: 1,
        width: "min(1180px, calc(100% - 32px))",
        margin: "0 auto",
      }}>
        <Concierge />
      </div>
    </main>
  );
}
