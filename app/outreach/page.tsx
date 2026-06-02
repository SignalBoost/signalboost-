import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import OutreachDashboard from "@/components/outreach/OutreachDashboard";

export const metadata = { title: "Outreach — SignalBoost" };

export default async function OutreachPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  return <OutreachDashboard userId={user.id} />;
}
