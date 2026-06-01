// File: lib/offers.ts
// Data helpers for the Promote → Offers tool. Owners create and manage their
// own promotional offer cards. Uses the browser Supabase client; RLS ensures
// each owner only ever sees and edits their own offers.
import { createClient } from "@/lib/supabase/client";

export type Offer = {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  code: string | null;
  active: boolean;
  created_at: string;
};

const COLUMNS = "id, owner_id, title, description, code, active, created_at";

export async function getMyOffers(): Promise<Offer[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("offers")
    .select(COLUMNS)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data as Offer[];
}

export async function createOffer(input: {
  title: string;
  description?: string;
  code?: string;
}): Promise<{ offer?: Offer; error?: string }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "not_authenticated" };

  const { data, error } = await supabase
    .from("offers")
    .insert({
      owner_id: user.id,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      code: input.code?.trim() || null,
    })
    .select(COLUMNS)
    .single();
  if (error || !data) return { error: error?.message || "Could not create." };
  return { offer: data as Offer };
}

export async function updateOffer(
  id: string,
  patch: Partial<Pick<Offer, "title" | "description" | "code" | "active">>
): Promise<{ ok: boolean; error?: string }> {
  const supabase = createClient();
  const clean: Record<string, unknown> = {};
  if (patch.title !== undefined) clean.title = patch.title.trim();
  if (patch.description !== undefined) clean.description = patch.description?.trim() || null;
  if (patch.code !== undefined) clean.code = patch.code?.trim() || null;
  if (patch.active !== undefined) clean.active = patch.active;
  const { error } = await supabase.from("offers").update(clean).eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function deleteOffer(id: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = createClient();
  const { error } = await supabase.from("offers").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
