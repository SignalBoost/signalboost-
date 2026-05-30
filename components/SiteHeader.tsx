"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import useTranslation from "@/components/i18n/useTranslation";
import LanguageToggle from "@/components/i18n/LanguageToggle";

const navItems = [
  { key: "promote_business", path: "/promote" },
  { key: "reviews", path: "/reviews" },
  { key: "calendar", path: "/calendar" },
  { key: "spreadsheets", path: "/spreadsheets" },
  { key: "outreach", path: "/outreach" },
  { key: "assistant", path: "/assistant" },
  { key: "pricing", path: "/pricing" },
  { key: "executive", path: "/dashboard" },
];

function fallbackText(value: string, fallback: string) {
  return value.includes(".") ? fallback : value;
}

const fallbackLabels: Record<string, string> = {
  promote_business: "Promote Business",
  reviews: "Reviews",
  calendar: "Calendar",
  spreadsheets: "Spreadsheets",
  outreach: "Outreach",
  assistant: "Personal Assistant",
  pricing: "Pricing",
  executive: "Executive",
};

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
      <LanguageToggle />
    </header>
  );
}
