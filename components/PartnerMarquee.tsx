// components/PartnerMarquee.tsx
"use client";

import React, { useMemo } from "react";

interface Partner {
  id: string;
  name: string;
  url: string;
  logo_url?: string; // Stored securely inside your Supabase table rows
  tier: number;
  featured: boolean;
}

interface MarqueeProps {
  partnersData: Partner[];
}

export default function PartnerMarquee({ partnersData }: MarqueeProps) {
  // Split data logically into two moving rows
  const { row1, row2 } = useMemo(() => {
    if (!partnersData || partnersData.length === 0) return { row1: [], row2: [] };
    const half = Math.ceil(partnersData.length / 2);
    return { row1: partnersData.slice(0, half), row2: partnersData.slice(half) };
  }, [partnersData]);

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
          {[...items, ...items].map((partner, index) => (
            <a
              key={`${partner.id}-${isReverse ? "b" : "a"}-${index}`}
              href={partner.url}
              target="_blank"
              rel="noopener noreferrer"
              className="fathom-glass-card-upgrade"
            >
              {partner.logo_url ? (
                <img
                  src={partner.logo_url}
                  alt={`${partner.name} logo`}
                  style={{
                    maxHeight: "2rem",
                    maxWidth: "130px",
                    objectFit: "contain",
                    opacity: 0.4,
                    filter: "brightness(0) invert(1)", // Forces logos to match your white text theme perfectly
                    transition: "all 0.3s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = "1";
                    e.currentTarget.style.filter = "none"; // Reveals full brand colors on hover
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = "0.4";
                    e.currentTarget.style.filter = "brightness(0) invert(1)";
                  }}
                  onError={(e) => {
                    // Safety valve: if the database link breaks, fallback gracefully to text
                    e.currentTarget.style.display = "none";
                    const fallbackText = e.currentTarget.nextSibling as HTMLElement;
                    if (fallbackText) fallbackText.style.display = "inline";
                  }}
                />
              ) : null}
              
              <span style={{ 
                display: partner.logo_url ? "none" : "inline", 
                color: "#e5e7eb", 
                fontSize: "0.9rem", 
                fontWeight: 500 
              }}>
                {partner.name}
              </span>
            </a>
          ))}
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
