// → app/api/concierge/route.ts   (NEW endpoint — coexists with /api/chat)
//
// Rule-based, deterministic partner matcher. NO AI call here by design:
// predictable > random. The AI intent layer comes later and only needs to
// replace detectIntent() — the scorer and URL resolution stay the same.
//
// Flow:  message -> detectIntent() -> scorePartner() over partners.json
//        -> top matches -> server-resolved geo affiliate URLs
//
// Request (either shape works, so the existing widget is drop-in compatible):
//   POST { message: string, lang?: Lang }
//   POST { messages: {role,content}[], lang?: Lang }   // uses last user turn
//   GET  /api/concierge?q=flights+to+lima&lang=en       // handy for testing
//
// Response:
//   {
//     query: string,
//     intent: { categories: string[] },          // detected category_keys
//     reply: string,                              // deterministic, localized
//     partners: PartnerCard[],                    // widget-compatible
//     matches: (PartnerCard & { score: number })[]// same list + scores (debug)
//   }

import { NextRequest, NextResponse } from "next/server";
// Relative to app/api/concierge/ -> repo root /public/partners.json.
// Static import => bundled into the function (no runtime fs read).
import partnersData from "../../../public/partners.json";

export const runtime = "nodejs";

type Lang = "en" | "pt" | "es" | "pl" | "ru";
const LANGS: Lang[] = ["en", "pt", "es", "pl", "ru"];

interface Partner {
  id: string;
  name: string;
  regions?: string[];
  url: string;
  category_key?: string;
  category_label?: string;
  description?: string;
  keywords?: string[];
  tier?: number;
  featured?: boolean;
  travel_related?: boolean;
  regional_urls?: Record<string, string>;
}

interface PartnerCard {
  id: string;
  name: string;
  category: string;
  description: string;
  url: string;
}

/* ---- Load partners (tolerate [] or { partners: [] }) ---------------------- */
const PARTNERS: Partner[] = (() => {
  const raw = partnersData as unknown;
  if (Array.isArray(raw)) return raw as Partner[];
  if (raw && typeof raw === "object" && Array.isArray((raw as { partners?: unknown }).partners)) {
    return (raw as { partners: Partner[] }).partners;
  }
  return [];
})();

interface SaasCard extends PartnerCard {
  module: string;
  telemetry: string;
}

const SAAS_MODULES: Record<string, { href: string; terms: string[]; telemetry: string; labels: Record<Lang, string>; replies: Record<Lang, string> }> = {
  promote: { href: "/promote", telemetry: "campaign_builder", terms: ["promote", "campaign", "marketing", "ads", "promocionar", "campanha", "kampania", "продвижение"], labels: { en: "Promote Business", es: "Promocionar negocio", pt: "Promover negócio", pl: "Promuj firmę", ru: "Продвижение бизнеса" }, replies: { en: "Open Promote Business to build campaigns, inspect analytics, and log outreach telemetry.", es: "Abre Promocionar negocio para crear campañas, revisar analíticas y registrar telemetría.", pt: "Abra Promover negócio para criar campanhas, ver análises e registrar telemetria.", pl: "Otwórz Promuj firmę, aby tworzyć kampanie, analizować dane i logować telemetrię.", ru: "Откройте Продвижение бизнеса для кампаний, аналитики и телеметрии." } },
  reviews: { href: "/reviews", telemetry: "reviews_sentiment_moderation", terms: ["review", "reviews", "rating", "sentiment", "moderation", "reseña", "avalia", "opinia", "отзыв"], labels: { en: "Reviews", es: "Reseñas", pt: "Avaliações", pl: "Opinie", ru: "Отзывы" }, replies: { en: "Reviews can collect 1–5 star feedback, analyze sentiment, moderate risk, and trigger testimonial campaigns.", es: "Reseñas recopila estrellas, analiza sentimiento, modera riesgos y activa campañas testimoniales.", pt: "Avaliações coleta notas, analisa sentimento, modera riscos e aciona campanhas de depoimentos.", pl: "Opinie zbierają oceny, analizują sentyment, moderują ryzyko i uruchamiają kampanie testimoniali.", ru: "Отзывы собирают оценки, анализируют тональность, модерируют риски и запускают кампании." } },
  calendar: { href: "/calendar", telemetry: "calendar_reminders", terms: ["calendar", "schedule", "reminder", "event", "calendario", "kalendarz", "календар"], labels: { en: "Calendar", es: "Calendario", pt: "Calendário", pl: "Kalendarz", ru: "Календарь" }, replies: { en: "Calendar coordinates events, reminders, and locale-aware scheduling.", es: "Calendario coordina eventos, recordatorios y fechas regionales.", pt: "Calendário coordena eventos, lembretes e datas locais.", pl: "Kalendarz koordynuje wydarzenia, przypomnienia i formaty lokalne.", ru: "Календарь координирует события, напоминания и локальные даты." } },
  spreadsheets: { href: "/spreadsheets", telemetry: "collaborative_tables", terms: ["spreadsheet", "sheet", "table", "csv", "planilha", "hoja", "arkusz", "таблиц"], labels: { en: "Spreadsheets", es: "Hojas de cálculo", pt: "Planilhas", pl: "Arkusze kalkulacyjne", ru: "Таблицы" }, replies: { en: "Spreadsheets manages collaborative tables, sharing, activity feeds, and forecast snapshots.", es: "Hojas gestiona tablas colaborativas, uso compartido y pronósticos.", pt: "Planilhas gerencia tabelas colaborativas, compartilhamento e previsões.", pl: "Arkusze obsługują tabele współdzielone, udostępnianie i prognozy.", ru: "Таблицы управляют совместными данными, доступом и прогнозами." } },
  outreach: { href: "/outreach", telemetry: "outreach_crm", terms: ["outreach", "email", "crm", "lead", "campaign", "alcance", "zasięg", "охват"], labels: { en: "Outreach", es: "Alcance", pt: "Alcance", pl: "Zasięg", ru: "Охват" }, replies: { en: "Outreach launches social, email, partner, and promotional campaigns while updating CRM stages.", es: "Alcance lanza campañas sociales, emails, socios y promociones con CRM.", pt: "Alcance lança campanhas sociais, e-mails, parceiros e promoções com CRM.", pl: "Zasięg uruchamia kampanie social, e-mail, partnerskie i CRM.", ru: "Охват запускает social, email, партнёрские и CRM-кампании." } },
  assistant: { href: "/assistant", telemetry: "personal_assistant", terms: ["assistant", "task", "productivity", "remind", "asistente", "assistente", "asystent", "ассистент"], labels: { en: "Personal Assistant", es: "Asistente personal", pt: "Assistente pessoal", pl: "Osobisty asystent", ru: "Личный помощник" }, replies: { en: "Personal Assistant manages tasks, reminders, productivity insights, and cross-module guidance.", es: "Asistente personal gestiona tareas, recordatorios, productividad y guía entre módulos.", pt: "Assistente pessoal gerencia tarefas, lembretes, produtividade e orientação entre módulos.", pl: "Osobisty asystent zarządza zadaniami, przypomnieniami i produktywnością.", ru: "Личный помощник управляет задачами, напоминаниями и продуктивностью." } },
  pricing: { href: "/pricing", telemetry: "saas_pricing", terms: ["pricing", "price", "subscription", "cost", "precio", "preço", "cennik", "цена"], labels: { en: "Pricing", es: "Precios", pt: "Preços", pl: "Cennik", ru: "Цены" }, replies: { en: "Pricing lists Website Optimization ($29/mo), Podcast Studio ($19/mo), Reviews ($15/mo), Calendar ($10/mo), Spreadsheets ($12/mo), Outreach ($20/mo), and Personal Assistant ($25/mo).", es: "Precios muestra Web (29 US$/mes), Podcast (19), Reseñas (15), Calendario (10), Hojas (12), Alcance (20) y Asistente (25).", pt: "Preços mostra Site (US$29/mês), Podcast (19), Avaliações (15), Calendário (10), Planilhas (12), Alcance (20) e Assistente (25).", pl: "Cennik zawiera stronę (29 USD/mies.), podcast (19), opinie (15), kalendarz (10), arkusze (12), zasięg (20) i asystenta (25).", ru: "Цены: сайт ($29/мес), подкаст (19), отзывы (15), календарь (10), таблицы (12), охват (20), помощник (25)." } },
};

function detectSaasModules(message: string): string[] {
  const m = message.toLowerCase();
  return Object.entries(SAAS_MODULES)
    .filter(([, module]) => module.terms.some((term) => hasTerm(m, term.toLowerCase())))
    .map(([slug]) => slug);
}

/* ---- Geo region (for which regional affiliate URL to serve) --------------- */
const COUNTRY_TO_REGION: Record<string, string> = {
  US: "us", BR: "br", GB: "uk", UK: "uk", PL: "pl", RU: "ru",
  CA: "ca", AU: "au", NZ: "nz", DE: "de", FR: "fr", IT: "it",
  AR: "ar", CO: "co", PE: "pe",
  MX: "es-latam", CL: "es-latam", EC: "es-latam", BO: "es-latam",
  PY: "es-latam", UY: "es-latam", VE: "es-latam", ES: "es-latam",
};

function regionFromRequest(req: NextRequest): string {
  const country = (req.headers.get("x-vercel-ip-country") || "").toUpperCase();
  return COUNTRY_TO_REGION[country] || "ot";
}

function pickUrl(p: Partner, region: string): string {
  if (p.regional_urls) {
    if (p.regional_urls[region]) return p.regional_urls[region];
    if (p.regional_urls["ot"]) return p.regional_urls["ot"];
  }
  return p.url;
}

/* ---- Intent rules (replace/augment this with AI later) -------------------- */
// Maps category_key -> trigger terms across EN/PT/ES/PL/RU. When a term is
// present in the message AND a partner's category_key matches, that partner
// gets a strong boost (predictable category routing).
const INTENT_RULES: { category: string; terms: string[] }[] = [
  { category: "flights", terms: ["flight", "flights", "plane", "airplane", "airfare", "airline", "fly", "ticket", "tickets", "passagem", "passagens", "voo", "voos", "aereo", "aerea", "vuelo", "vuelos", "avion", "bilet", "lot", "rejs", "reys", "aviabilet"] },
  { category: "hotels", terms: ["hotel", "hotels", "stay", "accommodation", "lodging", "resort", "hostel", "room", "hospedagem", "hospedar", "alojamiento", "alojamento", "nocleg", "otel", "gostinitsa"] },
  { category: "car_rentals", terms: ["car", "cars", "rental", "rent", "vehicle", "drive", "aluguel", "carro", "alquiler", "coche", "auto", "wynajem", "samochod", "arenda", "mashina"] },
  { category: "esim", terms: ["esim", "sim", "data", "roaming", "connectivity", "internet", "mobile", "chip", "datos", "polaczenie", "svyaz", "internett"] },
  { category: "insurance", terms: ["insurance", "insure", "coverage", "seguro", "seguros", "ubezpieczenie", "strakhovka"] },
  { category: "tours", terms: ["tour", "tours", "activity", "activities", "excursion", "sightseeing", "guide", "passeio", "passeios", "excursao", "actividad", "actividades", "wycieczka", "ekskursiya"] },
  { category: "transfers", terms: ["transfer", "transfers", "airport", "shuttle", "pickup", "taxi", "traslado", "transfert", "transfer"] },
  { category: "marketplace", terms: ["buy", "shop", "shopping", "marketplace", "store", "comprar", "loja", "tienda", "sklep", "magazin"] },
  { category: "products_tools", terms: ["product", "products", "tool", "tools", "gear", "equipment", "gadget", "produto", "ferramenta", "producto", "herramienta"] },
  { category: "finance", terms: ["finance", "bank", "banking", "money", "card", "credit", "payment", "wallet", "fintech", "banco", "dinero", "dinheiro", "tarjeta", "cartao", "platnosc", "dengi"] },
  { category: "travel_services", terms: ["visa", "passport", "booking", "itinerary", "esta", "passaporte", "pasaporte", "wiza", "viza"] },
  { category: "health_fitness", terms: ["health", "fitness", "gym", "workout", "wellness", "nutrition", "exercise", "saude", "salud", "zdrowie", "zdorovye"] },
  { category: "sports_outdoors", terms: ["sport", "sports", "outdoor", "outdoors", "hiking", "camping", "ski", "running", "bike", "esporte", "deporte", "sporty", "sport"] },
];

// ASCII terms use word boundaries; accented / non-ASCII fall back to substring.
function hasTerm(haystack: string, term: string): boolean {
  if (/^[a-z0-9 ]+$/.test(term)) {
    return new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(haystack);
  }
  return haystack.includes(term);
}

function detectIntent(message: string): string[] {
  const m = message.toLowerCase();
  const found: string[] = [];
  for (const rule of INTENT_RULES) {
    if (rule.terms.some((term) => hasTerm(m, term))) found.push(rule.category);
  }
  return found;
}

/* ---- Scoring -------------------------------------------------------------- */
const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "for", "to", "of", "in", "on", "is", "im", "i", "im",
  "me", "my", "we", "you", "want", "need", "looking", "find", "get", "with", "from",
  "para", "que", "para", "de", "da", "do", "um", "uma", "estou", "quero", "preciso",
  "un", "una", "el", "la", "los", "las", "busco", "quiero", "necesito",
  "dla", "chce", "szukam", "ya", "khochu", "ishchu",
]);

function scorePartner(message: string, intents: string[], partner: Partner, region: string): number {
  const text = `${partner.name} ${partner.category_label || ""} ${partner.category_key || ""} ${partner.description || ""} ${(partner.keywords || []).join(" ")}`.toLowerCase();
  let score = 0;

  // 1) Word overlap (+1 per distinct meaningful word found).
  const words = Array.from(
    new Set(
      message
        .toLowerCase()
        .split(/[^\p{L}\p{N}]+/u)
        .filter((w) => w.length >= 3 && !STOPWORDS.has(w))
    )
  );
  for (const w of words) {
    if (hasTerm(text, w)) score += 1;
  }

  // 2) Intent boost (+5 when the detected category matches this partner).
  if (partner.category_key && intents.includes(partner.category_key)) score += 5;

  // 3) Travel affinity (+2) when the request is travel-ish and partner is too.
  const travelIntents = ["flights", "hotels", "car_rentals", "esim", "insurance", "tours", "transfers", "travel_services"];
  if (partner.travel_related && intents.some((c) => travelIntents.includes(c))) score += 2;

  // --- Deterministic tiebreakers (small, never override real signal) ---
  if (score > 0) {
    if (partner.regions?.includes(region)) score += 1; // available where the visitor is
    if (partner.featured) score += 0.3;
    score += (5 - Math.min(partner.tier ?? 5, 5)) * 0.1; // tier 1 edges out tier 3
  }

  return score;
}

/* ---- Localized deterministic reply (no AI) -------------------------------- */
const REPLY: Record<Lang, { found: string; none: string }> = {
  en: {
    found: "I found a few partners that can help — tap any card below.",
    none: "I couldn't find a match yet. Try adding a detail, like \"flights to Lima\" or \"hotel in Sao Paulo\".",
  },
  pt: {
    found: "Encontrei alguns parceiros que podem ajudar — toque em qualquer card abaixo.",
    none: "Ainda nao encontrei uma opcao. Tente detalhar, como \"voos para Lima\" ou \"hotel em Sao Paulo\".",
  },
  es: {
    found: "Encontre algunos socios que pueden ayudar — toca cualquier tarjeta de abajo.",
    none: "Aun no encontre una coincidencia. Anade un detalle, como \"vuelos a Lima\" u \"hotel en Sao Paulo\".",
  },
  pl: {
    found: "Znalazlem kilku partnerow, ktorzy moga pomoc — kliknij dowolna karte ponizej.",
    none: "Nie znalazlem jeszcze dopasowania. Dodaj szczegol, np. \"loty do Limy\" lub \"hotel w Sao Paulo\".",
  },
  ru: {
    found: "Нашёл несколько партнёров, которые могут помочь — нажмите любую карточку ниже.",
    none: "Пока не нашёл совпадения. Добавьте детали, например «рейсы в Лиму» или «отель в Сан-Паулу».",
  },
};

/* ---- Core handler --------------------------------------------------------- */
function handle(message: string, lang: Lang, region: string) {
  const query = (message || "").trim();
  if (!query) {
    return { query: "", intent: { categories: [] }, reply: REPLY[lang].none, partners: [], matches: [] };
  }

  const intents = detectIntent(query);
  const saasIntents = detectSaasModules(query);

  if (saasIntents.length > 0) {
    const modules = saasIntents.slice(0, 5).map((slug) => {
      const module = SAAS_MODULES[slug];
      return {
        id: `saas-${slug}`,
        module: slug,
        name: module.labels[lang],
        category: "SignalBoost SaaS",
        description: module.replies[lang],
        url: module.href,
        telemetry: module.telemetry,
      } satisfies SaasCard;
    });

    return {
      query,
      intent: { categories: [...intents, ...saasIntents.map((slug) => `saas:${slug}`)] },
      reply: modules[0]?.description || REPLY[lang].found,
      partners: modules,
      matches: modules.map((module, index) => ({ ...module, score: 9.9 - index })),
      telemetry: { console: "Admin Console", event: "concierge_saas_route", modules: saasIntents },
    };
  }

  const ranked = PARTNERS
    .map((partner) => ({ partner, score: scorePartner(query, intents, partner, region) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || (a.partner.tier ?? 9) - (b.partner.tier ?? 9))
    .slice(0, 5);

  const matches = ranked.map(({ partner, score }) => ({
    id: partner.id,
    name: partner.name,
    category: partner.category_label || partner.category_key || "",
    description: partner.description || "",
    url: pickUrl(partner, region),
    score: Math.round(score * 10) / 10,
  }));

  const partners: PartnerCard[] = matches.map(({ score, ...card }) => card);

  return {
    query,
    intent: { categories: intents },
    reply: matches.length ? REPLY[lang].found : REPLY[lang].none,
    partners,
    matches,
  };
}

function resolveLang(value: unknown): Lang {
  return LANGS.includes(value as Lang) ? (value as Lang) : "en";
}

function messageFromBody(body: { message?: unknown; messages?: unknown }): string {
  if (typeof body.message === "string") return body.message;
  if (Array.isArray(body.messages)) {
    for (let i = body.messages.length - 1; i >= 0; i--) {
      const m = body.messages[i] as { role?: unknown; content?: unknown };
      if (m && m.role === "user" && typeof m.content === "string") return m.content;
    }
  }
  return "";
}

/* ========================================================================== */
export async function POST(req: NextRequest) {
  let body: { message?: unknown; messages?: unknown; lang?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const lang = resolveLang(body.lang);
  const region = regionFromRequest(req);
  return NextResponse.json(handle(messageFromBody(body), lang, region));
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") || "";
  const lang = resolveLang(req.nextUrl.searchParams.get("lang"));
  const region = regionFromRequest(req);
  return NextResponse.json(handle(q, lang, region));
}
