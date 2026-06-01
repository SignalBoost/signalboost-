"use client";

import React from "react";
import partnersJson from "@/public/partners.json";
import useTranslation from "./i18n/useTranslation";

interface I18n {
  en?: string;
  es?: string;
  pt?: string;
  pl?: string;
  ru?: string;
}

interface Partner {
  id: string;
  name: string;
  category: string;
  category_label?: string;
  logo: string;
  description: string;
  description_i18n?: I18n;
  url?: string;
  network?: string;
  tier?: number;
}

interface PartnerDescriptionProps {
  partners?: Partner[];
  description?: string;
  descriptionI18n?: I18n;
}

const partners = partnersJson as Partner[];

function fallbackText(value: string, fallback: string) {
  return /^[a-zA-Z][\w$]*(\.[\w$]+)+$/.test(value) ? fallback : value;
}

function localizedDescription(partner: Partner, lang: keyof I18n) {
  return partner.description_i18n?.[lang] || partner.description_i18n?.en || partner.description;
}

function partnerDetailHref(partner: Partner) {
  return `/partners/${partner.id}`;
}

export default function PartnerDescription({
  partners: providedPartners,
  description,
  descriptionI18n,
}: PartnerDescriptionProps) {
  const { t, lang } = useTranslation();
  const title = fallbackText(t("partner.title"), "Our Partners");
  const directoryTitle = fallbackText(t("partner.directoryTitle"), "Partner Directory");
  const empty = fallbackText(t("partner.empty"), "No partners available");
  const categoryLabel = fallbackText(t("partner.category"), "Category");
  const visitLabel = fallbackText(t("partner.visit"), "Visit Node");
  const networkLabel = fallbackText(t("partner.network"), "Network");
  const platformLabel = fallbackText(t("partner.platform"), "Platform");

  if (description || descriptionI18n) {
    const targetLang = lang as keyof I18n;
    const resolved = descriptionI18n?.[targetLang] || descriptionI18n?.en || description || "";
    return <p style={styles.descText}>{resolved}</p>;
  }

  const list = providedPartners?.length ? providedPartners : partners;

  return (
    <section style={styles.section} aria-labelledby="partner-description-title">
      <div style={styles.header}>
        <span style={styles.eyebrow}>{title}</span>
        <h1 id="partner-description-title" style={styles.title}>{directoryTitle}</h1>
      </div>

      {list.length === 0 ? (
        <p style={styles.empty}>{empty}</p>
      ) : (
        <div style={styles.grid}>
          {list.map((partner) => (
            <article key={partner.id} style={styles.card}>
              <div style={styles.cardTop}>
                <a href={partnerDetailHref(partner)} style={styles.logoLink} aria-label={`${partner.name} partner details`}>
                  <span style={styles.logoWrap}>
                    <img src={`/logos/${partner.logo}`}
                      alt={`${partner.name} logo`}
                      loading="lazy"
                      style={styles.logo}
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                        const fallback = event.currentTarget.nextElementSibling;
                        if (fallback instanceof HTMLElement) fallback.style.display = "inline";
                      }}
                    />
                    <span style={styles.logoFallback} aria-hidden="true">
                      {partner.name.charAt(0).toUpperCase()}
                    </span>
                  </span>
                </a>
                <div>
                  <h2 style={styles.name}>
                    <a href={partnerDetailHref(partner)} style={styles.nameLink}>
                      {partner.name}
                    </a>
                  </h2>
                  <p style={styles.category}>
                    {categoryLabel}: {partner.category_label || partner.category}
                  </p>
                  <p style={styles.platform}>
                    {platformLabel}: {partner.network || partner.category_label || partner.category}
                  </p>
                </div>
              </div>

              <p style={styles.descText}>{localizedDescription(partner, lang as keyof I18n)}</p>

              <dl style={styles.metaList}>
                {partner.network && (
                  <div style={styles.metaItem}>
                    <dt style={styles.metaLabel}>{networkLabel}</dt>
                    <dd style={styles.metaValue}>{partner.network}</dd>
                  </div>
                )}
                {typeof partner.tier === "number" && (
                  <div style={styles.metaItem}>
                    <dt style={styles.metaLabel}>{fallbackText(t("partner.tier"), "Tier")}</dt>
                    <dd style={styles.metaValue}>{partner.tier}</dd>
                  </div>
                )}
              </dl>

              {partner.url && (
                <a href={partner.url} target="_blank" rel="noopener noreferrer sponsored" style={styles.cta}>
                  {visitLabel} {partner.name}
                </a>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  section: {
    maxWidth: "1180px",
    margin: "0 auto",
    padding: "72px 24px 96px",
  },
  header: {
    textAlign: "center",
    marginBottom: "40px",
  },
  eyebrow: {
    color: "#dfa837",
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
  },
  title: {
    color: "#f8fafc",
    fontSize: "clamp(32px, 5vw, 56px)",
    lineHeight: 1.05,
    margin: "10px 0 0",
  },
  empty: {
    color: "#94a3b8",
    textAlign: "center",
    fontSize: "16px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "20px",
  },
  card: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
    minHeight: "100%",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "22px",
    padding: "22px",
    background: "linear-gradient(180deg, rgba(15, 23, 42, 0.88), rgba(3, 7, 18, 0.92))",
    boxShadow: "0 24px 70px rgba(0, 0, 0, 0.24)",
  },
  cardTop: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  logoLink: {
    display: "inline-flex",
    textDecoration: "none",
    flexShrink: 0,
  },
  logoWrap: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "54px",
    height: "54px",
    borderRadius: "16px",
    background: "#ffffff",
    color: "#111827",
    flexShrink: 0,
    fontWeight: 800,
    fontSize: "20px",
  },
  logo: {
    width: "38px",
    height: "38px",
    objectFit: "contain",
  },
  logoFallback: {
    display: "none",
  },
  name: {
    color: "#f8fafc",
    fontSize: "19px",
    lineHeight: 1.2,
    margin: 0,
  },
  nameLink: {
    color: "inherit",
    textDecoration: "none",
  },
  category: {
    color: "#cbd5e1",
    fontSize: "13px",
    margin: "5px 0 0",
  },
  platform: {
    color: "#94a3b8",
    fontSize: "12px",
    margin: "4px 0 0",
  },
  descText: {
    fontSize: "14px",
    lineHeight: "1.6",
    color: "#94a3b8",
    margin: 0,
  },
  metaList: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    margin: 0,
  },
  metaItem: {
    border: "1px solid rgba(148, 163, 184, 0.18)",
    borderRadius: "12px",
    padding: "9px 11px",
    background: "rgba(15, 23, 42, 0.66)",
  },
  metaLabel: {
    color: "#64748b",
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  metaValue: {
    color: "#e2e8f0",
    fontSize: "13px",
    margin: "3px 0 0",
  },
  cta: {
    marginTop: "auto",
    alignSelf: "flex-start",
    color: "#111827",
    background: "#dfa837",
    borderRadius: "999px",
    padding: "10px 14px",
    fontSize: "13px",
    fontWeight: 800,
    textDecoration: "none",
  },
};
