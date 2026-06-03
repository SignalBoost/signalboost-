// File: components/pricing/PricingCockpit.tsx
// Project: SignalBoost (main production repo)
"use client";
import React from "react";
import useTranslation from "@/components/i18n/useTranslation";

function fallbackText(value: string, fallback: string) {
  return /^[a-zA-Z][\w$]*(\.[\w$]+)+$/.test(value) ? fallback : value;
}

// Price numbers are universal; only the unit ("/mo") or "Custom" is translated.
const tiers = [
  {
    key: "starter",
    name: "Starter",
    priceNumber: "$19",
    priceUnitKey: "pricing.perMonth",
    priceUnitFallback: "/mo",
    mission: "For solo operators validating marketplace demand.",
    features: ["Marketplace access", "Basic Reviews", "Calendar", "Concierge AI starter prompts"],
  },
  {
    key: "growth",
    name: "Growth",
    priceNumber: "$49",
    priceUnitKey: "pricing.perMonth",
    priceUnitFallback: "/mo",
    mission: "For teams promoting businesses and coordinating daily execution.",
    featured: true,
    features: [
      "Marketplace access",
      "Reviews + Promote Business",
      "Calendar + Spreadsheets",
      "Outreach tools",
      "Admin telemetry summaries",
    ],
  },
  {
    key: "enterprise",
    name: "Enterprise",
    priceNumber: "",
    priceUnitKey: "pricing.custom",
    priceUnitFallback: "Custom",
    mission: "For executive teams operating a complete revenue cockpit.",
    features: [
      "All SaaS modules",
      "Personal Assistant",
      "Executive Dashboard",
      "Dedicated Concierge AI",
      "Forecasting and CRM telemetry",
    ],
  },
];

const COMING_SOON: Record<string, string> = {
  en: "Coming soon",
  es: "Próximamente",
  pt: "Em breve",
  pl: "Wkrótce",
  ru: "Скоро",
};

export default function PricingCockpit() {
  const { t, lang } = useTranslation();
  const comingSoon = COMING_SOON[lang] ?? COMING_SOON.en;

  const eyebrow = fallbackText(t("pricing.eyebrow"), "Tiered SaaS modules");
  const title = fallbackText(t("pricing.title"), "Pricing cockpit");
  const subtitle = fallbackText(
    t("pricing.subtitle"),
    "Choose the SignalBoost mission package that matches your marketplace, SaaS, and executive operating needs."
  );

  return (
    <div style={pageStyle}>
      <header style={headerBarStyle}>
        <div style={headerTextWrap}>
          <span style={eyebrowStyle}>{eyebrow}</span>
          <h1 style={titleStyle}>{title}</h1>
        </div>
        <p style={subtitleStyle}>{subtitle}</p>
      </header>

      <section className="cockpit-section pricing-grid" aria-label="SignalBoost SaaS pricing tiers">
        {tiers.map((tier) => {
          const name = fallbackText(t(`pricing.${tier.key}.name`), tier.name);
          const mission = fallbackText(t(`pricing.${tier.key}.mission`), tier.mission);
          const unit = fallbackText(t(tier.priceUnitKey), tier.priceUnitFallback);
          const price = tier.priceNumber ? `${tier.priceNumber}${unit}` : unit;
          const features = tier.features.map((f, i) =>
            fallbackText(t(`pricing.${tier.key}.features.${i}`), f)
          );
          return (
            <article className={tier.featured ? "pricing-card featured" : "pricing-card"} key={tier.key}>
              {tier.featured && <span className="pricing-ribbon">{fallbackText(t("pricing.recommended"), "Recommended")}</span>}
              <h2>{name}</h2>
              <strong>{price}</strong>
              <p>{mission}</p>
              <ul>
                {features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <span className="pricing-coming-soon" aria-disabled="true" style={comingSoonStyle}>{comingSoon}</span>
            </article>
          );
        })}
      </section>
    </div>
  );
}

const pageStyle: React.CSSProperties = {
  maxWidth: 1100,
  margin: "0 auto",
  padding: "20px 20px 48px",
};

const headerBarStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "baseline",
  justifyContent: "space-between",
  gap: 12,
  padding: "14px 18px",
  borderRadius: 14,
  border: "1px solid rgba(245,197,66,.18)",
  background: "rgba(245,197,66,.04)",
  marginBottom: 24,
};

const headerTextWrap: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 2,
};

const eyebrowStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "#dfa837",
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 22,
  fontWeight: 800,
  color: "#f5c542",
  lineHeight: 1.15,
};

const subtitleStyle: React.CSSProperties = {
  margin: 0,
  maxWidth: 520,
  fontSize: 13,
  lineHeight: 1.5,
  color: "rgba(230,232,238,.72)",
};

const comingSoonStyle: React.CSSProperties = {
  display: "block",
  marginTop: "auto",
  textAlign: "center",
  padding: "11px 16px",
  borderRadius: 999,
  border: "1px dashed rgba(245,197,66,.4)",
  background: "rgba(245,197,66,.06)",
  color: "#dfa837",
  fontWeight: 800,
  fontSize: 13,
  letterSpacing: "0.04em",
};
