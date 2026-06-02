import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAvailability, setAvailability } from "@/lib/calendar";

export async function GET(req: NextRequest) {
  try {
    const serviceId = req.nextUrl.searchParams.get("serviceId");
    if (!serviceId) return NextResponse.json({ error: "serviceId required" }, { status: 400 });
    const availability = await getAvailability(serviceId);
    return NextResponse.json({ availability });
  } catch (err) {
    console.error("GET /api/calendar/availability:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { serviceId, slots } = await req.json();
    if (!serviceId) return NextResponse.json({ error: "serviceId required" }, { status: 400 });
    await setAvailability(user.id, serviceId, slots || []);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("POST /api/calendar/availability:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
