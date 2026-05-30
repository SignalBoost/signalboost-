export const MAIN_AUTH_CALLBACK = "https://signalboostapp.com/auth/callback";
export const SAAS_AUTH_CALLBACK = "https://saas.signalboostapp.com/auth/callback";

export const MAIN_POST_AUTH_DESTINATION = "/promote";
export const SAAS_POST_AUTH_DESTINATION = "/dashboard";

const SAAS_ONLY_PATH_PREFIXES = [
  "/calendar",
  "/spreadsheets",
  "/reviews",
  "/outreach",
  "/office",
] as const;

export type AuthFlow = "main" | "saas";

export function isLocalHost(hostname: string) {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname.endsWith(".local");
}

export function isSafeRelativePath(value: string | null) {
  return Boolean(value?.startsWith("/") && !value.startsWith("//"));
}

export function getAuthFlow(hostname: string, explicitFlow?: string | null): AuthFlow {
  if (explicitFlow === "saas" || hostname === "saas.signalboostapp.com") {
    return "saas";
  }

  return "main";
}

export function getDefaultPostAuthDestination(flow: AuthFlow) {
  return flow === "saas" ? SAAS_POST_AUTH_DESTINATION : MAIN_POST_AUTH_DESTINATION;
}

export function normalizePostAuthDestination(value: string | null, flow: AuthFlow) {
  if (!isSafeRelativePath(value)) {
    return getDefaultPostAuthDestination(flow);
  }

  const next = value as string;

  if (flow === "main" && SAAS_ONLY_PATH_PREFIXES.some((prefix) => next === prefix || next.startsWith(`${prefix}/`))) {
    return MAIN_POST_AUTH_DESTINATION;
  }

  return next;
}

export function getProductionCallbackUrl(flow: AuthFlow) {
  return flow === "saas" ? SAAS_AUTH_CALLBACK : MAIN_AUTH_CALLBACK;
}
