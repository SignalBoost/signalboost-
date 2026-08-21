// File: app/api/admin/list-partners/route.ts
// Returns every partner from the dedicated secondary Supabase
// `affiliate_partners` table for the admin Manage screen.
import { NextRequest, NextResponse } from "next/server";
import { createClient as createAuthClient } from "@/lib/supabase/server";
import { createPartnerDatabaseClient } from "@/lib/supabase/partners-server";

export const runtime = "nodejs";

export async function GET(_req: NextRequest) {
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

  const { data, error } = await partnerDb
    .from("affiliate_partners")
    .select("id, name, category, category_key, category_label, network, description, tier, featured, url, regions")
    .order("name", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const partners = (data || []).map((row: Record<string, unknown>) => {
    let regions: string[] = [];
    const raw = row.regions;
    if (Array.isArray(raw)) regions = raw as string[];
    else if (typeof raw === "string" && raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) regions = parsed as string[];
      } catch {
        regions = [];
      }
    }
    return { ...row, regions };
  });

  return NextResponse.json({ partners });
}
