// File: app/api/admin/list-partners/route.ts
// Returns every partner from the Supabase `affiliate_partners` table for the
// admin Manage screen (including unfeatured / low-tier ones the public grid may
// not surface). Login + admin protected, mirroring save-partner's auth model.
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(_req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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

  const { data, error } = await supabase
    .from("affiliate_partners")
    .select("id, name, category, category_key, category_label, network, description, tier, featured, url, regions")
    .order("name", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // regions is stored as JSON text; parse to a string[] for the client.
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
