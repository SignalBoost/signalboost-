import { NextRequest, NextResponse } from "next/server";
import { getAvailableSlots } from "@/lib/calendar";

// Public endpoint — no auth required
export async function GET(req: NextRequest) {
  try {
    const serviceId = req.nextUrl.searchParams.get("serviceId");
    const date = req.nextUrl.searchParams.get("date");
    if (!serviceId || !date) {
      return NextResponse.json({ error: "serviceId and date required" }, { status: 400 });
    }
    const slots = await getAvailableSlots(serviceId, date);
    return NextResponse.json({ slots });
  } catch (err) {
    console.error("GET /api/calendar/slots:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
