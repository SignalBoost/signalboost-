import type { ModuleResult, OrchestrationModule } from "@/lib/ai/orchestration";

const DEFAULT_LIVE_ORIGIN = "https://signalboost-live.vercel.app";

function liveOrigin() {
  return (process.env.SIGNALBOOST_LIVE_URL || process.env.NEXT_PUBLIC_SIGNALBOOST_LIVE_URL || DEFAULT_LIVE_ORIGIN).replace(/\/$/, "");
}

const LIVE_PATHS: Record<OrchestrationModule, string[]> = {
  concierge: ["/api/orchestrate", "/api/concierge"],
  promote: ["/api/saas/promote", "/api/promote"],
  calendar: ["/api/saas/calendar", "/api/calendar"],
  reviews: ["/api/saas/reviews", "/api/reviews"],
  spreadsheets: ["/api/saas/spreadsheets", "/api/spreadsheets"],
  outreach: ["/api/saas/outreach", "/api/outreach"],
};

export function getLiveBackendUrl(module: OrchestrationModule, path = LIVE_PATHS[module][0]) {
  return `${liveOrigin()}${path}`;
}

function normalizeLiveResult(module: OrchestrationModule, payload: unknown): Partial<ModuleResult> | null {
  if (!payload || typeof payload !== "object") return null;
  const data = payload as Record<string, unknown>;
  const nested = (data.moduleData || data.snapshot || data.result || data.data) as Record<string, unknown> | undefined;
  const source = nested && typeof nested === "object" ? { ...data, ...nested } : data;

  return {
    module,
    label: typeof source.label === "string" ? source.label : undefined,
    status: "ok",
    summary: typeof source.summary === "string" ? source.summary : typeof source.message === "string" ? source.message : undefined,
    actions: Array.isArray(source.actions) ? source.actions.filter((item): item is string => typeof item === "string") : undefined,
    data: Object.fromEntries(
      Object.entries(source).filter(([, value]) =>
        ["string", "number", "boolean"].includes(typeof value) || (Array.isArray(value) && value.every((item) => typeof item === "string"))
      )
    ) as ModuleResult["data"],
  };
}

export async function fetchLiveModuleSnapshot(module: OrchestrationModule): Promise<Partial<ModuleResult> | null> {
  for (const path of LIVE_PATHS[module]) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2500);
      const response = await fetch(getLiveBackendUrl(module, path), {
        headers: { Accept: "application/json", "x-signalboost-client": "dashboard" },
        cache: "no-store",
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!response.ok) continue;
      const payload = await response.json();
      const normalized = normalizeLiveResult(module, payload);
      if (normalized) return normalized;
    } catch {
      continue;
    }
  }
  return null;
}
