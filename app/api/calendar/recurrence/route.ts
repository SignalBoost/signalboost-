import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateOccurrences, type RecurrenceRule } from "@/lib/recurrence";

const RESEND_URL = "https://api.resend.com/emails";

async function sendEmail(to: string, subject: string, html: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return;
  try {
    await fetch(RESEND_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "SignalBoost Calendar <saassupport@signalboostapp.com>",
        to: [to],
        reply_to: "saassupport@signalboostapp.com",
        subject,
        html,
      }),
    });
  } catch { /* email failure shouldn't break series creation */ }
}

// POST /api/calendar/recurrence
// Body: { bookingId, rule, count? }
// Creates a recurring series from an existing booking
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { bookingId, rule, count = 12 } = await req.json();
    if (!bookingId || !rule) {
      return NextResponse.json({ error: "bookingId and rule required" }, { status: 400 });
    }

    // Fetch the original booking
    const { data: original, error: fetchErr } = await supabase
      .from("calendar_bookings")
      .select("*, calendar_services(name, timezone)")
      .eq("id", bookingId)
      .eq("owner_id", user.id)
      .single();

    if (fetchErr || !original) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Generate a shared series ID
    const seriesId = crypto.randomUUID();

    // Update original booking to be part of the series
    await supabase
      .from("calendar_bookings")
      .update({ series_id: seriesId, recurrence: rule, series_index: 0 })
      .eq("id", bookingId);

    // Generate future occurrence dates
    const futureDates = generateOccurrences(original.booking_date, rule as RecurrenceRule, count);

    // Create all future occurrences
    const occurrences = futureDates.map((date, i) => ({
      service_id: original.service_id,
      owner_id: user.id,
      client_name: original.client_name,
      client_email: original.client_email,
      booking_date: date,
      booking_time: original.booking_time,
      status: "confirmed", // auto-confirm recurring occurrences
      notes: original.notes,
      series_id: seriesId,
      recurrence: rule,
      series_index: i + 1,
    }));

    const { error: insertErr } = await supabase
      .from("calendar_bookings")
      .insert(occurrences);

    if (insertErr) throw insertErr;

    // Send email to client about recurring series
    const svcName = (original.calendar_services as { name: string } | null)?.name || "your appointment";
    const ruleLabel: Record<string, string> = {
      weekly: "every week",
      biweekly: "every 2 weeks",
      monthly: "every month",
      yearly: "every year",
    };
    const firstDate = new Date(original.booking_date + "T12:00:00").toLocaleDateString("en-US", {
      weekday: "long", month: "long", day: "numeric",
    });

    await sendEmail(
      original.client_email,
      "Recurring appointment confirmed — " + svcName,
      `<div style="font-family:sans-serif;max-width:560px;color:#111">
        <h2>Recurring Appointment Confirmed ↻</h2>
        <p>Hi ${original.client_name},</p>
        <p>Your appointment for <strong>${svcName}</strong> has been set to repeat <strong>${ruleLabel[rule] || rule}</strong>, starting <strong>${firstDate}</strong> at <strong>${original.booking_time}</strong>.</p>
        <p>This series will run for <strong>${count} occurrences</strong>. You will receive a reminder before each session.</p>
        <p>If you need to cancel or reschedule any session, please contact us directly.</p>
        <p style="color:#555;font-size:13px">The SignalBoost Team</p>
      </div>`
    );

    return NextResponse.json({ ok: true, seriesId, occurrencesCreated: occurrences.length });
  } catch (err) {
    console.error("POST /api/calendar/recurrence:", err);
    return NextResponse.json({ error: "Failed to create series" }, { status: 500 });
  }
}

// DELETE /api/calendar/recurrence
// Body: { seriesId, fromDate? } - cancel whole series or from a date onward
export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { seriesId, fromDate } = await req.json();
    if (!seriesId) return NextResponse.json({ error: "seriesId required" }, { status: 400 });

    let query = supabase
      .from("calendar_bookings")
      .update({ status: "cancelled" })
      .eq("series_id", seriesId)
      .eq("owner_id", user.id);

    // If fromDate provided, only cancel from that date onward
    if (fromDate) {
      query = query.gte("booking_date", fromDate);
    }

    const { error } = await query;
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/calendar/recurrence:", err);
    return NextResponse.json({ error: "Failed to cancel series" }, { status: 500 });
  }
}
