// → app/auth/login/page.tsx
//
// Email + password login & signup. Main-site auth returns to marketing/partner
// pages, while SaaS auth returns to the SaaS dashboard callback.

"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import useTranslation from "@/components/i18n/useTranslation";
import { getAuthFlow, getProductionCallbackUrl, isLocalHost, normalizePostAuthDestination } from "@/lib/supabase/auth-flows";

const GOLD = "#f5c542";
const DARK = "#0d1117";
const PANEL = "#0f141b";
const CARD = "#111822";
const BORDER = "#1e2630";
const TEXT = "#e6edf3";
const MUTED = "#9aa8b8";

function fallbackText(value: string, fallback: string) {
  return value.includes(".") ? fallback : value;
}

const SOCIAL_PROVIDERS = [
  { name: "Google", path: "/api/auth/google", className: "social-login-button social-login-google" },
  { name: "Facebook", path: "/api/auth/facebook", className: "social-login-button social-login-facebook" },
  { name: "GitHub", path: "/api/auth/github", className: "social-login-button social-login-github" },
];

function getEmailRedirectTo(next: string) {
  const flow = getAuthFlow(window.location.hostname);
  const callbackUrl = new URL(
    isLocalHost(window.location.hostname) ? `${window.location.origin}/auth/callback` : getProductionCallbackUrl(flow)
  );

  callbackUrl.searchParams.set("flow", flow);
  callbackUrl.searchParams.set("next", normalizePostAuthDestination(next, flow));

  return callbackUrl.toString();
}

function getSocialLoginHref(path: string, next: string) {
  const params = new URLSearchParams();
  const flow = typeof window === "undefined" ? "main" : getAuthFlow(window.location.hostname);

  params.set("flow", flow);
  params.set("next", normalizePostAuthDestination(next, flow));

  return `${path}?${params.toString()}`;
}

export default function LoginPage() {
  const { t } = useTranslation();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [next, setNext] = useState("/promote");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("mode") === "signup") setMode("signup");
    const flow = getAuthFlow(window.location.hostname, params.get("flow"));
    setNext(normalizePostAuthDestination(params.get("next"), flow));
    if (params.get("error")) setError(fallbackText(t("login.errGeneric"), "Sign-in failed. Please try again."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submit() {
    if (!email.trim() || !password) {
      setError(fallbackText(t("login.errFields"), "Enter your email and password."));
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
            emailRedirectTo: getEmailRedirectTo(next),
          },
        });
        if (error) throw error;
        if (data.session) {
          window.location.href = next;
        } else {
          setNotice(fallbackText(t("login.noticeConfirm"), "Check your email to confirm your account, then log in."));
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
      setError(err instanceof Error ? err.message : fallbackText(t("login.errWrong"), "Something went wrong."));
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
          {mode === "signup"
            ? fallbackText(t("login.signupTitle"), "Create your account")
            : fallbackText(t("login.signinTitle"), "Welcome back")}
        </h1>
        <p style={{ color: MUTED, fontSize: 13.5, margin: "0 0 20px" }}>
          {mode === "signup"
            ? fallbackText(t("login.signupSubtitle"), "Create access for SignalBoost marketing and partner tools.")
            : fallbackText(t("login.signinSubtitle"), "Log in to continue to SignalBoost marketing and partner tools.")}
        </p>

        <div className="social-login-stack" aria-label="Social login options">
          {SOCIAL_PROVIDERS.map((provider) => (
            <a key={provider.name} href={getSocialLoginHref(provider.path, next)} className={provider.className}>
              {fallbackText(t("login.continueWith"), `Continue with ${provider.name}`).replace("{provider}", provider.name)}
            </a>
          ))}
        </div>

        <div className="login-divider" role="presentation">
          <span>{fallbackText(t("login.orEmail"), "or continue with email")}</span>
        </div>

        <label style={labelStyle}>{fallbackText(t("login.email"), "Email")}</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && void submit()}
          placeholder={fallbackText(t("login.emailPlaceholder"), "you@example.com")}
          autoComplete="email"
          style={inputStyle}
        />

        <label style={{ ...labelStyle, marginTop: 14 }}>{fallbackText(t("login.password"), "Password")}</label>
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
          {busy
            ? fallbackText(t("login.wait"), "Please wait…")
            : mode === "signup"
            ? fallbackText(t("login.createAccount"), "Create account")
            : fallbackText(t("login.logIn"), "Log in")}
        </button>

        <p style={{ color: MUTED, fontSize: 13, textAlign: "center", marginTop: 18 }}>
          {mode === "signup"
            ? fallbackText(t("login.haveAccount"), "Already have an account? ")
            : fallbackText(t("login.newHere"), "New to SignalBoost? ")}
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
            {mode === "signup"
              ? fallbackText(t("login.toggleToSignin"), "Log in")
              : fallbackText(t("login.toggleToSignup"), "Sign up")}
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
