// → app/auth/signout/route.ts
//
// Server-side sign-out. SiteHeader signs out client-side, but this route is
// handy for forms/links and guarantees the cookie is cleared on the server too.

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}
