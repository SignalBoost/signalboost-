SupportCenter.t"use client";
// File: components/home/SupportCenter.tsx
// A reusable "Support Center" card for the SignalBoost home page. Styled to
// match the dark frosted-glass theme (uses the same CSS variables from
// home.css). Built to GROW: right now it holds the support email, but it's
// structured so you can drop in more items later (FAQ links, hours, a contact
// form, status page, etc.) by adding more <SupportItem> blocks — no restructure
// needed.
//
// Localized heading via the i18n keys support_center_title / support_center_sub
// using the `lang` prop (falls back to English). The email address itself is
// not translated.
//
// Usage in HomeApp.tsx:  <SupportCenter lang={lang} />
import React from "react";
import { I18N } from "@/lib/home/i18n-home";

// The SignalBoost support address (ImprovMX alias -> your Gmail).
const SUPPORT_EMAIL = "support@signalboostapp.com";

interface SupportCenterProps {
  lang?: string;
}

// A single row inside the card. Reuse this for future items (FAQ, hours, etc.).
function SupportItem({
  icon,
  label,
  value,
  href,
}: {
  icon: string;
  label: string;
  value: string;
  href?: string;
}) {
  const inner = (
    <>
      <span
        aria-hidden="true"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 40,
          height: 40,
          flexShrink: 0,
          borderRadius: 12,
          background: "rgba(224,164,37,.14)",
          fontSize: 18,
        }}
      >
        {icon}
      </span>
      <span style={{ minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#8a909c", textTransform: "uppercase", letterSpacing: ".06em" }}>
          {label}
        </span>
        <span style={{ display: "block", fontSize: 15, fontWeight: 600, color: "#f5f6f8", marginTop: 2, wordBreak: "break-word" }}>
          {value}
        </span>
      </span>
    </>
  );

  const rowStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 13,
    padding: "13px 14px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,.10)",
    background: "rgba(255,255,255,.05)",
    textDecoration: "none",
    transition: ".16s ease",
  };

  return href ? (
    <a
      href={href}
      style={rowStyle}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "rgba(224,164,37,.45)";
        e.currentTarget.style.background = "rgba(224,164,37,.10)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "rgba(255,255,255,.10)";
        e.currentTarget.style.background = "rgba(255,255,255,.05)";
      }}
    >
      {inner}
    </a>
  ) : (
    <div style={rowStyle}>{inner}</div>
  );
}

export default function SupportCenter({ lang = "en" }: SupportCenterProps) {
  const t = (key: string, fallback: string) => I18N[lang]?.[key] || I18N.en?.[key] || fallback;

  return (
    <section
      style={{
        width: "100%",
        maxWidth: 560,
        margin: "0 auto",
        padding: "0 18px 64px",
      }}
    >
      <div
        style={{
          border: "1px solid rgba(224,164,37,.40)",
          borderRadius: 22,
          background: "linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.05))",
          backdropFilter: "saturate(150%) blur(14px)",
          WebkitBackdropFilter: "saturate(150%) blur(14px)",
          boxShadow: "0 16px 40px rgba(0,0,0,.55)",
          padding: 24,
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <span style={{ fontSize: 12, fontWeight: 800, color: "#e0a425", letterSpacing: ".15em", textTransform: "uppercase" }}>
            {t("support_center_title", "Support Center")}
          </span>
          <p style={{ margin: "8px 0 0", fontSize: 14, lineHeight: 1.5, color: "rgba(245,246,248,.74)" }}>
            {t("support_center_sub", "Need help? Reach our team and we'll get back to you.")}
          </p>
        </div>

        {/* Items — add more SupportItem blocks here as the center grows. */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <SupportItem
            icon="✉️"
            label={t("support_center_email_label", "Email us")}
            value={SUPPORT_EMAIL}
            href={`mailto:${SUPPORT_EMAIL}`}
          />
          {/* Future items go here, e.g.:
          <SupportItem icon="❓" label="FAQ" value="Browse common questions" href="/faq" />
          <SupportItem icon="🕑" label="Hours" value="Mon–Fri, 9am–6pm" />
          */}
        </div>
      </div>
    </section>
  );
}
