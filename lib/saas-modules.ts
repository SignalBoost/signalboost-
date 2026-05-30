export type SaasModule = {
  slug: string;
  title: string;
  eyebrow: string;
  summary: string;
  signal: string;
  status: string;
  telemetry: string;
  href: string;
  accent: string;
  features: string[];
  automations: string[];
};

export const saasModules: SaasModule[] = [
  {
    slug: "promote",
    title: "Promote Business",
    eyebrow: "Acquisition bay",
    summary:
      "Launch geo-aware campaigns, offer cards, and affiliate placements from one guided control surface.",
    signal: "+24% intent lift",
    status: "Active",
    telemetry: "Campaign sync every 15 min",
    href: "/promote",
    accent: "#f5c542",
    features: ["Offer builder", "Regional landing paths", "Partner conversion routing"],
    automations: ["Concierge campaign prompts", "Audience clustering", "UTM quality checks"],
  },
  {
    slug: "reviews",
    title: "Reviews",
    eyebrow: "Trust telemetry",
    summary:
      "Collect, triage, and respond to customer feedback before reputation drift becomes revenue loss.",
    signal: "4.8 avg pulse",
    status: "Monitoring",
    telemetry: "Sentiment scan online",
    href: "/reviews",
    accent: "#7dd3fc",
    features: ["Review inbox", "Response drafts", "Escalation lanes"],
    automations: ["AI tone matching", "Fallback response drafts", "Weekly trust digest"],
  },
  {
    slug: "calendar",
    title: "Calendar",
    eyebrow: "Mission scheduling",
    summary:
      "Coordinate bookings, launches, follow-ups, and executive check-ins with cockpit-grade visibility.",
    signal: "92% slot health",
    status: "Synced",
    telemetry: "Availability mesh stable",
    href: "/calendar",
    accent: "#a78bfa",
    features: ["Booking board", "Launch windows", "Team handoffs"],
    automations: ["Persistent conflict detection", "Fallback demo slots", "Concierge rescheduling"],
  },
  {
    slug: "spreadsheets",
    title: "Spreadsheets",
    eyebrow: "Data operations",
    summary:
      "Turn rows into decisions with structured sheets for partner data, budgets, inventory, and forecasts.",
    signal: "18 live sheets",
    status: "Validated",
    telemetry: "Schema guard enabled",
    href: "/spreadsheets",
    accent: "#34d399",
    features: ["Smart tables", "Import lanes", "Formula guardrails"],
    automations: ["Anomaly detection", "CSV cleanup", "Demo-data forecast snapshots"],
  },
  {
    slug: "outreach",
    title: "Outreach",
    eyebrow: "Signal transmission",
    summary:
      "Plan email, partner, and customer sequences with measurable follow-through across every channel.",
    signal: "31% reply rate",
    status: "Broadcasting",
    telemetry: "Deliverability nominal",
    href: "/outreach",
    accent: "#fb7185",
    features: ["Sequence cockpit", "Lead queues", "Partner scripts"],
    automations: ["Follow-up timing", "CRM enrichment", "Persistent conversation summaries"],
  },
  {
    slug: "assistant",
    title: "Personal Assistant",
    eyebrow: "Concierge AI core",
    summary:
      "A unified assistant for marketplace discovery, SaaS operations, executive summaries, and next actions.",
    signal: "24/7 AI copilot",
    status: "Online",
    telemetry: "Context bridge ready",
    href: "/assistant",
    accent: "#22d3ee",
    features: ["Marketplace matching", "Task drafting", "Executive briefings"],
    automations: ["Next-best action", "Clarify-or-default prompts", "Cross-module memory"],
  },
];

export const executivePanels = [
  {
    title: "Financials",
    metric: "$128K",
    detail: "Tracked monthly opportunity across marketplace and SaaS modules.",
  },
  {
    title: "KPIs",
    metric: "98.2%",
    detail: "Cockpit health across activation, retention, and response SLAs.",
  },
  {
    title: "CRM",
    metric: "742",
    detail: "Qualified partner and customer records ready for outreach.",
  },
  {
    title: "Forecasting",
    metric: "+17%",
    detail: "Projected growth based on campaign, review, and calendar signals.",
  },
  {
    title: "Outreach",
    metric: "1.9K",
    detail: "Messages sequenced with monitored deliverability and replies.",
  },
];
