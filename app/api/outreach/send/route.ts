import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getTodaySentCount,
  markSent,
  markFailed,
  approveMessage,
} from "@/lib/outreach";

const DAILY_LIMIT = 50;
const FROM_ALIAS = "SignalBoost Partners <saaspartners@signalboostapp.com>";
const REPLY_TO = "saaspartners@signalboostapp.com";
const RESEND_URL = "https://api.resend.com/emails";

// POST /api/outreach/send → send an approved message via Resend
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { messageId, leadId, toEmail, subject, body } = await req.json();
    if (!messageId || !leadId || !toEmail || !subject || !body) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (!toEmail.includes("@")) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    // Enforce daily cap server-side
    const todayCount = await getTodaySentCount(user.id);
    if (todayCount >= DAILY_LIMIT) {
      return NextResponse.json(
        { error: `Daily limit of ${DAILY_LIMIT} emails reached. Try again tomorrow.` },
        { status: 429 }
      );
    }

    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      return NextResponse.json(
        { error: "Email sending not configured (missing RESEND_API_KEY in Vercel env vars)" },
        { status: 503 }
      );
    }

    // Convert plain-text body to minimal HTML (preserves line breaks)
    const htmlBody = `<div style="font-family:sans-serif;font-size:15px;line-height:1.6;color:#111;max-width:600px">${body
      .split("\n\n")
      .map((para: string) => `<p>${para.replace(/\n/g, "<br/>")}</p>`)
      .join("")}</div>`;

    const res = await fetch(RESEND_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_ALIAS,
        to: [toEmail],
        reply_to: REPLY_TO,
        subject,
        html: htmlBody,
        text: body,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      console.error("Resend error:", errData);
      await markFailed(messageId);
      return NextResponse.json(
        { error: (errData as { message?: string }).message || "Email send failed" },
        { status: 502 }
      );
    }

    // Ensure message is marked approved before marking sent (in case of direct send)
    await approveMessage(messageId, leadId);
    await markSent(messageId, leadId);

    return NextResponse.json({ ok: true, sentToday: todayCount + 1 });
  } catch (err) {
    console.error("POST /api/outreach/send:", err);
    return NextResponse.json({ error: "Send failed" }, { status: 500 });
  }
}
