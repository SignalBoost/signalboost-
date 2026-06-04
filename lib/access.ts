import { createClient } from "@/lib/supabase/server";

// Which plans grant access to which features.
// Starter: marketplace, reviews, calendar, concierge
// Growth: everything in Starter + outreach, promote, spreadsheets, executive
// Enterprise: everything
export const FEATURE_MIN_PLAN: Record<string, "starter" | "growth" | "enterprise"> = {
  reviews: "starter",
  calendar: "starter",
  marketplace: "starter",
  concierge: "starter",
  outreach: "growth",
  promote: "growth",
  spreadsheets: "growth",
  executive: "growth",
};

const PLAN_RANK: Record<string, number> = {
  free: 0,
  starter: 1,
  growth: 2,
  enterprise: 3,
};

export type AccessResult = {
  allowed: boolean;
  plan: string;
  isAdmin: boolean;
  reason: "ok" | "no_user" | "plan_too_low" | "inactive";
  requiredPlan: string | null;
};

// Server-side gate check. Call from a feature page or API route.
export async function checkAccess(feature: string): Promise<AccessResult> {
  const required = FEATURE_MIN_PLAN[feature] || "starter";
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { allowed: false, plan: "free", isAdmin: false, reason: "no_user", requiredPlan: required };
  }

  // Admins (you) bypass all gates.
  const { data: adminFlag } = await supabase.rpc("is_admin");
  if (adminFlag === true) {
    return { allowed: true, plan: "admin", isAdmin: true, reason: "ok", requiredPlan: required };
  }

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("plan, status")
    .eq("owner_id", user.id)
    .single();

  const plan = sub?.plan || "free";
  const status = sub?.status || "inactive";

  // Plan must be active to count.
  const activePlan = status === "active" ? plan : "free";

  const allowed = (PLAN_RANK[activePlan] ?? 0) >= (PLAN_RANK[required] ?? 99);

  return {
    allowed,
    plan: activePlan,
    isAdmin: false,
    reason: allowed ? "ok" : status !== "active" && plan !== "free" ? "inactive" : "plan_too_low",
    requiredPlan: required,
  };
}
