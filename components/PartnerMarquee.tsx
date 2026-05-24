"use client";
// File: components/PartnerMarquee.tsx
// "Window Shopping" — a curated marquee of well-known brands only. This does
// NOT show all partners; it shows a hand-picked list of recognizable names so
// the hero looks premium. Every other partner is still fully available to users
// through the concierge search / prompt — the marquee is just a showcase.
//
// To add or remove a brand: edit the FEATURED_BRANDS array below. Each entry is
// { name, domain, url }:
//   - name   = text shown on the card
//   - domain = used to fetch the real brand logo (logo.clearbit.com/<domain>)
//   - url    = where the card links to (use your affiliate link if you have one)
// If a logo ever fails to load, that card falls back to showing the name only.
import React from "react";
import "./marquee.css";

interface Brand {
  name: string;
  domain: string;
  url: string;
}

// --- Curated big-name brands shown in the marquee --------------------------
// Edit this list freely. Keep it to the recognizable names you're proud of.
const FEATURED_BRANDS: Brand[] = [
  { name: "Booking.com", domain: "booking.com", url: "https://www.booking.com" },
  { name: "Trivago", domain: "trivago.com", url: "https://www.trivago.com" },
  { name: "Amazon", domain: "amazon.com", url: "https://www.amazon.com" },
  { name: "Kiwi.com", domain: "kiwi.com", url: "https://www.kiwi.com" },
  { name: "Tiqets", domain: "tiqets.com", url: "https://www.tiqets.com" },
  { name: "Airalo", domain: "airalo.com", url: "https://www.airalo.com" },
  { name: "Expedia", domain: "expedia.com", url: "https://www.expedia.com" },
  { name: "Agoda", domain: "agoda.com", url: "https://www.agoda.com" },
  { name: "GetYourGuide", domain: "getyourguide.com", url: "https://www.getyourguide.com" },
  { name: "Hostelworld", domain: "hostelworld.com", url: "https://www.hostelworld.com" },
  { name: "Discover Cars", domain: "discovercars.com", url: "https://www.discovercars.com" },
  { name: "Saily", domain: "saily.com", url: "https://saily.com" },
];

// Clearbit returns a real brand logo PNG by domain.
function logoUrl(domain: string): string {
  return `https://logo.clearbit.com/${encodeURIComponent(domain)}`;
}

export default function PartnerMarquee() {
  const list = FEATURED_BRANDS;
  if (list.length === 0) return null;

  const halfLength = Math.ceil(list.length / 2);
  const topRow = list.slice(0, halfLength);
  const bottomRow = list.slice(halfLength);

  const renderRow = (items: Brand[], isReverse: boolean, rowKeyIdentifier: string) => {
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
          {[...items, ...items].map((brand, index) => (
            <a
              key={`${brand.domain}-${rowKeyIdentifier}-${index}`}
              href={brand.url}
              target="_blank"
              rel="noopener sponsored"
              className="fathom-glass-card-upgrade"
            >
              <img
                className="partner-logo"
                src={logoUrl(brand.domain)}
                alt=""
                aria-hidden="true"
                loading="lazy"
                onError={(e) => {
                  // Logo failed -> hide it, leaving a clean name-only card.
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
              <span style={{ color: "#1d2733", fontSize: "0.9rem", fontWeight: 500, letterSpacing: "0.02em" }}>
                {brand.name}
              </span>
            </a>
          ))}
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
