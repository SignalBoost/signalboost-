// File: app/page.tsx
// The real homepage at signalboostapp.com (/).
// Mounts the full concierge app (HomeApp), which contains the hero, logo,
// admin bar, sections, working search, and the partner marquee.

import "./home-next/home.css";
import HomeApp from "@/components/home/HomeApp";

export const metadata = {
  title: "SignalBoost — Your AI-guided digital shopping mall",
  description:
    "Tell SignalBoost what you need and get guided to the right trusted partner — flights, hotels, eSIMs, rental cars and more, matched to your country.",
};

export default function HomePage() {
  return <HomeApp />;
}
