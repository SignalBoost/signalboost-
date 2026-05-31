import { NextResponse } from "next/server";
import { sampleInbox } from "@/lib/reviews/engine";

export const runtime = "nodejs";

export async function POST() {
  const testimonials = sampleInbox.filter((review) => review.sentiment === "positive" && review.rating >= 4);
  return NextResponse.json({
    status: "queued",
    campaign: "positive-review-testimonials",
    count: testimonials.length,
    nextActions: ["Generate localized testimonial email", "Create social captions", "Attach CRM audience segment"],
  });
}
