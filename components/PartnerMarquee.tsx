"use client";
// File: components/PartnerMarquee.tsx
// "Window Shopping" — two rows of partner store names scrolling in opposite
// directions. Styles live in ./marquee.css (imported below) so they travel
// with the component and never disturb the rest of the site.
//
// Logos: auto-fetched per partner from Google's favicon service, using the
// domain parsed out of each partner's affiliate `url`. If a link is a tracking
// redirect (e.g. go.somenetwork.com) the favicon will reflect that domain, not
// the partner — add a real `domain` field per partner later for a perfect match.
// Any logo that can't load (bad/blocked/unparseable) hides itself via onError,
// leaving a clean name-only card.
import React from "react";
import "./marquee.css";
interface Partner {
  id: string;
  name: string;
  url: string;
  tier: number;
  featured: boolean;
}
interface MarqueeProps {
  partnersData: Partner[];
}

// Pull a bare hostname (no www.) out of a URL string. Returns "" if it can't
// be parsed, in which case we render no logo for that card.
function domainFromUrl(url: string): string {
  if (!url) return "";
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

// Google's favicon service — reliable, CORS-friendly, rarely blocks hotlinking.
function faviconUrl(domain: string): string {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;
}

export default function PartnerMarquee({ partnersData }: MarqueeProps) {
  const list = partnersData || [];
  const halfLength = Math.ceil(list.length / 2);
  const topRowPartners = list.slice(0, halfLength);
  const bottomRowPartners = list.slice(halfLength);
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
            const domain = domainFromUrl(partner.url);
            return (
              <a
                key={`${partner.id}-${rowKeyIdentifier}-${index}`}
                href={partner.url}
                target="_blank"
                rel="noopener sponsored"
                className="fathom-glass-card-upgrade"
              >
                {domain && (
                  <img
                    className="partner-logo"
                    src={faviconUrl(domain)}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    onError={(e) => {
                      // Hide any logo that fails to load -> clean name-only card.
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                  />
                )}
                <span style={{ color: "#1d2733", fontSize: "0.9rem", fontWeight: 500, letterSpacing: "0.02em" }}>
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
          Explore {list.length}+ Integrated Regional Stores
        </h3>
      </div>
      {renderRow(topRowPartners, false, "top-track")}
      {renderRow(bottomRowPartners, true, "bottom-track")}
    </div>
  );
}
