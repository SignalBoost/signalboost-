// → lib/supabase/server.ts
//
// Server-side Supabase client for Server Components, Route Handlers, and
// Server Actions. cookies() is async in Next 15, so this factory is async.
// The same cross-subdomain cookie options are applied on write.

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const COOKIE_DOMAIN = process.env.NEXT_PUBLIC_COOKIE_DOMAIN; // ".signalboostapp.com"

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, {
                ...options,
                ...(COOKIE_DOMAIN ? { domain: COOKIE_DOMAIN } : {}),
                path: "/",
                sameSite: "lax",
                secure: process.env.NODE_ENV === "production",
              });
            });
          } catch {
            // setAll was called from a Server Component. Safe to ignore here —
            // middleware (lib/supabase/middleware.ts) refreshes the session.
          }
        },
      },
    }
  );
}
