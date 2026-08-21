// Compatibility route: delete one partner (by id) from the dedicated secondary
// Supabase `affiliate_partners` table. Authentication remains on primary.
import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { createClient as createAuthClient } from "@/lib/supabase/server";
import { createPartnerDatabaseClient } from "@/lib/supabase/partners-server";

export const runtime = "nodejs";

const PARTNER_CACHE_TAG = "affiliate-partners";

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

  let partnerDb;
  try {
    partnerDb = createPartnerDatabaseClient();
  } catch (error) {
    console.error(
      "PARTNER_DATABASE_CONFIGURATION_FAILED:",
      error instanceof Error ? error.message : "unknown error"
    );
    return NextResponse.json(
      { error: "Partner database is not configured correctly." },
      { status: 503 }
    );
  }

  const { error } = await partnerDb.from("affiliate_partners").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  try {
    revalidateTag(PARTNER_CACHE_TAG);
  } catch (error) {
    console.warn(
      "PARTNER_CACHE_INVALIDATION_FAILED:",
      error instanceof Error ? error.message : "unknown error"
    );
  }

  return NextResponse.json({ ok: true, id });
}
