import { NextRequest, NextResponse } from "next/server";
import { orchestrate, type OrchestrationRequest } from "@/lib/ai/orchestration";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: Partial<OrchestrationRequest> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const message = typeof body.message === "string" ? body.message : "";
  const module = body.module;
  const lang = typeof body.lang === "string" ? body.lang : "en";
  const history = Array.isArray(body.history) ? body.history : [];

  const result = await orchestrate({ message, module, lang, history });
  return NextResponse.json(result);
}
