// File: components/home/ConciergeHero.tsx
// R4 — centered landing hero, now the "AI-guided digital shopping mall" pitch.
//
// Marketing goal: a first-time visitor must understand in ~5 seconds WHAT
// SignalBoost is, WHAT it does, and WHY to stay. So the hero leads with the
// hook (mall tagline), a benefit-driven sub, a rotating "department" line that
// shows breadth (flights → eSIM → hotels → cars …), the concierge input with
// active TEACHING placeholders ("Try: cheapest eSIM for 2 weeks in Japan"),
// the category doors, and a trust line naming recognizable partners.
//
// Presentational: collects a query and calls onSubmit(query) / onChip(category).
// Copy comes from the i18n tables (mall_* / trust_line keys). Region/language
// are passed in (already detected upstream).

"use client";

import { useEffect, useRef, useState } from "react";
import { I18N, CATEGORY_META } from "@/lib/home/i18n-home";

// Category "doors" shown as chips. Travel set is live today.
const HERO_CHIPS = ["flights", "hotels", "esim", "tours", "car_rentals", "marketplace"];

// Rotating "department" words that complete the line "…find ____" — shows the
// breadth of the mall without a static list. Localized; falls back to en.
const DEPARTMENTS: Record<string, string[]> = {
  en: ["your next flight ✈️", "the perfect hotel 🏨", "a travel eSIM 🌍", "a rental car 🚗", "tours & activities 🎟️", "great deals 🛍️"],
  "pt-BR": ["seu próximo voo ✈️", "o hotel perfeito 🏨", "um eSIM de viagem 🌍", "um carro alugado 🚗", "passeios e atividades 🎟️", "ótimas ofertas 🛍️"],
  es: ["tu próximo vuelo ✈️", "el hotel perfecto 🏨", "un eSIM de viaje 🌍", "un auto de alquiler 🚗", "tours y actividades 🎟️", "grandes ofertas 🛍️"],
  pl: ["następny lot ✈️", "idealny hotel 🏨", "eSIM na podróż 🌍", "auto na wynajem 🚗", "wycieczki i atrakcje 🎟️", "świetne okazje 🛍️"],
  de: ["deinen nächsten Flug ✈️", "das perfekte Hotel 🏨", "eine Reise-eSIM 🌍", "einen Mietwagen 🚗", "Touren & Aktivitäten 🎟️", "tolle Angebote 🛍️"],
  fr: ["votre prochain vol ✈️", "l'hôtel parfait 🏨", "une eSIM de voyage 🌍", "une voiture de location 🚗", "visites et activités 🎟️", "de bonnes offres 🛍️"],
  it: ["il tuo prossimo volo ✈️", "l'hotel perfetto 🏨", "una eSIM da viaggio 🌍", "un'auto a noleggio 🚗", "tour e attività 🎟️", "ottime offerte 🛍️"],
};

// Active TEACHING placeholders — concrete example prompts that show what you can
// actually ask. Rotates while the input is empty.
const EXAMPLES: Record<string, string[]> = {
  en: ['Try: "cheapest eSIM for 2 weeks in Japan"', 'Try: "flights to Lima next month"', 'Try: "hotel in Rio near the beach"', 'Try: "rental car in Cancún"', 'Try: "travel insurance for Europe"'],
  "pt-BR": ['Tente: "eSIM mais barato para 2 semanas no Japão"', 'Tente: "voos para Lima no próximo mês"', 'Tente: "hotel no Rio perto da praia"', 'Tente: "aluguel de carro em Cancún"', 'Tente: "seguro viagem para a Europa"'],
  es: ['Prueba: "eSIM más barato para 2 semanas en Japón"', 'Prueba: "vuelos a Lima el próximo mes"', 'Prueba: "hotel en Río cerca de la playa"', 'Prueba: "auto de alquiler en Cancún"', 'Prueba: "seguro de viaje para Europa"'],
  pl: ['Spróbuj: "najtańszy eSIM na 2 tygodnie w Japonii"', 'Spróbuj: "loty do Limy w przyszłym miesiącu"', 'Spróbuj: "hotel w Rio blisko plaży"', 'Spróbuj: "wynajem auta w Cancún"', 'Spróbuj: "ubezpieczenie podróżne do Europy"'],
  de: ['Versuch: "günstigste eSIM für 2 Wochen in Japan"', 'Versuch: "Flüge nach Lima nächsten Monat"', 'Versuch: "Hotel in Rio am Strand"', 'Versuch: "Mietwagen in Cancún"', 'Versuch: "Reiseversicherung für Europa"'],
  fr: ['Essayez : "eSIM la moins chère pour 2 semaines au Japon"', 'Essayez : "vols pour Lima le mois prochain"', 'Essayez : "hôtel à Rio près de la plage"', 'Essayez : "voiture de location à Cancún"', 'Essayez : "assurance voyage pour l\'Europe"'],
  it: ['Prova: "eSIM più economica per 2 settimane in Giappone"', 'Prova: "voli per Lima il mese prossimo"', 'Prova: "hotel a Rio vicino alla spiaggia"', 'Prova: "auto a noleggio a Cancún"', 'Prova: "assicurazione viaggio per l\'Europa"'],
};

export interface ConciergeHeroProps {
  lang: string;
  regionName: string;
  onSubmit: (query: string) => void;
  onChip: (category: string) => void;
  onBrowseAll: () => void;
}

export default function ConciergeHero({
  lang,
  regionName,
  onSubmit,
  onChip,
  onBrowseAll,
}: ConciergeHeroProps) {
  const t = (key: string, fallback: string) => I18N[lang]?.[key] || I18N.en[key] || fallback;
  const catName = (key: string) =>
    (CATEGORY_META[key] as unknown as Record<string, string>)?.[lang] ||
    CATEGORY_META[key]?.en ||
    key;

  const departments = DEPARTMENTS[lang] || DEPARTMENTS.en;
  const examples = EXAMPLES[lang] || EXAMPLES.en;

  const [value, setValue] = useState("");
  const [deptIdx, setDeptIdx] = useState(0);
  const [exampleIdx, setExampleIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Rotate the department word every ~2.2s (always running — it's the "alive" cue).
  useEffect(() => {
    const id = setInterval(() => setDeptIdx((i) => (i + 1) % departments.length), 2200);
    return () => clearInterval(id);
  }, [departments.length]);

  // Rotate the teaching placeholder every ~3.2s while the input is empty.
  useEffect(() => {
    if (value) return;
    const id = setInterval(() => setExampleIdx((i) => (i + 1) % examples.length), 3200);
    return () => clearInterval(id);
  }, [value, examples.length]);

  const submit = () => {
    const q = value.trim();
    if (q) onSubmit(q);
  };

  // "I'll help you find ____" lead line (localized prefix + rotating department).
  const findPrefix =
    { en: "I'll help you find", "pt-BR": "Vou te ajudar a encontrar", es: "Te ayudo a encontrar", pl: "Pomogę Ci znaleźć", de: "Ich helfe dir,  zu finden:", fr: "Je vous aide à trouver", it: "Ti aiuto a trovare" }[lang] ||
    "I'll help you find";

  return (
    <section className="concierge-hero">
      <div className="concierge-hero-inner">
        <div className="concierge-brand">{t("brand_name", "SignalBoost")}</div>

        {/* THE HOOK */}
        <div className="concierge-tagline">{t("mall_tagline", "Your AI-guided digital shopping mall")}</div>

        {/* Rotating "department" line — shows breadth, feels alive */}
        <div className="concierge-rotator">
          <span className="concierge-rotator-prefix">{findPrefix}</span>{" "}
          <span key={deptIdx} className="concierge-rotator-word">{departments[deptIdx]}</span>
        </div>

        {/* Benefit-driven sub */}
        <p className="concierge-value">{t("mall_sub", "Tell me what you need and I'll guide you to the right trusted partner — matched to your country.")}</p>

        {/* Concierge input with active teaching placeholder */}
        <div className="concierge-input-wrap">
          <input
            ref={inputRef}
            className="concierge-input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
            placeholder={examples[exampleIdx]}
            aria-label={t("mall_prompt", "What can I help you find today?")}
          />
          <button className="concierge-send" onClick={submit} aria-label="Search">
            →
          </button>
        </div>

        {/* Category doors */}
        <div className="concierge-chips">
          {HERO_CHIPS.map((c) => (
            <button key={c} className="concierge-chip" onClick={() => onChip(c)}>
              <span aria-hidden="true">{CATEGORY_META[c]?.icon || "•"}</span> {catName(c)}
            </button>
          ))}
        </div>

        {/* Trust line — borrowed authority */}
        <div className="concierge-trust">{t("trust_line", "Connecting you with Booking.com, Aviasales, Amazon and 130+ trusted partners")}</div>

        <button className="concierge-browse-all" onClick={onBrowseAll}>
          {t("show_all", "Browse all partners")} →
        </button>
      </div>
    </section>
  );
}
