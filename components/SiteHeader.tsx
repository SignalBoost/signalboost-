"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import useTranslation from "@/components/i18n/useTranslation";

const navItems = [
  { key: "marketplace", path: "/" },
  { key: "promote_business", path: "/promote" },
  { key: "reviews", path: "/reviews" },
  { key: "calendar", path: "/calendar" },
  { key: "spreadsheets", path: "/spreadsheets" },
  { key: "outreach", path: "/outreach" },
  { key: "pricing", path: "/pricing" },
  { key: "executive", path: "/dashboard" },
  { key: "concierge", path: "/assistant" },
];

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
            <Link key={item.key} className={active ? "active" : ""} href={item.path}>
              {t(`navbar.${item.key}`)}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
