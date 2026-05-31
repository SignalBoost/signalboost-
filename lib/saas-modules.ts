export type SaasModule = {
  slug: string;
  href: string;
  accent: string;
  titleKey: string;
  summaryKey: string;
  eyebrowKey: string;
  signalKey: string;
  statusKey: string;
  telemetryKey: string;
  featureKeys: string[];
  automationKeys: string[];
};

function moduleKeys(slug: string) {
  return {
    titleKey: `modules.${slug}.title`,
    summaryKey: `modules.${slug}.summary`,
    eyebrowKey: `modules.${slug}.eyebrow`,
    signalKey: `modules.${slug}.signal`,
    statusKey: `modules.${slug}.status`,
    telemetryKey: `modules.${slug}.telemetry`,
    featureKeys: [0, 1, 2].map((index) => `modules.${slug}.features.${index}`),
    automationKeys: [0, 1, 2].map((index) => `modules.${slug}.automations.${index}`),
  };
}

export const saasModules: SaasModule[] = [
  {
    slug: "promote",
    ...moduleKeys("promote"),
    href: "/promote",
    accent: "#f5c542",
  },
  {
    slug: "reviews",
    ...moduleKeys("reviews"),
    href: "/reviews",
    accent: "#7dd3fc",
  },
  {
    slug: "calendar",
    ...moduleKeys("calendar"),
    href: "/calendar",
    accent: "#a78bfa",
  },
  {
    slug: "spreadsheets",
    ...moduleKeys("spreadsheets"),
    href: "/spreadsheets",
    accent: "#34d399",
  },
  {
    slug: "outreach",
    ...moduleKeys("outreach"),
    href: "/outreach",
    accent: "#fb7185",
  },
  {
    slug: "assistant",
    ...moduleKeys("assistant"),
    href: "/assistant",
    accent: "#22d3ee",
  },
];

export type ExecutivePanel = {
  titleKey: string;
  metric: string;
  detailKey: string;
};

export const executivePanels: ExecutivePanel[] = [
  {
    titleKey: "executive.panels.financials.title",
    metric: "$128K",
    detailKey: "executive.panels.financials.detail",
  },
  {
    titleKey: "executive.panels.kpis.title",
    metric: "98.2%",
    detailKey: "executive.panels.kpis.detail",
  },
  {
    titleKey: "executive.panels.crm.title",
    metric: "742",
    detailKey: "executive.panels.crm.detail",
  },
  {
    titleKey: "executive.panels.forecasting.title",
    metric: "+17%",
    detailKey: "executive.panels.forecasting.detail",
  },
  {
    titleKey: "executive.panels.outreach.title",
    metric: "1.9K",
    detailKey: "executive.panels.outreach.detail",
  },
];
