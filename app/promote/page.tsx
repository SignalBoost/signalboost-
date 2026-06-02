// File: app/promote/page.tsx
// Promote → campaign manager. Logged-in owners create, edit, activate/pause,
// duplicate, and delete campaign cards backed by the Supabase `offers` table.
"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { createOffer, deleteOffer, getMyOffers, updateOffer, type Offer } from "@/lib/offers";

const GOLD = "#f5c542";
const GOLD_DEEP = "#dfa837";
const PANEL = "rgba(15,20,27,.76)";
const BORDER = "#1e2630";
const TEXT = "#e6edf3";
const MUTED = "#9aa8b8";
const GREEN = "#34d399";
const ROSE = "#fb7185";
const BLUE = "#38bdf8";

type CampaignStatus = "active" | "paused" | "archived";
type Channel = "email" | "social" | "paid";

type Campaign = {
  id: string;
  headline: string;
  subheadline: string;
  body: string;
  cta: string;
  status: CampaignStatus;
  lastUpdated: string;
  utm: Record<Channel, string>;
  source?: Offer;
};

const CHANNELS: Channel[] = ["email", "social", "paid"];

function offerToCampaign(offer: Offer): Campaign {
  const parts = (offer.description || "").split("\n---\n");
  const subheadline = parts[0] || "Conversion-ready campaign concept";
  const body = parts[1] || offer.description || "Use this campaign body to describe the offer, the proof point, and the next action for every channel.";
  const cta = offer.code || "Get started";
  const base = `https://signalboostapp.com/r/${encodeURIComponent(offer.id)}`;
  return {
    id: offer.id,
    headline: offer.title,
    subheadline,
    body,
    cta,
    status: offer.active ? "active" : "paused",
    lastUpdated: offer.created_at,
    utm: {
      email: `${base}?utm_source=email&utm_medium=newsletter&utm_campaign=${encodeURIComponent(offer.title)}`,
      social: `${base}?utm_source=social&utm_medium=organic&utm_campaign=${encodeURIComponent(offer.title)}`,
      paid: `${base}?utm_source=paid&utm_medium=cpc&utm_campaign=${encodeURIComponent(offer.title)}`,
    },
    source: offer,
  };
}

function emptyCampaign(): Campaign {
  return {
    id: "draft",
    headline: "",
    subheadline: "",
    body: "",
    cta: "",
    status: "active",
    lastUpdated: new Date().toISOString(),
    utm: {
      email: "https://signalboostapp.com/?utm_source=email&utm_medium=newsletter&utm_campaign=new-campaign",
      social: "https://signalboostapp.com/?utm_source=social&utm_medium=organic&utm_campaign=new-campaign",
      paid: "https://signalboostapp.com/?utm_source=paid&utm_medium=cpc&utm_campaign=new-campaign",
    },
  };
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function statusLabel(status: CampaignStatus): string {
  if (status === "active") return "Active";
  if (status === "paused") return "Paused";
  return "Archived";
}

export default function PromotePage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Campaign>(emptyCampaign());
  const [filter, setFilter] = useState<CampaignStatus | "all">("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [audience, setAudience] = useState("Local buyers");
  const [tone, setTone] = useState("Confident");

  const filteredCampaigns = useMemo(
    () => campaigns.filter((campaign) => filter === "all" || campaign.status === filter),
    [campaigns, filter],
  );

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setLoggedIn(Boolean(user));
      if (!user) {
        setLoading(false);
        return;
      }
      const offers = await getMyOffers();
      const next = offers.map(offerToCampaign);
      setCampaigns(next);
      setSelectedId(next[0]?.id ?? null);
      setDraft(next[0] ?? emptyCampaign());
      setLoading(false);
    }
    void load();
  }, []);

  function selectCampaign(campaign: Campaign) {
    setSelectedId(campaign.id);
    setDraft(campaign);
    setError(null);
  }

  function newCampaign() {
    const fresh = emptyCampaign();
    setSelectedId(null);
    setDraft({ ...fresh, headline: "New growth campaign", subheadline: "Launch-ready promise", body: "Describe the target audience, offer mechanics, and reason to act now.", cta: "Book now" });
    setError(null);
  }

  async function saveCampaign() {
    if (!draft.headline.trim()) {
      setError("Headline is required.");
      return;
    }
    setSaving(true);
    setError(null);
    const description = `${draft.subheadline.trim()}\n---\n${draft.body.trim()}`.trim();
    if (selectedId) {
      const result = await updateOffer(selectedId, {
        title: draft.headline,
        description,
        code: draft.cta,
        active: draft.status === "active",
      });
      if (!result.ok) setError(result.error || "Could not save campaign.");
      else {
        const updated = { ...draft, lastUpdated: new Date().toISOString() };
        setCampaigns((cur) => cur.map((campaign) => campaign.id === selectedId ? updated : campaign));
      }
    } else {
      const result = await createOffer({ title: draft.headline, description, code: draft.cta });
      if (result.error || !result.offer) setError(result.error || "Could not create campaign.");
      else {
        const campaign = offerToCampaign(result.offer);
        const merged = { ...campaign, subheadline: draft.subheadline, body: draft.body, cta: draft.cta, utm: draft.utm };
        setCampaigns((cur) => [merged, ...cur]);
        setSelectedId(merged.id);
        setDraft(merged);
      }
    }
    setSaving(false);
  }

  async function duplicateCampaign() {
    const result = await createOffer({
      title: `${draft.headline || "Campaign"} copy`,
      description: `${draft.subheadline}\n---\n${draft.body}`,
      code: draft.cta,
    });
    if (result.error || !result.offer) {
      setError(result.error || "Could not duplicate campaign.");
      return;
    }
    const copy = { ...offerToCampaign(result.offer), subheadline: draft.subheadline, body: draft.body, cta: draft.cta, utm: draft.utm };
    setCampaigns((cur) => [copy, ...cur]);
    selectCampaign(copy);
  }

  async function removeCampaign(id: string) {
    const result = await deleteOffer(id);
    if (!result.ok) {
      setError(result.error || "Could not archive campaign.");
      return;
    }
    setCampaigns((cur) => cur.filter((campaign) => campaign.id !== id));
    if (selectedId === id) {
      setSelectedId(null);
      setDraft(emptyCampaign());
    }
  }

  function rewrite() {
    const benefit = audience === "Returning customers" ? "welcome loyal customers back" : audience === "High-intent leads" ? "convert buyers already comparing options" : "reach local buyers at the right moment";
    setDraft((cur) => ({
      ...cur,
      headline: `${tone} offer to ${benefit}`,
      subheadline: `Built for ${audience.toLowerCase()} with a ${tone.toLowerCase()} tone and clear next step.`,
      body: `SignalBoost rewrote this campaign to ${benefit}. Lead with the strongest proof point, remove friction, and keep the CTA consistent across email, social, and paid traffic.`,
    }));
  }

  function setField<K extends keyof Campaign>(key: K, value: Campaign[K]) {
    setDraft((cur) => ({ ...cur, [key]: value }));
  }

  function setUtm(channel: Channel, value: string) {
    setDraft((cur) => ({ ...cur, utm: { ...cur.utm, [channel]: value } }));
  }

  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        <section style={styles.hero} aria-labelledby="promote-title">
          <div>
            <p style={styles.eyebrow}>SaaS Station / Campaign tools</p>
            <h1 id="promote-title" style={styles.h1}>Promote campaign cockpit</h1>
            <p style={styles.sub}>Plan headlines, UTMs, AI rewrites, duplication, and campaign status from a single SignalBoost surface.</p>
          </div>
          <Link href="/app" style={styles.workspaceLink}>← My workspace</Link>
        </section>

        {!loggedIn && !loading ? (
          <section style={styles.card}>
            <h2 style={styles.h2}>Log in to manage campaigns</h2>
            <p style={styles.muted}>You need an account before SignalBoost can sync campaign library changes.</p>
            <Link href="/auth/login?flow=main&next=/promote" style={styles.primaryBtn}>Log in</Link>
          </section>
        ) : (
          <div style={styles.layout}>
            <aside style={styles.libraryPanel} aria-label="Campaign library panel">
              <div style={styles.panelHeader}>
                <div>
                  <p style={styles.telemetryLabel}>CampaignLibraryPanel</p>
                  <h2 style={styles.h2}>Campaigns</h2>
                </div>
                <button type="button" onClick={newCampaign} style={styles.iconBtn}>+</button>
              </div>

              <div style={styles.filterControls} aria-label="Filter controls">
                {(["all", "active", "paused", "archived"] as const).map((option) => (
                  <button key={option} type="button" onClick={() => setFilter(option)} style={filter === option ? styles.filterActive : styles.filterBtn}>
                    {option}
                  </button>
                ))}
              </div>

              {loading ? <p style={styles.muted}>Loading campaign library…</p> : filteredCampaigns.length === 0 ? (
                <p style={styles.empty}>No campaigns in this filter. Use NewCampaignButton to create one.</p>
              ) : (
                <div style={styles.campaignList}>
                  {filteredCampaigns.map((campaign) => (
                    <article key={campaign.id} style={campaign.id === selectedId ? styles.campaignCardActive : styles.campaignCard}>
                      <button type="button" onClick={() => selectCampaign(campaign)} style={styles.campaignButton}>
                        <strong>{campaign.headline}</strong>
                        <span>{statusLabel(campaign.status)}</span>
                        <small>Last updated {formatDate(campaign.lastUpdated)}</small>
                      </button>
                      <button type="button" onClick={() => void removeCampaign(campaign.id)} style={styles.archiveBtn}>×</button>
                    </article>
                  ))}
                </div>
              )}

              <button type="button" onClick={newCampaign} style={styles.newCampaignBtn}>NewCampaignButton</button>
            </aside>

            <section style={styles.editor} aria-label="Campaign editor">
              <div style={styles.editorHeader}>
                <div>
                  <p style={styles.telemetryLabel}>CampaignEditor</p>
                  <h2 style={styles.h2}>{selectedId ? "Selected campaign" : "New campaign"}</h2>
                </div>
                <span style={draft.status === "active" ? styles.pillOn : styles.pillOff}>{statusLabel(draft.status)}</span>
              </div>

              {error && <p style={styles.error}>{error}</p>}

              <label style={styles.label}>HeadlineField
                <input value={draft.headline} onChange={(e) => setField("headline", e.target.value)} style={styles.input} placeholder="Launch headline" />
              </label>
              <label style={styles.label}>SubheadlineField
                <input value={draft.subheadline} onChange={(e) => setField("subheadline", e.target.value)} style={styles.input} placeholder="Supporting promise" />
              </label>
              <label style={styles.label}>BodyCopyField
                <textarea value={draft.body} onChange={(e) => setField("body", e.target.value)} style={styles.textarea} placeholder="Campaign body copy" />
              </label>
              <div style={styles.twoCol}>
                <label style={styles.label}>CTAField
                  <input value={draft.cta} onChange={(e) => setField("cta", e.target.value)} style={styles.input} placeholder="Book now" />
                </label>
                <label style={styles.label}>Status
                  <select value={draft.status} onChange={(e) => setField("status", e.target.value as CampaignStatus)} style={styles.input}>
                    <option value="active">active</option>
                    <option value="paused">paused</option>
                    <option value="archived">archived</option>
                  </select>
                </label>
              </div>

              <section style={styles.nestedPanel} aria-label="UTM link editor">
                <p style={styles.telemetryLabel}>UTMLinkEditor</p>
                {CHANNELS.map((channel) => (
                  <label key={channel} style={styles.label}>{channel}
                    <input value={draft.utm[channel]} onChange={(e) => setUtm(channel, e.target.value)} style={styles.input} />
                  </label>
                ))}
              </section>

              <section style={styles.aiPanel} aria-label="AI rewrite panel">
                <p style={styles.telemetryLabel}>AIRewritePanel</p>
                <div style={styles.twoCol}>
                  <label style={styles.label}>AudienceSelector
                    <select value={audience} onChange={(e) => setAudience(e.target.value)} style={styles.input}>
                      <option>Local buyers</option>
                      <option>Returning customers</option>
                      <option>High-intent leads</option>
                    </select>
                  </label>
                  <label style={styles.label}>ToneSelector
                    <select value={tone} onChange={(e) => setTone(e.target.value)} style={styles.input}>
                      <option>Confident</option>
                      <option>Friendly</option>
                      <option>Urgent</option>
                    </select>
                  </label>
                </div>
                <button type="button" onClick={rewrite} style={styles.rewriteBtn}>RewriteButton</button>
              </section>

              <div style={styles.actionRow}>
                <button type="button" onClick={() => void saveCampaign()} disabled={saving || !loggedIn} style={{ ...styles.primaryBtn, opacity: saving || !loggedIn ? 0.55 : 1 }}>
                  {saving ? "Saving…" : "SaveCampaignButton"}
                </button>
                <button type="button" onClick={() => void duplicateCampaign()} disabled={!selectedId || !loggedIn} style={styles.ghostBtn}>DuplicateCampaignButton</button>
              </div>
            </section>
          </div>
        )}

        <footer style={styles.footer}>Footer: status ready • sync health {saving ? "syncing" : "healthy"}</footer>
      </div>
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  page: { minHeight: "100dvh", background: "radial-gradient(60vw 40vh at 20% -5%, rgba(245,197,66,.08), transparent 60%), linear-gradient(180deg,#06060a,#0a0a12)", padding: "36px 20px 72px", fontFamily: "'Outfit', system-ui, sans-serif" },
  shell: { maxWidth: 1180, margin: "0 auto", display: "flex", flexDirection: "column", gap: 18 },
  hero: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, padding: 24, borderRadius: 24, border: "1px solid rgba(255,255,255,.09)", background: "linear-gradient(135deg, rgba(245,197,66,.11), rgba(56,189,248,.06))" },
  eyebrow: { color: GOLD_DEEP, fontSize: 11, fontWeight: 900, letterSpacing: "0.2em", textTransform: "uppercase", margin: 0 },
  h1: { color: "#fff", fontSize: 38, fontWeight: 900, margin: "8px 0 8px", letterSpacing: "-0.04em" },
  h2: { color: "#fff", fontSize: 19, fontWeight: 800, margin: 0 },
  sub: { color: MUTED, fontSize: 15, margin: 0, lineHeight: 1.55, maxWidth: 680 },
  workspaceLink: { color: TEXT, textDecoration: "none", border: `1px solid ${BORDER}`, borderRadius: 999, padding: "8px 13px", fontSize: 13, fontWeight: 800, whiteSpace: "nowrap" },
  layout: { display: "grid", gridTemplateColumns: "minmax(260px, 330px) minmax(0, 1fr)", gap: 18, alignItems: "start" },
  card: { background: PANEL, border: `1px solid ${BORDER}`, borderRadius: 20, padding: 24 },
  libraryPanel: { background: PANEL, border: `1px solid ${BORDER}`, borderRadius: 20, padding: 16, position: "sticky", top: 86 },
  panelHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 14 },
  telemetryLabel: { display: "block", color: GOLD_DEEP, fontSize: 10, fontWeight: 900, letterSpacing: "0.18em", textTransform: "uppercase", margin: "0 0 5px" },
  iconBtn: { width: 34, height: 34, borderRadius: 12, border: "none", background: GOLD, color: "#06060a", fontWeight: 900, fontSize: 20, cursor: "pointer" },
  filterControls: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8, marginBottom: 14 },
  filterBtn: { padding: "8px 10px", borderRadius: 999, border: `1px solid ${BORDER}`, background: "rgba(255,255,255,.04)", color: MUTED, textTransform: "capitalize", fontWeight: 800, cursor: "pointer" },
  filterActive: { padding: "8px 10px", borderRadius: 999, border: "1px solid rgba(245,197,66,.45)", background: "rgba(245,197,66,.14)", color: GOLD, textTransform: "capitalize", fontWeight: 900, cursor: "pointer" },
  campaignList: { display: "flex", flexDirection: "column", gap: 10, maxHeight: 560, overflow: "auto" },
  campaignCard: { display: "flex", border: `1px solid ${BORDER}`, borderRadius: 14, overflow: "hidden", background: "rgba(6,8,12,.55)" },
  campaignCardActive: { display: "flex", border: `1px solid ${BLUE}`, borderRadius: 14, overflow: "hidden", background: "rgba(56,189,248,.10)" },
  campaignButton: { flex: 1, border: "none", background: "transparent", color: TEXT, padding: 12, textAlign: "left", cursor: "pointer", display: "flex", flexDirection: "column", gap: 5, fontFamily: "inherit" },
  archiveBtn: { border: "none", borderLeft: `1px solid ${BORDER}`, background: "transparent", color: MUTED, cursor: "pointer", padding: "0 10px", fontSize: 18 },
  newCampaignBtn: { width: "100%", marginTop: 12, padding: "11px 14px", borderRadius: 12, border: "none", background: `linear-gradient(135deg, ${GOLD}, ${GOLD_DEEP})`, color: "#06060a", fontWeight: 900, cursor: "pointer" },
  editor: { minWidth: 0, background: PANEL, border: `1px solid ${BORDER}`, borderRadius: 20, padding: 18, display: "flex", flexDirection: "column", gap: 14 },
  editorHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 },
  label: { display: "flex", flexDirection: "column", gap: 7, color: MUTED, fontSize: 12, fontWeight: 900, letterSpacing: ".04em", textTransform: "uppercase" },
  input: { width: "100%", boxSizing: "border-box", padding: "11px 13px", borderRadius: 11, border: "1px solid rgba(255,255,255,.12)", background: "rgba(8,8,12,.7)", color: TEXT, fontSize: 14, fontFamily: "inherit", outline: "none", textTransform: "none", letterSpacing: 0, fontWeight: 600 },
  textarea: { width: "100%", boxSizing: "border-box", minHeight: 120, resize: "vertical", padding: "11px 13px", borderRadius: 11, border: "1px solid rgba(255,255,255,.12)", background: "rgba(8,8,12,.7)", color: TEXT, fontSize: 14, fontFamily: "inherit", outline: "none", textTransform: "none", letterSpacing: 0, fontWeight: 600, lineHeight: 1.5 },
  twoCol: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 },
  nestedPanel: { border: `1px solid ${BORDER}`, borderRadius: 16, padding: 14, background: "rgba(6,8,12,.38)", display: "flex", flexDirection: "column", gap: 10 },
  aiPanel: { border: "1px solid rgba(56,189,248,.22)", borderRadius: 16, padding: 14, background: "rgba(56,189,248,.07)", display: "flex", flexDirection: "column", gap: 12 },
  actionRow: { display: "flex", gap: 10, flexWrap: "wrap" },
  primaryBtn: { display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "11px 18px", borderRadius: 11, border: "none", color: "#06060a", fontWeight: 900, fontSize: 14, textDecoration: "none", background: `linear-gradient(135deg, ${GOLD}, ${GOLD_DEEP})`, cursor: "pointer" },
  ghostBtn: { padding: "11px 18px", borderRadius: 11, border: `1px solid ${BORDER}`, background: "rgba(255,255,255,.05)", color: TEXT, fontWeight: 800, cursor: "pointer" },
  rewriteBtn: { alignSelf: "flex-start", padding: "10px 14px", borderRadius: 11, border: "1px solid rgba(56,189,248,.35)", background: "rgba(56,189,248,.13)", color: "#bae6fd", fontWeight: 900, cursor: "pointer" },
  pillOn: { fontSize: 11, fontWeight: 900, letterSpacing: ".08em", textTransform: "uppercase", color: "#04100b", background: GREEN, borderRadius: 999, padding: "5px 11px" },
  pillOff: { fontSize: 11, fontWeight: 900, letterSpacing: ".08em", textTransform: "uppercase", color: "#ffe4e6", background: ROSE, borderRadius: 999, padding: "5px 11px" },
  muted: { color: MUTED, fontSize: 14, lineHeight: 1.55, margin: "0 0 14px" },
  empty: { color: MUTED, border: `1px dashed ${BORDER}`, borderRadius: 14, padding: 16, textAlign: "center", lineHeight: 1.5 },
  error: { color: "#f8857a", fontSize: 13, margin: 0 },
  footer: { color: MUTED, fontSize: 12, borderTop: `1px solid ${BORDER}`, paddingTop: 14 },
};
