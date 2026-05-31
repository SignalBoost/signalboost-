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
  titleKey: string;
  summaryKey: string;
  eyebrowKey: string;
  // Keys for the rest of the content (fall back to the English strings above).
  signalKey: string;
  telemetryKey: string;
  featureKeys: string[];
  automationKeys: string[];
};

export const saasModules: SaasModule[] = [
  {
    slug: "promote",
    titleKey: "modules.promote.title",
    summaryKey: "modules.promote.summary",
    eyebrowKey: "modules.promote.eyebrow",
    signalKey: "modules.promote.signal",
    telemetryKey: "modules.promote.telemetry",
    featureKeys: ["modules.promote.features.0", "modules.promote.features.1", "modules.promote.features.2"],
    automationKeys: ["modules.promote.automations.0", "modules.promote.automations.1", "modules.promote.automations.2"],
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
    titleKey: "modules.reviews.title",
    summaryKey: "modules.reviews.summary",
    eyebrowKey: "modules.reviews.eyebrow",
    signalKey: "modules.reviews.signal",
    telemetryKey: "modules.reviews.telemetry",
    featureKeys: ["modules.reviews.features.0", "modules.reviews.features.1", "modules.reviews.features.2"],
    automationKeys: ["modules.reviews.automations.0", "modules.reviews.automations.1", "modules.reviews.automations.2"],
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
    titleKey: "modules.calendar.title",
    summaryKey: "modules.calendar.summary",
    eyebrowKey: "modules.calendar.eyebrow",
    signalKey: "modules.calendar.signal",
    telemetryKey: "modules.calendar.telemetry",
    featureKeys: ["modules.calendar.features.0", "modules.calendar.features.1", "modules.calendar.features.2"],
    automationKeys: ["modules.calendar.automations.0", "modules.calendar.automations.1", "modules.calendar.automations.2"],
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
    titleKey: "modules.spreadsheets.title",
    summaryKey: "modules.spreadsheets.summary",
    eyebrowKey: "modules.spreadsheets.eyebrow",
    signalKey: "modules.spreadsheets.signal",
    telemetryKey: "modules.spreadsheets.telemetry",
    featureKeys: ["modules.spreadsheets.features.0", "modules.spreadsheets.features.1", "modules.spreadsheets.features.2"],
    automationKeys: ["modules.spreadsheets.automations.0", "modules.spreadsheets.automations.1", "modules.spreadsheets.automations.2"],
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
    titleKey: "modules.outreach.title",
    summaryKey: "modules.outreach.summary",
    eyebrowKey: "modules.outreach.eyebrow",
    signalKey: "modules.outreach.signal",
    telemetryKey: "modules.outreach.telemetry",
    featureKeys: ["modules.outreach.features.0", "modules.outreach.features.1", "modules.outreach.features.2"],
    automationKeys: ["modules.outreach.automations.0", "modules.outreach.automations.1", "modules.outreach.automations.2"],
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
    titleKey: "modules.assistant.title",
    summaryKey: "modules.assistant.summary",
    eyebrowKey: "modules.assistant.eyebrow",
    signalKey: "modules.assistant.signal",
    telemetryKey: "modules.assistant.telemetry",
    featureKeys: ["modules.assistant.features.0", "modules.assistant.features.1", "modules.assistant.features.2"],
    automationKeys: ["modules.assistant.automations.0", "modules.assistant.automations.1", "modules.assistant.automations.2"],
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
