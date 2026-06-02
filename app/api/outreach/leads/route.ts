import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getLeads,
  getMessages,
  getTodaySentCount,
  createLead,
  updateLead,
} from "@/lib/outreach";

// GET /api/outreach/leads → { leads, messages, todayCount }
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [leads, messages, todayCount] = await Promise.all([
      getLeads(user.id),
      getMessages(user.id),
      getTodaySentCount(user.id),
    ]);

    return NextResponse.json({ leads, messages, todayCount });
  } catch (err) {
    console.error("GET /api/outreach/leads:", err);
    return NextResponse.json({ error: "Failed to load leads" }, { status: 500 });
  }
}

// POST /api/outreach/leads → create a new lead
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { name, email, company, category, network, affiliate_url, notes } = body;
    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const lead = await createLead(user.id, {
      name,
      email: email || "",
      company: company || name,
      category: category || "",
      network: network || "",
      affiliate_url: affiliate_url || "",
      source: "manual",
      notes: notes || "",
    });

    return NextResponse.json({ lead });
  } catch (err) {
    console.error("POST /api/outreach/leads:", err);
    return NextResponse.json({ error: "Failed to create lead" }, { status: 500 });
  }
}

// PUT /api/outreach/leads → update email, notes, or status on a lead
export async function PUT(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { leadId, email, notes, status } = body;
    if (!leadId) return NextResponse.json({ error: "leadId required" }, { status: 400 });

    const updates: Record<string, string> = {};
    if (email !== undefined) updates.email = email;
    if (notes !== undefined) updates.notes = notes;
    if (status !== undefined) updates.status = status;

    await updateLead(leadId, updates);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("PUT /api/outreach/leads:", err);
    return NextResponse.json({ error: "Failed to update lead" }, { status: 500 });
  }
}
