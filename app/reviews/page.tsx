// File: app/reviews/page.tsx
"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import useTranslation from "@/components/i18n/useTranslation";
import {
  getMyBusinesses,
  createBusiness,
  getReviewsForBusiness,
  deleteReview,
  averageRating,
  type ReviewBusiness,
  type Review,
} from "@/lib/reviews";

const GOLD = "#f5c542";
const GOLD_DEEP = "#dfa837";

type Strings = {
  eyebrow: string; title: string; sub: string; loading: string;
  loginTitle: string; loginBody: string; login: string;
  createTitle: string; createBody: string; placeholder: string;
  creating: string; create: string; errLogin: string; errCreate: string;
  noBiz: string; shareLink: string; copied: string; copy: string; open: string;
  reviewsLabel: string; refreshing: string; refresh: string;
  loadingReviews: string; noReviews: string; anonymous: string;
  deleteAria: string; reviewOne: string; reviewMany: string;
};

const STRINGS: Record<string, Strings> = {
  en: { eyebrow: "Trust telemetry", title: "Reviews", sub: "Collect customer feedback with a shareable link, and read it all in one place.", loading: "Loading…", loginTitle: "Log in to manage reviews", loginBody: "You need an account to create a business and collect reviews.", login: "Log in", createTitle: "Create a review page", createBody: "Give it a business name. You'll get a link to share with customers.", placeholder: "e.g. Casa Azul Café", creating: "Creating…", create: "Create", errLogin: "Please log in again.", errCreate: "Could not create.", noBiz: "No review pages yet. Create one above to get started.", shareLink: "Shareable link", copied: "Copied!", copy: "Copy", open: "Open", reviewsLabel: "Reviews", refreshing: "Refreshing…", refresh: "↻ Refresh", loadingReviews: "Loading reviews…", noReviews: "No reviews yet. Share your link to start collecting.", anonymous: "Anonymous", deleteAria: "Delete review", reviewOne: "review", reviewMany: "reviews" },
  es: { eyebrow: "Telemetría de confianza", title: "Reseñas", sub: "Recopila los comentarios de los clientes con un enlace para compartir y léelos todos en un solo lugar.", loading: "Cargando…", loginTitle: "Inicia sesión para gestionar las reseñas", loginBody: "Necesitas una cuenta para crear un negocio y recopilar reseñas.", login: "Iniciar sesión", createTitle: "Crear una página de reseñas", createBody: "Ponle un nombre al negocio. Obtendrás un enlace para compartir con los clientes.", placeholder: "p. ej., Casa Azul Café", creating: "Creando…", create: "Crear", errLogin: "Vuelve a iniciar sesión.", errCreate: "No se pudo crear.", noBiz: "Aún no hay páginas de reseñas. Crea una arriba para empezar.", shareLink: "Enlace para compartir", copied: "¡Copiado!", copy: "Copiar", open: "Abrir", reviewsLabel: "Reseñas", refreshing: "Actualizando…", refresh: "↻ Actualizar", loadingReviews: "Cargando reseñas…", noReviews: "Aún no hay reseñas. Comparte tu enlace para empezar a recopilar.", anonymous: "Anónimo", deleteAria: "Eliminar reseña", reviewOne: "reseña", reviewMany: "reseñas" },
  pt: { eyebrow: "Telemetria de confiança", title: "Avaliações", sub: "Colete o feedback dos clientes com um link compartilhável e leia tudo em um só lugar.", loading: "Carregando…", loginTitle: "Entre para gerenciar avaliações", loginBody: "Você precisa de uma conta para criar um negócio e coletar avaliações.", login: "Entrar", createTitle: "Criar uma página de avaliações", createBody: "Dê um nome ao negócio. Você receberá um link para compartilhar com os clientes.", placeholder: "ex.: Casa Azul Café", creating: "Criando…", create: "Criar", errLogin: "Faça login novamente.", errCreate: "Não foi possível criar.", noBiz: "Ainda não há páginas de avaliação. Crie uma acima para começar.", shareLink: "Link compartilhável", copied: "Copiado!", copy: "Copiar", open: "Abrir", reviewsLabel: "Avaliações", refreshing: "Atualizando…", refresh: "↻ Atualizar", loadingReviews: "Carregando avaliações…", noReviews: "Ainda não há avaliações. Compartilhe seu link para começar a coletar.", anonymous: "Anônimo", deleteAria: "Excluir avaliação", reviewOne: "avaliação", reviewMany: "avaliações" },
  pl: { eyebrow: "Telemetria zaufania", title: "Opinie", sub: "Zbieraj opinie klientów za pomocą linku do udostępnienia i czytaj je wszystkie w jednym miejscu.", loading: "Ładowanie…", loginTitle: "Zaloguj się, aby zarządzać opiniami", loginBody: "Potrzebujesz konta, aby utworzyć firmę i zbierać opinie.", login: "Zaloguj się", createTitle: "Utwórz stronę opinii", createBody: "Nadaj nazwę firmie. Otrzymasz link do udostępnienia klientom.", placeholder: "np. Casa Azul Café", creating: "Tworzenie…", create: "Utwórz", errLogin: "Zaloguj się ponownie.", errCreate: "Nie udało się utworzyć.", noBiz: "Nie ma jeszcze stron opinii. Utwórz jedną powyżej, aby zacząć.", shareLink: "Link do udostępnienia", copied: "Skopiowano!", copy: "Kopiuj", open: "Otwórz", reviewsLabel: "Opinie", refreshing: "Odświeżanie…", refresh: "↻ Odśwież", loadingReviews: "Ładowanie opinii…", noReviews: "Nie ma jeszcze opinii. Udostępnij swój link, aby zacząć je zbierać.", anonymous: "Anonim", deleteAria: "Usuń opinię", reviewOne: "opinia", reviewMany: "opinie" },
  ru: { eyebrow: "Телеметрия доверия", title: "Отзывы", sub: "Собирайте отзывы клиентов с помощью ссылки для обмена и читайте их все в одном месте.", loading: "Загрузка…", loginTitle: "Войдите, чтобы управлять отзывами", loginBody: "Чтобы создать бизнес и собирать отзывы, нужна учётная запись.", login: "Войти", createTitle: "Создать страницу отзывов", createBody: "Дайте название бизнесу. Вы получите ссылку, чтобы поделиться с клиентами.", placeholder: "напр., Casa Azul Café", creating: "Создание…", create: "Создать", errLogin: "Войдите снова.", errCreate: "Не удалось создать.", noBiz: "Пока нет страниц отзывов. Создайте одну выше, чтобы начать.", shareLink: "Ссылка для обмена", copied: "Скопировано!", copy: "Копировать", open: "Открыть", reviewsLabel: "Отзывы", refreshing: "Обновление…", refresh: "↻ Обновить", loadingReviews: "Загрузка отзывов…", noReviews: "Пока нет отзывов. Поделитесь ссылкой, чтобы начать их собирать.", anonymous: "Аноним", deleteAria: "Удалить отзыв", reviewOne: "отзыв", reviewMany: "отзывов" },
};

function Stars({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <span style={{ whiteSpace: "nowrap", letterSpacing: 1 }} aria-label={`${value} / 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} style={{ color: n <= Math.round(value) ? GOLD : "rgba(255,255,255,.18)", fontSize: size }}>★</span>
      ))}
    </span>
  );
}

export default function Page() {
  const { lang } = useTranslation();
  const s = STRINGS[lang] ?? STRINGS.en;
  const [authChecked, setAuthChecked] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [businesses, setBusinesses] = useState<ReviewBusiness[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      const isIn = Boolean(data.user);
      setSignedIn(isIn);
      setAuthChecked(true);
      if (isIn) {
        const list = await getMyBusinesses();
        setBusinesses(list);
        if (list[0]) setActiveId(list[0].id);
      }
    });
  }, []);

  async function loadReviews(businessId: string) {
    setLoadingReviews(true);
    const r = await getReviewsForBusiness(businessId);
    setReviews(r);
    setLoadingReviews(false);
  }

  useEffect(() => {
    if (!activeId) { setReviews([]); return; }
    void loadReviews(activeId);
  }, [activeId]);

  const active = useMemo(() => businesses.find((b) => b.id === activeId) || null, [businesses, activeId]);
  const avg = useMemo(() => averageRating(reviews), [reviews]);

  async function handleCreate() {
    const name = newName.trim();
    if (!name || creating) return;
    setCreating(true);
    setCreateError(null);
    const res = await createBusiness(name);
    setCreating(false);
    if (res.business) {
      setBusinesses((prev) => [res.business as ReviewBusiness, ...prev]);
      setActiveId(res.business.id);
      setNewName("");
    } else {
      setCreateError(res.error === "not_authenticated" ? s.errLogin : s.errCreate);
    }
  }

  function copyLink(slug: string) {
    const url = `${origin}/r/${slug}`;
    navigator.clipboard?.writeText(url).then(() => {
      setCopied(slug);
      setTimeout(() => setCopied((c) => (c === slug ? null : c)), 1800);
    });
  }

  async function handleDelete(reviewId: string) {
    const res = await deleteReview(reviewId);
    if (res.ok) setReviews((prev) => prev.filter((r) => r.id !== reviewId));
  }

  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        <header style={styles.header}>
          <p style={styles.eyebrow}>{s.eyebrow}</p>
          <h1 style={styles.h1}>{s.title}</h1>
          <p style={styles.sub}>{s.sub}</p>
        </header>
        {!authChecked ? (
          <p style={styles.muted}>{s.loading}</p>
        ) : !signedIn ? (
          <div style={styles.card}>
            <h2 style={styles.h2}>{s.loginTitle}</h2>
            <p style={styles.muted}>{s.loginBody}</p>
            <Link href="/auth/login?next=/reviews" style={styles.primaryBtn}>{s.login}</Link>
          </div>
        ) : (
          <>
            <div style={styles.card}>
              <h2 style={styles.h2}>{s.createTitle}</h2>
              <p style={styles.muted}>{s.createBody}</p>
              <div style={styles.createRow}>
                <input style={styles.input} value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleCreate()} placeholder={s.placeholder} maxLength={80} />
                <button type="button" onClick={handleCreate} disabled={!newName.trim() || creating} style={{ ...styles.primaryBtn, opacity: !newName.trim() || creating ? 0.5 : 1, whiteSpace: "nowrap" }}>{creating ? s.creating : s.create}</button>
              </div>
              {createError && <p style={styles.error}>{createError}</p>}
            </div>
            {businesses.length === 0 ? (
              <p style={styles.muted}>{s.noBiz}</p>
            ) : (
              <>
                <div style={styles.bizTabs}>
                  {businesses.map((b) => (
                    <button key={b.id} type="button" onClick={() => setActiveId(b.id)} style={{ ...styles.bizTab, ...(b.id === activeId ? styles.bizTabActive : {}) }}>{b.name}</button>
                  ))}
                </div>
                {active && (
                  <>
                    <div style={styles.card}>
                      <span style={styles.telemetryLabel}>{s.shareLink}</span>
                      <div style={styles.linkRow}>
                        <code style={styles.linkCode}>{origin}/r/{active.slug}</code>
                        <button type="button" onClick={() => copyLink(active.slug)} style={styles.copyBtn}>{copied === active.slug ? s.copied : s.copy}</button>
                        <a href={`/r/${active.slug}`} target="_blank" rel="noreferrer" style={styles.openBtn}>{s.open}</a>
                      </div>
                      <div style={styles.summaryRow}>
                        <div style={styles.summaryBlock}><strong style={styles.avgNum}>{avg || "—"}</strong><Stars value={avg} size={18} /></div>
                        <div style={styles.summaryBlock}><strong style={styles.avgNum}>{reviews.length}</strong><span style={styles.muted}>{reviews.length === 1 ? s.reviewOne : s.reviewMany}</span></div>
                      </div>
                    </div>
                    <div style={styles.card}>
                      <div style={styles.reviewsHead}>
                        <span style={styles.telemetryLabel}>{s.reviewsLabel}</span>
                        <button type="button" onClick={() => activeId && loadReviews(activeId)} disabled={loadingReviews} style={styles.refreshBtn}>{loadingReviews ? s.refreshing : s.refresh}</button>
                      </div>
                      {loadingReviews ? (
                        <p style={styles.muted}>{s.loadingReviews}</p>
                      ) : reviews.length === 0 ? (
                        <p style={styles.muted}>{s.noReviews}</p>
                      ) : (
                        <div style={styles.reviewList}>
                          {reviews.map((r) => (
                            <div key={r.id} style={styles.reviewItem}>
                              <div style={styles.reviewTop}>
                                <Stars value={r.rating} />
                                <span style={styles.reviewName}>{r.author_name || s.anonymous}</span>
                                <span style={styles.reviewDate}>{new Date(r.created_at).toLocaleDateString(lang)}</span>
                                <button type="button" onClick={() => handleDelete(r.id)} style={styles.deleteBtn} aria-label={s.deleteAria}>✕</button>
                              </div>
                              {r.comment && <p style={styles.reviewComment}>{r.comment}</p>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  page: { minHeight: "100dvh", background: "radial-gradient(60vw 40vh at 20% -5%, rgba(245,197,66,.08), transparent 60%), linear-gradient(180deg,#06060a,#0a0a12)", padding: "16px 20px 40px", fontFamily: "'Outfit', system-ui, sans-serif" },
  shell: { maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column", gap: 14 },
  header: { marginBottom: 4 },
  eyebrow: { color: GOLD_DEEP, fontSize: 11, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", margin: 0 },
  h1: { color: "#fff", fontSize: 22, fontWeight: 700, margin: "4px 0 4px", letterSpacing: "-0.02em" },
  sub: { color: "#9aa8b8", fontSize: 13, margin: 0, lineHeight: 1.5 },
  card: { background: "linear-gradient(180deg, rgba(20,20,28,.8), rgba(10,10,16,.8))", border: "1px solid rgba(255,255,255,.09)", borderRadius: 20, padding: 20, boxShadow: "inset 0 1px 0 rgba(255,255,255,.05)" },
  h2: { color: "#fff", fontSize: 16, fontWeight: 700, margin: "0 0 5px" },
  muted: { color: "#9aa8b8", fontSize: 13, margin: 0, lineHeight: 1.5 },
  telemetryLabel: { display: "block", color: GOLD_DEEP, fontSize: 11, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 12 },
  reviewsHead: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  refreshBtn: { padding: "5px 10px", borderRadius: 9, border: "1px solid rgba(255,255,255,.14)", background: "rgba(255,255,255,.05)", color: "#cbd5e1", fontSize: 12, fontWeight: 700, cursor: "pointer" },
  createRow: { display: "flex", gap: 10, marginTop: 12 },
  input: { flex: 1, boxSizing: "border-box", padding: "10px 12px", borderRadius: 11, border: "1px solid rgba(255,255,255,.12)", background: "rgba(8,8,12,.7)", color: "#e6edf3", fontSize: 13, fontFamily: "inherit", outline: "none" },
  primaryBtn: { display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "10px 18px", borderRadius: 11, border: "none", color: "#06060a", fontWeight: 800, fontSize: 13, textDecoration: "none", background: `linear-gradient(135deg, ${GOLD}, ${GOLD_DEEP})`, cursor: "pointer" },
  error: { color: "#f8857a", fontSize: 13, margin: "8px 0 0" },
  bizTabs: { display: "flex", flexWrap: "wrap", gap: 8 },
  bizTab: { padding: "7px 14px", borderRadius: 999, border: "1px solid rgba(255,255,255,.14)", background: "rgba(255,255,255,.04)", color: "#cbd5e1", fontSize: 13, fontWeight: 700, cursor: "pointer" },
  bizTabActive: { background: `linear-gradient(135deg, ${GOLD}, ${GOLD_DEEP})`, color: "#06060a", border: "1px solid transparent" },
  linkRow: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
  linkCode: { flex: 1, minWidth: 180, padding: "9px 11px", borderRadius: 10, background: "rgba(8,8,12,.7)", border: "1px solid rgba(255,255,255,.1)", color: GOLD, fontSize: 12, fontFamily: "monospace", overflowX: "auto" },
  copyBtn: { padding: "9px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,.14)", background: "rgba(255,255,255,.06)", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" },
  openBtn: { padding: "9px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,.14)", background: "rgba(255,255,255,.06)", color: "#fff", fontSize: 12, fontWeight: 700, textDecoration: "none" },
  summaryRow: { display: "flex", gap: 28, marginTop: 16 },
  summaryBlock: { display: "flex", flexDirection: "column", gap: 3 },
  avgNum: { color: "#fff", fontSize: 24, fontWeight: 800, lineHeight: 1 },
  reviewList: { display: "flex", flexDirection: "column", gap: 10 },
  reviewItem: { padding: 12, borderRadius: 12, background: "rgba(8,8,12,.5)", border: "1px solid rgba(255,255,255,.06)" },
  reviewTop: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
  reviewName: { color: "#e6edf3", fontSize: 13, fontWeight: 700 },
  reviewDate: { color: "#6b7685", fontSize: 11, marginLeft: "auto" },
  reviewComment: { color: "#cbd5e1", fontSize: 13, margin: "8px 0 0", lineHeight: 1.5 },
  deleteBtn: { background: "none", border: "none", color: "#6b7685", fontSize: 14, cursor: "pointer", padding: "0 4px" },
};
