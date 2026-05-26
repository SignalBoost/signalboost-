"use client";
// File: components/home/AdminDot.tsx
// A small login trigger fixed in the bottom-right corner that links to
// /auth/login — so the owner reaches login with one click instead of typing the
// URL. Made clearly findable (a gold key button) but still discreet enough that
// a shopper won't think much of it. Self-contained inline styles.
//
// Usage in HomeApp.tsx:  <AdminDot />
import React from "react";

export default function AdminDot() {
  return (
    <a
      href="/auth/login"
      aria-label="Sign in"
      title="Sign in"
      style={{
        position: "fixed",
        bottom: 16,
        right: 16,
        zIndex: 4000,
        width: 34,
        height: 34,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
        background: "rgba(224,164,37,.85)",
        color: "#1a1206",
        fontSize: 16,
        lineHeight: 1,
        textDecoration: "none",
        cursor: "pointer",
        boxShadow: "0 4px 14px rgba(0,0,0,.45)",
        border: "1px solid rgba(224,164,37,.6)",
        opacity: 0.85,
        transition: "opacity .18s ease, transform .18s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.opacity = "1";
        e.currentTarget.style.transform = "scale(1.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = "0.85";
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      🔑
    </a>
  );
}
