import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { markReplied, markDemo, markClosed, markLost } from "@/lib/outreach";

// POST /api/outreach/outcome → advance a lead through the real CRM funnel
// body: { leadId, outcome: "replied"|"demo"|"closed"|"lost", dealValue? }
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { leadId, outcome, dealValue } = await req.json();
    if (!leadId || !outcome) {
      return NextResponse.json({ error: "leadId and outcome required" }, { status: 400 });
    }

    switch (outcome) {
      case "replied":
        await markReplied(leadId, user.id);
        break;
      case "demo":
        await markDemo(leadId, user.id);
        break;
      case "closed": {
        const value = Number(dealValue);
        if (!Number.isFinite(value) || value < 0) {
          return NextResponse.json({ error: "Valid dealValue required to close" }, { status: 400 });
        }
        await markClosed(leadId, user.id, value);
        break;
      }
      case "lost":
        await markLost(leadId, user.id);
        break;
      default:
        return NextResponse.json({ error: "Unknown outcome" }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("POST /api/outreach/outcome:", err);
    return NextResponse.json({ error: "Failed to record outcome" }, { status: 500 });
  }
}
