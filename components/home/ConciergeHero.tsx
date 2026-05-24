// File: components/home/ConciergeHero.tsx

"use client";

import { useEffect, useRef, useState } from "react";
import { I18N, CATEGORY_META } from "@/lib/home/i18n-home";

const HERO_CHIPS = [
  "flights",
  "hotels",
  "esim",
  "tours",
  "car_rentals",
  "marketplace",
];

const DEPARTMENTS: Record<string, string[]> = {
  en: ["your next flight ✈️", "the perfect hotel 🏨", "a travel eSIM 🌍", "business tools 💼", "creator tools 🎙️", "great deals 🛍️"],
  "pt-BR": ["seu próximo voo ✈️", "o hotel perfeito 🏨", "um eSIM de viagem 🌍", "ferramentas de negócio 💼", "ferramentas para criadores 🎙️", "ótimas ofertas 🛍️"],
  es: ["tu próximo vuelo ✈️", "el hotel perfecto 🏨", "un eSIM de viaje 🌍", "herramientas de negocio 💼", "herramientas para creadores 🎙️", "grandes ofertas 🛍️"],
  pl: ["następny lot ✈️", "idealny hotel 🏨", "eSIM na podróż 🌍", "narzędzia biznesowe 💼", "narzędzia dla twórców 🎙️", "świetne okazje 🛍️"],
  de: ["deinen nächsten Flug ✈️", "das perfekte Hotel 🏨", "eine Reise-eSIM 🌍", "Business-Tools 💼", "Creator-Tools 🎙️", "tolle Angebote 🛍️"],
  fr: ["votre prochain vol ✈️", "l'hôtel parfait 🏨", "une eSIM de voyage 🌍", "des outils business 💼", "des outils créateurs 🎙️", "de bonnes offres 🛍️"],
  it: ["il tuo prossimo volo ✈️", "l'hotel perfetto 🏨", "una eSIM da viaggio 🌍", "strumenti business 💼", "strumenti per creator 🎙️", "ottime offerte 🛍️"],
};

const EXAMPLES: Record<string, string[]> = {
  en: ['Try: "flights to Lima next month"', 'Try: "best eSIM for Japan"', 'Try: "hotel in Rio near the beach"', 'Try: "rental car in Cancún"', 'Try: "travel insurance for Europe"'],
  "pt-BR": ['Tente: "voos para Lima no próximo mês"', 'Tente: "melhor eSIM para o Japão"', 'Tente: "hotel no Rio perto da praia"', 'Tente: "aluguel de carro em Cancún"', 'Tente: "seguro viagem para a Europa"'],
  es: ['Prueba: "vuelos a Lima el próximo mes"', 'Prueba: "mejor eSIM para Japón"', 'Prueba: "hotel en Río cerca de la playa"', 'Prueba: "auto de alquiler en Cancún"', 'Prueba: "seguro de viaje para Europa"'],
  pl: ['Spróbuj: "loty do Limy w przyszłym miesiącu"', 'Spróbuj: "najlepszy eSIM do Japonii"', 'Spróbuj: "hotel w Rio blisko plaży"', 'Spróbuj: "wynajem auta w Cancún"', 'Spróbuj: "ubezpieczenie podróżne do Europy"'],
  de: ['Versuch: "Flüge nach Lima nächsten Monat"', 'Versuch: "beste eSIM für Japan"', 'Versuch: "Hotel in Rio am Strand"', 'Versuch: "Mietwagen in Cancún"', 'Versuch: "Reiseversicherung für Europa"'],
  fr: ['Essayez : "vols pour Lima le mois prochain"', 'Essayez : "meilleure eSIM pour le Japon"', 'Essayez : "hôtel à Rio près de la plage"', 'Essayez : "voiture de location à Cancún"', 'Essayez : "assurance voyage pour l’Europe"'],
  it: ['Prova: "voli per Lima il mese prossimo"', 'Prova: "migliore eSIM per il Giappone"', 'Prova: "hotel a Rio vicino alla spiaggia"', 'Prova: "auto a noleggio a Cancún"', 'Prova: "assicurazione viaggio per l’Europa"'],
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
  const t = (key: string, fallback: string) =>
    I18N[lang]?.[key] || I18N.en[key] || fallback;

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

  useEffect(() => {
    const id = setInterval(() => {
      setDeptIdx((i) => (i + 1) % departments.length);
    }, 2200);

    return () => clearInterval(id);
  }, [departments.length]);

  useEffect(() => {
    if (value) return;

    const id = setInterval(() => {
      setExampleIdx((i) => (i + 1) % examples.length);
    }, 3200);

    return () => clearInterval(id);
  }, [value, examples.length]);

  const submit = () => {
    const q = value.trim();
    if (q) onSubmit(q);
  };

  const findPrefix =
    {
      en: "I'll help you find",
      "pt-BR": "Vou te ajudar a encontrar",
      es: "Te ayudo a encontrar",
      pl: "Pomogę Ci znaleźć",
      de: "Ich helfe dir zu finden",
      fr: "Je vous aide à trouver",
      it: "Ti aiuto a trovare",
    }[lang] || "I'll help you find";

  return (
    <section
      className="concierge-hero"
      style={{ paddingTop: "1.25rem", paddingBottom: 0 }}
    >
      <div className="concierge-hero-inner" style={{ gap: "0.875rem" }}>
        <div className="concierge-brand">{t("brand_name", "SignalBoost")}</div>

        <div className="concierge-tagline">
          {t("mall_tagline", "Your AI-guided digital shopping mall")}
        </div>

        <div className="concierge-rotator">
          <span className="concierge-rotator-prefix">{findPrefix}</span>{" "}
          <span key={deptIdx} className="concierge-rotator-word">
            {departments[deptIdx]}
          </span>
        </div>

        <p className="concierge-value">
          {t(
            "mall_sub",
            "Tell me what you need and I'll guide you to the right trusted partner — matched to your country."
          )}
        </p>

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

        <div className="concierge-chips">
          {HERO_CHIPS.map((c) => (
            <button key={c} className="concierge-chip" onClick={() => onChip(c)}>
              <span aria-hidden="true">{CATEGORY_META[c]?.icon || "•"}</span>{" "}
              {catName(c)}
            </button>
          ))}
        </div>

        <div className="concierge-trust">
          {t(
            "trust_line",
            "Connecting you with trusted partners worldwide"
          )}
        </div>

        <button className="concierge-browse-all" onClick={onBrowseAll}>
          {t("show_all", "Browse all partners")} →
        </button>
      </div>
    </section>
  );
}
