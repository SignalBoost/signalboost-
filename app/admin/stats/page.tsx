// File: app/admin/stats/page.tsx
// Business analytics dashboard. Admin-gated (same email check as the hub).
// Reads partner_clicks + partner_searches and shows the metrics that matter:
//   - Top partners by clicks (the money signal)
//   - Clicks by region
//   - Top searches (what people want)
//   - Unmet demand (searches that returned no results)
// All anonymous aggregates. Server component — data is fetched on the server.

import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const GOLD = "#f5c542";
const DARK = "#0d1117";
const PANEL = "#0f141b";
const BORDER = "#1e2630";
const TEXT = "#e6edf3";
const MUTED = "#9aa8b8";
const RED = "#ff7b72";

const OWNER_EMAIL = "cadomos@gmail.com";
function adminList(): string[] {
  const env = (process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return Array.from(new Set([OWNER_EMAIL, ...env]));
}

type Row = Record<string, unknown>;

function tally(rows: Row[], key: string, exclude?: (r: Row) => boolean): [string, number][] {
  const counts: Record<string, number> = {};
  for (const r of rows) {
    if (exclude && exclude(r)) continue;
    const v = String(r[key] ?? "").trim();
    if (!v || v === "seed-1") continue;
    counts[v] = (counts[v] || 0) + 1;
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
}

function Bars({ data, max, color = GOLD }: { data: [string, number][]; max: number; color?: string }) {
  if (data.length === 0) {
    return <p style={{ color: MUTED, fontSize: 13, margin: "8px 0 0" }}>No data yet.</p>;
  }
  return (
    <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
      {data.map(([label, n]) => (
        <div key={label} style={{ display: "grid", gridTemplateColumns: "150px 1fr 40px", alignItems: "center", gap: 10 }}>
          <span style={{ color: TEXT, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={label}>{label}</span>
          <span style={{ background: "rgba(255,255,255,0.05)", borderRadius: 6, height: 22, position: "relative", overflow: "hidden" }}>
            <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${Math.max(6, (n / max) * 100)}%`, background: color, opacity: 0.85, borderRadius: 6 }} />
          </span>
          <span style={{ color: MUTED, fontSize: 13, fontWeight: 700, textAlign: "right" }}>{n}</span>
        </div>
      ))}
    </div>
  );
}

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section style={{ background: PANEL, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 20, marginBottom: 16 }}>
      <h2 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 2px", color: TEXT }}>{title}</h2>
      {subtitle && <p style={{ color: MUTED, fontSize: 12.5, margin: "0 0 6px" }}>{subtitle}</p>}
      {children}
    </section>
  );
}

export default async function StatsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  if (!adminList().includes((user.email || "").toLowerCase())) redirect("/");

  // Pull recent rows (cap to keep it fast).
  const { data: clicksData, error: clicksError } = await supabase
    .from("partner_clicks")
    .select("*")
    .limit(5000);
  const { data: searchesData, error: searchesError } = await supabase
    .from("partner_searches")
    .select("*")
    .limit(5000);

  if (clicksError) console.error("[stats] partner_clicks read failed:", clicksError.message);
  if (searchesError) console.error("[stats] partner_searches read failed:", searchesError.message);

  const clicks = (clicksData || []) as Row[];
  const searches = (searchesData || []) as Row[];

  const realClicks = clicks.filter((r) => String(r.id) !== "seed-1");
  const realSearches = searches.filter((r) => String(r.id) !== "seed-1");

  const topPartners = tally(realClicks, "partner_name").slice(0, 12);
  const clicksByRegion = tally(realClicks, "region").slice(0, 12);
  const topSearches = tally(realSearches, "query").slice(0, 12);
  const searchesByRegion = tally(realSearches, "region").slice(0, 12);
  const unmet = tally(realSearches.filter((r) => r.no_results === true || r.no_results === "true"), "query").slice(0, 12);

  const maxOf = (d: [string, number][]) => (d.length ? d[0][1] : 1);

  const stat = (n: number, label: string) => (
    <div style={{ background: PANEL, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "16px 18px", flex: 1, minWidth: 120 }}>
      <div style={{ fontSize: 26, fontWeight: 800, color: GOLD }}>{n}</div>
      <div style={{ color: MUTED, fontSize: 12.5, marginTop: 2 }}>{label}</div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: DARK, color: TEXT, fontFamily: "system-ui, sans-serif", padding: "36px 18px" }}>
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, color: GOLD }}>Statistics</h1>
          <Link href="/admin" style={{ color: MUTED, fontSize: 13, textDecoration: "none" }}>← Back to Admin</Link>
        </div>
        <p style={{ color: MUTED, fontSize: 13, margin: "0 0 22px" }}>Anonymous aggregates — what visitors search and click, by region.</p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
          {stat(realClicks.length, "Total clicks")}
          {stat(realSearches.length, "Total searches")}
          {stat(unmet.length, "Unmet-demand queries")}
        </div>

        <Card title="Top partners by clicks" subtitle="Where your traffic — and revenue — goes.">
          <Bars data={topPartners} max={maxOf(topPartners)} />
        </Card>

        <Card title="Clicks by region">
          <Bars data={clicksByRegion} max={maxOf(clicksByRegion)} />
        </Card>

        <Card title="Top searches" subtitle="What people are asking for.">
          <Bars data={topSearches} max={maxOf(topSearches)} />
        </Card>

        <Card title="Searches by region">
          <Bars data={searchesByRegion} max={maxOf(searchesByRegion)} />
        </Card>

        <Card title="Unmet demand" subtitle="Searches that returned nothing — opportunities for new partners.">
          <Bars data={unmet} max={maxOf(unmet)} color={RED} />
        </Card>
      </div>
    </div>
  );
}
