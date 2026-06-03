"use client";

import Link from "next/link";
import { saasModules } from "@/lib/saas-modules";
import useTranslation from "@/components/i18n/useTranslation";

export default function ModuleGrid() {
  const { t } = useTranslation();
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
      gap: 12,
    }}>
      {saasModules.map((mod) => (
        <Link
          key={mod.slug}
          href={mod.href}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
            padding: "14px 16px",
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.09)",
            background: "linear-gradient(160deg,rgba(17,24,39,0.82),rgba(7,10,17,0.9))",
            textDecoration: "none",
            position: "relative",
            overflow: "hidden",
            transition: "border-color 0.15s, transform 0.15s",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.borderColor = (mod.accent || "#f5c542") + "55";
            (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.09)";
            (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
          }}
        >
          {/* Accent top bar */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: mod.accent || "#f5c542", borderRadius: "16px 16px 0 0" }} />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
            <span style={{ fontSize: 10, fontWeight: 900, color: mod.accent || "#f5c542", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              {t(mod.eyebrowKey)}
            </span>
            <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {t(mod.statusKey)}
            </span>
          </div>

          <h3 style={{ fontSize: 15, fontWeight: 900, color: "#fff", margin: 0, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
            {t(mod.titleKey)}
          </h3>

          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", margin: 0, lineHeight: 1.5, flex: 1 }}>
            {t(mod.summaryKey)}
          </p>

          <div style={{ fontSize: 11, fontWeight: 700, color: mod.accent || "#f5c542", marginTop: 2 }}>
            {t(mod.signalKey)}
          </div>
        </Link>
      ))}
    </div>
  );
}
