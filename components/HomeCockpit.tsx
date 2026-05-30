// File: components/home/HomeCockpit.tsx
// Project: SignalBoost (main production repo)

import Link from 'next/link';

export default function HomeCockpit() {
  return (
    <section className="bg-black text-white min-h-screen flex flex-col items-center justify-center p-12">
      <h1 className="text-4xl font-bold mb-8">
        <span className="text-white">signal</span>
        <span className="text-green-400">boost</span> Cockpit
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-8 w-full max-w-5xl">
        <Link href="/marketplace">
          <a className="cockpit-panel">Marketplace</a>
        </Link>
        <Link href="/promote">
          <a className="cockpit-panel">Promote Business</a>
        </Link>
        <Link href="/reviews">
          <a className="cockpit-panel">Reviews</a>
        </Link>
        <Link href="/calendar">
          <a className="cockpit-panel">Calendar</a>
        </Link>
        <Link href="/spreadsheets">
          <a className="cockpit-panel">Spreadsheets</a>
        </Link>
        <Link href="/outreach">
          <a className="cockpit-panel">Outreach</a>
        </Link>
        <Link href="/assistant">
          <a className="cockpit-panel">Personal Assistant</a>
        </Link>
        <Link href="/admin">
          <a className="cockpit-panel">Admin</a>
        </Link>
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
