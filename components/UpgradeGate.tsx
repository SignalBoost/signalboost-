const gold = "#f5c542";
const muted = "#9aa8b8";

const PLAN_LABELS: Record<string, string> = {
  starter: "Starter",
  growth: "Growth",
  enterprise: "Enterprise",
};

export default function UpgradeGate({
  feature,
  requiredPlan,
  reason,
}: {
  feature: string;
  requiredPlan: string | null;
  reason: "no_user" | "plan_too_low" | "inactive";
}) {
  const planLabel = requiredPlan ? PLAN_LABELS[requiredPlan] || requiredPlan : "a paid";

  const headline =
    reason === "no_user" ? "Sign in to continue"
    : reason === "inactive" ? "Your plan isn't active"
    : `Upgrade to ${planLabel}`;

  const body =
    reason === "no_user"
      ? `${feature} is part of SignalBoost. Sign in or create a free account to get started.`
      : reason === "inactive"
      ? `Your subscription is paused or canceled. Reactivate your plan to use ${feature} again.`
      : `${feature} is included in the ${planLabel} plan. Upgrade to unlock it.`;

  const primaryHref = reason === "no_user" ? "/auth/login" : "/pricing";
  const primaryLabel = reason === "no_user" ? "Sign in" : `View plans`;

  return (
    <main style={{ minHeight: "70vh", background: "#06060a", color: "#e6edf3", fontFamily: "'Outfit', system-ui, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 18px" }}>
      <div style={{ maxWidth: 460, textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>🔒</div>
        <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".18em", textTransform: "uppercase", color: "#dfa837", margin: "0 0 8px" }}>SignalBoost</p>
        <h1 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 12px" }}>{headline}</h1>
        <p style={{ fontSize: 15, color: muted, lineHeight: 1.6, margin: "0 0 24px" }}>{body}</p>
        <a href={primaryHref} style={{ display: "inline-block", background: gold, color: "#06060a", borderRadius: 10, padding: "12px 28px", fontSize: 15, fontWeight: 800, textDecoration: "none" }}>
          {primaryLabel}
        </a>
        {reason !== "no_user" && (
          <p style={{ marginTop: 16 }}>
            <a href="/subscriptions" style={{ color: muted, fontSize: 13, textDecoration: "none" }}>Manage your subscription →</a>
          </p>
        )}
      </div>
    </main>
  );
}
