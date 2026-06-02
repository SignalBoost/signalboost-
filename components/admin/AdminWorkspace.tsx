// File: components/admin/AdminWorkspace.tsx
// The redesigned admin workspace UI. Sectioned company-operations hub:
//   • Header with brand + "Back to site"
//   • Operations: the 6 SaaS Station tools (run your company from here)
//   • Partners: add / manage the affiliate directory
//   • Analytics: stats
//   • Team: promote/revoke admins (owner is protected)
//   • Executive cockpit (collapsible) at the bottom
"use client";

import Link from "next/link";
import { useState } from "react";
import AdminRoles from "@/components/admin/AdminRoles";
import ExecutiveCockpit from "@/components/dashboard/ExecutiveCockpit";

const GOLD = "#f5c542";
const DARK = "#06060a";
const PANEL = "#0f141b";
const BORDER = "#1e2630";
const TEXT = "#e6edf3";
const MUTED = "#9aa8b8";

type Tool = { href: string; title: string; desc: string; icon: string; accent: string; soon?: boolean };

const OPERATIONS: Tool[] = [
  { href: "/promote", title: "Promote Business", desc: "Geo-aware campaigns, offers, and affiliate placements.", icon: "📣", accent: "#f5c542" },
  { href: "/reviews", title: "Reviews", desc: "Collect, triage, and respond to customer feedback.", icon: "⭐", accent: "#7dd3fc" },
  { href: "/outreach", title: "Outreach", desc: "Email, partner, and customer sequences.", icon: "📨", accent: "#fb7185", soon: true },
  { href: "/calendar", title: "Calendar", desc: "Bookings, launches, follow-ups, check-ins.", icon: "🗓", accent: "#a78bfa", soon: true },
  { href: "/spreadsheets", title: "Spreadsheets", desc: "Partner data, budgets, inventory, forecasts.", icon: "📊", accent: "#34d399", soon: true },
  { href: "/assistant", title: "Personal Assistant", desc: "AI copilot for discovery, tasks, and briefings.", icon: "🤖", accent: "#22d3ee" },
];

const PARTNERS: Tool[] = [
  { href: "/admin/partners/add", title: "Add a partner", desc: "Add a new affiliate partner. Live on the site in ~1 min — no code.", icon: "➕", accent: "#34d399" },
  { href: "/admin/partners/manage", title: "Manage partners", desc: "View, edit regions, and delete existing partners.", icon: "🗂", accent: "#7dd3fc" },
];

const ANALYTICS: Tool[] = [
  { href: "/admin/stats", title: "Statistics", desc: "Clicks, searches, regions — see what's working.", icon: "📈", accent: "#f5c542" },
];

function ToolCard({ tool }: { tool: Tool }) {
  const inner = (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <span style={{ fontSize: 22, lineHeight: 1 }}>{tool.icon}</span>
        <span style={{ fontSize: 16, fontWeight: 800, color: TEXT }}>{tool.title}</span>
        {tool.soon && (
          <span style={{ marginLeft: "auto", fontSize: 9, fontWeight: 900, letterSpacing: ".08em", textTransform: "uppercase", color: "#06060a", background: "linear-gradient(135deg,#f5c542,#dfa837)", borderRadius: 999, padding: "3px 8px" }}>Soon</span>
        )}
      </div>
      <div style={{ color: MUTED, fontSize: 13, lineHeight: 1.5 }}>{tool.desc}</div>
    </>
  );
  return (
    <Link href={tool.href}
      style={{
        display: "block", textDecoration: "none", background: PANEL,
        border: `1px solid ${BORDER}`, borderLeft: `3px solid ${tool.accent}`,
        borderRadius: 14, padding: 16, color: TEXT,
      }}
    >
      {inner}
    </Link>
  );
}

function Section({ title, hint, tools }: { title: string; hint?: string; tools: Tool[] }) {
  return (
    <section style={{ marginTop: 28 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 12 }}>
        <h2 style={{ fontSize: 13, fontWeight: 900, letterSpacing: ".14em", textTransform: "uppercase", color: GOLD, margin: 0 }}>{title}</h2>
        {hint && <span style={{ color: MUTED, fontSize: 12 }}>{hint}</span>}
      </div>
      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
        {tools.map((t) => <ToolCard key={t.href} tool={t} />)}
      </div>
    </section>
  );
}

export default function AdminWorkspace({ email }: { email: string }) {
  const [showCockpit, setShowCockpit] = useState(false);

  return (
    <div style={{ minHeight: "100vh", background: DARK, color: TEXT, fontFamily: "'Outfit', system-ui, sans-serif" }}>
      {/* Header */}
      <header style={{ borderBottom: `1px solid ${BORDER}`, background: "rgba(15,20,27,.6)", backdropFilter: "blur(12px)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "16px clamp(16px,3vw,28px)", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 20, fontWeight: 900, letterSpacing: "-.02em" }}>
              <span style={{ color: "#fff" }}>signal</span><span style={{ color: GOLD }}>boost</span>
              <span style={{ color: MUTED, fontWeight: 700 }}>  /  admin</span>
            </span>
            <span style={{ color: MUTED, fontSize: 12, marginTop: 2 }}>Signed in as {email}</span>
          </div>
          <Link href="/"
            style={{
              marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 6,
              border: `1px solid ${BORDER}`, borderRadius: 999, padding: "8px 16px",
              color: TEXT, textDecoration: "none", fontSize: 13, fontWeight: 800,
              background: "rgba(255,255,255,.04)",
            }}
          >
            ← Back to site
          </Link>
        </div>
      </header>

      {/* Body */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px clamp(16px,3vw,28px) 64px" }}>
        <div style={{ background: "linear-gradient(135deg, rgba(245,197,66,.08), rgba(245,197,66,0))", border: `1px solid ${BORDER}`, borderRadius: 16, padding: "18px 20px" }}>
          <h1 style={{ fontSize: 22, fontWeight: 900, margin: "0 0 4px" }}>Company operations</h1>
          <p style={{ color: MUTED, fontSize: 14, margin: 0 }}>Run your business and manage the marketplace — all tools, unlimited, no plan limits.</p>
        </div>

        <Section title="Operations" hint="Your SaaS Station tools" tools={OPERATIONS} />
        <Section title="Partners" hint="The affiliate directory" tools={PARTNERS} />
        <Section title="Analytics" tools={ANALYTICS} />

        <section style={{ marginTop: 28 }}>
          <h2 style={{ fontSize: 13, fontWeight: 900, letterSpacing: ".14em", textTransform: "uppercase", color: GOLD, margin: "0 0 12px" }}>Team</h2>
          <AdminRoles />
        </section>

        <section style={{ marginTop: 28 }}>
          <button type="button" onClick={() => setShowCockpit((v) => !v)}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8, border: `1px solid ${BORDER}`,
              background: PANEL, color: TEXT, borderRadius: 12, padding: "10px 16px",
              fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
            }}
          >
            {showCockpit ? "▾ Hide" : "▸ Show"} executive cockpit
          </button>
          {showCockpit && (
            <div style={{ marginTop: 16 }}>
              <ExecutiveCockpit />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
