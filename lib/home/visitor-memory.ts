// File: lib/home/i18n-home.ts
// Phase A3 of the homepage conversion.
//
// 7-language UI tables + category/region label/grammar maps + language helpers,
// ported VERBATIM from public/index.html (port-as-is decision). Pure data.
// A unified React i18n migration can happen later; this preserves exact behavior.

export type Dict = Record<string, string>;

export const I18N: Record<string, Dict> = {
  en: { brand_name: "SignalBoost", nav_status: "Region-aware offers", explore_offers: "Explore offers", search_placeholder: "Search offers...", partners: "Partners", right_sub: "Featured for your selected region", featured_service: "Explore a featured service picked for you.", view_more: "View More", featured: "Featured", all: "All", travel: "Travel", local: "Local", more: "more partners", no_results: "No partners match your current filters.", hero_title: "Offers for {region}", hero_copy: "Browse trusted partners available in this region. Only partners available for your detected region are shown.", explore_region: "Explore region", show_all: "Show all", trending: "Trending", tier: "Tier", language_prompt_title: "Choose language", language_prompt_copy: "Select the local language or English for this region.", language_prompt_keep: "Keep local language", language_prompt_english: "English", search_results: "Results" },
  "pt-BR": { brand_name: "SignalBoost", nav_status: "Ofertas por região", explore_offers: "Explorar ofertas", search_placeholder: "Buscar ofertas...", partners: "Parceiros", right_sub: "Destaques para a região selecionada", featured_service: "Explore um serviço em destaque escolhido para você.", view_more: "Ver Mais", featured: "Destaques", all: "Todos", travel: "Viagem", local: "Local", more: "mais parceiros", no_results: "Nenhum parceiro corresponde aos filtros atuais.", hero_title: "Ofertas para {region}", hero_copy: "Veja parceiros confiáveis disponíveis nesta região. Somente parceiros disponíveis para sua região detectada são exibidos.", explore_region: "Explorar região", show_all: "Ver todos", trending: "Em alta", tier: "Nível", language_prompt_title: "Escolha o idioma", language_prompt_copy: "Selecione português ou inglês para esta região.", language_prompt_keep: "Português", language_prompt_english: "English", search_results: "Resultados" },
  es: { brand_name: "SignalBoost", nav_status: "Ofertas por región", explore_offers: "Explorar ofertas", search_placeholder: "Buscar ofertas...", partners: "Socios", right_sub: "Destacados para tu región seleccionada", featured_service: "Explora un servicio destacado elegido para ti.", view_more: "Ver más", featured: "Destacados", all: "Todos", travel: "Viajes", local: "Local", more: "socios más", no_results: "Ningún socio coincide con tus filtros.", hero_title: "Ofertas para {region}", hero_copy: "Explora socios confiables disponibles en esta región. Solo se muestran socios disponibles para tu región detectada.", explore_region: "Explorar región", show_all: "Ver todos", trending: "Tendencias", tier: "Nivel", language_prompt_title: "Elige idioma", language_prompt_copy: "Selecciona español o inglés para esta región.", language_prompt_keep: "Español", language_prompt_english: "English", search_results: "Resultados" },
  pl: { brand_name: "SignalBoost", nav_status: "Oferty według regionu", explore_offers: "Przeglądaj oferty", search_placeholder: "Szukaj ofert...", partners: "Partnerzy", right_sub: "Polecane dla wybranego regionu", featured_service: "Sprawdź wyróżnioną usługę wybraną dla Ciebie.", view_more: "Zobacz więcej", featured: "Polecane", all: "Wszystkie", travel: "Podróże", local: "Lokalne", more: "więcej partnerów", no_results: "Brak partnerów dla tych filtrów.", hero_title: "Oferty dla {region}", hero_copy: "Przeglądaj zaufanych partnerów dostępnych w tym regionie. Pokazujemy tylko partnerów dostępnych dla wykrytego regionu.", explore_region: "Przeglądaj regiony", show_all: "Pokaż wszystkie", trending: "Popularne", tier: "Poziom", language_prompt_title: "Wybierz język", language_prompt_copy: "Wybierz język lokalny lub angielski dla tego regionu.", language_prompt_keep: "Polski", language_prompt_english: "English", search_results: "Wyniki" },
  de: { brand_name: "SignalBoost", nav_status: "Regionale Angebote", explore_offers: "Angebote entdecken", search_placeholder: "Angebote suchen...", partners: "Partner", right_sub: "Empfohlen für deine erkannte Region", featured_service: "Entdecke einen ausgewählten Service für dich.", view_more: "Mehr anzeigen", featured: "Empfohlen", all: "Alle", travel: "Reisen", local: "Lokal", more: "weitere Partner", no_results: "Keine Partner entsprechen deinen aktuellen Filtern.", hero_title: "Angebote für {region}", hero_copy: "Entdecke vertrauenswürdige Partner, die in dieser Region verfügbar sind. Es werden nur Partner angezeigt, die für deine erkannte Region verfügbar sind.", explore_region: "Region entdecken", show_all: "Alle anzeigen", trending: "Beliebt", tier: "Stufe", language_prompt_title: "Sprache wählen", language_prompt_copy: "Wähle die lokale Sprache oder Englisch für diese Region.", language_prompt_keep: "Deutsch", language_prompt_english: "English", search_results: "Ergebnisse" },
  fr: { brand_name: "SignalBoost", nav_status: "Offres par région", explore_offers: "Explorer les offres", search_placeholder: "Rechercher des offres...", partners: "Partenaires", right_sub: "Sélectionnés pour votre région détectée", featured_service: "Découvrez un service sélectionné pour vous.", view_more: "Voir plus", featured: "À la une", all: "Tous", travel: "Voyage", local: "Local", more: "partenaires en plus", no_results: "Aucun partenaire ne correspond à vos filtres.", hero_title: "Offres pour {region}", hero_copy: "Découvrez les partenaires de confiance disponibles dans cette région. Seuls les partenaires disponibles pour votre région détectée sont affichés.", explore_region: "Explorer la région", show_all: "Tout afficher", trending: "Tendances", tier: "Niveau", language_prompt_title: "Choisir la langue", language_prompt_copy: "Sélectionnez la langue locale ou l’anglais pour cette région.", language_prompt_keep: "Français", language_prompt_english: "English", search_results: "Résultats" },
  it: { brand_name: "SignalBoost", nav_status: "Offerte per regione", explore_offers: "Esplora offerte", search_placeholder: "Cerca offerte...", partners: "Partner", right_sub: "In evidenza per la tua regione rilevata", featured_service: "Esplora un servizio selezionato per te.", view_more: "Vedi altro", featured: "In evidenza", all: "Tutti", travel: "Viaggi", local: "Locale", more: "altri partner", no_results: "Nessun partner corrisponde ai filtri correnti.", hero_title: "Offerte per {region}", hero_copy: "Scopri partner affidabili disponibili in questa regione. Vengono mostrati solo i partner disponibili per la tua regione rilevata.", explore_region: "Esplora regione", show_all: "Mostra tutto", trending: "Tendenze", tier: "Livello", language_prompt_title: "Scegli lingua", language_prompt_copy: "Seleziona la lingua locale o l’inglese per questa regione.", language_prompt_keep: "Italiano", language_prompt_english: "English", search_results: "Risultati" },
};

export interface CategoryMeta {
  icon: string;
  en: string;
  "pt-BR": string;
  es: string;
  pl: string;
  de?: string;
  fr?: string;
  it?: string;
}

export const CATEGORY_META: Record<string, CategoryMeta> = {
  flights: { icon: "✈️", en: "Flights", "pt-BR": "Passagens Aéreas", es: "Vuelos", pl: "Loty", de: "Flüge", fr: "Vols", it: "Voli" },
  hotels: { icon: "🏨", en: "Hotels", "pt-BR": "Hotéis", es: "Hoteles", pl: "Hotele", de: "Hotels", fr: "Hôtels", it: "Hotel" },
  car_rentals: { icon: "🚗", en: "Car Rentals", "pt-BR": "Aluguel de Carros", es: "Alquiler de Autos", pl: "Wynajem aut", de: "Mietwagen", fr: "Location de voitures", it: "Noleggio auto" },
  esim: { icon: "📶", en: "eSIM & Internet", "pt-BR": "eSIM e Internet", es: "eSIM e Internet", pl: "eSIM i Internet", de: "eSIM & Internet", fr: "eSIM et Internet", it: "eSIM e Internet" },
  insurance: { icon: "🛡️", en: "Insurance & Claims", "pt-BR": "Seguros e Reembolsos", es: "Seguros y Reembolsos", pl: "Ubezpieczenia", de: "Versicherung & Ansprüche", fr: "Assurance et réclamations", it: "Assicurazioni e rimborsi" },
  tours: { icon: "🎟️", en: "Tours & Activities", "pt-BR": "Passeios e Atividades", es: "Tours y Actividades", pl: "Wycieczki i atrakcje", de: "Touren & Aktivitäten", fr: "Visites et activités", it: "Tour e attività" },
  transfers: { icon: "🚕", en: "Transfers", "pt-BR": "Traslados", es: "Traslados", pl: "Transfery", de: "Transfers", fr: "Transferts", it: "Transfer" },
  marketplace: { icon: "🛒", en: "Marketplace", "pt-BR": "Marketplace", es: "Marketplace", pl: "Marketplace", de: "Marktplatz", fr: "Marketplace", it: "Marketplace" },
  products_tools: { icon: "🧰", en: "Products & Tools", "pt-BR": "Produtos e Ferramentas", es: "Productos y Herramientas", pl: "Produkty i narzędzia", de: "Produkte & Tools", fr: "Produits et outils", it: "Prodotti e strumenti" },
  finance: { icon: "💳", en: "Finance", "pt-BR": "Finanças", es: "Finanzas", pl: "Finanse", de: "Finanzen", fr: "Finance", it: "Finanza" },
  travel_services: { icon: "🧳", en: "Travel Services", "pt-BR": "Serviços de Viagem", es: "Servicios de Viaje", pl: "Usługi podróżne", de: "Reisedienste", fr: "Services de voyage", it: "Servizi di viaggio" },
  specialty_other: { icon: "✨", en: "Special Offers", "pt-BR": "Ofertas Especiais", es: "Ofertas Especiales", pl: "Oferty specjalne", de: "Sonderangebote", fr: "Offres spéciales", it: "Offerte speciali" },
  health_fitness: { icon: "💪", en: "Health & Fitness", "pt-BR": "Saúde e Fitness", es: "Salud y Fitness", pl: "Zdrowie i fitness", de: "Gesundheit & Fitness", fr: "Santé et fitness", it: "Salute e fitness" },
  sports_outdoors: { icon: "⛺", en: "Sports & Outdoors", "pt-BR": "Esportes e Ar Livre", es: "Deportes y Aire Libre", pl: "Sport i outdoor", de: "Sport & Outdoor", fr: "Sport et plein air", it: "Sport e outdoor" },
};

export const REGION_LABELS: Record<string, Record<string, string>> = {
  en: { ot: "Global", br: "Brazil", us: "US", uk: "UK", pl: "Poland", ru: "Russia", "es-latam": "LATAM", ca: "Canada", au: "Australia", nz: "New Zealand", de: "Germany", fr: "France", it: "Italy", ar: "Argentina", co: "Colombia", pe: "Peru" },
  "pt-BR": { ot: "Global", br: "Brasil", us: "EUA", uk: "Reino Unido", pl: "Polônia", ru: "Rússia", "es-latam": "LATAM", ca: "Canadá", au: "Austrália", nz: "Nova Zelândia", de: "Alemanha", fr: "França", it: "Itália", ar: "Argentina", co: "Colômbia", pe: "Peru" },
  es: { ot: "Global", br: "Brasil", us: "EE. UU.", uk: "Reino Unido", pl: "Polonia", ru: "Rusia", "es-latam": "LATAM", ca: "Canadá", au: "Australia", nz: "Nueva Zelanda", de: "Alemania", fr: "Francia", it: "Italia", ar: "Argentina", co: "Colombia", pe: "Perú" },
  pl: { ot: "Global", br: "Brazylia", us: "USA", uk: "UK", pl: "Polska", ru: "Rosja", "es-latam": "LATAM", ca: "Kanada", au: "Australia", nz: "Nowa Zelandia", de: "Niemcy", fr: "Francja", it: "Włochy", ar: "Argentyna", co: "Kolumbia", pe: "Peru" },
  de: { ot: "Global", br: "Brasilien", us: "USA", uk: "UK", pl: "Polen", ru: "Russland", "es-latam": "LATAM", ca: "Kanada", au: "Australien", nz: "Neuseeland", de: "Deutschland", fr: "Frankreich", it: "Italien", ar: "Argentinien", co: "Kolumbien", pe: "Peru" },
  fr: { ot: "Global", br: "Brésil", us: "États-Unis", uk: "Royaume-Uni", pl: "Pologne", ru: "Russie", "es-latam": "LATAM", ca: "Canada", au: "Australie", nz: "Nouvelle-Zélande", de: "Allemagne", fr: "France", it: "Italie", ar: "Argentine", co: "Colombie", pe: "Pérou" },
  it: { ot: "Globale", br: "Brasile", us: "USA", uk: "Regno Unito", pl: "Polonia", ru: "Russia", "es-latam": "LATAM", ca: "Canada", au: "Australia", nz: "Nuova Zelanda", de: "Germania", fr: "Francia", it: "Italia", ar: "Argentina", co: "Colombia", pe: "Perù" },
};

// Grammar variants used in hero titles (e.g. Polish genitive). Falls back to REGION_LABELS.
export const REGION_GRAMMAR: Record<string, Record<string, string>> = {
  en: REGION_LABELS.en,
  "pt-BR": REGION_LABELS["pt-BR"],
  es: REGION_LABELS.es,
  pl: { ot: "Global", br: "Brazylii", us: "USA", uk: "UK", pl: "Polski", ru: "Rosji", "es-latam": "LATAM", ca: "Kanady", au: "Australii", nz: "Nowej Zelandii" },
  de: REGION_LABELS.de,
  fr: REGION_LABELS.fr,
  it: REGION_LABELS.it,
};

export const REGION_LANGUAGE: Record<string, string> = {
  br: "pt-BR", pl: "pl", ru: "en", us: "en", uk: "en", ca: "en", au: "en", nz: "en",
  de: "de", fr: "fr", it: "it", ar: "es", co: "es", pe: "es", "es-latam": "es", ot: "en",
};

export const LANG_LABELS: Record<string, string> = {
  en: "English", "pt-BR": "Português", es: "Español", pl: "Polski",
  de: "Deutsch", fr: "Français", it: "Italiano",
};

export function allowedLanguagesForRegion(region: string): string[] {
  const local = REGION_LANGUAGE[region] || "en";
  return local === "en" ? ["en"] : [local, "en"];
}

export function normalizeLangForRegion(region: string, lang: string): string {
  const allowed = allowedLanguagesForRegion(region);
  return allowed.includes(lang) ? lang : allowed[0];
}
