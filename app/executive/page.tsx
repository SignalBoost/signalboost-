import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getExecutiveTelemetry } from "@/lib/executive";

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

  const t = await getExecutiveTelemetry(user.id);

  const stageRows: { label: string; key: keyof typeof t.stages; color: string }[] = [
    { label: "Queued", key: "queued", color: "#6b7280" },
    { label: "Drafted", key: "drafted", color: "#3b82f6" },
    { label: "Approved", key: "approved", color: "#10b981" },
    { label: "Sent", key: "sent", color: "#f5c542" },
    { label: "Replied", key: "replied", color: "#38bdf8" },
    { label: "Demo", key: "demo", color: "#a78bfa" },
    { label: "Closed", key: "closed", color: "#34d399" },
    { label: "Lost", key: "lost", color: "#ef4444" },
  ];
  const maxStage = Math.max(1, ...stageRows.map((r) => t.stages[r.key]));

  return (
    <div style={{ minHeight: "100vh", background: bg, fontFamily: "Outfit, sans-serif", color: "#fff", padding: "0 0 80px" }}>
      {/* Compact header bar */}
      <div style={{ borderBottom: `1px solid ${border}`, padding: "24px 32px" }}>
        <p style={{ color: gold, fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", margin: "0 0 6px", textTransform: "uppercase" }}>
          SignalBoost · Enterprise
        </p>
        <h1 style={{ fontFamily: "Fraunces, serif", fontSize: 30, fontWeight: 700, margin: 0, lineHeight: 1.1 }}>
          Executive Dashboard
        </h1>
        <p style={{ color: textMuted, fontSize: 13, margin: "8px 0 0" }}>
          CRM telemetry and revenue forecasting computed live from your outreach pipeline.
        </p>
      </div>

      <div style={{ maxWidth: 880, margin: "0 auto", padding: "28px 24px" }}>
        {/* Top metrics */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12, marginBottom: 28 }}>
          {[
            { label: "Total Leads", value: t.totalLeads.toLocaleString() },
            { label: "Closed Revenue", value: money(t.closedRevenue), accent: "#34d399" },
            { label: "Avg Deal Value", value: money(t.avgDealValue) },
            { label: "Sent (30d)", value: t.sendVelocity.last30.toLocaleString() },
          ].map((m) => (
            <div key={m.label} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${border}`, borderRadius: 12, padding: "16px 18px" }}>
              <p style={{ margin: 0, fontSize: 11, color: textMuted, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>{m.label}</p>
              <p style={{ margin: "8px 0 0", fontSize: 26, fontWeight: 700, fontFamily: "Fraunces, serif", color: m.accent || "#fff" }}>{m.value}</p>
            </div>
          ))}
        </div>

        {/* Funnel */}
        <h2 style={{ fontSize: 13, fontWeight: 700, color: textMuted, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 14px" }}>
          Pipeline Funnel
        </h2>
        <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${border}`, borderRadius: 12, padding: "18px 20px", marginBottom: 28 }}>
          {stageRows.map((r) => {
            const count = t.stages[r.key];
            const w = (count / maxStage) * 100;
            return (
              <div key={r.key} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                <span style={{ width: 72, fontSize: 12, color: textMuted, flexShrink: 0 }}>{r.label}</span>
                <div style={{ flex: 1, height: 22, background: "rgba(255,255,255,0.04)", borderRadius: 5, overflow: "hidden" }}>
                  <div style={{ width: `${w}%`, height: "100%", background: r.color, opacity: 0.8, borderRadius: 5, transition: "width 0.4s", minWidth: count > 0 ? 3 : 0 }} />
                </div>
                <span style={{ width: 40, textAlign: "right", fontSize: 14, fontWeight: 700 }}>{count}</span>
              </div>
            );
          })}
        </div>

        {/* Conversion rates */}
        <h2 style={{ fontSize: 13, fontWeight: 700, color: textMuted, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 14px" }}>
          Conversion Rates
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 28 }}>
          {[
            { label: "Sent → Replied", value: pct(t.conversions.sentToReplied) },
            { label: "Replied → Demo", value: pct(t.conversions.repliedToDemo) },
            { label: "Demo → Closed", value: pct(t.conversions.demoToClosed) },
            { label: "Overall Close", value: pct(t.conversions.overallClose), accent: gold },
          ].map((c) => (
            <div key={c.label} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${border}`, borderRadius: 12, padding: "14px 16px" }}>
              <p style={{ margin: 0, fontSize: 11, color: textMuted, fontWeight: 600 }}>{c.label}</p>
              <p style={{ margin: "6px 0 0", fontSize: 22, fontWeight: 700, color: c.accent || "#fff" }}>{c.value}</p>
            </div>
          ))}
        </div>

        {/* Forecast */}
        <h2 style={{ fontSize: 13, fontWeight: 700, color: textMuted, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 14px" }}>
          Revenue Forecast
        </h2>
        {t.forecast.ready ? (
          <div style={{ background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.25)", borderRadius: 12, padding: "20px 22px" }}>
            <p style={{ margin: 0, fontSize: 12, color: textMuted, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>
              Projected from open pipeline
            </p>
            <p style={{ margin: "8px 0 0", fontSize: 34, fontWeight: 700, fontFamily: "Fraunces, serif", color: "#34d399" }}>
              {money(t.forecast.projectedRevenue)}
            </p>
            <p style={{ margin: "10px 0 0", fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>
              {t.forecast.basis}
            </p>
            <p style={{ margin: "10px 0 0", fontSize: 12, color: textMuted }}>
              Based on {t.forecast.sample.sent} sent · {t.forecast.sample.replied} replied · {t.forecast.sample.demo} demos · {t.forecast.sample.closed} closed.
            </p>
          </div>
        ) : (
          <div style={{ background: "rgba(245,197,66,0.05)", border: "1px dashed rgba(245,197,66,0.3)", borderRadius: 12, padding: "20px 22px" }}>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: gold }}>Collecting data</p>
            <p style={{ margin: "8px 0 0", fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>
              {t.forecast.reason}
            </p>
            <div style={{ marginTop: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: textMuted, marginBottom: 6 }}>
                <span>Closed-won so far</span>
                <span>{t.forecast.closedSoFar} / {t.forecast.needed}</span>
              </div>
              <div style={{ height: 8, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ width: `${Math.min((t.forecast.closedSoFar / t.forecast.needed) * 100, 100)}%`, height: "100%", background: gold, borderRadius: 4 }} />
              </div>
            </div>
          </div>
        )}

        <p style={{ margin: "24px 0 0", fontSize: 11, color: textMuted, textAlign: "center" }}>
          Computed {new Date(t.generatedAt).toLocaleString()} · refresh to recompute
        </p>
      </div>
    </div>
  );
}
