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
  // Evenly split your 132+ dataset to populate two separate rows cleanly
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
        margin: "0.5rem 0",
        WebkitMaskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
        maskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)"
      }}>
        <div className={scrollClassName}>
          {[...items, ...items].map((partner, index) => (
            <a
              key={`${partner.id}-${isReverse ? "row-b" : "row-a"}-${index}`}
              href={partner.url}
              target="_blank"
              rel="noopener noreferrer"
              className="fathom-glass-card-upgrade"
            >
              <span style={{ 
                color: "#e5e7eb", 
                fontSize: "0.9rem", 
                fontWeight: 500, 
                letterSpacing: "0.02em"
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
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "0.5rem", overflow: "hidden" }}>
      <div style={{ textAlign: "center", marginBottom: "0.25rem" }}>
        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#f59e0b", letterSpacing: "0.15em" }}>
          WINDOW SHOPPING
        </span>
        <h3 style={{ fontSize: "1.25rem", fontWeight: 500, color: "#9ca3af", marginTop: "0.25rem" }}>
          Explore {partnersData.length}+ Integrated Regional Stores
        </h3>
      </div>

      {renderRow(row1, false)}
      {renderRow(row2, true)}
    </div>
  );
}
