// components/PartnerMarquee.tsx
"use client";

import React, { useMemo } from "react";

interface Partner {
  id: string;
  name: string;
  url: string;
  category_key: string;
  tier: number;
  featured: boolean;
  regions: string[];
}

interface MarqueeProps {
  partnersData: Partner[];
}

export default function PartnerMarquee({ partnersData }: MarqueeProps) {
  // Separate top tier anchors from longer tail operations cleanly
  const { row1, row2 } = useMemo(() => {
    if (!partnersData || partnersData.length === 0) {
      return { row1: [], row2: [] };
    }
    const anchors = partnersData.filter((p) => p.tier === 1 || p.featured === true);
    const specialties = partnersData.filter((p) => p.tier > 1 && !p.featured);
    
    if (anchors.length === 0) {
      const half = Math.ceil(partnersData.length / 2);
      return { row1: partnersData.slice(0, half), row2: partnersData.slice(half) };
    }
    return { row1: anchors, row2: specialties };
  }, [partnersData]);

  // Clean strings to request clear vectors from Brandfetch CDN engine safely
  const getCleanDomain = (name: string) => {
    let clean = name.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (clean.includes("brazil")) clean = "booking.com"; 
    return `${clean}.com`;
  };

  const createMarqueeRow = (items: Partner[], isReverse: boolean) => {
    if (items.length === 0) return null;
    const tickerClass = isReverse ? "animate-marquee-rev" : "animate-marquee-fwd";

    return (
      <div 
        className="relative flex w-full overflow-hidden my-1"
        style={{
          WebkitMaskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
          maskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)"
        }}
      >
        <div className={`flex gap-4 whitespace-nowrap py-3 ${tickerClass} hover:[animation-play-state:paused] transition-all`}>
          {[...items, ...items].map((partner, index) => {
            const domainString = getCleanDomain(partner.name);
            return (
              <a
                key={`${partner.id}-loop-${isReverse ? "b" : "a"}-${index}`}
                href={partner.url}
                target="_blank"
                rel="noopener noreferrer"
                className="fathom-glass-card flex items-center justify-center min-w-[160px] h-20 px-6 rounded-xl transition-all duration-300 hover:bg-white/[0.05] hover:border-amber-500/20 group"
              >
                <img
                  src={`https://cdn.brandfetch.io/${domainString}`}
                  alt={`${partner.name} logo`}
                  className="max-h-7 max-w-[110px] object-contain opacity-40 grayscale group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-300"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    const fallbackEl = e.currentTarget.nextSibling as HTMLElement;
                    if (fallbackEl) fallbackEl.style.display = "block";
                  }}
                />
                <span className="hidden text-gray-400 font-medium text-sm tracking-wide transition-colors group-hover:text-amber-400">
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
    <div className="w-full py-6 flex flex-col gap-1 overflow-hidden mt-10 z-10 relative">
      <div className="text-center mb-1">
        <span className="text-xs font-semibold tracking-widest text-amber-500/80 uppercase">
          WINDOW SHOPPING
        </span>
        <h3 className="text-xl font-medium text-gray-300 mt-1 tracking-tight">
          Explore {partnersData.length}+ Integrated Regional Stores
        </h3>
      </div>

      {createMarqueeRow(row1, false)}
      {createMarqueeRow(row2, true)}
    </div>
  );
}
