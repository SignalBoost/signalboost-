export type StationWorkflow = {
  slug: string;
  title: string;
  conciergePrompt: string;
  connectors: string[];
  telemetry: string;
  metric: string;
  accent: string;
  trialLimit: number;
};

export const stationWorkflows: StationWorkflow[] = [
  {
    slug: "payroll-planning",
    title: "Payroll Planning",
    conciergePrompt: "Concierge checks time, contractor spend, and pay-date readiness before you run payroll.",
    connectors: ["QuickBooks", "PayPal"],
    telemetry: "Next payroll ready in 4 days",
    metric: "96% sync health",
    accent: "#f5c542",
    trialLimit: 3,
  },
  {
    slug: "month-end-close",
    title: "Month-End Close",
    conciergePrompt: "Concierge reconciles invoices, payment deposits, and missing receipts into a close checklist.",
    connectors: ["QuickBooks", "PayPal", "Stripe", "Square"],
    telemetry: "7 overdue invoices flagged",
    metric: "$18.4K AR watch",
    accent: "#34d399",
    trialLimit: 3,
  },
  {
    slug: "growth-campaigns",
    title: "Growth Campaigns",
    conciergePrompt: "Concierge turns CRM segments, assets, and inbox signals into campaign launch steps.",
    connectors: ["HubSpot", "Canva", "Gmail", "Outlook"],
    telemetry: "31% campaign reply rate",
    metric: "+12 warm leads",
    accent: "#fb7185",
    trialLimit: 3,
  },
  {
    slug: "weekly-brief",
    title: "Weekly Brief",
    conciergePrompt: "Concierge summarizes revenue, replies, invoice risk, and next actions every week.",
    connectors: ["QuickBooks", "HubSpot", "Gmail", "Outlook"],
    telemetry: "Brief compiled Friday 8 AM",
    metric: "14 signals merged",
    accent: "#22d3ee",
    trialLimit: 3,
  },
  {
    slug: "tax-prep",
    title: "Tax Prep",
    conciergePrompt: "Concierge organizes revenue, expense categories, and payment records for tax-ready exports.",
    connectors: ["QuickBooks", "PayPal", "Stripe", "Square"],
    telemetry: "84% docs categorized",
    metric: "22 deductions queued",
    accent: "#a78bfa",
    trialLimit: 3,
  },
  {
    slug: "contract-review",
    title: "Contract Review",
    conciergePrompt: "Concierge highlights clauses, approval status, and signature blockers before DocuSign sendoff.",
    connectors: ["DocuSign"],
    telemetry: "3 contracts awaiting review",
    metric: "2 signatures due",
    accent: "#f97316",
    trialLimit: 3,
  },
];

export const workflowConnectorSecurityNotes = [
  "OAuth tokens are posted only to the server-side connector vault route.",
  "Tokens are encrypted with CONNECTOR_TOKEN_KEY before being written to Supabase.",
  "The browser receives connector health and last-four metadata only, never raw tokens.",
];
