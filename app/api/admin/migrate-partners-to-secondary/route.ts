// One-time safety migration for affiliate partners accidentally stored in the
// primary application Supabase project.
//
// POST while logged in as a SignalBoost admin. This endpoint is intentionally
// NON-DESTRUCTIVE: it copies only IDs that are missing from the dedicated
// secondary partner database and then verifies every primary ID exists there.
// It never deletes or overwrites an existing secondary partner.

import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient as createAuthClient } from "@/lib/supabase/server";
import {
  createPartnerDatabaseClient,
  getPartnerDatabaseRef,
} from "@/lib/supabase/partners-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PARTNER_COLUMNS = [
  "id",
  "name",
  "category",
  "category_key",
  "category_label",
  "network",
  "logo",
  "description",
  "tier",
  "featured",
  "travel_related",
  "url",
  "regions",
  "regional_urls",
  "placements",
  "created_at",
].join(",");

const BATCH_SIZE = 50;

type PartnerRow = Record<string, unknown> & { id: string };

function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export async function POST() {
  // Authenticate with the primary application Supabase project.
  const authSupabase = await createAuthClient();
  const {
    data: { user },
  } = await authSupabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  }

  const admins = adminEmails();
  const email = (user.email || "").toLowerCase();
  if (admins.length > 0 && !admins.includes(email)) {
    return NextResponse.json({ error: "Not an admin account." }, { status: 403 });
  }

  const primaryUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const primaryServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!primaryUrl || !primaryServiceRoleKey) {
    return NextResponse.json(
      { error: "Primary service-role connection is not configured for migration." },
      { status: 503 }
    );
  }

  let secondary;
  try {
    secondary = createPartnerDatabaseClient();
  } catch (error) {
    return NextResponse.json(
      {
        error: "Secondary partner database is not configured correctly.",
        detail: error instanceof Error ? error.message : "unknown error",
      },
      { status: 503 }
    );
  }

  const primary = createSupabaseClient(primaryUrl, primaryServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: primaryData, error: primaryError } = await primary
    .from("affiliate_partners")
    .select(PARTNER_COLUMNS)
    .order("id", { ascending: true });

  if (primaryError) {
    return NextResponse.json(
      { error: `Unable to read primary affiliate_partners: ${primaryError.message}` },
      { status: 500 }
    );
  }

  const primaryRows = ((primaryData ?? []) as unknown as PartnerRow[]).filter(
    (row) => typeof row.id === "string" && row.id.length > 0
  );

  const { data: secondaryBeforeData, error: secondaryBeforeError } = await secondary
    .from("affiliate_partners")
    .select("id");

  if (secondaryBeforeError) {
    return NextResponse.json(
      { error: `Unable to read secondary affiliate_partners: ${secondaryBeforeError.message}` },
      { status: 500 }
    );
  }

  const secondaryBeforeIds = new Set(
    (secondaryBeforeData ?? [])
      .map((row: { id?: unknown }) => String(row.id ?? ""))
      .filter(Boolean)
  );

  // Secondary is authoritative. Never overwrite an ID that already exists there.
  const missingRows = primaryRows.filter((row) => !secondaryBeforeIds.has(row.id));

  for (let index = 0; index < missingRows.length; index += BATCH_SIZE) {
    const batch = missingRows.slice(index, index + BATCH_SIZE);
    const { error: insertError } = await secondary
      .from("affiliate_partners")
      .insert(batch);

    if (insertError) {
      return NextResponse.json(
        {
          error: `Secondary insert failed at batch ${Math.floor(index / BATCH_SIZE) + 1}: ${insertError.message}`,
          primaryCount: primaryRows.length,
          secondaryBeforeCount: secondaryBeforeIds.size,
          attemptedMissingCount: missingRows.length,
        },
        { status: 500 }
      );
    }
  }

  const { data: secondaryAfterData, error: secondaryAfterError } = await secondary
    .from("affiliate_partners")
    .select("id");

  if (secondaryAfterError) {
    return NextResponse.json(
      { error: `Unable to verify secondary affiliate_partners: ${secondaryAfterError.message}` },
      { status: 500 }
    );
  }

  const secondaryAfterIds = new Set(
    (secondaryAfterData ?? [])
      .map((row: { id?: unknown }) => String(row.id ?? ""))
      .filter(Boolean)
  );
  const missingAfter = primaryRows
    .map((row) => row.id)
    .filter((id) => !secondaryAfterIds.has(id));

  return NextResponse.json({
    ok: missingAfter.length === 0,
    destructiveActionTaken: false,
    primaryCount: primaryRows.length,
    secondaryBeforeCount: secondaryBeforeIds.size,
    copiedToSecondary: missingRows.length,
    alreadyInSecondary: primaryRows.length - missingRows.length,
    secondaryAfterCount: secondaryAfterIds.size,
    missingAfterCount: missingAfter.length,
    missingAfter: missingAfter.slice(0, 25),
    cleanupReady: primaryRows.length > 0 && missingAfter.length === 0,
    partnerDatabaseRef: getPartnerDatabaseRef(),
  });
}
