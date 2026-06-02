"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import LanguageToggle from "@/components/i18n/LanguageToggle";
import RegionToggle from "@/components/RegionToggle";
import useTranslation from "@/components/i18n/useTranslation";
import { createClient } from "@/lib/supabase/client";
import { checkIsAdmin } from "@/lib/admins";
import { getAuthFlow, getDefaultPostAuthDestination, type AuthFlow } from "@/lib/supabase/auth-flows";

function fallbackText(value: string, fallback: string) {
  return /^[a-zA-Z][\w$]*(\.[\w$]+)+$/.test(value) ? fallback : value;
}

type Leaf = { labelKey: string; fallback: string; path: string };
type NavNode =
  | ({ kind: "link" } & Leaf)
  | { kind: "menu"; labelKey: string; fallback: string; items: Leaf[] };

const NAV: NavNode[] = [
  { kind: "link", labelKey: "header.home", fallback: "Home", path: "/" },
  {
    kind: "menu",
    labelKey: "header.cowork",
    fallback: "Cowork",
    items: [
      { labelKey: "header.promote", fallback: "Promote Business", path: "/promote" },
      { labelKey: "header.reviews", fallback: "Reviews", path: "/reviews" },
      { labelKey: "header.calendar", fallback: "Calendar", path: "/calendar" },
      { labelKey: "header.spreadsheets", fallback: "Spreadsheets", path: "/spreadsheets" },
      { labelKey: "header.outreach", fallback: "Outreach", path: "/outreach" },
      { labelKey: "header.assistant", fallback: "Personal Assistant", path: "/assistant" },
    ],
  },
  { kind: "link", labelKey: "header.pricing", fallback: "Pricing", path: "/pricing" },
];

function getHeaderAuthFlow(): AuthFlow {
  if (typeof window === "undefined") return "main";
  return getAuthFlow(window.location.hostname);
}

function getLoginHref(flow: AuthFlow) {
  const params = new URLSearchParams({ flow, next: getDefaultPostAuthDestination(flow) });
  return `/auth/login?${params.toString()}`;
}

function AuthControls() {
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [flow, setFlow] = useState<AuthFlow>("main");
  const loginHref = useMemo(() => getLoginHref(flow), [flow]);

  useEffect(() => {
    setFlow(getHeaderAuthFlow());
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return;
    const supabase = createClient();
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (mounted) setUser(data.user ?? null);
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
    <div className="nv-auth" aria-label="Authentication">
      {user ? (
        <div className="nv-auth-state">
          <span className="nv-auth-label">{fallbackText(t("header.loggedIn"), "Logged in")}</span>
          <button type="button" className="nv-btn" onClick={() => void handleLogout()}>{fallbackText(t("header.logout"), "Logout")}</button>
        </div>
      ) : (
        <Link className="nv-btn nv-login" href={loginHref}>{fallbackText(t("header.login"), "Login")}</Link>
      )}
    </div>
  );
}

export default function SiteHeader() {
  const pathname = usePathname() || "/";
  const { t } = useTranslation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return;
    let mounted = true;
    const supabase = createClient();
    const refresh = () => {
      checkIsAdmin().then((ok) => {
        if (mounted) setIsAdmin(ok);
      });
    };
    refresh();
    const { data: listener } = supabase.auth.onAuthStateChange(() => refresh());
    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setOpenMenu(null);
  }, [pathname]);

  function openWithCancel(label: string) {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenMenu(label);
  }
  function scheduleClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenMenu(null), 160);
  }

  const isActive = (path: string) => (path === "/" ? pathname === "/" : pathname.startsWith(path));

  // Admin is a top-level, admin-only link (the old Company group was removed).
  const nav: NavNode[] = [...NAV];
  if (isAdmin) {
    nav.push({ kind: "link", labelKey: "header.admin", fallback: "Admin", path: "/admin" });
  }

  return (
    <header className="nv-header">
      <Link className="nv-brand" href="/" aria-label="SignalBoost home">
        <span>signal</span><strong>boost</strong>
      </Link>

      <button type="button" className="nv-burger" aria-label="Toggle menu" aria-expanded={mobileOpen} onClick={() => setMobileOpen((v) => !v)}>
        <span /><span /><span />
      </button>

      <nav className={mobileOpen ? "nv-nav nv-nav-open" : "nv-nav"} aria-label="Primary navigation">
        {nav.map((node) => {
          if (node.kind === "link") {
            return (
              <Link key={node.path} className={isActive(node.path) ? "nv-item nv-active" : "nv-item"} href={node.path}>
                {fallbackText(t(node.labelKey), node.fallback)}
              </Link>
            );
          }
          const label = fallbackText(t(node.labelKey), node.fallback);
          const open = openMenu === node.labelKey;
          const anyActive = node.items.some((i) => isActive(i.path));
          return (
            <div key={node.labelKey} className="nv-group" onMouseEnter={() => openWithCancel(node.labelKey)} onMouseLeave={scheduleClose}>
              <button type="button" className={anyActive ? "nv-item nv-trigger nv-active" : "nv-item nv-trigger"} aria-haspopup="true" aria-expanded={open} onClick={() => setOpenMenu(open ? null : node.labelKey)} onFocus={() => openWithCancel(node.labelKey)}>
                {label}<span className="nv-caret" aria-hidden="true">▾</span>
              </button>
              <div className={open ? "nv-menu nv-menu-open" : "nv-menu"} role="menu">
                {node.items.map((item) => (
                  <Link key={item.path} role="menuitem" className={isActive(item.path) ? "nv-menu-item nv-active" : "nv-menu-item"} href={item.path}>
                    {fallbackText(t(item.labelKey), item.fallback)}
                  </Link>
                ))}
              </div>
            </div>
          );
        })}

        <div className="nv-mobile-tools">
          <RegionToggle />
          <LanguageToggle />
          <AuthControls />
        </div>
      </nav>

      <div className="nv-tools">
        <RegionToggle />
        <LanguageToggle />
        <AuthControls />
      </div>

      <style>{NV_CSS}</style>
    </header>
  );
}

const NV_CSS = `
.nv-header{position:sticky;top:0;z-index:1000;display:flex;align-items:center;gap:18px;min-height:64px;padding:12px clamp(16px,3vw,36px);border-bottom:1px solid rgba(245,197,66,.16);background:rgba(3,5,10,.86);backdrop-filter:blur(18px);box-shadow:0 12px 36px rgba(0,0,0,.28);font-family:'Outfit',system-ui,sans-serif;}
.nv-brand{display:inline-flex;align-items:baseline;gap:2px;color:#fff;font-size:19px;font-weight:900;letter-spacing:-.03em;white-space:nowrap;text-decoration:none;}
.nv-brand strong{color:#f5c542;}
.nv-nav{display:flex;align-items:center;gap:4px;margin-left:auto;}
.nv-item{position:relative;display:inline-flex;align-items:center;gap:5px;border:1px solid transparent;border-radius:999px;background:none;color:rgba(255,255,255,.74);font-size:13px;font-weight:800;letter-spacing:.01em;padding:9px 14px;white-space:nowrap;cursor:pointer;font-family:inherit;text-decoration:none;transition:border-color .18s ease,color .18s ease,background .18s ease;}
.nv-item:hover,.nv-item.nv-active{border-color:rgba(245,197,66,.4);background:rgba(245,197,66,.1);color:#fff;}
.nv-caret{font-size:9px;opacity:.7;transition:transform .18s ease;}
.nv-group{position:relative;}
.nv-group:hover .nv-caret{transform:translateY(1px);}
.nv-menu{position:absolute;top:calc(100% + 10px);left:0;min-width:210px;display:flex;flex-direction:column;gap:2px;padding:8px;border:1px solid rgba(255,255,255,.1);border-radius:16px;background:linear-gradient(180deg,rgba(18,18,26,.98),rgba(10,10,16,.98));box-shadow:0 24px 60px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.05);opacity:0;visibility:hidden;transform:translateY(-6px);transition:opacity .16s ease,transform .16s ease,visibility .16s;}
.nv-menu::before{content:"";position:absolute;bottom:100%;left:0;right:0;height:12px;}
.nv-menu-open{opacity:1;visibility:visible;transform:translateY(0);}
.nv-menu-item{display:block;border-radius:10px;padding:10px 12px;color:rgba(255,255,255,.78);font-size:13.5px;font-weight:700;text-decoration:none;white-space:nowrap;transition:background .15s ease,color .15s ease;}
.nv-menu-item:hover,.nv-menu-item.nv-active{background:rgba(245,197,66,.12);color:#f5c542;}
.nv-tools{display:inline-flex;align-items:center;gap:10px;flex-shrink:0;}
.nv-mobile-tools{display:none;}
.nv-auth{display:inline-flex;align-items:center;gap:8px;}
.nv-btn,.nv-auth-label{border:1px solid rgba(255,255,255,.14);border-radius:999px;font-size:12px;font-weight:800;padding:7px 12px;color:rgba(255,255,255,.78);text-decoration:none;white-space:nowrap;}
.nv-auth-state{display:inline-flex;align-items:center;gap:8px;}
.nv-auth-label{border-color:rgba(46,160,67,.4);color:#7ee787;background:rgba(46,160,67,.1);}
.nv-btn{background:rgba(255,255,255,.05);cursor:pointer;font-family:inherit;}
.nv-login{background:linear-gradient(135deg,#f5c542,#dfa837);color:#06060a;border-color:transparent;}
.nv-burger{display:none;flex-direction:column;gap:4px;margin-left:auto;background:none;border:1px solid rgba(255,255,255,.16);border-radius:10px;padding:9px;cursor:pointer;}
.nv-burger span{display:block;width:20px;height:2px;background:#f5c542;border-radius:2px;}
@media (max-width:860px){
  .nv-burger{display:flex;}
  .nv-tools{display:none;}
  .nv-nav{position:absolute;top:100%;left:0;right:0;margin:0;flex-direction:column;align-items:stretch;gap:6px;padding:14px clamp(16px,3vw,36px);background:rgba(6,6,12,.98);border-bottom:1px solid rgba(245,197,66,.16);max-height:0;overflow:hidden;opacity:0;visibility:hidden;transition:max-height .2s ease,opacity .2s ease,visibility .2s;}
  .nv-nav-open{max-height:80vh;overflow:auto;opacity:1;visibility:visible;}
  .nv-group{width:100%;}
  .nv-trigger{width:100%;justify-content:space-between;}
  .nv-menu{position:static;opacity:1;visibility:visible;transform:none;min-width:0;box-shadow:none;border:none;background:rgba(255,255,255,.03);margin:4px 0 4px 12px;}
  .nv-mobile-tools{display:flex;flex-direction:column;gap:10px;margin-top:10px;padding-top:12px;border-top:1px solid rgba(255,255,255,.1);}
}
`;
