// → app/auth/callback/route.ts
//
// Server-side OAuth callback. Exchanges the ?code= for a session using the
// @supabase/ssr cookie store. This version surfaces the REAL error message in
// the redirect URL so we can diagnose why the exchange fails.
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthFlow, normalizePostAuthDestination } from "@/lib/supabase/auth-flows";

export async function GET(request: Request) {
  const { searchParams, origin, hostname } = new URL(request.url);
  const code = searchParams.get("code");

  const flow = getAuthFlow(hostname, searchParams.get("flow"));
  const destination = normalizePostAuthDestination(searchParams.get("next"), flow);
  const safeNext = destination.startsWith("/") ? destination : "/";

  // If the provider returned an error directly (e.g. user denied, config issue),
  // surface it.
  const providerError = searchParams.get("error_description") || searchParams.get("error");
  if (providerError) {
    const u = new URL("/auth/login", origin);
    u.searchParams.set("error", "provider");
    u.searchParams.set("detail", providerError.slice(0, 200));
    return NextResponse.redirect(u);
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${safeNext}`);
    }
    // Surface the actual exchange error so we can see WHY it failed.
    const u = new URL("/auth/login", origin);
    u.searchParams.set("error", "exchange");
    u.searchParams.set("detail", (error.message || "unknown").slice(0, 200));
    return NextResponse.redirect(u);
  }

  // No code at all.
  const u = new URL("/auth/login", origin);
  u.searchParams.set("error", "no_code");
  return NextResponse.redirect(u);
}
