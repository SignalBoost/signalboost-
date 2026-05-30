"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { name: "Marketplace", path: "/" },
  { name: "Promote Business", path: "/promote" },
  { name: "Reviews", path: "/reviews" },
  { name: "Calendar", path: "/calendar" },
  { name: "Spreadsheets", path: "/spreadsheets" },
  { name: "Outreach", path: "/outreach" },
  { name: "Personal Assistant", path: "/assistant" },
  { name: "Pricing", path: "/pricing" },
  { name: "Executive", path: "/dashboard" },
  { name: "Admin", path: "/admin" },
];

export default function SiteHeader() {
  const pathname = usePathname() || "/";

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
              {item.name}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
