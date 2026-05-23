// File: app/admin/partners/add/page.tsx
// The daily "add a partner" form. Plain fields → posts to
// /api/admin/save-partner which handles auth + builds the JSON fields and
// writes to Supabase. No JSON, no dashboard, no redeploy.
//
// Login/admin is enforced by the API route (401/403); this page surfaces those
// messages. Self-contained styling (inline) to match the dark+gold theme
// without depending on home.css.

"use client";

import { useState } from "react";

const GOLD = "#f5c542";
const DARK = "#0d1117";
const PANEL = "#0f141b";
const CARD = "#111822";
const BORDER = "#1e2630";
const TEXT = "#e6edf3";
const MUTED = "#9aa8b8";

const CATEGORIES: { key: string; label: string }[] = [
  { key: "flights", label: "Flights" },
  { key: "hotels", label: "Hotels" },
  { key: "car_rentals", label: "Car Rentals" },
  { key: "esim", label: "eSIM / Connectivity" },
  { key: "tours", label: "Tours & Activities" },
  { key: "transfers", label: "Transfers" },
  { key: "insurance", label: "Insurance & Claims" },
  { key: "travel_services", label: "Travel Services" },
  { key: "marketplace", label: "Marketplace" },
  { key: "products_tools", label: "Products & Tools" },
  { key: "finance", label: "Finance" },
  { key: "health_fitness", label: "Health & Fitness" },
  { key: "sports_outdoors", label: "Sports & Outdoors" },
  { key: "specialty_other", label: "Specialty & Other" },
];

const NETWORKS = ["Awin", "Admitad", "Travelpayouts", "Amazon", "Other"];

const REGION_OPTIONS: { key: string; label: string }[] = [
  { key: "ot", label: "Worldwide (default)" },
  { key: "es-latam", label: "Mexico / Latin America" },
  { key: "us", label: "United States" },
  { key: "br", label: "Brazil" },
  { key: "pl", label: "Poland" },
  { key: "uk", label: "United Kingdom" },
  { key: "de", label: "Germany" },
  { key: "fr", label: "France" },
  { key: "it", label: "Italy" },
  { key: "ca", label: "Canada" },
  { key: "au", label: "Australia" },
  { key: "nz", label: "New Zealand" },
  { key: "ru", label: "Russia" },
  { key: "ar", label: "Argentina" },
  { key: "co", label: "Colombia" },
  { key: "pe", label: "Peru" },
];

export default function AddPartnerPage() {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("flights");
  const [network, setNetwork] = useState("Awin");
  const [description, setDescription] = useState("");
  const [tier, setTier] = useState(2);
  const [featured, setFeatured] = useState(false);
  const [regions, setRegions] = useState<string[]>(["ot"]);

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const toggleRegion = (key: string) => {
    setRegions((cur) =>
      cur.includes(key) ? cur.filter((r) => r !== key) : [...cur, key]
    );
  };

  const reset = () => {
    setName("");
    setUrl("");
    setDescription("");
    setTier(2);
    setFeatured(false);
    setRegions(["ot"]);
    setCategory("flights");
    setNetwork("Awin");
  };

  const save = async () => {
    setMsg(null);
    if (!name.trim() || !url.trim()) {
      setMsg({ type: "err", text: "Name and affiliate link are required." });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/save-partner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          url,
          category,
          network,
          description,
          tier,
          featured,
          regions: regions.length ? regions : ["ot"],
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) setMsg({ type: "err", text: "You need to log in first. Open /auth/login, then come back." });
        else if (res.status === 403) setMsg({ type: "err", text: "This account is not an admin." });
        else setMsg({ type: "err", text: data?.error || "Save failed." });
        return;
      }
      setMsg({ type: "ok", text: `Saved “${name}” ✓  (it will appear on the site shortly)` });
      reset();
    } catch {
      setMsg({ type: "err", text: "Network error. Try again." });
    } finally {
      setSaving(false);
    }
  };

  const label: React.CSSProperties = { display: "block", fontSize: 13, fontWeight: 700, color: MUTED, marginBottom: 6, textTransform: "uppercase", letterSpacing: ".04em" };
  const field: React.CSSProperties = { width: "100%", background: "#0a0f16", color: TEXT, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "11px 13px", fontSize: 15, outline: "none", fontFamily: "inherit" };
  const group: React.CSSProperties = { marginBottom: 18 };

  return (
    <div style={{ minHeight: "100vh", background: DARK, color: TEXT, fontFamily: "system-ui, sans-serif", padding: "32px 18px" }}>
      <div style={{ maxWidth: 620, margin: "0 auto" }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 6px", color: GOLD }}>Add a Partner</h1>
        <p style={{ color: MUTED, fontSize: 14, margin: "0 0 24px" }}>
          Fill this in and click Save. The partner goes live on the site — no code, no redeploy.
        </p>

        <div style={{ background: PANEL, border: `1px solid ${BORDER}`, borderRadius: 18, padding: 22 }}>
          <div style={group}>
            <label style={label}>Partner name *</label>
            <input style={field} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Booking.com" />
          </div>

          <div style={group}>
            <label style={label}>Affiliate link (URL) *</label>
            <input style={field} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://www.awin1.com/cread.php?awinmid=...&awinaffid=2834806" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, ...group }}>
            <div>
              <label style={label}>Category</label>
              <select style={field} value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((c) => (
                  <option key={c.key} value={c.key}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={label}>Network</label>
              <select style={field} value={network} onChange={(e) => setNetwork(e.target.value)}>
                {NETWORKS.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={group}>
            <label style={label}>Short description</label>
            <input style={field} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Book hotels worldwide with Booking.com." />
          </div>

          <div style={group}>
            <label style={label}>Regions it serves</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {REGION_OPTIONS.map((r) => {
                const on = regions.includes(r.key);
                return (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => toggleRegion(r.key)}
                    style={{
                      border: `1px solid ${on ? GOLD : BORDER}`,
                      background: on ? "rgba(245,197,66,.14)" : CARD,
                      color: on ? GOLD : TEXT,
                      borderRadius: 999,
                      padding: "8px 13px",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    {on ? "✓ " : ""}{r.label}
                  </button>
                );
              })}
            </div>
            <p style={{ color: MUTED, fontSize: 12, margin: "8px 0 0" }}>
              Tip: tap “Mexico / Latin America” so it shows for your local visitors. “Worldwide” is a safe default.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, ...group }}>
            <div>
              <label style={label}>Tier (1 = top)</label>
              <select style={field} value={tier} onChange={(e) => setTier(Number(e.target.value))}>
                <option value={1}>1 — Top</option>
                <option value={2}>2 — Standard</option>
                <option value={3}>3 — Minor</option>
              </select>
            </div>
            <div>
              <label style={label}>Featured?</label>
              <button
                type="button"
                onClick={() => setFeatured((f) => !f)}
                style={{ ...field, textAlign: "left", cursor: "pointer", color: featured ? GOLD : MUTED }}
              >
                {featured ? "★ Featured" : "☆ Not featured"}
              </button>
            </div>
          </div>

          {msg && (
            <div style={{
              margin: "4px 0 16px",
              padding: "11px 14px",
              borderRadius: 12,
              fontSize: 14,
              background: msg.type === "ok" ? "rgba(46,160,67,.14)" : "rgba(248,81,73,.14)",
              border: `1px solid ${msg.type === "ok" ? "rgba(46,160,67,.4)" : "rgba(248,81,73,.4)"}`,
              color: msg.type === "ok" ? "#7ee787" : "#ff7b72",
            }}>
              {msg.text}
            </div>
          )}

          <button
            onClick={save}
            disabled={saving}
            style={{
              width: "100%",
              border: 0,
              borderRadius: 13,
              background: saving ? "#7a6320" : `linear-gradient(135deg, ${GOLD}, #e9b738)`,
              color: "#1a1206",
              fontSize: 15,
              fontWeight: 800,
              padding: 14,
              cursor: saving ? "default" : "pointer",
              fontFamily: "inherit",
            }}
          >
            {saving ? "Saving…" : "Save partner"}
          </button>
        </div>

        <p style={{ color: MUTED, fontSize: 12, textAlign: "center", marginTop: 16 }}>
          Must be logged in as an admin. If you see a login error, open <span style={{ color: GOLD }}>/auth/login</span> first.
        </p>
      </div>
    </div>
  );
}
