import { NextResponse } from "next/server";
import type { Provider } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

const OAUTH_PROVIDERS = ["google", "facebook", "github"] as const;

// signalboost (marketing) is now fully independent from saas: it has its own
// Supabase project and only ever returns to its own callback. saas runs from a
// separate repo + its own Supabase project, so there is NO cross-domain
// branching here anymore.
const MAIN_AUTH_CALLBACK = "https://signalboostapp.com/auth/callback";

type OAuthProvider = (typeof OAUTH_PROVIDERS)[number];
type RouteContext = {
  params: Promise<{ provider: string }>;
};

function isOAuthProvider(provider: string): provider is OAuthProvider {
  return OAUTH_PROVIDERS.includes(provider as OAuthProvider);
}

function isLocalHost(hostname: string) {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname.endsWith(".local");
}

function isSafeRelativePath(value: string | null) {
  return Boolean(value?.startsWith("/") && !value.startsWith("//"));
}

function getCallbackUrl(request: Request) {
  const requestUrl = new URL(request.url);

  // Local dev returns to the running origin; production always returns to the
  // signalboost callback. No saas branching.
  const callbackUrl = new URL(
    isLocalHost(requestUrl.hostname) ? `${requestUrl.origin}/auth/callback` : MAIN_AUTH_CALLBACK
  );

  const next = requestUrl.searchParams.get("next");
  if (isSafeRelativePath(next)) {
    callbackUrl.searchParams.set("next", next as string);
  }

  return callbackUrl.toString();
}

export async function GET(request: Request, context: RouteContext) {
  const { provider } = await context.params;

  if (!isOAuthProvider(provider)) {
    return NextResponse.json({ error: "Unsupported OAuth provider." }, { status: 404 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider as Provider,
    options: {
      redirectTo: getCallbackUrl(request),
    },
  });

  if (error || !data.url) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("error", "oauth");
    return NextResponse.redirect(loginUrl, { status: 303 });
  }

  return NextResponse.redirect(data.url, { status: 303 });
}
