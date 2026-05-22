// → lib/supabase/client.ts
//
// Browser-side Supabase client. The cookieOptions domain is what makes the
// session shareable across signalboostapp.com and saas.signalboostapp.com.
// Leave NEXT_PUBLIC_COOKIE_DOMAIN unset in local dev so localhost still works.

import { createBrowserClient } from "@supabase/ssr";

const COOKIE_DOMAIN = process.env.NEXT_PUBLIC_COOKIE_DOMAIN; // ".signalboostapp.com"

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        ...(COOKIE_DOMAIN ? { domain: COOKIE_DOMAIN } : {}),
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      },
    }
  );
}
