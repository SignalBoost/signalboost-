// File: app/partners/[slug]/page.tsx

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getAllPartners,
  getPartnerById,
  getRelatedPartners,
  getCategoryLabel,
  getRegionLabel,
} from "@/lib/partners";

export async function generateStaticParams() {
  return getAllPartners().map((p) => ({ slug: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const partner = getPartnerById(slug);
  if (!partner) return {};

  const title = `${partner.name} — ${getCategoryLabel(
    partner.category_key
  )} | SignalBoost`;

  const description =
    partner.description ||
    `Explore ${partner.name} offers on SignalBoost — available in ${partner.regions
      .map(getRegionLabel)
      .join(", ")}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://www.signalboostapp.com/partners/${partner.id}`,
      siteName: "SignalBoost",
      type: "website",
    },
    alternates: {
      canonical: `https://www.signalboostapp.com/partners/${partner.id}`,
    },
  };
}

export default async function PartnerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const partner = getPartnerById(slug);

  if (!partner) notFound();

  const related = getRelatedPartners(partner);
  const categoryLabel = getCategoryLabel(partner.category_key);
  const initial = partner.name.charAt(0).toUpperCase();
  const logoSrc = `/logos/${partner.logo}`;

  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: partner.name,
    description: partner.description,
    url: partner.url,
    areaServed: partner.regions.map(getRegionLabel),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <header className="sb-header">
        <a href="/" className="sb-logo">
          SignalBoost
        </a>
        <a href="/" className="sb-back">
          All offers
        </a>
      </header>

      <main className="partner-page">
        <div className="partner-card">
          <div className="partner-top">
            <div className="partner-logo">
              <img
                src={logoSrc}
                alt={partner.name}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <span style={{ position: "absolute" }}>{initial}</span>
            </div>

            <div className="partner-meta">
              <h1 className="partner-name">{partner.name}</h1>

              <div className="partner-badges">
                <span className="badge badge-gold">{categoryLabel}</span>

                {partner.featured && (
                  <span className="badge badge-outline">Featured</span>
                )}

                {partner.travel_related && (
                  <span className="badge badge-outline">Travel</span>
                )}

                {partner.regions.slice(0, 3).map((r) => (
                  <span key={r} className="badge badge-region">
                    {getRegionLabel(r)}
                  </span>
                ))}

                {partner.regions.length > 3 && (
                  <span className="badge badge-outline">
                    +{partner.regions.length - 3} more
                  </span>
                )}
              </div>
            </div>
          </div>

          {partner.description && (
            <p className="partner-description">{partner.description}</p>
          )}

          <a
            href={partner.url}
            className="partner-cta"
            target="_blank"
            rel="noopener noreferrer sponsored"
          >
            Visit {partner.name}
          </a>

          <hr className="partner-divider" />

          <div className="partner-detail-grid">
            <div className="detail-cell">
              <div className="detail-label">Category</div>
              <div className="detail-value">{categoryLabel}</div>
            </div>

            <div className="detail-cell">
              <div className="detail-label">Network</div>
              <div className="detail-value">{partner.network || "—"}</div>
            </div>

            <div className="detail-cell">
              <div className="detail-label">Tier</div>
              <div className="detail-value">Tier {partner.tier}</div>
            </div>

            <div className="detail-cell">
              <div className="detail-label">Regions</div>
              <div className="detail-value">
                {partner.regions.length} regions
              </div>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="related-section">
            <h2 className="related-title">More in {categoryLabel}</h2>

            <div className="related-grid">
              {related.map((r) => (
                <a
                  key={r.id}
                  href={`/partners/${r.id}`}
                  className="related-card"
                >
                  <div className="related-card-name">{r.name}</div>
                  <div className="related-card-cat">
                    {r.regions.map(getRegionLabel).slice(0, 2).join(" · ")}
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
