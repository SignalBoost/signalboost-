"use client";
// File: components/PartnerMarquee.tsx
// "Window Shopping" — scrolling rows of YOUR real partners, pulled from
// Supabase (passed in as partnersData from HomeApp, which loads /api/partners).
// No hardcoded brands. Names come straight from your data; links use each
// partner's affiliate `url` (revenue-safe).
//
// Logos come from logo.dev. logo.dev needs a clean brand domain (e.g.
// "booking.com"). We use the partner's `domain` field if present, otherwise we
// extract the domain from the partner's `url`. If logo.dev has no logo, the
// card simply shows the name — nothing breaks.
//
// The publishable token lives in NEXT_PUBLIC_LOGO_DEV_TOKEN (set in Vercel).
import React from "react";
import "./marquee.css";

interface Partner {
  id: string;
  name: string;
  url: string;
  domain?: string; // optional clean domain for the logo, if your data has it
  tier?: number;
  featured?: boolean;
}
interface MarqueeProps {
  partnersData: Partner[];
}

// logo.dev publishable token (set in Vercel as NEXT_PUBLIC_LOGO_DEV_TOKEN).
const LOGO_DEV_TOKEN = process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN || "";

// Get a clean hostname (no www.) from a URL string. "" if unparseable.
function domainFromUrl(url: string): string {
  if (!url) return "";
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

// Prefer an explicit domain field; otherwise derive it from the affiliate url.
function partnerDomain(p: Partner): string {
  if (p.domain && p.domain.trim()) return p.domain.trim().replace(/^www\./, "");
  return domainFromUrl(p.url);
}

// Build a logo.dev image URL for a domain. "" if no token or no domain.
function logoUrl(domain: string): string {
  if (!LOGO_DEV_TOKEN || !domain) return "";
  return `https://img.logo.dev/${encodeURIComponent(domain)}?token=${LOGO_DEV_TOKEN}&size=128&format=png&retina=true`;
}

export default function PartnerMarquee({ partnersData }: MarqueeProps) {
  const list = partnersData || [];
  if (list.length === 0) return null;

  const halfLength = Math.ceil(list.length / 2);
  const topRow = list.slice(0, halfLength);
  const bottomRow = list.slice(halfLength);

  const renderRow = (items: Partner[], isReverse: boolean, rowKeyIdentifier: string) => {
    if (items.length === 0) return null;
    const animationClass = isReverse ? "force-marquee-right" : "force-marquee-left";
    return (
      <div
        style={{
          position: "relative",
          display: "flex",
          width: "100%",
          overflow: "hidden",
          padding: "0.5rem 0",
          WebkitMaskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
          maskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
        }}
      >
        <div className={animationClass}>
          {[...items, ...items].map((partner, index) => {
            const logo = logoUrl(partnerDomain(partner));
            return (
              <a
                key={`${partner.id}-${rowKeyIdentifier}-${index}`}
                href={partner.url}
                target="_blank"
                rel="noopener sponsored"
                className="fathom-glass-card-upgrade"
              >
                {logo && (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "30px",
                      height: "30px",
                      flexShrink: 0,
                      borderRadius: "7px",
                      background: "#fff", // white chip keeps dark logos visible on dark cards
                      padding: "4px",
                    }}
                  >
                    <img
                      className="partner-logo"
                      src={logo}
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                      style={{ width: "22px", height: "22px", objectFit: "contain", borderRadius: 0 }}
                      onError={(e) => {
                        // Logo failed -> hide the whole chip, leaving a name-only card.
                        const chip = (e.currentTarget as HTMLImageElement).parentElement;
                        if (chip) (chip as HTMLElement).style.display = "none";
                      }}
                    />
                  </span>
                )}
                <span style={{ color: "#f5f6f8", fontSize: "0.9rem", fontWeight: 500, letterSpacing: "0.02em" }}>
                  {partner.name}
                </span>
              </a>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "1rem", marginTop: 0 }}>
      <div style={{ textAlign: "center", marginBottom: "1rem" }}>
        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#f59e0b", letterSpacing: "0.15em" }}>
          WINDOW SHOPPING
        </span>
        <h3 style={{ fontSize: "1.25rem", fontWeight: 500, color: "#9ca3af", marginTop: "0.25rem" }}>
          Featuring brands you already trust
        </h3>
      </div>
      {renderRow(topRow, false, "top-track")}
      {renderRow(bottomRow, true, "bottom-track")}
    </div>
  );
}
