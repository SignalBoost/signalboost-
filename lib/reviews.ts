// File: lib/reviews.ts
// Data helpers for the Reviews tool (Stage 1: collect + store + dashboard).
// Uses the browser Supabase client; RLS enforces who can read/write what.
import { createClient } from "@/lib/supabase/client";

export type ReviewBusiness = {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  created_at: string;
};

export type Review = {
  id: string;
  business_id: string;
  rating: number;
  author_name: string | null;
  comment: string | null;
  created_at: string;
};

// URL-safe slug from a business name, plus a short random suffix so two
// businesses with the same name don't collide.
export function makeSlug(name: string): string {
  const base = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  const suffix = Math.random().toString(36).slice(2, 7);
  return base ? `${base}-${suffix}` : `biz-${suffix}`;
}

// --- Public (collection page) ---

export async function getBusinessBySlug(slug: string): Promise<ReviewBusiness | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("review_businesses")
    .select("id, owner_id, name, slug, created_at")
    .eq("slug", slug)
    .maybeSingle();
  if (error) return null;
  return data as ReviewBusiness | null;
}

export async function submitReview(input: {
  businessId: string;
  rating: number;
  authorName?: string;
  comment?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const supabase = createClient();
  const { error } = await supabase.from("reviews").insert({
    business_id: input.businessId,
    rating: input.rating,
    author_name: input.authorName?.trim() || null,
    comment: input.comment?.trim() || null,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// --- Owner (dashboard) ---

export async function getMyBusinesses(): Promise<ReviewBusiness[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("review_businesses")
    .select("id, owner_id, name, slug, created_at")
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data as ReviewBusiness[];
}

export async function createBusiness(name: string): Promise<{ business?: ReviewBusiness; error?: string }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "not_authenticated" };

  // Try a few times in case of a rare slug collision.
  for (let attempt = 0; attempt < 4; attempt++) {
    const slug = makeSlug(name);
    const { data, error } = await supabase
      .from("review_businesses")
      .insert({ owner_id: user.id, name: name.trim(), slug })
      .select("id, owner_id, name, slug, created_at")
      .single();
    if (!error && data) return { business: data as ReviewBusiness };
    if (error && !error.message.toLowerCase().includes("duplicate")) {
      return { error: error.message };
    }
  }
  return { error: "Could not generate a unique link. Try a different name." };
}

export async function getReviewsForBusiness(businessId: string): Promise<Review[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("id, business_id, rating, author_name, comment, created_at")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data as Review[];
}

export async function deleteReview(reviewId: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = createClient();
  const { error } = await supabase.from("reviews").delete().eq("id", reviewId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export function averageRating(reviews: Review[]): number {
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}
