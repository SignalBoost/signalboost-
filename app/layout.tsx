// File: app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { I18nProvider } from "@/components/i18n/I18nProvider";
import { Analytics } from "@vercel/analytics/react";

export const metadata: Metadata = {
  title: "SignalBoost",
  description:
    "SignalBoost — geo-aware offers and trusted partners across flights, hotels, eSIM, tours, marketplace and more.",
  metadataBase: new URL("https://www.signalboostapp.com"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <I18nProvider>{children}</I18nProvider>
        <Analytics />
      </body>
    </html>
  );
}
