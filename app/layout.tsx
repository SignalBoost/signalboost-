// File: app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

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
      <body>{children}</body>
    </html>
  );
}
