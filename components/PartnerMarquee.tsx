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
  const { row1, row2 } = useMemo(() => {
    if (!partnersData || partnersData.length === 0) return { row1: [], row2: [] };
    const half = Math.ceil(partnersData.length / 2);
    return { row1: partnersData.slice(0, half), row2: partnersData.slice(half) };
  }, [partnersData]);

  const renderRow = (items: Partner[], isReverse: boolean) => {
    if (items.length === 0) return null;
    const animName = isReverse ? "animate-marquee-rev" : "animate-marquee-fwd";

    return (
      <div className="marquee-wrapper" style={{ position: "relative", display: "flex", width: "100%", overflow: "hidden" }}>
        <div className={animName} style={{ display: "flex", gap: "1rem", whiteSpace: "nowrap", padding: "0.75rem 0" }}>
          {[...items, ...items].map((partner, index) => (
            <a
              key={`${partner.id}-${isReverse ? "b" : "a"}-${index}`}
              href={partner.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: "160px",
                height: "3.5rem",
                padding: "0 1.5rem",
                borderRadius: "0.75rem",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                backgroundColor: "rgba(255, 255, 255, 0.02)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                textDecoration: "none"
              }}
            >
              <span style={{ color: "#e5e7eb", fontSize: "0.875rem", fontWeight: 500 }}>
                {partner.name}
              </span>
            </a>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={{ width: "100%", padding: "1rem 0", display: "flex", flexDirection: "column", gap: "0.25rem", overflow: "hidden" }}>
      <div style={{ textAlign: "center", marginBottom: "0.5rem" }}>
        <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "rgba(245, 158, 11, 0.8)", letterSpacing: "0.1em" }}>
          WINDOW SHOPPING
        </span>
        <h3 style={{ fontSize: "1.125rem", fontWeight: 500, color: "#9ca3af", marginTop: "0.25rem" }}>
          Explore {partnersData.length}+ Integrated Regional Stores
        </h3>
      </div>

      {renderRow(row1, false)}
      {renderRow(row2, true)}
    </div>
  );
}
