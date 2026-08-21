import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cachedPartnerClient: SupabaseClient | null = null;

const AUTHORITATIVE_PARTNER_PROJECT_REF = "vdtxulrusfvyxdtatryx";

function normalizeUrl(value: string): string {
  return value.trim().replace(/\/+$/, "").toLowerCase();
}

function resolvePartnerConnection(): { url: string; key: string } {
  const candidates = [
    {
      url: process.env.PARTNERS_SUPABASE_URL?.trim() || "",
      key: process.env.PARTNERS_SUPABASE_SERVICE_ROLE_KEY?.trim() || "",
    },
    {
      url: process.env.SECONDARY_SUPABASE_URL?.trim() || "",
      key: process.env.SECONDARY_SUPABASE_SERVICE_ROLE_KEY?.trim() || "",
    },
    {
      url: process.env.MARKETING_SUPABASE_URL?.trim() || "",
      key: process.env.MARKETING_SUPABASE_SERVICE_ROLE_KEY?.trim() || "",
    },
  ];

  const configured = candidates.find((candidate) => candidate.url && candidate.key);
  if (!configured) {
    throw new Error(
      "PARTNER_DATABASE_NOT_CONFIGURED: configure one complete partner/secondary Supabase URL + service-role key pair."
    );
  }

  return configured;
}

export function getPartnerDatabaseRef(): string {
  try {
    const { url } = resolvePartnerConnection();
    return url.match(/https:\/\/([^.]+)\.supabase\.co/i)?.[1] || "unknown";
  } catch {
    return "unknown";
  }
}

/**
 * Server-only client for the single authoritative affiliate partner database.
 * Partner data must never fall back to the application's primary Supabase.
 */
export function createPartnerDatabaseClient(): SupabaseClient {
  const { url, key: serviceRoleKey } = resolvePartnerConnection();
  const ref = url.match(/https:\/\/([^.]+)\.supabase\.co/i)?.[1] || "";

  const primaryUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (primaryUrl && normalizeUrl(primaryUrl) === normalizeUrl(url)) {
    throw new Error(
      "PARTNER_DATABASE_MISCONFIGURED: partner database must not point to the primary Supabase project."
    );
  }

  if (ref !== AUTHORITATIVE_PARTNER_PROJECT_REF) {
    throw new Error(
      `PARTNER_DATABASE_MISCONFIGURED: expected secondary project ${AUTHORITATIVE_PARTNER_PROJECT_REF}, received ${ref || "unknown"}.`
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
