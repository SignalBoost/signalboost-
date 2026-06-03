import { NextRequest, NextResponse } from "next/server";
import { orchestrate } from "@/lib/ai/orchestration";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const cookieStore = await cookies();
    const langCookie =
      cookieStore.get("signalboost_language")?.value ||
      cookieStore.get("site-language")?.value;
    const lang = body.lang || langCookie || "en";

    // Determine if the caller is an admin (the SignalBoost owner/operators).
    // This decides whether orchestrate() runs in candid chief-of-staff mode
    // or the public SignalBoost-loyal Concierge mode. Checked server-side via
    // the same is_admin() RPC the rest of the app uses, so it can't be faked
    // from the browser.
    let isAdmin = false;
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase.rpc("is_admin");
        if (!error && data === true) isAdmin = true;
      }
    } catch {
      isAdmin = false; // any failure → treat as public, never escalate
    }

    const result = await orchestrate({ ...body, lang, isAdmin });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Orchestration failed" }, { status: 500 });
  }
}
