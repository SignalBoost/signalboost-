import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type ReviewChannel = "email" | "sms" | "both";

type ReviewRequestPayload = {
  businessName?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  channel?: ReviewChannel;
  rating?: string | number;
  message?: string;
  locale?: string;
};

const REVIEW_TABLE = "review_requests";

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isEmail(value: string) {
  return /^\S+@\S+\.\S+$/.test(value);
}

function localizedSubject(locale: string, businessName: string) {
  const subjects: Record<string, string> = {
    en: `How was your experience with ${businessName}?`,
    es: `¿Cómo fue tu experiencia con ${businessName}?`,
    pt: `Como foi sua experiência com ${businessName}?`,
    pl: `Jak oceniasz doświadczenie z ${businessName}?`,
    ru: `Как вам опыт с ${businessName}?`,
  };
  return subjects[locale] || subjects.en;
}

function localizedBody(locale: string, payload: Required<Pick<ReviewRequestPayload, "businessName" | "customerName" | "message">>) {
  const message = payload.message || "Could you share a quick review?";
  const bodies: Record<string, string> = {
    en: `Hi ${payload.customerName},\n\n${message}\n\nThank you,\n${payload.businessName}`,
    es: `Hola ${payload.customerName},\n\n${message}\n\nGracias,\n${payload.businessName}`,
    pt: `Olá ${payload.customerName},\n\n${message}\n\nObrigado,\n${payload.businessName}`,
    pl: `Cześć ${payload.customerName},\n\n${message}\n\nDziękujemy,\n${payload.businessName}`,
    ru: `Здравствуйте, ${payload.customerName},\n\n${message}\n\nСпасибо,\n${payload.businessName}`,
  };
  return bodies[locale] || bodies.en;
}

async function sendResendEmail(payload: {
  to: string;
  subject: string;
  text: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    return { status: "skipped", reason: "RESEND_API_KEY missing" };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.REVIEWS_FROM_EMAIL || "SignalBoost <reviews@signalboostapp.com>",
      to: payload.to,
      subject: payload.subject,
      text: payload.text,
    }),
  });

  if (!response.ok) {
    return { status: "failed", reason: await response.text() };
  }

  return { status: "sent", provider: "resend", response: await response.json() };
}

export async function POST(req: NextRequest) {
  let body: ReviewRequestPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const businessName = clean(body.businessName);
  const customerName = clean(body.customerName);
  const customerEmail = clean(body.customerEmail);
  const customerPhone = clean(body.customerPhone);
  const channel = ["email", "sms", "both"].includes(clean(body.channel)) ? (clean(body.channel) as ReviewChannel) : "email";
  const locale = ["en", "es", "pt", "pl", "ru"].includes(clean(body.locale)) ? clean(body.locale) : "en";
  const message = clean(body.message);
  const rating = Number(body.rating) || null;

  if (!businessName || !customerName) {
    return NextResponse.json({ error: "Business and customer names are required." }, { status: 400 });
  }
  if ((channel === "email" || channel === "both") && !isEmail(customerEmail)) {
    return NextResponse.json({ error: "A valid customer email is required for email delivery." }, { status: 400 });
  }
  if ((channel === "sms" || channel === "both") && !customerPhone) {
    return NextResponse.json({ error: "Customer phone is required for SMS delivery." }, { status: 400 });
  }

  const requestRow = {
    business_name: businessName,
    customer_name: customerName,
    customer_email: customerEmail || null,
    customer_phone: customerPhone || null,
    channel,
    locale,
    rating,
    message,
    delivery_status: "queued",
    metadata: {
      source: "signalboost_reviews_stage_1",
      sms_status: channel === "sms" || channel === "both" ? "queued_for_provider" : "not_requested",
    },
  };

  let supabaseStatus: "stored" | "skipped" | "failed" = "skipped";
  let supabaseError: string | undefined;
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.from(REVIEW_TABLE).insert(requestRow);
      if (error) throw error;
      supabaseStatus = "stored";
    } catch (error) {
      supabaseStatus = "failed";
      supabaseError = error instanceof Error ? error.message : "Unknown Supabase error";
    }
  }

  const emailStatus = channel === "email" || channel === "both"
    ? await sendResendEmail({
        to: customerEmail,
        subject: localizedSubject(locale, businessName),
        text: localizedBody(locale, { businessName, customerName, message }),
      })
    : { status: "not_requested" };

  return NextResponse.json({
    ok: true,
    reviewRequest: requestRow,
    delivery: {
      supabase: supabaseStatus,
      supabaseError,
      email: emailStatus,
      sms: channel === "sms" || channel === "both" ? "queued_for_provider" : "not_requested",
    },
  });
}
