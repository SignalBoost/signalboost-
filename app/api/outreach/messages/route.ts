import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// PUT /api/outreach/messages → update subject, body, and/or status
export async function PUT(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { messageId, leadId, subject, body, status } = await req.json();
    if (!messageId) return NextResponse.json({ error: "messageId required" }, { status: 400 });

    const msgUpdates: Record<string, string> = {};
    if (subject !== undefined) msgUpdates.subject = subject;
    if (body !== undefined) msgUpdates.body = body;
    if (status !== undefined) msgUpdates.status = status;

    const { error: msgErr } = await supabase
      .from("outreach_messages")
      .update(msgUpdates)
      .eq("id", messageId)
      .eq("owner_id", user.id);
    if (msgErr) throw msgErr;

    // Keep lead status in sync
    if (status === "approved" && leadId) {
      await supabase
        .from("outreach_leads")
        .update({ status: "approved" })
        .eq("id", leadId)
        .eq("owner_id", user.id);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("PUT /api/outreach/messages:", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
