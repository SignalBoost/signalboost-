// Compatibility route: delete one partner (by id) from the authoritative
// secondary Supabase `affiliate_partners` table. Authentication remains on
// primary. Prefer a direct secondary service-role connection; if the deployment
// secret is unavailable, fall back to the secured secondary partner-admin broker.
import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { createClient as createAuthClient } from "@/lib/supabase/server";
import { createPartnerDatabaseClient } from "@/lib/supabase/partners-server";
import { callPartnerAdminBroker } from "@/lib/supabase/partner-admin-broker";

export const runtime = "nodejs";

const PARTNER_CACHE_TAG = "affiliate-partners";

function invalidatePartnerCache() {
  try {
    revalidateTag(PARTNER_CACHE_TAG);
  } catch (error) {
    console.warn(
      "PARTNER_CACHE_INVALIDATION_FAILED:",
      error instanceof Error ? error.message : "unknown error"
    );
  }
}

export async function POST(req: NextRequest) {
  const authSupabase = await createAuthClient();
  const {
    data: { user },
  } = await authSupabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  }

  const admins = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  const email = (user.email || "").toLowerCase();
  if (admins.length > 0 && !admins.includes(email)) {
    return NextResponse.json({ error: "Not an admin account." }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const id = String(body.id || "").trim();
  if (!id) {
    return NextResponse.json({ error: "Partner id is required." }, { status: 400 });
  }

  let partnerDb: ReturnType<typeof createPartnerDatabaseClient> | null = null;
  try {
    partnerDb = createPartnerDatabaseClient();
  } catch (error) {
    console.warn(
      "PARTNER_DATABASE_DIRECT_CONNECTION_UNAVAILABLE:",
      error instanceof Error ? error.message : "unknown error"
    );
  }

  if (!partnerDb) {
    const {
      data: { session },
    } = await authSupabase.auth.getSession();

    if (!session?.access_token) {
      return NextResponse.json({ error: "Authenticated session is required." }, { status: 401 });
    }

    const broker = await callPartnerAdminBroker(session.access_token, {
      action: "delete",
      id,
    });

    if (!broker.ok) {
      console.error("PARTNER_ADMIN_BROKER_DELETE_FAILED:", broker.error);
      return NextResponse.json({ error: broker.error }, { status: broker.status });
    }

    invalidatePartnerCache();
    return NextResponse.json({ ok: true, id, writePath: "secondary-edge-broker" });
  }

  const { error } = await partnerDb.from("affiliate_partners").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  invalidatePartnerCache();
  return NextResponse.json({ ok: true, id, writePath: "secondary-service-role" });
}
