"use client";
// File: components/PartnerMarquee.tsx

import React from "react";
import partnersJson from "@/public/partners.json";
import useTranslation from "./i18n/useTranslation";
import "./marquee.css";

interface Partner {
  id: string;
  name: string;
  url: string;
  category: string;
  category_label?: string;
  logo: string;
  network?: string;
  description: string;
  featured?: boolean;
  tier?: number;
}

interface MarqueeProps {
  partnersData?: Partner[];
  lang?: string;
}

const partners = partnersJson as Partner[];

function partnerLogoSrc(logo: string) {
  return `/logos/${logo}`;
}

function partnerDetailHref(partner: Partner) {
  return `/partners/${partner.id}`;
}

function fallbackText(value: string, fallback: string) {
  return value.includes(".") ? fallback : value;
}

export default function PartnerMarquee({ partnersData }: MarqueeProps) {
  const { t } = useTranslation();
  const sourcePartners = partnersData?.length ? partnersData : partners;
  const list = sourcePartners
    .filter((partner) => partner.featured)
    .sort((a, b) => (a.tier ?? 99) - (b.tier ?? 99));

  const title = fallbackText(t("partner.title"), "Our Partners");
  const empty = fallbackText(t("partner.empty"), "No partners available");

  if (list.length === 0) {
    return (
      <section style={styles.wrapper} aria-labelledby="partner-marquee-title">
        <div style={styles.header}>
          <span style={styles.badge}>{title}</span>
          <h3 id="partner-marquee-title" style={styles.heading}>{empty}</h3>
        </div>
      </section>
    );
  }

  const halfLength = Math.ceil(list.length / 2);
  const topRow = list.slice(0, halfLength);
  const bottomRow = list.slice(halfLength);

  const renderRow = (items: Partner[], isReverse: boolean, rowKeyIdentifier: string) => {
    if (items.length === 0) return null;
    const animationClass = isReverse ? "force-marquee-right" : "force-marquee-left";

    return (
      <div style={styles.rowMask}>
        <div className={animationClass}>
          {[...items, ...items].map((partner, index) => (
            <a
              key={`${partner.id}-${rowKeyIdentifier}-${index}`}
              href={partnerDetailHref(partner)}
              className="fathom-glass-card-upgrade"
              aria-label={`${partner.name} — ${partner.network || partner.category_label || partner.category}`}
              title={partner.description}
            >
              <span style={styles.logoChip}>
                <img
                  className="partner-logo"
                  src={partnerLogoSrc(partner.logo)}
                  alt={`${partner.name} logo`}
                  loading="lazy"
                  style={styles.logoImage}
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
              <span style={styles.partnerCopy}>
                <span style={styles.partnerName}>{partner.name}</span>
                <span style={styles.partnerPlatform}>{partner.network || partner.category_label || partner.category}</span>
              </span>
            </a>
          ))}
        </div>
      </div>
    );
  };

  return (
    <section style={styles.wrapper} aria-labelledby="partner-marquee-title">
      <div style={styles.header}>
        <span style={styles.badge}>{title}</span>
        <h3 id="partner-marquee-title" style={styles.heading}>
          {fallbackText(t("partner.marqueeSubtitle"), "Featured brands you can browse on SignalBoost")}
        </h3>
      </div>
      {renderRow(topRow, false, "top-track")}
      {renderRow(bottomRow, true, "bottom-track")}
    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    margin: "0 auto",
    padding: "72px 0 24px",
  },
  header: {
    textAlign: "center",
    marginBottom: "1rem",
    padding: "0 24px",
  },
  badge: {
    fontSize: "0.75rem",
    fontWeight: 700,
    color: "#f59e0b",
    letterSpacing: "0.15em",
    textTransform: "uppercase",
  },
  heading: {
    fontSize: "1.25rem",
    fontWeight: 500,
    color: "#9ca3af",
    marginTop: "0.25rem",
  },
  rowMask: {
    position: "relative",
    display: "flex",
    width: "100%",
    overflow: "hidden",
    padding: "0.5rem 0",
    WebkitMaskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
    maskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
  },
  logoChip: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "30px",
    height: "30px",
    flexShrink: 0,
    borderRadius: "7px",
    background: "#fff",
    padding: "4px",
    color: "#111827",
    fontSize: "0.75rem",
    fontWeight: 800,
  },
  logoImage: {
    width: "22px",
    height: "22px",
    objectFit: "contain",
    borderRadius: 0,
  },
  logoFallback: {
    display: "none",
    lineHeight: 1,
  },
  partnerCopy: {
    display: "inline-flex",
    flexDirection: "column",
    gap: "2px",
    minWidth: 0,
  },
  partnerName: {
    color: "#f5f6f8",
    fontSize: "0.9rem",
    fontWeight: 600,
    letterSpacing: "0.02em",
    lineHeight: 1.1,
  },
  partnerPlatform: {
    color: "#94a3b8",
    fontSize: "0.68rem",
    fontWeight: 500,
    lineHeight: 1.1,
  },
};
