"use client";
// File: components/home/AdminDot.tsx
// A tiny, faint dot fixed in the bottom-right corner that links to the login
// page (/auth/login). Invisible to ordinary visitors (looks like a stray fleck),
// but lets the owner reach the login page with one click instead of typing the
// URL from memory.
//
// Intentionally subtle: low opacity, small, no label. On hover it brightens a
// touch so YOU can find it, but it never advertises "login/admin" to shoppers.
// Self-contained inline styles — no dependency on home.css.
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
        bottom: 10,
        right: 10,
        zIndex: 4000,
        width: 10,
        height: 10,
        borderRadius: "50%",
        background: "rgba(224,164,37,.28)", // faint gold fleck
        opacity: 0.5,
        transition: "opacity .18s ease, transform .18s ease, background .18s ease",
        textDecoration: "none",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.opacity = "1";
        e.currentTarget.style.transform = "scale(1.25)";
        e.currentTarget.style.background = "rgba(224,164,37,.85)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = "0.5";
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.background = "rgba(224,164,37,.28)";
      }}
    />
  );
}
