// components/PartnerMarquee.tsx
"use client";

import React, { useMemo } from "react";

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

export default function PartnerMarquee({ partnersData }: MarqueeProps) {
  // Balanced database split for row coordination
  const { row1, row2 } = useMemo(() => {
    if (!partnersData || partnersData.length === 0) return { row1: [], row2: [] };
    const half = Math.ceil(partnersData.length / 2);
    return { row1: partnersData.slice(0, half), row2: partnersData.slice(half) };
  }, [partnersData]);

  // Clean strings to request clean brand image visuals from the CDN
  const getCleanDomain = (name: string) => {
    let clean = name.toLowerCase()
      .replace(" brazil", "")
      .replace(" limited", "")
      .replace(/[^a-z0-9]/g, "");
    
    if (clean === "bookingcom") return "booking.com";
    if (clean === "lastminute") return "lastminute.com";
    if (clean === "discovercars") return "discovercars.com";
    if (clean === "westernunion") return "westernunion.com";
    if (clean === "adguardvpn") return "adguard.com";
    if (clean === "protonvpn") return "protonvpn.com";
    if (clean === "turbovpn") return "turbovpn.com";
    
    return `${clean}.com`;
  };

  const renderRow = (items: Partner[], isReverse: boolean) => {
    if (items.length === 0) return null;
    const scrollClassName = isReverse ? "force-marquee-right" : "force-marquee-left";

    return (
      <div style={{ 
        position: "relative", 
        display: "flex", 
        width: "100%", 
        overflow: "hidden",
        WebkitMaskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
        maskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)"
      }}>
        <div className={scrollClassName}>
          {/* Loop twice to guarantee a smooth, seamless infinite visual scroll */}
          {[...items, ...items].map((partner, index) => {
            const domainString = getCleanDomain(partner.name);
            return (
              <a
                key={`${partner.id}-${isReverse ? "row-b" : "row-a"}-${index}`}
                href={partner.url}
                target="_blank"
                rel="noopener noreferrer"
                className="fathom-glass-card-upgrade"
              >
                <img
                  src={`https://cdn.brandfetch.io/${domainString}?c=1dfad273170b`}
                  alt={`${partner.name} storefront`}
                  style={{
                    maxHeight: "1.75rem",
                    maxWidth: "120px",
                    objectFit: "contain",
                    opacity: 0.35,
                    filter: "grayscale(100%) brightness(200%)",
                    transition: "all 0.3s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = "1";
                    e.currentTarget.style.filter = "grayscale(0%) brightness(100%)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = "0.35";
                    e.currentTarget.style.filter = "grayscale(100%) brightness(200%)";
                  }}
                  onError={(e) => {
                    // Graceful fallback to pure typography if a logo link fails
                    e.currentTarget.style.display = "none";
                    const fallbackLabel = e.currentTarget.nextSibling as HTMLElement;
                    if (fallbackLabel) fallbackLabel.style.display = "inline";
                  }}
                />
                <span style={{ 
                  display: "none", 
                  color: "#e5e7eb", 
                  fontSize: "0.9rem", 
                  fontWeight: 500, 
                  letterSpacing: "0.02em" 
                }}>
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
    <div style={{ width: "100%", padding: "1rem 0", display: "flex", flexDirection: "column", gap: "0.5rem", overflow: "hidden" }}>
      <div style={{ textAlign: "center", marginBottom: "0.5rem" }}>
        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#f59e0b", letterSpacing: "0.15em" }}>
          WINDOW SHOPPING
        </span>
        <h3 style={{ fontSize: "1.25rem", fontWeight: 500, color: "#9ca3af", marginTop: "0.25rem", letterSpacing: "-0.01em" }}>
          Explore {partnersData.length}+ Integrated Regional Stores
        </h3>
      </div>

      {renderRow(row1, false)}
      {renderRow(row2, true)}
    </div>
  );
}
