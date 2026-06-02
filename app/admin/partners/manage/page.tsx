// File: app/admin/partners/manage/page.tsx
// Manage existing partners: list all, search, edit (pre-filled form that posts
// to the existing /api/admin/save-partner update path), and delete (with
// confirmation, via /api/admin/delete-partner). Admin-gated by those routes.
// Self-contained inline styling to match the dark+gold admin theme.
"use client";

import { useEffect, useMemo, useState } from "react";

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

type Partner = {
  id: string;
  name: string;
  category: string;
  category_key?: string;
  category_label?: string;
  network?: string | null;
  description?: string | null;
  tier: number;
  featured: boolean;
  url: string;
  regions: string[];
};

type Editing = {
  id: string;
  name: string;
  url: string;
  category: string;
  network: string;
  description: string;
  tier: number;
  featured: boolean;
  regions: string[];
};

export default function ManagePartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const [editing, setEditing] = useState<Editing | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function load() {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/admin/list-partners", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) setLoadError("You need to log in first. Open /auth/login, then come back.");
        else if (res.status === 403) setLoadError("This account is not an admin.");
        else setLoadError(data?.error || "Could not load partners.");
        setPartners([]);
        return;
      }
      setPartners(Array.isArray(data.partners) ? data.partners : []);
    } catch {
      setLoadError("Network error. Try again.");
      setPartners([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return partners;
    return partners.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.category_label || p.category || "").toLowerCase().includes(q) ||
        (p.network || "").toLowerCase().includes(q)
    );
  }, [partners, query]);

  function startEdit(p: Partner) {
    setMsg(null);
    setConfirmId(null);
    setEditing({
      id: p.id,
      name: p.name,
      url: p.url === "#" ? "" : p.url,
      category: p.category_key || p.category || "specialty_other",
      network: p.network || "Other",
      description: p.description || "",
      tier: p.tier || 2,
      featured: Boolean(p.featured),
      regions: p.regions && p.regions.length ? p.regions : ["ot"],
    });
  }

  function toggleRegion(key: string) {
    setEditing((cur) =>
      cur
        ? { ...cur, regions: cur.regions.includes(key) ? cur.regions.filter((r) => r !== key) : [...cur.regions, key] }
        : cur
    );
  }

  async function saveEdit() {
    if (!editing) return;
    setMsg(null);
    if (!editing.name.trim() || !editing.url.trim()) {
      setMsg({ type: "err", text: "Name and affiliate link are required." });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/save-partner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editing.id,
          name: editing.name,
          url: editing.url,
          category: editing.category,
          network: editing.network,
          description: editing.description,
          tier: editing.tier,
          featured: editing.featured,
          regions: editing.regions.length ? editing.regions : ["ot"],
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) setMsg({ type: "err", text: "You need to log in first." });
        else if (res.status === 403) setMsg({ type: "err", text: "This account is not an admin." });
        else setMsg({ type: "err", text: data?.error || "Save failed." });
        return;
      }
      setMsg({ type: "ok", text: `Saved “${editing.name}” ✓` });
      setEditing(null);
      await load();
    } catch {
      setMsg({ type: "err", text: "Network error. Try again." });
    } finally {
      setSaving(false);
    }
  }

  async function doDelete(id: string, name: string) {
    setMsg(null);
    setBusyId(id);
    try {
      const res = await fetch("/api/admin/delete-partner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) setMsg({ type: "err", text: "You need to log in first." });
        else if (res.status === 403) setMsg({ type: "err", text: "This account is not an admin." });
        else setMsg({ type: "err", text: data?.error || "Delete failed." });
        return;
      }
      setMsg({ type: "ok", text: `Deleted “${name}” ✓` });
      setConfirmId(null);
      setPartners((cur) => cur.filter((p) => p.id !== id));
    } catch {
      setMsg({ type: "err", text: "Network error. Try again." });
    } finally {
      setBusyId(null);
    }
  }

  const label: React.CSSProperties = { display: "block", fontSize: 13, fontWeight: 700, color: MUTED, marginBottom: 6, textTransform: "uppercase", letterSpacing: ".04em" };
  const field: React.CSSProperties = { width: "100%", background: "#0a0f16", color: TEXT, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "11px 13px", fontSize: 15, outline: "none", fontFamily: "inherit", boxSizing: "border-box" };
  const group: React.CSSProperties = { marginBottom: 16 };

  return (
    <div style={{ minHeight: "100vh", background: DARK, color: TEXT, fontFamily: "system-ui, sans-serif", padding: "32px 18px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <a href="/admin" style={{ color: MUTED, fontSize: 13, textDecoration: "none" }}>← Back to Admin</a>
        <h1 style={{ fontSize: 26, fontWeight: 800, margin: "10px 0 6px", color: GOLD }}>Manage Partners</h1>
        <p style={{ color: MUTED, fontSize: 14, margin: "0 0 22px" }}>
          Edit or delete existing partners. Changes go live on the site shortly — no code, no redeploy.
        </p>

        {msg && (
          <div style={{
            margin: "0 0 16px", padding: "11px 14px", borderRadius: 12, fontSize: 14,
            background: msg.type === "ok" ? "rgba(46,160,67,.14)" : "rgba(248,81,73,.14)",
            border: `1px solid ${msg.type === "ok" ? "rgba(46,160,67,.4)" : "rgba(248,81,73,.4)"}`,
            color: msg.type === "ok" ? "#7ee787" : "#ff7b72",
          }}>
            {msg.text}
          </div>
        )}

        {loading ? (
          <p style={{ color: MUTED }}>Loading partners…</p>
        ) : loadError ? (
          <div style={{ background: PANEL, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 20 }}>
            <p style={{ color: "#ff7b72", margin: 0 }}>{loadError}</p>
          </div>
        ) : (
          <>
            <input
              style={{ ...field, marginBottom: 18 }}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${partners.length} partners by name, category, or network…`}
            />

            {filtered.length === 0 ? (
              <p style={{ color: MUTED }}>No partners match “{query}”.</p>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                {filtered.map((p) => (
                  <div key={p.id} style={{ background: PANEL, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 18 }}>
                    {editing && editing.id === p.id ? (
                      <div>
                        <div style={group}>
                          <label style={label}>Partner name *</label>
                          <input style={field} value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
                        </div>
                        <div style={group}>
                          <label style={label}>Affiliate link (URL) *</label>
                          <input style={field} value={editing.url} onChange={(e) => setEditing({ ...editing, url: e.target.value })} />
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, ...group }}>
                          <div>
                            <label style={label}>Category</label>
                            <select style={field} value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })}>
                              {CATEGORIES.map((c) => (
                                <option key={c.key} value={c.key}>{c.label}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label style={label}>Network</label>
                            <select style={field} value={editing.network} onChange={(e) => setEditing({ ...editing, network: e.target.value })}>
                              {NETWORKS.map((n) => (
                                <option key={n} value={n}>{n}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div style={group}>
                          <label style={label}>Short description</label>
                          <input style={field} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
                        </div>
                        <div style={group}>
                          <label style={label}>Regions it serves</label>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                            {REGION_OPTIONS.map((r) => {
                              const on = editing.regions.includes(r.key);
                              return (
                                <button key={r.key} type="button" onClick={() => toggleRegion(r.key)}
                                  style={{ border: `1px solid ${on ? GOLD : BORDER}`, background: on ? "rgba(245,197,66,.14)" : CARD, color: on ? GOLD : TEXT, borderRadius: 999, padding: "8px 13px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                                  {on ? "✓ " : ""}{r.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, ...group }}>
                          <div>
                            <label style={label}>Tier (1 = top)</label>
                            <select style={field} value={editing.tier} onChange={(e) => setEditing({ ...editing, tier: Number(e.target.value) })}>
                              <option value={1}>1 — Top</option>
                              <option value={2}>2 — Standard</option>
                              <option value={3}>3 — Minor</option>
                            </select>
                          </div>
                          <div>
                            <label style={label}>Featured?</label>
                            <button type="button" onClick={() => setEditing({ ...editing, featured: !editing.featured })}
                              style={{ ...field, textAlign: "left", cursor: "pointer", color: editing.featured ? GOLD : MUTED }}>
                              {editing.featured ? "★ Featured" : "☆ Not featured"}
                            </button>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                          <button onClick={saveEdit} disabled={saving}
                            style={{ flex: 1, border: 0, borderRadius: 12, background: saving ? "#7a6320" : `linear-gradient(135deg, ${GOLD}, #e9b738)`, color: "#1a1206", fontSize: 14, fontWeight: 800, padding: 12, cursor: saving ? "default" : "pointer", fontFamily: "inherit" }}>
                            {saving ? "Saving…" : "Save changes"}
                          </button>
                          <button onClick={() => setEditing(null)} disabled={saving}
                            style={{ border: `1px solid ${BORDER}`, borderRadius: 12, background: CARD, color: TEXT, fontSize: 14, fontWeight: 700, padding: "12px 18px", cursor: "pointer", fontFamily: "inherit" }}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            <strong style={{ fontSize: 16, color: TEXT }}>{p.name}</strong>
                            {p.featured && <span style={{ color: GOLD, fontSize: 12, fontWeight: 800 }}>★ Featured</span>}
                          </div>
                          <div style={{ color: MUTED, fontSize: 13, marginTop: 4 }}>
                            {(p.category_label || p.category)}{p.network ? ` · ${p.network}` : ""} · tier {p.tier}
                          </div>
                        </div>
                        {confirmId === p.id ? (
                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <span style={{ color: "#ff7b72", fontSize: 13 }}>Delete?</span>
                            <button onClick={() => doDelete(p.id, p.name)} disabled={busyId === p.id}
                              style={{ border: 0, borderRadius: 10, background: "#b3261e", color: "#fff", fontSize: 13, fontWeight: 800, padding: "8px 14px", cursor: "pointer", fontFamily: "inherit" }}>
                              {busyId === p.id ? "Deleting…" : "Yes, delete"}
                            </button>
                            <button onClick={() => setConfirmId(null)}
                              style={{ border: `1px solid ${BORDER}`, borderRadius: 10, background: CARD, color: TEXT, fontSize: 13, fontWeight: 700, padding: "8px 14px", cursor: "pointer", fontFamily: "inherit" }}>
                              No
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: "flex", gap: 8 }}>
                            <button onClick={() => startEdit(p)}
                              style={{ border: `1px solid ${BORDER}`, borderRadius: 10, background: CARD, color: TEXT, fontSize: 13, fontWeight: 700, padding: "8px 14px", cursor: "pointer", fontFamily: "inherit" }}>
                              Edit
                            </button>
                            <button onClick={() => { setConfirmId(p.id); setMsg(null); }}
                              style={{ border: "1px solid rgba(248,81,73,.4)", borderRadius: 10, background: "rgba(248,81,73,.08)", color: "#ff7b72", fontSize: 13, fontWeight: 700, padding: "8px 14px", cursor: "pointer", fontFamily: "inherit" }}>
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
