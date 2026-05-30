// File: app/admin/page.tsx
// Admin hub — the landing page behind the ⚙ Admin tab. Server-gated: only
// users whose email is in the admin allow-list can view it; everyone else is
// redirected home. Holds links to the admin tools (Add Partner now; Manage and
// Stats as they're built).

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import NasaMissionControl from "@/components/admin/NasaMissionControl";

const OWNER_EMAIL = "cadomos@gmail.com";
function adminList(): string[] {
  const env = (process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return Array.from(new Set([OWNER_EMAIL, ...env]));
}

export default async function AdminHub() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Not logged in → send to login. Logged in but not admin → send home.
  if (!user) redirect("/auth/login");
  const email = (user.email || "").toLowerCase();
  if (!adminList().includes(email)) redirect("/");

  return <NasaMissionControl email={email} />;

}
