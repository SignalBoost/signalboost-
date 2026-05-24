// components/PartnerMarquee.tsx
"use client";

import React, { useMemo } from "react";

interface Partner {
  id: string;
  name: string;
  url: string;
  category_label: string;
  tier: number;
  featured: boolean;
}

interface MarqueeProps {
  partnersData: Partner[];
}

export default function PartnerMarquee({ partnersData }: MarqueeProps) {
  // Balanced sorting logic split
  const { row1, row2 } = useMemo(() => {
    if (!partnersData || partnersData.length === 0) return { row1: [], row2: [] };
    const half = Math.ceil(partnersData.length / 2);
    return { row1: partnersData.slice(0, half), row2: partnersData.slice(half) };
  }, [partnersData]);

  const renderRow = (items: Partner[], isReverse: boolean) => {
    if (items.length === 0) return null;
    const scrollClass = isReverse ? "animate-marquee-rev" : "animate-marquee-fwd";

    return (
      <div className="relative flex w-full overflow-hidden my-2">
        <div className={`flex gap-4 whitespace-nowrap py-2 ${scrollClass} hover:[animation-play-state:paused]`}>
          {[...items, ...items].map((partner, index) => (
            <a
              key={`${partner.id}-${isReverse ? "rev" : "fwd"}-${index}`}
              href={partner.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center min-w-[160px] h-14 px-6 rounded-xl border border-white/10 bg-white/[0.02] backdrop-blur-md transition-all duration-300 hover:border-amber-500/30 hover:bg-white/[0.06]"
            >
              <span className="text-gray-300 font-medium text-sm tracking-wide">
                {partner.name}
              </span>
            </a>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full py-4 flex flex-col gap-1 overflow-hidden mt-6 z-10 relative">
      <div className="text-center mb-2">
        <span className="text-xs font-semibold tracking-widest text-amber-500/80 uppercase">
          WINDOW SHOPPING
        </span>
        <h3 className="text-lg font-medium text-gray-400 mt-1">
          Explore {partnersData.length}+ Integrated Regional Stores
        </h3>
      </div>

      {renderRow(row1, false)}
      {renderRow(row2, true)}
    </div>
  );
}
