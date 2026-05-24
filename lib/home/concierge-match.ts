// File: lib/home/concierge-match.ts

import {
  type HomePartner,
  partnerMatchesRegion,
  partnerUrl,
} from "@/lib/home/partners-home";

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  flights: [
    "flight",
    "flights",
    "fly",
    "plane",
    "airline",
    "airfare",
    "ticket",
    "tickets",
    "voo",
    "voos",
    "passagem",
    "passagens",
    "vuelo",
    "vuelos",
    "boleto",
    "boletos",
    "avion",
    "avião",
    "lot",
    "loty",
    "bilet",
  ],

  hotels: [
    "hotel",
    "hotels",
    "stay",
    "accommodation",
    "lodging",
    "hostel",
    "resort",
    "alojamiento",
    "hoteles",
  ],

  car_rentals: [
    "car",
    "rental",
    "rent a car",
    "vehicle",
    "alquiler",
    "carro",
    "auto",
    "coche",
  ],

  esim: [
    "esim",
    "sim",
    "internet",
    "mobile data",
    "roaming",
    "datos",
  ],

  tours: [
    "tour",
    "tours",
    "activity",
    "activities",
    "excursion",
    "actividad",
    "passeio",
  ],

  marketplace: [
    "buy",
    "shop",
    "shopping",
    "store",
    "purchase",
    "comprar",
    "tienda",
    "loja",
  ],

  insurance: [
    "insurance",
    "travel insurance",
    "seguro",
    "seguros",
  ],
};

const NEGATIVE_MATCHES: Record<string, string[]> = {
  flights: ["esim", "car_rentals", "tours", "marketplace"],
  hotels: ["esim", "car_rentals"],
  esim: ["flights", "hotels", "car_rentals"],
  car_rentals: ["flights", "hotels", "esim"],
  tours: ["flights", "esim"],
};

export interface Intent {
  category: string | null;
  keywords: string[];
  destination: string | null;
  confidence: number;
}

export function detectIntent(rawQuery: string): Intent {
  const q = (rawQuery || "").toLowerCase().trim();
  const scores: Record<string, number> = {};
  const keywords: string[] = [];

  for (const [cat, words] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const w of words) {
      if (q.includes(w.toLowerCase())) {
        scores[cat] = (scores[cat] || 0) + 1;
        keywords.push(w);
      }
    }
  }

  let category: string | null = null;
  let best = 0;

  for (const [cat, score] of Object.entries(scores)) {
    if (score > best) {
      best = score;
      category = cat;
    }
  }

  const confidence = category ? Math.min(1, 0.5 + best * 0.2) : 0;

  return {
    category,
    keywords: [...new Set(keywords)],
    destination: null,
    confidence,
  };
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
    const categoryKey = p.category_key || "";

    let score = 0;

    if (intent.category && categoryKey === intent.category) {
      score += 10;
    }

    const hay = [
      p.name || "",
      p.description || "",
      p.network || "",
      categoryKey,
    ]
      .join(" ")
      .toLowerCase();

    for (const kw of intent.keywords) {
      if (hay.includes(kw.toLowerCase())) {
        score += 2;
      }
    }

    if (p.name && q.includes(p.name.toLowerCase())) {
      score += 6;
    }

    if (
      intent.category &&
      categoryKey &&
      NEGATIVE_MATCHES[intent.category]?.includes(categoryKey)
    ) {
      score -= 8;
    }

    score += p.featured ? 1 : 0;
    score += Number(p.tier) === 1 ? 1 : 0;

    return {
      partner: p,
      url: partnerUrl(p, region),
      score,
    };
  });

  return scored
    .filter((r) => r.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        (a.partner.name || "").localeCompare(b.partner.name || "")
    )
    .slice(0, 5);
}

export interface ConciergeResult {
  intent: Intent;
  matches: MatchResult[];
  useAI: boolean;
}

export function conciergeMatch(
  all: HomePartner[],
  region: string,
  rawQuery: string
): ConciergeResult {
  const intent = detectIntent(rawQuery);
  const matches = scorePartners(all, region, intent, rawQuery);

  const topScore = matches.length ? matches[0].score : 0;

  return {
    intent,
    matches,
    useAI: matches.length === 0 || intent.confidence < 0.4 || topScore < 8,
  };
}
