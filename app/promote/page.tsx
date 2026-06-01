// File: app/promote/page.tsx
// Promote → Offers manager. Logged-in owners create, edit, activate/deactivate,
// and delete their promotional offers. Real CRUD backed by Supabase (RLS keeps
// each owner to their own rows). Translations are self-contained in this file.
"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import useTranslation from "@/components/i18n/useTranslation";
import { getMyOffers, createOffer, updateOffer, deleteOffer, type Offer } from "@/lib/offers";

const GOLD = "#f5c542";
const GOLD_DEEP = "#dfa837";

type Strings = {
  eyebrow: string;
  title: string;
  sub: string;
  loading: string;
  loginTitle: string;
  loginBody: string;
  login: string;
  createTitle: string;
  createBody: string;
  titlePh: string;
  descPh: string;
  codePh: string;
  creating: string;
  create: string;
  errLogin: string;
  errCreate: string;
  noOffers: string;
  yourOffers: string;
  active: string;
  inactive: string;
  activate: string;
  deactivate: string;
  edit: string;
  save: string;
  cancel: string;
  del: string;
  codeLabel: string;
  saving: string;
};

const STRINGS: Record<string, Strings> = {
  en: {
    eyebrow: "Campaign tools", title: "Promote",
    sub: "Create and manage your promotional offers in one place.",
    loading: "Loading…", loginTitle: "Log in to manage offers",
    loginBody: "You need an account to create and manage offers.", login: "Log in",
    createTitle: "Create an offer", createBody: "Give it a title. Add a description and a promo code if you like.",
    titlePh: "e.g. 20% off your first visit", descPh: "Describe the offer (optional)", codePh: "Promo code (optional)",
    creating: "Creating…", create: "Create offer", errLogin: "Please log in again.", errCreate: "Could not create.",
    noOffers: "No offers yet. Create one above to get started.", yourOffers: "Your offers",
    active: "Active", inactive: "Inactive", activate: "Activate", deactivate: "Deactivate",
    edit: "Edit", save: "Save", cancel: "Cancel", del: "Delete", codeLabel: "Code", saving: "Saving…",
  },
  es: {
    eyebrow: "Herramientas de campaña", title: "Promover",
    sub: "Crea y gestiona tus ofertas promocionales en un solo lugar.",
    loading: "Cargando…", loginTitle: "Inicia sesión para gestionar ofertas",
    loginBody: "Necesitas una cuenta para crear y gestionar ofertas.", login: "Iniciar sesión",
    createTitle: "Crear una oferta", createBody: "Ponle un título. Agrega una descripción y un código promocional si quieres.",
    titlePh: "p. ej., 20% de descuento en tu primera visita", descPh: "Describe la oferta (opcional)", codePh: "Código promocional (opcional)",
    creating: "Creando…", create: "Crear oferta", errLogin: "Vuelve a iniciar sesión.", errCreate: "No se pudo crear.",
    noOffers: "Aún no hay ofertas. Crea una arriba para empezar.", yourOffers: "Tus ofertas",
    active: "Activa", inactive: "Inactiva", activate: "Activar", deactivate: "Desactivar",
    edit: "Editar", save: "Guardar", cancel: "Cancelar", del: "Eliminar", codeLabel: "Código", saving: "Guardando…",
  },
  pt: {
    eyebrow: "Ferramentas de campanha", title: "Promover",
    sub: "Crie e gerencie suas ofertas promocionais em um só lugar.",
    loading: "Carregando…", loginTitle: "Entre para gerenciar ofertas",
    loginBody: "Você precisa de uma conta para criar e gerenciar ofertas.", login: "Entrar",
    createTitle: "Criar uma oferta", createBody: "Dê um título. Adicione uma descrição e um código promocional se quiser.",
    titlePh: "ex.: 20% de desconto na primeira visita", descPh: "Descreva a oferta (opcional)", codePh: "Código promocional (opcional)",
    creating: "Criando…", create: "Criar oferta", errLogin: "Faça login novamente.", errCreate: "Não foi possível criar.",
    noOffers: "Ainda não há ofertas. Crie uma acima para começar.", yourOffers: "Suas ofertas",
    active: "Ativa", inactive: "Inativa", activate: "Ativar", deactivate: "Desativar",
    edit: "Editar", save: "Salvar", cancel: "Cancelar", del: "Excluir", codeLabel: "Código", saving: "Salvando…",
  },
  pl: {
    eyebrow: "Narzędzia kampanii", title: "Promuj",
    sub: "Twórz i zarządzaj swoimi ofertami promocyjnymi w jednym miejscu.",
    loading: "Ładowanie…", loginTitle: "Zaloguj się, aby zarządzać ofertami",
    loginBody: "Potrzebujesz konta, aby tworzyć oferty i nimi zarządzać.", login: "Zaloguj się",
    createTitle: "Utwórz ofertę", createBody: "Nadaj tytuł. Dodaj opis i kod promocyjny, jeśli chcesz.",
    titlePh: "np. 20% zniżki na pierwszą wizytę", descPh: "Opisz ofertę (opcjonalnie)", codePh: "Kod promocyjny (opcjonalnie)",
    creating: "Tworzenie…", create: "Utwórz ofertę", errLogin: "Zaloguj się ponownie.", errCreate: "Nie udało się utworzyć.",
    noOffers: "Nie ma jeszcze ofert. Utwórz jedną powyżej, aby zacząć.", yourOffers: "Twoje oferty",
    active: "Aktywna", inactive: "Nieaktywna", activate: "Aktywuj", deactivate: "Dezaktywuj",
    edit: "Edytuj", save: "Zapisz", cancel: "Anuluj", del: "Usuń", codeLabel: "Kod", saving: "Zapisywanie…",
  },
  ru: {
    eyebrow: "Инструменты кампаний", title: "Продвижение",
    sub: "Создавайте предложения и управляйте ими в одном месте.",
    loading: "Загрузка…", loginTitle: "Войдите, чтобы управлять предложениями",
    loginBody: "Чтобы создавать предложения и управлять ими, нужна учётная запись.", login: "Войти",
    createTitle: "Создать предложение", createBody: "Укажите заголовок. При желании добавьте описание и промокод.",
    titlePh: "напр., скидка 20% на первый визит", descPh: "Опишите предложение (необязательно)", codePh: "Промокод (необязательно)",
    creating: "Создание…", create: "Создать предложение", errLogin: "Войдите снова.", errCreate: "Не удалось создать.",
    noOffers: "Пока нет предложений. Создайте одно выше, чтобы начать.", yourOffers: "Ваши предложения",
    active: "Активно", inactive: "Неактивно", activate: "Активировать", deactivate: "Деактивировать",
    edit: "Изменить", save: "Сохранить", cancel: "Отмена", del: "Удалить", codeLabel: "Код", saving: "Сохранение…",
  },
};

export default function Page() {
  const { lang } = useTranslation();
  const s = STRINGS[lang] ?? STRINGS.en;

  const [authChecked, setAuthChecked] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [offers, setOffers] = useState<Offer[]>([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [code, setCode] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editCode, setEditCode] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      const isIn = Boolean(data.user);
      setSignedIn(isIn);
      setAuthChecked(true);
      if (isIn) setOffers(await getMyOffers());
    });
  }, []);

  async function handleCreate() {
    const t = title.trim();
    if (!t || creating) return;
    setCreating(true);
    setCreateError(null);
    const res = await createOffer({ title: t, description, code });
    setCreating(false);
    if (res.offer) {
      setOffers((prev) => [res.offer as Offer, ...prev]);
      setTitle("");
      setDescription("");
      setCode("");
    } else {
      setCreateError(res.error === "not_authenticated" ? s.errLogin : s.errCreate);
    }
  }

  async function handleToggle(offer: Offer) {
    const next = !offer.active;
    setOffers((prev) => prev.map((o) => (o.id === offer.id ? { ...o, active: next } : o)));
    const res = await updateOffer(offer.id, { active: next });
    if (!res.ok) setOffers((prev) => prev.map((o) => (o.id === offer.id ? { ...o, active: offer.active } : o)));
  }

  function startEdit(offer: Offer) {
    setEditingId(offer.id);
    setEditTitle(offer.title);
    setEditDesc(offer.description ?? "");
    setEditCode(offer.code ?? "");
  }

  async function saveEdit(id: string) {
    if (!editTitle.trim() || savingId) return;
    setSavingId(id);
    const res = await updateOffer(id, { title: editTitle, description: editDesc, code: editCode });
    setSavingId(null);
    if (res.ok) {
      setOffers((prev) =>
        prev.map((o) =>
          o.id === id
            ? { ...o, title: editTitle.trim(), description: editDesc.trim() || null, code: editCode.trim() || null }
            : o
        )
      );
      setEditingId(null);
    }
  }

  async function handleDelete(id: string) {
    const res = await deleteOffer(id);
    if (res.ok) setOffers((prev) => prev.filter((o) => o.id !== id));
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
            <Link href="/auth/login?next=/promote" style={styles.primaryBtn}>{s.login}</Link>
          </div>
        ) : (
          <>
            <div style={styles.card}>
              <h2 style={styles.h2}>{s.createTitle}</h2>
              <p style={styles.muted}>{s.createBody}</p>
              <input style={{ ...styles.input, marginTop: 14 }}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={s.titlePh}
                maxLength={120}
              />
              <textarea style={{ ...styles.input, marginTop: 10, minHeight: 70, resize: "vertical" }}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={s.descPh}
                maxLength={600}
              />
              <div style={styles.createRow}>
                <input style={{ ...styles.input, flex: 1 }}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder={s.codePh}
                  maxLength={40}
                />
                <button type="button"
                  onClick={handleCreate}
                  disabled={!title.trim() || creating}
                  style={{ ...styles.primaryBtn, opacity: !title.trim() || creating ? 0.5 : 1, whiteSpace: "nowrap" }}
                >
                  {creating ? s.creating : s.create}
                </button>
              </div>
              {createError && <p style={styles.error}>{createError}</p>}
            </div>

            {offers.length === 0 ? (
              <p style={styles.muted}>{s.noOffers}</p>
            ) : (
              <div style={styles.card}>
                <span style={styles.telemetryLabel}>{s.yourOffers}</span>
                <div style={styles.offerList}>
                  {offers.map((offer) => (
                    <div key={offer.id} style={{ ...styles.offerItem, opacity: offer.active ? 1 : 0.55 }}>
                      {editingId === offer.id ? (
                        <>
                          <input style={styles.input}
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            maxLength={120}
                          />
                          <textarea style={{ ...styles.input, marginTop: 8, minHeight: 60, resize: "vertical" }}
                            value={editDesc}
                            onChange={(e) => setEditDesc(e.target.value)}
                            maxLength={600}
                          />
                          <input style={{ ...styles.input, marginTop: 8 }}
                            value={editCode}
                            onChange={(e) => setEditCode(e.target.value)}
                            maxLength={40}
                          />
                          <div style={styles.btnRow}>
                            <button type="button" onClick={() => saveEdit(offer.id)} disabled={!editTitle.trim() || savingId === offer.id} style={styles.smallPrimary}>
                              {savingId === offer.id ? s.saving : s.save}
                            </button>
                            <button type="button" onClick={() => setEditingId(null)} style={styles.smallGhost}>{s.cancel}</button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div style={styles.offerTop}>
                            <strong style={styles.offerTitle}>{offer.title}</strong>
                            <span style={offer.active ? styles.pillOn : styles.pillOff}>{offer.active ? s.active : s.inactive}</span>
                          </div>
                          {offer.description && <p style={styles.offerDesc}>{offer.description}</p>}
                          {offer.code && (
                            <p style={styles.offerCode}>{s.codeLabel}: <code>{offer.code}</code></p>
                          )}
                          <div style={styles.btnRow}>
                            <button type="button" onClick={() => handleToggle(offer)} style={styles.smallGhost}>
                              {offer.active ? s.deactivate : s.activate}
                            </button>
                            <button type="button" onClick={() => startEdit(offer)} style={styles.smallGhost}>{s.edit}</button>
                            <button type="button" onClick={() => handleDelete(offer.id)} style={styles.smallDanger}>{s.del}</button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100dvh",
    background: "radial-gradient(60vw 40vh at 20% -5%, rgba(245,197,66,.08), transparent 60%), linear-gradient(180deg,#06060a,#0a0a12)",
    padding: "48px 20px 80px",
    fontFamily: "'Outfit', system-ui, sans-serif",
  },
  shell: { maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column", gap: 18 },
  header: { marginBottom: 6 },
  eyebrow: { color: GOLD_DEEP, fontSize: 11, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", margin: 0 },
  h1: { color: "#fff", fontSize: 34, fontWeight: 700, margin: "8px 0 6px", letterSpacing: "-0.02em" },
  sub: { color: "#9aa8b8", fontSize: 15, margin: 0, lineHeight: 1.55 },
  card: {
    background: "linear-gradient(180deg, rgba(20,20,28,.8), rgba(10,10,16,.8))",
    border: "1px solid rgba(255,255,255,.09)",
    borderRadius: 20,
    padding: 24,
    boxShadow: "inset 0 1px 0 rgba(255,255,255,.05)",
  },
  h2: { color: "#fff", fontSize: 19, fontWeight: 700, margin: "0 0 6px" },
  muted: { color: "#9aa8b8", fontSize: 14, margin: 0, lineHeight: 1.55 },
  telemetryLabel: { display: "block", color: GOLD_DEEP, fontSize: 11, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 14 },
  createRow: { display: "flex", gap: 10, marginTop: 10 },
  input: {
    width: "100%", boxSizing: "border-box", padding: "11px 13px", borderRadius: 11,
    border: "1px solid rgba(255,255,255,.12)", background: "rgba(8,8,12,.7)", color: "#e6edf3",
    fontSize: 14, fontFamily: "inherit", outline: "none",
  },
  primaryBtn: {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    padding: "11px 20px", borderRadius: 11, border: "none", color: "#06060a", fontWeight: 800,
    fontSize: 14, textDecoration: "none", background: `linear-gradient(135deg, ${GOLD}, ${GOLD_DEEP})`, cursor: "pointer",
  },
  error: { color: "#f8857a", fontSize: 13, margin: "10px 0 0" },
  offerList: { display: "flex", flexDirection: "column", gap: 14 },
  offerItem: { padding: 16, borderRadius: 14, background: "rgba(8,8,12,.5)", border: "1px solid rgba(255,255,255,.06)" },
  offerTop: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" },
  offerTitle: { color: "#f5f6f8", fontSize: 15.5, fontWeight: 700 },
  offerDesc: { color: "#cbd5e1", fontSize: 14, margin: "8px 0 0", lineHeight: 1.5 },
  offerCode: { color: "#9aa8b8", fontSize: 13, margin: "8px 0 0" },
  pillOn: {
    marginLeft: "auto", fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase",
    color: "#06060a", background: GOLD, borderRadius: 999, padding: "3px 10px",
  },
  pillOff: {
    marginLeft: "auto", fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase",
    color: "#9aa8b8", background: "rgba(255,255,255,.08)", borderRadius: 999, padding: "3px 10px",
  },
  btnRow: { display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" },
  smallPrimary: {
    padding: "7px 14px", borderRadius: 9, border: "none", color: "#06060a", fontWeight: 800,
    fontSize: 12.5, background: `linear-gradient(135deg, ${GOLD}, ${GOLD_DEEP})`, cursor: "pointer",
  },
  smallGhost: {
    padding: "7px 14px", borderRadius: 9, border: "1px solid rgba(255,255,255,.14)",
    background: "rgba(255,255,255,.05)", color: "#cbd5e1", fontSize: 12.5, fontWeight: 700, cursor: "pointer",
  },
  smallDanger: {
    padding: "7px 14px", borderRadius: 9, border: "1px solid rgba(248,133,122,.3)",
    background: "rgba(248,133,122,.08)", color: "#f8857a", fontSize: 12.5, fontWeight: 700, cursor: "pointer",
  },
};
