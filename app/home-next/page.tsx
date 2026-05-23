// File: app/home-next/page.tsx
// Phase C6 — TEST route for the converted homepage. Lives at /home-next so the
// live static homepage (/) is completely untouched. We verify this against the
// live page (region by region) BEFORE flipping the rewrite in Phase F.
//
// Thin server component: imports the scoped styles and mounts the client app.

import "./home.css";
import HomeApp from "@/components/home/HomeApp";

export const metadata = {
  title: "SignalBoost — Offers (preview)",
  robots: { index: false, follow: false }, // don't index the preview route
};

export default function HomeNextPage() {
  return <HomeApp />;
}
