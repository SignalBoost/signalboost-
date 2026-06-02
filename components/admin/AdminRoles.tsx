// File: components/admin/AdminRoles.tsx
// Promote/revoke admins from the database (user_roles). RLS ensures only
// existing admins can actually read or modify — this UI just drives it.
"use client";

import { useEffect, useState } from "react";
import { listAdmins, promoteAdmin, revokeAdmin, type AdminRole } from "@/lib/admins";

const GOLD = "#f5c542";
const PANEL = "#0f141b";
const BORDER = "#1e2630";
const TEXT = "#e6edf3";
const MUTED = "#9aa8b8";

// The owner account can never be removed (also enforced in the database).
const OWNER_EMAIL = "cadomos@gmail.com";

export default function AdminRoles() {
  const [admins, setAdmins] = useState<AdminRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  async function refresh() {
    setLoading(true);
    setAdmins(await listAdmins());
    setLoading(false);
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function handlePromote() {
    const clean = email.trim();
    if (!clean || busy) return;
    setBusy(true);
    setMsg(null);
    const res = await promoteAdmin(clean);
    setBusy(false);
    if (res.ok) {
      setEmail("");
      setMsg({ kind: "ok", text: `${clean} is now an admin.` });
      void refresh();
    } else {
      setMsg({ kind: "err", text: res.error || "Could not add admin." });
    }
  }

  async function handleRevoke(role: AdminRole) {
    if (!confirm(`Remove admin access for ${role.email}?`)) return;
    const res = await revokeAdmin(role.id);
    if (res.ok) void refresh();
    else setMsg({ kind: "err", text: res.error || "Could not remove admin." });
  }

  return (
    <div style={{ background: PANEL, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 20 }}>
      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6, color: TEXT }}>👥 Admin team</div>
      <div style={{ color: MUTED, fontSize: 14, marginBottom: 16 }}>
        Grant or remove admin access by email. Changes take effect immediately — no code or redeploy.
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
        <input value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handlePromote()}
          placeholder="teammate@example.com"
          style={{
            flex: 1, minWidth: 200, boxSizing: "border-box", padding: "10px 12px", borderRadius: 10,
            border: `1px solid ${BORDER}`, background: DARKINPUT, color: TEXT, fontSize: 14, outline: "none",
          }}
        />
        <button type="button" onClick={handlePromote}
          disabled={!email.trim() || busy}
          style={{
            padding: "10px 18px", borderRadius: 10, border: "none", fontWeight: 800, fontSize: 14,
            color: "#06060a", background: GOLD, cursor: !email.trim() || busy ? "default" : "pointer",
            opacity: !email.trim() || busy ? 0.5 : 1, whiteSpace: "nowrap",
          }}
        >
          {busy ? "Adding…" : "Make admin"}
        </button>
      </div>

      {msg && (
        <p style={{ color: msg.kind === "ok" ? GOLD : "#f8857a", fontSize: 13, margin: "0 0 12px" }}>{msg.text}</p>
      )}

      {loading ? (
        <p style={{ color: MUTED, fontSize: 14 }}>Loading…</p>
      ) : (
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
          {admins.map((a) => (
            <li key={a.id}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
                padding: "10px 12px", borderRadius: 10, background: "rgba(255,255,255,.03)", border: `1px solid ${BORDER}`,
              }}
            >
              <span style={{ color: TEXT, fontSize: 14 }}>{a.email}</span>
              {a.email.toLowerCase() === OWNER_EMAIL ? (
                <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: ".06em", textTransform: "uppercase", color: "#06060a", background: GOLD, borderRadius: 999, padding: "4px 10px" }}>Owner</span>
              ) : (
                <button type="button" onClick={() => handleRevoke(a)}
                  style={{ background: "none", border: "none", color: MUTED, fontSize: 13, cursor: "pointer", fontWeight: 700 }}
                >
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const DARKINPUT = "#0a0e14";
