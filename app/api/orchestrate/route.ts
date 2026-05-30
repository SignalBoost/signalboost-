import { NextRequest, NextResponse } from "next/server";
import { orchestrate, type OrchestrationRequest } from "@/lib/ai/orchestration";
import { LANGUAGE_COOKIE, LEGACY_LANGUAGE_COOKIE, normalizeLocale } from "@/lib/i18n/language";

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
  const lang = typeof body.lang === "string"
    ? normalizeLocale(body.lang)
    : normalizeLocale(req.cookies.get(LANGUAGE_COOKIE)?.value || req.cookies.get(LEGACY_LANGUAGE_COOKIE)?.value);
  const history = Array.isArray(body.history) ? body.history : [];

  const result = await orchestrate({ message, module, lang, history });
  return NextResponse.json(result);
}
