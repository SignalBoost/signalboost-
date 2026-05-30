// → app/auth/login/page.tsx
//
// Email + password login & signup on the marketing site. On success the
// session cookie is written to .signalboostapp.com, so the user is also
// authenticated on saas.signalboostapp.com without logging in again.
//
// Reads ?mode=signup and ?next=/path from the URL via window.location (no
// useSearchParams, so no Suspense boundary needed at build time).

"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const GOLD = "#f5c542";
const DARK = "#0d1117";
const PANEL = "#0f141b";
const CARD = "#111822";
const BORDER = "#1e2630";
const TEXT = "#e6edf3";
const MUTED = "#9aa8b8";

const SOCIAL_PROVIDERS = [
  { name: "Google", href: "/api/auth/google", className: "social-login-button social-login-google" },
  { name: "Facebook", href: "/api/auth/facebook", className: "social-login-button social-login-facebook" },
  { name: "GitHub", href: "/api/auth/github", className: "social-login-button social-login-github" },
];

export default function LoginPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [next, setNext] = useState("/");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("mode") === "signup") setMode("signup");
    const n = params.get("next");
    if (n && n.startsWith("/")) setNext(n);
    if (params.get("error")) setError("Sign-in failed. Please try again.");
  }, []);

  async function submit() {
    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }
    setBusy(true);
    setError(null);
    setNotice(null);
    const supabase = createClient();

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
          },
        });
        if (error) throw error;
        if (data.session) {
          window.location.href = next; // auto-confirm on; session live
        } else {
          setNotice("Check your email to confirm your account, then log in.");
          setMode("signin");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        window.location.href = next;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        padding: 20,
        background: DARK,
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 380,
          background: PANEL,
          border: `1px solid ${BORDER}`,
          borderRadius: 16,
          padding: 28,
          boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 6 }}>
          <span
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: `linear-gradient(135deg, ${GOLD}, #d9a92e)`,
              display: "grid",
              placeItems: "center",
              color: DARK,
              fontWeight: 900,
            }}
          >
            S
          </span>
          <span style={{ color: TEXT, fontWeight: 800, fontSize: 18 }}>
            Signal<span style={{ color: GOLD }}>Boost</span>
          </span>
        </div>

        <h1 style={{ color: TEXT, fontSize: 20, margin: "14px 0 4px" }}>
          {mode === "signup" ? "Create your account" : "Welcome back"}
        </h1>
        <p style={{ color: MUTED, fontSize: 13.5, margin: "0 0 20px" }}>
          {mode === "signup"
            ? "One account works across the site and the app."
            : "Log in to continue to SignalBoost."}
        </p>

        <div className="social-login-stack" aria-label="Social login options">
          {SOCIAL_PROVIDERS.map((provider) => (
            <a key={provider.name} href={provider.href} className={provider.className}>
              Continue with {provider.name}
            </a>
          ))}
        </div>

        <div className="login-divider" role="presentation">
          <span>or continue with email</span>
        </div>

        <label style={labelStyle}>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && void submit()}
          placeholder="you@example.com"
          autoComplete="email"
          style={inputStyle}
        />

        <label style={{ ...labelStyle, marginTop: 14 }}>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && void submit()}
          placeholder="••••••••"
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          style={inputStyle}
        />

        {error && <p style={{ color: "#f8857a", fontSize: 12.5, margin: "12px 0 0" }}>{error}</p>}
        {notice && <p style={{ color: GOLD, fontSize: 12.5, margin: "12px 0 0" }}>{notice}</p>}

        <button
          onClick={() => void submit()}
          disabled={busy}
          style={{
            width: "100%",
            marginTop: 18,
            padding: "12px 16px",
            borderRadius: 11,
            border: "none",
            cursor: busy ? "default" : "pointer",
            opacity: busy ? 0.6 : 1,
            color: DARK,
            fontWeight: 800,
            fontSize: 14.5,
            background: `linear-gradient(135deg, ${GOLD}, #d9a92e)`,
          }}
        >
          {busy ? "Please wait…" : mode === "signup" ? "Create account" : "Log in"}
        </button>

        <p style={{ color: MUTED, fontSize: 13, textAlign: "center", marginTop: 18 }}>
          {mode === "signup" ? "Already have an account? " : "New to SignalBoost? "}
          <button
            onClick={() => {
              setMode(mode === "signup" ? "signin" : "signup");
              setError(null);
              setNotice(null);
            }}
            style={{
              background: "none",
              border: "none",
              color: GOLD,
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 700,
              padding: 0,
            }}
          >
            {mode === "signup" ? "Log in" : "Sign up"}
          </button>
        </p>
      </div>
    </main>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  color: MUTED,
  fontSize: 12.5,
  fontWeight: 600,
  marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "11px 13px",
  borderRadius: 10,
  border: `1px solid ${BORDER}`,
  background: CARD,
  color: TEXT,
  fontSize: 14,
  fontFamily: "inherit",
  outline: "none",
  boxSizing: "border-box",
};
