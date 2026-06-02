import { saasModules } from "@/lib/saas-modules";
import partnersData from "@/partners.json";

// Partner directory for the concierge (find-a-company) path. Static import so
// it ships in the bundle — same source the /api/chat route uses.
type DirItem = { id: string; name: string; category_key?: string; category?: string; regions?: string[]; description?: string; tier?: number; url?: string };
const DIRECTORY: DirItem[] = (Array.isArray(partnersData) ? (partnersData as DirItem[]) : []);

function buildDirectoryText(region: string): string {
  const sorted = [...DIRECTORY].sort((a, b) => {
    const ar = a.regions?.includes(region) ? 0 : 1;
    const br = b.regions?.includes(region) ? 0 : 1;
    if (ar !== br) return ar - br;
    return (a.tier ?? 9) - (b.tier ?? 9);
  });
  return sorted
    .slice(0, 120)
    .map((p) => `${p.name} | ${p.category_key || p.category || "other"} | regions:${(p.regions || []).join(",") || "ot"} | ${(p.description || "").slice(0, 90)}`)
    .join("\n");
}

export type OrchestrationModule =
  | "concierge"
  | "promote"
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

type Lang = "en" | "es" | "pt" | "pl" | "ru";

// ---- Real AI answer -------------------------------------------------------
// Generates a genuine response via Anthropic. Module-aware: the detected
// module(s) are described so the model frames its help correctly. Falls back
// to null on any error (missing key, network, bad response) so the caller can
// use the canned summary and never break.
const AI_MODEL = "claude-sonnet-4-6";
const AI_URL = "https://api.anthropic.com/v1/messages";
const LANG_NAME: Record<Lang, string> = { en: "English", es: "Spanish", pt: "Portuguese", pl: "Polish", ru: "Russian" };

const MODULE_PURPOSE: Record<OrchestrationModule, string> = {
  concierge: "finding and recommending the right affiliate partners/services from the marketplace",
  promote: "planning marketing campaigns, offers, and promotional placements for the user's business",
  calendar: "scheduling, bookings, launches, and follow-up timing",
  reviews: "collecting, triaging, and responding to customer reviews and feedback",
  spreadsheets: "organizing business data: budgets, inventory, partner lists, forecasts",
  outreach: "planning email/partner/customer outreach sequences and follow-ups",
};

async function aiAnswer(
  message: string,
  modules: OrchestrationModule[],
  history: { role: "user" | "assistant"; content: string }[],
  lang: Lang
): Promise<string | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || !message) return null;

  const focus = modules.map((m) => `${MODULE_LABELS[m]} (${MODULE_PURPOSE[m]})`).join("; ");
  const isConcierge = modules.includes("concierge");

  // When the request is about finding a company/service/partner, give the model
  // the real partner directory so it can recommend actual partners by name.
  const directoryBlock = isConcierge
    ? `\n\nPARTNER DIRECTORY (name | category | regions | description) — recommend the most relevant ones BY NAME when the user is looking for a company/service:\n${buildDirectoryText("ot")}\n\nWhen recommending, name the specific partners and say what each is good for. If none perfectly serve the user's region, still recommend the closest useful options and say they should confirm coverage. Region codes: ot=worldwide, us, pl=Poland, br=Brazil, es-latam=Latin America, ru=Russia.`
    : "";

  const system = `You are the SignalBoost Assistant, a warm, concise business copilot on signalboostapp.com. SignalBoost is a geo-aware affiliate marketplace plus a SaaS platform that helps small businesses run operations (Promote, Reviews, Calendar, Spreadsheets, Outreach, and a marketplace Concierge).

The user's request has been routed to: ${focus || "general assistance"}.

You have a web_search tool. Use it whenever the user asks you to find a company, service, product, person's business, place, current prices, or any up-to-date public information — search the live web and answer with current, real results (include names and, when useful, what makes each a good fit). Prefer SignalBoost's own partners when they genuinely fit, but you are NOT limited to them: find the best real-world answer worldwide. Do not search for purely conversational or general-knowledge questions you can already answer well.

Answer the user's actual question directly and usefully in ${LANG_NAME[lang]}. Be practical and specific. Keep it concise unless the question needs more. Do not invent data; if you searched, base the answer on what you found. Plain text only, no markdown headers.${directoryBlock}`;

  const messages = [
    ...history.slice(-40).map((h) => ({ role: h.role, content: h.content })),
    { role: "user" as const, content: message },
  ];

  try {
    const res = await fetch(AI_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: AI_MODEL,
        max_tokens: 1200,
        system,
        messages,
        tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 4 }],
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const content = (data as { content?: unknown }).content;
    if (!Array.isArray(content)) return null;
    const text = content
      .map((b) => (b && typeof b === "object" && typeof (b as { text?: unknown }).text === "string" ? (b as { text: string }).text : ""))
      .join("")
      .trim();
    return text || null;
  } catch {
    return null;
  }
}

function asLang(value?: string): Lang {
  const v = (value || "en").slice(0, 2).toLowerCase();
  return (["en", "es", "pt", "pl", "ru"] as const).includes(v as Lang) ? (v as Lang) : "en";
}

type ModuleHandler = (message: string, lang: Lang) => ModuleResult;

const MODULE_LABELS: Record<OrchestrationModule, string> = {
  concierge: "Concierge",
  promote: "Promote",
  calendar: "Calendar",
  reviews: "Reviews",
  spreadsheets: "Spreadsheets",
  outreach: "Outreach",
};

// Detection works on the USER'S INPUT, so the terms stay English (plus we keep
// matching regardless of the output language). This is intentional.
const MODULE_TERMS: Record<OrchestrationModule, string[]> = {
  concierge: ["help", "assistant", "concierge", "what", "how", "explain", "answer", "recommend", "find"],
  promote: ["promote", "marketing", "campaign", "advertise", "offer", "acquisition", "landing", "utm"],
  calendar: ["calendar", "schedule", "booking", "book", "meeting", "appointment", "reminder", "reschedule", "availability"],
  reviews: ["review", "reviews", "rating", "reputation", "feedback", "testimonial", "sentiment", "google"],
  spreadsheets: ["spreadsheet", "sheet", "csv", "rows", "table", "forecast", "budget", "data", "formula"],
  outreach: ["outreach", "email", "lead", "crm", "sequence", "follow up", "campaign", "message", "prospect"],
};

// ---------------------------------------------------------------------------
// Localized string tables. All user-facing output text lives here per language.
// Dynamic pieces (dates, module lists, echoed message) are handled by functions
// that receive already-localized fragments.
// ---------------------------------------------------------------------------
type Strings = {
  options: string[];
  dateHints: { tomorrow: string; today: string; nextWeek: string; nextSlot: string };
  summaries: {
    conciergeMatched: (mods: string) => string;
    conciergeGeneral: string;
    promoteGeo: string;
    promoteDefault: string;
    calendar: (dateHint: string) => string;
    reviews: string;
    spreadsheetsImport: string;
    spreadsheetsDefault: string;
    outreach: string;
  };
  actions: {
    concierge: string[];
    promote: string[];
    calendar: string[];
    reviews: string[];
    spreadsheets: string[];
    outreach: string[];
  };
  dataValues: { reviewsSentiment: string };
  demo: Record<OrchestrationModule, { summary: string; actions: string[] }>;
  understoodVague: string;
  understoodRouted: (message: string, mods: string) => string;
  answerPricing: string;
  answerHowWhat: string;
  answerModuleJoin: (parts: string) => string;
  answerDefault: string;
  nextStepsConfirm: string;
  nextStepsChooseAction: string;
  nextStepsContinue: string;
  clarification: string;
};

const STRINGS: Record<Lang, Strings> = {
  en: {
    options: [
      "Confirm this plan and run the next action.",
      "Refine with more context, audience, dates, or goals.",
      "Switch modules if another workflow should own it.",
    ],
    dateHints: { tomorrow: "tomorrow", today: "today", nextWeek: "next week", nextSlot: "next available slot" },
    summaries: {
      conciergeMatched: (mods) => `I matched your request to ${mods} and prepared cross-module routing.`,
      conciergeGeneral: "I can answer general questions, clarify ambiguous requests, and route work to SignalBoost modules.",
      promoteGeo: "Promote can launch geo-aware offers, partner placements, and localized campaign routing through signalboost-live.",
      promoteDefault: "Promote can turn marketplace intent into campaign briefs, offer cards, and measurable acquisition paths.",
      calendar: (d) => `Calendar can stage availability, reminders, and handoffs for ${d} while waiting for final confirmation.`,
      reviews: "Reviews can collect feedback, classify sentiment, and draft brand-safe responses.",
      spreadsheetsImport: "Spreadsheets can validate imported rows, normalize columns, and create a guarded working table.",
      spreadsheetsDefault: "Spreadsheets can turn operational data into forecasts, anomaly checks, and executive summaries.",
      outreach: "Outreach can assemble leads, personalize the first message, and schedule follow-ups without dropping the task.",
    },
    actions: {
      concierge: ["Summarize what was understood", "Offer choices before taking action", "Continue with safe fallback defaults when details are missing"],
      promote: ["Open campaign router", "Build offer card", "Attach UTM and partner conversion tracking"],
      calendar: ["Draft booking window", "Check conflicts", "Prepare reminder sequence"],
      reviews: ["Open review inbox", "Flag negative sentiment", "Draft response options"],
      spreadsheets: ["Create smart table", "Validate schema", "Generate forecast snapshot"],
      outreach: ["Segment lead queue", "Draft email sequence", "Schedule follow-up timing"],
    },
    dataValues: { reviewsSentiment: "positive with two watch items" },
    demo: {
      concierge: { summary: "Concierge fallback is active with clarification prompts, safe defaults, and general smart answers.", actions: ["Restate the goal", "Offer confirmation options", "Continue with a safe default"] },
      promote: { summary: "Promote fallback is active with sample campaign briefs, offer cards, and UTM checks.", actions: ["Create demo campaign", "Build offer card", "Validate UTM routing"] },
      calendar: { summary: "Calendar fallback is active with demo availability and reminder sequencing.", actions: ["Use demo availability", "Prepare a conflict check", "Draft reminders"] },
      reviews: { summary: "Reviews fallback is active with sample sentiment, pending responses, and response drafting.", actions: ["Review sample sentiment", "Draft response options", "Escalate watch items"] },
      spreadsheets: { summary: "Spreadsheets fallback is active with demo rows, schema guardrails, and forecast snapshots.", actions: ["Create demo table", "Validate columns", "Generate forecast snapshot"] },
      outreach: { summary: "Outreach fallback is active with sample lead queues and follow-up sequences.", actions: ["Segment demo leads", "Draft first email", "Schedule follow-ups"] },
    },
    understoodVague: "I understood that you want SignalBoost help, but the request needs one more detail. I will use a safe default and keep going.",
    understoodRouted: (m, mods) => `I understood this as: “${m}”. I routed it through ${mods}.`,
    answerPricing: "SignalBoost can frame pricing by module access, automation depth, and Concierge coverage. If you want, I can compare the best package for marketplace growth versus internal operations.",
    answerHowWhat: "Here is the practical answer: SignalBoost works best when Concierge first clarifies the goal, then routes each next action to the SaaS module that can complete it. That keeps the conversation useful even when one integration is missing.",
    answerModuleJoin: (parts) => parts,
    answerDefault: "I can help with general questions and SignalBoost workflows. Share the goal, and I will keep refining until there is an actionable next step.",
    nextStepsConfirm: "Confirm or edit the understood goal.",
    nextStepsChooseAction: "Choose a module action.",
    nextStepsContinue: "Continue refining until the task is complete.",
    clarification: "What outcome, audience, or deadline should I optimize for?",
  },
  es: {
    options: [
      "Confirma este plan y ejecuta la siguiente acción.",
      "Refina con más contexto, audiencia, fechas u objetivos.",
      "Cambia de módulo si otro flujo debería encargarse.",
    ],
    dateHints: { tomorrow: "mañana", today: "hoy", nextWeek: "la próxima semana", nextSlot: "el próximo horario disponible" },
    summaries: {
      conciergeMatched: (mods) => `Vinculé tu solicitud con ${mods} y preparé el enrutamiento entre módulos.`,
      conciergeGeneral: "Puedo responder preguntas generales, aclarar solicitudes ambiguas y derivar el trabajo a los módulos de SignalBoost.",
      promoteGeo: "Promocionar puede lanzar ofertas según geolocalización, ubicaciones de socios y enrutamiento de campañas localizadas a través de signalboost-live.",
      promoteDefault: "Promocionar puede convertir la intención del marketplace en briefs de campaña, tarjetas de oferta y rutas de adquisición medibles.",
      calendar: (d) => `Calendario puede preparar disponibilidad, recordatorios y transferencias para ${d} mientras espera la confirmación final.`,
      reviews: "Reseñas puede recopilar comentarios, clasificar el sentimiento y redactar respuestas seguras para la marca.",
      spreadsheetsImport: "Hojas de cálculo puede validar filas importadas, normalizar columnas y crear una tabla de trabajo protegida.",
      spreadsheetsDefault: "Hojas de cálculo puede convertir datos operativos en pronósticos, comprobaciones de anomalías y resúmenes ejecutivos.",
      outreach: "Prospección puede reunir leads, personalizar el primer mensaje y programar seguimientos sin perder la tarea.",
    },
    actions: {
      concierge: ["Resumir lo que se entendió", "Ofrecer opciones antes de actuar", "Continuar con valores predeterminados seguros cuando falten detalles"],
      promote: ["Abrir enrutador de campañas", "Crear tarjeta de oferta", "Adjuntar seguimiento de UTM y conversión de socios"],
      calendar: ["Redactar ventana de reserva", "Verificar conflictos", "Preparar secuencia de recordatorios"],
      reviews: ["Abrir bandeja de reseñas", "Marcar sentimiento negativo", "Redactar opciones de respuesta"],
      spreadsheets: ["Crear tabla inteligente", "Validar esquema", "Generar instantánea de pronóstico"],
      outreach: ["Segmentar cola de leads", "Redactar secuencia de email", "Programar tiempos de seguimiento"],
    },
    dataValues: { reviewsSentiment: "positivo con dos puntos a vigilar" },
    demo: {
      concierge: { summary: "El respaldo de Concierge está activo con indicaciones de aclaración, valores predeterminados seguros y respuestas inteligentes generales.", actions: ["Reformular el objetivo", "Ofrecer opciones de confirmación", "Continuar con un valor predeterminado seguro"] },
      promote: { summary: "El respaldo de Promocionar está activo con briefs de campaña de ejemplo, tarjetas de oferta y comprobaciones de UTM.", actions: ["Crear campaña de demostración", "Crear tarjeta de oferta", "Validar enrutamiento de UTM"] },
      calendar: { summary: "El respaldo de Calendario está activo con disponibilidad de demostración y secuencia de recordatorios.", actions: ["Usar disponibilidad de demostración", "Preparar verificación de conflictos", "Redactar recordatorios"] },
      reviews: { summary: "El respaldo de Reseñas está activo con sentimiento de ejemplo, respuestas pendientes y redacción de respuestas.", actions: ["Revisar sentimiento de ejemplo", "Redactar opciones de respuesta", "Escalar puntos a vigilar"] },
      spreadsheets: { summary: "El respaldo de Hojas de cálculo está activo con filas de demostración, protección de esquema e instantáneas de pronóstico.", actions: ["Crear tabla de demostración", "Validar columnas", "Generar instantánea de pronóstico"] },
      outreach: { summary: "El respaldo de Prospección está activo con colas de leads de ejemplo y secuencias de seguimiento.", actions: ["Segmentar leads de demostración", "Redactar primer email", "Programar seguimientos"] },
    },
    understoodVague: "Entendí que quieres ayuda de SignalBoost, pero la solicitud necesita un detalle más. Usaré un valor predeterminado seguro y seguiré adelante.",
    understoodRouted: (m, mods) => `Lo entendí así: “${m}”. Lo derivé a través de ${mods}.`,
    answerPricing: "SignalBoost puede definir los precios según el acceso a módulos, la profundidad de automatización y la cobertura de Concierge. Si quieres, puedo comparar el mejor paquete para el crecimiento del marketplace frente a las operaciones internas.",
    answerHowWhat: "Esta es la respuesta práctica: SignalBoost funciona mejor cuando Concierge primero aclara el objetivo y luego deriva cada acción al módulo SaaS que puede completarla. Así la conversación sigue siendo útil incluso cuando falta una integración.",
    answerModuleJoin: (parts) => parts,
    answerDefault: "Puedo ayudar con preguntas generales y flujos de SignalBoost. Comparte el objetivo y seguiré refinando hasta que haya un próximo paso accionable.",
    nextStepsConfirm: "Confirma o edita el objetivo entendido.",
    nextStepsChooseAction: "Elige una acción del módulo.",
    nextStepsContinue: "Sigue refinando hasta completar la tarea.",
    clarification: "¿Qué resultado, audiencia o fecha límite debo optimizar?",
  },
  pt: {
    options: [
      "Confirme este plano e execute a próxima ação.",
      "Refine com mais contexto, público, datas ou objetivos.",
      "Troque de módulo se outro fluxo deve assumir.",
    ],
    dateHints: { tomorrow: "amanhã", today: "hoje", nextWeek: "na próxima semana", nextSlot: "o próximo horário disponível" },
    summaries: {
      conciergeMatched: (mods) => `Vinculei seu pedido a ${mods} e preparei o roteamento entre módulos.`,
      conciergeGeneral: "Posso responder a perguntas gerais, esclarecer pedidos ambíguos e encaminhar o trabalho aos módulos do SignalBoost.",
      promoteGeo: "Promover pode lançar ofertas com geolocalização, posicionamentos de parceiros e roteamento de campanhas localizadas através do signalboost-live.",
      promoteDefault: "Promover pode transformar a intenção do marketplace em briefings de campanha, cartões de oferta e caminhos de aquisição mensuráveis.",
      calendar: (d) => `Calendário pode preparar disponibilidade, lembretes e repasses para ${d} enquanto aguarda a confirmação final.`,
      reviews: "Avaliações pode coletar feedback, classificar o sentimento e redigir respostas seguras para a marca.",
      spreadsheetsImport: "Planilhas pode validar linhas importadas, normalizar colunas e criar uma tabela de trabalho protegida.",
      spreadsheetsDefault: "Planilhas pode transformar dados operacionais em previsões, verificações de anomalias e resumos executivos.",
      outreach: "Alcance pode reunir leads, personalizar a primeira mensagem e agendar acompanhamentos sem perder a tarefa.",
    },
    actions: {
      concierge: ["Resumir o que foi entendido", "Oferecer opções antes de agir", "Continuar com padrões seguros quando faltarem detalhes"],
      promote: ["Abrir roteador de campanhas", "Criar cartão de oferta", "Anexar rastreamento de UTM e conversão de parceiros"],
      calendar: ["Rascunhar janela de reserva", "Verificar conflitos", "Preparar sequência de lembretes"],
      reviews: ["Abrir caixa de avaliações", "Sinalizar sentimento negativo", "Redigir opções de resposta"],
      spreadsheets: ["Criar tabela inteligente", "Validar esquema", "Gerar instantâneo de previsão"],
      outreach: ["Segmentar fila de leads", "Redigir sequência de email", "Agendar tempos de acompanhamento"],
    },
    dataValues: { reviewsSentiment: "positivo com dois pontos de atenção" },
    demo: {
      concierge: { summary: "O fallback do Concierge está ativo com prompts de esclarecimento, padrões seguros e respostas inteligentes gerais.", actions: ["Reformular o objetivo", "Oferecer opções de confirmação", "Continuar com um padrão seguro"] },
      promote: { summary: "O fallback do Promover está ativo com briefings de campanha de exemplo, cartões de oferta e verificações de UTM.", actions: ["Criar campanha de demonstração", "Criar cartão de oferta", "Validar roteamento de UTM"] },
      calendar: { summary: "O fallback do Calendário está ativo com disponibilidade de demonstração e sequência de lembretes.", actions: ["Usar disponibilidade de demonstração", "Preparar verificação de conflitos", "Rascunhar lembretes"] },
      reviews: { summary: "O fallback das Avaliações está ativo com sentimento de exemplo, respostas pendentes e redação de respostas.", actions: ["Revisar sentimento de exemplo", "Redigir opções de resposta", "Escalar pontos de atenção"] },
      spreadsheets: { summary: "O fallback das Planilhas está ativo com linhas de demonstração, proteções de esquema e instantâneos de previsão.", actions: ["Criar tabela de demonstração", "Validar colunas", "Gerar instantâneo de previsão"] },
      outreach: { summary: "O fallback do Alcance está ativo com filas de leads de exemplo e sequências de acompanhamento.", actions: ["Segmentar leads de demonstração", "Redigir primeiro email", "Agendar acompanhamentos"] },
    },
    understoodVague: "Entendi que você quer ajuda do SignalBoost, mas o pedido precisa de mais um detalhe. Vou usar um padrão seguro e continuar.",
    understoodRouted: (m, mods) => `Entendi assim: “${m}”. Encaminhei através de ${mods}.`,
    answerPricing: "O SignalBoost pode definir o preço por acesso a módulos, profundidade de automação e cobertura do Concierge. Se quiser, posso comparar o melhor pacote para crescimento do marketplace versus operações internas.",
    answerHowWhat: "Esta é a resposta prática: o SignalBoost funciona melhor quando o Concierge primeiro esclarece o objetivo e depois encaminha cada ação ao módulo SaaS que pode concluí-la. Isso mantém a conversa útil mesmo quando falta uma integração.",
    answerModuleJoin: (parts) => parts,
    answerDefault: "Posso ajudar com perguntas gerais e fluxos do SignalBoost. Compartilhe o objetivo e continuarei refinando até haver um próximo passo acionável.",
    nextStepsConfirm: "Confirme ou edite o objetivo entendido.",
    nextStepsChooseAction: "Escolha uma ação do módulo.",
    nextStepsContinue: "Continue refinando até concluir a tarefa.",
    clarification: "Que resultado, público ou prazo devo otimizar?",
  },
  pl: {
    options: [
      "Potwierdź ten plan i wykonaj następną akcję.",
      "Doprecyzuj kontekst, odbiorców, daty lub cele.",
      "Zmień moduł, jeśli inny przepływ powinien to przejąć.",
    ],
    dateHints: { tomorrow: "jutro", today: "dziś", nextWeek: "w przyszłym tygodniu", nextSlot: "następny dostępny termin" },
    summaries: {
      conciergeMatched: (mods) => `Dopasowałem Twoją prośbę do ${mods} i przygotowałem routing między modułami.`,
      conciergeGeneral: "Mogę odpowiadać na ogólne pytania, wyjaśniać niejasne prośby i kierować pracę do modułów SignalBoost.",
      promoteGeo: "Promuj może uruchamiać oferty zależne od lokalizacji, miejsca partnerów i routing lokalnych kampanii przez signalboost-live.",
      promoteDefault: "Promuj może zamienić intencję marketplace w briefy kampanii, karty ofert i mierzalne ścieżki pozyskiwania.",
      calendar: (d) => `Kalendarz może przygotować dostępność, przypomnienia i przekazania na ${d}, czekając na ostateczne potwierdzenie.`,
      reviews: "Opinie mogą zbierać opinie, klasyfikować sentyment i redagować bezpieczne dla marki odpowiedzi.",
      spreadsheetsImport: "Arkusze mogą weryfikować zaimportowane wiersze, normalizować kolumny i tworzyć chronioną tabelę roboczą.",
      spreadsheetsDefault: "Arkusze mogą zamienić dane operacyjne w prognozy, kontrole anomalii i podsumowania dla zarządu.",
      outreach: "Zasięg może zebrać leady, spersonalizować pierwszą wiadomość i zaplanować follow-upy bez porzucania zadania.",
    },
    actions: {
      concierge: ["Podsumuj, co zrozumiano", "Zaproponuj wybory przed działaniem", "Kontynuuj z bezpiecznymi domyślnymi, gdy brakuje szczegółów"],
      promote: ["Otwórz router kampanii", "Zbuduj kartę oferty", "Dołącz śledzenie UTM i konwersji partnerów"],
      calendar: ["Naszkicuj okno rezerwacji", "Sprawdź konflikty", "Przygotuj sekwencję przypomnień"],
      reviews: ["Otwórz skrzynkę opinii", "Oznacz negatywny sentyment", "Naszkicuj opcje odpowiedzi"],
      spreadsheets: ["Utwórz inteligentną tabelę", "Zweryfikuj schemat", "Wygeneruj migawkę prognozy"],
      outreach: ["Segmentuj kolejkę leadów", "Naszkicuj sekwencję e-mail", "Zaplanuj czas follow-upów"],
    },
    dataValues: { reviewsSentiment: "pozytywny z dwoma punktami do obserwacji" },
    demo: {
      concierge: { summary: "Fallback Concierge jest aktywny z podpowiedziami doprecyzowania, bezpiecznymi domyślnymi i ogólnymi inteligentnymi odpowiedziami.", actions: ["Przeformułuj cel", "Zaproponuj opcje potwierdzenia", "Kontynuuj z bezpiecznym domyślnym"] },
      promote: { summary: "Fallback Promuj jest aktywny z przykładowymi briefami kampanii, kartami ofert i kontrolą UTM.", actions: ["Utwórz kampanię demo", "Zbuduj kartę oferty", "Zweryfikuj routing UTM"] },
      calendar: { summary: "Fallback Kalendarza jest aktywny z dostępnością demo i sekwencją przypomnień.", actions: ["Użyj dostępności demo", "Przygotuj kontrolę konfliktów", "Naszkicuj przypomnienia"] },
      reviews: { summary: "Fallback Opinii jest aktywny z przykładowym sentymentem, oczekującymi odpowiedziami i redagowaniem odpowiedzi.", actions: ["Przejrzyj przykładowy sentyment", "Naszkicuj opcje odpowiedzi", "Eskaluj punkty do obserwacji"] },
      spreadsheets: { summary: "Fallback Arkuszy jest aktywny z wierszami demo, zabezpieczeniami schematu i migawkami prognoz.", actions: ["Utwórz tabelę demo", "Zweryfikuj kolumny", "Wygeneruj migawkę prognozy"] },
      outreach: { summary: "Fallback Zasięgu jest aktywny z przykładowymi kolejkami leadów i sekwencjami follow-up.", actions: ["Segmentuj leady demo", "Naszkicuj pierwszy e-mail", "Zaplanuj follow-upy"] },
    },
    understoodVague: "Zrozumiałem, że chcesz pomocy SignalBoost, ale prośba wymaga jeszcze jednego szczegółu. Użyję bezpiecznego domyślnego i będę kontynuować.",
    understoodRouted: (m, mods) => `Zrozumiałem to jako: „${m}”. Skierowałem przez ${mods}.`,
    answerPricing: "SignalBoost może ustalać ceny według dostępu do modułów, głębokości automatyzacji i zakresu Concierge. Jeśli chcesz, mogę porównać najlepszy pakiet dla wzrostu marketplace względem operacji wewnętrznych.",
    answerHowWhat: "Oto praktyczna odpowiedź: SignalBoost działa najlepiej, gdy Concierge najpierw doprecyzowuje cel, a następnie kieruje każdą akcję do modułu SaaS, który może ją wykonać. Dzięki temu rozmowa pozostaje użyteczna, nawet gdy brakuje jednej integracji.",
    answerModuleJoin: (parts) => parts,
    answerDefault: "Mogę pomóc w ogólnych pytaniach i przepływach SignalBoost. Podaj cel, a będę go doprecyzowywać, aż pojawi się konkretny następny krok.",
    nextStepsConfirm: "Potwierdź lub edytuj zrozumiany cel.",
    nextStepsChooseAction: "Wybierz akcję modułu.",
    nextStepsContinue: "Kontynuuj doprecyzowywanie, aż zadanie zostanie ukończone.",
    clarification: "Jaki wynik, odbiorców lub termin mam zoptymalizować?",
  },
  ru: {
    options: [
      "Подтвердите этот план и выполните следующее действие.",
      "Уточните контекст, аудиторию, даты или цели.",
      "Смените модуль, если этим должен заняться другой процесс.",
    ],
    dateHints: { tomorrow: "завтра", today: "сегодня", nextWeek: "на следующей неделе", nextSlot: "ближайшее доступное время" },
    summaries: {
      conciergeMatched: (mods) => `Я сопоставил ваш запрос с ${mods} и подготовил маршрутизацию между модулями.`,
      conciergeGeneral: "Я могу отвечать на общие вопросы, уточнять неоднозначные запросы и направлять работу в модули SignalBoost.",
      promoteGeo: "Продвижение может запускать гео-зависимые предложения, размещения партнёров и маршрутизацию локальных кампаний через signalboost-live.",
      promoteDefault: "Продвижение может превратить намерение маркетплейса в брифы кампаний, карточки предложений и измеримые пути привлечения.",
      calendar: (d) => `Календарь может подготовить доступность, напоминания и передачи на ${d}, ожидая окончательного подтверждения.`,
      reviews: "Отзывы могут собирать обратную связь, классифицировать тональность и составлять безопасные для бренда ответы.",
      spreadsheetsImport: "Таблицы могут проверять импортированные строки, нормализовать столбцы и создавать защищённую рабочую таблицу.",
      spreadsheetsDefault: "Таблицы могут превращать операционные данные в прогнозы, проверки аномалий и сводки для руководства.",
      outreach: "Охват может собирать лиды, персонализировать первое сообщение и планировать повторные касания, не теряя задачу.",
    },
    actions: {
      concierge: ["Резюмировать понятое", "Предложить варианты перед действием", "Продолжить с безопасными значениями по умолчанию при нехватке деталей"],
      promote: ["Открыть маршрутизатор кампаний", "Создать карточку предложения", "Подключить отслеживание UTM и конверсий партнёров"],
      calendar: ["Составить окно бронирования", "Проверить конфликты", "Подготовить последовательность напоминаний"],
      reviews: ["Открыть входящие отзывы", "Отметить негативную тональность", "Составить варианты ответов"],
      spreadsheets: ["Создать умную таблицу", "Проверить схему", "Сформировать снимок прогноза"],
      outreach: ["Сегментировать очередь лидов", "Составить email-последовательность", "Запланировать время повторных касаний"],
    },
    dataValues: { reviewsSentiment: "положительная, с двумя пунктами для контроля" },
    demo: {
      concierge: { summary: "Резервный режим Concierge активен с подсказками для уточнения, безопасными значениями по умолчанию и общими умными ответами.", actions: ["Переформулировать цель", "Предложить варианты подтверждения", "Продолжить с безопасным значением по умолчанию"] },
      promote: { summary: "Резервный режим Продвижения активен с примерами брифов кампаний, карточками предложений и проверками UTM.", actions: ["Создать демо-кампанию", "Создать карточку предложения", "Проверить маршрутизацию UTM"] },
      calendar: { summary: "Резервный режим Календаря активен с демо-доступностью и последовательностью напоминаний.", actions: ["Использовать демо-доступность", "Подготовить проверку конфликтов", "Составить напоминания"] },
      reviews: { summary: "Резервный режим Отзывов активен с примером тональности, ожидающими ответами и составлением ответов.", actions: ["Просмотреть пример тональности", "Составить варианты ответов", "Эскалировать пункты для контроля"] },
      spreadsheets: { summary: "Резервный режим Таблиц активен с демо-строками, защитой схемы и снимками прогнозов.", actions: ["Создать демо-таблицу", "Проверить столбцы", "Сформировать снимок прогноза"] },
      outreach: { summary: "Резервный режим Охвата активен с примерами очередей лидов и последовательностями повторных касаний.", actions: ["Сегментировать демо-лиды", "Составить первое письмо", "Запланировать повторные касания"] },
    },
    understoodVague: "Я понял, что вам нужна помощь SignalBoost, но запросу не хватает одной детали. Я использую безопасное значение по умолчанию и продолжу.",
    understoodRouted: (m, mods) => `Я понял это так: «${m}». Я направил это через ${mods}.`,
    answerPricing: "SignalBoost может формировать цену по доступу к модулям, глубине автоматизации и охвату Concierge. Если хотите, я сравню лучший пакет для роста маркетплейса и для внутренних операций.",
    answerHowWhat: "Вот практический ответ: SignalBoost работает лучше всего, когда Concierge сначала уточняет цель, а затем направляет каждое действие в SaaS-модуль, который может его выполнить. Это сохраняет пользу беседы даже при отсутствии одной интеграции.",
    answerModuleJoin: (parts) => parts,
    answerDefault: "Я могу помочь с общими вопросами и процессами SignalBoost. Поделитесь целью, и я буду уточнять её, пока не появится конкретный следующий шаг.",
    nextStepsConfirm: "Подтвердите или измените понятую цель.",
    nextStepsChooseAction: "Выберите действие модуля.",
    nextStepsContinue: "Продолжайте уточнять, пока задача не будет выполнена.",
    clarification: "Какой результат, аудиторию или срок мне оптимизировать?",
  },
};

const DEFAULT_OPTIONS = STRINGS.en.options;

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

function extractDateHint(message: string, lang: Lang) {
  const text = normalize(message);
  const h = STRINGS[lang].dateHints;
  if (includesTerm(text, "tomorrow")) return h.tomorrow;
  if (includesTerm(text, "today")) return h.today;
  if (includesTerm(text, "next week")) return h.nextWeek;
  const iso = message.match(/\b\d{4}-\d{2}-\d{2}\b/);
  return iso?.[0] || h.nextSlot;
}

function success(module: OrchestrationModule, summary: string, actions: string[], data: ModuleResult["data"]): ModuleResult {
  return { module, label: MODULE_LABELS[module], status: "ok", summary, actions, data };
}

function fallbackResult(module: OrchestrationModule, summary: string, actions: string[], data: ModuleResult["data"]): ModuleResult {
  return { module, label: MODULE_LABELS[module], status: "fallback", summary, actions, data };
}

const handlers: Record<OrchestrationModule, ModuleHandler> = {
  concierge(message, lang) {
    const s = STRINGS[lang];
    const text = normalize(message);
    const known = saasModules.map((item) => item.slug).filter((slug) => includesTerm(text, slug));
    return success(
      "concierge",
      known.length ? s.summaries.conciergeMatched(known.join(", ")) : s.summaries.conciergeGeneral,
      s.actions.concierge,
      { mode: "persistent", matchedSaasModules: known }
    );
  },
  promote(message, lang) {
    const s = STRINGS[lang];
    const text = normalize(message);
    const regionFocus = ["mexico", "mx", "latam", "local", "geo"].some((term) => includesTerm(text, term));
    return success(
      "promote",
      regionFocus ? s.summaries.promoteGeo : s.summaries.promoteDefault,
      s.actions.promote,
      { liveBackend: "signalboost-live", regionFocus, campaignLift: "+24%" }
    );
  },
  calendar(message, lang) {
    const s = STRINGS[lang];
    const dateHint = extractDateHint(message, lang);
    return success(
      "calendar",
      s.summaries.calendar(dateHint),
      s.actions.calendar,
      { dateHint, demoSlots: ["09:30", "13:00", "16:30"] }
    );
  },
  reviews(_message, lang) {
    const s = STRINGS[lang];
    return success(
      "reviews",
      s.summaries.reviews,
      s.actions.reviews,
      { averageRating: 4.8, pendingResponses: 6, sentiment: s.dataValues.reviewsSentiment }
    );
  },
  spreadsheets(message, lang) {
    const s = STRINGS[lang];
    const text = normalize(message);
    const needsImport = ["csv", "import", "upload", "rows"].some((term) => includesTerm(text, term));
    return success(
      "spreadsheets",
      needsImport ? s.summaries.spreadsheetsImport : s.summaries.spreadsheetsDefault,
      s.actions.spreadsheets,
      { rowsReady: needsImport ? 250 : 18, schemaGuard: true, forecastDelta: "+17%" }
    );
  },
  outreach(_message, lang) {
    const s = STRINGS[lang];
    return success(
      "outreach",
      s.summaries.outreach,
      s.actions.outreach,
      { replyRate: "31%", queuedLeads: 42, followUps: 3 }
    );
  },
};

function demoFallback(module: OrchestrationModule, lang: Lang): ModuleResult {
  const base = STRINGS[lang].demo[module];
  // Keep representative demo data values (numeric/identifier) per module.
  const dataByModule: Record<OrchestrationModule, ModuleResult["data"]> = {
    concierge: { source: "demo", mode: "persistent" },
    promote: { source: "demo", campaignLift: "+24%", liveBackend: "signalboost-live" },
    calendar: { source: "demo", demoSlots: ["09:30", "13:00", "16:30"] },
    reviews: { source: "demo", averageRating: 4.8, pendingResponses: 6 },
    spreadsheets: { source: "demo", rowsReady: 18, schemaGuard: true },
    outreach: { source: "demo", queuedLeads: 42, followUps: 3 },
  };
  return fallbackResult(module, base.summary, base.actions, dataByModule[module]);
}

function isVague(message: string) {
  const words = normalize(message).split(" ").filter(Boolean);
  return words.length > 0 && words.length < 4;
}

function smartGeneralAnswer(message: string, modules: ModuleResult[], lang: Lang) {
  const s = STRINGS[lang];
  const text = normalize(message);
  if (text.includes("price") || text.includes("pricing")) {
    return s.answerPricing;
  }
  if (text.startsWith("how") || text.startsWith("what") || text.startsWith("why")) {
    return s.answerHowWhat;
  }
  const moduleSummary = modules.map((item) => `${item.label}: ${item.summary}`).join(" ");
  return moduleSummary ? s.answerModuleJoin(moduleSummary) : s.answerDefault;
}

export async function orchestrate(request: OrchestrationRequest): Promise<OrchestrationResponse> {
  const lang = asLang(request.lang);
  const s = STRINGS[lang];
  const message = request.message.trim();
  const fallbackMessage = message || "Help me choose the next SignalBoost action.";
  const activeModules = detectModules(fallbackMessage, request.module);

  const moduleResults = activeModules.map((module) => {
    try {
      return handlers[module](fallbackMessage, lang);
    } catch {
      return demoFallback(module, lang);
    }
  });

  const vague = !message || isVague(message);
  const fallbackApplied = moduleResults.some((module) => module.status === "fallback") || !message;

  // Real AI answer (falls back to the canned summary if AI is unavailable).
  const ai = vague ? null : await aiAnswer(message, activeModules, request.history || [], lang);
  const answer = ai || smartGeneralAnswer(fallbackMessage, moduleResults, lang);

  // If the AI genuinely answered, this is a real completion — not a demo fallback.
  const status: OrchestrationStatus = vague
    ? "needs_clarification"
    : ai
      ? "completed"
      : fallbackApplied
        ? "demo_fallback"
        : "completed";
  const understood = vague
    ? s.understoodVague
    : s.understoodRouted(message, activeModules.map((module) => MODULE_LABELS[module]).join(", "));

  return {
    understood,
    status,
    answer,
    activeModules,
    modules: moduleResults,
    options: s.options,
    nextSteps: [
      s.nextStepsConfirm,
      moduleResults[0]?.actions[0] || s.nextStepsChooseAction,
      s.nextStepsContinue,
    ],
    persistence: {
      shouldContinue: true,
      fallbackApplied: ai ? false : fallbackApplied,
      clarificationQuestion: vague ? s.clarification : undefined,
    },
  };
}

export function getModuleSnapshot(module: OrchestrationModule, lang?: string): ModuleResult {
  const l = asLang(lang);
  if (!handlers[module]) return demoFallback("concierge", l);
  return handlers[module](`Open ${MODULE_LABELS[module]}`, l);
}

export function isOrchestrationModule(value: string): value is OrchestrationModule {
  return Object.prototype.hasOwnProperty.call(MODULE_LABELS, value);
}
