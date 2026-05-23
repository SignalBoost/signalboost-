// File: components/home/ConciergeHero.tsx
// R4 — centered, Claude-style landing hero. First thing the visitor sees.
//
// Presentational: collects a query and calls onSubmit(query) / onChip(category).
// HomeApp (R7) wires those to the rule matcher (R3) + AI fallback. Localized
// through the i18n tables. Region/language come from props (already detected).

"use client";

import { useEffect, useRef, useState } from "react";
import { I18N, CATEGORY_META } from "@/lib/home/i18n-home";

const HERO_CHIPS = ["flights", "hotels", "esim", "tours", "car_rentals", "marketplace"];

// Rotating example queries per language (placeholder text). English keys here;
// localized variants kept short and natural.
const EXAMPLES: Record<string, string[]> = {
  en: ["flights to Lima", "eSIM for travel", "hotels in Brazil", "travel insurance", "tours in Mexico"],
  "pt-BR": ["voos para Lima", "eSIM para viagem", "hotéis no Brasil", "seguro viagem", "passeios no México"],
  es: ["vuelos a Lima", "eSIM para viajar", "hoteles en Brasil", "seguro de viaje", "tours en México"],
  pl: ["loty do Limy", "eSIM na podróż", "hotele w Brazylii", "ubezpieczenie podróżne", "wycieczki w Meksyku"],
  de: ["Flüge nach Lima", "eSIM für die Reise", "Hotels in Brasilien", "Reiseversicherung", "Touren in Mexiko"],
  fr: ["vols pour Lima", "eSIM pour voyager", "hôtels au Brésil", "assurance voyage", "visites au Mexique"],
  it: ["voli per Lima", "eSIM da viaggio", "hotel in Brasile", "assicurazione viaggio", "tour in Messico"],
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

  const examples = EXAMPLES[lang] || EXAMPLES.en;
  const [value, setValue] = useState("");
  const [exampleIdx, setExampleIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Rotate the placeholder example every ~3s while the input is empty.
  useEffect(() => {
    if (value) return;
    const id = setInterval(() => setExampleIdx((i) => (i + 1) % examples.length), 3000);
    return () => clearInterval(id);
  }, [value, examples.length]);

  const submit = () => {
    const q = value.trim();
    if (q) onSubmit(q);
  };

  const valueProp =
    lang === "en"
      ? "Tell me what you need — I'll find the right partner for your region."
      : t("hero_copy", "Tell me what you need — I'll find the right partner.");

  return (
    <section className="concierge-hero">
      <div className="concierge-hero-inner">
        <div className="concierge-brand">{t("brand_name", "SignalBoost")}</div>
        <p className="concierge-value">{valueProp}</p>

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
            aria-label={t("explore_offers", "Explore offers")}
          />
          <button className="concierge-send" onClick={submit} aria-label="Search">
            →
          </button>
        </div>

        <div className="concierge-chips">
          {HERO_CHIPS.map((c) => (
            <button key={c} className="concierge-chip" onClick={() => onChip(c)}>
              <span aria-hidden="true">{CATEGORY_META[c]?.icon || "•"}</span> {catName(c)}
            </button>
          ))}
        </div>

        <button className="concierge-browse-all" onClick={onBrowseAll}>
          {t("show_all", "Browse all partners")} →
        </button>
      </div>
    </section>
  );
}
