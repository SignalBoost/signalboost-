"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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

const oauthProviders = [
  { label: "Google", href: "/api/auth/google" },
  { label: "Facebook", href: "/api/auth/facebook" },
  { label: "GitHub", href: "/api/auth/github" },
];

function fallbackText(value: string, fallback: string) {
  return value.includes(".") ? fallback : value;
}

const fallbackLabels: Record<string, string> = {
  promote_business: "Promote",
  assistant: "Personal Assistant",
  pricing: "Pricing",
  executive: "Executive",
};

export default function SiteHeader() {
  const pathname = usePathname() || "/";
  const { t } = useTranslation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let mounted = true;
    const supabase = createClient();

    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setIsAuthenticated(Boolean(data.session));
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) setIsAuthenticated(Boolean(session));
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

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
      <div className="site-actions" aria-label="Account and language controls">
        <LanguageToggle />
        {isAuthenticated ? (
          <form action="/auth/signout" method="post" className="site-auth-form">
            <button className="site-auth-link site-auth-link--primary" type="submit">
              Logout
            </button>
          </form>
        ) : (
          <div className="site-auth" aria-label="Login with OAuth providers">
            <Link className="site-auth-link site-auth-link--primary" href="/auth/login">
              Login
            </Link>
            <div className="site-oauth-links" aria-label="OAuth providers">
              {oauthProviders.map((provider) => (
                <Link key={provider.href} className="site-auth-link" href={provider.href}>
                  {provider.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
