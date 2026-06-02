import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { importPartnerLeads } from "@/lib/outreach";
import partnersData from "@/partners.json";

type PartnerEntry = {
  id: string;
  name: string;
  category_label?: string;
  network?: string;
  url?: string;
};

// POST /api/outreach/import → bulk-create leads from partners.json
export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const partners = (Array.isArray(partnersData) ? partnersData : []) as PartnerEntry[];
    const result = await importPartnerLeads(user.id, partners);

    return NextResponse.json(result);
  } catch (err) {
    console.error("POST /api/outreach/import:", err);
    return NextResponse.json({ error: "Import failed" }, { status: 500 });
  }
}
