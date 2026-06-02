import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getBlockedDates, blockDate, unblockDate } from "@/lib/calendar";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const blocked = await getBlockedDates(user.id);
    return NextResponse.json({ blocked });
  } catch (err) {
    console.error("GET /api/calendar/blocked:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { date, reason } = await req.json();
    if (!date) return NextResponse.json({ error: "Date required" }, { status: 400 });
    await blockDate(user.id, date, reason || "");
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("POST /api/calendar/blocked:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    await unblockDate(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/calendar/blocked:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
