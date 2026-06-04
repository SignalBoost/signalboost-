import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { checkAccess } from "@/lib/access";
import { getExecutiveTelemetry } from "@/lib/executive";
import UpgradeGate from "@/components/UpgradeGate";

export const metadata = {
  title: "Executive Dashboard · SignalBoost",
  description: "CRM telemetry and revenue forecasting from your live outreach pipeline.",
};

// Always compute fresh from live data
export const dynamic = "force-dynamic";

const gold = "#f5c542";
const bg = "#06060a";
const border = "rgba(255,255,255,0.08)";
const textMuted = "rgba(255,255,255,0.45)";

function pct(v: number | null): string {
  return v == null ? "—" : `${(v * 100).toFixed(1)}%`;
}
function money(v: number | null | undefined): string {
  if (v == null) return "—";
  return `$${Math.round(v).toLocaleString()}`;
}

export default async function ExecutivePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const access = await checkAccess("executive");
  if (!access.allowed) {
    return (
      <UpgradeGate
        feature="Executive Dashboard"
        requiredPlan={access.requiredPlan}
        reason={access.reason === "no_user" ? "no_user" : access.reason === "inactive" ? "inactive" : "plan_too_low"}
      />
    );
  }

  const t = await getExecutiveTelemetry(user.id);
