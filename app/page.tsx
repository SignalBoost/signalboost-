// File: app/page.tsx
// The real homepage at signalboostapp.com (/).
// Phase F flip: the React concierge homepage is now the site's front door,
// replacing the old static public/index.html (kept as index.html.bak for
// instant rollback). Thin server component: scoped styles + client app.
//
// Unlike the /home-next preview route, this one IS indexable (no robots noindex)
// so search engines can crawl the homepage.

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
