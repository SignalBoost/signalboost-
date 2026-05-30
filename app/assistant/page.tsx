import Concierge from "@/components/Concierge";
import { CockpitShell } from "@/components/CockpitShell";

export const metadata = {
  title: "SignalBoost — Personal Assistant",
  description: "SignalBoost Concierge AI personal assistant for marketplace and SaaS operations.",
};

export default function Page() {
  return (
    <CockpitShell
      eyebrow="Concierge AI core"
      title="Persistent Concierge Intelligence"
      subtitle="A shared-agency assistant that understands, routes, refines, and keeps SaaS workflows moving."
    >
      <Concierge />
    </CockpitShell>
  );
}
