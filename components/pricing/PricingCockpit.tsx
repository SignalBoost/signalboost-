// File: components/pricing/PricingCockpit.tsx
// Project: SignalBoost (main production repo)

import { CockpitShell } from "@/components/CockpitShell";

const tiers = [
  {
    name: "Starter",
    price: "$19/mo",
    mission: "For solo operators validating marketplace demand.",
    features: ["Marketplace access", "Basic Reviews", "Calendar", "Concierge AI starter prompts"],
  },
  {
    name: "Growth",
    price: "$49/mo",
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
    name: "Enterprise",
    price: "Custom",
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
  return (
    <CockpitShell
      eyebrow="Tiered SaaS modules"
      title="Pricing cockpit"
      subtitle="Choose the SignalBoost mission package that matches your marketplace, SaaS, and executive operating needs."
    >
      <section className="cockpit-section pricing-grid" aria-label="SignalBoost SaaS pricing tiers">
        {tiers.map((tier) => (
          <article className={tier.featured ? "pricing-card featured" : "pricing-card"} key={tier.name}>
            {tier.featured && <span className="pricing-ribbon">Recommended</span>}
            <h2>{tier.name}</h2>
            <strong>{tier.price}</strong>
            <p>{tier.mission}</p>
            <ul>
              {tier.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>
    </CockpitShell>
  );
}
