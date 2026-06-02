import { NextRequest, NextResponse } from "next/server";
import { orchestrate } from "@/lib/ai/orchestration";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const cookieStore = await cookies();
    const langCookie =
      cookieStore.get("signalboost_language")?.value ||
      cookieStore.get("site-language")?.value;
    const lang = body.lang || langCookie || "en";
    const result = await orchestrate({ ...body, lang });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Orchestration failed" }, { status: 500 });
  }
}
