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
          0%   { transform: scale(.55); opacity: .9; }
          70%  { opacity: .15; }
          100% { transform: scale(1.25); opacity: 0; }
        }
        .sb-wave { transform-origin: 9px 18px; animation: sbPulse 2.4s ease-out infinite; }
        .sb-wave.w2 { animation-delay: .8s; }
        .sb-wave.w3 { animation-delay: 1.6s; }
      `}</style>

      <svg width="30" height="30" viewBox="0 0 36 36" fill="none" aria-hidden="true">
        {/* pulsing signal arcs emitting from the dot */}
        <g stroke="#e0a425" strokeWidth="2.2" fill="none" strokeLinecap="round">
          <path className="sb-wave" d="M9 9 A12 12 0 0 1 9 27" />
          <path className="sb-wave w2" d="M9 5 A16 16 0 0 1 9 31" />
          <path className="sb-wave w3" d="M9 2 A20 20 0 0 1 9 34" />
        </g>
        {/* the emitting dot */}
        <circle cx="9" cy="18" r="4.6" fill="#e0a425" />
        <circle cx="9" cy="18" r="1.8" fill="#1d2733" />
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
