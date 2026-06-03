"use client";

import { useEffect, useState, useCallback } from "react";

type Lead = {
  id: string;
  name: string;
  email: string;
  company?: string;
  category?: string;
  network?: string;
  affiliate_url?: string;
  source: string;
  notes?: string;
  status: "queued" | "drafted" | "approved" | "sent" | "skipped" | "replied" | "demo" | "closed" | "lost";
  replied_at?: string;
  demo_at?: string;
  closed_at?: string;
  deal_value?: number;
  created_at: string;
};

type Message = {
  id: string;
  lead_id: string;
  subject: string;
  body: string;
  from_alias: string;
  status: "draft" | "approved" | "sent" | "failed";
  sent_at?: string;
  created_at: string;
};

const gold = "#f5c542";
const goldDark = "#dfa837";
const bg = "#06060a";
const surface = "rgba(255,255,255,0.04)";
const border = "rgba(255,255,255,0.08)";
const textMuted = "rgba(255,255,255,0.45)";

const STATUS_COLORS: Record<string, string> = {
  queued: "#6b7280",
  drafted: "#3b82f6",
  approved: "#10b981",
  sent: "#f5c542",
  skipped: "#374151",
  draft: "#3b82f6",
  failed: "#ef4444",
  replied: "#38bdf8",
  demo: "#a78bfa",
  closed: "#34d399",
  lost: "#ef4444",
};

// Outcome stages a sent lead can advance through
const OUTCOME_FLOW: Record<string, { next: string; label: string }[]> = {
  sent: [
    { next: "replied", label: "✉ Mark Replied" },
    { next: "lost", label: "Mark Lost" },
  ],
  replied: [
    { next: "demo", label: "📅 Demo Booked" },
    { next: "closed", label: "✓ Closed-Won" },
    { next: "lost", label: "Mark Lost" },
  ],
  demo: [
    { next: "closed", label: "✓ Closed-Won" },
    { next: "lost", label: "Mark Lost" },
  ],
};

export default function OutreachDashboard({ userId }: { userId: string }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [todayCount, setTodayCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Per-lead action states
  const [draftingId, setDraftingId] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);
  const [editSubject, setEditSubject] = useState("");
  const [editBody, setEditBody] = useState("");
  const [emailEdits, setEmailEdits] = useState<Record<string, string>>({});
  const [outcomeId, setOutcomeId] = useState<string | null>(null);

  // Add lead form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [addingLead, setAddingLead] = useState(false);

  // Import
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/outreach/leads");
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setLeads(data.leads || []);
      setMessages(data.messages || []);
      setTodayCount(data.todayCount || 0);
    } catch {
      setError("Could not load outreach data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const msgByLead = Object.fromEntries(
    messages
      .filter((m) => m.status === "draft" || m.status === "approved")
      .map((m) => [m.lead_id, m])
  );

  async function handleImport() {
    setImporting(true);
    setImportMsg("");
    try {
      const res = await fetch("/api/outreach/import", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import failed");
      setImportMsg(`Imported ${data.imported} new leads (${data.skipped} already existed).`);
      await load();
    } catch (e: unknown) {
      setImportMsg(e instanceof Error ? e.message : "Import failed");
    } finally {
      setImporting(false);
    }
  }

  async function handleAddLead() {
    if (!newName.trim()) return;
    setAddingLead(true);
    try {
      const res = await fetch("/api/outreach/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: newName, email: newEmail, company: newCompany, notes: newNotes }),
      });
      if (!res.ok) throw new Error("Failed");
      setNewName(""); setNewEmail(""); setNewCompany(""); setNewNotes("");
      setShowAddForm(false);
      await load();
    } catch {
      // ignore
    } finally {
      setAddingLead(false);
    }
  }

  async function saveEmail(leadId: string) {
    const email = emailEdits[leadId];
    if (email === undefined) return;
    await fetch("/api/outreach/leads", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ leadId, email }),
    });
    await load();
  }

  async function handleDraft(lead: Lead) {
    setDraftingId(lead.id);
    try {
      const res = await fetch("/api/outreach/draft", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          leadId: lead.id,
          name: lead.name,
          company: lead.company,
          category: lead.category,
          network: lead.network,
          notes: lead.notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Draft failed");
      await load();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Draft failed");
    } finally {
      setDraftingId(null);
    }
  }

  function startEdit(lead: Lead) {
    const msg = msgByLead[lead.id];
    setEditingLeadId(lead.id);
    setEditSubject(msg?.subject || "");
    setEditBody(msg?.body || "");
  }

  async function saveEdit(lead: Lead) {
    // NOTE: message-body persistence on edit is a known limitation in the
    // existing draft flow; re-drafting regenerates content. Left as-is here.
    setEditingLeadId(null);
    await load();
  }

  async function handleApprove(lead: Lead) {
    const msg = msgByLead[lead.id];
    if (!msg) return;
    await fetch("/api/outreach/leads", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ leadId: lead.id, status: "approved" }),
    });
    await load();
  }

  async function handleSend(lead: Lead) {
    const msg = msgByLead[lead.id];
    if (!msg) return;
    if (todayCount >= 50) {
      alert("Daily limit of 50 emails reached. Try again tomorrow.");
      return;
    }
    setSendingId(lead.id);
    try {
      const res = await fetch("/api/outreach/send", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          messageId: msg.id,
          leadId: lead.id,
          toEmail: lead.email,
          subject: msg.subject,
          body: msg.body,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Send failed");
      setTodayCount(data.sentToday);
      await load();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Send failed");
    } finally {
      setSendingId(null);
    }
  }

  async function handleSkip(lead: Lead) {
    await fetch("/api/outreach/leads", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ leadId: lead.id, status: "skipped" }),
    });
    await load();
  }

  // Record a real CRM outcome (replied / demo / closed / lost)
  async function handleOutcome(lead: Lead, outcome: string) {
    let dealValue: number | undefined;
    if (outcome === "closed") {
      const input = prompt(`Deal value for ${lead.company || lead.name} (USD)?`, "0");
      if (input === null) return; // cancelled
      const parsed = Number(input);
      if (!Number.isFinite(parsed) || parsed < 0) {
        alert("Please enter a valid non-negative number.");
        return;
      }
      dealValue = parsed;
    }
    setOutcomeId(lead.id);
    try {
      const res = await fetch("/api/outreach/outcome", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ leadId: lead.id, outcome, dealValue }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to record outcome");
      await load();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed to record outcome");
    } finally {
      setOutcomeId(null);
    }
  }

  const queueLeads = leads.filter((l) => ["queued", "drafted", "approved"].includes(l.status));
  // Pipeline = everything from sent onward (the CRM funnel)
  const pipelineLeads = leads.filter((l) =>
    ["sent", "replied", "demo", "closed", "lost"].includes(l.status)
  );
  const sentMessages = messages.filter((m) => m.status === "sent");

  const capPct = Math.min((todayCount / 50) * 100, 100);
if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: bg, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.4)", fontFamily: "Outfit, sans-serif" }}>
        Loading outreach…
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: bg, fontFamily: "Outfit, sans-serif", color: "#fff", padding: "0 0 80px" }}>
      {/* Header */}
      <div style={{ borderBottom: `1px solid ${border}`, padding: "32px 32px 24px" }}>
        <p style={{ color: gold, fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", margin: "0 0 6px", textTransform: "uppercase" }}>
          SignalBoost AI SDR
        </p>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 24, flexWrap: "wrap" }}>
          <h1 style={{ fontFamily: "Fraunces, serif", fontSize: 36, fontWeight: 700, margin: 0, lineHeight: 1 }}>
            Outreach
          </h1>
          <div style={{ marginBottom: 2 }}>
            <span style={{ fontSize: 13, color: textMuted }}>
              <span style={{ color: todayCount >= 50 ? "#ef4444" : gold, fontWeight: 700, fontSize: 16 }}>{todayCount}</span>
              {" / 50 sent today"}
            </span>
            <div style={{ marginTop: 6, width: 120, height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2 }}>
              <div style={{ width: `${capPct}%`, height: "100%", background: todayCount >= 50 ? "#ef4444" : gold, borderRadius: 2, transition: "width 0.4s" }} />
            </div>
          </div>
        </div>
        {error && <p style={{ color: "#ef4444", margin: "12px 0 0", fontSize: 13 }}>{error}</p>}
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "28px 24px" }}>
        {/* Actions row */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 8 }}>
          <button
            onClick={handleImport}
            disabled={importing}
            style={{ background: gold, color: "#000", border: "none", borderRadius: 8, padding: "10px 20px", fontFamily: "Outfit, sans-serif", fontSize: 14, fontWeight: 700, cursor: importing ? "not-allowed" : "pointer", opacity: importing ? 0.7 : 1 }}
          >
            {importing ? "Importing…" : "⬇ Import Partners"}
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            style={{ background: "transparent", color: gold, border: `1px solid ${gold}`, borderRadius: 8, padding: "10px 20px", fontFamily: "Outfit, sans-serif", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
          >
            {showAddForm ? "Cancel" : "+ Add Lead"}
          </button>
        </div>
        {importMsg && (
          <p style={{ fontSize: 13, color: textMuted, margin: "8px 0 16px" }}>{importMsg}</p>
        )}

        {/* Add lead form */}
        {showAddForm && (
          <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 12, padding: 20, marginBottom: 20 }}>
            <p style={{ fontWeight: 700, margin: "0 0 14px", fontSize: 14, color: gold }}>New Lead</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
              {[
                { label: "Name / Company *", val: newName, set: setNewName, ph: "Trivago" },
                { label: "Email", val: newEmail, set: setNewEmail, ph: "contact@partner.com" },
                { label: "Company", val: newCompany, set: setNewCompany, ph: "Trivago GmbH" },
              ].map(({ label, val, set, ph }) => (
                <div key={label}>
                  <label style={{ fontSize: 11, color: textMuted, display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</label>
                  <input
                    value={val}
                    onChange={(e) => set(e.target.value)}
                    placeholder={ph}
                    style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: `1px solid ${border}`, borderRadius: 6, padding: "8px 10px", color: "#fff", fontFamily: "Outfit, sans-serif", fontSize: 14, boxSizing: "border-box" }}
                  />
                </div>
              ))}
              <div>
                <label style={{ fontSize: 11, color: textMuted, display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>Notes</label>
                <input
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Optional context for AI draft"
                  style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: `1px solid ${border}`, borderRadius: 6, padding: "8px 10px", color: "#fff", fontFamily: "Outfit, sans-serif", fontSize: 14, boxSizing: "border-box" }}
                />
              </div>
            </div>
            <button
              onClick={handleAddLead}
              disabled={addingLead || !newName.trim()}
              style={{ background: goldDark, color: "#000", border: "none", borderRadius: 7, padding: "9px 20px", fontFamily: "Outfit, sans-serif", fontSize: 14, fontWeight: 700, cursor: addingLead || !newName.trim() ? "not-allowed" : "pointer", opacity: addingLead || !newName.trim() ? 0.6 : 1 }}
            >
              {addingLead ? "Adding…" : "Add Lead"}
            </button>
          </div>
        )}

        {/* Queue */}
        <h2 style={{ fontSize: 13, fontWeight: 700, color: textMuted, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 14px" }}>
          Lead Queue ({queueLeads.length})
        </h2>

        {queueLeads.length === 0 && (
          <div style={{ background: surface, border: `1px dashed ${border}`, borderRadius: 12, padding: "32px 24px", textAlign: "center", color: textMuted, marginBottom: 28 }}>
            No leads yet. Import your affiliate partners or add one manually.
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 36 }}>
          {queueLeads.map((lead) => {
            const msg = msgByLead[lead.id];
            const isEditing = editingLeadId === lead.id;
            const isDrafting = draftingId === lead.id;
            const isSending = sendingId === lead.id;
            const hasEmail = !!lead.email;
            const editedEmail = emailEdits[lead.id];
            const displayEmail = editedEmail !== undefined ? editedEmail : lead.email;

            return (
              <div key={lead.id} style={{ background: surface, border: `1px solid ${border}`, borderRadius: 12, padding: 18, transition: "border-color 0.2s" }}>
                {/* Lead header */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: 15 }}>{lead.company || lead.name}</span>
                    {lead.category && <span style={{ color: textMuted, fontSize: 13, marginLeft: 8 }}>· {lead.category}</span>}
                    {lead.network && <span style={{ color: textMuted, fontSize: 13, marginLeft: 6 }}>· {lead.network}</span>}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: STATUS_COLORS[lead.status] || textMuted, background: "rgba(255,255,255,0.05)", padding: "3px 8px", borderRadius: 4 }}>
                      {lead.status}
                    </span>
                    <button
                      onClick={() => handleSkip(lead)}
                      title="Skip this lead"
                      style={{ background: "transparent", border: "none", color: textMuted, cursor: "pointer", fontSize: 16, lineHeight: 1, padding: "2px 4px" }}
                    >×</button>
                  </div>
                </div>

                {/* Email row */}
                <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 12, color: textMuted, minWidth: 44 }}>To:</span>
                  <input
                    value={displayEmail}
                    onChange={(e) => setEmailEdits((prev) => ({ ...prev, [lead.id]: e.target.value }))}
                    onBlur={() => saveEmail(lead.id)}
                    placeholder="Add contact email…"
                    style={{ flex: 1, background: hasEmail ? "transparent" : "rgba(245,197,66,0.06)", border: `1px solid ${hasEmail ? border : "rgba(245,197,66,0.3)"}`, borderRadius: 6, padding: "6px 10px", color: "#fff", fontFamily: "Outfit, sans-serif", fontSize: 13 }}
                  />
                </div>

                {/* Draft preview */}
                {msg && !isEditing && (
                  <div style={{ marginTop: 14, background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: 14 }}>
                    <p style={{ fontSize: 12, color: textMuted, margin: "0 0 4px" }}>Subject</p>
                    <p style={{ margin: "0 0 10px", fontSize: 14, fontWeight: 600 }}>{msg.subject}</p>
                    <p style={{ fontSize: 12, color: textMuted, margin: "0 0 4px" }}>Body</p>
                    <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.75)", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
                      {msg.body.length > 300 ? msg.body.slice(0, 300) + "…" : msg.body}
                    </p>
                  </div>
                )}

                {/* Edit form */}
                {isEditing && (
                  <div style={{ marginTop: 14 }}>
                    <input
                      value={editSubject}
                      onChange={(e) => setEditSubject(e.target.value)}
                      placeholder="Subject"
                      style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: `1px solid ${border}`, borderRadius: 6, padding: "8px 10px", color: "#fff", fontFamily: "Outfit, sans-serif", fontSize: 14, marginBottom: 8, boxSizing: "border-box" }}
                    />
                    <textarea
                      value={editBody}
                      onChange={(e) => setEditBody(e.target.value)}
                      rows={8}
                      style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: `1px solid ${border}`, borderRadius: 6, padding: "8px 10px", color: "#fff", fontFamily: "Outfit, sans-serif", fontSize: 13, lineHeight: 1.6, resize: "vertical", boxSizing: "border-box" }}
                    />
                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                      <button onClick={() => saveEdit(lead)} style={btnStyle(gold, "#000")}>Save Edits</button>
                      <button onClick={() => setEditingLeadId(null)} style={btnStyle("transparent", textMuted, border)}>Cancel</button>
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {(lead.status === "queued" || lead.status === "drafted") && !isEditing && (
                    <button
                      onClick={() => handleDraft(lead)}
                      disabled={isDrafting}
                      style={btnStyle(isDrafting ? "rgba(255,255,255,0.1)" : "rgba(59,130,246,0.15)", isDrafting ? textMuted : "#60a5fa", "rgba(59,130,246,0.3)")}
                    >
                      {isDrafting ? "Drafting…" : msg ? "Re-draft" : "✦ Draft with AI"}
                    </button>
                  )}
                  {msg && !isEditing && lead.status !== "approved" && (
                    <button onClick={() => startEdit(lead)} style={btnStyle("rgba(255,255,255,0.06)", "rgba(255,255,255,0.7)", border)}>
                      Edit
                    </button>
                  )}
                  {lead.status === "drafted" && msg && !isEditing && (
                    <button
                      onClick={() => handleApprove(lead)}
                      disabled={!hasEmail}
                      title={hasEmail ? "Approve this message" : "Add email first"}
                      style={btnStyle(hasEmail ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.04)", hasEmail ? "#34d399" : textMuted, hasEmail ? "rgba(16,185,129,0.3)" : border)}
                    >
                      ✓ Approve
                    </button>
                  )}
                  {lead.status === "approved" && msg && (
                    <button
                      onClick={() => handleSend(lead)}
                      disabled={isSending || !hasEmail || todayCount >= 50}
                      title={!hasEmail ? "Add email first" : todayCount >= 50 ? "Daily limit reached" : "Send this email"}
                      style={btnStyle(isSending || !hasEmail || todayCount >= 50 ? "rgba(255,255,255,0.06)" : gold, isSending || !hasEmail || todayCount >= 50 ? textMuted : "#000")}
                    >
                      {isSending ? "Sending…" : "↗ Send Now"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Pipeline (CRM funnel: sent → replied → demo → closed/lost) */}
        {pipelineLeads.length > 0 && (
          <>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: textMuted, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 14px" }}>
              Pipeline ({pipelineLeads.length})
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {pipelineLeads.map((lead) => {
                const sentMsg = sentMessages.find((m) => m.lead_id === lead.id);
                const sentAt = sentMsg?.sent_at ? new Date(sentMsg.sent_at).toLocaleDateString() : "—";
                const transitions = OUTCOME_FLOW[lead.status] || [];
                const isWorking = outcomeId === lead.id;
                return (
                  <div key={lead.id} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${border}`, borderRadius: 10, padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                      <div>
                        <span style={{ fontWeight: 600, fontSize: 14 }}>{lead.company || lead.name}</span>
                        {lead.category && <span style={{ color: textMuted, fontSize: 13, marginLeft: 8 }}>· {lead.category}</span>}
                        {lead.status === "closed" && lead.deal_value != null && (
                          <span style={{ color: "#34d399", fontSize: 13, marginLeft: 8, fontWeight: 700 }}>
                            ${lead.deal_value.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: STATUS_COLORS[lead.status] || textMuted, background: "rgba(255,255,255,0.05)", padding: "3px 8px", borderRadius: 4 }}>
                          {lead.status}
                        </span>
                        <span style={{ fontSize: 12, color: textMuted }}>{sentAt}</span>
                      </div>
                    </div>
                    {transitions.length > 0 && (
                      <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {transitions.map((t) => (
                          <button
                            key={t.next}
                            onClick={() => handleOutcome(lead, t.next)}
                            disabled={isWorking}
                            style={btnStyle(
                              isWorking ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.06)",
                              isWorking ? textMuted : (STATUS_COLORS[t.next] || "#fff"),
                              border
                            )}
                          >
                            {isWorking ? "Saving…" : t.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function btnStyle(bg: string, color: string, borderColor?: string): React.CSSProperties {
  return {
    background: bg,
    color,
    border: borderColor ? `1px solid ${borderColor}` : "none",
    borderRadius: 7,
    padding: "7px 14px",
    fontFamily: "Outfit, sans-serif",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "opacity 0.15s",
  };
}
