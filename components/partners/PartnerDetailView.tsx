// File: components/partners/PartnerDetailView.tsx
// Client view for a single partner. The server page (app/partners/[slug]/page.tsx)
// handles data fetching, metadata, and static params, then passes plain data here
// so this component can translate the UI chrome via useTranslation.
"use client";

import useTranslation from "@/components/i18n/useTranslation";

function fallbackText(value: string, fallback: string) {
  return value.includes(".") ? fallback : value;
}

export type PartnerView = {
  id: string;
  name: string;
  description?: string;
  url: string;
  logo?: string;
  network?: string;
  tier: number | string;
  featured?: boolean;
  travel_related?: boolean;
  categoryLabel: string;
  regionLabels: string[];
};

export type RelatedView = {
  id: string;
  name: string;
  regionLabels: string[];
};

export default function PartnerDetailView({
  partner,
  related,
}: {
  partner: PartnerView;
  related: RelatedView[];
}) {
  const { t } = useTranslation();
  const initial = partner.name.charAt(0).toUpperCase();
  const logoSrc = `/logos/${partner.logo}`;
  const extraRegions = partner.regionLabels.length - 3;

  return (
    <>
      <header className="sb-header">
        <a href="/" className="sb-logo">SignalBoost</a>
        <a href="/" className="sb-back">{fallbackText(t("partner.allOffers"), "All offers")}</a>
      </header>

      <main className="partner-page">
        <div className="partner-card">
          <div className="partner-top">
            <div className="partner-logo">
              <img src={logoSrc} alt={partner.name} />
              <span style={{ position: "absolute" }}>{initial}</span>
            </div>

            <div className="partner-meta">
              <h1 className="partner-name">{partner.name}</h1>

              <div className="partner-badges">
                <span className="badge badge-gold">{partner.categoryLabel}</span>
                {partner.featured && (
                  <span className="badge badge-outline">{fallbackText(t("partner.featured"), "Featured")}</span>
                )}
                {partner.travel_related && (
                  <span className="badge badge-outline">{fallbackText(t("partner.travel"), "Travel")}</span>
                )}
                {partner.regionLabels.slice(0, 3).map((region) => (
                  <span key={region} className="badge badge-region">{region}</span>
                ))}
                {extraRegions > 0 && (
                  <span className="badge badge-outline">
                    +{extraRegions} {fallbackText(t("partner.more"), "more")}
                  </span>
                )}
              </div>
            </div>
          </div>

          {partner.description && <p className="partner-description">{partner.description}</p>}

          <a href={partner.url} className="partner-cta" target="_blank" rel="noopener noreferrer sponsored">
            {fallbackText(t("partner.visit"), `Visit ${partner.name}`).replace("{name}", partner.name)}
          </a>

          <hr className="partner-divider" />

          <div className="partner-detail-grid">
            <div className="detail-cell">
              <div className="detail-label">{fallbackText(t("partner.category"), "Category")}</div>
              <div className="detail-value">{partner.categoryLabel}</div>
            </div>
            <div className="detail-cell">
              <div className="detail-label">{fallbackText(t("partner.network"), "Network")}</div>
              <div className="detail-value">{partner.network || "—"}</div>
            </div>
            <div className="detail-cell">
              <div className="detail-label">{fallbackText(t("partner.tier"), "Tier")}</div>
              <div className="detail-value">{fallbackText(t("partner.tierN"), `Tier ${partner.tier}`).replace("{n}", String(partner.tier))}</div>
            </div>
            <div className="detail-cell">
              <div className="detail-label">{fallbackText(t("partner.regions"), "Regions")}</div>
              <div className="detail-value">{fallbackText(t("partner.regionsN"), `${partner.regionLabels.length} regions`).replace("{n}", String(partner.regionLabels.length))}</div>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="related-section">
            <h2 className="related-title">
              {fallbackText(t("partner.moreIn"), `More in ${partner.categoryLabel}`).replace("{category}", partner.categoryLabel)}
            </h2>
            <div className="related-grid">
              {related.map((rp) => (
                <a key={rp.id} href={`/partners/${rp.id}`} className="related-card">
                  <div className="related-card-name">{rp.name}</div>
                  <div className="related-card-cat">{rp.regionLabels.slice(0, 2).join(" · ")}</div>
                </a>
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
