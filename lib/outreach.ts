import { createClient } from "@/lib/supabase/server";

export type OutreachLead = {
  id: string;
  owner_id: string;
  name: string;
  email: string;
  company?: string;
  category?: string;
  network?: string;
  affiliate_url?: string;
  source: string;
  notes?: string;
  status: "queued" | "drafted" | "approved" | "sent" | "skipped";
  created_at: string;
};

export type OutreachMessage = {
  id: string;
  lead_id: string;
  owner_id: string;
  subject: string;
  body: string;
  from_alias: string;
  status: "draft" | "approved" | "sent" | "failed";
  sent_at?: string;
  created_at: string;
};

// ── Leads ──────────────────────────────────────────────────

export async function getLeads(userId: string): Promise<OutreachLead[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("outreach_leads")
    .select("*")
    .eq("owner_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createLead(
  userId: string,
  lead: Pick<OutreachLead, "name" | "email" | "company" | "category" | "network" | "affiliate_url" | "source" | "notes">
): Promise<OutreachLead> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("outreach_leads")
    .insert({ ...lead, owner_id: userId, status: "queued" })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateLead(
  leadId: string,
  updates: Partial<Pick<OutreachLead, "email" | "notes" | "status">>
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("outreach_leads")
    .update(updates)
    .eq("id", leadId);
  if (error) throw error;
}

// ── Messages ────────────────────────────────────────────────

export async function getMessages(userId: string): Promise<OutreachMessage[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("outreach_messages")
    .select("*")
    .eq("owner_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function saveMessage(
  userId: string,
  leadId: string,
  subject: string,
  body: string
): Promise<OutreachMessage> {
  const supabase = await createClient();
  // Replace any existing draft for this lead
  await supabase
    .from("outreach_messages")
    .delete()
    .eq("lead_id", leadId)
    .eq("status", "draft");

  const { data, error } = await supabase
    .from("outreach_messages")
    .insert({ lead_id: leadId, owner_id: userId, subject, body, status: "draft" })
    .select()
    .single();
  if (error) throw error;

  await updateLead(leadId, { status: "drafted" });
  return data;
}

export async function approveMessage(messageId: string, leadId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("outreach_messages")
    .update({ status: "approved" })
    .eq("id", messageId);
  if (error) throw error;
  await updateLead(leadId, { status: "approved" });
}

export async function markSent(messageId: string, leadId: string): Promise<void> {
  const supabase = await createClient();
  await supabase
    .from("outreach_messages")
    .update({ status: "sent", sent_at: new Date().toISOString() })
    .eq("id", messageId);
  await updateLead(leadId, { status: "sent" });
}

export async function markFailed(messageId: string): Promise<void> {
  const supabase = await createClient();
  await supabase
    .from("outreach_messages")
    .update({ status: "failed" })
    .eq("id", messageId);
}

// ── Daily cap ───────────────────────────────────────────────

export async function getTodaySentCount(userId: string): Promise<number> {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];
  const { count, error } = await supabase
    .from("outreach_messages")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", userId)
    .eq("status", "sent")
    .gte("sent_at", `${today}T00:00:00.000Z`)
    .lte("sent_at", `${today}T23:59:59.999Z`);
  if (error) return 0;
  return count ?? 0;
}

// ── Partners import ─────────────────────────────────────────

export async function importPartnerLeads(
  userId: string,
  partners: { id: string; name: string; category_label?: string; network?: string; url?: string }[]
): Promise<{ imported: number; skipped: number }> {
  const supabase = await createClient();

  // Get existing affiliate_urls for this owner to skip dupes
  const { data: existing } = await supabase
    .from("outreach_leads")
    .select("affiliate_url")
    .eq("owner_id", userId)
    .eq("source", "partners_json");

  const existingUrls = new Set((existing || []).map((r) => r.affiliate_url));

  const newLeads = partners
    .filter((p) => p.url && !existingUrls.has(p.url))
    .map((p) => ({
      owner_id: userId,
      name: p.name,
      email: "",
      company: p.name,
      category: p.category_label || "",
      network: p.network || "",
      affiliate_url: p.url || "",
      source: "partners_json",
      status: "queued",
    }));

  if (newLeads.length === 0) {
    return { imported: 0, skipped: partners.length };
  }

  const { error } = await supabase.from("outreach_leads").insert(newLeads);
  if (error) throw error;

  return { imported: newLeads.length, skipped: partners.length - newLeads.length };
}
