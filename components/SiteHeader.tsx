// → components/SiteHeader.tsx
//
// Auth-aware header for Next.js-rendered routes (/partners/[slug], /demo,
// /auth/*). The static home (public/index.html) is served via rewrite and
// bypasses React, so this header does not appear there — that's expected.
//
// Drop into app/layout.tsx above {children}:  import SiteHeader from
// "@/components/SiteHeader";  then <SiteHeader />.

"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const GOLD = "#f5c542";
const DARK = "#0d1117";
const BORDER = "#1e2630";
const TEXT = "#e6edf3";
const MUTED = "#9aa8b8";
const SAAS_URL = "https://saas.signalboostapp.com";

// Admin allow-list. Reads NEXT_PUBLIC_ADMIN_EMAILS (comma-separated) if set,
// and always includes the owner email as a safe default so the Admin tab works
// even before the env var is configured. Add teammates via the env var later.
const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);
const OWNER_EMAIL = "cadomos@gmail.com";
function isAdminEmail(email: string | null): boolean {
  if (!email) return false;
  const e = email.toLowerCase();
  return e === OWNER_EMAIL || ADMIN_EMAILS.includes(e);
}

export default function SiteHeader() {
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
      setReady(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setEmail(null);
    window.location.href = "/";
  }

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        padding: "12px 20px",
        background: "rgba(13,17,23,0.82)",
        backdropFilter: "blur(10px)",
        borderBottom: `1px solid ${BORDER}`,
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <a
        href="/"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 9,
          textDecoration: "none",
          color: TEXT,
          fontWeight: 800,
          fontSize: 17,
          letterSpacing: "-0.2px",
        }}
      >
        <span
          style={{
            width: 26,
            height: 26,
            borderRadius: 7,
            background: `linear-gradient(135deg, ${GOLD}, #d9a92e)`,
            display: "grid",
            placeItems: "center",
            color: DARK,
            fontWeight: 900,
            fontSize: 15,
          }}
        >
          S
        </span>
        Signal<span style={{ color: GOLD }}>Boost</span>
      </a>

      <nav style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {!ready ? (
          <span
            style={{
              width: 92,
              height: 34,
              borderRadius: 9,
              background: "rgba(255,255,255,0.04)",
            }}
          />
        ) : email ? (
          <>
            {isAdminEmail(email) && (
              <a
                href="/admin"
                style={{
                  padding: "8px 14px",
                  borderRadius: 9,
                  textDecoration: "none",
                  fontSize: 13.5,
                  fontWeight: 800,
                  color: GOLD,
                  background: "rgba(245,197,66,0.12)",
                  border: `1px solid rgba(245,197,66,0.35)`,
                }}
              >
                ⚙ Admin
              </a>
            )}
            <span
              style={{
                color: MUTED,
                fontSize: 13,
                maxWidth: 180,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              title={email}
            >
              {email}
            </span>
            <a
              href={`${SAAS_URL}/?ref=header`}
              style={{
                padding: "8px 14px",
                borderRadius: 9,
                textDecoration: "none",
                fontSize: 13.5,
                fontWeight: 700,
                color: DARK,
                background: `linear-gradient(135deg, ${GOLD}, #d9a92e)`,
              }}
            >
              Open app
            </a>
            <button
              onClick={signOut}
              style={{
                padding: "8px 13px",
                borderRadius: 9,
                fontSize: 13.5,
                fontWeight: 600,
                color: MUTED,
                background: "transparent",
                border: `1px solid ${BORDER}`,
                cursor: "pointer",
              }}
            >
              Sign out
            </button>
          </>
        ) : (
          <>
            <a
              href="/auth/login"
              style={{
                padding: "8px 14px",
                borderRadius: 9,
                textDecoration: "none",
                fontSize: 13.5,
                fontWeight: 600,
                color: TEXT,
                border: `1px solid ${BORDER}`,
              }}
            >
              Log in
            </a>
            <a
              href="/auth/login?mode=signup"
              style={{
                padding: "8px 14px",
                borderRadius: 9,
                textDecoration: "none",
                fontSize: 13.5,
                fontWeight: 700,
                color: DARK,
                background: `linear-gradient(135deg, ${GOLD}, #d9a92e)`,
              }}
            >
              Sign up
            </a>
          </>
        )}
      </nav>
    </header>
  );
}
