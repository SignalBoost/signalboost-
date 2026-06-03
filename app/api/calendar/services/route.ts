import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getServices, createService, updateService, deleteService } from "@/lib/calendar";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const services = await getServices(user.id);
    return NextResponse.json({ services });
  } catch (err) {
    console.error("GET /api/calendar/services:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const { name, duration_minutes, price, currency, description, color, timezone } = body;
    if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });
    const service = await createService(user.id, user.email || "", {
      name,
      duration_minutes: duration_minutes || 60,
      price: price || 0,
      currency: currency || "USD",
      description: description || "",
      color: color || "#f5c542",
      timezone: timezone || "UTC",
    });
    return NextResponse.json({ service });
  } catch (err) {
    console.error("POST /api/calendar/services:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { serviceId, ...updates } = await req.json();
    if (!serviceId) return NextResponse.json({ error: "serviceId required" }, { status: 400 });
    await updateService(serviceId, updates);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("PUT /api/calendar/services:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { serviceId } = await req.json();
    if (!serviceId) return NextResponse.json({ error: "serviceId required" }, { status: 400 });
    await deleteService(serviceId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/calendar/services:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
