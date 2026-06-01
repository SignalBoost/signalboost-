"use client";
import { useEffect, useState } from "react";
import useTranslation from "@/components/i18n/useTranslation";

function fallbackText(value: string, fallback: string) {
  return /^[a-zA-Z][\w$]*(\.[\w$]+)+$/.test(value) ? fallback : value;
}

type BackendSnapshot = {
  status: "ok" | "fallback";
  summary: string;
  actions: string[];
  data: Record<string, string | number | boolean | string[]>;
};

export default function ModuleBackendPanel({ slug }: { slug: string }) {
  const { t, lang } = useTranslation();
  const [snapshot, setSnapshot] = useState<BackendSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  function dataLabel(value: string | number | boolean | string[]) {
    if (Array.isArray(value)) return value.join(", ");
    if (typeof value === "boolean") return value ? fallbackText(t("moduleBackend.yes"), "Yes") : fallbackText(t("moduleBackend.no"), "No");
    return String(value);
  }

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetch(`/api/saas/${slug}?lang=${encodeURIComponent(lang)}`, { cache: "no-store" })
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
  }, [slug, lang]);

  const heading = loading
    ? fallbackText(t("moduleBackend.connecting"), "Connecting live module API…")
    : snapshot?.status === "ok"
    ? fallbackText(t("moduleBackend.connected"), "Live API connected")
    : fallbackText(t("moduleBackend.fallback"), "Fallback API path active");

  return (
    <section className="cockpit-section module-backend-panel" aria-label="signalboost-live backend status">
      <div>
        <p className="cockpit-eyebrow">{fallbackText(t("moduleBackend.eyebrow"), "signalboost-live backend")}</p>
        <h2>{heading}</h2>
        <p>{snapshot?.summary || fallbackText(t("moduleBackend.fallbackSummary"), "SignalBoost is checking the live backend and will keep this module usable with safe fallback data.")}</p>
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
