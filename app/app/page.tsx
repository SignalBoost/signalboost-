// File: app/app/page.tsx
// Customer workspace — where signed-up users run their own company. Shows the
// SaaS tools; each tool's data is private to the user (enforced by RLS).
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "My Workspace | SignalBoost" };

const GOLD = "#f5c542";
const PANEL = "#0f141b";
const BORDER = "#1e2630";
const TEXT = "#e6edf3";
const MUTED = "#9aa8b8";

type Tool = { href: string; title: string; desc: string; icon: string; accent: string; soon?: boolean };

const TOOLS: Tool[] = [
  { href: "/spreadsheets", title: "Spreadsheets", desc: "Partner data, budgets, inventory, forecasts.", icon: "📊", accent: "#34d399" },
  { href: "/promote", title: "Promote Business", desc: "Geo-aware campaigns, offers, and placements.", icon: "📣", accent: "#f5c542" },
  { href: "/reviews", title: "Reviews", desc: "Collect, triage, and respond to feedback.", icon: "⭐", accent: "#7dd3fc" },
  { href: "/assistant", title: "Personal Assistant", desc: "AI copilot for discovery, tasks, and briefings.", icon: "🤖", accent: "#22d3ee" },
  { href: "/calendar", title: "Calendar", desc: "Bookings, launches, follow-ups.", icon: "🗓", accent: "#a78bfa", soon: true },
  { href: "/outreach", title: "Outreach", desc: "Email, partner, and customer sequences.", icon: "📨", accent: "#fb7185", soon: true },
];

export default async function AppWorkspace() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?flow=main&next=/app");
  const email = (user.email || "").toLowerCase();

  return (
    <div style={{ minHeight: "100vh", background: "#06060a", color: TEXT, fontFamily: "'Outfit', system-ui, sans-serif", padding: "28px clamp(16px,3vw,36px)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ background: "linear-gradient(135deg, rgba(245,197,66,.08), rgba(245,197,66,0))", border: `1px solid ${BORDER}`, borderRadius: 16, padding: "20px 22px", marginBottom: 22 }}>
          <h1 style={{ fontSize: 22, fontWeight: 900, margin: "0 0 4px" }}>My workspace</h1>
          <p style={{ color: MUTED, fontSize: 14, margin: 0 }}>Run your business — your tools, your data. Signed in as {email}.</p>
        </div>

        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
          {TOOLS.map((t) => (
            <Link key={t.href} href={t.href} style={{ display: "block", textDecoration: "none", background: PANEL, border: `1px solid ${BORDER}`, borderLeft: `3px solid ${t.accent}`, borderRadius: 14, padding: 16, color: TEXT }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 22, lineHeight: 1 }}>{t.icon}</span>
                <span style={{ fontSize: 16, fontWeight: 800 }}>{t.title}</span>
                {t.soon && <span style={{ marginLeft: "auto", fontSize: 9, fontWeight: 900, letterSpacing: ".08em", textTransform: "uppercase", color: "#06060a", background: "linear-gradient(135deg,#f5c542,#dfa837)", borderRadius: 999, padding: "3px 8px" }}>Soon</span>}
              </div>
              <div style={{ color: MUTED, fontSize: 13, lineHeight: 1.5 }}>{t.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
