"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/components/i18n/I18nProvider";
import { LanguageToggle } from "@/components/i18n/LanguageToggle";

function read(dict: Record<string, any>, key: string, fallback: string) {
  const value = key.split(".").reduce((obj, part) => obj?.[part], dict);
  return typeof value === "string" ? value : fallback;
}

const navItems = [
  { key: "navbar.home", fallback: "Home", href: "/", icon: "⌂" },
  { key: "navbar.marketplace", fallback: "Marketplace", href: "/marketplace", icon: "✦" },
  { key: "navbar.flights", fallback: "Flights", href: "/partners/flights", icon: "✈" },
  { key: "navbar.hotels", fallback: "Hotels", href: "/partners/hotels", icon: "▣" },
  { key: "navbar.esim", fallback: "eSIM", href: "/partners/esim", icon: "◈" },
  { key: "navbar.tours", fallback: "Tours", href: "/partners/tours", icon: "◎" },
  { key: "navbar.cars", fallback: "Cars", href: "/partners/cars", icon: "▰" },
  { key: "navbar.promote", fallback: "Promote Business", href: "/saas/promote-business", icon: "▲" },
  { key: "navbar.reviews", fallback: "Collect Reviews", href: "/saas/collect-reviews", icon: "★" },
  { key: "navbar.calendar", fallback: "AI Calendar", href: "/saas/ai-calendar", icon: "◷" },
  { key: "navbar.spreadsheets", fallback: "AI Spreadsheets", href: "/saas/ai-spreadsheets", icon: "▤" },
  { key: "navbar.outreach", fallback: "Outreach", href: "/saas/outreach", icon: "⇄" },
  { key: "navbar.lab", fallback: "Lab", href: "/demo", icon: "⚗" },
  { key: "navbar.workshop", fallback: "Workshop Apprentice", href: "/office", icon: "⌘" },
  { key: "navbar.admin", fallback: "Admin", href: "/admin", icon: "⛨", restricted: true },
];

export default function GlobalNavbar() {
  const pathname = usePathname();
  const { dict } = useI18n();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) return null;

  return (
    <header className="sb-ai-nav" role="banner">
      <Link href="/" className="sb-ai-brand" aria-label="SignalBoost home">
        <span className="sb-ai-brand-orb" aria-hidden="true" />
        <span>SignalBoost</span>
      </Link>
      <nav className="sb-ai-nav-scroll" aria-label="Primary SignalBoost navigation">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sb-ai-nav-link ${active ? "is-active" : ""} ${item.restricted ? "is-restricted" : ""}`}
              aria-current={active ? "page" : undefined}
              aria-label={item.restricted ? `${read(dict, item.key, item.fallback)} — owner or admin only` : read(dict, item.key, item.fallback)}
            >
              <span className="sb-ai-nav-icon" aria-hidden="true">{item.icon}</span>
              <span>{read(dict, item.key, item.fallback)}</span>
            </Link>
          );
        })}
      </nav>
      <LanguageToggle />
    </header>
  );
}
