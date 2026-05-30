"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import useTranslation from "@/components/i18n/useTranslation";
import LanguageToggle from "@/components/i18n/LanguageToggle";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { key: "promote_business", path: "/promote" },
  { key: "assistant", path: "/assistant" },
  { key: "pricing", path: "/pricing" },
  { key: "executive", path: "/dashboard" },
];

function fallbackText(value: string, fallback: string) {
  return value.includes(".") ? fallback : value;
}

const fallbackLabels: Record<string, string> = {
  promote_business: "Promote Business",
  assistant: "Personal Assistant",
  pricing: "Pricing",
  executive: "Executive",
};

const oauthProviders = ["google", "facebook", "github"] as const;

function AuthControls() {
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const hasSupabaseEnv = Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    if (!hasSupabaseEnv) {
      setReady(true);
      return;
    }

    const supabase = createClient();
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setEmail(data.session?.user.email ?? null);
      setReady(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user.email ?? null);
      setReady(true);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (email) {
    return (
      <div className="site-auth" aria-label="Authenticated account controls">
        <span className="site-auth__email" title={email}>{email}</span>
        <button className="site-auth__button" type="button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="site-auth" aria-label="Login with OAuth providers">
      <Link className="site-auth__button" href="/auth/login" aria-busy={!ready}>
        Login
      </Link>
      <div className="site-auth__providers" aria-label="OAuth providers">
        {oauthProviders.map((provider) => (
          <Link key={provider} className="site-auth__provider" href={`/api/auth/${provider}`}>
            {provider.slice(0, 1).toUpperCase()}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function SiteHeader() {
  const pathname = usePathname() || "/";
  const { t } = useTranslation();

  return (
    <header className="site-header">
      <Link className="site-brand" href="/" aria-label="SignalBoost home">
        <span>signal</span>
        <strong>boost</strong>
      </Link>
      <nav className="site-nav" aria-label="SignalBoost unified cockpit navigation">
        {navItems.map((item) => {
          const active = item.path === "/" ? pathname === "/" : pathname.startsWith(item.path);
          return (
            <Link key={item.path} className={active ? "active" : ""} href={item.path}>
              {fallbackText(t(`navbar.${item.key}`), fallbackLabels[item.key])}
            </Link>
          );
        })}
      </nav>
      <div className="site-header-actions">
        <Link className="site-concierge-link" href="/assistant">
          Concierge
        </Link>
        <LanguageToggle />
        <AuthControls />
      </div>
    </header>
  );
}
