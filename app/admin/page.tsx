// File: app/admin/page.tsx
// Admin workspace — the company operations hub behind the Admin tab.
// Server-gated via the is_admin() RPC (database is the source of truth: the
// user_roles table treats both 'admin' and 'owner' roles as admin).
//
// Layout: a tight header with a "Back to site" link, then sectioned tools —
// Operations (the 6 SaaS Station modules), Partners, Analytics — followed by
// the Admin team manager and the executive cockpit.
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminWorkspace from "@/components/admin/AdminWorkspace";

export const metadata = { title: "Admin Workspace | SignalBoost" };

export default async function AdminHub() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (isAdmin !== true) redirect("/");

  const email = (user.email || "").toLowerCase();
  return <AdminWorkspace email={email} />;
}
