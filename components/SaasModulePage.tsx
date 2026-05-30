"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { saasModules } from "@/lib/saas-modules";
import {
  cockpitCopy,
  formatLocaleCurrency,
  formatLocaleDate,
  localeMeta,
  localizedModules,
  type SignalBoostLocale,
} from "@/lib/saas-i18n";
import useTranslation from "@/components/i18n/useTranslation";

const sampleReviews = [
  {
    id: "rv-en-01",
    locale: "en" as SignalBoostLocale,
    partner: "Booking.com",
    service: "Hotels",
    rating: 5,
    date: "2026-05-12T10:00:00Z",
    amount: 286,
    sentiment: "Positive",
    verified: true,
    text: "Fast booking flow and the Concierge recommendation matched my travel dates perfectly.",
  },
  {
    id: "rv-es-02",
    locale: "es" as SignalBoostLocale,
    partner: "Drimsim",
    service: "eSIM",
    rating: 4,
    date: "2026-05-18T10:00:00Z",
    amount: 42,
    sentiment: "Neutral",
    verified: true,
    text: "La activación fue rápida; quiero más instrucciones antes de viajar.",
  },
  {
    id: "rv-pt-03",
    locale: "pt" as SignalBoostLocale,
    partner: "Amazon",
    service: "Marketplace",
    rating: 2,
    date: "2026-05-22T10:00:00Z",
    amount: 119,
    sentiment: "Negative",
    verified: false,
    text: "O produto chegou atrasado e precisa de resposta da moderação.",
  },
];

const reviewUi: Record<SignalBoostLocale, {
  submitTitle: string;
  reviewText: string;
  attachments: string;
  sort: string;
  language: string;
  partner: string;
  product: string;
  verified: string;
  translation: string;
  sentimentTrend: string;
  localeVolume: string;
  moderationQueue: string;
  approve: string;
  flag: string;
  concierge: string;
}> = {
  en: { submitTitle: "Submit a review", reviewText: "Review text", attachments: "Optional media attachments", sort: "Sort by relevance, date, or rating", language: "Language", partner: "Partner", product: "Product / service", verified: "Verified partner review", translation: "Concierge translation on demand", sentimentTrend: "Sentiment trend", localeVolume: "Review volume per locale", moderationQueue: "Moderation queue", approve: "Approve", flag: "Flag", concierge: "Concierge suggests: turn positive verified reviews into testimonial campaigns." },
  es: { submitTitle: "Enviar reseña", reviewText: "Texto de reseña", attachments: "Adjuntos multimedia opcionales", sort: "Ordenar por relevancia, fecha o calificación", language: "Idioma", partner: "Socio", product: "Producto / servicio", verified: "Reseña de socio verificado", translation: "Traducción por Concierge bajo demanda", sentimentTrend: "Tendencia de sentimiento", localeVolume: "Volumen por idioma", moderationQueue: "Cola de moderación", approve: "Aprobar", flag: "Marcar", concierge: "Concierge sugiere: convertir reseñas positivas verificadas en campañas testimoniales." },
  pt: { submitTitle: "Enviar avaliação", reviewText: "Texto da avaliação", attachments: "Anexos de mídia opcionais", sort: "Ordenar por relevância, data ou nota", language: "Idioma", partner: "Parceiro", product: "Produto / serviço", verified: "Avaliação de parceiro verificado", translation: "Tradução do Concierge sob demanda", sentimentTrend: "Tendência de sentimento", localeVolume: "Volume por idioma", moderationQueue: "Fila de moderação", approve: "Aprovar", flag: "Sinalizar", concierge: "Concierge sugere: transformar avaliações positivas verificadas em campanhas de depoimentos." },
  pl: { submitTitle: "Dodaj opinię", reviewText: "Treść opinii", attachments: "Opcjonalne załączniki", sort: "Sortuj wg trafności, daty lub oceny", language: "Język", partner: "Partner", product: "Produkt / usługa", verified: "Zweryfikowana opinia partnera", translation: "Tłumaczenie Concierge na żądanie", sentimentTrend: "Trend sentymentu", localeVolume: "Wolumen opinii wg języka", moderationQueue: "Kolejka moderacji", approve: "Akceptuj", flag: "Oznacz", concierge: "Concierge sugeruje: zmień pozytywne zweryfikowane opinie w kampanie testimoniali." },
  ru: { submitTitle: "Отправить отзыв", reviewText: "Текст отзыва", attachments: "Необязательные медиа-вложения", sort: "Сортировать по релевантности, дате или рейтингу", language: "Язык", partner: "Партнёр", product: "Продукт / услуга", verified: "Проверенный отзыв партнёра", translation: "Перевод Concierge по запросу", sentimentTrend: "Тренд тональности", localeVolume: "Объём отзывов по языкам", moderationQueue: "Очередь модерации", approve: "Одобрить", flag: "Пожаловаться", concierge: "Concierge предлагает: превратить позитивные проверенные отзывы в кампании отзывов." },
};

const sentimentClass: Record<string, string> = {
  Positive: "positive",
  Neutral: "neutral",
  Negative: "negative",
};

function Stars({ rating }: { rating: number }) {
  return <span className="review-stars" aria-label={`${rating} out of 5 stars`}>{"★".repeat(rating)}{"☆".repeat(5 - rating)}</span>;
}

function ReviewsCockpit({ locale }: { locale: SignalBoostLocale }) {
  const ui = reviewUi[locale];
  return (
    <>
      <section className="cockpit-section reviews-workbench" aria-label="Multi-locale reviews workbench">
        <form className="review-submit cockpit-glass" aria-label={ui.submitTitle}>
          <p className="cockpit-eyebrow">{ui.submitTitle}</p>
          <div className="review-stars-input" role="radiogroup" aria-label="Star rating from 1 to 5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button type="button" role="radio" aria-checked={star === 5} key={star}>★</button>
            ))}
          </div>
          <label>
            {ui.reviewText}
            <textarea defaultValue={sampleReviews[0].text} />
          </label>
          <label>
            {ui.attachments}
            <input type="file" accept="image/*" aria-label={ui.attachments} />
          </label>
          <div className="review-filter-grid">
            <select aria-label={ui.language}><option>{ui.language}: {localeMeta[locale].label}</option></select>
            <select aria-label={ui.partner}><option>{ui.partner}: Booking.com</option></select>
            <select aria-label={ui.product}><option>{ui.product}: Hotels</option></select>
          </div>
          <button className="cockpit-primary" type="button">{ui.submitTitle}</button>
        </form>

        <div className="review-list" aria-label="Review cards sorted and filtered">
          <div className="review-toolbar cockpit-glass">
            <span>{ui.sort}</span>
            <span>{ui.translation}</span>
          </div>
          {sampleReviews.map((review) => (
            <article className="review-card cockpit-glass" key={review.id} dir={localeMeta[review.locale].dir}>
              <div className="review-card-head">
                <span className="locale-flag" aria-label={localeMeta[review.locale].label}>{localeMeta[review.locale].flag}</span>
                <Stars rating={review.rating} />
                <span className={`sentiment-badge ${sentimentClass[review.sentiment]}`}>{review.sentiment}</span>
              </div>
              <p>{review.text}</p>
              <div className="review-meta">
                <span>{review.partner} · {review.service}</span>
                <span>{formatLocaleDate(locale, review.date)} · {formatLocaleCurrency(locale, review.amount)}</span>
              </div>
              {review.verified && <strong className="verified-review">✓ {ui.verified}</strong>}
            </article>
          ))}
        </div>
      </section>

      <section className="cockpit-section admin-review-panel" aria-label="Admin Console reviews telemetry">
        <article className="cockpit-glass">
          <p className="cockpit-eyebrow">{ui.localeVolume}</p>
          <div className="bar-chart" aria-label="Review volume chart per language">
            {Object.entries({ en: 42, es: 31, pt: 24, pl: 17, ru: 13 }).map(([lang, value]) => (
              <span key={lang} style={{ "--bar-height": `${value * 2}px` } as CSSProperties}>{lang.toUpperCase()}</span>
            ))}
          </div>
        </article>
        <article className="cockpit-glass">
          <p className="cockpit-eyebrow">{ui.sentimentTrend}</p>
          <div className="trend-chart" aria-label="Sentiment trend chart">
            <span className="positive" />
            <span className="neutral" />
            <span className="negative" />
          </div>
        </article>
        <article className="cockpit-glass moderation-list">
          <p className="cockpit-eyebrow">{ui.moderationQueue}</p>
          {["Possible spam", "Needs verified response", "Escalate partner SLA"].map((item) => (
            <div key={item}>
              <span>{item}</span>
              <button type="button">{ui.approve}</button>
              <button type="button">{ui.flag}</button>
            </div>
          ))}
        </article>
      </section>
      <section className="cockpit-section concierge-band"><p>{ui.concierge}</p><Link className="cockpit-primary" href="/outreach">{cockpitCopy[locale].outreachReady}</Link></section>
    </>
  );
}

export default function SaasModulePage({ slug }: { slug: string }) {
  const { lang } = useTranslation();
  const locale = (lang || "en") as SignalBoostLocale;
  const module = saasModules.find((item) => item.slug === slug) || saasModules[0];
  const localized = localizedModules[slug]?.[locale] || localizedModules[slug]?.en || localizedModules[module.slug]?.[locale];
  const copy = cockpitCopy[locale];

  return (
    <main className="cockpit-page" dir={localeMeta[locale].dir}>
      <section className="cockpit-hero" aria-labelledby="cockpit-title">
        <div className="cockpit-orbit" aria-hidden="true" />
        <p className="cockpit-eyebrow">{localized.eyebrow}</p>
        <h1 id="cockpit-title">{localized.title}</h1>
        <p className="cockpit-subtitle">{localized.summary}</p>
        <div className="cockpit-actions">
          <Link className="cockpit-primary" href="/pricing">{copy.viewPricing}</Link>
          <Link className="cockpit-secondary" href="/dashboard">{copy.executiveDashboard}</Link>
        </div>
      </section>

      <section className="cockpit-section module-detail" style={{ "--module-accent": module.accent } as CSSProperties} aria-label={`${localized.title} telemetry`}>
        {localized.panels.map((panel) => (
          <article className="module-detail-panel module-prime" key={panel.title}>
            <span className="telemetry-label">{panel.title}</span>
            <strong>{panel.value}</strong>
            <p>{panel.detail}</p>
          </article>
        ))}
      </section>

      {slug === "reviews" ? <ReviewsCockpit locale={locale} /> : (
        <section className="cockpit-section module-detail" style={{ "--module-accent": module.accent } as CSSProperties}>
          <div className="module-detail-panel">
            <span className="telemetry-label">{copy.coreSystems}</span>
            <ul>{localized.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
          </div>
          <div className="module-detail-panel">
            <span className="telemetry-label">{copy.conciergeAutomations}</span>
            <ul>{localized.automations.map((automation) => <li key={automation}>{automation}</li>)}</ul>
          </div>
          <div className="module-detail-panel cockpit-wireframe-card">
            <span className="telemetry-label">{copy.localeReadout}</span>
            <div className="mini-grid" aria-hidden="true"><span /><span /><span /><span /><span /><span /></div>
            <p>{formatLocaleDate(locale, "2026-05-30T12:00:00Z")} · {formatLocaleCurrency(locale, 1290)}</p>
          </div>
        </section>
      )}

      <section className="cockpit-section concierge-band">
        <div>
          <p className="cockpit-eyebrow">Concierge AI</p>
          <h2>{copy.conciergeTitle}</h2>
          <p>{copy.conciergeBody}</p>
        </div>
        <Link className="cockpit-primary" href="/assistant">{copy.openAssistant}</Link>
      </section>
    </main>
  );
}
