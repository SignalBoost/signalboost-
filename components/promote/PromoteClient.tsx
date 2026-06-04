// File: app/promote/page.tsx
"use client";

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const GOLD = "#f5c542";
const PANEL = "#0f141b";
const BORDER = "#263241";
const TEXT = "#e6edf3";
const MUTED = "#9aa8b8";
const INPUT = "#080d13";
const STATUSES = ["active", "paused", "archived"] as const;
type CampaignStatus = (typeof STATUSES)[number];

type CampaignPackage = { headline: string; subheadline: string; body: string; cta: string; links: { email: string; social: string; paid: string } };
type Campaign = CampaignPackage & { id: string; account_id?: string; name: string; status: CampaignStatus; audience: string; tone: string; goal: string; offer: string; landing_url: string; created_at?: string; updated_at?: string };
type DbCampaign = Record<string, unknown> & Partial<Campaign> & { package?: unknown; utm_links?: unknown; landing_url?: string };

function normalize(row: DbCampaign): Campaign {
  const legacyPackage = row.package && typeof row.package === "object" ? row.package as Partial<CampaignPackage> : null;
  const pack = legacyPackage || row;
  const linksSource = row.utm_links && typeof row.utm_links === "object" ? row.utm_links as Partial<CampaignPackage["links"]> : pack.links;
  const links = linksSource && typeof linksSource === "object" ? linksSource as Partial<CampaignPackage["links"]> : {};
  return {
    id: String(row.id), account_id: row.account_id ? String(row.account_id) : undefined,
    name: String(row.name || row.headline || "Campaign"),
    status: STATUSES.includes(row.status as CampaignStatus) ? row.status as CampaignStatus : "paused",
    audience: String(row.audience || ""), tone: String(row.tone || ""),
    goal: String(row.goal || row.headline || ""), offer: String(row.offer || row.subheadline || ""),
    landing_url: String(row.landing_url || links.email || "https://www.signalboostapp.com"),
    headline: String(pack.headline || ""), subheadline: String(pack.subheadline || ""),
    body: String(pack.body || ""), cta: String(pack.cta || ""),
    links: { email: String(links.email || ""), social: String(links.social || ""), paid: String(links.paid || "") },
    created_at: row.created_at ? String(row.created_at) : undefined,
    updated_at: row.updated_at ? String(row.updated_at) : undefined,
  };
}

function packageOnly(c: Campaign): CampaignPackage {
  return { headline: c.headline, subheadline: c.subheadline, body: c.body, cta: c.cta, links: c.links };
}

export default function PromotePage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [form, setForm] = useState({
    goal: "Launch a SignalBoost partner offer",
    audience: "local business owners",
    tone: "confident and practical",
    offer: "a measurable growth workflow",
    landingUrl: "https://www.signalboostapp.com/pricing",
  });

  const selected = campaigns.find((c) => c.id === selectedId) || campaigns[0] || null;

  const load = useCallback(async () => {
    setLoading(true); setErr(null);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setErr("Please log in to manage your campaign library."); setLoading(false); return; }
      const { data, error } = await supabase.from("campaigns").select("*").order("updated_at", { ascending: false });
      if (error) throw error;
      const list = ((data || []) as DbCampaign[]).map(normalize);
      setCampaigns(list);
      setSelectedId((cur) => cur || list[0]?.id || null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not load campaigns.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const byStatus = useMemo(() => ({
    active: campaigns.filter((c) => c.status === "active").length,
    paused: campaigns.filter((c) => c.status === "paused").length,
    archived: campaigns.filter((c) => c.status === "archived").length,
  }), [campaigns]);

  async function ai(action: "generate" | "rewrite" | "vary", campaign?: Campaign) {
    setGenerating(true); setErr(null);
    try {
      const res = await fetch("/api/promote/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, ...form, campaign: campaign ? packageOnly(campaign) : undefined }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "AI request failed.");
      return json.package as CampaignPackage;
    } catch (e) { setErr(e instanceof Error ? e.message : "AI request failed."); return null; }
    finally { setGenerating(false); }
  }

  async function generateAndSave() {
    const pack = await ai("generate");
    if (!pack) return;
    await saveNew(pack, form.goal);
  }

  async function saveNew(pack: CampaignPackage, name: string, status: CampaignStatus = "paused") {
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please log in first.");
      const insert = { account_id: user.id, headline: pack.headline || name || "Campaign", subheadline: pack.subheadline, body: pack.body, cta: pack.cta, utm_links: pack.links, status };
      const { data, error } = await supabase.from("campaigns").insert(insert).select("*").single();
      if (error) throw error;
      const campaign = normalize(data as DbCampaign);
      setCampaigns((cur) => [campaign, ...cur]);
      setSelectedId(campaign.id);
    } catch (e) { setErr(e instanceof Error ? e.message : "Could not save campaign."); }
    finally { setSaving(false); }
  }

  async function persist(campaign: Campaign) {
    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("campaigns").update({ headline: campaign.headline || campaign.name, subheadline: campaign.subheadline, body: campaign.body, cta: campaign.cta, utm_links: campaign.links, status: campaign.status }).eq("id", campaign.id);
      if (error) throw error;
    } catch (e) { setErr(e instanceof Error ? e.message : "Could not save changes."); }
    finally { setSaving(false); }
  }

  function updateCampaign(id: string, patch: Partial<Campaign>) {
    setCampaigns((cur) => cur.map((c) => c.id === id ? { ...c, ...patch } : c));
  }

  async function updateAndSave(id: string, patch: Partial<Campaign>) {
    const next = campaigns.map((c) => c.id === id ? { ...c, ...patch } : c).find((c) => c.id === id);
    updateCampaign(id, patch);
    if (next) await persist(next);
  }

  async function rewriteSelected() {
    if (!selected) return;
    const pack = await ai("rewrite", selected);
    if (!pack) return;
    await updateAndSave(selected.id, { ...pack });
    await saveVariation(selected.id, pack);
  }

  async function saveVariation(campaignId: string, pack: CampaignPackage) {
    try {
      const supabase = createClient();
      await supabase.from("campaign_variations").insert({ campaign_id: campaignId, audience: form.audience, tone: form.tone, rewritten_copy: pack });
    } catch { /* ignore */ }
  }

  async function duplicateAndVary(campaign: Campaign) {
    const pack = await ai("vary", campaign) || packageOnly(campaign);
    await saveVariation(campaign.id, pack);
    await saveNew(pack, campaign.name + " variation", "paused");
  }

  async function deleteCampaign(id: string) {
    if (!confirm("Delete this campaign permanently?")) return;
    try {
      const supabase = createClient();
      const { error } = await supabase.from("campaigns").delete().eq("id", id);
      if (error) throw error;
      setCampaigns((cur) => cur.filter((c) => c.id !== id));
      setSelectedId((cur) => cur === id ? null : cur);
    } catch (e) { setErr(e instanceof Error ? e.message : "Delete failed."); }
  }

  return (
    <main style={s.page}>
      {/* ── Compact header bar ── */}
      <div style={s.topBar}>
        <div>
          <p style={s.eyebrow}>SaaS Station · Promote</p>
          <h1 style={s.title}>Campaign management</h1>
        </div>
        <div style={s.stats}>
          {[
            { n: campaigns.length, label: "Total" },
            { n: byStatus.active, label: "Active" },
            { n: byStatus.paused, label: "Paused" },
            { n: byStatus.archived, label: "Archived" },
          ].map(({ n, label }) => (
            <div key={label} style={s.stat}>
              <strong style={s.statN}>{n}</strong>
              <span style={s.statL}>{label}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <Link href="/saas-station" style={s.navBtn}>SaaS Station</Link>
          <Link href="/pricing" style={s.navBtn}>Pricing</Link>
        </div>
      </div>

      {err && <div style={s.error}>{err}</div>}

      {loading ? (
        <div style={s.panel}>Loading campaign library…</div>
      ) : (
        <div style={s.layout}>
          {/* AI Brief */}
          <section style={s.panel}>
            <h2 style={s.panelTitle}>AI campaign brief</h2>
            <div style={s.formGrid}>
              <label style={s.label}>Goal<input style={s.input} value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} /></label>
              <label style={s.label}>Audience<input style={s.input} value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })} /></label>
              <label style={s.label}>Tone<input style={s.input} value={form.tone} onChange={(e) => setForm({ ...form, tone: e.target.value })} /></label>
              <label style={s.label}>Offer / value<input style={s.input} value={form.offer} onChange={(e) => setForm({ ...form, offer: e.target.value })} /></label>
              <label style={{ ...s.label, gridColumn: "1 / -1" }}>Landing URL<input style={s.input} value={form.landingUrl} onChange={(e) => setForm({ ...form, landingUrl: e.target.value })} /></label>
            </div>
            <div style={s.actionRow}>
              <button type="button" style={s.goldBtn} onClick={() => void generateAndSave()} disabled={generating || saving}>{generating ? "Generating…" : "Generate + save campaign"}</button>
              <button type="button" style={s.darkBtn} onClick={() => void rewriteSelected()} disabled={!selected || generating}>{generating ? "Rewriting…" : "Rewrite selected"}</button>
            </div>
          </section>

          {/* Campaign library */}
          <section style={s.panel}>
            <h2 style={s.panelTitle}>Campaign library</h2>
            <div style={s.cards}>
              {campaigns.map((c) => (
                <article key={c.id} style={{ ...s.card, ...(c.id === selected?.id ? s.cardActive : {}) }} onClick={() => setSelectedId(c.id)}>
                  <div style={s.cardTop}><strong>{c.name}</strong><span style={s.status}>{c.status}</span></div>
                  <h3 style={s.cardHeadline}>{c.headline}</h3>
                  <p style={s.cardText}>{c.subheadline}</p>
                  <div style={s.cardActions}>
                    <button type="button" style={s.smBtn} onClick={(e) => { e.stopPropagation(); void duplicateAndVary(c); }}>Duplicate + vary</button>
                    <select value={c.status} onClick={(e) => e.stopPropagation()} onChange={(e) => void updateAndSave(c.id, { status: e.target.value as CampaignStatus })} style={s.smSel}>{STATUSES.map((st) => <option key={st} value={st}>{st}</option>)}</select>
                    <button type="button" style={s.dangerBtn} onClick={(e) => { e.stopPropagation(); void deleteCampaign(c.id); }}>Delete</button>
                  </div>
                </article>
              ))}
              {!campaigns.length && <p style={s.empty}>No campaigns yet. Generate a package from the brief to create your library.</p>}
            </div>
          </section>

          {/* Editor */}
          <section style={{ ...s.panel, gridColumn: "1 / -1" }}>
            <h2 style={s.panelTitle}>Editable campaign package</h2>
            {selected ? <CampaignEditor campaign={selected} saving={saving} onChange={updateCampaign} onSave={persist} /> : <p style={s.empty}>Select or create a campaign to edit every field.</p>}
          </section>
        </div>
      )}
    </main>
  );
}

function CampaignEditor({ campaign, saving, onChange, onSave }: { campaign: Campaign; saving: boolean; onChange: (id: string, patch: Partial<Campaign>) => void; onSave: (c: Campaign) => Promise<void> }) {
  const patch = (changes: Partial<Campaign>) => onChange(campaign.id, changes);
  const pL = (links: Partial<Campaign["links"]>) => patch({ links: { ...campaign.links, ...links } });
  return (
    <div style={s.editorGrid}>
      <label style={s.label}>Library name<input style={s.input} value={campaign.name} onChange={(e) => patch({ name: e.target.value })} /></label>
      <label style={s.label}>Status<select style={s.input} value={campaign.status} onChange={(e) => patch({ status: e.target.value as CampaignStatus })}>{STATUSES.map((st) => <option key={st} value={st}>{st}</option>)}</select></label>
      <label style={s.label}>Headline<input style={s.input} value={campaign.headline} onChange={(e) => patch({ headline: e.target.value })} /></label>
      <label style={s.label}>Subheadline<input style={s.input} value={campaign.subheadline} onChange={(e) => patch({ subheadline: e.target.value })} /></label>
      <label style={{ ...s.label, gridColumn: "1 / -1" }}>Body copy<textarea style={s.textarea} value={campaign.body} onChange={(e) => patch({ body: e.target.value })} /></label>
      <label style={s.label}>CTA<input style={s.input} value={campaign.cta} onChange={(e) => patch({ cta: e.target.value })} /></label>
      <label style={s.label}>Email UTM<input style={s.input} value={campaign.links.email} onChange={(e) => pL({ email: e.target.value })} /></label>
      <label style={s.label}>Social UTM<input style={s.input} value={campaign.links.social} onChange={(e) => pL({ social: e.target.value })} /></label>
      <label style={s.label}>Paid UTM<input style={s.input} value={campaign.links.paid} onChange={(e) => pL({ paid: e.target.value })} /></label>
      <button type="button" style={s.goldBtn} onClick={() => void onSave(campaign)}>{saving ? "Saving…" : "Save edits"}</button>
    </div>
  );
}

const s: Record<string, CSSProperties> = {
  page: { minHeight: "100vh", background: "radial-gradient(circle at top right, rgba(245,197,66,.12), transparent 34%), #06060a", color: TEXT, fontFamily: "'Outfit', system-ui, sans-serif", padding: "14px clamp(12px,3vw,32px)" },
  topBar: { maxWidth: 1120, margin: "0 auto 14px", display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap", borderBottom: `1px solid ${BORDER}`, paddingBottom: 12 },
  eyebrow: { color: GOLD, textTransform: "uppercase", letterSpacing: ".16em", fontSize: 10, fontWeight: 900, margin: "0 0 2px" },
  title: { fontSize: 20, fontWeight: 900, letterSpacing: "-.03em", margin: 0, color: TEXT },
  stats: { display: "flex", gap: 20, flex: 1 },
  stat: { display: "flex", flexDirection: "column", alignItems: "center", gap: 1 },
  statN: { fontSize: 22, fontWeight: 900, color: GOLD, lineHeight: 1 },
  statL: { fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: ".08em" },
  navBtn: { border: `1px solid ${BORDER}`, borderRadius: 999, color: TEXT, textDecoration: "none", padding: "6px 12px", fontWeight: 800, background: "rgba(255,255,255,.04)", fontSize: 12 },
  error: { maxWidth: 1120, margin: "0 auto 12px", border: "1px solid rgba(255,107,107,.35)", color: "#ffd1d1", background: "rgba(255,107,107,.1)", borderRadius: 12, padding: "10px 14px", fontSize: 13 },
  layout: { maxWidth: 1120, margin: "0 auto", display: "grid", gridTemplateColumns: "minmax(0,.9fr) minmax(320px,1.1fr)", gap: 14 },
  panel: { border: `1px solid ${BORDER}`, borderRadius: 18, background: "linear-gradient(180deg,rgba(15,20,27,.96),rgba(8,12,18,.96))", padding: 16, minWidth: 0 },
  panelTitle: { margin: "0 0 12px", fontSize: 16, fontWeight: 900, color: TEXT },
  formGrid: { display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 9 },
  label: { display: "grid", gap: 5, color: MUTED, fontSize: 11, fontWeight: 900 },
  input: { minHeight: 38, border: `1px solid ${BORDER}`, borderRadius: 10, background: INPUT, color: TEXT, padding: "0 10px", font: "inherit", fontSize: 13 },
  textarea: { minHeight: 110, border: `1px solid ${BORDER}`, borderRadius: 10, background: INPUT, color: TEXT, padding: 10, font: "inherit", resize: "vertical", fontSize: 13 },
  actionRow: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 },
  goldBtn: { border: "none", borderRadius: 10, background: "linear-gradient(135deg,#f5c542,#dfa837)", color: "#05070a", fontWeight: 900, padding: "9px 13px", cursor: "pointer", fontSize: 13 },
  darkBtn: { border: `1px solid ${BORDER}`, borderRadius: 10, background: "rgba(255,255,255,.04)", color: TEXT, fontWeight: 800, padding: "9px 13px", cursor: "pointer", fontSize: 13 },
  cards: { display: "grid", gap: 8, maxHeight: 480, overflow: "auto", paddingRight: 4 },
  card: { border: `1px solid ${BORDER}`, borderRadius: 14, padding: 12, background: "rgba(255,255,255,.03)", cursor: "pointer" },
  cardActive: { borderColor: GOLD, boxShadow: "0 0 0 1px rgba(245,197,66,.18)" },
  cardTop: { display: "flex", justifyContent: "space-between", gap: 8, color: TEXT },
  status: { border: "1px solid rgba(52,211,153,.28)", color: "#34d399", borderRadius: 999, padding: "2px 7px", fontSize: 10, fontWeight: 900, textTransform: "uppercase" },
  cardHeadline: { margin: "7px 0 3px", fontSize: 14, fontWeight: 700 },
  cardText: { color: MUTED, margin: 0, lineHeight: 1.4, fontSize: 12 },
  cardActions: { display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 },
  smBtn: { border: `1px solid ${BORDER}`, borderRadius: 8, background: "rgba(255,255,255,.04)", color: TEXT, fontWeight: 800, padding: "6px 9px", cursor: "pointer", fontSize: 11 },
  smSel: { border: `1px solid ${BORDER}`, borderRadius: 8, background: INPUT, color: TEXT, fontWeight: 800, padding: "6px 9px", fontSize: 11 },
  dangerBtn: { border: "1px solid rgba(255,107,107,.35)", borderRadius: 8, background: "rgba(255,107,107,.08)", color: "#ffd1d1", fontWeight: 800, padding: "6px 9px", cursor: "pointer", fontSize: 11 },
  empty: { color: MUTED, lineHeight: 1.6, fontSize: 13 },
  editorGrid: { display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 10 },
};
