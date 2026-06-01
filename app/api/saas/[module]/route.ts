import { NextRequest, NextResponse } from "next/server";
import { getModuleSnapshot, isOrchestrationModule } from "@/lib/ai/orchestration";
import { fetchLiveModuleSnapshot, getLiveBackendUrl } from "@/lib/signalboost-live";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ module: string }>;
};

export async function GET(req: NextRequest, context: RouteContext) {
  const { module } = await context.params;
  if (!isOrchestrationModule(module)) {
    return NextResponse.json({ error: "Unknown SignalBoost module." }, { status: 404 });
  }

  const lang = req.nextUrl.searchParams.get("lang") || undefined;
  const fallback = getModuleSnapshot(module, lang);
  const live = await fetchLiveModuleSnapshot(module);

  return NextResponse.json({
    ...fallback,
    ...(live || {}),
    label: live?.label || fallback.label,
    summary: live?.summary || fallback.summary,
    actions: live?.actions?.length ? live.actions : fallback.actions,
    data: {
      ...fallback.data,
      ...(live?.data || {}),
      backend: "signalboost-live",
      endpoint: getLiveBackendUrl(module),
      liveConnected: Boolean(live),
    },
    status: live ? "ok" : "fallback",
  });
}
