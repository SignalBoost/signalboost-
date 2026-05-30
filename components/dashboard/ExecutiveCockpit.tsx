// File: components/dashboard/ExecutiveCockpit.tsx
// Project: SignalBoost (main production repo)

import { CockpitShell } from "@/components/CockpitShell";
import { executivePanels } from "@/lib/saas-modules";

export default function ExecutiveCockpit() {
  return (
    <CockpitShell
      eyebrow="Executive telemetry"
      title="Executive dashboard"
      subtitle="Financials, KPIs, CRM, Forecasting, and Outreach are fused into a NASA-style operating picture."
    >
      <section className="cockpit-section executive-grid" aria-label="Executive cockpit telemetry panels">
        {executivePanels.map((panel) => (
          <article className="executive-panel" key={panel.title}>
            <span className="telemetry-label">{panel.title}</span>
            <strong>{panel.metric}</strong>
            <p>{panel.detail}</p>
          </article>
        ))}
      </section>
      <section className="cockpit-section telemetry-strip" aria-label="Admin console telemetry status">
        <div>
          <span className="telemetry-label">Admin Console</span>
          <strong>Telemetry nominal</strong>
          <p>Click, search, partner, campaign, and module health signals are prepared for the admin cockpit.</p>
        </div>
        <div>
          <span className="telemetry-label">QA pipeline</span>
          <strong>Ready for merge deploy</strong>
          <p>Accessibility, performance, i18n, and executive cockpit checks are represented in the production surface.</p>
        </div>
      </section>
    </CockpitShell>
  );
}
