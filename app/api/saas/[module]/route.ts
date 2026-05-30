import { NextRequest, NextResponse } from "next/server";
import { getModuleSnapshot, isOrchestrationModule } from "@/lib/ai/orchestration";

type RouteContext = {
  params: Promise<{ module: string }>;
};

export async function GET(_req: NextRequest, context: RouteContext) {
  const { module } = await context.params;
  if (!isOrchestrationModule(module)) {
    return NextResponse.json({ error: "Unknown SignalBoost module." }, { status: 404 });
  }

  return NextResponse.json(getModuleSnapshot(module));
}
