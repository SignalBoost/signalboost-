"use client";

import { useEffect, useState, useCallback } from "react";

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
  from_alias: string;
  status: "draft" | "approved" | "sent" | "failed";
  sent_at?: string;
  created_at: string;
};

type Filter = "queued" | "drafted" | "approved" | "sent";

const gold = "#f5c542";
const goldDark = "#dfa837";
const bg = "#06060a";
const surface = "rgba(255,255,255,0.04)";
const border = "rgba(255,255,255,0.08)";
const textMuted = "rgba(255,255,255,0.45)";

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
};

function btn(bg2: string, color: string, br?: string): React.CSSProperties {
  return {
    background: bg2,
    color,
    border: br ? `1px solid ${br}` : "none",
    borderRadius: 7,
    padding: "7px 14px",
    fontFamily: "Outfit, sans-serif",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  };
}

// Derive which tab a lead belongs to based on its messages (not lead.status,
// which can be stale due to RLS update race conditions).
function deriveState(
  lead: Lead,
  msgByLead: Record<string, Message>,
  sentMsgByLead: Record<string, Message>
): Filter {
  if (sentMsgByLead[lead.id]) return "sent";
  const msg = msgByLead[lead.id];
  if (!msg) return "queued";
  if (msg.status === "approved") return "approved";
  return "drafted";
}

export default function OutreachDashboard({ userId }: { userId: string }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [todayCount, setTodayCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("queued");
  const [notice, setNotice] = useState("");

  const [draftingId, setDraftingId] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);
  const [editSubject, setEditSubject] = useState("");
  const [editBody, setEditBody] = useState("");
  const [emailEdits, setEmailEdits] = useState<Record<string, string>>({});
  const [savingEmail, setSavingEmail] = useState<string | null>(null);

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
      if (!res.ok) throw new Error();
      const data = await res.json();
      setLeads(data.leads || []);
      setMessages(data.messages || []);
      setTodayCount(data.todayCount || 0);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Build message maps from ALL messages (including sent)
  const msgByLead: Record<string, Message> = {};     // latest draft/approved
  const sentMsgByLead: Record<string, Message> = {}; // latest sent

  for (const m of messages) {
    if (m.status === "sent") {
      if (!sentMsgByLead[m.lead_id] || m.created_at > sentMsgByLead[m.lead_id].created_at) {
        sentMsgByLead[m.lead_id] = m;
      }
    } else if (m.status === "draft" || m.status === "approved") {
      if (!msgByLead[m.lead_id] || m.created_at > msgByLead[m.lead_id].created_at) {
        msgByLead[m.lead_id] = m;
      }
    }
  }

  // Counts and visible list derived from message state (not lead.status)
  const counts: Record<Filter, number> = { queued: 0, drafted: 0, approved: 0, sent: 0 };
  for (const l of leads) {
    if (l.status === "skipped") continue;
    const s = deriveState(l, msgByLead, sentMsgByLead);
    counts[s]++;
  }

  const visible = leads.filter(
    (l) => l.status !== "skipped" && deriveState(l, msgByLead, sentMsgByLead) === filter
  );

  // ── Actions ──────────────────────────────────────────────

  async function persistEmail(leadId: string, emailValue: string) {
    setSavingEmail(leadId);
    await fetch("/api/outreach/leads", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ leadId, email: emailValue }),
    });
    setSavingEmail(null);
    await load();
  }

  async function handleImport() {
    setImporting(true);
    setNotice("");
    try {
      const res = await fetch("/api/outreach/import", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import failed");
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
      if (!res.ok) throw new Error();
      setNewName(""); setNewEmail(""); setNewCompany(""); setNewNotes("");
      setShowAddForm(false);
      setFilter("queued");
      await load();
    } catch {
      setNotice("Failed to add lead.");
    } finally {
      setAddingLead(false);
    }
  }

  async function handleDraft(lead: Lead) {
    const pendingEmail = emailEdits[lead.id];
    if (pendingEmail !== undefined && pendingEmail !== lead.email) {
      await persistEmail(lead.id, pendingEmail);
    }
    setDraftingId(lead.id);
    setNotice("");
    try {
      const res = await fetch("/api/outreach/draft", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          leadId: lead.id,
          name: lead.name,
          company: lead.company || lead.name,
          category: lead.category,
          network: lead.network,
          notes: lead.notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Draft failed");
      setNotice(`Draft ready for ${lead.company || lead.name} — see Drafted tab.`);
      setFilter("drafted");
      await load();
    } catch (e: unknown) {
      setNotice(e instanceof Error ? e.message : "Draft failed");
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
    const msg = msgByLead[lead.id];
    if (!msg) return;
    await fetch("/api/outreach/messages", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ messageId: msg.id, subject: editSubject, body: editBody }),
    });
    setEditingLeadId(null);
    await load();
  }

  async function handleApprove(lead: Lead) {
    const msg = msgByLead[lead.id];
    if (!msg) return;
    await fetch("/api/outreach/messages", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ messageId: msg.id, leadId: lead.id, status: "approved" }),
    });
    setFilter("approved");
    await load();
  }

  async function handleSend(lead: Lead) {
    const msg = msgByLead[lead.id];
    if (!msg) return;
    if (todayCount >= 50) { setNotice("Daily limit of 50 reached. Try again tomorrow."); return; }
    const emailVal = emailEdits[lead.id] !== undefined ? emailEdits[lead.id] : lead.email;
    setSendingId(lead.id);
    try {
      const res = await fetch("/api/outreach/send", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          messageId: msg.id,
          leadId: lead.id,
          toEmail: emailVal,
          subject: msg.subject,
          body: msg.body,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Send failed");
      setTodayCount(data.sentToday);
      setNotice(`Sent to ${emailVal} ✓`);
      setFilter("sent");
      await load();
    } catch (e: unknown) {
      setNotice(e instanceof Error ? e.message : "Send failed");
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

  const capPct = Math.min((todayCount / 50) * 100, 100);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: bg, display: "flex", alignItems: "center", justifyContent: "center", color: textMuted, fontFamily: "Outfit, sans-serif" }}>
        Loading outreach…
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: bg, fontFamily: "Outfit, sans-serif", color: "#fff", paddingBottom: 80 }}>

      {/* Header */}
      <div style={{ borderBottom: `1px solid ${border}`, padding: "32px 32px 24px" }}>
        <p style={{ color: gold, fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", margin: "0 0 6px", textTransform: "uppercase" }}>SignalBoost AI SDR</p>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 24, flexWrap: "wrap" }}>
          <h1 style={{ fontFamily: "Fraunces, serif", fontSize: 36, fontWeight: 700, margin: 0, lineHeight: 1 }}>Outreach</h1>
          <div style={{ marginBottom: 2 }}>
            <span style={{ fontSize: 13, color: textMuted }}>
              <span style={{ color: todayCount >= 50 ? "#ef4444" : gold, fontWeight: 700, fontSize: 16 }}>{todayCount}</span> / 50 sent today
            </span>
            <div style={{ marginTop: 6, width: 120, height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2 }}>
              <div style={{ width: `${capPct}%`, height: "100%", background: todayCount >= 50 ? "#ef4444" : gold, borderRadius: 2, transition: "width 0.4s" }} />
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "24px 24px" }}>

        {notice && (
          <div style={{ background: "rgba(245,197,66,0.08)", border: `1px solid rgba(245,197,66,0.25)`, borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: gold, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            {notice}
            <button onClick={() => setNotice("")} style={{ background: "none", border: "none", color: textMuted, cursor: "pointer", fontSize: 16 }}>×</button>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
          <button onClick={handleImport} disabled={importing} style={btn(importing ? "rgba(255,255,255,0.06)" : gold, importing ? textMuted : "#000")}>
            {importing ? "Importing…" : "⬇ Import Partners"}
          </button>
          <button onClick={() => setShowAddForm(!showAddForm)} style={btn("transparent", gold, gold)}>
            {showAddForm ? "Cancel" : "+ Add Lead"}
          </button>
        </div>

        {/* Add lead form */}
        {showAddForm && (
          <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 12, padding: 20, marginBottom: 20 }}>
            <p style={{ fontWeight: 700, margin: "0 0 14px", fontSize: 14, color: gold }}>New Lead</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
              {[
                { label: "Name *", val: newName, set: setNewName, ph: "Contact or company name" },
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
            <button onClick={handleAddLead} disabled={addingLead || !newName.trim()} style={btn(addingLead || !newName.trim() ? "rgba(255,255,255,0.06)" : goldDark, addingLead || !newName.trim() ? textMuted : "#000")}>
              {addingLead ? "Adding…" : "Add Lead"}
            </button>
          </div>
        )}

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 20, borderBottom: `1px solid ${border}` }}>
          {(["queued", "drafted", "approved", "sent"] as Filter[]).map((f) => (
            <button key={f} onClick={() => setFilter(f)} style={{
              background: "none", border: "none",
              borderBottom: filter === f ? `2px solid ${gold}` : "2px solid transparent",
              color: filter === f ? gold : textMuted,
              fontFamily: "Outfit, sans-serif", fontSize: 13,
              fontWeight: filter === f ? 700 : 400,
              padding: "8px 16px 10px", cursor: "pointer", textTransform: "capitalize",
            }}>
              {f} <span style={{ fontSize: 11, opacity: 0.7 }}>({counts[f]})</span>
            </button>
          ))}
        </div>

        {/* Empty state */}
        {visible.length === 0 ? (
          <div style={{ background: surface, border: `1px dashed ${border}`, borderRadius: 12, padding: "36px 24px", textAlign: "center", color: textMuted }}>
            {filter === "queued" && "No leads queued. Import your affiliate partners or add one manually."}
            {filter === "drafted" && "No drafts yet. Go to Queued, add an email, and click \"Draft with AI\"."}
            {filter === "approved" && "No approved messages. Open a draft and click Approve."}
            {filter === "sent" && "No sent messages yet."}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {visible.map((lead) => {
              const msg = msgByLead[lead.id];
              const sentMsg = sentMsgByLead[lead.id];
              const isEditing = editingLeadId === lead.id;
              const isDrafting = draftingId === lead.id;
              const isSending = sendingId === lead.id;
              const emailVal = emailEdits[lead.id] !== undefined ? emailEdits[lead.id] : lead.email;
              const hasEmail = !!emailVal;

              return (
                <div key={lead.id} style={{ background: surface, border: `1px solid ${border}`, borderRadius: 12, padding: 18 }}>

                  {/* Title */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                    <div>
                      <span style={{ fontWeight: 700, fontSize: 15 }}>{lead.company || lead.name}</span>
                      {lead.category && <span style={{ color: textMuted, fontSize: 13, marginLeft: 8 }}>· {lead.category}</span>}
                      {lead.network && <span style={{ color: textMuted, fontSize: 13, marginLeft: 6 }}>· {lead.network}</span>}
                    </div>
                    {filter !== "sent" && (
                      <button onClick={() => handleSkip(lead)} title="Skip" style={{ background: "none", border: "none", color: textMuted, cursor: "pointer", fontSize: 18, lineHeight: 1 }}>×</button>
                    )}
                  </div>

                  {/* Email */}
                  <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 12, color: textMuted, width: 24, flexShrink: 0 }}>To:</span>
                    {filter === "sent" ? (
                      <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{lead.email}</span>
                    ) : (
                      <input
                        value={emailVal}
                        onChange={(e) => setEmailEdits((p) => ({ ...p, [lead.id]: e.target.value }))}
                        onBlur={() => persistEmail(lead.id, emailVal)}
                        onKeyDown={(e) => { if (e.key === "Enter") persistEmail(lead.id, emailVal); }}
                        placeholder="Add contact email before sending…"
                        style={{ flex: 1, background: hasEmail ? "transparent" : "rgba(245,197,66,0.05)", border: `1px solid ${hasEmail ? border : "rgba(245,197,66,0.3)"}`, borderRadius: 6, padding: "6px 10px", color: "#fff", fontFamily: "Outfit, sans-serif", fontSize: 13 }}
                      />
                    )}
                    {savingEmail === lead.id && <span style={{ fontSize: 11, color: textMuted }}>saving…</span>}
                  </div>

                  {/* Sent info */}
                  {filter === "sent" && sentMsg && (
                    <div style={{ marginTop: 12, background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: 12 }}>
                      <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 600 }}>{sentMsg.subject}</p>
                      {sentMsg.sent_at && <p style={{ margin: 0, fontSize: 12, color: textMuted }}>Sent {new Date(sentMsg.sent_at).toLocaleString()}</p>}
                    </div>
                  )}

                  {/* Draft preview */}
                  {msg && !isEditing && filter !== "sent" && (
                    <div style={{ marginTop: 14, background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: 14 }}>
                      <p style={{ fontSize: 11, color: textMuted, margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Subject</p>
                      <p style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 600 }}>{msg.subject}</p>
                      <p style={{ fontSize: 11, color: textMuted, margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Message</p>
                      <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.75)", whiteSpace: "pre-wrap", lineHeight: 1.65 }}>{msg.body}</p>
                    </div>
                  )}

                  {/* Edit form */}
                  {isEditing && (
                    <div style={{ marginTop: 14 }}>
                      <label style={{ fontSize: 11, color: textMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>Subject</label>
                      <input value={editSubject} onChange={(e) => setEditSubject(e.target.value)} style={{ ...inp, marginTop: 4, marginBottom: 10 }} />
                      <label style={{ fontSize: 11, color: textMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>Message</label>
                      <textarea value={editBody} onChange={(e) => setEditBody(e.target.value)} rows={10}
                        style={{ ...inp, marginTop: 4, lineHeight: 1.65, resize: "vertical" } as React.CSSProperties} />
                      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                        <button onClick={() => saveEdit(lead)} style={btn(gold, "#000")}>Save</button>
                        <button onClick={() => setEditingLeadId(null)} style={btn("transparent", textMuted, border)}>Cancel</button>
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  {filter !== "sent" && !isEditing && (
                    <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {(filter === "queued" || filter === "drafted") && (
                        <button onClick={() => handleDraft(lead)} disabled={isDrafting}
                          style={btn("rgba(59,130,246,0.12)", isDrafting ? textMuted : "#60a5fa", "rgba(59,130,246,0.3)")}>
                          {isDrafting ? "Writing draft…" : msg ? "↺ Re-draft" : "✦ Draft with AI"}
                        </button>
                      )}
                      {msg && filter === "drafted" && !isEditing && (
                        <>
                          <button onClick={() => startEdit(lead)} style={btn("rgba(255,255,255,0.06)", "rgba(255,255,255,0.7)", border)}>Edit</button>
                          <button onClick={() => handleApprove(lead)} disabled={!hasEmail}
                            title={hasEmail ? undefined : "Add email first"}
                            style={btn(hasEmail ? "rgba(16,185,129,0.12)" : "rgba(255,255,255,0.04)", hasEmail ? "#34d399" : textMuted, hasEmail ? "rgba(16,185,129,0.3)" : border)}>
                            ✓ Approve
                          </button>
                        </>
                      )}
                      {msg && filter === "approved" && (
                        <button onClick={() => handleSend(lead)}
                          disabled={isSending || !hasEmail || todayCount >= 50}
                          title={!hasEmail ? "Add email first" : todayCount >= 50 ? "Daily limit reached" : undefined}
                          style={btn(isSending || !hasEmail || todayCount >= 50 ? "rgba(255,255,255,0.06)" : gold, isSending || !hasEmail || todayCount >= 50 ? textMuted : "#000")}>
                          {isSending ? "Sending…" : "↗ Send Now"}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
