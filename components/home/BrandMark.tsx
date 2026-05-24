"use client";
// File: components/home/BrandMark.tsx
// Top-left brand logo: the "signalboost" wordmark plus an animated
// signal-emission mark — a gold dot with concentric arcs that pulse outward,
// echoing the SaaS site's logo. Self-contained (inline styles + a tiny scoped
// keyframes block), so it doesn't depend on home.css.
//
// Fixed to the top-left, above the hero, low z-index so it never blocks taps.
// DARK THEME: "signal" is light (#f5f6f8) so it's visible on the dark
// background, matching the SaaS platform. "boost" stays gold.
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
        .sb-wave { transform-origin: 18px 30px; animation: sbPulse 2.8s ease-out infinite; }
        .sb-wave.w2 { animation-delay: .8s; }
        .sb-wave.w3 { animation-delay: 1.6s; }
      `}</style>
      <svg width="30" height="32" viewBox="0 0 36 38" fill="none" aria-hidden="true">
        {/* signal waves rising upward from the dot */}
        <g stroke="#e0a425" strokeWidth="2.2" fill="none" strokeLinecap="round">
          <path className="sb-wave" d="M10 28 A8 8 0 0 1 26 28" />
          <path className="sb-wave w2" d="M6 28 A12 12 0 0 1 30 28" />
          <path className="sb-wave w3" d="M2 28 A16 16 0 0 1 34 28" />
        </g>
        {/* the emitting dot at the base */}
        <circle cx="18" cy="30" r="4.4" fill="#e0a425" />
        <circle cx="18" cy="30" r="1.7" fill="#0a0a0c" />
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
        <span style={{ color: "#f5f6f8" }}>signal</span>
        <span style={{ color: "#e0a425" }}>boost</span>
      </span>
    </a>
  );
}
