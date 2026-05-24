"use client";

// File: components/home/BrandMark.tsx
// Top-left brand logo: the "signalboost" wordmark plus an animated
// signal-emission mark — a gold dot with concentric arcs that pulse outward,
// echoing the SaaS site's logo. Self-contained (inline styles + a tiny scoped
// keyframes block), so it doesn't depend on home.css.
//
// Fixed to the top-left, above the hero, low z-index so it never blocks taps.

export default function BrandMark() {
  return (
    <a
      href="/"
      aria-label="SignalBoost home"
      style={{
        position: "fixed",
        top: 16,
        left: 18,
        zIndex: 3000,
        display: "flex",
        alignItems: "center",
        gap: 9,
        textDecoration: "none",
        userSelect: "none",
      }}
    >
      <style>{`
        @keyframes sbPulse {
          0%   { transform: scale(.4); opacity: .95; }
          60%  { opacity: .3; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        .sb-wave { transform-origin: 8px 18px; animation: sbPulse 2.8s ease-out infinite; }
        .sb-wave.w2 { animation-delay: .8s; }
        .sb-wave.w3 { animation-delay: 1.6s; }
      `}</style>

      <svg width="32" height="30" viewBox="0 0 40 36" fill="none" aria-hidden="true">
        {/* pulsing signal arcs radiating rightward from the dot */}
        <g stroke="#e0a425" strokeWidth="2.2" fill="none" strokeLinecap="round">
          <path className="sb-wave" d="M8 11 A10 10 0 0 1 8 25" />
          <path className="sb-wave w2" d="M8 7 A15 15 0 0 1 8 29" />
          <path className="sb-wave w3" d="M8 3 A20 20 0 0 1 8 33" />
        </g>
        {/* the emitting dot */}
        <circle cx="8" cy="18" r="4.4" fill="#e0a425" />
        <circle cx="8" cy="18" r="1.7" fill="#1d2733" />
      </svg>

      <span
        style={{
          fontFamily: "'Fraunces', Georgia, serif",
          fontWeight: 900,
          fontSize: 19,
          letterSpacing: "-0.01em",
          lineHeight: 1,
        }}
      >
        <span style={{ color: "#1d2733" }}>signal</span>
        <span style={{ color: "#e0a425" }}>boost</span>
      </span>
    </a>
  );
}
