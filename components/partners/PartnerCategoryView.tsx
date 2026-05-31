// File: components/partners/PartnerCategoryView.tsx
// Client view for a category landing (when the slug is a category_key, not a partner).
"use client";

import useTranslation from "@/components/i18n/useTranslation";

function fallbackText(value: string, fallback: string) {
  return value.includes(".") ? fallback : value;
}

export type CategoryPartner = {
  id: string;
  name: string;
  description?: string;
  network?: string;
  tier: number | string;
};

export default function PartnerCategoryView({
  categoryLabel,
  partners,
}: {
  categoryLabel: string;
  partners: CategoryPartner[];
}) {
  const { t } = useTranslation();

  return (
    <main className="partner-page">
      <section className="partner-card">
        <div className="detail-label">{fallbackText(t("partner.directory"), "SignalBoost Directory")}</div>
        <h1 className="partner-name">
          {fallbackText(t("partner.topRegional"), `Top Regional ${categoryLabel} Providers & Partners`).replace("{category}", categoryLabel)}
        </h1>
        <p className="partner-description">
          {fallbackText(t("partner.categoryIntro"), `Compare premium, trusted global infrastructure operators and localized regional vendors for ${categoryLabel.toLowerCase()}.`).replace("{category}", categoryLabel.toLowerCase())}
        </p>
      </section>

      <section className="related-section">
        <h2 className="related-title">{fallbackText(t("partner.availableStorefronts"), "Available Integrated Storefronts")}</h2>
        <div className="related-grid">
          {partners.map((partner) => (
            <a className="related-card" href={`/partners/${partner.id}`} key={partner.id}>
              <div className="related-card-name">{partner.name}</div>
              <div className="related-card-cat">
                {partner.network} · {fallbackText(t("partner.tierN"), `Tier ${partner.tier}`).replace("{n}", String(partner.tier))}
              </div>
              <p>{partner.description}</p>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
