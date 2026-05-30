import Link from "next/link";
import type { CSSProperties } from "react";
import { saasModules } from "@/lib/saas-modules";

export default function ModuleGrid() {
  return (
    <section className="cockpit-section" aria-labelledby="modules-title">
      <div className="cockpit-section-heading">
        <p className="cockpit-eyebrow">SaaS modules</p>
        <h2 id="modules-title">Unified operating bays</h2>
        <p>Promote, support, schedule, analyze, and follow up without leaving the SignalBoost cockpit.</p>
      </div>
      <div className="module-grid">
        {saasModules.map((module) => (
          <Link className="module-card" href={module.href} key={module.slug} style={{ "--module-accent": module.accent } as CSSProperties}>
            <div className="module-card-topline">
              <span>{module.eyebrow}</span>
              <strong>{module.status}</strong>
            </div>
            <h3>{module.title}</h3>
            <p>{module.summary}</p>
            <div className="module-signal">{module.signal}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}
