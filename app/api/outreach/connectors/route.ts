import { NextResponse } from "next/server";
import { OUTREACH_CONNECTORS } from "@/lib/outreach/connectors";

export async function GET() {
  return NextResponse.json({ connectors: OUTREACH_CONNECTORS });
}
