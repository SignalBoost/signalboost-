// File: components/pricing/PricingCockpit.tsx
"use client";

import React from "react";
import useTranslation from "@/components/i18n/useTranslation";
import { createClient } from "@/lib/supabase/client";

function fallbackText(value: string, fallback: string) {
  return /^[a-zA-Z][\w$]*(\.[\w$]+)+$/.test(value) ? fallback : value;
}

const ACTIVE_SUBSCRIPTION_STATUSES = ["active", "trialing", "past_due"];

type SubscriptionRow = {
  plan: string | null;
  status: string | null;
};

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

export default function PricingCockpit() {
  const { t } = useTranslation();
  const [loadingPlan, setLoadingPlan] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = React.useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = React.useState<string | null>(null);

  async function refreshCurrentPlan() {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return;

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setCurrentPlan(null);
      setCurrentStatus(null);
      return;
    }

    const { data } = await supabase
      .from("subscriptions")
      .select("plan,status")
      .eq("owner_id", user.id)
      .maybeSingle<SubscriptionRow>();

    setCurrentPlan(data?.plan ?? null);
    setCurrentStatus(data?.status ?? null);
  }

  React.useEffect(() => {
    void refreshCurrentPlan();

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return;
    const supabase = createClient();
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      void refreshCurrentPlan();
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  function redirectToSignup(plan: string) {
    const params = new URLSearchParams({
      plan,
      next: `/pricing?checkout_plan=${encodeURIComponent(plan)}`,
    });

    window.location.href = `/signup?${params.toString()}`;
  }

  async function startCheckout(plan: string) {
    try {
      setError(null);
      setLoadingPlan(plan);

      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();

      if (res.status === 401) {
        redirectToSignup(plan);
        return;
      }

      if (!res.ok || !data.url) {
        throw new Error(data.error || "Could not start checkout.");
      }

      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start checkout.");
    } finally {
      setLoadingPlan(null);
    }
  }

  const eyebrow = fallbackText(t("pricing.eyebrow"), "Tiered SaaS modules");
  const title = fallbackText(t("pricing.title"), "Pricing cockpit");
  const subtitle = fallbackText(
    t("pricing.subtitle"),
    "Choose the SignalBoost mission package that matches your marketplace, SaaS, and executive operating needs."
  );
  const hasActiveCurrentPlan = currentPlan && ACTIVE_SUBSCRIPTION_STATUSES.includes(currentStatus ?? "");

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
          const isCurrentPlan = hasActiveCurrentPlan && currentPlan === tier.key;

          return (
            <article className={tier.featured ? "pricing-card featured" : "pricing-card"} key={tier.key}>
              {tier.featured && (
                <span className="pricing-ribbon">
                  {fallbackText(t("pricing.recommended"), "Recommended")}
                </span>
              )}

              <h2>{name}</h2>
              <strong>{price}</strong>
              <p>{mission}</p>

              <ul>
                {features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>

              {tier.key === "enterprise" ? (
                <a href="/contact" className="pricing-cta" style={ctaStyle}>
                  Contact sales
                </a>
              ) : isCurrentPlan ? null : (
                <button
                  type="button"
                  className="pricing-cta"
                  style={ctaStyle}
                  onClick={() => startCheckout(tier.key)}
                  disabled={loadingPlan === tier.key}
                >
                  {loadingPlan === tier.key ? "Opening checkout..." : "Subscribe"}
                </button>
              )}
            </article>
          );
        })}
      </section>

      {error && <p style={errorStyle}>{error}</p>}
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

const ctaStyle: React.CSSProperties = {
  display: "block",
  marginTop: "auto",
  textAlign: "center",
  padding: "11px 16px",
  borderRadius: 999,
  border: "1px solid rgba(245,197,66,.5)",
  background: "rgba(245,197,66,.14)",
  color: "#f5c542",
  fontWeight: 800,
  fontSize: 13,
  letterSpacing: "0.04em",
  textDecoration: "none",
  cursor: "pointer",
  width: "100%",
};

const errorStyle: React.CSSProperties = {
  marginTop: 16,
  textAlign: "center",
  color: "#ff8a8a",
  fontWeight: 700,
};
