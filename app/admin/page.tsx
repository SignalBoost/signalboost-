// File: app/admin/page.tsx
// Admin hub — the landing page behind the Admin tab. Server-gated using the
// DATABASE as the single source of truth (is_admin() RPC + user_roles), so
// admins promoted via the Admin team form get access with no code/redeploy.
// Holds links to the admin tools plus the admin-team management form.
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminCockpit from "@/components/admin/AdminCockpit";
import AdminRoles from "@/components/admin/AdminRoles";
import ExecutiveCockpit from "@/components/dashboard/ExecutiveCockpit";

const GOLD = "#f5c542";
const DARK = "#0d1117";
const PANEL = "#0f141b";
const BORDER = "#1e2630";
const TEXT = "#e6edf3";
const MUTED = "#9aa8b8";

const TOOLS: { href: string; title: string; desc: string; ready: boolean }[] = [
  { href: "/admin/partners/add", title: "➕ Add a partner", desc: "Add a new affiliate partner. Goes live on the site instantly — no code.", ready: true },
  { href: "/admin/partners/manage", title: "🗂 Manage partners", desc: "View, edit, and delete existing partners.", ready: true },
  { href: "/admin/stats", title: "📊 Statistics", desc: "Clicks, searches, regions — see what's working.", ready: true },
];

export default async function AdminHub() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Not logged in → login. Logged in but not a DB admin → home.
  if (!user) redirect("/auth/login");

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (isAdmin !== true) redirect("/");

  const email = (user.email || "").toLowerCase();

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

        <div style={{ marginTop: 24 }}>
          <AdminRoles />
        </div>

        <div style={{ marginTop: 24 }}>
          <AdminCockpit />
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "36px auto 0" }}>
        <ExecutiveCockpit />
      </div>
    </div>
  );
}
