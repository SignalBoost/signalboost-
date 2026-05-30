"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LanguageToggle from "@/components/i18n/LanguageToggle";
import useTranslation from "@/components/i18n/useTranslation";

const navItems = [
  { key: "marketplace", icon: "⌂", path: "/" },
  { key: "promote_business", icon: "↗", path: "/promote" },
  { key: "reviews", icon: "★", path: "/reviews" },
  { key: "calendar", icon: "◷", path: "/calendar" },
  { key: "spreadsheets", icon: "▦", path: "/spreadsheets" },
  { key: "outreach", icon: "◌", path: "/outreach" },
  { key: "assistant", icon: "✦", path: "/assistant" },
  { key: "pricing", icon: "$", path: "/pricing" },
  { key: "admin", icon: "⚙", path: "/admin", adminOnly: true },
];

export default function SiteHeader() {
  const pathname = usePathname() || "/";
  const { t } = useTranslation();

  return (
    <header className="site-header" role="banner">
      <Link className="site-brand" href="/" aria-label="SignalBoost home">
        <span>signal</span>
        <strong>boost</strong>
        <em>NASA HMI</em>
      </Link>
      <nav className="site-nav" aria-label="SignalBoost unified cockpit navigation">
        {navItems.map((item) => {
          const active = item.path === "/" ? pathname === "/" : pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              className={active ? "active" : ""}
              href={item.path}
              aria-current={active ? "page" : undefined}
              data-admin-only={item.adminOnly ? "true" : undefined}
            >
              <span aria-hidden="true">{item.icon}</span>
              {t(`navbar.${item.key}`)}
            </Link>
          );
        })}
      </nav>
      <LanguageToggle />
    </header>
  );
}
