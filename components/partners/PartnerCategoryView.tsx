// File: components/partners/PartnerCategoryView.tsx
// Client view for a category landing (when the slug is a category_key, not a partner).
"use client";

import useTranslation from "@/components/i18n/useTranslation";

function fallbackText(value: string, fallback: string) {
  return /^[a-zA-Z][\w$]*(\.[\w$]+)+$/.test(value) ? fallback : value;
}

type I18nText = { en?: string; pt?: string; es?: string; pl?: string; ru?: string };

export type CategoryPartner = {
  id: string;
  name: string;
  description?: string;
  description_i18n?: I18nText;
  network?: string;
  tier: number | string;
};

export default function PartnerCategoryView({
  categoryKey,
  categoryLabel,
  partners,
}: {
  categoryKey: string;
  categoryLabel: string;
  partners: CategoryPartner[];
}) {
  const { t, lang } = useTranslation();
  const label = fallbackText(t(`categories.${categoryKey}`), categoryLabel);

  return (
    <main className="partner-page">
      <section className="partner-card">
        <div className="detail-label">{fallbackText(t("partner.directory"), "SignalBoost Directory")}</div>
        <h1 className="partner-name">
          {fallbackText(t("partner.topRegional"), `Top Regional ${label} Providers & Partners`).replace("{category}", label)}
        </h1>
        <p className="partner-description">
          {fallbackText(t("partner.categoryIntro"), `Compare premium, trusted global infrastructure operators and localized regional vendors for ${label.toLowerCase()}.`).replace("{category}", label.toLowerCase())}
        </p>
      </section>

      <section className="related-section">
        <h2 className="related-title">{fallbackText(t("partner.availableStorefronts"), "Available Integrated Storefronts")}</h2>
        <div className="related-grid">
          {partners.map((partner) => {
            const desc = (partner.description_i18n && partner.description_i18n[lang as keyof I18nText]) || partner.description;
            return (
              <a className="related-card" href={`/partners/${partner.id}`} key={partner.id}>
                <div className="related-card-name">{partner.name}</div>
                <div className="related-card-cat">
                  {partner.network} · {fallbackText(t("partner.tierN"), `Tier ${partner.tier}`).replace("{n}", String(partner.tier))}
                </div>
                <p>{desc}</p>
              </a>
            );
          })}
        </div>
      </section>
    </main>
  );
}
