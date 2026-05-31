import MarketplaceClient from "@/components/MarketplaceClient";
import partners from "@/partners.json";

export const metadata = {
  title: "SignalBoost — Regional Partner Marketplace",
  description: "Browse SignalBoost affiliate partners with region-aware links and verified brand logos.",
};

export default function Page() {
  return <MarketplaceClient partners={partners} />;
}
