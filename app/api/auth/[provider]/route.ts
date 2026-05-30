import { NextResponse } from "next/server";
import type { Provider } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getAuthFlow, getProductionCallbackUrl, isLocalHost, normalizePostAuthDestination } from "@/lib/supabase/auth-flows";

const OAUTH_PROVIDERS = ["google", "facebook", "github"] as const;

type OAuthProvider = (typeof OAUTH_PROVIDERS)[number];
type RouteContext = {
  params: Promise<{ provider: string }>;
};

function isOAuthProvider(provider: string): provider is OAuthProvider {
  return OAUTH_PROVIDERS.includes(provider as OAuthProvider);
}

function getCallbackUrl(request: Request) {
  const requestUrl = new URL(request.url);
  const flow = getAuthFlow(requestUrl.hostname, requestUrl.searchParams.get("flow"));
  const callbackUrl = new URL(
    isLocalHost(requestUrl.hostname) ? `${requestUrl.origin}/auth/callback` : getProductionCallbackUrl(flow)
  );

  callbackUrl.searchParams.set("flow", flow);
  callbackUrl.searchParams.set(
    "next",
    normalizePostAuthDestination(requestUrl.searchParams.get("next"), flow)
  );

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
