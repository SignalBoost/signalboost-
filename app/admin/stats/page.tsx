// File: app/admin/stats/page.tsx
// Admin analytics dashboard for SignalBoost.
//
// This page is intentionally useful even before traffic tracking is fully
// populated. It combines:
//   1) live partner-directory health from affiliate_partners/static fallback
//   2) optional traffic/search analytics from partner_clicks + partner_searches
//
// Admin access uses the same database-backed is_admin() RPC as /admin.

import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { loadPartners } from "@/lib/home/partners-source";
import type { HomePartner } from "@/lib/home/partners-home";

export const metadata = { title: "Admin Statistics | SignalBoost" };
export const dynamic = "force-dynamic";

const GOLD = "#f5c542";
const DARK = "#06060a";
const PANEL = "#0f141b";
const PANEL_2 = "#111923";
const BORDER = "#1e2630";
const TEXT = "#e6edf3";
const MUTED = "#9aa8b8";
const GREEN = "#34d399";
const BLUE = "#7dd3fc";
const RED = "#ff7b72";

const DATE_FORMAT = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

type Row = Record<string, unknown>;
type BarRow = { label: string; value: number; hint?: string };
type ReadResult = { rows: Row[]; error?: string };

function asString(value: unknown): string {
  return String(value ?? "").trim();
}

function asBool(value: unknown): boolean {
  return value === true || value === "true" || value === "TRUE" || value === 1 || value === "1";
}

function asDate(value: unknown): Date | null {
  const raw = asString(value);
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

function daysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

function countBy<T>(items: T[], getKey: (item: T) => string | string[] | null | undefined): BarRow[] {
  const counts = new Map<string, number>();

  for (const item of items) {
    const keyOrKeys = getKey(item);
    const keys = Array.isArray(keyOrKeys) ? keyOrKeys : [keyOrKeys];

    for (const key of keys) {
      const clean = asString(key);
      if (!clean || clean === "seed-1") continue;
      counts.set(clean, (counts.get(clean) ?? 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label));
}

function percent(part: number, total: number): number {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

function formatDate(date: Date | null): string {
  return date ? DATE_FORMAT.format(date) : "Not available";
}

function latestDate(rows: Row[]): Date | null {
  return rows
    .map((row) => asDate(row.created_at ?? row.inserted_at ?? row.timestamp ?? row.date))
    .filter((date): date is Date => Boolean(date))
    .sort((a, b) => b.getTime() - a.getTime())[0] ?? null;
}

function withinDays(rows: Row[], days: number): Row[] {
  const cutoff = daysAgo(days);
  return rows.filter((row) => {
    const date = asDate(row.created_at ?? row.inserted_at ?? row.timestamp ?? row.date);
    return date ? date >= cutoff : false;
  });
}

async function readOptionalTable(supabase: Awaited<ReturnType<typeof createClient>>, table: string): Promise<ReadResult> {
  try {
    const { data, error } = await supabase.from(table).select("*").limit(5000);
    if (error) return { rows: [], error: error.message };
    return { rows: (data ?? []) as Row[] };
  } catch (error) {
    return { rows: [], error: error instanceof Error ? error.message : `Unable to read ${table}.` };
  }
}

async function readAffiliatePartnerRows(supabase: Awaited<ReturnType<typeof createClient>>): Promise<ReadResult> {
  try {
    const { data, error } = await supabase.from("affiliate_partners").select("*").limit(5000);
    if (error) return { rows: [], error: error.message };
    return { rows: (data ?? []) as Row[] };
  } catch (error) {
    return { rows: [], error: error instanceof Error ? error.message : "Unable to read affiliate_partners." };
  }
}

function StatCard({ label, value, hint, accent = GOLD }: { label: string; value: ReactNode; hint?: string; accent?: string }) {
  return (
    <div style={{ background: PANEL, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 18, minWidth: 160, flex: 1 }}>
      <div style={{ color: accent, fontSize: 28, fontWeight: 950, letterSpacing: "-.03em" }}>{value}</div>
      <div style={{ color: TEXT, fontSize: 13, fontWeight: 850, marginTop: 4 }}>{label}</div>
      {hint && <div style={{ color: MUTED, fontSize: 12, lineHeight: 1.45, marginTop: 6 }}>{hint}</div>}
    </div>
  );
}

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <section style={{ background: PANEL, border: `1px solid ${BORDER}`, borderRadius: 18, padding: 20 }}>
      <div style={{ marginBottom: 12 }}>
        <h2 style={{ color: TEXT, fontSize: 16, fontWeight: 950, margin: 0 }}>{title}</h2>
        {subtitle && <p style={{ color: MUTED, fontSize: 12.5, lineHeight: 1.5, margin: "4px 0 0" }}>{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function Bars({ data, maxRows = 10, color = GOLD }: { data: BarRow[]; maxRows?: number; color?: string }) {
  const rows = data.slice(0, maxRows);
  const max = rows.length ? rows[0].value : 1;

  if (rows.length === 0) {
    return <p style={{ color: MUTED, fontSize: 13, margin: 0 }}>No data yet.</p>;
  }

  return (
    <div style={{ display: "grid", gap: 10 }}>
      {rows.map((row) => (
        <div key={row.label} style={{ display: "grid", gridTemplateColumns: "minmax(110px, 170px) 1fr 48px", alignItems: "center", gap: 10 }}>
          <span style={{ color: TEXT, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={row.hint || row.label}>
            {row.label}
          </span>
          <span style={{ background: "rgba(255,255,255,.06)", borderRadius: 999, height: 22, position: "relative", overflow: "hidden" }}>
            <span style={{ position: "absolute", inset: 0, right: "auto", width: `${Math.max(4, (row.value / max) * 100)}%`, background: color, opacity: .9, borderRadius: 999 }} />
          </span>
          <span style={{ color: MUTED, fontSize: 13, fontWeight: 850, textAlign: "right" }}>{row.value}</span>
        </div>
      ))}
    </div>
  );
}

function Notice({ tone = "info", children }: { tone?: "info" | "warn"; children: ReactNode }) {
  const accent = tone === "warn" ? RED : BLUE;
  return (
    <div style={{ border: `1px solid ${BORDER}`, borderLeft: `4px solid ${accent}`, background: PANEL_2, borderRadius: 14, padding: 14, color: MUTED, fontSize: 13, lineHeight: 1.55 }}>
      {children}
    </div>
  );
}

function DataTable({ rows }: { rows: { label: string; value: ReactNode; hint?: string }[] }) {
  return (
    <div style={{ display: "grid", gap: 8 }}>
      {rows.map((row) => (
        <div key={row.label} style={{ display: "flex", gap: 12, justifyContent: "space-between", borderBottom: `1px solid ${BORDER}`, paddingBottom: 8 }}>
          <span style={{ color: MUTED, fontSize: 13 }}>{row.label}</span>
          <span style={{ color: TEXT, fontSize: 13, fontWeight: 850, textAlign: "right" }} title={row.hint}>{row.value}</span>
        </div>
      ))}
    </div>
  );
}

export default async function StatsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (isAdmin !== true) redirect("/");

  const [partners, partnerRows, clickReads, searchReads] = await Promise.all([
    loadPartners(),
    readAffiliatePartnerRows(supabase),
    readOptionalTable(supabase, "partner_clicks"),
    readOptionalTable(supabase, "partner_searches"),
  ]);

  const realClicks = clickReads.rows.filter((row) => asString(row.id) !== "seed-1");
  const realSearches = searchReads.rows.filter((row) => asString(row.id) !== "seed-1");
  const last7Clicks = withinDays(realClicks, 7).length;
  const last30Clicks = withinDays(realClicks, 30).length;
  const last7Searches = withinDays(realSearches, 7).length;
  const last30Searches = withinDays(realSearches, 30).length;

  const featured = partners.filter((partner) => partner.featured).length;
  const travelRelated = partners.filter((partner) => partner.travel_related).length;
  const missingUrls = partners.filter((partner) => !partner.url || partner.url === "#").length;
  const withRegionalUrls = partners.filter((partner) => partner.regional_urls && Object.keys(partner.regional_urls).length > 0).length;

  const categoryCoverage = countBy<HomePartner>(partners, (partner) => partner.category_label || partner.category_key || partner.category).slice(0, 12);
  const regionCoverage = countBy<HomePartner>(partners, (partner) => partner.regions || []).slice(0, 14);
  const networkCoverage = countBy<HomePartner>(partners, (partner) => partner.network || "Direct / unknown").slice(0, 10);

  const topPartnersByClicks = countBy<Row>(realClicks, (row) => asString(row.partner_name) || asString(row.name) || asString(row.partner_id)).slice(0, 12);
  const clicksByRegion = countBy<Row>(realClicks, (row) => asString(row.region) || asString(row.country) || "Unknown").slice(0, 12);
  const topSearches = countBy<Row>(realSearches, (row) => asString(row.query) || asString(row.search) || asString(row.message)).slice(0, 12);
  const unmetSearches = countBy<Row>(
    realSearches.filter((row) => asBool(row.no_results) || asBool(row.noResults) || Number(row.results_count ?? row.results ?? 1) === 0),
    (row) => asString(row.query) || asString(row.search) || asString(row.message)
  ).slice(0, 12);

  const partnerSource = partnerRows.rows.length > 0 ? "Supabase affiliate_partners" : "static partners.json fallback";
  const trackingReady = !clickReads.error && !searchReads.error;
  const latestActivity = [latestDate(realClicks), latestDate(realSearches)]
    .filter((date): date is Date => Boolean(date))
    .sort((a, b) => b.getTime() - a.getTime())[0] ?? null;

  return (
    <main style={{ minHeight: "100vh", background: DARK, color: TEXT, fontFamily: "'Outfit', system-ui, sans-serif", padding: "32px clamp(16px, 4vw, 42px) 64px" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <header style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 18, flexWrap: "wrap", marginBottom: 22 }}>
          <div>
            <div style={{ color: GOLD, fontSize: 12, fontWeight: 950, letterSpacing: ".16em", textTransform: "uppercase", marginBottom: 8 }}>Admin analytics</div>
            <h1 style={{ color: TEXT, fontSize: "clamp(28px, 5vw, 44px)", lineHeight: 1, fontWeight: 950, letterSpacing: "-.05em", margin: 0 }}>Statistics cockpit</h1>
            <p style={{ color: MUTED, fontSize: 14, lineHeight: 1.6, margin: "10px 0 0", maxWidth: 760 }}>
              Live operating view for the affiliate directory, partner coverage, and visitor search/click signals.
            </p>
          </div>
          <Link href="/admin" style={{ color: TEXT, textDecoration: "none", border: `1px solid ${BORDER}`, background: PANEL, borderRadius: 999, padding: "10px 16px", fontSize: 13, fontWeight: 850 }}>
            ← Back to Admin
          </Link>
        </header>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12, marginBottom: 18 }}>
          <StatCard label="Total partners" value={partners.length} hint={partnerSource} />
          <StatCard label="Featured" value={featured} hint={`${percent(featured, partners.length)}% of directory`} accent={GREEN} />
          <StatCard label="Travel partners" value={travelRelated} hint={`${percent(travelRelated, partners.length)}% travel-related`} accent={BLUE} />
          <StatCard label="Regional URLs" value={withRegionalUrls} hint="Partners with geo-specific affiliate links" accent={GREEN} />
          <StatCard label="Searches" value={realSearches.length} hint={`${last7Searches} in 7 days / ${last30Searches} in 30 days`} />
          <StatCard label="Clicks" value={realClicks.length} hint={`${last7Clicks} in 7 days / ${last30Clicks} in 30 days`} />
        </section>

        {!trackingReady && (
          <div style={{ marginBottom: 18 }}>
            <Notice tone="warn">
              Traffic tracking tables are not fully available yet. Directory metrics are live, but click/search charts will stay empty until
              <strong style={{ color: TEXT }}> partner_clicks</strong> and <strong style={{ color: TEXT }}>partner_searches</strong> exist and receive events.
              {clickReads.error && <div style={{ marginTop: 6 }}>partner_clicks: {clickReads.error}</div>}
              {searchReads.error && <div style={{ marginTop: 6 }}>partner_searches: {searchReads.error}</div>}
            </Notice>
          </div>
        )}

        {trackingReady && realClicks.length === 0 && realSearches.length === 0 && (
          <div style={{ marginBottom: 18 }}>
            <Notice>
              Tracking is available, but there are no visitor search/click rows yet. This page now shows real partner-directory analytics while traffic accumulates.
            </Notice>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
          <Card title="Partner categories" subtitle="Where the directory is strongest today.">
            <Bars data={categoryCoverage} color={GOLD} />
          </Card>

          <Card title="Region coverage" subtitle="How much partner supply exists by visitor market.">
            <Bars data={regionCoverage} color={BLUE} />
          </Card>

          <Card title="Affiliate networks" subtitle="Partner source mix for outreach and revenue planning.">
            <Bars data={networkCoverage} color={GREEN} />
          </Card>

          <Card title="Operational health" subtitle="Fast checks for things that need attention.">
            <DataTable
              rows={[
                { label: "Data source", value: partnerSource },
                { label: "Rows in affiliate_partners", value: partnerRows.rows.length || "None" },
                { label: "Partners missing URL", value: missingUrls, hint: "Should be 0 before public launch" },
                { label: "Latest tracking activity", value: formatDate(latestActivity) },
                { label: "Signed in admin", value: user.email || "Unknown" },
              ]}
            />
          </Card>

          <Card title="Top partners by clicks" subtitle="Revenue-intent signal from outbound traffic.">
            <Bars data={topPartnersByClicks} color={GOLD} />
          </Card>

          <Card title="Clicks by region" subtitle="Where visitors are engaging from.">
            <Bars data={clicksByRegion} color={BLUE} />
          </Card>

          <Card title="Top searches" subtitle="What visitors are asking SignalBoost to find.">
            <Bars data={topSearches} color={GREEN} />
          </Card>

          <Card title="Unmet demand" subtitle="Searches with no results — good targets for new partners.">
            <Bars data={unmetSearches} color={RED} />
          </Card>
        </div>
      </div>
    </main>
  );
}
