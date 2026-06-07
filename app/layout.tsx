// File: app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { I18nProvider } from "@/components/i18n/I18nProvider";
import { Analytics } from "@vercel/analytics/react";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "SignalBoost",
  description:
    "SignalBoost — geo-aware offers and trusted partners across flights, hotels, eSIM, tours, marketplace and more.",
  metadataBase: new URL("https://www.signalboostapp.com"),
  // Canonical link — prevents duplicate-content issues
  alternates: {
    canonical: "https://www.signalboostapp.com",
  },
  // Open Graph — social sharing previews (no image)
  openGraph: {
    type: "website",
    url: "https://www.signalboostapp.com",
    siteName: "SignalBoost",
    title: "SignalBoost",
    description:
      "SignalBoost — geo-aware offers and trusted partners across flights, hotels, eSIM, tours, marketplace and more.",
  },
  // Twitter/X card
  twitter: {
    card: "summary",
    title: "SignalBoost",
    description:
      "SignalBoost — geo-aware offers and trusted partners across flights, hotels, eSIM, tours, marketplace and more.",
  },
};

// JSON-LD structured data (schema.org) — improves search rich results
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "SignalBoost",
  url: "https://www.signalboostapp.com",
  description:
    "SignalBoost — geo-aware offers and trusted partners across flights, hotels, eSIM, tours, marketplace and more.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <I18nProvider>
          <SiteHeader />
          {children}
        </I18nProvider>
        <Analytics />
      </body>
    </html>
  );
}
