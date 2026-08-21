import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cachedPartnerWriteClient: SupabaseClient | null = null;
let cachedPartnerReadClient: SupabaseClient | null = null;

const AUTHORITATIVE_PARTNER_PROJECT_REF = "vdtxulrusfvyxdtatryx";
const AUTHORITATIVE_PARTNER_URL = `https://${AUTHORITATIVE_PARTNER_PROJECT_REF}.supabase.co`;
// Publishable keys are intentionally public. The affiliate_partners table has
// SELECT policies for anon/public, so public directory reads do not require a
// hidden Vercel service-role secret.
const AUTHORITATIVE_PARTNER_PUBLISHABLE_KEY = "sb_publishable_RibKPLEHTX20TO_6gWaRSQ_H7D6K4aR";

function normalizeUrl(value: string): string {
  return value.trim().replace(/\/+$/, "").toLowerCase();
}

function projectRefFromUrl(url: string): string {
  return url.match(/https:\/\/([^.]+)\.supabase\.co/i)?.[1] || "";
}

function assertAuthoritativePartnerUrl(url: string): void {
  const ref = projectRefFromUrl(url);
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
}

function resolvePartnerWriteConnection(): { url: string; key: string } {
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
      "PARTNER_DATABASE_NOT_CONFIGURED: configure one complete partner/secondary Supabase URL + service-role key pair for writes."
    );
  }

  assertAuthoritativePartnerUrl(configured.url);
  return configured;
}

export function getPartnerDatabaseRef(): string {
  return AUTHORITATIVE_PARTNER_PROJECT_REF;
}

/**
 * Public/read-only client for the authoritative affiliate partner directory.
 * This intentionally does not depend on Vercel secrets. Supabase RLS allows
 * SELECT for anon/public on affiliate_partners.
 */
export function createPartnerReadClient(): SupabaseClient {
  assertAuthoritativePartnerUrl(AUTHORITATIVE_PARTNER_URL);

  if (!cachedPartnerReadClient) {
    cachedPartnerReadClient = createClient(
      AUTHORITATIVE_PARTNER_URL,
      AUTHORITATIVE_PARTNER_PUBLISHABLE_KEY,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );
  }

  return cachedPartnerReadClient;
}

/**
 * Privileged server-only client for partner writes. Writes remain fail-closed
 * and require an explicit secondary service-role connection; they never fall
 * back to the primary application Supabase project.
 */
export function createPartnerDatabaseClient(): SupabaseClient {
  const { url, key: serviceRoleKey } = resolvePartnerWriteConnection();

  if (!cachedPartnerWriteClient) {
    cachedPartnerWriteClient = createClient(url, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return cachedPartnerWriteClient;
}
