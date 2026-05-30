"use client";

import React from "react";

export default function ConciergeHero() {
  const handleScrollToPortal = () => {
    window.location.href = "/office";
  };

  return (
    <section className="relative overflow-hidden py-24 lg:py-32" style={styles.heroWrapper}>
      {/* Structural Ambient Glow Backdrop */}
      <div className="absolute inset-0 pointer-events-none" style={styles.ambientGlow} />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8 text-center">
        <div className="mx-auto max-w-3xl">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium mb-8" style={styles.statusBadge}>
            <span style={styles.badgePulse} />
            <span style={styles.badgeText}>SignalOffice Portal Live</span>
          </div>

          {/* Primary Marketing Pitch */}
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-6xl" style={styles.mainTitle}>
            Decentralized Office Tools for Elite Teams
          </h1>
          
          <p className="mt-6 text-lg leading-8" style={styles.subtitleText}>
            Secure your critical business guidelines, manage structural project workflows, and coordinate localized data vaults on an iron-clad platform designed for modern operators.
          </p>

          {/* Call to Actions */}
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <button
              onClick={handleScrollToPortal}
              style={styles.primaryBtn}
              className="transition-all duration-200 hover:opacity-90"
            >
              Enter Workspace Dashboard
            </button>
            <a 
              href="#features" 
              style={styles.secondaryLink}
              className="text-sm font-semibold leading-6 transition-colors duration-200"
            >
              Learn More <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// Polished CSS Visual Design System Coordinates
const styles: Record<string, React.CSSProperties> = {
  heroWrapper: {
    backgroundColor: "#070709",
    borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
  },
  ambientGlow: {
    background: "radial-gradient(circle at 50% -20%, rgba(223, 168, 55, 0.08) 0%, transparent 60%)",
  },
  statusBadge: {
    backgroundColor: "rgba(223, 168, 55, 0.06)",
    border: "1px solid rgba(223, 168, 55, 0.15)",
  },
  badgePulse: {
    width: "6px",
    height: "6px",
    backgroundColor: "#dfa837",
    borderRadius: "50%",
    boxShadow: "0 0 8px #dfa837",
  },
  badgeText: {
    color: "#dfa837",
    letterSpacing: "0.03em",
    fontFamily: "'Outfit', sans-serif",
  },
  mainTitle: {
    fontFamily: "'Outfit', sans-serif",
    letterSpacing: "-0.03em",
    lineHeight: "1.15",
  },
  subtitleText: {
    color: "#8e8e99",
    fontFamily: "'Outfit', sans-serif",
  },
  primaryBtn: {
    backgroundColor: "#dfa837",
    color: "#070709",
    padding: "12px 24px",
    borderRadius: "6px",
    fontWeight: 500,
    fontSize: "15px",
    cursor: "pointer",
    border: "none",
    fontFamily: "'Outfit', sans-serif",
  },
  secondaryLink: {
    color: "#f4f4f6",
    fontFamily: "'Outfit', sans-serif",
    textDecoration: "none",
  }
};
