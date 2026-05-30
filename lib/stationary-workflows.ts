export type StationaryWorkflowSlug =
  | "payroll-planning"
  | "month-end-close"
  | "growth-campaigns"
  | "weekly-brief"
  | "tax-prep"
  | "contract-review";

export type StationaryConnector = {
  name: string;
  purpose: string;
  status: "wired" | "vaulted" | "ready";
};

export type StationaryWorkflow = {
  slug: StationaryWorkflowSlug;
  title: string;
  shortTitle: string;
  conciergePrompt: string;
  freeTaskLimit: number;
  telemetry: {
    label: string;
    value: string;
    detail: string;
  }[];
  connectors: StationaryConnector[];
  tasks: string[];
  accent: string;
};

export const STATIONARY_FREE_TASK_LIMIT = 3;

export const stationaryWorkflows: StationaryWorkflow[] = [
  {
    slug: "payroll-planning",
    title: "Payroll Planning",
    shortTitle: "Payroll",
    conciergePrompt:
      "Concierge checks payroll cash timing, contractor handoffs, and tax calendar risk before you run payroll.",
    freeTaskLimit: STATIONARY_FREE_TASK_LIMIT,
    telemetry: [
      { label: "sync health", value: "97%", detail: "QuickBooks + PayPal payroll ledger aligned" },
      { label: "runway", value: "12 days", detail: "cash buffer before next pay run" },
    ],
    connectors: [
      { name: "QuickBooks", purpose: "payroll ledger and account classes", status: "wired" },
      { name: "PayPal", purpose: "contractor payouts and reconciliation", status: "wired" },
      { name: "Supabase Vault", purpose: "server-side OAuth token custody", status: "vaulted" },
    ],
    tasks: ["Forecast pay run", "Flag cash gap", "Draft approval checklist"],
    accent: "#f5c542",
  },
  {
    slug: "month-end-close",
    title: "Month-End Close",
    shortTitle: "Close",
    conciergePrompt:
      "Concierge stages reconciliation, missing receipts, and invoice follow-ups until the close packet is ready.",
    freeTaskLimit: STATIONARY_FREE_TASK_LIMIT,
    telemetry: [
      { label: "sync health", value: "98%", detail: "QuickBooks + PayPal closing feed nominal" },
      { label: "overdue invoices", value: "7", detail: "$18.4K queued for follow-up" },
    ],
    connectors: [
      { name: "QuickBooks", purpose: "GL, invoices, expense categories", status: "wired" },
      { name: "PayPal", purpose: "settlement matching", status: "wired" },
      { name: "Stripe", purpose: "card payments and disputes", status: "wired" },
      { name: "Square", purpose: "POS payments and refunds", status: "wired" },
      { name: "Supabase Vault", purpose: "encrypted connector token records", status: "vaulted" },
    ],
    tasks: ["Reconcile payments", "Chase overdue invoices", "Build close packet"],
    accent: "#34d399",
  },
  {
    slug: "growth-campaigns",
    title: "Growth Campaigns",
    shortTitle: "Campaigns",
    conciergePrompt:
      "Concierge turns CRM context into campaign briefs, creative requests, and reply-aware follow-up sequences.",
    freeTaskLimit: STATIONARY_FREE_TASK_LIMIT,
    telemetry: [
      { label: "reply rate", value: "31%", detail: "HubSpot + Gmail/Outlook campaign replies" },
      { label: "creative ready", value: "86%", detail: "Canva assets synced to campaign stages" },
    ],
    connectors: [
      { name: "HubSpot", purpose: "lists, lifecycle stages, and deal context", status: "wired" },
      { name: "Canva", purpose: "campaign creative and brand templates", status: "wired" },
      { name: "Gmail", purpose: "outbound sequences and reply capture", status: "wired" },
      { name: "Outlook", purpose: "sales mailbox and calendar handoff", status: "wired" },
      { name: "Supabase Vault", purpose: "secure refresh-token storage", status: "vaulted" },
    ],
    tasks: ["Build target list", "Request creative", "Draft follow-ups"],
    accent: "#fb7185",
  },
  {
    slug: "weekly-brief",
    title: "Weekly Brief",
    shortTitle: "Brief",
    conciergePrompt:
      "Concierge summarizes the week across finance, campaigns, payments, and contract blockers for leadership.",
    freeTaskLimit: STATIONARY_FREE_TASK_LIMIT,
    telemetry: [
      { label: "brief freshness", value: "99%", detail: "last sync 4 minutes ago" },
      { label: "open risks", value: "5", detail: "finance, campaign, and legal watch items" },
    ],
    connectors: [
      { name: "QuickBooks", purpose: "cash and invoice highlights", status: "wired" },
      { name: "HubSpot", purpose: "pipeline and campaign movement", status: "wired" },
      { name: "Stripe/Square", purpose: "payment and refund telemetry", status: "wired" },
      { name: "Supabase Vault", purpose: "least-privilege connector cache", status: "vaulted" },
    ],
    tasks: ["Summarize KPIs", "List blockers", "Draft next actions"],
    accent: "#7dd3fc",
  },
  {
    slug: "tax-prep",
    title: "Tax Prep",
    shortTitle: "Tax",
    conciergePrompt:
      "Concierge groups deductible activity, payment evidence, and missing vendor documents before filing season.",
    freeTaskLimit: STATIONARY_FREE_TASK_LIMIT,
    telemetry: [
      { label: "doc coverage", value: "83%", detail: "receipts and 1099/W-9 evidence mapped" },
      { label: "exceptions", value: "14", detail: "needs owner review before export" },
    ],
    connectors: [
      { name: "QuickBooks", purpose: "categories, vendors, and tax-ready exports", status: "wired" },
      { name: "PayPal", purpose: "contractor and marketplace payment evidence", status: "wired" },
      { name: "Stripe/Square", purpose: "gross receipts and fee detail", status: "wired" },
      { name: "Supabase Vault", purpose: "audited token access trail", status: "vaulted" },
    ],
    tasks: ["Collect evidence", "Map deductions", "Export prep packet"],
    accent: "#a78bfa",
  },
  {
    slug: "contract-review",
    title: "Contract Review",
    shortTitle: "Contracts",
    conciergePrompt:
      "Concierge reviews signatures, renewal windows, and risky clauses before sending next-step recommendations.",
    freeTaskLimit: STATIONARY_FREE_TASK_LIMIT,
    telemetry: [
      { label: "signature status", value: "94%", detail: "DocuSign envelopes completed or routed" },
      { label: "renewal risk", value: "3", detail: "contracts need review this month" },
    ],
    connectors: [
      { name: "DocuSign", purpose: "envelopes, signatures, and contract status", status: "wired" },
      { name: "HubSpot", purpose: "account and deal context", status: "ready" },
      { name: "Supabase Vault", purpose: "encrypted legal connector tokens", status: "vaulted" },
    ],
    tasks: ["Check status", "Flag risky clause", "Draft renewal plan"],
    accent: "#22d3ee",
  },
];

export const paymentConnectors = ["Stripe", "Square"];
