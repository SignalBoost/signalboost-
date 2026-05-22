"use client";

import { useEffect, useState } from "react";

/**
 * SignalBoost Live Demo  ->  app/demo/page.tsx
 * -----------------------------------------------------------------------------
 * "Try it on your business" — visitor pastes a podcast RSS or website URL,
 * Claude analyzes it via /api/analyze, and we show specific recommendations
 * plus a CTA into saas.signalboostapp.com with their use case pre-filled.
 *
 * Self-contained: inline styles + injected keyframes, gold/dark tokens.
 * No globals.css edits, no dependencies. Auto-detects EN/PT/ES/PL/RU.
 * -----------------------------------------------------------------------------
 */

type Lang = "en" | "pt" | "es" | "pl" | "ru";

const GOLD = "#f5c542";
const GOLD_SOFT = "rgba(245, 197, 66, 0.14)";
const DARK = "#0d1117";
const PANEL = "#0f141b";
const CARD = "#111822";
const BORDER = "#1e2630";
const TEXT = "#e6edf3";
const MUTED = "#9aa8b8";
const SAAS_URL = "https://saas.signalboostapp.com";

interface Recommendation {
  title: string;
  detail: string;
}
interface AnalysisResult {
  contentType: "podcast" | "website" | "blog" | "unknown";
  title: string;
  summary: string;
  recommendations: Recommendation[];
  partnerCategories: string[];
  ctaLabel: string;
  ctaContext: string;
}

const STRINGS: Record<
  Lang,
  {
    eyebrow: string;
    heading: string;
    sub: string;
    placeholder: string;
    analyze: string;
    analyzing: string;
    examples: string;
    resultsFor: string;
    recsTitle: string;
    matchedTitle: string;
    defaultCta: string;
    again: string;
    errGeneric: string;
    errEmpty: string;
  }
> = {
  en: {
    eyebrow: "Live demo",
    heading: "See what SignalBoost can do for you",
    sub: "Paste your podcast RSS feed or website URL. Our AI reads it and shows you exactly how to grow — in seconds.",
    placeholder: "https://your-site.com or your podcast RSS feed",
    analyze: "Analyze my content",
    analyzing: "Reading your content...",
    examples: "Works with podcast feeds, blogs, and business sites.",
    resultsFor: "Analysis for",
    recsTitle: "How SignalBoost helps you grow",
    matchedTitle: "Monetization matches",
    defaultCta: "Try it on your business",
    again: "Analyze another",
    errGeneric: "Something went wrong. Please try again.",
    errEmpty: "Paste a URL to get started.",
  },
  pt: {
    eyebrow: "Demonstracao",
    heading: "Veja o que o SignalBoost pode fazer por voce",
    sub: "Cole o RSS do seu podcast ou a URL do seu site. Nossa IA le e mostra exatamente como crescer — em segundos.",
    placeholder: "https://seu-site.com ou o RSS do seu podcast",
    analyze: "Analisar meu conteudo",
    analyzing: "Lendo seu conteudo...",
    examples: "Funciona com feeds de podcast, blogs e sites de negocios.",
    resultsFor: "Analise para",
    recsTitle: "Como o SignalBoost ajuda voce a crescer",
    matchedTitle: "Oportunidades de monetizacao",
    defaultCta: "Experimente no seu negocio",
    again: "Analisar outro",
    errGeneric: "Algo deu errado. Tente novamente.",
    errEmpty: "Cole uma URL para comecar.",
  },
  es: {
    eyebrow: "Demo en vivo",
    heading: "Descubre lo que SignalBoost puede hacer por ti",
    sub: "Pega el RSS de tu podcast o la URL de tu sitio. Nuestra IA lo lee y te muestra como crecer — en segundos.",
    placeholder: "https://tu-sitio.com o el RSS de tu podcast",
    analyze: "Analizar mi contenido",
    analyzing: "Leyendo tu contenido...",
    examples: "Funciona con feeds de podcast, blogs y sitios de negocio.",
    resultsFor: "Analisis para",
    recsTitle: "Como SignalBoost te ayuda a crecer",
    matchedTitle: "Oportunidades de monetizacion",
    defaultCta: "Pruebalo en tu negocio",
    again: "Analizar otro",
    errGeneric: "Algo salio mal. Intentalo de nuevo.",
    errEmpty: "Pega una URL para empezar.",
  },
  pl: {
    eyebrow: "Demo na zywo",
    heading: "Zobacz, co SignalBoost moze zrobic dla Ciebie",
    sub: "Wklej RSS swojego podcastu lub adres strony. Nasza AI to przeczyta i pokaze, jak rosnac — w kilka sekund.",
    placeholder: "https://twoja-strona.com lub RSS podcastu",
    analyze: "Analizuj moja tresc",
    analyzing: "Czytam Twoja tresc...",
    examples: "Dziala z feedami podcastow, blogami i stronami firmowymi.",
    resultsFor: "Analiza dla",
    recsTitle: "Jak SignalBoost pomaga Ci rosnac",
    matchedTitle: "Mozliwosci monetyzacji",
    defaultCta: "Wyprobuj w swojej firmie",
    again: "Analizuj inny",
    errGeneric: "Cos poszlo nie tak. Sprobuj ponownie.",
    errEmpty: "Wklej adres URL, aby zaczac.",
  },
  ru: {
    eyebrow: "Демо",
    heading: "Узнайте, что SignalBoost может сделать для вас",
    sub: "Вставьте RSS вашего подкаста или URL сайта. Наш ИИ прочитает его и покажет, как расти — за секунды.",
    placeholder: "https://ваш-сайт.com или RSS подкаста",
    analyze: "Анализировать мой контент",
    analyzing: "Читаем ваш контент...",
    examples: "Работает с подкаст-лентами, блогами и сайтами компаний.",
    resultsFor: "Анализ для",
    recsTitle: "Как SignalBoost помогает вам расти",
    matchedTitle: "Возможности монетизации",
    defaultCta: "Попробуйте для своего бизнеса",
    again: "Анализировать другой",
    errGeneric: "Что-то пошло не так. Попробуйте ещё раз.",
    errEmpty: "Вставьте URL, чтобы начать.",
  },
};

function detectLang(): Lang {
  if (typeof navigator === "undefined") return "en";
  const raw = (navigator.language || "en").slice(0, 2).toLowerCase();
  return (["en", "pt", "es", "pl", "ru"] as const).includes(raw as Lang)
    ? (raw as Lang)
    : "en";
}

function prettyCategory(key: string): string {
  return key
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function DemoPage() {
  const [lang, setLang] = useState<Lang>("en");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const t = STRINGS[lang];

  useEffect(() => {
    setLang(detectLang());
  }, []);

  async function analyze() {
    const value = url.trim();
    if (!value) {
      setError(t.errEmpty);
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: value, lang }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError((data && typeof data.error === "string" && data.error) || t.errGeneric);
        return;
      }
      setResult(data as AnalysisResult);
    } catch {
      setError(t.errGeneric);
    } finally {
      setLoading(false);
    }
  }

  const ctaHref = (() => {
    const params = new URLSearchParams({ ref: "demo", lang });
    if (result?.ctaContext) params.set("q", result.ctaContext.slice(0, 280));
    return `${SAAS_URL}/?${params.toString()}`;
  })();

  return (
    <main
      style={{
        minHeight: "100dvh",
        background: `radial-gradient(1100px 500px at 50% -10%, rgba(245,197,66,0.07), transparent), ${DARK}`,
        color: TEXT,
        fontFamily: "Arial, Helvetica, sans-serif",
        padding: "56px 20px 80px",
      }}
    >
      <style>{`
        @keyframes demo-spin { to { transform: rotate(360deg); } }
        @keyframes demo-rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 34 }}>
          <span
            style={{
              display: "inline-block",
              color: GOLD,
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              padding: "5px 12px",
              borderRadius: 999,
              background: GOLD_SOFT,
              border: `1px solid rgba(245,197,66,0.3)`,
            }}
          >
            {t.eyebrow}
          </span>
          <h1 style={{ fontSize: 34, lineHeight: 1.15, margin: "18px 0 12px", fontWeight: 800 }}>
            {t.heading}
          </h1>
          <p style={{ color: MUTED, fontSize: 16, lineHeight: 1.55, maxWidth: 560, margin: "0 auto" }}>
            {t.sub}
          </p>
        </div>

        {/* Input */}
        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            background: PANEL,
            border: `1px solid ${BORDER}`,
            borderRadius: 14,
            padding: 10,
          }}
        >
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void analyze();
            }}
            placeholder={t.placeholder}
            style={{
              flex: "1 1 280px",
              minWidth: 0,
              padding: "13px 15px",
              borderRadius: 10,
              border: `1px solid ${BORDER}`,
              background: CARD,
              color: TEXT,
              fontSize: 15,
              fontFamily: "inherit",
              outline: "none",
            }}
          />
          <button
            onClick={() => void analyze()}
            disabled={loading}
            style={{
              flex: "0 0 auto",
              padding: "13px 22px",
              borderRadius: 10,
              border: "none",
              cursor: loading ? "default" : "pointer",
              opacity: loading ? 0.7 : 1,
              color: DARK,
              fontWeight: 800,
              fontSize: 15,
              background: `linear-gradient(135deg, ${GOLD}, #d9a92e)`,
              display: "inline-flex",
              alignItems: "center",
              gap: 9,
            }}
          >
            {loading && (
              <span
                style={{
                  width: 15,
                  height: 15,
                  borderRadius: "50%",
                  border: `2px solid rgba(13,17,23,0.35)`,
                  borderTopColor: DARK,
                  animation: "demo-spin 0.7s linear infinite",
                  display: "inline-block",
                }}
              />
            )}
            {loading ? t.analyzing : t.analyze}
          </button>
        </div>
        <p style={{ color: MUTED, fontSize: 13, textAlign: "center", marginTop: 12 }}>{t.examples}</p>

        {error && (
          <div
            style={{
              marginTop: 22,
              padding: "13px 16px",
              borderRadius: 11,
              background: "rgba(248,133,122,0.08)",
              border: "1px solid rgba(248,133,122,0.3)",
              color: "#f8857a",
              fontSize: 14,
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <section style={{ marginTop: 32, animation: "demo-rise 280ms ease" }}>
            <div
              style={{
                background: PANEL,
                border: `1px solid ${BORDER}`,
                borderRadius: 16,
                padding: 24,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                    color: GOLD,
                    padding: "3px 9px",
                    borderRadius: 6,
                    background: GOLD_SOFT,
                  }}
                >
                  {result.contentType}
                </span>
                <span style={{ color: MUTED, fontSize: 12.5 }}>{t.resultsFor}</span>
              </div>
              <h2 style={{ fontSize: 22, margin: "4px 0 10px", fontWeight: 800 }}>
                {result.title || "—"}
              </h2>
              <p style={{ color: TEXT, fontSize: 15, lineHeight: 1.6, margin: 0 }}>{result.summary}</p>
            </div>

            {result.recommendations.length > 0 && (
              <div style={{ marginTop: 22 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 12px" }}>{t.recsTitle}</h3>
                <div style={{ display: "grid", gap: 11 }}>
                  {result.recommendations.map((rec, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        gap: 13,
                        padding: "15px 16px",
                        borderRadius: 13,
                        background: CARD,
                        border: `1px solid ${BORDER}`,
                      }}
                    >
                      <span
                        style={{
                          flexShrink: 0,
                          width: 26,
                          height: 26,
                          borderRadius: 8,
                          display: "grid",
                          placeItems: "center",
                          background: GOLD_SOFT,
                          color: GOLD,
                          fontWeight: 800,
                          fontSize: 13,
                        }}
                      >
                        {i + 1}
                      </span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 3 }}>{rec.title}</div>
                        <div style={{ color: MUTED, fontSize: 13.5, lineHeight: 1.5 }}>{rec.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.partnerCategories.length > 0 && (
              <div style={{ marginTop: 22 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 12px" }}>{t.matchedTitle}</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {result.partnerCategories.map((c) => (
                    <span
                      key={c}
                      style={{
                        padding: "7px 13px",
                        borderRadius: 999,
                        background: CARD,
                        border: `1px solid ${BORDER}`,
                        color: TEXT,
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      {prettyCategory(c)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 28, alignItems: "center" }}>
              <a
                href={ctaHref}
                style={{
                  padding: "14px 26px",
                  borderRadius: 11,
                  textDecoration: "none",
                  color: DARK,
                  fontWeight: 800,
                  fontSize: 15.5,
                  background: `linear-gradient(135deg, ${GOLD}, #d9a92e)`,
                }}
              >
                {result.ctaLabel || t.defaultCta}
              </a>
              <button
                onClick={() => {
                  setResult(null);
                  setUrl("");
                  setError(null);
                }}
                style={{
                  padding: "14px 22px",
                  borderRadius: 11,
                  border: `1px solid ${BORDER}`,
                  background: "transparent",
                  color: MUTED,
                  fontWeight: 600,
                  fontSize: 14.5,
                  cursor: "pointer",
                }}
              >
                {t.again}
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
