"use client";

import { useRegion, REGIONS } from "@/lib/region";

// Small region selector for the header. Mirrors the language toggle's look via
// the same .language-switcher classes, so it sits naturally beside it.
export default function RegionToggle() {
  const [region, setRegion] = useRegion();

  return (
    <label className="language-switcher" aria-label="Select your region">
      <span className="language-switcher__label">Region</span>
      <select className="language-switcher__select" value={region} onChange={(event) => setRegion(event.target.value)}>
        {REGIONS.map((r) => (
          <option key={r.code} value={r.code}>{r.label}</option>
        ))}
      </select>
    </label>
  );
}
