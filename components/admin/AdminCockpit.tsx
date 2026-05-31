// File: components/admin/AdminCockpit.tsx
// Project: SignalBoost (main production repo)

export default function AdminCockpit() {
  const panels = [
    { name: "User Management", detail: "Role and access controls" },
    { name: "System Logs", detail: "Operational event stream" },
    { name: "Telemetry", detail: "Clicks, searches, campaigns, review volume, sentiment trends, and module health" },
    { name: "Reviews Moderation", detail: "27 queued items across Google, Yelp, Trustpilot, Facebook, TripAdvisor, app stores, and private feedback" },
    { name: "Settings", detail: "Production cockpit configuration" },
  ];

  return (
    <section className="cockpit-section admin-console" aria-label="Admin Console telemetry">
      {panels.map((panel) => (
        <article className="executive-panel" key={panel.name}>
          <span className="telemetry-label">Admin Console</span>
          <strong>{panel.name}</strong>
          <p>{panel.detail}</p>
        </article>
      ))}
    </section>
  );
}
