export type RegionalPartner = {
  url?: string;
  regional_urls?: Partial<Record<string, string>>;
};

export function resolveRegionalPartnerUrl(partner: RegionalPartner, region = "ot") {
  const regionalUrls = partner.regional_urls || {};
  return regionalUrls[region] || regionalUrls.ot || partner.url || "#";
}

export function hasRegionalPartnerUrl(partner: RegionalPartner, region = "ot") {
  return Boolean(partner.regional_urls?.[region]);
}

export function logoSrc(logo?: string) {
  if (!logo) return "";
  if (/^https?:\/\//i.test(logo)) return logo;
  if (logo.startsWith("/")) return logo;
  return `/logos/${logo}`;
}
