import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CalendarDashboard from "@/components/calendar/CalendarDashboard";

export const metadata = { title: "Calendar — SignalBoost" };

export default async function CalendarPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  return <CalendarDashboard userId={user.id} />;
}
