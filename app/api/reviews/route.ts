import { NextRequest, NextResponse } from "next/server";
import { getReviewsSnapshot } from "@/lib/reviews/engine";
import { normalizeReviewLanguage } from "@/lib/reviews/localization";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const lang = normalizeReviewLanguage(req.nextUrl.searchParams.get("lang") || undefined);
  return NextResponse.json({ status: "ok", ...getReviewsSnapshot(lang) });
}
