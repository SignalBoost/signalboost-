import { NextRequest, NextResponse } from "next/server";
import { sampleInbox } from "@/lib/reviews/engine";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const reviewId = typeof body.reviewId === "string" ? body.reviewId : sampleInbox[0].id;
  const item = sampleInbox.find((review) => review.id === reviewId) || sampleInbox[0];
  return NextResponse.json({
    status: "drafted",
    reviewId: item.id,
    platform: item.source,
    assignedTo: typeof body.assignedTo === "string" ? body.assignedTo : item.assignedTo,
    draft: typeof body.message === "string" && body.message.trim() ? body.message : item.aiDraft,
    publishReady: item.source !== "private",
  });
}
