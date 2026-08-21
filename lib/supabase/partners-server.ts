import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cachedPartnerClient: SupabaseClient | null = null;

function normalizeUrl(value: string): string {
  return value.trim().replace(/\/+$/, "").toLowerCase();
}

export function getPartnerDatabaseRef(): string {
  const url = process.env.PARTNERS_SUPABASE_URL?.trim() || "";
  return url.match(/https:\/\/([^.]+)\.supabase\.co/i)?.[1] || "unknown";
}

/**
 * Server-only Supabase client dedicated to the affiliate partner directory.
 *
 * IMPORTANT: partner data must never fall back to the application's primary
 * Supabase project. If this dedicated connection is missing or accidentally
 * points at NEXT_PUBLIC_SUPABASE_URL, fail closed instead of reading/writing
 * affiliate_partners in the wrong database.
 */
export function createPartnerDatabaseClient(): SupabaseClient {
  const url = process.env.PARTNERS_SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.PARTNERS_SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !serviceRoleKey) {
    throw new Error(
      "PARTNER_DATABASE_NOT_CONFIGURED: PARTNERS_SUPABASE_URL and PARTNERS_SUPABASE_SERVICE_ROLE_KEY are required."
    );
  }

  const primaryUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (primaryUrl && normalizeUrl(primaryUrl) === normalizeUrl(url)) {
    throw new Error(
      "PARTNER_DATABASE_MISCONFIGURED: PARTNERS_SUPABASE_URL must point to the secondary partner database, not the primary Supabase project."
    );
  }

  if (!cachedPartnerClient) {
    cachedPartnerClient = createClient(url, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return cachedPartnerClient;
}
