import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { checkAccess } from "@/lib/access";
import OutreachDashboard from "@/components/outreach/OutreachDashboard";
import UpgradeGate from "@/components/UpgradeGate";

export const metadata = { title: "Outreach — SignalBoost" };

export default async function OutreachPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const access = await checkAccess("outreach");
  if (!access.allowed) {
    return (
      <UpgradeGate
        feature="Outreach"
        requiredPlan={access.requiredPlan}
        reason={access.reason === "no_user" ? "no_user" : access.reason === "inactive" ? "inactive" : "plan_too_low"}
      />
    );
  }

  return <OutreachDashboard userId={user.id} />;
}
