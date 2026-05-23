// File: lib/home/concierge-match.ts
// Rule engine FIRST (per brief). Pure, client-side, region-aware partner
// matching over already-loaded partners. No AI call here — the homepage uses
// the AI endpoint only when shouldUseAI() says the query is too vague/complex.
//
// Flow: query -> detectIntent (category + keywords + destination) ->
//       score region-valid partners -> top 3–5.
// Affiliate URL selection and the strict region rule are reused from
// partners-home.ts so behavior matches the rest of the site exactly.

import {
  type HomePartner,
  partnerMatchesRegion,
  partnerUrl,
} from "@/lib/home/partners-home";

// Category -> trigger keywords (multilingual-ish; cheap and effective).
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  flights: ["flight", "flights", "fly", "plane", "airline", "airfare", "ticket", "tickets", "voo", "voos", "passagem", "passagens", "vuelo", "vuelos", "boleto", "lot", "loty", "bilet"],
  hotels: ["hotel", "hotels", "stay", "accommodation", "lodging", "hostel", "resort", "hospedagem", "hotel", "hoteles", "alojamiento", "nocleg", "hotele"],
  car_rentals: ["car", "rental", "rent a car", "car rental", "vehicle", "drive", "aluguel de carro", "carro", "alquiler", "auto", "coche", "wynajem", "samochod"],
  esim: ["esim", "sim", "data", "connectivity", "internet", "mobile data", "roaming", "chip", "conectividade", "conectividad", "datos"],
  insurance: ["insurance", "claim", "claims", "travel insurance", "seguro", "seguros", "reembolso", "ubezpieczenie"],
  tours: ["tour", "tours", "activity", "activities", "things to do", "excursion", "experience", "passeio", "passeios", "atividade", "tour", "actividad", "wycieczka", "atrakcje"],
  transfers: ["transfer", "transfers", "airport transfer", "taxi", "pickup", "shuttle", "traslado", "transfer", "transfery"],
  marketplace: ["buy", "shop", "shopping", "store", "marketplace", "product", "purchase", "comprar", "loja", "compras", "tienda", "kup", "sklep", "zakupy"],
  products_tools: ["vpn", "software", "tool", "tools", "app", "subscription", "antivirus", "ferramenta", "herramienta", "narzedzie"],
  finance: ["finance", "bank", "money", "payment", "tax", "budget", "transfer money", "financa", "banco", "dinheiro", "finanzas", "dinero", "finanse"],
  travel_services: ["visa", "esim", "luggage", "storage", "travel service", "study abroad", "servico de viagem", "servicio de viaje", "usluga"],
  health_fitness: ["fitness", "health", "supplement", "gym", "workout", "wellness", "saude", "salud", "zdrowie"],
  sports_outdoors: ["sport", "sports", "outdoor", "outdoors", "cycling", "bike", "hiking", "camping", "esporte", "deporte", "sport"],
};

// Common destination tokens we can lift out of a query for continuity.
const DESTINATION_HINT = /\b(?:to|in|para|em|en|a|do)\s+([A-ZÁÉÍÓÚ][\w'-]+(?:\s+[A-ZÁÉÍÓÚ][\w'-]+){0,2})/;

export interface Intent {
  category: string | null;
  keywords: string[];
  destination: string | null;
  confidence: number; // 0..1 — low means consider AI fallback
}

export function detectIntent(rawQuery: string): Intent {
  const q = (rawQuery || "").toLowerCase().trim();
  const keywords: string[] = [];
  const scores: Record<string, number> = {};

  for (const [cat, words] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const w of words) {
      if (q.includes(w)) {
        scores[cat] = (scores[cat] || 0) + 1;
        keywords.push(w);
      }
    }
  }

  let category: string | null = null;
  let best = 0;
  for (const [cat, sc] of Object.entries(scores)) {
    if (sc > best) {
      best = sc;
      category = cat;
    }
  }

  // Destination: try a capitalized phrase from the ORIGINAL (case-preserving) query.
  let destination: string | null = null;
  const m = (rawQuery || "").match(DESTINATION_HINT);
  if (m && m[1]) destination = m[1].trim();

  // Confidence: did we land on a category at all, and how strongly?
  const wordCount = q.split(/\s+/).filter(Boolean).length;
  let confidence = 0;
  if (category) confidence = Math.min(1, 0.5 + best * 0.2);
  // Long, category-less queries are the AI-fallback case.
  if (!category && wordCount > 6) confidence = 0.1;

  return { category, keywords: [...new Set(keywords)], destination, confidence };
}

export interface MatchResult {
  partner: HomePartner;
  url: string;
  score: number;
}

export function scorePartners(
  all: HomePartner[],
  region: string,
  intent: Intent,
  rawQuery: string
): MatchResult[] {
  const q = (rawQuery || "").toLowerCase();
  const visible = all.filter((p) => partnerMatchesRegion(p, region));

  const scored = visible.map((p) => {
    let score = 0;
    if (intent.category && p.category_key === intent.category) score += 10;
    // Name / description keyword overlap.
    const hay = [p.name, p.description, p.network, p.category_key].join(" ").toLowerCase();
    for (const kw of intent.keywords) if (hay.includes(kw)) score += 2;
    // Direct token hits from the raw query (e.g. brand name).
    if (p.name && q.includes(p.name.toLowerCase())) score += 6;
    // Tier / featured nudges as gentle tiebreakers.
    score += (p.featured ? 1.5 : 0) + (Number(p.tier) === 1 ? 1 : 0);
    return { partner: p, url: partnerUrl(p, region), score };
  });

  return scored
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || (a.partner.name || "").localeCompare(b.partner.name || ""))
    .slice(0, 5);
}

export interface ConciergeResult {
  intent: Intent;
  matches: MatchResult[];
  useAI: boolean; // homepage should call the AI endpoint instead/as well
}

/**
 * Top-level rule match. If rules find good matches, return them. If the query
 * is vague/complex or yields nothing, flag useAI so the caller can fall back.
 */
export function conciergeMatch(
  all: HomePartner[],
  region: string,
  rawQuery: string
): ConciergeResult {
  const intent = detectIntent(rawQuery);
  const matches = scorePartners(all, region, intent, rawQuery);
  const useAI = matches.length === 0 || intent.confidence < 0.4;
  return { intent, matches, useAI };
}
