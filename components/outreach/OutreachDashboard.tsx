"use client";

import { useEffect, useState, useCallback, useMemo } from "react";

type Lead = {
  id: string;
  name: string;
  email: string;
  company?: string;
  category?: string;
  network?: string;
  status: string;
  notes?: string;
  created_at: string;
};

type Message = {
  id: string;
  lead_id: string;
  subject: string;
  body: string;
  status: "draft" | "approved" | "sent" | "failed";
  sent_at?: string;
  created_at: string;
};

type Filter = "queued" | "drafted" | "approved" | "sent";

const gold = "#f5c542";
const goldDark = "#dfa837";
const bg = "#06060a";
const panel = "rgba(255,255,255,0.025)";
const border = "rgba(255,255,255,0.08)";
const borderSelected = "rgba(245,197,66,0.5)";
const textMuted = "rgba(255,255,255,0.4)";

const STATE_COLOR: Record<string, string> = {
  queued: "#4b5563",
  drafted: "#3b82f6",
  approved: "#10b981",
  sent: "#f5c542",
};

const inp: React.CSSProperties = {
  width: "100%",
  background: "rgba(255,255,255,0.06)",
  border: `1px solid ${border}`,
  borderRadius: 6,
  padding: "8px 10px",
  color: "#fff",
  fontFamily: "Outfit, sans-serif",
  fontSize: 14,
  boxSizing: "border-box",
  outline: "none",
};

function Btn({ onClick, disabled, children, variant = "default" }: {
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  variant?: "gold" | "blue" | "green" | "ghost" | "default";
}) {
  const styles: Record<string, React.CSSProperties> = {
    gold:    { background: gold, color: "#000", border: "none" },
    blue:    { background: "rgba(59,130,246,0.12)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.3)" },
    green:   { background: "rgba(16,185,129,0.12)", color: "#34d399", border: "1px solid rgba(16,185,129,0.3)" },
    ghost:   { background: "transparent", color: textMuted, border: `1px solid ${border}` },
    default: { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)", border: `1px solid ${border}` },
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...styles[variant],
        borderRadius: 7,
        padding: "8px 16px",
        fontFamily: "Outfit, sans-serif",
        fontSize: 13,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "opacity 0.15s",
        whiteSpace: "nowrap",
      }}
    >{children}</button>
  );
}

function deriveState(
  lead: Lead,
  msgByLead: Record<string, Message>,
  sentMsgByLead: Record<string, Message>
): Filter {
  if (sentMsgByLead[lead.id]) return "sent";
  const m = msgByLead[lead.id];
  if (!m) return "queued";
  if (m.status === "approved") return "approved";
  return "drafted";
}

export default function OutreachDashboard({ userId: _userId }: { userId: string }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [todayCount, setTodayCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [filter, setFilter] = useState<Filter>("queued");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  // Detail panel state
  const [emailEdit, setEmailEdit] = useState("");
  const [editingMsg, setEditingMsg] = useState(false);
  const [editSubject, setEditSubject] = useState("");
  const [editBody, setEditBody] = useState("");

  // Action states
  const [draftingId, setDraftingId] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [savingEmail, setSavingEmail] = useState(false);

  // Add lead form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [addingLead, setAddingLead] = useState(false);
  const [importing, setImporting] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/outreach/leads");
      if (!res.ok) return;
      const data = await res.json();
      setLeads(data.leads || []);
      setMessages(data.messages || []);
      setTodayCount(data.todayCount || 0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Build message maps
  const { msgByLead, sentMsgByLead } = useMemo(() => {
    const mbl: Record<string, Message> = {};
    const smbl: Record<string, Message> = {};
    for (const m of messages) {
      if (m.status === "sent") {
        if (!smbl[m.lead_id] || m.created_at > smbl[m.lead_id].created_at) smbl[m.lead_id] = m;
      } else if (m.status === "draft" || m.status === "approved") {
        if (!mbl[m.lead_id] || m.created_at > mbl[m.lead_id].created_at) mbl[m.lead_id] = m;
      }
    }
    return { msgByLead: mbl, sentMsgByLead: smbl };
  }, [messages]);

  const counts: Record<Filter, number> = useMemo(() => {
    const c = { queued: 0, drafted: 0, approved: 0, sent: 0 };
    for (const l of leads) {
      if (l.status === "skipped") continue;
      c[deriveState(l, msgByLead, sentMsgByLead)]++;
    }
    return c;
  }, [leads, msgByLead, sentMsgByLead]);

  const filteredLeads = useMemo(() => {
    const q = search.toLowerCase();
    return leads.filter((l) => {
      if (l.status === "skipped") return false;
      if (deriveState(l, msgByLead, sentMsgByLead) !== filter) return false;
      if (!q) return true;
      return (l.company || l.name).toLowerCase().includes(q) ||
        (l.category || "").toLowerCase().includes(q) ||
        (l.network || "").toLowerCase().includes(q);
    });
  }, [leads, filter, search, msgByLead, sentMsgByLead]);

  const selectedLead = leads.find((l) => l.id === selectedId) || null;
  const selectedMsg = selectedLead ? msgByLead[selectedLead.id] : null;
  const selectedSentMsg = selectedLead ? sentMsgByLead[selectedLead.id] : null;
  const selectedState = selectedLead ? deriveState(selectedLead, msgByLead, sentMsgByLead) : null;

  // Sync email edit when selection changes
  useEffect(() => {
    setEmailEdit(selectedLead?.email || "");
    setEditingMsg(false);
  }, [selectedId, selectedLead?.email]);

  // ── Handlers ─────────────────────────────────────────────

  async function persistEmail() {
    if (!selectedLead) return;
    setSavingEmail(true);
    await fetch("/api/outreach/leads", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ leadId: selectedLead.id, email: emailEdit }),
    });
    setSavingEmail(false);
    await load();
  }

  async function handleImport() {
    setImporting(true);
    setNotice("");
    try {
      const res = await fetch("/api/outreach/import", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setNotice(`Imported ${data.imported} new leads (${data.skipped} already existed).`);
      setFilter("queued");
      await load();
    } catch (e: unknown) {
      setNotice(e instanceof Error ? e.message : "Import failed");
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
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setNewName(""); setNewEmail(""); setNewCompany(""); setNewNotes("");
      setShowAddForm(false);
      await load();
      setSelectedId(data.lead?.id || null);
    } catch (e: unknown) {
      setNotice(e instanceof Error ? e.message : "Failed to add lead");
    } finally {
      setAddingLead(false);
    }
  }

  async function handleDraft() {
    if (!selectedLead) return;
    if (emailEdit && emailEdit !== selectedLead.email) await persistEmail();
    setDraftingId(selectedLead.id);
    setNotice("");
    try {
      const res = await fetch("/api/outreach/draft", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          leadId: selectedLead.id,
          name: selectedLead.name,
          company: selectedLead.company || selectedLead.name,
          category: selectedLead.category,
          network: selectedLead.network,
          notes: selectedLead.notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Draft failed");
      setFilter("drafted");
      await load();
    } catch (e: unknown) {
      setNotice(e instanceof Error ? e.message : "Draft failed");
    } finally {
      setDraftingId(null);
    }
  }

  async function handleApprove() {
    if (!selectedLead || !selectedMsg) return;
    setApprovingId(selectedLead.id);
    await fetch("/api/outreach/messages", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ messageId: selectedMsg.id, leadId: selectedLead.id, status: "approved" }),
    });
    setFilter("approved");
    await load();
    setApprovingId(null);
  }

  async function handleSend() {
    if (!selectedLead || !selectedMsg) return;
    if (todayCount >= 50) { setNotice("Daily limit of 50 reached."); return; }
    setSendingId(selectedLead.id);
    try {
      const res = await fetch("/api/outreach/send", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          messageId: selectedMsg.id,
          leadId: selectedLead.id,
          toEmail: emailEdit || selectedLead.email,
          subject: selectedMsg.subject,
          body: selectedMsg.body,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Send failed");
      setTodayCount(data.sentToday);
      setNotice(`Sent to ${emailEdit || selectedLead.email} ✓`);
      setFilter("sent");
      await load();
    } catch (e: unknown) {
      setNotice(e instanceof Error ? e.message : "Send failed");
    } finally {
      setSendingId(null);
    }
  }

  async function handleSaveEdit() {
    if (!selectedMsg) return;
    await fetch("/api/outreach/messages", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ messageId: selectedMsg.id, subject: editSubject, body: editBody }),
    });
    setEditingMsg(false);
    await load();
  }

  async function handleSkip(lead: Lead) {
    await fetch("/api/outreach/leads", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ leadId: lead.id, status: "skipped" }),
    });
    if (selectedId === lead.id) setSelectedId(null);
    await load();
  }

  const capPct = Math.min((todayCount / 50) * 100, 100);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: bg, display: "flex", alignItems: "center", justifyContent: "center", color: textMuted, fontFamily: "Outfit, sans-serif" }}>
        Loading outreach…
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: bg, fontFamily: "Outfit, sans-serif", color: "#fff", display: "flex", flexDirection: "column" }}>

      {/* ── Header ── */}
      <div style={{ borderBottom: `1px solid ${border}`, padding: "20px 28px 16px", flexShrink: 0 }}>
        <p style={{ color: gold, fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", margin: "0 0 4px", textTransform: "uppercase" }}>SignalBoost AI SDR</p>
        <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
          <h1 style={{ fontFamily: "Fraunces, serif", fontSize: 30, fontWeight: 700, margin: 0 }}>Outreach</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 13, color: textMuted }}>
              <span style={{ color: todayCount >= 50 ? "#ef4444" : gold, fontWeight: 700 }}>{todayCount}</span> / 50 sent today
            </span>
            <div style={{ width: 80, height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 2 }}>
              <div style={{ width: `${capPct}%`, height: "100%", background: todayCount >= 50 ? "#ef4444" : gold, borderRadius: 2 }} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
            <Btn onClick={handleImport} disabled={importing} variant="gold">
              {importing ? "Importing…" : "⬇ Import Partners"}
            </Btn>
            <Btn onClick={() => { setShowAddForm(!showAddForm); setSelectedId(null); }} variant="ghost">
              {showAddForm ? "Cancel" : "+ Add Lead"}
            </Btn>
          </div>
        </div>
        {notice && (
          <div style={{ marginTop: 10, fontSize: 13, color: gold, display: "flex", alignItems: "center", gap: 8 }}>
            <span>{notice}</span>
            <button onClick={() => setNotice("")} style={{ background: "none", border: "none", color: textMuted, cursor: "pointer", fontSize: 15 }}>×</button>
          </div>
        )}
      </div>

      {/* ── Two-column body ── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden", minHeight: 0 }}>

        {/* ── LEFT: Lead list ── */}
        <div style={{ width: 300, flexShrink: 0, borderRight: `1px solid ${border}`, display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* Search */}
          <div style={{ padding: "12px 14px", borderBottom: `1px solid ${border}`, flexShrink: 0 }}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search partners…"
              style={{ ...inp, fontSize: 13, padding: "7px 10px" }}
            />
          </div>

          {/* Filter tabs */}
          <div style={{ display: "flex", borderBottom: `1px solid ${border}`, flexShrink: 0 }}>
            {(["queued", "drafted", "approved", "sent"] as Filter[]).map((f) => (
              <button key={f} onClick={() => { setFilter(f); setSearch(""); }}
                style={{
                  flex: 1, background: "none", border: "none",
                  borderBottom: filter === f ? `2px solid ${gold}` : "2px solid transparent",
                  color: filter === f ? gold : textMuted,
                  fontFamily: "Outfit, sans-serif", fontSize: 11, fontWeight: filter === f ? 700 : 400,
                  padding: "8px 2px", cursor: "pointer", textTransform: "capitalize", lineHeight: 1.2,
                }}>
                {f}<br />
                <span style={{ fontSize: 12, fontWeight: 700 }}>{counts[f]}</span>
              </button>
            ))}
          </div>

          {/* Lead list */}
          <div style={{ overflowY: "auto", flex: 1 }}>
            {filteredLeads.length === 0 ? (
              <div style={{ padding: "24px 16px", textAlign: "center", color: textMuted, fontSize: 13 }}>
                {search ? "No matches." :
                  filter === "queued" ? "Import partners to get started." :
                  filter === "drafted" ? "Draft a message from Queued." :
                  filter === "approved" ? "Approve a draft first." : "Nothing sent yet."}
              </div>
            ) : (
              filteredLeads.map((lead) => {
                const state = deriveState(lead, msgByLead, sentMsgByLead);
                const isSelected = selectedId === lead.id;
                return (
                  <div
                    key={lead.id}
                    onClick={() => { setSelectedId(lead.id); setShowAddForm(false); setEditingMsg(false); }}
                    style={{
                      padding: "11px 14px",
                      cursor: "pointer",
                      borderLeft: isSelected ? `3px solid ${gold}` : "3px solid transparent",
                      borderBottom: `1px solid ${border}`,
                      background: isSelected ? "rgba(245,197,66,0.06)" : "transparent",
                      transition: "background 0.1s",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                      <span style={{ fontWeight: isSelected ? 700 : 600, fontSize: 13, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {lead.company || lead.name}
                      </span>
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: STATE_COLOR[state] || "#4b5563", flexShrink: 0 }} />
                    </div>
                    <div style={{ fontSize: 11, color: textMuted, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {[lead.category, lead.network].filter(Boolean).join(" · ")}
                    </div>
                    {lead.email && (
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {lead.email}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── RIGHT: Detail panel ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "28px 32px" }}>

          {/* Add lead form */}
          {showAddForm && (
            <div style={{ background: panel, border: `1px solid ${border}`, borderRadius: 12, padding: 24, marginBottom: 24, maxWidth: 560 }}>
              <p style={{ fontWeight: 700, margin: "0 0 16px", fontSize: 15, color: gold }}>New Lead</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                {[
                  { label: "Name *", val: newName, set: setNewName, ph: "Contact or company" },
                  { label: "Email", val: newEmail, set: setNewEmail, ph: "contact@partner.com" },
                  { label: "Company", val: newCompany, set: setNewCompany, ph: "Company name" },
                  { label: "Notes", val: newNotes, set: setNewNotes, ph: "Context for AI draft" },
                ].map(({ label, val, set, ph }) => (
                  <div key={label}>
                    <label style={{ fontSize: 11, color: textMuted, display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</label>
                    <input value={val} onChange={(e) => set(e.target.value)} placeholder={ph} style={inp} />
                  </div>
                ))}
              </div>
              <Btn onClick={handleAddLead} disabled={addingLead || !newName.trim()} variant="gold">
                {addingLead ? "Adding…" : "Add Lead"}
              </Btn>
            </div>
          )}

          {/* Empty state */}
          {!selectedLead && !showAddForm && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60%", color: textMuted, textAlign: "center", gap: 12 }}>
              <div style={{ fontSize: 36, opacity: 0.3 }}>✉</div>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,0.3)" }}>Select a lead to get started</p>
              <p style={{ margin: 0, fontSize: 13 }}>Pick a partner from the list, add their email,<br />and let AI draft the message.</p>
            </div>
          )}

          {/* Lead detail */}
          {selectedLead && !showAddForm && (
            <div style={{ maxWidth: 620 }}>

              {/* Lead title */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
                <div>
                  <h2 style={{ fontFamily: "Fraunces, serif", fontSize: 24, fontWeight: 700, margin: "0 0 4px" }}>
                    {selectedLead.company || selectedLead.name}
                  </h2>
                  <p style={{ margin: 0, fontSize: 13, color: textMuted }}>
                    {[selectedLead.category, selectedLead.network].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <button onClick={() => handleSkip(selectedLead)} title="Skip this lead"
                  style={{ background: "none", border: "none", color: textMuted, cursor: "pointer", fontSize: 20, padding: "4px 8px" }}>×</button>
              </div>

              {/* Email field */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 11, color: textMuted, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  Contact Email
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    value={emailEdit}
                    onChange={(e) => setEmailEdit(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") persistEmail(); }}
                    placeholder="contact@partner.com"
                    style={{ ...inp, borderColor: emailEdit ? border : "rgba(245,197,66,0.35)", background: emailEdit ? "rgba(255,255,255,0.06)" : "rgba(245,197,66,0.05)" }}
                  />
                  {emailEdit !== (selectedLead.email || "") && (
                    <button onClick={persistEmail} disabled={savingEmail}
                      style={{ background: goldDark, color: "#000", border: "none", borderRadius: 6, padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
                      {savingEmail ? "…" : "Save"}
                    </button>
                  )}
                </div>
                {!emailEdit && (
                  <p style={{ margin: "6px 0 0", fontSize: 12, color: "rgba(245,197,66,0.6)" }}>
                    Add email before approving or sending.
                  </p>
                )}
              </div>

              {/* No draft yet */}
              {!selectedMsg && !selectedSentMsg && selectedState === "queued" && (
                <div style={{ background: panel, border: `1px dashed ${border}`, borderRadius: 12, padding: "32px 24px", textAlign: "center", marginBottom: 20 }}>
                  <p style={{ margin: "0 0 16px", color: textMuted, fontSize: 14 }}>
                    No draft yet. Let AI write a warm, personalised message using your playbook.
                  </p>
                  <Btn onClick={handleDraft} disabled={!!draftingId} variant="blue">
                    {draftingId === selectedLead.id ? "Writing draft…" : "✦ Draft with AI"}
                  </Btn>
                </div>
              )}

              {/* Draft / Approved message */}
              {selectedMsg && !editingMsg && (
                <div style={{ background: panel, border: `1px solid ${selectedMsg.status === "approved" ? "rgba(16,185,129,0.3)" : border}`, borderRadius: 12, padding: 24, marginBottom: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                      color: selectedMsg.status === "approved" ? "#34d399" : "#60a5fa" }}>
                      {selectedMsg.status === "approved" ? "✓ Approved" : "Draft"}
                    </span>
                    <span style={{ fontSize: 11, color: textMuted }}>from: saaspartners@signalboostapp.com</span>
                  </div>
                  <label style={{ fontSize: 11, color: textMuted, textTransform: "uppercase", letterSpacing: "0.1em" }}>Subject</label>
                  <p style={{ margin: "4px 0 16px", fontSize: 15, fontWeight: 600 }}>{selectedMsg.subject}</p>
                  <label style={{ fontSize: 11, color: textMuted, textTransform: "uppercase", letterSpacing: "0.1em" }}>Message</label>
                  <p style={{ margin: "4px 0 0", fontSize: 14, lineHeight: 1.7, whiteSpace: "pre-wrap", color: "rgba(255,255,255,0.8)" }}>
                    {selectedMsg.body}
                  </p>
                </div>
              )}

              {/* Edit form */}
              {selectedMsg && editingMsg && (
                <div style={{ background: panel, border: `1px solid ${border}`, borderRadius: 12, padding: 24, marginBottom: 20 }}>
                  <label style={{ fontSize: 11, color: textMuted, textTransform: "uppercase", letterSpacing: "0.1em" }}>Subject</label>
                  <input value={editSubject} onChange={(e) => setEditSubject(e.target.value)}
                    style={{ ...inp, marginTop: 6, marginBottom: 14 }} />
                  <label style={{ fontSize: 11, color: textMuted, textTransform: "uppercase", letterSpacing: "0.1em" }}>Message</label>
                  <textarea value={editBody} onChange={(e) => setEditBody(e.target.value)} rows={12}
                    style={{ ...inp, marginTop: 6, lineHeight: 1.7, resize: "vertical" } as React.CSSProperties} />
                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <Btn onClick={handleSaveEdit} variant="gold">Save Changes</Btn>
                    <Btn onClick={() => setEditingMsg(false)} variant="ghost">Cancel</Btn>
                  </div>
                </div>
              )}

              {/* Sent message */}
              {selectedSentMsg && (
                <div style={{ background: "rgba(245,197,66,0.04)", border: `1px solid rgba(245,197,66,0.15)`, borderRadius: 12, padding: 24, marginBottom: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: gold, textTransform: "uppercase", letterSpacing: "0.1em" }}>✓ Sent</span>
                    {selectedSentMsg.sent_at && (
                      <span style={{ fontSize: 12, color: textMuted }}>{new Date(selectedSentMsg.sent_at).toLocaleString()}</span>
                    )}
                  </div>
                  <p style={{ margin: "0 0 8px", fontSize: 15, fontWeight: 600 }}>{selectedSentMsg.subject}</p>
                  <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.6)", whiteSpace: "pre-wrap", lineHeight: 1.65 }}>{selectedSentMsg.body}</p>
                </div>
              )}

              {/* Action buttons */}
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {(selectedState === "queued" || selectedState === "drafted") && selectedMsg && !editingMsg && (
                  <>
                    <Btn onClick={() => { setEditSubject(selectedMsg.subject); setEditBody(selectedMsg.body); setEditingMsg(true); }} variant="default">
                      Edit Draft
                    </Btn>
                    <Btn onClick={() => handleDraft()} disabled={!!draftingId} variant="blue">
                      {draftingId === selectedLead.id ? "Re-writing…" : "↺ Re-draft"}
                    </Btn>
                  </>
                )}
                {selectedState === "drafted" && selectedMsg && !editingMsg && (
                  <Btn onClick={handleApprove} disabled={!emailEdit || approvingId === selectedLead.id} variant="green">
                    {approvingId === selectedLead.id ? "Approving…" : "✓ Approve"}
                  </Btn>
                )}
                {selectedState === "approved" && selectedMsg && !editingMsg && (
                  <Btn onClick={handleSend} disabled={sendingId === selectedLead.id || !emailEdit || todayCount >= 50} variant="gold">
                    {sendingId === selectedLead.id ? "Sending…" : "↗ Send Now"}
                  </Btn>
                )}
                {selectedState === "queued" && !selectedMsg && (
                  <Btn onClick={() => handleDraft()} disabled={!!draftingId} variant="blue">
                    {draftingId === selectedLead.id ? "Writing draft…" : "✦ Draft with AI"}
                  </Btn>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
