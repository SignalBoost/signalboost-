import { NextRequest, NextResponse } from "next/server";
import { getAvailableSlots, createBooking, getServiceBySlug } from "@/lib/calendar";

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
  } catch {
    // email failure shouldn't break booking
  }
}

// Public endpoint — no user auth required (clients book without accounts)
export async function POST(req: NextRequest) {
  try {
    const { serviceId, slug, clientName, clientEmail, bookingDate, bookingTime, notes } = await req.json();

    if (!clientName || !clientEmail || !bookingDate || !bookingTime) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 });
    }
    if (!clientEmail.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    // Resolve service
    let svcId = serviceId;
    let service = null;
    if (!svcId && slug) {
      service = await getServiceBySlug(slug);
      if (!service) return NextResponse.json({ error: "Service not found" }, { status: 404 });
      svcId = service.id;
    }

    if (!svcId) return NextResponse.json({ error: "serviceId or slug required" }, { status: 400 });

    // Verify slot is still available
    const available = await getAvailableSlots(svcId, bookingDate);
    if (!available.includes(bookingTime)) {
      return NextResponse.json({ error: "This slot is no longer available. Please choose another time." }, { status: 409 });
    }

    // Get service details if not already loaded
    if (!service) {
      const { createClient } = await import("@/lib/supabase/server");
      const supabase = await createClient();
      const { data } = await supabase
        .from("calendar_services")
        .select("name, owner_id, owner_notify_email, price, currency, duration_minutes")
        .eq("id", svcId)
        .single();
      service = data;
    }

    if (!service) return NextResponse.json({ error: "Service not found" }, { status: 404 });

    const booking = await createBooking({
      service_id: svcId,
      owner_id: service.owner_id,
      client_name: clientName,
      client_email: clientEmail,
      booking_date: bookingDate,
      booking_time: bookingTime,
      notes: notes || "",
    });

    const formattedDate = new Date(bookingDate + "T12:00:00").toLocaleDateString("en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });
    const priceStr = Number(service.price) > 0
      ? `${service.currency} ${Number(service.price).toFixed(2)}`
      : "No charge";

    const detailsHtml = `
      <table style="border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:6px 16px 6px 0;color:#555">Service</td><td><strong>${service.name}</strong></td></tr>
        <tr><td style="padding:6px 16px 6px 0;color:#555">Date</td><td><strong>${formattedDate}</strong></td></tr>
        <tr><td style="padding:6px 16px 6px 0;color:#555">Time</td><td><strong>${bookingTime}</strong></td></tr>
        <tr><td style="padding:6px 16px 6px 0;color:#555">Duration</td><td><strong>${service.duration_minutes} min</strong></td></tr>
        <tr><td style="padding:6px 16px 6px 0;color:#555">Amount</td><td><strong>${priceStr}</strong></td></tr>
      </table>`;

    // Confirm to client
    await sendEmail(
      clientEmail,
      `Booking request received — ${service.name}`,
      `<div style="font-family:sans-serif;max-width:560px;color:#111">
        <h2 style="color:#000">We received your booking request</h2>
        <p>Hi ${clientName},</p>
        <p>Thank you for booking <strong>${service.name}</strong>. We'll confirm your appointment shortly.</p>
        ${detailsHtml}
        ${notes ? `<p><strong>Your notes:</strong> ${notes}</p>` : ""}
        <p>You'll receive a confirmation email once we've reviewed your request.</p>
        <p style="color:#555;font-size:13px">The SignalBoost Team</p>
      </div>`
    );

    // Notify owner
    if (service.owner_notify_email) {
      await sendEmail(
        service.owner_notify_email,
        `New booking request: ${service.name} — ${clientName}`,
        `<div style="font-family:sans-serif;max-width:560px;color:#111">
          <h2>New Booking Request</h2>
          <p><strong>${clientName}</strong> (${clientEmail}) has requested a booking.</p>
          ${detailsHtml}
          ${notes ? `<p><strong>Client notes:</strong> ${notes}</p>` : ""}
          <p>Log in to your SignalBoost Calendar to confirm or decline this request.</p>
          <p><a href="https://signalboostapp.com/calendar" style="color:#f5c542">Open Calendar Dashboard →</a></p>
        </div>`
      );
    }

    return NextResponse.json({ booking });
  } catch (err) {
    console.error("POST /api/calendar/book:", err);
    return NextResponse.json({ error: "Booking failed" }, { status: 500 });
  }
}
