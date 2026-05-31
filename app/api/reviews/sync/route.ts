import { NextResponse } from "next/server";
import { reviewConnectors, sampleInbox } from "@/lib/reviews/engine";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    mode: "continuous-sync-demo",
    connectors: reviewConnectors.map((connector) => ({
      platform: connector.platform,
      status: connector.status,
      approval: connector.approval,
      rateLimit: connector.rateLimit,
      quirks: connector.quirks,
      cursor: connector.cursor,
      lastSyncedAt: connector.lastSyncedAt,
    })),
    imported: sampleInbox.length,
  });
}
