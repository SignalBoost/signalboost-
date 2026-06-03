import { getLeads } from "@/lib/outreach";
import type { OutreachLead } from "@/lib/outreach";

// Minimum closed deals before we'll project revenue. Below this, a forecast
// would be noise dressed as insight — so we honestly report "not enough data".
const MIN_CLOSED_FOR_FORECAST = 3;

export type StageCounts = {
  queued: number;
  drafted: number;
  approved: number;
  sent: number;
  replied: number;
  demo: number;
  closed: number;
  lost: number;
  skipped: number;
};

export type ConversionRates = {
  sentToReplied: number | null;   // of sent, how many replied
  repliedToDemo: number | null;   // of replied, how many booked a demo
  demoToClosed: number | null;    // of demos, how many closed
  overallClose: number | null;    // of sent, how many closed
};

export type Forecast =
  | {
      ready: true;
      avgDealValue: number;
      closedRevenue: number;
      openPipeline: number;          // count of live leads (sent..demo)
      projectedRevenue: number;      // expected revenue from open pipeline
      basis: string;                 // human-readable explanation of the math
      sample: { sent: number; replied: number; demo: number; closed: number };
    }
  | {
      ready: false;
      reason: string;
      closedSoFar: number;
      needed: number;
    };

export type ExecutiveTelemetry = {
  totalLeads: number;
  stages: StageCounts;
  conversions: ConversionRates;
  closedRevenue: number;
  avgDealValue: number | null;
  sendVelocity: { last7: number; last30: number };
  forecast: Forecast;
  generatedAt: string;
};

function emptyStages(): StageCounts {
  return { queued: 0, drafted: 0, approved: 0, sent: 0, replied: 0, demo: 0, closed: 0, lost: 0, skipped: 0 };
}

// A lead that reached "sent" has, at some point, been sent — regardless of where
// it is now. So funnel counts are cumulative: a closed lead also counts as sent,
// replied, etc. We derive cumulative reach from the current status ordering.
const REACH_ORDER = ["sent", "replied", "demo", "closed"];

function reachedStage(status: string, stage: string): boolean {
  // "lost" can happen from any stage; it doesn't tell us how far it got beyond
  // what its own history would show. We conservatively count a lost lead as
  // having reached "sent" only, since we don't store the pre-loss peak stage.
  if (status === "lost") return stage === "sent";
  const statusIdx = REACH_ORDER.indexOf(status);
  const stageIdx = REACH_ORDER.indexOf(stage);
  if (statusIdx === -1 || stageIdx === -1) return false;
  return statusIdx >= stageIdx;
}

function safeRate(numerator: number, denominator: number): number | null {
  if (denominator <= 0) return null;
  return numerator / denominator;
}

function withinDays(iso: string | undefined, days: number): boolean {
  if (!iso) return false;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return false;
  return Date.now() - then <= days * 24 * 60 * 60 * 1000;
}

export async function getExecutiveTelemetry(userId: string): Promise<ExecutiveTelemetry> {
  const leads: OutreachLead[] = await getLeads(userId);

  const stages = emptyStages();
  for (const l of leads) {
    if (l.status in stages) stages[l.status as keyof StageCounts]++;
  }

  // Cumulative funnel reach (how many leads ever reached each stage)
  const reachedSent = leads.filter((l) => reachedStage(l.status, "sent")).length;
  const reachedReplied = leads.filter((l) => reachedStage(l.status, "replied")).length;
  const reachedDemo = leads.filter((l) => reachedStage(l.status, "demo")).length;
  const reachedClosed = leads.filter((l) => reachedStage(l.status, "closed")).length;

  const conversions: ConversionRates = {
    sentToReplied: safeRate(reachedReplied, reachedSent),
    repliedToDemo: safeRate(reachedDemo, reachedReplied),
    demoToClosed: safeRate(reachedClosed, reachedDemo),
    overallClose: safeRate(reachedClosed, reachedSent),
  };

  // Revenue from real closed-won deals
  const closedLeads = leads.filter((l) => l.status === "closed" && l.deal_value != null);
  const closedRevenue = closedLeads.reduce((sum, l) => sum + (l.deal_value || 0), 0);
  const avgDealValue = closedLeads.length > 0 ? closedRevenue / closedLeads.length : null;

  // Send velocity from real sent timestamps on messages would be ideal, but
  // we approximate from leads that reached sent using replied_at/created_at is
  // unreliable; instead we report counts of leads currently in/after "sent"
  // that were created recently. Honest and simple.
  const sendVelocity = {
    last7: leads.filter((l) => reachedStage(l.status, "sent") && withinDays(l.created_at, 7)).length,
    last30: leads.filter((l) => reachedStage(l.status, "sent") && withinDays(l.created_at, 30)).length,
  };

  // ── Forecast ──────────────────────────────────────────────
  let forecast: Forecast;
  if (closedLeads.length < MIN_CLOSED_FOR_FORECAST || avgDealValue == null) {
    forecast = {
      ready: false,
      reason:
        `Forecasting activates after ${MIN_CLOSED_FOR_FORECAST} closed-won deals are recorded. ` +
        `Until then there isn't enough real outcome data to project reliably.`,
      closedSoFar: closedLeads.length,
      needed: MIN_CLOSED_FOR_FORECAST,
    };
  } else {
    // Open pipeline = leads currently live but not yet closed/lost
    const openLeads = leads.filter((l) => ["sent", "replied", "demo"].includes(l.status));
    const overall = conversions.overallClose ?? 0;
    // Expected revenue = (open leads × overall close rate × avg deal value)
    const projectedRevenue = openLeads.length * overall * avgDealValue;
    forecast = {
      ready: true,
      avgDealValue,
      closedRevenue,
      openPipeline: openLeads.length,
      projectedRevenue,
      basis:
        `Projection = ${openLeads.length} open leads × ` +
        `${(overall * 100).toFixed(1)}% historical close rate × ` +
        `$${Math.round(avgDealValue).toLocaleString()} average deal value.`,
      sample: { sent: reachedSent, replied: reachedReplied, demo: reachedDemo, closed: reachedClosed },
    };
  }

  return {
    totalLeads: leads.length,
    stages,
    conversions,
    closedRevenue,
    avgDealValue,
    sendVelocity,
    forecast,
    generatedAt: new Date().toISOString(),
  };
}
