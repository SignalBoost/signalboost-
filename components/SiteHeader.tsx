"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import LanguageToggle from "@/components/i18n/LanguageToggle";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { label: "Marketplace", path: "/marketplace" },
  { label: "Promote", path: "/promote" },
  { label: "Personal Assistant", path: "/assistant" },
  { label: "Pricing", path: "/pricing" },
  { label: "Executive", path: "/dashboard" },
];

const oauthProviders = [
  { label: "Google", path: "/api/auth/google" },
  { label: "Facebook", path: "/api/auth/facebook" },
  { label: "GitHub", path: "/api/auth/github" },
];

function AuthControls() {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return;
    }

    const supabase = createClient();
    let mounted = true;

    supabase.auth.getUser().then(({ data }) => {
      if (mounted) {
        setUser(data.user ?? null);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    window.location.assign("/");
  }

  return (
    <div className="site-auth" aria-label="Authentication and OAuth providers">
      <div className="site-auth__providers" aria-label="OAuth providers">
        {oauthProviders.map((provider) => (
          <a key={provider.path} href={provider.path} className="site-auth__provider">
            {provider.label}
          </a>
        ))}
      </div>
      {user ? (
        <div className="site-auth__state">
          <span className="site-auth__label">Logged in</span>
          <button type="button" className="site-auth__button" onClick={() => void handleLogout()}>
            Logout
          </button>
        </div>
      ) : (
        <Link className="site-auth__button site-auth__login" href="/auth/login">
          Login
        </Link>
      )}
    </div>
  );
}

export default function SiteHeader() {
  const pathname = usePathname() || "/";

  return (
    <header className="site-header">
      <Link className="site-brand" href="/" aria-label="SignalBoost home">
        <span>signal</span>
        <strong>boost</strong>
      </Link>
      <nav className="site-nav" aria-label="SignalBoost office module navigation">
        {navItems.map((item) => {
          const active = item.path === "/" ? pathname === "/" : pathname.startsWith(item.path);
          return (
            <Link key={item.path} className={active ? "active" : ""} href={item.path}>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="site-header__tools">
        <LanguageToggle />
        <AuthControls />
      </div>
    </header>
  );
}
