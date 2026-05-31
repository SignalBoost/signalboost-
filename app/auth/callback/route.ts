// → app/auth/callback/route.ts
//
// Server-side OAuth callback. Exchanges the ?code= for a session using the
// @supabase/ssr cookie store, then redirects to the post-auth destination.
// On failure it returns to the login page with a generic flag (no internal
// error details leaked into the URL).
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthFlow, normalizePostAuthDestination } from "@/lib/supabase/auth-flows";

export async function GET(request: Request) {
  const { searchParams, origin, hostname } = new URL(request.url);
  const code = searchParams.get("code");

  const flow = getAuthFlow(hostname, searchParams.get("flow"));
  const destination = normalizePostAuthDestination(searchParams.get("next"), flow);
  const safeNext = destination.startsWith("/") ? destination : "/";

  // Provider returned an error directly (e.g. user cancelled).
  if (searchParams.get("error") || searchParams.get("error_description")) {
    return NextResponse.redirect(`${origin}/auth/login?error=provider`);
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${safeNext}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth_callback`);
}
