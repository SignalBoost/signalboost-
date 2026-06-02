"use client";

import { useState } from "react";

type Service = {
  id: string;
  name: string;
  slug: string;
  duration_minutes: number;
  price: number;
  currency: string;
  description: string;
  color: string;
};

const bg = "#06060a";
const border = "rgba(255,255,255,0.08)";
const textMuted = "rgba(255,255,255,0.45)";
const gold = "#f5c542";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];

function inp(extra?: React.CSSProperties): React.CSSProperties {
  return {
    width: "100%", background: "rgba(255,255,255,0.06)", border: `1px solid ${border}`,
    borderRadius: 8, padding: "10px 14px", color: "#fff", fontFamily: "Outfit, sans-serif",
    fontSize: 15, boxSizing: "border-box", outline: "none", ...extra,
  };
}

export default function BookingClient({ service, availableDays }: { service: Service; availableDays: number[] }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [step, setStep] = useState<"date" | "time" | "info" | "done">("date");
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const availableDaySet = new Set(availableDays);

  function buildCalendar() {
    const firstDay = new Date(calYear, calMonth, 1).getDay();
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
  }

  function isDateAvailable(day: number): boolean {
    const date = new Date(calYear, calMonth, day);
    if (date < today) return false;
    return availableDaySet.has(date.getDay());
  }

  function formatDate(day: number): string {
    const m = String(calMonth + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${calYear}-${m}-${d}`;
  }

  async function handleSelectDate(day: number) {
    const dateStr = formatDate(day);
    setSelectedDate(dateStr);
    setSelectedTime("");
    setLoadingSlots(true);
    setStep("time");
    try {
      const res = await fetch(`/api/calendar/slots?serviceId=${service.id}&date=${dateStr}`);
      const data = await res.json();
      setSlots(data.slots || []);
    } catch {
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }

  function handleSelectTime(time: string) {
    setSelectedTime(time);
    setStep("info");
  }

  async function handleSubmit() {
    if (!clientName.trim() || !clientEmail.trim()) { setError("Name and email are required."); return; }
    if (!clientEmail.includes("@")) { setError("Please enter a valid email."); return; }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/calendar/book", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          serviceId: service.id,
          clientName, clientEmail,
          bookingDate: selectedDate,
          bookingTime: selectedTime,
          notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Booking failed");
      setStep("done");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Booking failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const cells = buildCalendar();
  const formattedSelected = selectedDate
    ? new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
    : "";

  return (
    <div style={{ minHeight: "100vh", background: bg, fontFamily: "Outfit, sans-serif", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 20px 80px" }}>

      {/* Service header */}
      <div style={{ width: "100%", maxWidth: 480, marginBottom: 32 }}>
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: service.color, marginBottom: 12 }} />
        <h1 style={{ fontFamily: "Fraunces, serif", fontSize: 32, fontWeight: 700, margin: "0 0 6px" }}>{service.name}</h1>
        <div style={{ display: "flex", gap: 16, color: textMuted, fontSize: 14 }}>
          <span>⏱ {service.duration_minutes} min</span>
          {Number(service.price) > 0 && <span>💳 {service.currency} {Number(service.price).toFixed(2)}</span>}
        </div>
        {service.description && <p style={{ marginTop: 10, fontSize: 14, color: "rgba(255,255,255,0.65)", lineHeight: 1.6 }}>{service.description}</p>}
      </div>

      {/* Progress */}
      <div style={{ width: "100%", maxWidth: 480, display: "flex", gap: 8, marginBottom: 28 }}>
        {(["date", "time", "info"] as const).map((s, i) => (
          <div key={s} style={{ flex: 1, height: 3, borderRadius: 2, background: ["date", "time", "info", "done"].indexOf(step) >= i ? service.color : "rgba(255,255,255,0.1)", transition: "background 0.3s" }} />
        ))}
      </div>

      <div style={{ width: "100%", maxWidth: 480 }}>

        {/* Step: Done */}
        {step === "done" && (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
            <h2 style={{ fontFamily: "Fraunces, serif", fontSize: 26, fontWeight: 700, marginBottom: 8 }}>Booking Request Received</h2>
            <p style={{ color: textMuted, fontSize: 15, lineHeight: 1.6 }}>
              We received your request for <strong>{service.name}</strong> on <strong>{formattedSelected}</strong> at <strong>{selectedTime}</strong>.
              <br />A confirmation email has been sent to <strong>{clientEmail}</strong>.
              <br /><br />We'll confirm your booking shortly.
            </p>
          </div>
        )}

        {/* Step: Pick date */}
        {step === "date" && (
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: textMuted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>Select a date</p>
            <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${border}`, borderRadius: 12, padding: 20 }}>
              {/* Month nav */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <button
                  onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); } else setCalMonth(m => m - 1); }}
                  style={{ background: "none", border: "none", color: textMuted, fontSize: 20, cursor: "pointer", padding: "0 8px" }}>‹</button>
                <span style={{ fontWeight: 600, fontSize: 15 }}>{MONTH_NAMES[calMonth]} {calYear}</span>
                <button
                  onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); } else setCalMonth(m => m + 1); }}
                  style={{ background: "none", border: "none", color: "#fff", fontSize: 20, cursor: "pointer", padding: "0 8px" }}>›</button>
              </div>
              {/* Day labels */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 8 }}>
                {DAY_NAMES.map((d) => (
                  <div key={d} style={{ textAlign: "center", fontSize: 11, color: textMuted, fontWeight: 600, padding: "4px 0" }}>{d}</div>
                ))}
              </div>
              {/* Date cells */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
                {cells.map((day, i) => {
                  if (!day) return <div key={i} />;
                  const available = isDateAvailable(day);
                  const dateStr = formatDate(day);
                  const isSelected = dateStr === selectedDate;
                  return (
                    <button
                      key={i}
                      onClick={() => available && handleSelectDate(day)}
                      disabled={!available}
                      style={{
                        aspectRatio: "1", borderRadius: 8, border: "none", fontSize: 13, fontWeight: 500,
                        background: isSelected ? service.color : available ? "rgba(255,255,255,0.06)" : "transparent",
                        color: isSelected ? "#000" : available ? "#fff" : "rgba(255,255,255,0.2)",
                        cursor: available ? "pointer" : "default",
                        fontFamily: "Outfit, sans-serif",
                      }}
                    >{day}</button>
                  );
                })}
              </div>
            </div>
            <p style={{ fontSize: 12, color: textMuted, marginTop: 12, textAlign: "center" }}>
              Highlighted dates have availability. Grayed dates are unavailable.
            </p>
          </div>
        )}

        {/* Step: Pick time */}
        {step === "time" && (
          <div>
            <button onClick={() => setStep("date")} style={{ background: "none", border: "none", color: textMuted, cursor: "pointer", fontSize: 13, marginBottom: 16, padding: 0 }}>
              ← {formattedSelected}
            </button>
            <p style={{ fontSize: 13, fontWeight: 700, color: textMuted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>Select a time</p>
            {loadingSlots ? (
              <p style={{ color: textMuted, fontSize: 14 }}>Loading available times…</p>
            ) : slots.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 0" }}>
                <p style={{ color: textMuted, marginBottom: 16 }}>No available slots on this date.</p>
                <button onClick={() => setStep("date")} style={{ background: gold, color: "#000", border: "none", borderRadius: 8, padding: "10px 20px", fontFamily: "Outfit, sans-serif", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                  Choose another date
                </button>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                {slots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => handleSelectTime(slot)}
                    style={{
                      padding: "12px 8px", border: `1px solid ${border}`, borderRadius: 8,
                      background: selectedTime === slot ? service.color : "rgba(255,255,255,0.04)",
                      color: selectedTime === slot ? "#000" : "#fff",
                      fontFamily: "Outfit, sans-serif", fontSize: 14, fontWeight: 600, cursor: "pointer",
                    }}
                  >{slot}</button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step: Contact info */}
        {step === "info" && (
          <div>
            <button onClick={() => setStep("time")} style={{ background: "none", border: "none", color: textMuted, cursor: "pointer", fontSize: 13, marginBottom: 16, padding: 0 }}>
              ← {formattedSelected} at {selectedTime}
            </button>
            <p style={{ fontSize: 13, fontWeight: 700, color: textMuted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 20 }}>Your details</p>

            {/* Booking summary */}
            <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${border}`, borderRadius: 10, padding: 16, marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 6 }}>
                <span style={{ color: textMuted }}>Service</span>
                <span style={{ fontWeight: 600 }}>{service.name}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 6 }}>
                <span style={{ color: textMuted }}>Date & Time</span>
                <span style={{ fontWeight: 600 }}>{formattedSelected} · {selectedTime}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                <span style={{ color: textMuted }}>Duration</span>
                <span style={{ fontWeight: 600 }}>{service.duration_minutes} min</span>
              </div>
              {Number(service.price) > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginTop: 6, borderTop: `1px solid ${border}`, paddingTop: 10 }}>
                  <span style={{ color: textMuted }}>Amount</span>
                  <span style={{ fontWeight: 700, color: gold }}>{service.currency} {Number(service.price).toFixed(2)}</span>
                </div>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 20 }}>
              <div>
                <label style={{ fontSize: 12, color: textMuted, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>Full Name *</label>
                <input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Your name" style={inp()} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: textMuted, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>Email *</label>
                <input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="your@email.com" style={inp()} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: textMuted, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>Notes (optional)</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything we should know?" rows={3}
                  style={{ ...inp(), lineHeight: 1.6, resize: "vertical" } as React.CSSProperties} />
              </div>
            </div>

            {error && <p style={{ color: "#ef4444", fontSize: 13, marginBottom: 12 }}>{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={submitting}
              style={{ width: "100%", background: service.color, color: "#000", border: "none", borderRadius: 10, padding: "14px", fontFamily: "Fraunces, serif", fontSize: 16, fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.7 : 1 }}
            >
              {submitting ? "Submitting…" : "Request Booking →"}
            </button>
            <p style={{ fontSize: 12, color: textMuted, textAlign: "center", marginTop: 12 }}>
              You'll receive a confirmation email once we review your request.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
