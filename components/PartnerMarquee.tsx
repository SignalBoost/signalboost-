"use client";
// File: components/PartnerMarquee.tsx
// "Window Shopping" — a curated marquee of well-known brands only. This does
// NOT show all partners; it shows a hand-picked list of recognizable names so
// the hero looks premium. Every other partner is still fully available to users
// through the concierge search / prompt — the marquee is just a showcase.
//
// Logos come from logo.dev (the post-Clearbit replacement). The publishable
// token lives in the env var NEXT_PUBLIC_LOGO_DEV_TOKEN (set in Vercel). It is
// a PUBLISHABLE key, so it is safe to expose in the browser. If the token is
// missing, or a logo fails to load, the card falls back to showing the name
// only — nothing breaks.
//
// DARK THEME: card text is light and each logo sits on a small white chip so
// dark brand marks stay visible against the dark glass cards.
//
// To add or remove a brand: edit the FEATURED_BRANDS array below. Each entry is
// { name, domain, url }:
//   - name   = text shown on the card
//   - domain = used to fetch the real brand logo from logo.dev
//   - url    = where the card links to (use your affiliate link if you have one)
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

// logo.dev publishable token (set in Vercel as NEXT_PUBLIC_LOGO_DEV_TOKEN).
const LOGO_DEV_TOKEN = process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN || "";

// Build a logo.dev image URL for a domain. If no token is configured we return
// "" so the component renders a name-only card instead of a broken request.
function logoUrl(domain: string): string {
  if (!LOGO_DEV_TOKEN) return "";
  return `https://img.logo.dev/${encodeURIComponent(domain)}?token=${LOGO_DEV_TOKEN}&size=128&format=png&retina=true`;
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
          {[...items, ...items].map((brand, index) => {
            const logo = logoUrl(brand.domain);
            return (
              <a
                key={`${brand.domain}-${rowKeyIdentifier}-${index}`}
                href={brand.url}
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
                  {brand.name}
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
