"use client";

import { useEffect, useState } from "react";
import useTranslation from "@/components/i18n/useTranslation";

type BackendSnapshot = {
  status: "ok" | "fallback";
  summary: string;
  actions: string[];
  data: Record<string, string | number | boolean | string[]>;
};

function dataLabel(value: string | number | boolean | string[]) {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

function fallbackText(value: string, fallback: string) {
  return value.includes(".") ? fallback : value;
}

export default function ModuleBackendPanel({ slug }: { slug: string }) {
  const { t } = useTranslation();
  const [snapshot, setSnapshot] = useState<BackendSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetch(`/api/saas/${slug}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (alive) setSnapshot(data);
      })
      .catch(() => {
        if (alive) setSnapshot(null);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [slug]);

  return (
    <section className="cockpit-section module-backend-panel" aria-label={fallbackText(t("modulePage.backendEyebrow"), "signalboost-live backend")}>
      <div>
        <p className="cockpit-eyebrow">{fallbackText(t("modulePage.backendEyebrow"), "signalboost-live backend")}</p>
        <h2>
          {loading
            ? fallbackText(t("modulePage.backendLoading"), "Connecting live module API…")
            : snapshot?.status === "ok"
            ? fallbackText(t("modulePage.backendConnected"), "Live API connected")
            : fallbackText(t("modulePage.backendFallback"), "Fallback API path active")}
        </h2>
        <p>{snapshot?.summary || fallbackText(t("modulePage.backendFallbackDescription"), "SignalBoost is checking the live backend and will keep this module usable with safe fallback data.")}</p>
      </div>
      {snapshot && (
        <div className="module-backend-grid">
          {snapshot.actions?.slice(0, 3).map((action) => (
            <span key={action}>{action}</span>
          ))}
          {Object.entries(snapshot.data || {})
            .slice(0, 4)
            .map(([key, value]) => (
              <span key={key}>{key}: {dataLabel(value)}</span>
            ))}
        </div>
      )}
    </section>
  );
}
