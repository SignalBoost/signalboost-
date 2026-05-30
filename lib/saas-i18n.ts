export type SignalBoostLocale = "en" | "es" | "pt" | "pl" | "ru";

export const signalBoostLocales: SignalBoostLocale[] = ["en", "es", "pt", "pl", "ru"];

export const localeMeta: Record<SignalBoostLocale, { label: string; flag: string; dateLocale: string; currency: string; dir: "ltr" }> = {
  en: { label: "English", flag: "🇺🇸", dateLocale: "en-US", currency: "USD", dir: "ltr" },
  es: { label: "Español", flag: "🇪🇸", dateLocale: "es-ES", currency: "EUR", dir: "ltr" },
  pt: { label: "Português", flag: "🇧🇷", dateLocale: "pt-BR", currency: "BRL", dir: "ltr" },
  pl: { label: "Polski", flag: "🇵🇱", dateLocale: "pl-PL", currency: "PLN", dir: "ltr" },
  ru: { label: "Русский", flag: "🇷🇺", dateLocale: "ru-RU", currency: "RUB", dir: "ltr" },
};

export const cockpitCopy: Record<SignalBoostLocale, {
  viewPricing: string;
  executiveDashboard: string;
  missionSignal: string;
  coreSystems: string;
  conciergeAutomations: string;
  conciergeTitle: string;
  conciergeBody: string;
  openAssistant: string;
  adminTelemetry: string;
  outreachReady: string;
  crmReady: string;
  localeReadout: string;
}> = {
  en: {
    viewPricing: "View SaaS pricing",
    executiveDashboard: "Executive dashboard",
    missionSignal: "Mission signal",
    coreSystems: "Core systems",
    conciergeAutomations: "Concierge AI automations",
    conciergeTitle: "Connected to marketplace discovery and SaaS execution",
    conciergeBody: "SignalBoost routes buyer intent, partner data, and operational tasks through a single assistant layer so teams can move from question to action.",
    openAssistant: "Open assistant bay",
    adminTelemetry: "Admin Console telemetry",
    outreachReady: "Outreach trigger armed",
    crmReady: "CRM pipeline sync",
    localeReadout: "Locale readout",
  },
  es: {
    viewPricing: "Ver precios SaaS",
    executiveDashboard: "Panel ejecutivo",
    missionSignal: "Señal de misión",
    coreSystems: "Sistemas principales",
    conciergeAutomations: "Automatizaciones de Concierge AI",
    conciergeTitle: "Conectado al marketplace y a la ejecución SaaS",
    conciergeBody: "SignalBoost enruta la intención de compra, datos de socios y tareas operativas mediante un asistente único para pasar de pregunta a acción.",
    openAssistant: "Abrir bahía del asistente",
    adminTelemetry: "Telemetría de administración",
    outreachReady: "Activador de alcance armado",
    crmReady: "Sincronización CRM",
    localeReadout: "Lectura regional",
  },
  pt: {
    viewPricing: "Ver preços SaaS",
    executiveDashboard: "Painel executivo",
    missionSignal: "Sinal da missão",
    coreSystems: "Sistemas centrais",
    conciergeAutomations: "Automações do Concierge AI",
    conciergeTitle: "Conectado à descoberta do marketplace e à execução SaaS",
    conciergeBody: "O SignalBoost roteia intenção de compra, dados de parceiros e tarefas operacionais em uma camada única de assistente para transformar perguntas em ações.",
    openAssistant: "Abrir baia do assistente",
    adminTelemetry: "Telemetria do Admin Console",
    outreachReady: "Gatilho de alcance armado",
    crmReady: "Sincronização do CRM",
    localeReadout: "Leitura regional",
  },
  pl: {
    viewPricing: "Zobacz ceny SaaS",
    executiveDashboard: "Panel zarządczy",
    missionSignal: "Sygnał misji",
    coreSystems: "Systemy główne",
    conciergeAutomations: "Automatyzacje Concierge AI",
    conciergeTitle: "Połączone odkrywanie marketplace i realizacja SaaS",
    conciergeBody: "SignalBoost kieruje intencje kupujących, dane partnerów i zadania operacyjne przez jedną warstwę asystenta, aby zespoły przechodziły od pytań do działań.",
    openAssistant: "Otwórz asystenta",
    adminTelemetry: "Telemetria administratora",
    outreachReady: "Wyzwalacz kampanii gotowy",
    crmReady: "Synchronizacja CRM",
    localeReadout: "Odczyt lokalizacji",
  },
  ru: {
    viewPricing: "Посмотреть цены SaaS",
    executiveDashboard: "Панель руководителя",
    missionSignal: "Сигнал миссии",
    coreSystems: "Ключевые системы",
    conciergeAutomations: "Автоматизации Concierge AI",
    conciergeTitle: "Связь marketplace и выполнения SaaS",
    conciergeBody: "SignalBoost направляет намерения покупателей, данные партнёров и операционные задачи через единый слой ассистента, чтобы команды переходили от вопроса к действию.",
    openAssistant: "Открыть ассистента",
    adminTelemetry: "Телеметрия админ-панели",
    outreachReady: "Триггер рассылки готов",
    crmReady: "Синхронизация CRM",
    localeReadout: "Локальный формат",
  },
};

type LocalizedModule = {
  title: string;
  eyebrow: string;
  summary: string;
  features: string[];
  automations: string[];
  panels: { title: string; value: string; detail: string }[];
};

export const localizedModules: Record<string, Record<SignalBoostLocale, LocalizedModule>> = {
  promote: {
    en: { title: "Promote Business", eyebrow: "Acquisition bay", summary: "Build campaigns, launch geo-aware offers, and watch conversion analytics in one cockpit.", features: ["Campaign builder", "Audience analytics", "Partner offer routing"], automations: ["Concierge suggests offers", "Admin usage telemetry", "CRM lead scoring"], panels: [{ title: "Reach", value: "+24%", detail: "intent lift" }, { title: "Conversions", value: "1.8K", detail: "tracked actions" }, { title: "Campaigns", value: "42", detail: "active sequences" }] },
    es: { title: "Promocionar negocio", eyebrow: "Bahía de adquisición", summary: "Crea campañas, lanza ofertas geolocalizadas y observa analíticas de conversión en un cockpit.", features: ["Constructor de campañas", "Analítica de audiencia", "Rutas de ofertas de socios"], automations: ["Concierge sugiere ofertas", "Telemetría de administración", "Puntuación de leads CRM"], panels: [{ title: "Alcance", value: "+24%", detail: "aumento de intención" }, { title: "Conversiones", value: "1,8 mil", detail: "acciones rastreadas" }, { title: "Campañas", value: "42", detail: "secuencias activas" }] },
    pt: { title: "Promover negócio", eyebrow: "Baia de aquisição", summary: "Crie campanhas, publique ofertas geolocalizadas e acompanhe conversões em um cockpit.", features: ["Construtor de campanhas", "Análise de audiência", "Roteamento de ofertas"], automations: ["Concierge sugere ofertas", "Telemetria administrativa", "Pontuação de leads CRM"], panels: [{ title: "Alcance", value: "+24%", detail: "aumento de intenção" }, { title: "Conversões", value: "1,8 mil", detail: "ações rastreadas" }, { title: "Campanhas", value: "42", detail: "sequências ativas" }] },
    pl: { title: "Promuj firmę", eyebrow: "Zatoka akwizycji", summary: "Buduj kampanie, uruchamiaj oferty regionalne i obserwuj konwersje w jednym kokpicie.", features: ["Kreator kampanii", "Analityka odbiorców", "Routing ofert partnerów"], automations: ["Concierge sugeruje oferty", "Telemetria administracyjna", "Scoring leadów CRM"], panels: [{ title: "Zasięg", value: "+24%", detail: "wzrost intencji" }, { title: "Konwersje", value: "1,8 tys.", detail: "śledzone akcje" }, { title: "Kampanie", value: "42", detail: "aktywne sekwencje" }] },
    ru: { title: "Продвижение бизнеса", eyebrow: "Отсек привлечения", summary: "Создавайте кампании, запускайте гео-оферы и отслеживайте конверсии в одном кокпите.", features: ["Конструктор кампаний", "Аналитика аудитории", "Маршрутизация оферов"], automations: ["Concierge предлагает оферы", "Админ-телеметрия", "CRM-оценка лидов"], panels: [{ title: "Охват", value: "+24%", detail: "рост намерения" }, { title: "Конверсии", value: "1,8 тыс.", detail: "отслеженных действий" }, { title: "Кампании", value: "42", detail: "активные цепочки" }] },
  },
  reviews: {
    en: { title: "Reviews", eyebrow: "Trust telemetry", summary: "Collect reviews, analyze sentiment, moderate risk, and turn positive feedback into campaigns.", features: ["1–5 star submission", "Locale-aware review inbox", "Verified partner highlights"], automations: ["Positive / Neutral / Negative tags", "Concierge moderation suggestions", "Testimonial campaign triggers"], panels: [{ title: "Average rating", value: "4.8", detail: "verified pulse" }, { title: "Locale volume", value: "5", detail: "languages tracked" }, { title: "Queue", value: "12", detail: "needs approval" }] },
    es: { title: "Reseñas", eyebrow: "Telemetría de confianza", summary: "Recopila reseñas, analiza sentimiento, modera riesgos y convierte comentarios positivos en campañas.", features: ["Envío de 1–5 estrellas", "Bandeja regional", "Socios verificados destacados"], automations: ["Etiquetas Positivo / Neutral / Negativo", "Sugerencias de moderación", "Campañas testimoniales"], panels: [{ title: "Calificación media", value: "4,8", detail: "pulso verificado" }, { title: "Volumen local", value: "5", detail: "idiomas rastreados" }, { title: "Cola", value: "12", detail: "requiere aprobación" }] },
    pt: { title: "Avaliações", eyebrow: "Telemetria de confiança", summary: "Colete avaliações, analise sentimento, modere riscos e transforme elogios em campanhas.", features: ["Envio com 1–5 estrelas", "Caixa por localidade", "Parceiros verificados em destaque"], automations: ["Tags Positivo / Neutro / Negativo", "Sugestões de moderação", "Campanhas de depoimentos"], panels: [{ title: "Nota média", value: "4,8", detail: "pulso verificado" }, { title: "Volume local", value: "5", detail: "idiomas monitorados" }, { title: "Fila", value: "12", detail: "precisa aprovação" }] },
    pl: { title: "Opinie", eyebrow: "Telemetria zaufania", summary: "Zbieraj opinie, analizuj sentyment, moderuj ryzyka i zamieniaj pozytywne głosy w kampanie.", features: ["Oceny 1–5 gwiazdek", "Skrzynka wg lokalizacji", "Wyróżnienie zweryfikowanych partnerów"], automations: ["Tagi Pozytywne / Neutralne / Negatywne", "Sugestie moderacji", "Kampanie testimoniali"], panels: [{ title: "Średnia ocena", value: "4,8", detail: "zweryfikowany puls" }, { title: "Wolumen lokalny", value: "5", detail: "śledzone języki" }, { title: "Kolejka", value: "12", detail: "wymaga akceptacji" }] },
    ru: { title: "Отзывы", eyebrow: "Телеметрия доверия", summary: "Собирайте отзывы, анализируйте тональность, модерируйте риски и превращайте позитив в кампании.", features: ["Оценки 1–5 звёзд", "Локализованная лента", "Выделение проверенных партнёров"], automations: ["Теги Позитив / Нейтрально / Негатив", "Советы модерации", "Кампании отзывов"], panels: [{ title: "Средняя оценка", value: "4,8", detail: "проверенный пульс" }, { title: "Локальный объём", value: "5", detail: "языков отслеживается" }, { title: "Очередь", value: "12", detail: "требует одобрения" }] },
  },
  calendar: {
    en: { title: "Calendar", eyebrow: "Mission scheduling", summary: "Coordinate bookings, launch windows, reminders, and follow-ups with locale-aware dates.", features: ["Monthly cockpit grid", "Event creation modal", "Reminder timeline"], automations: ["Conflict detection", "Concierge rescheduling", "Admin usage logs"], panels: [{ title: "Slot health", value: "92%", detail: "availability mesh" }, { title: "Reminders", value: "38", detail: "armed this week" }, { title: "Locales", value: "5", detail: "date formats" }] },
    es: { title: "Calendario", eyebrow: "Programación de misión", summary: "Coordina reservas, lanzamientos, recordatorios y seguimientos con fechas regionales.", features: ["Vista mensual", "Modal de evento", "Línea de recordatorios"], automations: ["Detección de conflictos", "Reprogramación Concierge", "Logs de uso"], panels: [{ title: "Salud de horarios", value: "92%", detail: "malla disponible" }, { title: "Recordatorios", value: "38", detail: "armados esta semana" }, { title: "Idiomas", value: "5", detail: "formatos de fecha" }] },
    pt: { title: "Calendário", eyebrow: "Agendamento da missão", summary: "Coordene reservas, lançamentos, lembretes e follow-ups com datas locais.", features: ["Grade mensal", "Modal de evento", "Linha de lembretes"], automations: ["Detecção de conflito", "Reagendamento Concierge", "Logs de uso"], panels: [{ title: "Saúde de slots", value: "92%", detail: "malha disponível" }, { title: "Lembretes", value: "38", detail: "armados na semana" }, { title: "Idiomas", value: "5", detail: "formatos de data" }] },
    pl: { title: "Kalendarz", eyebrow: "Planowanie misji", summary: "Koordynuj rezerwacje, okna startu, przypomnienia i follow-upy z lokalnymi datami.", features: ["Siatka miesięczna", "Modal wydarzenia", "Oś przypomnień"], automations: ["Wykrywanie konfliktów", "Przeplanowanie Concierge", "Logi użycia"], panels: [{ title: "Zdrowie slotów", value: "92%", detail: "siatka dostępności" }, { title: "Przypomnienia", value: "38", detail: "uzbrojone w tygodniu" }, { title: "Języki", value: "5", detail: "formatów dat" }] },
    ru: { title: "Календарь", eyebrow: "Планирование миссии", summary: "Координируйте брони, запуски, напоминания и follow-up с локальными датами.", features: ["Месячная сетка", "Модальное событие", "Лента напоминаний"], automations: ["Поиск конфликтов", "Перепланирование Concierge", "Логи использования"], panels: [{ title: "Здоровье слотов", value: "92%", detail: "сетка доступности" }, { title: "Напоминания", value: "38", detail: "готово на неделю" }, { title: "Языки", value: "5", detail: "форматов дат" }] },
  },
  spreadsheets: {
    en: { title: "Spreadsheets", eyebrow: "Data operations", summary: "Collaborative tables for partner data, budgets, inventory, forecasts, and controlled sharing.", features: ["Live table grid", "Sharing panel", "Activity feed"], automations: ["Schema guard", "CSV cleanup", "Forecast snapshots"], panels: [{ title: "Live sheets", value: "18", detail: "validated" }, { title: "Collaborators", value: "64", detail: "with scoped access" }, { title: "Anomalies", value: "3", detail: "needs review" }] },
    es: { title: "Hojas de cálculo", eyebrow: "Operaciones de datos", summary: "Tablas colaborativas para socios, presupuestos, inventario, pronósticos y uso compartido controlado.", features: ["Cuadrícula en vivo", "Panel de compartir", "Actividad"], automations: ["Guardia de esquema", "Limpieza CSV", "Snapshots de pronóstico"], panels: [{ title: "Hojas activas", value: "18", detail: "validadas" }, { title: "Colaboradores", value: "64", detail: "acceso limitado" }, { title: "Anomalías", value: "3", detail: "requieren revisión" }] },
    pt: { title: "Planilhas", eyebrow: "Operações de dados", summary: "Tabelas colaborativas para parceiros, orçamento, inventário, previsões e compartilhamento controlado.", features: ["Grade ao vivo", "Painel de compartilhamento", "Feed de atividade"], automations: ["Guarda de esquema", "Limpeza CSV", "Snapshots de previsão"], panels: [{ title: "Planilhas ativas", value: "18", detail: "validadas" }, { title: "Colaboradores", value: "64", detail: "acesso escopado" }, { title: "Anomalias", value: "3", detail: "precisam revisão" }] },
    pl: { title: "Arkusze kalkulacyjne", eyebrow: "Operacje danych", summary: "Wspólne tabele dla danych partnerów, budżetów, zapasów, prognoz i kontrolowanego udostępniania.", features: ["Siatka live", "Panel udostępniania", "Kanał aktywności"], automations: ["Ochrona schematu", "Czyszczenie CSV", "Migawki prognoz"], panels: [{ title: "Aktywne arkusze", value: "18", detail: "zwalidowane" }, { title: "Współpracownicy", value: "64", detail: "zakresowy dostęp" }, { title: "Anomalie", value: "3", detail: "do przeglądu" }] },
    ru: { title: "Таблицы", eyebrow: "Операции с данными", summary: "Совместные таблицы для партнёров, бюджетов, запасов, прогнозов и управляемого доступа.", features: ["Живая сетка", "Панель доступа", "Лента активности"], automations: ["Защита схемы", "Очистка CSV", "Снимки прогнозов"], panels: [{ title: "Активные таблицы", value: "18", detail: "проверены" }, { title: "Участники", value: "64", detail: "с ограниченным доступом" }, { title: "Аномалии", value: "3", detail: "на проверке" }] },
  },
  outreach: {
    en: { title: "Outreach", eyebrow: "Signal transmission", summary: "Launch email, social, partner, and promotion campaigns from one communication hub.", features: ["Campaign launch card", "Success rate chart", "Partner/customer hub"], automations: ["Concierge recommendations", "CRM enrichment", "Revenue impact logging"], panels: [{ title: "Reply rate", value: "31%", detail: "deliverability nominal" }, { title: "Pipeline", value: "742", detail: "qualified contacts" }, { title: "Revenue", value: "$42K", detail: "influenced" }] },
    es: { title: "Alcance", eyebrow: "Transmisión de señales", summary: "Lanza campañas de email, social, socios y promociones desde un hub de comunicación.", features: ["Tarjeta de lanzamiento", "Gráfico de éxito", "Hub socio/cliente"], automations: ["Recomendaciones Concierge", "Enriquecimiento CRM", "Registro de ingresos"], panels: [{ title: "Respuesta", value: "31%", detail: "entregabilidad nominal" }, { title: "Pipeline", value: "742", detail: "contactos calificados" }, { title: "Ingresos", value: "42 mil US$", detail: "influenciados" }] },
    pt: { title: "Alcance", eyebrow: "Transmissão de sinais", summary: "Lance campanhas de e-mail, social, parceiros e promoções em um hub de comunicação.", features: ["Cartão de lançamento", "Gráfico de sucesso", "Hub parceiro/cliente"], automations: ["Recomendações Concierge", "Enriquecimento CRM", "Log de receita"], panels: [{ title: "Resposta", value: "31%", detail: "entrega nominal" }, { title: "Pipeline", value: "742", detail: "contatos qualificados" }, { title: "Receita", value: "US$ 42 mil", detail: "influenciada" }] },
    pl: { title: "Zasięg", eyebrow: "Transmisja sygnału", summary: "Uruchamiaj kampanie e-mail, social, partnerskie i promocyjne z jednego hubu.", features: ["Karta startu", "Wykres skuteczności", "Hub partner/klient"], automations: ["Rekomendacje Concierge", "Wzbogacanie CRM", "Log wpływu przychodu"], panels: [{ title: "Odpowiedzi", value: "31%", detail: "dostarczalność nominalna" }, { title: "Pipeline", value: "742", detail: "kwalifikowane kontakty" }, { title: "Przychód", value: "42 tys. USD", detail: "wpływ" }] },
    ru: { title: "Охват", eyebrow: "Передача сигнала", summary: "Запускайте email, social, партнёрские и промо-кампании из одного коммуникационного хаба.", features: ["Карта запуска", "График успеха", "Хаб партнёров/клиентов"], automations: ["Рекомендации Concierge", "Обогащение CRM", "Лог влияния дохода"], panels: [{ title: "Ответы", value: "31%", detail: "доставка в норме" }, { title: "Pipeline", value: "742", detail: "контактов" }, { title: "Доход", value: "42 тыс. $", detail: "под влиянием" }] },
  },
  assistant: {
    en: { title: "Personal Assistant", eyebrow: "Concierge AI core", summary: "AI task manager for reminders, productivity insights, marketplace discovery, and SaaS operations.", features: ["Task list", "Reminder timeline", "Productivity insights"], automations: ["Next-best action", "Meeting prep", "Cross-module memory"], panels: [{ title: "Tasks", value: "27", detail: "prioritized" }, { title: "Reminders", value: "14", detail: "time-zone aware" }, { title: "Insights", value: "9", detail: "ready now" }] },
    es: { title: "Asistente personal", eyebrow: "Núcleo Concierge AI", summary: "Gestor de tareas con IA para recordatorios, productividad, marketplace y operaciones SaaS.", features: ["Lista de tareas", "Línea de recordatorios", "Ideas de productividad"], automations: ["Siguiente mejor acción", "Preparación de reuniones", "Memoria entre módulos"], panels: [{ title: "Tareas", value: "27", detail: "priorizadas" }, { title: "Recordatorios", value: "14", detail: "con zona horaria" }, { title: "Insights", value: "9", detail: "listos" }] },
    pt: { title: "Assistente pessoal", eyebrow: "Núcleo Concierge AI", summary: "Gerenciador de tarefas com IA para lembretes, produtividade, marketplace e operações SaaS.", features: ["Lista de tarefas", "Linha de lembretes", "Insights de produtividade"], automations: ["Próxima melhor ação", "Preparação de reuniões", "Memória entre módulos"], panels: [{ title: "Tarefas", value: "27", detail: "priorizadas" }, { title: "Lembretes", value: "14", detail: "com fuso horário" }, { title: "Insights", value: "9", detail: "prontos" }] },
    pl: { title: "Osobisty asystent", eyebrow: "Rdzeń Concierge AI", summary: "Menedżer zadań AI dla przypomnień, produktywności, marketplace i operacji SaaS.", features: ["Lista zadań", "Oś przypomnień", "Wnioski produktywności"], automations: ["Najlepsze następne działanie", "Przygotowanie spotkań", "Pamięć między modułami"], panels: [{ title: "Zadania", value: "27", detail: "priorytety" }, { title: "Przypomnienia", value: "14", detail: "wg stref czasu" }, { title: "Wnioski", value: "9", detail: "gotowe" }] },
    ru: { title: "Личный помощник", eyebrow: "Ядро Concierge AI", summary: "AI-менеджер задач для напоминаний, продуктивности, marketplace и SaaS-операций.", features: ["Список задач", "Лента напоминаний", "Инсайты продуктивности"], automations: ["Лучшее следующее действие", "Подготовка встреч", "Память между модулями"], panels: [{ title: "Задачи", value: "27", detail: "в приоритете" }, { title: "Напоминания", value: "14", detail: "с часовыми поясами" }, { title: "Инсайты", value: "9", detail: "готовы" }] },
  },
};

export const pricingModules = [
  { slug: "website", href: "/promote", price: 29, key: "Website Optimization" },
  { slug: "podcast", href: "/outreach", price: 19, key: "Podcast Studio Optimization" },
  { slug: "reviews", href: "/reviews", price: 15, key: "Reviews Module" },
  { slug: "calendar", href: "/calendar", price: 10, key: "Calendar Module" },
  { slug: "spreadsheets", href: "/spreadsheets", price: 12, key: "Spreadsheets Module" },
  { slug: "outreach", href: "/outreach", price: 20, key: "Outreach Module" },
  { slug: "assistant", href: "/assistant", price: 25, key: "Personal Assistant" },
];

export const pricingCopy: Record<SignalBoostLocale, { eyebrow: string; title: string; subtitle: string; perMonth: string; cta: string; included: string; recommended: string; names: Record<string, string>; features: Record<string, string[]> }> = {
  en: { eyebrow: "Tiered SaaS modules", title: "Pricing cockpit", subtitle: "Choose individual SignalBoost modules or assemble a complete marketplace + SaaS operating stack.", perMonth: "/month", cta: "Open module", included: "Telemetry included", recommended: "Most requested", names: {}, features: {} },
  es: { eyebrow: "Módulos SaaS por niveles", title: "Cockpit de precios", subtitle: "Elige módulos individuales de SignalBoost o arma una pila completa de marketplace + SaaS.", perMonth: "/mes", cta: "Abrir módulo", included: "Telemetría incluida", recommended: "Más solicitado", names: {}, features: {} },
  pt: { eyebrow: "Módulos SaaS por nível", title: "Cockpit de preços", subtitle: "Escolha módulos individuais do SignalBoost ou monte uma operação completa marketplace + SaaS.", perMonth: "/mês", cta: "Abrir módulo", included: "Telemetria incluída", recommended: "Mais solicitado", names: {}, features: {} },
  pl: { eyebrow: "Moduły SaaS w poziomach", title: "Kokpit cen", subtitle: "Wybierz moduły SignalBoost osobno albo zbuduj pełny stos marketplace + SaaS.", perMonth: "/miesiąc", cta: "Otwórz moduł", included: "Telemetria w cenie", recommended: "Najczęściej wybierane", names: {}, features: {} },
  ru: { eyebrow: "Модули SaaS по уровням", title: "Кокпит цен", subtitle: "Выбирайте отдельные модули SignalBoost или соберите полный стек marketplace + SaaS.", perMonth: "/месяц", cta: "Открыть модуль", included: "Телеметрия включена", recommended: "Чаще выбирают", names: {}, features: {} },
};

const moduleNames: Record<SignalBoostLocale, string[]> = {
  en: ["Website Optimization", "Podcast Studio Optimization", "Reviews Module", "Calendar Module", "Spreadsheets Module", "Outreach Module", "Personal Assistant"],
  es: ["Optimización web", "Optimización de podcast", "Módulo de reseñas", "Módulo de calendario", "Módulo de hojas", "Módulo de alcance", "Asistente personal"],
  pt: ["Otimização de site", "Otimização de podcast", "Módulo de avaliações", "Módulo de calendário", "Módulo de planilhas", "Módulo de alcance", "Assistente pessoal"],
  pl: ["Optymalizacja strony", "Optymalizacja podcastu", "Moduł opinii", "Moduł kalendarza", "Moduł arkuszy", "Moduł zasięgu", "Osobisty asystent"],
  ru: ["Оптимизация сайта", "Оптимизация подкаста", "Модуль отзывов", "Модуль календаря", "Модуль таблиц", "Модуль охвата", "Личный помощник"],
};

signalBoostLocales.forEach((locale) => {
  pricingCopy[locale].names = Object.fromEntries(pricingModules.map((module, index) => [module.slug, moduleNames[locale][index]]));
  pricingCopy[locale].features = Object.fromEntries(pricingModules.map((module) => [module.slug, [pricingCopy[locale].included, cockpitCopy[locale].adminTelemetry, cockpitCopy[locale].crmReady]]));
});

export function formatLocaleDate(locale: SignalBoostLocale, iso: string) {
  return new Intl.DateTimeFormat(localeMeta[locale].dateLocale, { dateStyle: "short" }).format(new Date(iso));
}

export function formatLocaleCurrency(locale: SignalBoostLocale, amount: number) {
  return new Intl.NumberFormat(localeMeta[locale].dateLocale, { style: "currency", currency: localeMeta[locale].currency }).format(amount);
}
