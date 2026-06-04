import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SubscriptionsContent from "@/components/subscriptions/SubscriptionsContent";

export const metadata = { title: "Subscriptions | SignalBoost" };
export const dynamic = "force-dynamic";

export default async function SubscriptionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("plan, status, current_period_end")
    .eq("owner_id", user.id)
    .single();

  return (
    <SubscriptionsContent
      email={user.email || ""}
      plan={sub?.plan || "free"}
      status={sub?.status || "inactive"}
      periodEnd={sub?.current_period_end || null}
    />
  );
}
