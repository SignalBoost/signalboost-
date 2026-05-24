// File: components/home/ConciergeHero.tsx
// SignalBoost homepage hero
// Updated:
// - broader SignalBoost identity
// - digital shopping mall positioning
// - expanded beyond travel
// - stronger trust messaging
// - improved marketing conversion

"use client";

import { useEffect, useRef, useState } from "react";
import { I18N, CATEGORY_META } from "@/lib/home/i18n-home";

const HERO_CHIPS = [
  "flights",
  "hotels",
  "esim",
  "podcast",
  "business",
  "marketplace",
];

const DEPARTMENTS: Record<string, string[]> = {
  en: [
    "your next flight ✈️",
    "the perfect hotel 🏨",
    "a travel eSIM 🌍",
    "business tools 💼",
    "podcast tools 🎙️",
    "great deals 🛍️",
    "new opportunities 🌎",
  ],
};

const EXAMPLES: Record<string, string[]> = {
  en: [
    'Try: "flights to Lima next month"',
    'Try: "best eSIM for Japan"',
    'Try: "hotel in Rio near the beach"',
    'Try: "start a podcast"',
    'Try: "build a business website"',
    'Try: "best travel insurance for Europe"',
  ],
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
    I18N[lang]?.[key] ||
    I18N.en[key] ||
    fallback;

  const catName = (key: string) =>
    (CATEGORY_META[key] as any)?.[lang] ||
    CATEGORY_META[key]?.en ||
    key;

  const departments =
    DEPARTMENTS[lang] ||
    DEPARTMENTS.en;

  const examples =
    EXAMPLES[lang] ||
    EXAMPLES.en;

  const [value, setValue] = useState("");
  const [deptIdx, setDeptIdx] = useState(0);
  const [exampleIdx, setExampleIdx] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const id = setInterval(() => {
      setDeptIdx(
        (i) => (i + 1) % departments.length
      );
    }, 2200);

    return () => clearInterval(id);
  }, [departments.length]);

  useEffect(() => {
    if (value) return;

    const id = setInterval(() => {
      setExampleIdx(
        (i) => (i + 1) % examples.length
      );
    }, 3200);

    return () => clearInterval(id);
  }, [value, examples.length]);

  const submit = () => {
    const q = value.trim();

    if (q) {
      onSubmit(q);
    }
  };

  const findPrefix =
    "I'll help you find";

  return (
    <section
      className="concierge-hero"
      style={{
        paddingTop: "1.25rem",
        paddingBottom: 0,
      }}
    >
      <div
        className="concierge-hero-inner"
        style={{
          gap: "0.875rem",
        }}
      >
        <div className="concierge-brand">
          SignalBoost
        </div>

        <div className="concierge-tagline">
          Your AI-guided digital shopping mall
        </div>

        <div className="concierge-rotator">
          <span className="concierge-rotator-prefix">
            {findPrefix}
          </span>{" "}
          <span
            key={deptIdx}
            className="concierge-rotator-word"
          >
            {departments[deptIdx]}
          </span>
        </div>

        <p className="concierge-value">
          Find trusted travel services,
          shopping, business tools,
          creators tools and opportunities —
          personalized for your region.
        </p>

        <div className="concierge-input-wrap">
          <input
            ref={inputRef}
            className="concierge-input"
            value={value}
            onChange={(e) =>
              setValue(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                submit();
              }
            }}
            placeholder={
              examples[exampleIdx]
            }
            aria-label="What can I help you find today?"
          />

          <button
            className="concierge-send"
            onClick={submit}
          >
            →
          </button>
        </div>

        <div className="concierge-chips">
          {HERO_CHIPS.map((c) => (
            <button
              key={c}
              className="concierge-chip"
              onClick={() =>
                onChip(c)
              }
            >
              <span>
                {CATEGORY_META[c]?.icon ||
                  "•"}
              </span>{" "}
              {catName(c)}
            </button>
          ))}
        </div>

        <div className="concierge-trust">
          Trusted by global brands and powered by
          130+ partners worldwide
        </div>

        <button
          className="concierge-browse-all"
          onClick={onBrowseAll}
        >
          Browse all partners →
        </button>
      </div>
    </section>
  );
}
