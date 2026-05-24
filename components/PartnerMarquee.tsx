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
  // Balanced database split
  const { row1, row2 } = useMemo(() => {
    if (!partnersData || partnersData.length === 0) return { row1: [], row2: [] };
    const half = Math.ceil(partnersData.length / 2);
    return { row1: partnersData.slice(0, half), row2: partnersData.slice(half) };
  }, [partnersData]);

  const renderRow = (items: Partner[], isReverse: boolean) => {
    if (items.length === 0) return null;
    const animName = isReverse ? "animate-marquee-rev" : "animate-marquee-fwd";

    return (
      <div style={{ position: "relative", display: "flex", width: "100%", overflow: "hidden" }}>
        <div className={animName} style={{ display: "flex", gap: "1rem", whiteSpace: "nowrap", padding: "0.5rem 0" }}>
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
                minWidth: "180px",
                height: "4.5rem",
                padding: "0 1.5rem",
                borderRadius: "1rem",
                border: "1px solid rgba(255, 255, 255, 0.06)",
                backgroundColor: "rgba(255, 255, 255, 0.02)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                textDecoration: "none",
                boxShadow: "0 4px 30px rgba(0, 0, 0, 0.2)",
                transition: "all 0.3s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(245, 158, 11, 0.3)";
                e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.06)";
                e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.02)";
              }}
            >
              <span style={{ color: "#e5e7eb", fontSize: "0.9rem", fontWeight: 500, letterSpacing: "0.01em" }}>
                {partner.name}
              </span>
            </a>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={{ width: "100%", padding: "1.5rem 0", display: "flex", flexDirection: "column", gap: "0.5rem", overflow: "hidden" }}>
      <div style={{ textAlign: "center", marginBottom: "0.75rem" }}>
        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "rgba(245, 158, 11, 0.8)", letterSpacing: "0.15em" }}>
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
