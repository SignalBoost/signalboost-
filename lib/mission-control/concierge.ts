export type SupportedLang = "en" | "es" | "pt" | "pl" | "ru";
export type UserRole = "partner" | "business_owner" | "customer" | "admin" | "owner";
export type PlatformModule = "Marketplace" | "SaaS" | "Outreach" | "CRM" | "Forecasting" | "Financial" | "KPI" | "Executive";
export type ConciergeOutcome = "success" | "error" | "escalation";

export interface ConciergeLogEntry {
  id: string;
  timestamp: string;
  queryText: string;
  userRole: UserRole;
  moduleAccessed: PlatformModule;
  responseTimeMs: number;
  outcome: ConciergeOutcome;
  aiRecommendation: string;
  locale: SupportedLang;
}

export interface OutreachCampaign {
  id: string;
  title: string;
  type: "social" | "email" | "partner_notification" | "promotion";
  platform: "Marketplace" | "SaaS" | "Unified";
  status: "draft" | "pending_approval" | "launched" | "cancelled";
  opens: number;
  clicks: number;
  conversions: number;
  revenueImpact: number;
}

export interface CrmPipelineEntry {
  id: string;
  stage: "Leads" | "Opportunities" | "Conversions";
  campaignType: "Marketplace" | "SaaS" | "Unified";
  source: "Concierge suggestion" | "Admin launch" | "Automated trigger";
  status: "open" | "in_progress" | "closed";
  metrics: {
    opens: number;
    clicks: number;
    conversions: number;
    revenueImpact: number;
  };
}

export const SaaS_MODULES = [
  "Promote Business",
  "Reviews",
  "Calendar",
  "Spreadsheets",
  "Outreach",
] as const;

export const MARKETPLACE_MODULES = ["Flights", "Hotels", "eSIM", "Tours", "Cars", "Bookings", "Partners"] as const;

export const ADMIN_SIDEBAR_SECTIONS = [
  "Overview",
  "Executive Overview",
  "Logs",
  "Outreach",
  "Insights",
  "Role Management",
  "Marketplace Monitor",
  "SaaS Monitor",
  "Concierge Monitor",
] as const;

const localizedRecommendations: Record<SupportedLang, Record<string, string>> = {
  en: {
    reviews: "High review interest detected — launch a testimonial campaign and notify partners with recent bookings.",
    calendar: "Calendar usage is rising — offer a productivity upsell to partners managing bookings.",
    outreach: "Outreach questions are trending — prepare unified emails, social posts, and partner notifications.",
    promotions: "Promotion intent detected — open Promote Business with campaign copy pre-filled.",
    marketplace: "Marketplace demand detected — highlight Flights, Hotels, eSIM, Tours, and Cars offers.",
    default: "Route this interaction into Mission Control and suggest the next best action across Marketplace + SaaS.",
  },
  es: {
    reviews: "Alto interés en reseñas — lanza una campaña de testimonios y avisa a socios con reservas recientes.",
    calendar: "El uso de Calendar aumenta — ofrece una mejora de productividad a socios con reservas.",
    outreach: "Las preguntas de outreach crecen — prepara emails, publicaciones sociales y avisos a socios.",
    promotions: "Intención promocional detectada — abre Promote Business con sugerencias precargadas.",
    marketplace: "Demanda de marketplace detectada — destaca Flights, Hotels, eSIM, Tours y Cars.",
    default: "Registra la interacción en Mission Control y sugiere la mejor acción entre Marketplace + SaaS.",
  },
  pt: {
    reviews: "Alto interesse em avaliações — lance uma campanha de depoimentos e notifique parceiros com reservas recentes.",
    calendar: "O uso do Calendar está subindo — ofereça upsell de produtividade para parceiros com reservas.",
    outreach: "Perguntas sobre outreach estão em alta — prepare emails, posts sociais e avisos aos parceiros.",
    promotions: "Intenção promocional detectada — abra Promote Business com sugestões preenchidas.",
    marketplace: "Demanda no marketplace detectada — destaque Flights, Hotels, eSIM, Tours e Cars.",
    default: "Registre a interação no Mission Control e sugira a próxima melhor ação entre Marketplace + SaaS.",
  },
  pl: {
    reviews: "Wysokie zainteresowanie opiniami — uruchom kampanię referencji i powiadom partnerów z rezerwacjami.",
    calendar: "Użycie Calendar rośnie — zaproponuj partnerom produktywnościowy upsell.",
    outreach: "Pytania o outreach trendują — przygotuj e-maile, posty społecznościowe i powiadomienia partnerów.",
    promotions: "Wykryto intencję promocji — otwórz Promote Business z wypełnionymi sugestiami.",
    marketplace: "Wykryto popyt marketplace — wyróżnij Flights, Hotels, eSIM, Tours i Cars.",
    default: "Zapisz interakcję w Mission Control i zasugeruj najlepszą akcję dla Marketplace + SaaS.",
  },
  ru: {
    reviews: "Высокий интерес к отзывам — запустите кампанию отзывов и уведомите партнёров с недавними бронированиями.",
    calendar: "Использование Calendar растёт — предложите партнёрам апселл продуктивности.",
    outreach: "Вопросы по outreach в тренде — подготовьте письма, соцпосты и уведомления партнёрам.",
    promotions: "Обнаружен запрос на продвижение — откройте Promote Business с готовыми подсказками.",
    marketplace: "Обнаружен спрос marketplace — выделите Flights, Hotels, eSIM, Tours и Cars.",
    default: "Запишите взаимодействие в Mission Control и предложите следующее действие для Marketplace + SaaS.",
  },
};

export function detectConciergeModule(query: string): PlatformModule {
  const text = query.toLowerCase();
  if (/review|testimonial|calendar|spreadsheet|sheet|promote|promotion|saas|office|workspace/.test(text)) return "SaaS";
  if (/outreach|campaign|email|notify|social|partner notification/.test(text)) return "Outreach";
  if (/crm|lead|opportunit|conversion|pipeline/.test(text)) return "CRM";
  if (/forecast|predict|churn|upsell|probability/.test(text)) return "Forecasting";
  if (/revenue|finance|payout|subscription|credit|ledger/.test(text)) return "Financial";
  if (/kpi|engagement|sentiment|adoption|growth/.test(text)) return "KPI";
  if (/executive|overview|cockpit|budget/.test(text)) return "Executive";
  return "Marketplace";
}

export function detectConciergeOutcome(query: string): ConciergeOutcome {
  const text = query.toLowerCase();
  if (/error|failed|broken|bug|not working/.test(text)) return "error";
  if (/human|agent|support|escalate|urgent/.test(text)) return "escalation";
  return "success";
}

export function buildAiRecommendation(query: string, lang: SupportedLang = "en"): string {
  const text = query.toLowerCase();
  const dict = localizedRecommendations[lang] || localizedRecommendations.en;
  if (/review|testimonial|rating|reseñ|avalia|opini|отзыв/.test(text)) return dict.reviews;
  if (/calendar|booking schedule|agenda|kalendar|календар/.test(text)) return dict.calendar;
  if (/outreach|campaign|email|notify|social|кампан/.test(text)) return dict.outreach;
  if (/promote|promotion|promo|discount|coupon|promoc/.test(text)) return dict.promotions;
  if (/flight|hotel|esim|tour|car|booking|partner|marketplace/.test(text)) return dict.marketplace;
  return dict.default;
}

export const seedConciergeLogs: ConciergeLogEntry[] = [
  {
    id: "cl-001",
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    queryText: "How do I promote reviews from tour bookings?",
    userRole: "business_owner",
    moduleAccessed: "SaaS",
    responseTimeMs: 842,
    outcome: "success",
    aiRecommendation: localizedRecommendations.en.reviews,
    locale: "en",
  },
  {
    id: "cl-002",
    timestamp: new Date(Date.now() - 1000 * 60 * 24).toISOString(),
    queryText: "Find eSIM partners and notify them about a launch offer",
    userRole: "partner",
    moduleAccessed: "Marketplace",
    responseTimeMs: 694,
    outcome: "success",
    aiRecommendation: localizedRecommendations.en.marketplace,
    locale: "en",
  },
  {
    id: "cl-003",
    timestamp: new Date(Date.now() - 1000 * 60 * 41).toISOString(),
    queryText: "Calendar usage spike — what campaign should we launch?",
    userRole: "admin",
    moduleAccessed: "Forecasting",
    responseTimeMs: 918,
    outcome: "success",
    aiRecommendation: localizedRecommendations.en.calendar,
    locale: "en",
  },
  {
    id: "cl-004",
    timestamp: new Date(Date.now() - 1000 * 60 * 58).toISOString(),
    queryText: "Escalate failed booking sync for hotel partner",
    userRole: "customer",
    moduleAccessed: "Marketplace",
    responseTimeMs: 1260,
    outcome: "escalation",
    aiRecommendation: "Escalate to support, preserve booking context, and log the incident for partner operations.",
    locale: "en",
  },
];

export const seedOutreachCampaigns: OutreachCampaign[] = [
  { id: "oc-001", title: "Tours testimonial push", type: "email", platform: "Unified", status: "pending_approval", opens: 421, clicks: 96, conversions: 18, revenueImpact: 12600 },
  { id: "oc-002", title: "eSIM airport arrival offer", type: "social", platform: "Marketplace", status: "launched", opens: 880, clicks: 164, conversions: 33, revenueImpact: 21450 },
  { id: "oc-003", title: "Calendar productivity upsell", type: "promotion", platform: "SaaS", status: "draft", opens: 306, clicks: 78, conversions: 14, revenueImpact: 9800 },
];

export const seedCrmPipeline: CrmPipelineEntry[] = [
  { id: "crm-001", stage: "Leads", campaignType: "Marketplace", source: "Concierge suggestion", status: "open", metrics: { opens: 880, clicks: 164, conversions: 0, revenueImpact: 7200 } },
  { id: "crm-002", stage: "Opportunities", campaignType: "SaaS", source: "Admin launch", status: "in_progress", metrics: { opens: 306, clicks: 78, conversions: 5, revenueImpact: 9800 } },
  { id: "crm-003", stage: "Conversions", campaignType: "Unified", source: "Automated trigger", status: "closed", metrics: { opens: 421, clicks: 96, conversions: 18, revenueImpact: 12600 } },
];

export function summarizeConciergeTelemetry(logs: ConciergeLogEntry[]) {
  const byHour = Array.from({ length: 8 }, (_, index) => {
    const hour = `${index + 9}:00`;
    return { hour, queries: Math.max(1, logs.filter((_, i) => i % 8 === index).length + index) };
  });
  const success = logs.filter((log) => log.outcome === "success").length;
  const errors = logs.filter((log) => log.outcome === "error").length;
  const escalations = logs.filter((log) => log.outcome === "escalation").length;
  const marketplace = logs.filter((log) => log.moduleAccessed === "Marketplace").length;
  const saas = logs.filter((log) => log.moduleAccessed === "SaaS").length;
  const outreach = logs.filter((log) => log.moduleAccessed === "Outreach").length;
  const avgResponseTimeMs = Math.round(logs.reduce((sum, log) => sum + log.responseTimeMs, 0) / Math.max(logs.length, 1));
  const queryCounts = logs.reduce<Record<string, number>>((acc, log) => {
    const key = log.queryText.toLowerCase().replace(/[^a-z0-9 ]/g, "").split(" ").slice(0, 6).join(" ");
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const topQueries = Object.entries(queryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([query, count]) => ({ query, count }));
  return { byHour, success, errors, escalations, marketplace, saas, outreach, avgResponseTimeMs, topQueries };
}
