import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createCalendarEvent, getCalendarEvents, zonedTimeToUtc, type CalendarRecurrence } from "@/lib/calendar";

const RULES = ["none", "weekly", "monthly", "yearly"];

function safeRecurrence(input: unknown): CalendarRecurrence {
  const raw = input && typeof input === "object" ? input as Record<string, unknown> : {};
  const rule = RULES.includes(String(raw.rule)) ? String(raw.rule) as CalendarRecurrence["rule"] : "none";
  const frequency = Math.max(1, Number(raw.frequency || 1));
  const exceptions = Array.isArray(raw.exceptions) ? raw.exceptions.map(String).filter(Boolean) : [];
  return { rule, frequency, exceptions };
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const events = await getCalendarEvents(user.id);
  return NextResponse.json({ events });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const title = String(body.title || "Appointment").trim();
  const date = String(body.date || "");
  const start = String(body.start || "");
  const end = String(body.end || "");
  const timezone = String(body.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");
  if (!title || !date || !start || !end) return NextResponse.json({ error: "title, date, start, and end are required" }, { status: 400 });
  const startUtc = zonedTimeToUtc(date, start, timezone);
  const endUtc = zonedTimeToUtc(date, end, timezone);
  const event = await createCalendarEvent({
    account_id: user.id,
    service_id: body.service_id ? String(body.service_id) : null,
    title,
    description: body.description ? String(body.description) : null,
    start_time: startUtc,
    end_time: endUtc,
    timezone,
    recurrence: safeRecurrence(body.recurrence),
  });
  return NextResponse.json({ event });
}

export async function PUT(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const id = String(body.id || "");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const patch: Record<string, unknown> = {};
  ["title", "description", "timezone", "service_id"].forEach((key) => { if (body[key] !== undefined) patch[key] = body[key]; });
  if (body.recurrence) patch.recurrence = safeRecurrence(body.recurrence);
  const { error } = await supabase.from("calendar_events").update(patch).eq("id", id).eq("account_id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json().catch(() => ({}));
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const { error } = await supabase.from("calendar_events").delete().eq("id", String(id)).eq("account_id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
