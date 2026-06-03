// File: app/promote/page.tsx
// Full campaign management module. Campaign packages are generated/re-written
// by the Promote AI endpoint, editable in-place, and stored in Supabase under
// each account's RLS-scoped `campaigns` library.
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

function emptyPackage(): CampaignPackage {
  return { headline: "", subheadline: "", body: "", cta: "", links: { email: "", social: "", paid: "" } };
}

function normalize(row: DbCampaign): Campaign {
  const legacyPackage = row.package && typeof row.package === "object" ? row.package as Partial<CampaignPackage> : null;
  const pack = legacyPackage || row;
  const linksSource = row.utm_links && typeof row.utm_links === "object" ? row.utm_links as Partial<CampaignPackage["links"]> : pack.links;
  const links = linksSource && typeof linksSource === "object" ? linksSource as Partial<CampaignPackage["links"]> : {};
  return {
    id: String(row.id),
    account_id: row.account_id ? String(row.account_id) : undefined,
    name: String(row.name || row.headline || "Campaign"),
    status: STATUSES.includes(row.status as CampaignStatus) ? row.status as CampaignStatus : "paused",
    audience: String(row.audience || ""),
    tone: String(row.tone || ""),
    goal: String(row.goal || row.headline || ""),
    offer: String(row.offer || row.subheadline || ""),
    landing_url: String(row.landing_url || links.email || "https://www.signalboostapp.com"),
    headline: String(pack.headline || ""),
    subheadline: String(pack.subheadline || ""),
    body: String(pack.body || ""),
    cta: String(pack.cta || ""),
    links: { email: String(links.email || ""), social: String(links.social || ""), paid: String(links.paid || "") },
    created_at: row.created_at ? String(row.created_at) : undefined,
    updated_at: row.updated_at ? String(row.updated_at) : undefined,
  };
}

function packageOnly(campaign: Campaign): CampaignPackage {
  return { headline: campaign.headline, subheadline: campaign.subheadline, body: campaign.body, cta: campaign.cta, links: campaign.links };
}

export default function PromotePage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [form, setForm] = useState({ goal: "Launch a SignalBoost partner offer", audience: "local business owners", tone: "confident and practical", offer: "a measurable growth workflow", landingUrl: "https://www.signalboostapp.com/pricing" });

  const selected = campaigns.find((c) => c.id === selectedId) || campaigns[0] || null;

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setErr("Please log in to manage your campaign library.");
        setLoading(false);
        return;
      }
      const { data, error } = await supabase.from("campaigns").select("*").order("updated_at", { ascending: false });
      if (error) throw error;
      const list = ((data || []) as DbCampaign[]).map(normalize);
      setCampaigns(list);
      setSelectedId((cur) => cur || list[0]?.id || null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not load campaigns.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const byStatus = useMemo(() => ({
    active: campaigns.filter((c) => c.status === "active").length,
    paused: campaigns.filter((c) => c.status === "paused").length,
    archived: campaigns.filter((c) => c.status === "archived").length,
  }), [campaigns]);

  async function ai(action: "generate" | "rewrite" | "vary", campaign?: Campaign) {
    setGenerating(true);
    setErr(null);
    try {
      const res = await fetch("/api/promote/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, ...form, campaign: campaign ? packageOnly(campaign) : undefined }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "AI request failed.");
      return json.package as CampaignPackage;
    } catch (e) {
      setErr(e instanceof Error ? e.message : "AI request failed.");
      return null;
    } finally {
      setGenerating(false);
    }
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
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not save campaign.");
    } finally {
      setSaving(false);
    }
  }

  async function persist(campaign: Campaign) {
    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("campaigns").update({ headline: campaign.headline || campaign.name, subheadline: campaign.subheadline, body: campaign.body, cta: campaign.cta, utm_links: campaign.links, status: campaign.status }).eq("id", campaign.id);
      if (error) throw error;
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not save changes.");
    } finally {
      setSaving(false);
    }
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
    } catch {
      // Campaign edits remain saved even if variation history is unavailable in an older database.
    }
  }

  async function duplicateAndVary(campaign: Campaign) {
    const pack = await ai("vary", campaign) || packageOnly(campaign);
    await saveVariation(campaign.id, pack);
    await saveNew(pack, `${campaign.name} variation`, "paused");
  }

  async function deleteCampaign(id: string) {
    if (!confirm("Delete this campaign permanently?")) return;
    try {
      const supabase = createClient();
      const { error } = await supabase.from("campaigns").delete().eq("id", id);
      if (error) throw error;
      setCampaigns((cur) => cur.filter((c) => c.id !== id));
      setSelectedId((cur) => cur === id ? null : cur);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Delete failed.");
    }
  }

  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <p style={styles.eyebrow}>SaaS Station · Promote</p>
        <h1 style={styles.title}>Campaign management with editable AI packages</h1>
        <p style={styles.subtitle}>Generate headline, subheadline, body copy, CTA, and UTM-tagged links for email, social, and paid channels. Save, edit, duplicate, vary, pause, activate, or archive every campaign.</p>
        <div style={styles.heroActions}><Link href="/saas-station" style={styles.secondary}>SaaS Station</Link><Link href="/pricing" style={styles.secondary}>Pricing</Link></div>
      </section>

      <section style={styles.metrics}>
        <div style={styles.metric}><strong>{campaigns.length}</strong><span>Total campaigns</span></div>
        <div style={styles.metric}><strong>{byStatus.active}</strong><span>Active</span></div>
        <div style={styles.metric}><strong>{byStatus.paused}</strong><span>Paused</span></div>
        <div style={styles.metric}><strong>{byStatus.archived}</strong><span>Archived</span></div>
      </section>

      {err && <div style={styles.error}>{err}</div>}
      {loading ? <div style={styles.panel}>Loading campaign library…</div> : (
        <div style={styles.layout}>
          <section style={styles.panel}>
            <h2 style={styles.panelTitle}>AI campaign brief</h2>
            <div style={styles.formGrid}>
              <label style={styles.label}>Goal<input style={styles.input} value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} /></label>
              <label style={styles.label}>Audience<input style={styles.input} value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })} /></label>
              <label style={styles.label}>Tone<input style={styles.input} value={form.tone} onChange={(e) => setForm({ ...form, tone: e.target.value })} /></label>
              <label style={styles.label}>Offer / value<input style={styles.input} value={form.offer} onChange={(e) => setForm({ ...form, offer: e.target.value })} /></label>
              <label style={{ ...styles.label, gridColumn: "1 / -1" }}>Landing URL<input style={styles.input} value={form.landingUrl} onChange={(e) => setForm({ ...form, landingUrl: e.target.value })} /></label>
            </div>
            <div style={styles.actionRow}>
              <button type="button" style={styles.goldButton} onClick={() => void generateAndSave()} disabled={generating || saving}>{generating ? "Generating…" : "Generate + save campaign"}</button>
              <button type="button" style={styles.darkButton} onClick={() => void rewriteSelected()} disabled={!selected || generating}>{generating ? "Rewriting…" : "Rewrite selected for brief"}</button>
            </div>
          </section>

          <section style={styles.panel}>
            <h2 style={styles.panelTitle}>Campaign library</h2>
            <div style={styles.cards}>
              {campaigns.map((campaign) => (
                <article key={campaign.id} style={{ ...styles.card, ...(campaign.id === selected?.id ? styles.cardActive : {}) }} onClick={() => setSelectedId(campaign.id)}>
                  <div style={styles.cardTop}><strong>{campaign.name}</strong><span style={styles.status}>{campaign.status}</span></div>
                  <h3 style={styles.cardHeadline}>{campaign.headline}</h3>
                  <p style={styles.cardText}>{campaign.subheadline}</p>
                  <div style={styles.cardActions}>
                    <button type="button" style={styles.darkButtonSmall} onClick={(e) => { e.stopPropagation(); void duplicateAndVary(campaign); }}>Duplicate + vary</button>
                    <select value={campaign.status} onClick={(e) => e.stopPropagation()} onChange={(e) => void updateAndSave(campaign.id, { status: e.target.value as CampaignStatus })} style={styles.selectSmall}>{STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}</select>
                    <button type="button" style={styles.dangerSmall} onClick={(e) => { e.stopPropagation(); void deleteCampaign(campaign.id); }}>Delete</button>
                  </div>
                </article>
              ))}
              {!campaigns.length && <p style={styles.empty}>No campaigns yet. Generate a package from the brief to create your library.</p>}
            </div>
          </section>

          <section style={{ ...styles.panel, gridColumn: "1 / -1" }}>
            <h2 style={styles.panelTitle}>Editable campaign package</h2>
            {selected ? <CampaignEditor campaign={selected} saving={saving} onChange={updateCampaign} onSave={persist} /> : <p style={styles.empty}>Select or create a campaign to edit every field.</p>}
          </section>
        </div>
      )}
    </main>
  );
}

function CampaignEditor({ campaign, saving, onChange, onSave }: { campaign: Campaign; saving: boolean; onChange: (id: string, patch: Partial<Campaign>) => void; onSave: (campaign: Campaign) => Promise<void> }) {
  const patch = (changes: Partial<Campaign>) => onChange(campaign.id, changes);
  const patchLinks = (links: Partial<Campaign["links"]>) => patch({ links: { ...campaign.links, ...links } });
  return (
    <div style={styles.editorGrid}>
      <label style={styles.label}>Library name<input style={styles.input} value={campaign.name} onChange={(e) => patch({ name: e.target.value })} /></label>
      <label style={styles.label}>Status<select style={styles.input} value={campaign.status} onChange={(e) => patch({ status: e.target.value as CampaignStatus })}>{STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}</select></label>
      <label style={styles.label}>Headline<input style={styles.input} value={campaign.headline} onChange={(e) => patch({ headline: e.target.value })} /></label>
      <label style={styles.label}>Subheadline<input style={styles.input} value={campaign.subheadline} onChange={(e) => patch({ subheadline: e.target.value })} /></label>
      <label style={{ ...styles.label, gridColumn: "1 / -1" }}>Body copy<textarea style={styles.textarea} value={campaign.body} onChange={(e) => patch({ body: e.target.value })} /></label>
      <label style={styles.label}>CTA<input style={styles.input} value={campaign.cta} onChange={(e) => patch({ cta: e.target.value })} /></label>
      <label style={styles.label}>Email UTM link<input style={styles.input} value={campaign.links.email} onChange={(e) => patchLinks({ email: e.target.value })} /></label>
      <label style={styles.label}>Social UTM link<input style={styles.input} value={campaign.links.social} onChange={(e) => patchLinks({ social: e.target.value })} /></label>
      <label style={styles.label}>Paid UTM link<input style={styles.input} value={campaign.links.paid} onChange={(e) => patchLinks({ paid: e.target.value })} /></label>
      <button type="button" style={styles.goldButton} onClick={() => void onSave(campaign)}>{saving ? "Saving…" : "Save edits"}</button>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  page: { minHeight: "100vh", background: "radial-gradient(circle at top right, rgba(245,197,66,.12), transparent 34%), #06060a", color: TEXT, fontFamily: "'Outfit', system-ui, sans-serif", padding: "32px clamp(16px,3vw,40px)" },
  hero: { maxWidth: 1120, margin: "0 auto 18px", border: `1px solid ${BORDER}`, borderRadius: 26, padding: "28px clamp(18px,4vw,42px)", background: "linear-gradient(135deg,rgba(245,197,66,.12),rgba(34,211,238,.04))" },
  eyebrow: { color: GOLD, textTransform: "uppercase", letterSpacing: ".16em", fontSize: 12, fontWeight: 900, margin: 0 },
  title: { fontSize: "clamp(32px,5vw,58px)", lineHeight: 1, letterSpacing: "-.05em", margin: "12px 0", maxWidth: 900 },
  subtitle: { color: MUTED, fontSize: 16, lineHeight: 1.7, maxWidth: 860 },
  heroActions: { display: "flex", flexWrap: "wrap", gap: 10, marginTop: 18 },
  secondary: { border: `1px solid ${BORDER}`, borderRadius: 999, color: TEXT, textDecoration: "none", padding: "10px 14px", fontWeight: 800, background: "rgba(255,255,255,.04)" },
  metrics: { maxWidth: 1120, margin: "0 auto 18px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10 },
  metric: { border: `1px solid ${BORDER}`, borderRadius: 18, background: PANEL, padding: 16, display: "grid", gap: 3 },
  layout: { maxWidth: 1120, margin: "0 auto", display: "grid", gridTemplateColumns: "minmax(0, .9fr) minmax(320px, 1.1fr)", gap: 16 },
  panel: { border: `1px solid ${BORDER}`, borderRadius: 22, background: "linear-gradient(180deg,rgba(15,20,27,.96),rgba(8,12,18,.96))", padding: 18, minWidth: 0 },
  panelTitle: { margin: "0 0 14px", fontSize: 21 },
  formGrid: { display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 10 },
  label: { display: "grid", gap: 6, color: MUTED, fontSize: 12, fontWeight: 900 },
  input: { minHeight: 42, border: `1px solid ${BORDER}`, borderRadius: 12, background: INPUT, color: TEXT, padding: "0 12px", font: "inherit" },
  textarea: { minHeight: 130, border: `1px solid ${BORDER}`, borderRadius: 12, background: INPUT, color: TEXT, padding: 12, font: "inherit", resize: "vertical" },
  actionRow: { display: "flex", flexWrap: "wrap", gap: 10, marginTop: 14 },
  goldButton: { border: "none", borderRadius: 12, background: "linear-gradient(135deg,#f5c542,#dfa837)", color: "#05070a", fontWeight: 900, padding: "11px 15px", cursor: "pointer" },
  darkButton: { border: `1px solid ${BORDER}`, borderRadius: 12, background: "rgba(255,255,255,.04)", color: TEXT, fontWeight: 800, padding: "11px 15px", cursor: "pointer" },
  cards: { display: "grid", gap: 10, maxHeight: 560, overflow: "auto", paddingRight: 4 },
  card: { border: `1px solid ${BORDER}`, borderRadius: 18, padding: 14, background: "rgba(255,255,255,.03)", cursor: "pointer" },
  cardActive: { borderColor: GOLD, boxShadow: "0 0 0 1px rgba(245,197,66,.18), 0 0 30px rgba(245,197,66,.1)" },
  cardTop: { display: "flex", justifyContent: "space-between", gap: 10, color: TEXT },
  status: { border: "1px solid rgba(52,211,153,.28)", color: "#34d399", borderRadius: 999, padding: "3px 8px", fontSize: 11, fontWeight: 900, textTransform: "uppercase" },
  cardHeadline: { margin: "10px 0 5px", fontSize: 18 },
  cardText: { color: MUTED, margin: 0, lineHeight: 1.5 },
  cardActions: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 },
  darkButtonSmall: { border: `1px solid ${BORDER}`, borderRadius: 10, background: "rgba(255,255,255,.04)", color: TEXT, fontWeight: 800, padding: "8px 10px", cursor: "pointer", fontSize: 12 },
  selectSmall: { border: `1px solid ${BORDER}`, borderRadius: 10, background: INPUT, color: TEXT, fontWeight: 800, padding: "8px 10px", fontSize: 12 },
  dangerSmall: { border: "1px solid rgba(255,107,107,.35)", borderRadius: 10, background: "rgba(255,107,107,.08)", color: "#ffd1d1", fontWeight: 800, padding: "8px 10px", cursor: "pointer", fontSize: 12 },
  empty: { color: MUTED, lineHeight: 1.6 },
  editorGrid: { display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 12 },
  error: { maxWidth: 1120, margin: "0 auto 18px", border: "1px solid rgba(255,107,107,.35)", color: "#ffd1d1", background: "rgba(255,107,107,.1)", borderRadius: 14, padding: 12 },
};
