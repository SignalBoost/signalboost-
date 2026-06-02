"use client";

import { useEffect, useState, useCallback } from "react";

type Service = {
  id: string; name: string; slug: string; duration_minutes: number;
  price: number; currency: string; description: string; color: string; active: boolean;
};
type Availability = { day_of_week: number; start_time: string; end_time: string };
type Booking = {
  id: string; service_id: string; service_name?: string; service_price?: number;
  service_currency?: string; client_name: string; client_email: string;
  booking_date: string; booking_time: string; status: string; notes: string; created_at: string;
};
type BlockedDate = { id: string; blocked_date: string; reason: string };
type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

const gold = "#f5c542";
const goldDark = "#dfa837";
const bg = "#06060a";
const surface = "rgba(255,255,255,0.03)";
const border = "rgba(255,255,255,0.08)";
const textMuted = "rgba(255,255,255,0.4)";
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const COLORS = ["#f5c542", "#3b82f6", "#10b981", "#8b5cf6", "#ef4444", "#f97316", "#06b6d4"];

const inp: React.CSSProperties = {
  width: "100%", background: "rgba(255,255,255,0.06)", border: `1px solid ${border}`,
  borderRadius: 7, padding: "9px 12px", color: "#fff", fontFamily: "Outfit, sans-serif",
  fontSize: 14, boxSizing: "border-box", outline: "none",
};

function Btn({ onClick, disabled, children, variant = "default", small }: {
  onClick?: () => void; disabled?: boolean; children: React.ReactNode;
  variant?: "gold" | "green" | "red" | "blue" | "ghost" | "default"; small?: boolean;
}) {
  const map: Record<string, React.CSSProperties> = {
    gold:    { background: gold, color: "#000", border: "none" },
    green:   { background: "rgba(16,185,129,0.12)", color: "#34d399", border: "1px solid rgba(16,185,129,0.3)" },
    red:     { background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)" },
    blue:    { background: "rgba(59,130,246,0.12)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.3)" },
    ghost:   { background: "transparent", color: textMuted, border: `1px solid ${border}` },
    default: { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.75)", border: `1px solid ${border}` },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{
      ...map[variant], borderRadius: 7, padding: small ? "5px 10px" : "8px 16px",
      fontFamily: "Outfit, sans-serif", fontSize: small ? 12 : 13, fontWeight: 600,
      cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, whiteSpace: "nowrap",
    }}>{children}</button>
  );
}

const DEFAULT_AVAIL: { day: number; label: string; enabled: boolean; start: string; end: string }[] = [
  { day: 0, label: "Sunday",    enabled: false, start: "09:00", end: "17:00" },
  { day: 1, label: "Monday",    enabled: true,  start: "09:00", end: "17:00" },
  { day: 2, label: "Tuesday",   enabled: true,  start: "09:00", end: "17:00" },
  { day: 3, label: "Wednesday", enabled: true,  start: "09:00", end: "17:00" },
  { day: 4, label: "Thursday",  enabled: true,  start: "09:00", end: "17:00" },
  { day: 5, label: "Friday",    enabled: true,  start: "09:00", end: "17:00" },
  { day: 6, label: "Saturday",  enabled: false, start: "09:00", end: "17:00" },
];

export default function CalendarDashboard({ userId: _userId }: { userId: string }) {
  const [tab, setTab] = useState<"services" | "bookings" | "blocked">("services");
  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [blocked, setBlocked] = useState<BlockedDate[]>([]);
  const [counts, setCounts] = useState({ pending: 0, confirmed: 0, completed: 0, cancelled: 0 });
  const [revenue, setRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  // Services tab
  const [selectedSvcId, setSelectedSvcId] = useState<string | null>(null);
  const [showAddSvc, setShowAddSvc] = useState(false);
  const [avail, setAvail] = useState(DEFAULT_AVAIL.map(d => ({ ...d })));
  const [savingAvail, setSavingAvail] = useState(false);

  // Service form
  const [svcName, setSvcName] = useState("");
  const [svcDuration, setSvcDuration] = useState("60");
  const [svcPrice, setSvcPrice] = useState("0");
  const [svcCurrency, setSvcCurrency] = useState("USD");
  const [svcDesc, setSvcDesc] = useState("");
  const [svcColor, setSvcColor] = useState(COLORS[0]);
  const [savingSvc, setSavingSvc] = useState(false);

  // Bookings tab
  const [bkgFilter, setBkgFilter] = useState<BookingStatus>("pending");
  const [actioningId, setActioningId] = useState<string | null>(null);

  // Blocked dates
  const [newBlockDate, setNewBlockDate] = useState("");
  const [newBlockReason, setNewBlockReason] = useState("");
  const [addingBlock, setAddingBlock] = useState(false);

  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    try {
      const [sRes, bRes, blRes] = await Promise.all([
        fetch("/api/calendar/services"),
        fetch("/api/calendar/bookings"),
        fetch("/api/calendar/blocked"),
      ]);
      if (sRes.ok) { const d = await sRes.json(); setServices(d.services || []); }
      if (bRes.ok) { const d = await bRes.json(); setBookings(d.bookings || []); setCounts(d.counts || {}); setRevenue(d.revenue || 0); }
      if (blRes.ok) { const d = await blRes.json(); setBlocked(d.blocked || []); }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const selectedSvc = services.find(s => s.id === selectedSvcId) || null;

  async function loadAvailability(serviceId: string) {
    const res = await fetch(`/api/calendar/availability?serviceId=${serviceId}`);
    if (!res.ok) return;
    const data = await res.json();
    const loaded: Availability[] = data.availability || [];
    setAvail(DEFAULT_AVAIL.map(d => {
      const found = loaded.find(a => a.day_of_week === d.day);
      return { ...d, enabled: !!found, start: found?.start_time || "09:00", end: found?.end_time || "17:00" };
    }));
  }

  async function handleSelectService(id: string) {
    setSelectedSvcId(id);
    setShowAddSvc(false);
    await loadAvailability(id);
  }

  function resetSvcForm() {
    setSvcName(""); setSvcDuration("60"); setSvcPrice("0");
    setSvcCurrency("USD"); setSvcDesc(""); setSvcColor(COLORS[0]);
  }

  function populateSvcForm(svc: Service) {
    setSvcName(svc.name); setSvcDuration(String(svc.duration_minutes));
    setSvcPrice(String(svc.price)); setSvcCurrency(svc.currency);
    setSvcDesc(svc.description); setSvcColor(svc.color);
  }

  async function handleSaveService() {
    if (!svcName.trim()) return;
    setSavingSvc(true);
    try {
      if (selectedSvc) {
        await fetch("/api/calendar/services", {
          method: "PUT", headers: { "content-type": "application/json" },
          body: JSON.stringify({ serviceId: selectedSvc.id, name: svcName, duration_minutes: parseInt(svcDuration), price: parseFloat(svcPrice), currency: svcCurrency, description: svcDesc, color: svcColor }),
        });
      } else {
        const res = await fetch("/api/calendar/services", {
          method: "POST", headers: { "content-type": "application/json" },
          body: JSON.stringify({ name: svcName, duration_minutes: parseInt(svcDuration), price: parseFloat(svcPrice), currency: svcCurrency, description: svcDesc, color: svcColor }),
        });
        const data = await res.json();
        if (data.service) { setSelectedSvcId(data.service.id); setShowAddSvc(false); }
      }
      await load();
      setNotice("Service saved.");
    } finally {
      setSavingSvc(false);
    }
  }

  async function handleToggleActive(svc: Service) {
    await fetch("/api/calendar/services", {
      method: "PUT", headers: { "content-type": "application/json" },
      body: JSON.stringify({ serviceId: svc.id, active: !svc.active }),
    });
    await load();
  }

  async function handleDeleteService(svc: Service) {
    if (!confirm(`Delete "${svc.name}"? This will also delete all its bookings.`)) return;
    await fetch("/api/calendar/services", {
      method: "DELETE", headers: { "content-type": "application/json" },
      body: JSON.stringify({ serviceId: svc.id }),
    });
    setSelectedSvcId(null);
    await load();
  }

  async function handleSaveAvailability() {
    if (!selectedSvcId) return;
    setSavingAvail(true);
    const slots = avail.filter(d => d.enabled).map(d => ({ day_of_week: d.day, start_time: d.start, end_time: d.end }));
    await fetch("/api/calendar/availability", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ serviceId: selectedSvcId, slots }),
    });
    setSavingAvail(false);
    setNotice("Availability saved.");
  }

  async function handleBookingAction(booking: Booking, status: BookingStatus) {
    setActioningId(booking.id);
    await fetch("/api/calendar/bookings", {
      method: "PUT", headers: { "content-type": "application/json" },
      body: JSON.stringify({
        bookingId: booking.id, status,
        clientEmail: booking.client_email, clientName: booking.client_name,
        serviceName: booking.service_name, bookingDate: booking.booking_date,
        bookingTime: booking.booking_time, currency: booking.service_currency,
        price: booking.service_price,
      }),
    });
    setActioningId(null);
    await load();
    setNotice(status === "confirmed" ? `Confirmed — confirmation email sent to ${booking.client_email}` : `Booking marked as ${status}.`);
  }

  async function handleAddBlock() {
    if (!newBlockDate) return;
    setAddingBlock(true);
    await fetch("/api/calendar/blocked", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ date: newBlockDate, reason: newBlockReason }),
    });
    setNewBlockDate(""); setNewBlockReason("");
    setAddingBlock(false);
    await load();
  }

  async function handleRemoveBlock(id: string) {
    await fetch("/api/calendar/blocked", {
      method: "DELETE", headers: { "content-type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await load();
  }

  const visibleBookings = bookings.filter(b => b.status === bkgFilter);
  const bookingLink = (svc: Service) => `https://signalboostapp.com/book/${svc.slug}`;

  if (loading) {
    return <div style={{ minHeight: "100vh", background: bg, display: "flex", alignItems: "center", justifyContent: "center", color: textMuted, fontFamily: "Outfit, sans-serif" }}>Loading…</div>;
  }

  return (
    <div style={{ minHeight: "100vh", background: bg, fontFamily: "Outfit, sans-serif", color: "#fff", display: "flex", flexDirection: "column" }}>

      {/* Header */}
      <div style={{ borderBottom: `1px solid ${border}`, padding: "20px 28px 16px", flexShrink: 0 }}>
        <p style={{ color: gold, fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", margin: "0 0 4px", textTransform: "uppercase" }}>SignalBoost</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <h1 style={{ fontFamily: "Fraunces, serif", fontSize: 30, fontWeight: 700, margin: 0 }}>Calendar</h1>
          <div style={{ display: "flex", gap: 16, fontSize: 13, color: textMuted }}>
            <span>📋 <strong style={{ color: "#fff" }}>{counts.pending}</strong> pending</span>
            <span>✓ <strong style={{ color: "#fff" }}>{counts.confirmed}</strong> confirmed</span>
            {revenue > 0 && <span>💰 <strong style={{ color: gold }}>${revenue.toFixed(2)}</strong> revenue</span>}
          </div>
        </div>
        {notice && (
          <div style={{ marginTop: 10, fontSize: 13, color: gold, display: "flex", gap: 8, alignItems: "center" }}>
            {notice} <button onClick={() => setNotice("")} style={{ background: "none", border: "none", color: textMuted, cursor: "pointer" }}>×</button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: `1px solid ${border}`, display: "flex", padding: "0 28px", flexShrink: 0 }}>
        {(["services", "bookings", "blocked"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            background: "none", border: "none", borderBottom: tab === t ? `2px solid ${gold}` : "2px solid transparent",
            color: tab === t ? gold : textMuted, fontFamily: "Outfit, sans-serif", fontSize: 13,
            fontWeight: tab === t ? 700 : 400, padding: "12px 20px 14px", cursor: "pointer", textTransform: "capitalize",
          }}>
            {t === "bookings" ? `Bookings (${counts.pending + counts.confirmed})` : t === "blocked" ? `Blocked Dates (${blocked.length})` : "Services"}
          </button>
        ))}
      </div>

      {/* Body */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden", minHeight: 0 }}>

        {/* ── SERVICES TAB ── */}
        {tab === "services" && (
          <>
            {/* Left: service list */}
            <div style={{ width: 280, flexShrink: 0, borderRight: `1px solid ${border}`, display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <div style={{ padding: 14, borderBottom: `1px solid ${border}` }}>
                <Btn onClick={() => { setShowAddSvc(true); setSelectedSvcId(null); resetSvcForm(); }} variant="gold">+ New Service</Btn>
              </div>
              <div style={{ overflowY: "auto", flex: 1 }}>
                {services.length === 0 ? (
                  <div style={{ padding: "24px 16px", color: textMuted, fontSize: 13, textAlign: "center" }}>No services yet. Create your first one.</div>
                ) : services.map(svc => (
                  <div key={svc.id} onClick={() => { handleSelectService(svc.id); populateSvcForm(svc); }}
                    style={{ padding: "12px 16px", cursor: "pointer", borderBottom: `1px solid ${border}`, borderLeft: selectedSvcId === svc.id ? `3px solid ${gold}` : "3px solid transparent", background: selectedSvcId === svc.id ? "rgba(245,197,66,0.05)" : "transparent" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: svc.color, flexShrink: 0 }} />
                      <span style={{ fontWeight: 600, fontSize: 14, flex: 1 }}>{svc.name}</span>
                      {!svc.active && <span style={{ fontSize: 10, color: textMuted, background: "rgba(255,255,255,0.06)", padding: "2px 6px", borderRadius: 4 }}>PAUSED</span>}
                    </div>
                    <div style={{ fontSize: 12, color: textMuted, marginTop: 3, paddingLeft: 16 }}>
                      {svc.duration_minutes} min
                      {Number(svc.price) > 0 ? ` · ${svc.currency} ${Number(svc.price).toFixed(2)}` : " · Free"}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: service editor */}
            <div style={{ flex: 1, overflowY: "auto", padding: "28px 32px" }}>
              {!selectedSvc && !showAddSvc && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "50%", color: textMuted, textAlign: "center", gap: 10 }}>
                  <div style={{ fontSize: 40, opacity: 0.3 }}>📅</div>
                  <p style={{ margin: 0, fontSize: 15, color: "rgba(255,255,255,0.3)", fontWeight: 600 }}>Select a service or create one</p>
                  <p style={{ margin: 0, fontSize: 13 }}>Each service gets a public booking page<br />clients can use to schedule with you.</p>
                </div>
              )}

              {(selectedSvc || showAddSvc) && (
                <div style={{ maxWidth: 580 }}>
                  <h2 style={{ fontFamily: "Fraunces, serif", fontSize: 22, fontWeight: 700, marginBottom: 24 }}>
                    {showAddSvc ? "New Service" : "Edit Service"}
                  </h2>

                  {/* Service form */}
                  <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 12, padding: 24, marginBottom: 24 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                      <div style={{ gridColumn: "1 / -1" }}>
                        <label style={{ fontSize: 11, color: textMuted, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.08em" }}>Service Name *</label>
                        <input value={svcName} onChange={e => setSvcName(e.target.value)} placeholder="e.g. Strategy Consultation" style={inp} />
                      </div>
                      <div>
                        <label style={{ fontSize: 11, color: textMuted, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.08em" }}>Duration (minutes)</label>
                        <input type="number" value={svcDuration} onChange={e => setSvcDuration(e.target.value)} min="15" step="15" style={inp} />
                      </div>
                      <div>
                        <label style={{ fontSize: 11, color: textMuted, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.08em" }}>Price</label>
                        <div style={{ display: "flex", gap: 8 }}>
                          <select value={svcCurrency} onChange={e => setSvcCurrency(e.target.value)}
                            style={{ ...inp, width: "auto", paddingRight: 8 }}>
                            {["USD", "EUR", "GBP", "MXN", "BRL", "PLN"].map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                          <input type="number" value={svcPrice} onChange={e => setSvcPrice(e.target.value)} min="0" step="0.01" placeholder="0.00" style={inp} />
                        </div>
                      </div>
                      <div style={{ gridColumn: "1 / -1" }}>
                        <label style={{ fontSize: 11, color: textMuted, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.08em" }}>Description</label>
                        <textarea value={svcDesc} onChange={e => setSvcDesc(e.target.value)} rows={2} placeholder="What clients should expect" style={{ ...inp, resize: "vertical", lineHeight: 1.6 } as React.CSSProperties} />
                      </div>
                      <div>
                        <label style={{ fontSize: 11, color: textMuted, display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>Color</label>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          {COLORS.map(c => (
                            <button key={c} onClick={() => setSvcColor(c)} style={{ width: 28, height: 28, borderRadius: "50%", background: c, border: svcColor === c ? "3px solid #fff" : "2px solid transparent", cursor: "pointer" }} />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <Btn onClick={handleSaveService} disabled={savingSvc || !svcName.trim()} variant="gold">
                        {savingSvc ? "Saving…" : selectedSvc ? "Save Changes" : "Create Service"}
                      </Btn>
                      {selectedSvc && <Btn onClick={() => handleToggleActive(selectedSvc)} variant="ghost">{selectedSvc.active ? "Pause" : "Reactivate"}</Btn>}
                      {selectedSvc && <Btn onClick={() => handleDeleteService(selectedSvc)} variant="red">Delete</Btn>}
                    </div>
                  </div>

                  {/* Booking link (only for saved services) */}
                  {selectedSvc && (
                    <div style={{ background: "rgba(245,197,66,0.04)", border: `1px solid rgba(245,197,66,0.15)`, borderRadius: 10, padding: 16, marginBottom: 24 }}>
                      <p style={{ fontSize: 11, color: textMuted, margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.1em" }}>Public Booking Link</p>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <code style={{ flex: 1, fontSize: 12, color: gold, wordBreak: "break-all" }}>{bookingLink(selectedSvc)}</code>
                        <Btn small onClick={() => { navigator.clipboard.writeText(bookingLink(selectedSvc)); setNotice("Link copied!"); }} variant="ghost">Copy</Btn>
                      </div>
                    </div>
                  )}

                  {/* Availability editor (only for saved services) */}
                  {selectedSvc && (
                    <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 12, padding: 24 }}>
                      <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 18px" }}>Weekly Availability</h3>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {avail.map((day, i) => (
                          <div key={day.day} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: i < 6 ? `1px solid ${border}` : "none" }}>
                            <input type="checkbox" checked={day.enabled} onChange={e => {
                              const copy = [...avail]; copy[i] = { ...copy[i], enabled: e.target.checked }; setAvail(copy);
                            }} style={{ width: 16, height: 16, cursor: "pointer", accentColor: gold }} />
                            <span style={{ width: 80, fontSize: 14, color: day.enabled ? "#fff" : textMuted }}>{DAYS[day.day]}</span>
                            {day.enabled ? (
                              <>
                                <input type="time" value={day.start} onChange={e => { const c = [...avail]; c[i] = { ...c[i], start: e.target.value }; setAvail(c); }}
                                  style={{ ...inp, width: "auto", fontSize: 13 }} />
                                <span style={{ color: textMuted, fontSize: 13 }}>to</span>
                                <input type="time" value={day.end} onChange={e => { const c = [...avail]; c[i] = { ...c[i], end: e.target.value }; setAvail(c); }}
                                  style={{ ...inp, width: "auto", fontSize: 13 }} />
                                <span style={{ fontSize: 12, color: textMuted }}>
                                  {(() => {
                                    const toM = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
                                    const mins = toM(day.end) - toM(day.start);
                                    return mins > 0 ? `${Math.floor(mins / 60)}h${mins % 60 ? ` ${mins % 60}m` : ""}` : "";
                                  })()}
                                </span>
                              </>
                            ) : (
                              <span style={{ fontSize: 13, color: textMuted }}>Unavailable</span>
                            )}
                          </div>
                        ))}
                      </div>
                      <div style={{ marginTop: 18 }}>
                        <Btn onClick={handleSaveAvailability} disabled={savingAvail} variant="gold">
                          {savingAvail ? "Saving…" : "Save Availability"}
                        </Btn>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* ── BOOKINGS TAB ── */}
        {tab === "bookings" && (
          <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px" }}>
            {/* Status filter */}
            <div style={{ display: "flex", gap: 6, marginBottom: 24, flexWrap: "wrap" }}>
              {(["pending", "confirmed", "completed", "cancelled"] as BookingStatus[]).map(s => (
                <button key={s} onClick={() => setBkgFilter(s)} style={{
                  background: bkgFilter === s ? "rgba(245,197,66,0.12)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${bkgFilter === s ? "rgba(245,197,66,0.4)" : border}`,
                  color: bkgFilter === s ? gold : textMuted,
                  borderRadius: 20, padding: "6px 16px", fontFamily: "Outfit, sans-serif",
                  fontSize: 13, fontWeight: bkgFilter === s ? 700 : 400, cursor: "pointer", textTransform: "capitalize",
                }}>
                  {s} ({counts[s] || 0})
                </button>
              ))}
            </div>

            {visibleBookings.length === 0 ? (
              <div style={{ textAlign: "center", color: textMuted, padding: "48px 0", fontSize: 14 }}>
                No {bkgFilter} bookings.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 680 }}>
                {visibleBookings.map(b => {
                  const dateStr = new Date(b.booking_date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
                  const isActioning = actioningId === b.id;
                  return (
                    <div key={b.id} style={{ background: surface, border: `1px solid ${border}`, borderRadius: 12, padding: 20 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
                        <div>
                          <p style={{ margin: "0 0 2px", fontWeight: 700, fontSize: 15 }}>{b.client_name}</p>
                          <p style={{ margin: 0, fontSize: 13, color: textMuted }}>{b.client_email}</p>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <p style={{ margin: "0 0 2px", fontWeight: 600, fontSize: 14, color: gold }}>{dateStr} · {b.booking_time}</p>
                          <p style={{ margin: 0, fontSize: 13, color: textMuted }}>{b.service_name}</p>
                        </div>
                      </div>
                      {b.notes && <p style={{ margin: "0 0 12px", fontSize: 13, color: "rgba(255,255,255,0.6)", background: "rgba(255,255,255,0.03)", padding: "8px 12px", borderRadius: 6 }}>{b.notes}</p>}
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {b.status === "pending" && (
                          <>
                            <Btn onClick={() => handleBookingAction(b, "confirmed")} disabled={isActioning} variant="green">
                              {isActioning ? "…" : "✓ Confirm & Email Client"}
                            </Btn>
                            <Btn onClick={() => handleBookingAction(b, "cancelled")} disabled={isActioning} variant="red">
                              {isActioning ? "…" : "Decline"}
                            </Btn>
                          </>
                        )}
                        {b.status === "confirmed" && (
                          <>
                            <Btn onClick={() => handleBookingAction(b, "completed")} disabled={isActioning} variant="default">
                              {isActioning ? "…" : "Mark Completed"}
                            </Btn>
                            <Btn onClick={() => handleBookingAction(b, "cancelled")} disabled={isActioning} variant="red">
                              {isActioning ? "…" : "Cancel & Email Client"}
                            </Btn>
                          </>
                        )}
                        {(b.status === "completed" || b.status === "cancelled") && (
                          <span style={{ fontSize: 12, color: textMuted, padding: "6px 0" }}>{b.status === "completed" ? "✓ Completed" : "✗ Cancelled"}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── BLOCKED DATES TAB ── */}
        {tab === "blocked" && (
          <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px" }}>
            <div style={{ maxWidth: 500 }}>
              <p style={{ color: textMuted, fontSize: 14, marginBottom: 24 }}>
                Blocked dates are hidden from all booking pages. Use these for holidays, vacations, or any days you're unavailable.
              </p>

              {/* Add form */}
              <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 12, padding: 20, marginBottom: 28 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 16px" }}>Block a Date</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12, marginBottom: 14 }}>
                  <div>
                    <label style={{ fontSize: 11, color: textMuted, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.08em" }}>Date *</label>
                    <input type="date" value={newBlockDate} onChange={e => setNewBlockDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]} style={{ ...inp, colorScheme: "dark" }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: textMuted, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.08em" }}>Reason (optional)</label>
                    <input value={newBlockReason} onChange={e => setNewBlockReason(e.target.value)} placeholder="e.g. Holiday, vacation…" style={inp} />
                  </div>
                </div>
                <Btn onClick={handleAddBlock} disabled={addingBlock || !newBlockDate} variant="gold">
                  {addingBlock ? "Blocking…" : "Block Date"}
                </Btn>
              </div>

              {/* Blocked list */}
              <h3 style={{ fontSize: 13, fontWeight: 700, color: textMuted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>
                Upcoming Blocked Dates ({blocked.length})
              </h3>
              {blocked.length === 0 ? (
                <p style={{ color: textMuted, fontSize: 14 }}>No blocked dates. All available days are open for booking.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {blocked.map(bd => (
                    <div key={bd.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: surface, border: `1px solid ${border}`, borderRadius: 8, padding: "12px 16px" }}>
                      <div>
                        <span style={{ fontWeight: 600, fontSize: 14 }}>
                          {new Date(bd.blocked_date + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                        </span>
                        {bd.reason && <span style={{ fontSize: 13, color: textMuted, marginLeft: 10 }}>— {bd.reason}</span>}
                      </div>
                      <Btn small onClick={() => handleRemoveBlock(bd.id)} variant="ghost">Remove</Btn>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
