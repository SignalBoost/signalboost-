// → app/auth/callback/route.ts
//
// Server-side OAuth callback. Runs on the server so it can read the ?code=
// query param and exchange it for a session using the SAME @supabase/ssr
// cookie store that holds the PKCE verifier. This replaces the old
// client-side page.tsx, which could not see the server-stored verifier.
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthFlow, normalizePostAuthDestination } from "@/lib/supabase/auth-flows";

export async function GET(request: Request) {
  const { searchParams, origin, hostname } = new URL(request.url);
  const code = searchParams.get("code");

  // Resolve where to send the user after auth (same logic as before).
  const flow = getAuthFlow(hostname, searchParams.get("flow"));
  const destination = normalizePostAuthDestination(searchParams.get("next"), flow);
  const safeNext = destination.startsWith("/") ? destination : "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${safeNext}`);
    }
  }

  // No code, or exchange failed → back to login with an error flag.
  return NextResponse.redirect(`${origin}/auth/login?error=auth_callback`);
}
