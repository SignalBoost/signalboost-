// → lib/supabase/client.ts
//
// Browser-side Supabase client. Auth cookies are intentionally host-only:
// signalboostapp.com sessions stay on the marketing site, while
// saas.signalboostapp.com sessions stay inside the SaaS cockpit. Do not set a
// shared `.signalboostapp.com` cookie domain here.

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      },
    }
  );
}
