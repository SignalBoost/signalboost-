"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import useTranslation from "@/components/i18n/useTranslation";
import { REGIONS } from "@/lib/home/regions";
import { hasRegionalPartnerUrl, logoSrc, resolveRegionalPartnerUrl } from "@/lib/partner-links";

type MarketplacePartner = {
  id: string;
  name: string;
  regions: string[];
  url: string;
  category: string;
  category_key: string;
  category_label: string;
  network: string;
  logo: string;
  description: string;
  tier: number;
  featured: boolean;
  regional_urls: Partial<Record<string, string>>;
};

function fallbackText(value: string, fallback: string) {
  return value.includes(".") ? fallback : value;
}

export default function MarketplaceClient({ partners }: { partners: MarketplacePartner[] }) {
  const { t } = useTranslation();
  const [region, setRegion] = useState("ot");
  const [category, setCategory] = useState("all");

  const categories = useMemo(() => {
    const map = new Map<string, string>();
    partners.forEach((partner) => map.set(partner.category_key, partner.category_label || partner.category));
    return Array.from(map, ([key, label]) => ({ key, label })).sort((a, b) => a.label.localeCompare(b.label));
  }, [partners]);

  const filtered = useMemo(() => {
    return partners
      .filter((partner) => category === "all" || partner.category_key === category)
      .filter((partner) => partner.regions.includes(region) || partner.regions.includes("ot") || hasRegionalPartnerUrl(partner, region))
      .sort((a, b) => Number(b.featured) - Number(a.featured) || a.tier - b.tier || a.name.localeCompare(b.name));
  }, [category, partners, region]);

  return (
    <main className="marketplace-page">
      <section className="marketplace-hero">
        <p className="cockpit-eyebrow">{fallbackText(t("marketplace.eyebrow"), "SignalBoost marketplace")}</p>
        <h1>{fallbackText(t("marketplace.title"), "Regional partner marketplace")}</h1>
        <p>{fallbackText(t("marketplace.description"), "Browse verified affiliate partners with logos that load from trusted brand sources and links resolved for your region when available.")}</p>
      </section>

      <section className="marketplace-controls" aria-label="Marketplace filters">
        <label>
          {fallbackText(t("marketplace.regionLabel"), "Region")}
          <select value={region} onChange={(event) => setRegion(event.target.value)}>
            {REGIONS.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}
          </select>
        </label>
        <label>
          {fallbackText(t("marketplace.categoryLabel"), "Category")}
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="all">{fallbackText(t("marketplace.allCategories"), "All categories")}</option>
            {categories.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}
          </select>
        </label>
        <strong>{filtered.length} {fallbackText(t("marketplace.partnersCount"), "partners")}</strong>
      </section>

      <section className="marketplace-grid" aria-label="Partner marketplace cards">
        {filtered.map((partner) => {
          const href = resolveRegionalPartnerUrl(partner, region);
          const regional = hasRegionalPartnerUrl(partner, region);
          return (
            <article className="marketplace-card" key={partner.id}>
              <div className="marketplace-card__top">
                <span className="marketplace-card__logo">
                  <img src={logoSrc(partner.logo)} alt={`${partner.name} logo`} loading="lazy" />
                </span>
                <div>
                  <h2>{partner.name}</h2>
                  <p>{partner.category_label || partner.category}</p>
                </div>
              </div>
              <p className="marketplace-card__description">{partner.description}</p>
              <div className="marketplace-card__badges">
                {partner.featured && <span>{fallbackText(t("marketplace.featured"), "Featured")}</span>}
                <span>{partner.network}</span>
                <span>{regional ? fallbackText(t("marketplace.regionalUrl"), "Regional link active") : fallbackText(t("marketplace.globalUrl"), "Global link")}</span>
              </div>
              <div className="marketplace-card__actions">
                <a href={href} target="_blank" rel="noopener noreferrer sponsored">{fallbackText(t("marketplace.visit"), "Visit regional offer")}</a>
                <Link href={`/partners/${partner.id}`}>{fallbackText(t("marketplace.details"), "Details")}</Link>
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
