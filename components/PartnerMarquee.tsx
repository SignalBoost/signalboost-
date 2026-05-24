"use client";
// File: components/PartnerMarquee.tsx
// "Window Shopping" — scrolling rows of YOUR real FEATURED partners, pulled from
// Supabase (passed in as partnersData from HomeApp). Only partners with
// featured === true are shown — the recognizable brands. Every other partner is
// still fully available to users through the concierge search / prompt.
//
// Logos: the partner `url` is an AFFILIATE REDIRECT (awin1.com, tpo.lv, admitad
// domains), so we can't derive a real brand domain from it. Instead we map each
// partner id -> its real brand domain below (BRAND_DOMAINS) and feed THAT to
// logo.dev. Links still use the affiliate `url` (revenue-safe). Any brand whose
// logo doesn't resolve falls back to a clean name-only card.
//
// To fix a wrong logo: correct that brand's domain in BRAND_DOMAINS below.
// To add a newly-featured brand: add an id -> domain line.
//
// logo.dev publishable token lives in NEXT_PUBLIC_LOGO_DEV_TOKEN (set in Vercel).
import React from "react";
import "./marquee.css";

interface Partner {
  id: string;
  name: string;
  url: string;
  featured?: boolean;
  tier?: number;
}
interface MarqueeProps {
  partnersData: Partner[];
}

// --- Real brand domains for FEATURED partners (keyed by partner id) ----------
// Maps your affiliate partners to their actual websites so logo.dev returns the
// real brand logo instead of the affiliate network's icon.
const BRAND_DOMAINS: Record<string, string> = {
  aviasales: "aviasales.com",
  cvc: "cvc.com.br",
  "oman-airlines": "omanair.com",
  "booking-com-brazil": "booking.com",
  travelking: "travelking.pl",
  trivago: "trivago.com",
  airalo: "airalo.com",
  drimsim: "drimsim.com",
  saily: "saily.com",
  "the-bitjoy-esim": "bitjoy.io",
  yesim: "yesim.app",
  klook: "klook.com",
  tiqets: "tiqets.com",
  wegotrip: "wegotrip.com",
  kiwitaxi: "kiwitaxi.com",
  "welcome-pickups": "welcomepickups.com",
  alamo: "alamo.com",
  economybookings: "economybookings.com",
  europcar: "europcar.com",
  getrentacar: "getrentacar.com",
  "jumbo-car-costa-rica": "jumbocar.com",
  localrent: "localrent.com",
  qeeq: "qeeq.com",
  "vip-cars": "vipcars.com",
  airhelp: "airhelp.com",
  "auras-travel-insurance": "aura.travel",
  ekta: "ektatraveling.com",
  "melhor-seguro": "melhorseguro.com",
  "go-go-espana": "gogohispania.com",
  "proton-vpn": "protonvpn.com",
  supersim: "supersim.com.br",
  "discover-cars": "discovercars.com",
  "champions-travel": "championstravel.co.uk",
  "vi-travel": "vitravel.com",
  "skylark-travel-group": "skylark.com",
};

// logo.dev publishable token (set in Vercel as NEXT_PUBLIC_LOGO_DEV_TOKEN).
const LOGO_DEV_TOKEN = process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN || "";

// Build a logo.dev image URL for a domain. "" if no token or no mapped domain
// (so the card renders name-only instead of a wrong/generic logo).
function logoUrl(domain: string): string {
  if (!LOGO_DEV_TOKEN || !domain) return "";
  return `https://img.logo.dev/${encodeURIComponent(domain)}?token=${LOGO_DEV_TOKEN}&size=128&format=png&retina=true`;
}

export default function PartnerMarquee({ partnersData }: MarqueeProps) {
  // Show only featured partners that we have a real brand domain for. This keeps
  // the marquee to recognizable brands with correct logos.
  const list = (partnersData || []).filter((p) => p.featured && BRAND_DOMAINS[p.id]);
  if (list.length === 0) return null;

  const halfLength = Math.ceil(list.length / 2);
  const topRow = list.slice(0, halfLength);
  const bottomRow = list.slice(halfLength);

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
            const logo = logoUrl(BRAND_DOMAINS[partner.id]);
            return (
              <a
                key={`${partner.id}-${rowKeyIdentifier}-${index}`}
                href={partner.url}
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
          Featuring brands you already trust
        </h3>
      </div>
      {renderRow(topRow, false, "top-track")}
      {renderRow(bottomRow, true, "bottom-track")}
    </div>
  );
}
