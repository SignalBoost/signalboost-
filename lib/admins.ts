// File: lib/admins.ts
// Database-backed admin roles. Source of truth is the Supabase `user_roles`
// table + the is_admin() function (see admin-roles-schema.sql). RLS guarantees
// only existing admins can read the table or grant/revoke admin, so these
// browser calls are safe — the database is the real gatekeeper.
import { createClient } from "@/lib/supabase/client";

export type AdminRole = {
  id: string;
  email: string;
  role: string;
  created_at: string;
  created_by: string | null;
};

// Is the currently authenticated user an admin? Uses the SECURITY DEFINER
// is_admin() RPC so it works without exposing the roles table to non-admins.
export async function checkIsAdmin(): Promise<boolean> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("is_admin");
  if (error) return false;
  return data === true;
}

// List all admins (only returns rows if the caller is an admin, per RLS).
export async function listAdmins(): Promise<AdminRole[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("user_roles")
    .select("id, email, role, created_at, created_by")
    .order("created_at", { ascending: true });
  if (error || !data) return [];
  return data as AdminRole[];
}

// Promote an email to admin. Succeeds only if the caller is already an admin
// (enforced by RLS insert policy).
export async function promoteAdmin(email: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = createClient();
  const clean = email.trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(clean)) {
    return { ok: false, error: "Enter a valid email address." };
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { error } = await supabase
    .from("user_roles")
    .insert({ email: clean, role: "admin", created_by: user?.email || null });
  if (error) {
    if (error.message.toLowerCase().includes("duplicate")) {
      return { ok: false, error: "That email is already an admin." };
    }
    if (error.message.toLowerCase().includes("row-level security")) {
      return { ok: false, error: "Only admins can add admins." };
    }
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

// Revoke an admin by id (RLS: admins only).
export async function revokeAdmin(id: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = createClient();
  const { error } = await supabase.from("user_roles").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
