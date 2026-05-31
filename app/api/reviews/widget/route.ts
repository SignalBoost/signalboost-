import { NextResponse } from "next/server";
import { reviewAnalytics, sampleInbox } from "@/lib/reviews/engine";

export const runtime = "nodejs";

export async function GET() {
  const approved = sampleInbox.filter((review) => review.moderationStatus === "approved");
  return NextResponse.json({
    status: "ok",
    badge: `${reviewAnalytics.averageRating}/5 from ${reviewAnalytics.totalReviews.toLocaleString()} reviews`,
    schema: {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: reviewAnalytics.averageRating,
        reviewCount: reviewAnalytics.totalReviews,
      },
    },
    reviews: approved,
  });
}
