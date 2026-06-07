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
  // 2. Canonical link — prevents duplicate-content issues
  alternates: {
    canonical: "https://www.signalboostapp.com",
  },
  // 1. Open Graph tags — rich social sharing previews
  openGraph: {
    type: "website",
    url: "https://www.signalboostapp.com",
    siteName: "SignalBoost",
    title: "SignalBoost",
    description:
      "SignalBoost — geo-aware offers and trusted partners across flights, hotels, eSIM, tours, marketplace and more.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SignalBoost",
      },
    ],
  },
  // Twitter/X card (uses the same OG image)
  twitter: {
    card: "summary_large_image",
    title: "SignalBoost",
    description:
      "SignalBoost — geo-aware offers and trusted partners across flights, hotels, eSIM, tours, marketplace and more.",
    images: ["/og-image.png"],
  },
};

// 3. JSON-LD structured data (schema.org) — improves search rich results
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
