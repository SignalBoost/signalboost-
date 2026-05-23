// File: components/home/AdminBar.tsx
// A small floating admin bar, visible ONLY to the owner/admin (by email).
// Self-contained: does its own Supabase session check with a timeout so it can
// never get "stuck" — if the check fails or times out, it simply renders
// nothing (regular visitors and logged-out states see no bar at all).
//
// Buttons: ⚙ Admin (go to the hub), Reset password (sends a recovery email),
// Log out (ends the session). All gated to the admin email.

"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const OWNER_EMAIL = "cadomos@gmail.com";
const EXTRA_ADMINS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

function isAdmin(email: string | null): boolean {
  if (!email) return false;
  const e = email.toLowerCase();
  return e === OWNER_EMAIL || EXTRA_ADMINS.includes(e);
}

export default function AdminBar() {
  const [email, setEmail] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    let done = false;
    const supabase = createClient();

    // Fail-safe: if the session check doesn't resolve quickly, give up quietly.
    const timer = setTimeout(() => {
      if (!done) setChecked(true);
    }, 3000);

    supabase.auth
      .getUser()
      .then(({ data }) => {
        if (done) return;
        setEmail(data.user?.email ?? null);
      })
      .catch(() => {})
      .finally(() => {
        done = true;
        clearTimeout(timer);
        setChecked(true);
      });

    return () => {
      done = true;
      clearTimeout(timer);
    };
  }, []);

  // Render nothing until we know, and nothing for non-admins.
  if (!checked || !isAdmin(email)) return null;

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.reload();
  };

  const resetPassword = async () => {
    const supabase = createClient();
    setNote("Sending reset email…");
    const { error } = await supabase.auth.resetPasswordForEmail(email as string, {
      redirectTo: `${window.location.origin}/auth/login`,
    });
    setNote(error ? `Error: ${error.message}` : "Reset email sent — check your inbox.");
    setTimeout(() => setNote(null), 6000);
  };

  const wrap: React.CSSProperties = {
    position: "fixed",
    top: 12,
    right: 12,
    zIndex: 4000,
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "rgba(15,20,27,0.92)",
    backdropFilter: "blur(8px)",
    border: "1px solid rgba(245,197,66,0.35)",
    borderRadius: 999,
    padding: "6px 8px 6px 12px",
    boxShadow: "0 10px 28px rgba(0,0,0,0.4)",
    fontFamily: "system-ui, sans-serif",
  };
  const btn: React.CSSProperties = {
    border: 0,
    borderRadius: 999,
    padding: "7px 12px",
    fontSize: 12.5,
    fontWeight: 800,
    cursor: "pointer",
    fontFamily: "inherit",
    textDecoration: "none",
    display: "inline-block",
  };

  return (
    <div style={wrap}>
      <span style={{ color: "#9aa8b8", fontSize: 11.5, fontWeight: 700, whiteSpace: "nowrap" }}>
        ⚙ Admin
      </span>
      <a href="/admin" style={{ ...btn, color: "#1a1206", background: "linear-gradient(135deg,#f5c542,#e9b738)" }}>
        Dashboard
      </a>
      <button onClick={resetPassword} style={{ ...btn, color: "#e6edf3", background: "rgba(255,255,255,0.08)" }}>
        Reset password
      </button>
      <button onClick={logout} style={{ ...btn, color: "#e6edf3", background: "rgba(255,255,255,0.08)" }}>
        Log out
      </button>
      {note && (
        <span style={{ color: "#7ee787", fontSize: 11.5, fontWeight: 600, marginLeft: 4, whiteSpace: "nowrap" }}>
          {note}
        </span>
      )}
    </div>
  );
}
