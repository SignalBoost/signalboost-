// → lib/supabase/server.ts
//
// Server-side Supabase client for Server Components, Route Handlers, and
// Server Actions. cookies() is async in Next 15, so this factory is async.
// Auth cookies are intentionally written without a Domain attribute so the
// browser scopes each session to the current host only.

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

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
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, {
                ...options,
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
