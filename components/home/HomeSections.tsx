// File: components/home/HomeSections.tsx
// Below-the-hero marketing sections for the landing screen:
//   1) "How it works" — 4 calm steps that reassure a first-time visitor about
//      what happens when they use the concierge.
//   2) "Popular right now" — tappable use-case pills. Each pill is a ready-made
//      query; tapping it runs the concierge (onPopular -> HomeApp.runQuery), so
//      a hesitant visitor sees real results without typing anything.
//
// Copy comes from the i18n tables (how_* / popular_title). The popular pill
// QUERIES are localized here (they double as the text the concierge receives).
// Presentational; all behavior is delegated up via onPopular.

"use client";

import { I18N } from "@/lib/home/i18n-home";

export interface HomeSectionsProps {
  lang: string;
  onPopular: (query: string) => void;
}

// Localized "Popular right now" use-cases. Each entry: { icon, label }.
// The label is shown AND sent to the concierge as the query.
const POPULAR: Record<string, { icon: string; label: string }[]> = {
  en: [
    { icon: "✈️", label: "Flights to Europe" },
    { icon: "🌍", label: "eSIM for travel" },
    { icon: "🏨", label: "Hotels in Brazil" },
    { icon: "🚗", label: "Rental car in Cancún" },
    { icon: "🎟️", label: "Tours in Mexico" },
  ],
  "pt-BR": [
    { icon: "✈️", label: "Voos para a Europa" },
    { icon: "🌍", label: "eSIM para viagem" },
    { icon: "🏨", label: "Hotéis no Brasil" },
    { icon: "🚗", label: "Aluguel de carro em Cancún" },
    { icon: "🎟️", label: "Passeios no México" },
  ],
  es: [
    { icon: "✈️", label: "Vuelos a Europa" },
    { icon: "🌍", label: "eSIM para viajar" },
    { icon: "🏨", label: "Hoteles en Brasil" },
    { icon: "🚗", label: "Auto de alquiler en Cancún" },
    { icon: "🎟️", label: "Tours en México" },
  ],
  pl: [
    { icon: "✈️", label: "Loty do Europy" },
    { icon: "🌍", label: "eSIM na podróż" },
    { icon: "🏨", label: "Hotele w Brazylii" },
    { icon: "🚗", label: "Wynajem auta w Cancún" },
    { icon: "🎟️", label: "Wycieczki w Meksyku" },
  ],
  de: [
    { icon: "✈️", label: "Flüge nach Europa" },
    { icon: "🌍", label: "eSIM für die Reise" },
    { icon: "🏨", label: "Hotels in Brasilien" },
    { icon: "🚗", label: "Mietwagen in Cancún" },
    { icon: "🎟️", label: "Touren in Mexiko" },
  ],
  fr: [
    { icon: "✈️", label: "Vols pour l'Europe" },
    { icon: "🌍", label: "eSIM pour voyager" },
    { icon: "🏨", label: "Hôtels au Brésil" },
    { icon: "🚗", label: "Voiture de location à Cancún" },
    { icon: "🎟️", label: "Visites au Mexique" },
  ],
  it: [
    { icon: "✈️", label: "Voli per l'Europa" },
    { icon: "🌍", label: "eSIM da viaggio" },
    { icon: "🏨", label: "Hotel in Brasile" },
    { icon: "🚗", label: "Auto a noleggio a Cancún" },
    { icon: "🎟️", label: "Tour in Messico" },
  ],
};

export default function HomeSections({ lang, onPopular }: HomeSectionsProps) {
  const t = (key: string, fallback: string) => I18N[lang]?.[key] || I18N.en[key] || fallback;
  const popular = POPULAR[lang] || POPULAR.en;

  const steps = [
    { n: "1", text: t("how_1", "Tell me what you need") },
    { n: "2", text: t("how_2", "I find trusted partners for your region") },
    { n: "3", text: t("how_3", "Compare your options") },
    { n: "4", text: t("how_4", "Choose and continue") },
  ];

  return (
    <div className="sb-sections">
      {/* HOW IT WORKS */}
      <section className="sb-how">
        <h2 className="sb-section-title">{t("how_title", "How it works")}</h2>
        <div className="sb-how-steps">
          {steps.map((s) => (
            <div className="sb-how-step" key={s.n}>
              <span className="sb-how-num">{s.n}</span>
              <span className="sb-how-text">{s.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* POPULAR RIGHT NOW */}
      <section className="sb-popular">
        <h2 className="sb-section-title">{t("popular_title", "Popular right now")}</h2>
        <div className="sb-popular-pills">
          {popular.map((p, i) => (
            <button
              key={i}
              className="sb-popular-pill"
              onClick={() => onPopular(p.label)}
            >
              <span aria-hidden="true">{p.icon}</span> {p.label}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
