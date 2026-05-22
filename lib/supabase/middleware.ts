// → lib/supabase/middleware.ts
//
// Refreshes the Supabase session on each request and rewrites the auth cookies
// with the .signalboostapp.com domain so the SaaS subdomain can read them.
// Do NOT add logic between createServerClient() and getUser() — it must run
// back-to-back or session refresh becomes unreliable.

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const COOKIE_DOMAIN = process.env.NEXT_PUBLIC_COOKIE_DOMAIN; // ".signalboostapp.com"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, {
              ...options,
              ...(COOKIE_DOMAIN ? { domain: COOKIE_DOMAIN } : {}),
              path: "/",
              sameSite: "lax",
              secure: process.env.NODE_ENV === "production",
            })
          );
        },
      },
    }
  );

  // Touch the session to trigger a refresh when needed.
  await supabase.auth.getUser();

  return supabaseResponse;
}
