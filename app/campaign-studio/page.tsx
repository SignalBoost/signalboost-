import type { Metadata } from "next";
import CampaignStudioClient from "@/components/campaign-studio/CampaignStudioClient";

export const metadata: Metadata = {
  title: "Campaign Studio — your whole campaign from one prompt | SignalBoost",
  description:
    "Campaign Studio turns one brief into a finished, branded campaign — AI script, natural voiceover, and rendered video. Use it as a service, or license the portable engine for your own product.",
  alternates: { canonical: "https://www.signalboostapp.com/campaign-studio" },
  openGraph: {
    type: "website",
    url: "https://www.signalboostapp.com/campaign-studio",
    siteName: "SignalBoost",
    title: "Campaign Studio — your whole campaign from one prompt",
    description:
      "One brief in, a finished branded campaign out. Use it as a service, or license the portable engine.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "SignalBoost Campaign Studio" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Campaign Studio — your whole campaign from one prompt",
    description: "One brief in, a finished branded campaign out. Use it, or license the engine.",
    images: ["/og.png"],
  },
};

export default function CampaignStudioPage() {
  return <CampaignStudioClient />;
}
