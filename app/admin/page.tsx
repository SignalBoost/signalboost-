// File: app/admin/page.tsx
// Admin hub — the landing page behind the ⚙ Admin tab. Server-gated: only
// users whose email is in the admin allow-list can view it; everyone else is
// redirected home. Holds links to the admin tools (Add Partner now; Manage and
// Stats as they're built).

import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminCockpit from "@/components/admin/AdminCockpit";

const GOLD = "#f5c542";
const DARK = "#0d1117";
const PANEL = "#0f141b";
const BORDER = "#1e2630";
const TEXT = "#e6edf3";
const MUTED = "#9aa8b8";

const OWNER_EMAIL = "cadomos@gmail.com";
function adminList(): string[] {
  const env = (process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return Array.from(new Set([OWNER_EMAIL, ...env]));
}

const TOOLS: { href: string; title: string; desc: string; ready: boolean }[] = [
  { href: "/admin/partners/add", title: "➕ Add a partner", desc: "Add a new affiliate partner. Goes live on the site instantly — no code.", ready: true },
  { href: "/admin/partners/manage", title: "🗂 Manage partners", desc: "View, edit, and delete existing partners.", ready: false },
  { href: "/admin/stats", title: "📊 Statistics", desc: "Clicks, searches, regions — see what's working.", ready: true },
];

export default async function AdminHub() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Not logged in → send to login. Logged in but not admin → send home.
  if (!user) redirect("/auth/login");
  const email = (user.email || "").toLowerCase();
  if (!adminList().includes(email)) redirect("/");

  return (
    <div style={{ minHeight: "100vh", background: DARK, color: TEXT, fontFamily: "system-ui, sans-serif", padding: "40px 18px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 4px", color: GOLD }}>Admin</h1>
        <p style={{ color: MUTED, fontSize: 14, margin: "0 0 28px" }}>
          Signed in as {email}. Your tools:
        </p>

        <div style={{ display: "grid", gap: 14 }}>
          {TOOLS.map((tool) =>
            tool.ready ? (
              <Link
                key={tool.href}
                href={tool.href}
                style={{
                  display: "block",
                  textDecoration: "none",
                  background: PANEL,
                  border: `1px solid ${BORDER}`,
                  borderRadius: 16,
                  padding: 20,
                  color: TEXT,
                  transition: "border-color .15s",
                }}
              >
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>{tool.title}</div>
                <div style={{ color: MUTED, fontSize: 14 }}>{tool.desc}</div>
              </Link>
            ) : (
              <div
                key={tool.href}
                style={{
                  background: PANEL,
                  border: `1px dashed ${BORDER}`,
                  borderRadius: 16,
                  padding: 20,
                  opacity: 0.6,
                }}
              >
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>{tool.title}</div>
                <div style={{ color: MUTED, fontSize: 14 }}>{tool.desc}</div>
              </div>
            )
          )}
        </div>

        <div style={{ marginTop: 34 }}>
          <AdminCockpit />
        </div>

        <p style={{ color: MUTED, fontSize: 12, marginTop: 28 }}>
          To add a teammate as admin: set the <span style={{ color: GOLD }}>ADMIN_EMAILS</span> environment
          variable in Vercel (comma-separated). The owner email always has access.
        </p>
      </div>
    </div>
  );
}
