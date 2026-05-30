import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminMissionControl from "@/components/admin/AdminMissionControl";

const OWNER_EMAIL = "cadomos@gmail.com";

function adminList(): string[] {
  const env = (process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  return Array.from(new Set([OWNER_EMAIL, ...env]));
}

export default async function AdminHub() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");
  const email = (user.email || "").toLowerCase();
  if (!adminList().includes(email)) redirect("/");

  return <AdminMissionControl email={email} />;
}
