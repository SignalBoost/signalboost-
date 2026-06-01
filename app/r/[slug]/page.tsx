// File: app/r/[slug]/page.tsx
// Public review collection page. No login required. Customers open this from
// the shareable link and leave a star rating + optional name + comment.
// Translations are kept self-contained in this file (isolated public page) so
// a locale edit here can never affect the rest of the site. Language follows
// the visitor's detected preference via the shared I18nProvider.
"use client";

import { useEffect, useState, type CSSProperties } from "react";
import useTranslation from "@/components/i18n/useTranslation";
import { getBusinessBySlug, submitReview, type ReviewBusiness } from "@/lib/reviews";

const GOLD = "#f5c542";
const GOLD_DEEP = "#dfa837";

type Strings = {
  loading: string;
  notFoundTitle: string;
  notFoundBody: string;
  thankTitle: string;
  thankBody: string; // contains {name}
  eyebrow: string;
  prompt: string;
  nameLabel: string;
  namePlaceholder: string;
  commentLabel: string;
  commentPlaceholder: string;
  errGeneric: string;
  submitting: string;
  submit: string;
};

const STRINGS: Record<string, Strings> = {
  en: {
    loading: "Loading…",
    notFoundTitle: "Link not found",
    notFoundBody: "This review link is invalid or has been removed.",
    thankTitle: "Thank you!",
    thankBody: "Your review for {name} has been submitted.",
    eyebrow: "Leave a review",
    prompt: "How was your experience? Your feedback helps a lot.",
    nameLabel: "Your name (optional)",
    namePlaceholder: "Jane D.",
    commentLabel: "Comment (optional)",
    commentPlaceholder: "Tell them what you liked…",
    errGeneric: "Something went wrong. Please try again.",
    submitting: "Submitting…",
    submit: "Submit review",
  },
  es: {
    loading: "Cargando…",
    notFoundTitle: "Enlace no encontrado",
    notFoundBody: "Este enlace de reseña no es válido o ha sido eliminado.",
    thankTitle: "¡Gracias!",
    thankBody: "Tu reseña para {name} ha sido enviada.",
    eyebrow: "Deja una reseña",
    prompt: "¿Cómo fue tu experiencia? Tus comentarios ayudan mucho.",
    nameLabel: "Tu nombre (opcional)",
    namePlaceholder: "Juan P.",
    commentLabel: "Comentario (opcional)",
    commentPlaceholder: "Cuéntales qué te gustó…",
    errGeneric: "Algo salió mal. Inténtalo de nuevo.",
    submitting: "Enviando…",
    submit: "Enviar reseña",
  },
  pt: {
    loading: "Carregando…",
    notFoundTitle: "Link não encontrado",
    notFoundBody: "Este link de avaliação é inválido ou foi removido.",
    thankTitle: "Obrigado!",
    thankBody: "Sua avaliação para {name} foi enviada.",
    eyebrow: "Deixe uma avaliação",
    prompt: "Como foi sua experiência? Seu feedback ajuda muito.",
    nameLabel: "Seu nome (opcional)",
    namePlaceholder: "João S.",
    commentLabel: "Comentário (opcional)",
    commentPlaceholder: "Conte o que você gostou…",
    errGeneric: "Algo deu errado. Tente novamente.",
    submitting: "Enviando…",
    submit: "Enviar avaliação",
  },
  pl: {
    loading: "Ładowanie…",
    notFoundTitle: "Nie znaleziono linku",
    notFoundBody: "Ten link do opinii jest nieprawidłowy lub został usunięty.",
    thankTitle: "Dziękujemy!",
    thankBody: "Twoja opinia o {name} została wysłana.",
    eyebrow: "Zostaw opinię",
    prompt: "Jak oceniasz swoje doświadczenie? Twoja opinia bardzo pomaga.",
    nameLabel: "Twoje imię (opcjonalnie)",
    namePlaceholder: "Jan K.",
    commentLabel: "Komentarz (opcjonalnie)",
    commentPlaceholder: "Napisz, co Ci się podobało…",
    errGeneric: "Coś poszło nie tak. Spróbuj ponownie.",
    submitting: "Wysyłanie…",
    submit: "Wyślij opinię",
  },
  ru: {
    loading: "Загрузка…",
    notFoundTitle: "Ссылка не найдена",
    notFoundBody: "Эта ссылка на отзыв недействительна или была удалена.",
    thankTitle: "Спасибо!",
    thankBody: "Ваш отзыв для {name} отправлен.",
    eyebrow: "Оставьте отзыв",
    prompt: "Как вам наш сервис? Ваш отзыв очень помогает.",
    nameLabel: "Ваше имя (необязательно)",
    namePlaceholder: "Иван И.",
    commentLabel: "Комментарий (необязательно)",
    commentPlaceholder: "Расскажите, что вам понравилось…",
    errGeneric: "Что-то пошло не так. Попробуйте снова.",
    submitting: "Отправка…",
    submit: "Отправить отзыв",
  },
};

export default function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { lang } = useTranslation();
  const s = STRINGS[lang] ?? STRINGS.en;

  const [slug, setSlug] = useState<string | null>(null);
  const [business, setBusiness] = useState<ReviewBusiness | null>(null);
  const [loading, setLoading] = useState(true);

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setSlug(p.slug));
  }, [params]);

  useEffect(() => {
    if (!slug) return;
    let alive = true;
    getBusinessBySlug(slug).then((b) => {
      if (alive) {
        setBusiness(b);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, [slug]);

  async function handleSubmit() {
    if (!business || rating === 0 || submitting) return;
    setSubmitting(true);
    setError(null);
    const res = await submitReview({ businessId: business.id, rating, authorName: name, comment });
    setSubmitting(false);
    if (res.ok) setDone(true);
    else setError(s.errGeneric);
  }

  return (
    <main style={styles.page}>
      <div style={styles.glow} aria-hidden="true" />
      <div style={styles.card}>
        <div style={styles.brand}>
          <span style={styles.brandMark}>S</span>
          <span style={styles.brandText}>
            signal<strong style={{ color: GOLD }}>boost</strong>
          </span>
        </div>

        {loading ? (
          <p style={styles.muted}>{s.loading}</p>
        ) : !business ? (
          <div>
            <h1 style={styles.title}>{s.notFoundTitle}</h1>
            <p style={styles.muted}>{s.notFoundBody}</p>
          </div>
        ) : done ? (
          <div style={{ textAlign: "center" }}>
            <div style={styles.bigStar}>★</div>
            <h1 style={styles.title}>{s.thankTitle}</h1>
            <p style={styles.muted}>{s.thankBody.replace("{name}", business.name)}</p>
          </div>
        ) : (
          <div>
            <p style={styles.eyebrow}>{s.eyebrow}</p>
            <h1 style={styles.title}>{business.name}</h1>
            <p style={styles.muted}>{s.prompt}</p>

            <div style={styles.starRow} role="radiogroup" aria-label="Star rating">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n}
                  type="button"
                  aria-label={`${n} / 5`}
                  onClick={() => setRating(n)}
                  onMouseEnter={() => setHover(n)}
                  onMouseLeave={() => setHover(0)}
                  style={{
                    ...styles.star,
                    color: (hover || rating) >= n ? GOLD : "rgba(255,255,255,.18)",
                    transform: (hover || rating) >= n ? "scale(1.08)" : "scale(1)",
                  }}
                >
                  ★
                </button>
              ))}
            </div>

            <label style={styles.label}>{s.nameLabel}</label>
            <input style={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={s.namePlaceholder}
              maxLength={80}
            />

            <label style={styles.label}>{s.commentLabel}</label>
            <textarea style={{ ...styles.input, minHeight: 96, resize: "vertical" }}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={s.commentPlaceholder}
              maxLength={1000}
            />

            {error && <p style={styles.error}>{error}</p>}

            <button type="button"
              onClick={handleSubmit}
              disabled={rating === 0 || submitting}
              style={{
                ...styles.submit,
                opacity: rating === 0 || submitting ? 0.5 : 1,
                cursor: rating === 0 || submitting ? "default" : "pointer",
              }}
            >
              {submitting ? s.submitting : s.submit}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100dvh",
    display: "grid",
    placeItems: "center",
    padding: 20,
    background: "radial-gradient(70vw 50vh at 50% -10%, rgba(245,197,66,.10), transparent 60%), linear-gradient(180deg,#06060a,#0a0a12)",
    position: "relative",
    fontFamily: "'Outfit', system-ui, sans-serif",
  },
  glow: { position: "fixed", inset: 0, pointerEvents: "none" },
  card: {
    width: "100%",
    maxWidth: 460,
    background: "linear-gradient(180deg, rgba(20,20,28,.86), rgba(10,10,16,.86))",
    border: "1px solid rgba(255,255,255,.10)",
    borderRadius: 24,
    padding: "34px 30px",
    boxShadow: "0 30px 80px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.05)",
    backdropFilter: "blur(14px)",
    position: "relative",
  },
  brand: { display: "flex", alignItems: "center", gap: 9, marginBottom: 22 },
  brandMark: {
    width: 30, height: 30, borderRadius: 8,
    background: `linear-gradient(135deg, ${GOLD}, ${GOLD_DEEP})`,
    display: "grid", placeItems: "center", color: "#06060a", fontWeight: 900,
  },
  brandText: { color: "#fff", fontWeight: 800, fontSize: 17 },
  eyebrow: { color: GOLD_DEEP, fontSize: 11, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", margin: 0 },
  title: { color: "#fff", fontSize: 26, fontWeight: 700, margin: "8px 0 6px", letterSpacing: "-0.02em" },
  muted: { color: "#9aa8b8", fontSize: 14.5, margin: "0 0 18px", lineHeight: 1.55 },
  starRow: { display: "flex", gap: 6, margin: "10px 0 22px" },
  star: { background: "none", border: "none", fontSize: 40, lineHeight: 1, padding: 0, transition: "transform .12s ease, color .12s ease" },
  bigStar: { color: GOLD, fontSize: 64, lineHeight: 1, marginBottom: 8 },
  label: { display: "block", color: "#9aa8b8", fontSize: 12.5, fontWeight: 600, margin: "12px 0 6px" },
  input: {
    width: "100%", boxSizing: "border-box", padding: "11px 13px", borderRadius: 11,
    border: "1px solid rgba(255,255,255,.12)", background: "rgba(8,8,12,.7)", color: "#e6edf3",
    fontSize: 14, fontFamily: "inherit", outline: "none",
  },
  error: { color: "#f8857a", fontSize: 13, margin: "12px 0 0" },
  submit: {
    width: "100%", marginTop: 20, padding: "13px 16px", borderRadius: 12, border: "none",
    color: "#06060a", fontWeight: 800, fontSize: 15,
    background: `linear-gradient(135deg, ${GOLD}, ${GOLD_DEEP})`,
  },
};
