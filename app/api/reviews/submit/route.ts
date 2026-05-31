import { NextRequest, NextResponse } from "next/server";
import { createSubmission } from "@/lib/reviews/engine";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid review submission." }, { status: 400 });
  }

  const submission = createSubmission({
    customerName: typeof body.customerName === "string" ? body.customerName : undefined,
    language: typeof body.language === "string" ? body.language : undefined,
    locationId: typeof body.locationId === "string" ? body.locationId : undefined,
    rating: typeof body.rating === "number" ? body.rating : Number(body.rating || 5),
    comment: typeof body.comment === "string" ? body.comment : "",
    media: Array.isArray(body.media) ? [] : [],
  });

  return NextResponse.json({ status: "captured", submission, alerts: submission.sentiment === "negative" ? ["manager_escalation", "private_feedback_created"] : ["public_platform_prompt"] });
}
