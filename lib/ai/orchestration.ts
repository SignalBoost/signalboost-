import { saasModules } from "@/lib/saas-modules";

export type OrchestrationModule =
  | "concierge"
  | "calendar"
  | "reviews"
  | "spreadsheets"
  | "outreach";

export type OrchestrationStatus = "completed" | "needs_clarification" | "demo_fallback";

export interface OrchestrationRequest {
  message: string;
  history?: { role: "user" | "assistant"; content: string }[];
  module?: OrchestrationModule | "auto";
  lang?: string;
}

export interface ModuleResult {
  module: OrchestrationModule;
  label: string;
  status: "ok" | "fallback";
  summary: string;
  actions: string[];
  data: Record<string, string | number | boolean | string[]>;
}

export interface OrchestrationResponse {
  understood: string;
  status: OrchestrationStatus;
  answer: string;
  activeModules: OrchestrationModule[];
  modules: ModuleResult[];
  options: string[];
  nextSteps: string[];
  persistence: {
    shouldContinue: boolean;
    fallbackApplied: boolean;
    clarificationQuestion?: string;
  };
}

type ModuleHandler = (message: string) => ModuleResult;

const MODULE_LABELS: Record<OrchestrationModule, string> = {
  concierge: "Concierge",
  calendar: "Calendar",
  reviews: "Reviews",
  spreadsheets: "Spreadsheets",
  outreach: "Outreach",
};

const MODULE_TERMS: Record<OrchestrationModule, string[]> = {
  concierge: ["help", "assistant", "concierge", "what", "how", "explain", "answer", "recommend", "find"],
  calendar: ["calendar", "schedule", "booking", "book", "meeting", "appointment", "reminder", "reschedule", "availability"],
  reviews: ["review", "reviews", "rating", "reputation", "feedback", "testimonial", "sentiment", "google"],
  spreadsheets: ["spreadsheet", "sheet", "csv", "rows", "table", "forecast", "budget", "data", "formula"],
  outreach: ["outreach", "email", "lead", "crm", "sequence", "follow up", "campaign", "message", "prospect"],
};

const DEFAULT_OPTIONS = [
  "Confirm this plan and run the next action.",
  "Refine with more context, audience, dates, or goals.",
  "Switch modules if another workflow should own it.",
];

function normalize(message: string) {
  return message.toLowerCase().replace(/[^\p{L}\p{N}\s-]+/gu, " ").replace(/\s+/g, " ").trim();
}

function includesTerm(text: string, term: string) {
  return new RegExp(`(^|\\s)${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}($|\\s)`, "i").test(text);
}

export function detectModules(message: string, requested: OrchestrationRequest["module"] = "auto"): OrchestrationModule[] {
  if (requested && requested !== "auto") return [requested];
  const text = normalize(message);
  const detected = (Object.keys(MODULE_TERMS) as OrchestrationModule[]).filter((module) =>
    MODULE_TERMS[module].some((term) => includesTerm(text, term))
  );

  if (detected.length === 0) return ["concierge"];
  if (!detected.includes("concierge")) detected.unshift("concierge");
  return Array.from(new Set(detected)).slice(0, 4);
}

function extractDateHint(message: string) {
  const text = normalize(message);
  if (includesTerm(text, "tomorrow")) return "tomorrow";
  if (includesTerm(text, "today")) return "today";
  if (includesTerm(text, "next week")) return "next week";
  const iso = message.match(/\b\d{4}-\d{2}-\d{2}\b/);
  return iso?.[0] || "next available slot";
}

function success(module: OrchestrationModule, summary: string, actions: string[], data: ModuleResult["data"]): ModuleResult {
  return { module, label: MODULE_LABELS[module], status: "ok", summary, actions, data };
}

function fallback(module: OrchestrationModule, summary: string, actions: string[], data: ModuleResult["data"]): ModuleResult {
  return { module, label: MODULE_LABELS[module], status: "fallback", summary, actions, data };
}

const handlers: Record<OrchestrationModule, ModuleHandler> = {
  concierge(message) {
    const text = normalize(message);
    const known = saasModules.map((item) => item.slug).filter((slug) => includesTerm(text, slug));
    return success(
      "concierge",
      known.length
        ? `I matched your request to ${known.join(", ")} and prepared cross-module routing.`
        : "I can answer general questions, clarify ambiguous requests, and route work to SignalBoost modules.",
      ["Summarize what was understood", "Offer choices before taking action", "Continue with safe fallback defaults when details are missing"],
      { mode: "persistent", matchedSaasModules: known }
    );
  },
  calendar(message) {
    const dateHint = extractDateHint(message);
    return success(
      "calendar",
      `Calendar can stage availability, reminders, and handoffs for ${dateHint} while waiting for final confirmation.`,
      ["Draft booking window", "Check conflicts", "Prepare reminder sequence"],
      { dateHint, demoSlots: ["09:30", "13:00", "16:30"] }
    );
  },
  reviews(message) {
    return success(
      "reviews",
      "Reviews can collect feedback, classify sentiment, and draft brand-safe responses.",
      ["Open review inbox", "Flag negative sentiment", "Draft response options"],
      { averageRating: 4.8, pendingResponses: 6, sentiment: "positive with two watch items" }
    );
  },
  spreadsheets(message) {
    const text = normalize(message);
    const needsImport = ["csv", "import", "upload", "rows"].some((term) => includesTerm(text, term));
    return success(
      "spreadsheets",
      needsImport
        ? "Spreadsheets can validate imported rows, normalize columns, and create a guarded working table."
        : "Spreadsheets can turn operational data into forecasts, anomaly checks, and executive summaries.",
      ["Create smart table", "Validate schema", "Generate forecast snapshot"],
      { rowsReady: needsImport ? 250 : 18, schemaGuard: true, forecastDelta: "+17%" }
    );
  },
  outreach(message) {
    return success(
      "outreach",
      "Outreach can assemble leads, personalize the first message, and schedule follow-ups without dropping the task.",
      ["Segment lead queue", "Draft email sequence", "Schedule follow-up timing"],
      { replyRate: "31%", queuedLeads: 42, followUps: 3 }
    );
  },
};

const DEMO_FALLBACKS: Record<OrchestrationModule, Omit<ModuleResult, "module" | "label" | "status">> = {
  concierge: {
    summary: "Concierge fallback is active with clarification prompts, safe defaults, and general smart answers.",
    actions: ["Restate the goal", "Offer confirmation options", "Continue with a safe default"],
    data: { source: "demo", mode: "persistent" },
  },
  calendar: {
    summary: "Calendar fallback is active with demo availability and reminder sequencing.",
    actions: ["Use demo availability", "Prepare a conflict check", "Draft reminders"],
    data: { source: "demo", demoSlots: ["09:30", "13:00", "16:30"] },
  },
  reviews: {
    summary: "Reviews fallback is active with sample sentiment, pending responses, and response drafting.",
    actions: ["Review sample sentiment", "Draft response options", "Escalate watch items"],
    data: { source: "demo", averageRating: 4.8, pendingResponses: 6 },
  },
  spreadsheets: {
    summary: "Spreadsheets fallback is active with demo rows, schema guardrails, and forecast snapshots.",
    actions: ["Create demo table", "Validate columns", "Generate forecast snapshot"],
    data: { source: "demo", rowsReady: 18, schemaGuard: true },
  },
  outreach: {
    summary: "Outreach fallback is active with sample lead queues and follow-up sequences.",
    actions: ["Segment demo leads", "Draft first email", "Schedule follow-ups"],
    data: { source: "demo", queuedLeads: 42, followUps: 3 },
  },
};

function demoFallback(module: OrchestrationModule): ModuleResult {
  const base = DEMO_FALLBACKS[module];
  return fallback(module, base.summary, base.actions, base.data);
}

function isVague(message: string) {
  const words = normalize(message).split(" ").filter(Boolean);
  return words.length > 0 && words.length < 4;
}

function smartGeneralAnswer(message: string, modules: ModuleResult[]) {
  const text = normalize(message);
  if (text.includes("price") || text.includes("pricing")) {
    return "SignalBoost can frame pricing by module access, automation depth, and Concierge coverage. If you want, I can compare the best package for marketplace growth versus internal operations.";
  }
  if (text.startsWith("how") || text.startsWith("what") || text.startsWith("why")) {
    return "Here is the practical answer: SignalBoost works best when Concierge first clarifies the goal, then routes each next action to the SaaS module that can complete it. That keeps the conversation useful even when one integration is missing.";
  }
  const moduleSummary = modules.map((item) => `${item.label}: ${item.summary}`).join(" ");
  return moduleSummary || "I can help with general questions and SignalBoost workflows. Share the goal, and I will keep refining until there is an actionable next step.";
}

export async function orchestrate(request: OrchestrationRequest): Promise<OrchestrationResponse> {
  const message = request.message.trim();
  const fallbackMessage = message || "Help me choose the next SignalBoost action.";
  const activeModules = detectModules(fallbackMessage, request.module);

  const moduleResults = activeModules.map((module) => {
    try {
      return handlers[module](fallbackMessage);
    } catch {
      return demoFallback(module);
    }
  });

  const vague = !message || isVague(message);
  const fallbackApplied = moduleResults.some((module) => module.status === "fallback") || !message;
  const status: OrchestrationStatus = vague ? "needs_clarification" : fallbackApplied ? "demo_fallback" : "completed";
  const understood = vague
    ? `I understood that you want SignalBoost help, but the request needs one more detail. I will use a safe default and keep going.`
    : `I understood this as: “${message}”. I routed it through ${activeModules.map((module) => MODULE_LABELS[module]).join(", ")}.`;

  return {
    understood,
    status,
    answer: smartGeneralAnswer(fallbackMessage, moduleResults),
    activeModules,
    modules: moduleResults,
    options: DEFAULT_OPTIONS,
    nextSteps: [
      "Confirm or edit the understood goal.",
      moduleResults[0]?.actions[0] || "Choose a module action.",
      "Continue refining until the task is complete.",
    ],
    persistence: {
      shouldContinue: true,
      fallbackApplied,
      clarificationQuestion: vague ? "What outcome, audience, or deadline should I optimize for?" : undefined,
    },
  };
}

export function getModuleSnapshot(module: OrchestrationModule): ModuleResult {
  if (!handlers[module]) return demoFallback("concierge");
  return handlers[module](`Open ${MODULE_LABELS[module]}`);
}

export function isOrchestrationModule(value: string): value is OrchestrationModule {
  return Object.prototype.hasOwnProperty.call(MODULE_LABELS, value);
}
