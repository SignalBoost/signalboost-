// File: components/admin/AdminCockpit.tsx
// Project: SignalBoost (main production repo)

export default function AdminCockpit() {
  const panels = [
    { name: 'User Management', path: '/admin/users' },
    { name: 'System Logs', path: '/admin/logs' },
    { name: 'Telemetry', path: '/admin/telemetry' },
    { name: 'Settings', path: '/admin/settings' },
  ];

  return (
    <section className="bg-black text-white min-h-screen p-12">
      <h2 className="text-3xl font-bold mb-8">
        Admin <span className="text-green-400">Cockpit</span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {panels.map((panel) => (
          <a
            key={panel.name}
            href={panel.path}
            className="cockpit-panel"
          >
            {panel.name}
          </a>
        ))}
      </div>

      <style jsx>{`
        .cockpit-panel {
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 128, 0, 0.2);
          border: 1px solid #22c55e;
          border-radius: 12px;
          padding: 2rem;
          font-size: 1.25rem;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        .cockpit-panel:hover {
          background: rgba(34, 197, 94, 0.4);
          color: #22c55e;
        }
      `}</style>
    </section>
  );
}
