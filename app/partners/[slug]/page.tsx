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
  const partners = getAllPartners();
  const partnerParams = partners.map((p) => ({ slug: p.id }));
  const categoryParams = Array.from(new Set(partners.map((p) => p.category_key))).map((slug) => ({ slug }));
  return [...partnerParams, ...categoryParams];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const partner = getPartnerById(slug);

  if (!partner) {
    const categoryPartners = getAllPartners().filter((p) => p.category_key === slug);
    if (categoryPartners.length === 0) return {};
    const categoryLabel = getCategoryLabel(slug);
    return {
      title: `${categoryLabel} Providers & Partners | SignalBoost`,
      description: `Compare trusted SignalBoost marketplace providers for ${categoryLabel}.`,
      alternates: { canonical: `https://www.signalboostapp.com/partners/${slug}` },
    };
  }

  const categoryLabel = getCategoryLabel(
    partner.category_key
  );

  const title = `${partner.name} — ${categoryLabel} | SignalBoost`;

  const description =
    partner.description ||
    `Explore ${partner.name} offers on SignalBoost — available in ${partner.regions
      .map(getRegionLabel)
      .join(", ")}`;

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

  if (!partner) {
    return <CategoryPage slug={slug} />;
  }

  const related = getRelatedPartners(partner);

  const categoryLabel = getCategoryLabel(
    partner.category_key
  );

  const initial = partner.name.charAt(0).toUpperCase();

  const logoSrc = `/logos/${partner.logo}`;

  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: partner.name,
    description: partner.description,
    url: partner.url,
    areaServed: partner.regions.map(
      getRegionLabel
    ),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema),
        }}
      />

      <header className="sb-header">
        <a
          href="/"
          className="sb-logo"
        >
          SignalBoost
        </a>

        <a
          href="/"
          className="sb-back"
        >
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
              />

              <span
                style={{
                  position: "absolute",
                }}
              >
                {initial}
              </span>
            </div>

            <div className="partner-meta">
              <h1 className="partner-name">
                {partner.name}
              </h1>

              <div className="partner-badges">
                <span className="badge badge-gold">
                  {categoryLabel}
                </span>

                {partner.featured && (
                  <span className="badge badge-outline">
                    Featured
                  </span>
                )}

                {partner.travel_related && (
                  <span className="badge badge-outline">
                    Travel
                  </span>
                )}

                {partner.regions
                  .slice(0, 3)
                  .map((region) => (
                    <span
                      key={region}
                      className="badge badge-region"
                    >
                      {getRegionLabel(
                        region
                      )}
                    </span>
                  ))}

                {partner.regions.length >
                  3 && (
                  <span className="badge badge-outline">
                    +
                    {partner
                      .regions
                      .length - 3}{" "}
                    more
                  </span>
                )}
              </div>
            </div>
          </div>

          {partner.description && (
            <p className="partner-description">
              {partner.description}
            </p>
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
              <div className="detail-label">
                Category
              </div>

              <div className="detail-value">
                {categoryLabel}
              </div>
            </div>

            <div className="detail-cell">
              <div className="detail-label">
                Network
              </div>

              <div className="detail-value">
                {partner.network ||
                  "—"}
              </div>
            </div>

            <div className="detail-cell">
              <div className="detail-label">
                Tier
              </div>

              <div className="detail-value">
                Tier {partner.tier}
              </div>
            </div>

            <div className="detail-cell">
              <div className="detail-label">
                Regions
              </div>

              <div className="detail-value">
                {
                  partner.regions
                    .length
                }{" "}
                regions
              </div>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="related-section">
            <h2 className="related-title">
              More in{" "}
              {categoryLabel}
            </h2>

            <div className="related-grid">
              {related.map(
                (relatedPartner) => (
                  <a
                    key={
                      relatedPartner.id
                    }
                    href={`/partners/${relatedPartner.id}`}
                    className="related-card"
                  >
                    <div className="related-card-name">
                      {
                        relatedPartner.name
                      }
                    </div>

                    <div className="related-card-cat">
                      {relatedPartner.regions
                        .map(
                          getRegionLabel
                        )
                        .slice(
                          0,
                          2
                        )
                        .join(
                          " · "
                        )}
                    </div>
                  </a>
                )
              )}
            </div>
          </section>
        )}
      </main>
    </>
  );
}

function CategoryPage({ slug }: { slug: string }) {
  const filteredPartners = getAllPartners().filter((p) => p.category_key === slug);

  if (filteredPartners.length === 0) {
    notFound();
  }

  const categoryLabel = getCategoryLabel(slug);

  return (
    <main className="partner-page">
      <section className="partner-card">
        <div className="detail-label">SignalBoost Directory</div>
        <h1 className="partner-name">Top Regional {categoryLabel} Providers & Partners</h1>
        <p className="partner-description">
          Compare premium, trusted global infrastructure operators and localized regional vendors for {categoryLabel.toLowerCase()}.
        </p>
      </section>

      <section className="related-section">
        <h2 className="related-title">Available Integrated Storefronts</h2>
        <div className="related-grid">
          {filteredPartners.map((partner) => (
            <a className="related-card" href={`/partners/${partner.id}`} key={partner.id}>
              <div className="related-card-name">{partner.name}</div>
              <div className="related-card-cat">{partner.network} · Tier {partner.tier}</div>
              <p>{partner.description}</p>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
