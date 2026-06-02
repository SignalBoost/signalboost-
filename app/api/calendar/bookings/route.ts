import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getBookings, updateBookingStatus } from "@/lib/calendar";

const RESEND_URL = "https://api.resend.com/emails";

async function sendEmail(to: string, subject: string, html: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return;
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
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const bookings = await getBookings(user.id);
    const counts = { pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
    let revenue = 0;
    for (const b of bookings) {
      if (counts[b.status] !== undefined) counts[b.status]++;
      if ((b.status === "confirmed" || b.status === "completed") && b.service_price) {
        revenue += Number(b.service_price);
      }
    }
    return NextResponse.json({ bookings, counts, revenue });
  } catch (err) {
    console.error("GET /api/calendar/bookings:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { bookingId, status, clientEmail, clientName, serviceName, bookingDate, bookingTime, currency, price } = await req.json();
    if (!bookingId || !status) return NextResponse.json({ error: "bookingId and status required" }, { status: 400 });

    await updateBookingStatus(bookingId, status);

    const formattedDate = bookingDate ? new Date(bookingDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) : "";
    const priceStr = price && Number(price) > 0 ? `${currency || "USD"} ${Number(price).toFixed(2)}` : "No charge";

    if (status === "confirmed" && clientEmail) {
      await sendEmail(
        clientEmail,
        `Your booking is confirmed — ${serviceName}`,
        `<div style="font-family:sans-serif;max-width:560px;color:#111">
          <h2 style="color:#000">Your booking is confirmed ✓</h2>
          <p>Hi ${clientName || "there"},</p>
          <p>Your booking for <strong>${serviceName}</strong> has been confirmed.</p>
          <table style="border-collapse:collapse;margin:16px 0">
            <tr><td style="padding:6px 16px 6px 0;color:#555">Date</td><td style="padding:6px 0"><strong>${formattedDate}</strong></td></tr>
            <tr><td style="padding:6px 16px 6px 0;color:#555">Time</td><td style="padding:6px 0"><strong>${bookingTime}</strong></td></tr>
            <tr><td style="padding:6px 16px 6px 0;color:#555">Service</td><td style="padding:6px 0"><strong>${serviceName}</strong></td></tr>
            <tr><td style="padding:6px 16px 6px 0;color:#555">Amount</td><td style="padding:6px 0"><strong>${priceStr}</strong></td></tr>
          </table>
          <p>We look forward to seeing you. If you need to make any changes, please reply to this email.</p>
          <p style="color:#555;font-size:13px">The SignalBoost Team</p>
        </div>`
      );
    }

    if (status === "cancelled" && clientEmail) {
      await sendEmail(
        clientEmail,
        `Booking cancelled — ${serviceName}`,
        `<div style="font-family:sans-serif;max-width:560px;color:#111">
          <h2>Booking Cancelled</h2>
          <p>Hi ${clientName || "there"},</p>
          <p>Your booking for <strong>${serviceName}</strong> on <strong>${formattedDate} at ${bookingTime}</strong> has been cancelled.</p>
          <p>If you'd like to reschedule, please visit our booking page. We're sorry for any inconvenience.</p>
          <p style="color:#555;font-size:13px">The SignalBoost Team</p>
        </div>`
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("PUT /api/calendar/bookings:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
