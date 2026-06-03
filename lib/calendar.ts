import { createClient } from "@/lib/supabase/server";

export type CalendarService = {
  id: string;
  owner_id: string;
  owner_notify_email: string;
  name: string;
  slug: string;
  duration_minutes: number;
  price: number;
  currency: string;
  description: string;
  color: string;
  timezone: string;
  active: boolean;
  created_at: string;
};

export type CalendarAvailability = {
  id: string;
  service_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
};

export type CalendarBlockedDate = {
  id: string;
  blocked_date: string;
  reason: string;
};

export type CalendarBooking = {
  id: string;
  service_id: string;
  owner_id: string;
  client_name: string;
  client_email: string;
  booking_date: string;
  booking_time: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  notes: string;
  confirmation_sent: boolean;
  created_at: string;
  service_name?: string;
  service_price?: number;
  service_currency?: string;
  service_duration?: number;
  service_timezone?: string;
};

export function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// ── Services ──────────────────────────────────────────────────

export async function getServices(ownerId: string): Promise<CalendarService[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("calendar_services")
    .select("*")
    .eq("owner_id", ownerId)
    .order("created_at");
  if (error) throw error;
  return data || [];
}

export async function getServiceBySlug(slug: string): Promise<CalendarService | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("calendar_services")
    .select("*")
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle();
  return data || null;
}

export async function createService(
  ownerId: string,
  ownerEmail: string,
  input: Pick<CalendarService, "name" | "duration_minutes" | "price" | "currency" | "description" | "color" | "timezone">
): Promise<CalendarService> {
  const supabase = await createClient();
  const slug = generateSlug(input.name);
  const { data, error } = await supabase
    .from("calendar_services")
    .insert({ ...input, owner_id: ownerId, owner_notify_email: ownerEmail, slug })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateService(
  serviceId: string,
  updates: Partial<Pick<CalendarService, "name" | "duration_minutes" | "price" | "currency" | "description" | "color" | "timezone" | "active">>
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("calendar_services").update(updates).eq("id", serviceId);
  if (error) throw error;
}

export async function deleteService(serviceId: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("calendar_services").delete().eq("id", serviceId);
}

// ── Availability ──────────────────────────────────────────────

export async function getAvailability(serviceId: string): Promise<CalendarAvailability[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("calendar_availability")
    .select("*")
    .eq("service_id", serviceId)
    .order("day_of_week");
  if (error) throw error;
  return data || [];
}

export async function setAvailability(
  ownerId: string,
  serviceId: string,
  slots: { day_of_week: number; start_time: string; end_time: string }[]
): Promise<void> {
  const supabase = await createClient();
  await supabase.from("calendar_availability").delete().eq("service_id", serviceId);
  if (slots.length === 0) return;
  const { error } = await supabase.from("calendar_availability").insert(
    slots.map((s) => ({ ...s, service_id: serviceId, owner_id: ownerId }))
  );
  if (error) throw error;
}

// ── Blocked dates ─────────────────────────────────────────────

export async function getBlockedDates(ownerId: string): Promise<CalendarBlockedDate[]> {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];
  const { data, error } = await supabase
    .from("calendar_blocked_dates")
    .select("*")
    .eq("owner_id", ownerId)
    .gte("blocked_date", today)
    .order("blocked_date");
  if (error) throw error;
  return data || [];
}

export async function blockDate(ownerId: string, date: string, reason: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("calendar_blocked_dates").insert({ owner_id: ownerId, blocked_date: date, reason });
}

export async function unblockDate(id: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("calendar_blocked_dates").delete().eq("id", id);
}

// ── Bookings ──────────────────────────────────────────────────

export async function getBookings(ownerId: string): Promise<CalendarBooking[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("calendar_bookings")
    .select("*, calendar_services(name, price, currency, duration_minutes, timezone)")
    .eq("owner_id", ownerId)
    .order("booking_date")
    .order("booking_time");
  if (error) throw error;
  return (data || []).map((b) => {
    const svc = b.calendar_services as { name: string; price: number; currency: string; duration_minutes: number; timezone: string } | null;
    return { ...b, service_name: svc?.name, service_price: svc?.price, service_currency: svc?.currency, service_duration: svc?.duration_minutes, service_timezone: svc?.timezone };
  });
}

export async function createBooking(input: {
  service_id: string; owner_id: string; client_name: string;
  client_email: string; booking_date: string; booking_time: string; notes: string;
}): Promise<CalendarBooking> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("calendar_bookings").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function updateBookingStatus(bookingId: string, status: CalendarBooking["status"]): Promise<void> {
  const supabase = await createClient();
  const updates: Record<string, unknown> = { status };
  if (status === "confirmed") updates.confirmation_sent = true;
  await supabase.from("calendar_bookings").update(updates).eq("id", bookingId);
}

// ── Slot calculation ──────────────────────────────────────────

export function generateTimeSlots(startTime: string, endTime: string, durationMinutes: number): string[] {
  const toMins = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
  const toTime = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
  const slots: string[] = [];
  let cur = toMins(startTime);
  const end = toMins(endTime);
  while (cur + durationMinutes <= end) { slots.push(toTime(cur)); cur += durationMinutes; }
  return slots;
}

export async function getAvailableSlots(serviceId: string, date: string): Promise<string[]> {
  const supabase = await createClient();
  const { data: svc } = await supabase.from("calendar_services").select("duration_minutes, owner_id").eq("id", serviceId).single();
  if (!svc) return [];
  const { data: blocked } = await supabase.from("calendar_blocked_dates").select("id").eq("owner_id", svc.owner_id).eq("blocked_date", date).maybeSingle();
  if (blocked) return [];
  const dayOfWeek = new Date(date + "T12:00:00").getDay();
  const { data: avail } = await supabase.from("calendar_availability").select("start_time, end_time").eq("service_id", serviceId).eq("day_of_week", dayOfWeek).maybeSingle();
  if (!avail) return [];
  const all = generateTimeSlots(avail.start_time, avail.end_time, svc.duration_minutes);
  const { data: booked } = await supabase.from("calendar_bookings").select("booking_time").eq("service_id", serviceId).eq("booking_date", date).in("status", ["pending", "confirmed"]);
  const taken = new Set((booked || []).map((b) => b.booking_time));
  return all.filter((s) => !taken.has(s));
}

export async function getAvailableDaysOfWeek(serviceId: string): Promise<number[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("calendar_availability").select("day_of_week").eq("service_id", serviceId);
  return (data || []).map((d) => d.day_of_week);
}
