"use client";

import Link from "next/link";
import { cockpitCopy, pricingCopy, pricingModules, type SignalBoostLocale } from "@/lib/saas-i18n";
import useTranslation from "@/components/i18n/useTranslation";

export default function PricingCockpit() {
  const { lang } = useTranslation();
  const locale = (lang || "en") as SignalBoostLocale;
  const copy = pricingCopy[locale];

  return (
    <main className="cockpit-page pricing-cockpit">
      <section className="cockpit-hero" aria-labelledby="pricing-title">
        <div className="cockpit-orbit" aria-hidden="true" />
        <p className="cockpit-eyebrow">{copy.eyebrow}</p>
        <h1 id="pricing-title">{copy.title}</h1>
        <p className="cockpit-subtitle">{copy.subtitle}</p>
      </section>
      <section className="cockpit-section pricing-grid" aria-label="SignalBoost SaaS module pricing">
        {pricingModules.map((module) => (
          <article className={module.slug === "reviews" ? "pricing-card featured" : "pricing-card"} key={module.slug}>
            {module.slug === "reviews" && <span className="pricing-ribbon">{copy.recommended}</span>}
            <h2>{copy.names[module.slug]}</h2>
            <strong>${module.price}<small>{copy.perMonth}</small></strong>
            <p>{cockpitCopy[locale].conciergeTitle}</p>
            <ul>
              {copy.features[module.slug].map((feature) => <li key={feature}>{feature}</li>)}
            </ul>
            <Link className="cockpit-primary pricing-cta" href={module.href}>{copy.cta}</Link>
          </article>
        ))}
      </section>
    </main>
  );
}
