import { NextResponse } from "next/server";
import { buildAuditLog, enforceOutreachRateLimit, getConnector } from "@/lib/outreach/connectors";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const connector = getConnector(body.channel || "");
  if (!connector) {
    return NextResponse.json({ error: "Unsupported outreach connector" }, { status: 400 });
  }

  const queuedToday = Number(body.queuedToday || 0);
  const rateLimit = enforceOutreachRateLimit(queuedToday, connector.dailyLimit);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Daily outreach limit reached", rateLimit }, { status: 429 });
  }

  return NextResponse.json({
    status: "queued_for_approval",
    connector,
    rateLimit,
    auditLog: buildAuditLog("social_post_queued", connector.channel, body.actor || "workspace-admin"),
  });
}
