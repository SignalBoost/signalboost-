// File: app/partners/[slug]/page.tsx
//
// Server component: data fetch, SEO metadata, and static params stay here.
// Visible UI is rendered by client views so it can be translated via useTranslation.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getAllPartners,
  getPartnerById,
  getRelatedPartners,
  getCategoryLabel,
  getRegionLabel,
} from "@/lib/partners";
import PartnerDetailView from "@/components/partners/PartnerDetailView";
import PartnerCategoryView from "@/components/partners/PartnerCategoryView";

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

  const categoryLabel = getCategoryLabel(partner.category_key);
  const title = `${partner.name} — ${categoryLabel} | SignalBoost`;
  const description =
    partner.description ||
    `Explore ${partner.name} offers on SignalBoost — available in ${partner.regions.map(getRegionLabel).join(", ")}`;

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

  // Category landing fallback when the slug is a category_key, not a partner id.
  if (!partner) {
    const filtered = getAllPartners().filter((p) => p.category_key === slug);
    if (filtered.length === 0) notFound();
    const categoryLabel = getCategoryLabel(slug);
    return (
      <PartnerCategoryView
        categoryKey={slug}
        categoryLabel={categoryLabel}
        partners={filtered.map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          description_i18n: p.description_i18n,
          network: p.network,
          tier: p.tier,
        }))}
      />
    );
  }

  const related = getRelatedPartners(partner);
  const categoryLabel = getCategoryLabel(partner.category_key);

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
      <PartnerDetailView
        partner={{
          id: partner.id,
          name: partner.name,
          description: partner.description,
          description_i18n: partner.description_i18n,
          url: partner.url,
          logo: partner.logo,
          network: partner.network,
          tier: partner.tier,
          featured: partner.featured,
          travel_related: partner.travel_related,
          categoryKey: partner.category_key,
          categoryLabel,
          regionKeys: partner.regions,
          regionLabels: partner.regions.map(getRegionLabel),
        }}
        related={related.map((rp) => ({
          id: rp.id,
          name: rp.name,
          regionKeys: rp.regions,
          regionLabels: rp.regions.map(getRegionLabel),
        }))}
      />
    </>
  );
}
