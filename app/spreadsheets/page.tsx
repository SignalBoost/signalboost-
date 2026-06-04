// File: app/spreadsheets/page.tsx
// Real spreadsheets tool, gated to Growth+ (or admin). Data is per-user (RLS).
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { checkAccess } from "@/lib/access";
import SpreadsheetsTool from "@/components/tools/SpreadsheetsTool";
import UpgradeGate from "@/components/UpgradeGate";

export const metadata = { title: "Spreadsheets | SignalBoost" };

export default async function Page() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?flow=main&next=/spreadsheets");

  const access = await checkAccess("spreadsheets");
  if (!access.allowed) {
    return (
      <UpgradeGate
        feature="Spreadsheets"
        requiredPlan={access.requiredPlan}
        reason={access.reason === "no_user" ? "no_user" : access.reason === "inactive" ? "inactive" : "plan_too_low"}
      />
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#06060a", color: "#e6edf3", fontFamily: "'Outfit', system-ui, sans-serif", padding: "28px clamp(16px,3vw,36px)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
          <h1 style={{ fontSize: 24, fontWeight: 900, margin: 0 }}>📊 Spreadsheets</h1>
          <Link href="/app" style={{ marginLeft: "auto", color: "#9aa8b8", textDecoration: "none", fontSize: 13, fontWeight: 700, border: "1px solid #1e2630", borderRadius: 999, padding: "7px 14px" }}>← My workspace</Link>
        </div>
        <SpreadsheetsTool />
      </div>
    </div>
  );
}
