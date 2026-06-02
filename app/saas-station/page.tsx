import Link from "next/link";
import ModuleGrid from "@/components/ModuleGrid";
import { CockpitShell } from "@/components/CockpitShell";

export const metadata = { title: "SaaS Station | SignalBoost" };

export default function SaasStationPage() {
  return (
    <CockpitShell
      eyebrow="SaaS Station"
      title="Run your growth operations from one station"
      subtitle="Launch Promote campaigns, manage operational spreadsheets, monitor reviews, coordinate calendars, and route work through the SignalBoost assistant."
    >
      <section className="cockpit-section concierge-band">
        <div>
          <p className="cockpit-eyebrow">Operational modules</p>
          <h2>Spreadsheets and Promote are live</h2>
          <p>Use typed sheets for real account data, then turn that data into campaign packages with editable UTM links and a saved campaign library.</p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link className="cockpit-primary" href="/spreadsheets">Open Spreadsheets</Link>
          <Link className="cockpit-secondary" href="/promote">Open Promote</Link>
        </div>
      </section>
      <ModuleGrid />
    </CockpitShell>
  );
}
