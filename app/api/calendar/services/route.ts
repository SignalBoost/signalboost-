"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "@/components/i18n/useTranslation";

type Service = {
  id: string; name: string; slug: string; duration_minutes: number;
  price: number; currency: string; description: string; color: string;
  timezone: string; active: boolean;
};
type Availability = { day_of_week: number; start_time: string; end_time: string };
type Booking = {
  id: string; service_id: string; service_name?: string; service_price?: number;
  service_currency?: string; client_name: string; client_email: string;
  booking_date: string; booking_time: string; status: string; notes: string; created_at: string;
};
type BlockedDate = { id: string; blocked_date: string; reason: string };
type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";
type Lang = "en" | "es" | "pt" | "pl" | "ru";

// ── Translations ──────────────────────────────────────────────
const S = {
  en: {
    title: "Calendar", loading: "Loading…",
    tabs: { services: "Services", bookings: "Bookings", blocked: "Blocked Dates" },
    svc: {
      new: "+ New Service", edit: "Edit Service", create: "Create Service", save: "Save Changes",
      pause: "Pause", reactivate: "Reactivate", delete: "Delete", paused: "PAUSED",
      name: "Service Name", duration: "Duration (minutes)", price: "Price",
      description: "Description", color: "Color", timezone: "Your Timezone",
      link: "Public Booking Link", copy: "Copy", copied: "Link copied!",
      empty: "No services yet. Create your first one.",
      selectHint: "Select a service or create one",
      selectSub: "Each service gets a unique booking page your clients use to schedule with you.",
      saved: "Service saved.",
    },
    avail: {
      title: "Weekly Availability", save: "Save Availability", saved: "Availability saved.",
      weekdays: "Mon–Fri", allDays: "All Days", none: "None", unavailable: "Unavailable", to: "to",
    },
    days: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    bkg: {
      confirm: "✓ Confirm & Email Client", decline: "Decline",
      complete: "Mark Completed", cancel: "Cancel & Email Client",
      revenue: "revenue", none: (f: string) => "No " + f + " bookings.",
    },
    blk: {
      hint: "Blocked dates are hidden from all booking pages. Use for holidays or days off.",
      title: "Block a Date", date: "Date *", reason: "Reason (optional)",
      btn: "Block Date", remove: "Remove",
      upcoming: (n: number) => "Upcoming Blocked Dates (" + n + ")",
      empty: "No blocked dates. All available days are open.",
    },
    status: { pending: "pending", confirmed: "confirmed", completed: "completed", cancelled: "cancelled" },
  },
  es: {
    title: "Calendario", loading: "Cargando…",
    tabs: { services: "Servicios", bookings: "Reservas", blocked: "Fechas Bloqueadas" },
    svc: {
      new: "+ Nuevo Servicio", edit: "Editar Servicio", create: "Crear Servicio", save: "Guardar Cambios",
      pause: "Pausar", reactivate: "Reactivar", delete: "Eliminar", paused: "PAUSADO",
      name: "Nombre del Servicio", duration: "Duración (minutos)", price: "Precio",
      description: "Descripción", color: "Color", timezone: "Tu Zona Horaria",
      link: "Enlace de Reserva Público", copy: "Copiar", copied: "¡Enlace copiado!",
      empty: "Aún no hay servicios. Crea el primero.",
      selectHint: "Selecciona un servicio o crea uno",
      selectSub: "Cada servicio obtiene una página de reservas pública para tus clientes.",
      saved: "Servicio guardado.",
    },
    avail: {
      title: "Disponibilidad Semanal", save: "Guardar Disponibilidad", saved: "Disponibilidad guardada.",
      weekdays: "Lun–Vie", allDays: "Todos", none: "Ninguno", unavailable: "No disponible", to: "a",
    },
    days: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
    bkg: {
      confirm: "✓ Confirmar y Enviar Email", decline: "Rechazar",
      complete: "Marcar Completado", cancel: "Cancelar y Enviar Email",
      revenue: "ingresos", none: (f: string) => "No hay reservas " + f + ".",
    },
    blk: {
      hint: "Las fechas bloqueadas no aparecen en las páginas de reservas.",
      title: "Bloquear una Fecha", date: "Fecha *", reason: "Motivo (opcional)",
      btn: "Bloquear Fecha", remove: "Eliminar",
      upcoming: (n: number) => "Fechas Bloqueadas Próximas (" + n + ")",
      empty: "Sin fechas bloqueadas. Todos los días disponibles están abiertos.",
    },
    status: { pending: "pendiente", confirmed: "confirmado", completed: "completado", cancelled: "cancelado" },
  },
  pt: {
    title: "Calendário", loading: "Carregando…",
    tabs: { services: "Serviços", bookings: "Reservas", blocked: "Datas Bloqueadas" },
    svc: {
      new: "+ Novo Serviço", edit: "Editar Serviço", create: "Criar Serviço", save: "Salvar Alterações",
      pause: "Pausar", reactivate: "Reativar", delete: "Excluir", paused: "PAUSADO",
      name: "Nome do Serviço", duration: "Duração (minutos)", price: "Preço",
      description: "Descrição", color: "Cor", timezone: "Seu Fuso Horário",
      link: "Link de Reserva Público", copy: "Copiar", copied: "Link copiado!",
      empty: "Nenhum serviço ainda. Crie o primeiro.",
      selectHint: "Selecione um serviço ou crie um",
      selectSub: "Cada serviço tem uma página de reservas pública para seus clientes.",
      saved: "Serviço salvo.",
    },
    avail: {
      title: "Disponibilidade Semanal", save: "Salvar Disponibilidade", saved: "Disponibilidade salva.",
      weekdays: "Seg–Sex", allDays: "Todos", none: "Nenhum", unavailable: "Indisponível", to: "até",
    },
    days: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
    bkg: {
      confirm: "✓ Confirmar e Enviar Email", decline: "Recusar",
      complete: "Marcar como Concluído", cancel: "Cancelar e Enviar Email",
      revenue: "receita", none: (f: string) => "Nenhuma reserva " + f + ".",
    },
    blk: {
      hint: "Datas bloqueadas não aparecem nas páginas de reservas.",
      title: "Bloquear uma Data", date: "Data *", reason: "Motivo (opcional)",
      btn: "Bloquear Data", remove: "Remover",
      upcoming: (n: number) => "Datas Bloqueadas Próximas (" + n + ")",
      empty: "Sem datas bloqueadas. Todos os dias disponíveis estão abertos.",
    },
    status: { pending: "pendente", confirmed: "confirmado", completed: "concluído", cancelled: "cancelado" },
  },
  pl: {
    title: "Kalendarz", loading: "Ładowanie…",
    tabs: { services: "Usługi", bookings: "Rezerwacje", blocked: "Zablokowane Daty" },
    svc: {
      new: "+ Nowa Usługa", edit: "Edytuj Usługę", create: "Utwórz Usługę", save: "Zapisz Zmiany",
      pause: "Wstrzymaj", reactivate: "Reaktywuj", delete: "Usuń", paused: "WSTRZYMANO",
      name: "Nazwa Usługi", duration: "Czas trwania (minuty)", price: "Cena",
      description: "Opis", color: "Kolor", timezone: "Twoja Strefa Czasowa",
      link: "Publiczny Link Rezerwacji", copy: "Kopiuj", copied: "Link skopiowany!",
      empty: "Brak usług. Utwórz pierwszą.",
      selectHint: "Wybierz usługę lub utwórz nową",
      selectSub: "Każda usługa ma publiczną stronę rezerwacji dla Twoich klientów.",
      saved: "Usługa zapisana.",
    },
    avail: {
      title: "Tygodniowa Dostępność", save: "Zapisz Dostępność", saved: "Dostępność zapisana.",
      weekdays: "Pon–Pt", allDays: "Wszystkie", none: "Żaden", unavailable: "Niedostępny", to: "do",
    },
    days: ["Nd", "Pn", "Wt", "Śr", "Cz", "Pt", "Sb"],
    bkg: {
      confirm: "✓ Potwierdź i wyślij email", decline: "Odrzuć",
      complete: "Oznacz jako ukończone", cancel: "Anuluj i wyślij email",
      revenue: "przychód", none: (f: string) => "Brak rezerwacji: " + f + ".",
    },
    blk: {
      hint: "Zablokowane daty nie są widoczne na stronach rezerwacji.",
      title: "Zablokuj Datę", date: "Data *", reason: "Powód (opcjonalnie)",
      btn: "Zablokuj Datę", remove: "Usuń",
      upcoming: (n: number) => "Nadchodzące Zablokowane Daty (" + n + ")",
      empty: "Brak zablokowanych dat. Wszystkie dostępne dni są otwarte.",
    },
    status: { pending: "oczekująca", confirmed: "potwierdzona", completed: "ukończona", cancelled: "anulowana" },
  },
  ru: {
    title: "Календарь", loading: "Загрузка…",
    tabs: { services: "Услуги", bookings: "Бронирования", blocked: "Заблокированные Даты" },
    svc: {
      new: "+ Новая Услуга", edit: "Редактировать Услугу", create: "Создать Услугу", save: "Сохранить Изменения",
      pause: "Приостановить", reactivate: "Возобновить", delete: "Удалить", paused: "ПАУЗА",
      name: "Название Услуги", duration: "Продолжительность (мин)", price: "Цена",
      description: "Описание", color: "Цвет", timezone: "Ваш Часовой Пояс",
      link: "Публичная Ссылка для Бронирования", copy: "Копировать", copied: "Ссылка скопирована!",
      empty: "Нет услуг. Создайте первую.",
      selectHint: "Выберите услугу или создайте новую",
      selectSub: "Каждая услуга получает публичную страницу бронирования для ваших клиентов.",
      saved: "Услуга сохранена.",
    },
    avail: {
      title: "Еженедельная Доступность", save: "Сохранить Доступность", saved: "Доступность сохранена.",
      weekdays: "Пн–Пт", allDays: "Все дни", none: "Никакой", unavailable: "Недоступно", to: "до",
    },
    days: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
    bkg: {
      confirm: "✓ Подтвердить и отправить email", decline: "Отклонить",
      complete: "Отметить выполненным", cancel: "Отменить и отправить email",
      revenue: "доход", none: (f: string) => "Нет бронирований: " + f + ".",
    },
    blk: {
      hint: "Заблокированные даты скрыты на страницах бронирования.",
      title: "Заблокировать Дату", date: "Дата *", reason: "Причина (необязательно)",
      btn: "Заблокировать Дату", remove: "Удалить",
      upcoming: (n: number) => "Ближайшие Заблокированные Даты (" + n + ")",
      empty: "Нет заблокированных дат. Все доступные дни открыты.",
    },
    status: { pending: "ожидает", confirmed: "подтверждено", completed: "завершено", cancelled: "отменено" },
  },
};

function asLang(v: string): Lang {
  return (["en", "es", "pt", "pl", "ru"] as Lang[]).includes(v as Lang) ? (v as Lang) : "en";
}

const TIMEZONES = [
  "UTC", "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
  "America/Mexico_City", "America/Bogota", "America/Lima", "America/Santiago",
  "America/Buenos_Aires", "America/Sao_Paulo", "America/Caracas",
  "Europe/London", "Europe/Lisbon", "Europe/Paris", "Europe/Berlin", "Europe/Warsaw",
  "Europe/Rome", "Europe/Madrid", "Europe/Moscow",
  "Asia/Dubai", "Asia/Kolkata", "Asia/Bangkok", "Asia/Singapore",
  "Asia/Shanghai", "Asia/Tokyo", "Asia/Seoul",
  "Australia/Sydney", "Pacific/Auckland",
];

const gold = "#f5c542";
const bg = "#06060a";
const surface = "rgba(255,255,255,0.03)";
const border = "rgba(255,255,255,0.08)";
const textMuted = "rgba(255,255,255,0.4)";
const COLORS = ["#f5c542", "#3b82f6", "#10b981", "#8b5cf6", "#ef4444", "#f97316", "#06b6d4"];

const inp: React.CSSProperties = {
  width: "100%", background: "rgba(255,255,255,0.06)", border: `1px solid ${border}`,
  borderRadius: 7, padding: "9px 12px", color: "#fff", fontFamily: "Outfit, sans-serif",
  fontSize: 14, boxSizing: "border-box", outline: "none",
};

function Btn({ onClick, disabled, children, variant = "default", small }: {
  onClick?: () => void; disabled?: boolean; children: React.ReactNode;
  variant?: "gold" | "green" | "red" | "ghost" | "default"; small?: boolean;
}) {
  const map: Record<string, React.CSSProperties> = {
    gold:    { background: gold, color: "#000", border: "none" },
    green:   { background: "rgba(16,185,129,0.12)", color: "#34d399", border: "1px solid rgba(16,185,129,0.3)" },
    red:     { background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)" },
    ghost:   { background: "transparent", color: textMuted, border: `1px solid ${border}` },
    default: { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.75)", border: `1px solid ${border}` },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{
      ...map[variant], borderRadius: 7, padding: small ? "5px 10px" : "8px 16px",
      fontFamily: "Outfit, sans-serif", fontSize: small ? 12 : 13, fontWeight: 600,
      cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, whiteSpace: "nowrap",
    }}>{children}</button>
  );
}

const DEFAULT_AVAIL = [
  { day: 0, enabled: false, start: "09:00", end: "17:00" },
  { day: 1, enabled: true,  start: "09:00", end: "17:00" },
  { day: 2, enabled: true,  start: "09:00", end: "17:00" },
  { day: 3, enabled: true,  start: "09:00", end: "17:00" },
  { day: 4, enabled: true,  start: "09:00", end: "17:00" },
  { day: 5, enabled: true,  start: "09:00", end: "17:00" },
  { day: 6, enabled: false, start: "09:00", end: "17:00" },
];

export default function CalendarDashboard({ userId: _userId }: { userId: string }) {
  const { lang: rawLang } = useTranslation();
  const lang = asLang(rawLang);
  const s = S[lang];

  const [tab, setTab] = useState<"services" | "bookings" | "blocked">("services");
  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [blocked, setBlocked] = useState<BlockedDate[]>([]);
  const [counts, setCounts] = useState({ pending: 0, confirmed: 0, completed: 0, cancelled: 0 });
  const [revenue, setRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  const [selectedSvcId, setSelectedSvcId] = useState<string | null>(null);
  const [showAddSvc, setShowAddSvc] = useState(false);
  const [avail, setAvail] = useState(DEFAULT_AVAIL.map(d => ({ ...d })));
  const [savingAvail, setSavingAvail] = useState(false);

  const [svcName, setSvcName] = useState("");
  const [svcDuration, setSvcDuration] = useState("60");
  const [svcPrice, setSvcPrice] = useState("0");
  const [svcCurrency, setSvcCurrency] = useState("USD");
  const [svcDesc, setSvcDesc] = useState("");
  const [svcColor, setSvcColor] = useState(COLORS[0]);
  const [svcTimezone, setSvcTimezone] = useState("UTC");
  const [savingSvc, setSavingSvc] = useState(false);

  const [bkgFilter, setBkgFilter] = useState<BookingStatus>("pending");
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [newBlockDate, setNewBlockDate] = useState("");
  const [newBlockReason, setNewBlockReason] = useState("");
  const [addingBlock, setAddingBlock] = useState(false);
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    try {
      const [sRes, bRes, blRes] = await Promise.all([
        fetch("/api/calendar/services"),
        fetch("/api/calendar/bookings"),
        fetch("/api/calendar/blocked"),
      ]);
      if (sRes.ok) { const d = await sRes.json(); setServices(d.services || []); }
      if (bRes.ok) { const d = await bRes.json(); setBookings(d.bookings || []); setCounts(d.counts || {}); setRevenue(d.revenue || 0); }
      if (blRes.ok) { const d = await blRes.json(); setBlocked(d.blocked || []); }
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Detect browser timezone on mount
  useEffect(() => {
    try { setSvcTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone); } catch { setSvcTimezone("UTC"); }
  }, []);

  const selectedSvc = services.find(sv => sv.id === selectedSvcId) || null;

  async function loadAvailability(serviceId: string) {
    const res = await fetch("/api/calendar/availability?serviceId=" + serviceId);
    if (!res.ok) return;
    const data = await res.json();
    const loaded: Availability[] = data.availability || [];
    setAvail(DEFAULT_AVAIL.map(d => {
      const found = loaded.find(a => a.day_of_week === d.day);
      return { ...d, enabled: !!found, start: found?.start_time || "09:00", end: found?.end_time || "17:00" };
    }));
  }

  function resetSvcForm() {
    setSvcName(""); setSvcDuration("60"); setSvcPrice("0");
    setSvcCurrency("USD"); setSvcDesc(""); setSvcColor(COLORS[0]);
    try { setSvcTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone); } catch { setSvcTimezone("UTC"); }
  }

  function populateSvcForm(svc: Service) {
    setSvcName(svc.name); setSvcDuration(String(svc.duration_minutes));
    setSvcPrice(String(svc.price)); setSvcCurrency(svc.currency);
    setSvcDesc(svc.description); setSvcColor(svc.color);
    setSvcTimezone(svc.timezone || "UTC");
  }

  // Availability quick-select helpers
  function setWeekdays() {
    setAvail(prev => prev.map(d => ({ ...d, enabled: d.day >= 1 && d.day <= 5 })));
  }
  function setAllDays() {
    setAvail(prev => prev.map(d => ({ ...d, enabled: true })));
  }
  function clearDays() {
    setAvail(prev => prev.map(d => ({ ...d, enabled: false })));
  }

  async function handleSaveService() {
    if (!svcName.trim()) return;
    setSavingSvc(true);
    try {
      if (selectedSvc) {
        await fetch("/api/calendar/services", {
          method: "PUT", headers: { "content-type": "application/json" },
          body: JSON.stringify({ serviceId: selectedSvc.id, name: svcName, duration_minutes: parseInt(svcDuration), price: parseFloat(svcPrice), currency: svcCurrency, description: svcDesc, color: svcColor, timezone: svcTimezone }),
        });
      } else {
        const res = await fetch("/api/calendar/services", {
          method: "POST", headers: { "content-type": "application/json" },
          body: JSON.stringify({ name: svcName, duration_minutes: parseInt(svcDuration), price: parseFloat(svcPrice), currency: svcCurrency, description: svcDesc, color: svcColor, timezone: svcTimezone }),
        });
        const data = await res.json();
        if (data.service) { setSelectedSvcId(data.service.id); setShowAddSvc(false); }
      }
      await load();
      setNotice(s.svc.saved);
    } finally { setSavingSvc(false); }
  }

  async function handleToggleActive(svc: Service) {
    await fetch("/api/calendar/services", {
      method: "PUT", headers: { "content-type": "application/json" },
      body: JSON.stringify({ serviceId: svc.id, active: !svc.active }),
    });
    await load();
  }

  async function handleDeleteService(svc: Service) {
    if (!confirm('Delete "' + svc.name + '"?')) return;
    await fetch("/api/calendar/services", {
      method: "DELETE", headers: { "content-type": "application/json" },
      body: JSON.stringify({ serviceId: svc.id }),
    });
    setSelectedSvcId(null);
    await load();
  }

  async function handleSaveAvailability() {
    if (!selectedSvcId) return;
    setSavingAvail(true);
    const slots = avail.filter(d => d.enabled).map(d => ({ day_of_week: d.day, start_time: d.start, end_time: d.end }));
    await fetch("/api/calendar/availability", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ serviceId: selectedSvcId, slots }),
    });
    setSavingAvail(false);
    setNotice(s.avail.saved);
  }

  async function handleBookingAction(b: Booking, status: BookingStatus) {
    setActioningId(b.id);
    await fetch("/api/calendar/bookings", {
      method: "PUT", headers: { "content-type": "application/json" },
      body: JSON.stringify({ bookingId: b.id, status, clientEmail: b.client_email, clientName: b.client_name, serviceName: b.service_name, bookingDate: b.booking_date, bookingTime: b.booking_time, currency: b.service_currency, price: b.service_price }),
    });
    setActioningId(null);
    await load();
    setNotice(status === "confirmed" ? s.bkg.confirm + " → " + b.client_email : s.status[status as BookingStatus]);
  }

  async function handleAddBlock() {
    if (!newBlockDate) return;
    setAddingBlock(true);
    await fetch("/api/calendar/blocked", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ date: newBlockDate, reason: newBlockReason }),
    });
    setNewBlockDate(""); setNewBlockReason("");
    setAddingBlock(false);
    await load();
  }

  async function handleRemoveBlock(id: string) {
    await fetch("/api/calendar/blocked", {
      method: "DELETE", headers: { "content-type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await load();
  }

  const visibleBookings = bookings.filter(b => b.status === bkgFilter);
  const bookingLink = (svc: Service) => "https://signalboostapp.com/book/" + svc.slug;

  if (loading) {
    return <div style={{ minHeight: "100vh", background: bg, display: "flex", alignItems: "center", justifyContent: "center", color: textMuted, fontFamily: "Outfit, sans-serif" }}>{s.loading}</div>;
  }

  return (
    <div style={{ minHeight: "100vh", background: bg, fontFamily: "Outfit, sans-serif", color: "#fff", display: "flex", flexDirection: "column" }}>

      {/* Header */}
      <div style={{ borderBottom: `1px solid ${border}`, padding: "20px 28px 16px", flexShrink: 0 }}>
        <p style={{ color: gold, fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", margin: "0 0 4px", textTransform: "uppercase" }}>SignalBoost</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <h1 style={{ fontFamily: "Fraunces, serif", fontSize: 30, fontWeight: 700, margin: 0 }}>{s.title}</h1>
          <div style={{ display: "flex", gap: 16, fontSize: 13, color: textMuted }}>
            <span>📋 <strong style={{ color: "#fff" }}>{counts.pending}</strong> {s.status.pending}</span>
            <span>✓ <strong style={{ color: "#fff" }}>{counts.confirmed}</strong> {s.status.confirmed}</span>
            {revenue > 0 && <span>💰 <strong style={{ color: gold }}>${revenue.toFixed(2)}</strong> {s.bkg.revenue}</span>}
          </div>
        </div>
        {notice && (
          <div style={{ marginTop: 10, fontSize: 13, color: gold, display: "flex", gap: 8, alignItems: "center" }}>
            {notice} <button onClick={() => setNotice("")} style={{ background: "none", border: "none", color: textMuted, cursor: "pointer" }}>×</button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: `1px solid ${border}`, display: "flex", padding: "0 28px", flexShrink: 0 }}>
        {(["services", "bookings", "blocked"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            background: "none", border: "none", borderBottom: tab === t ? "2px solid " + gold : "2px solid transparent",
            color: tab === t ? gold : textMuted, fontFamily: "Outfit, sans-serif", fontSize: 13,
            fontWeight: tab === t ? 700 : 400, padding: "12px 20px 14px", cursor: "pointer",
          }}>
            {t === "services" ? s.tabs.services : t === "bookings" ? s.tabs.bookings + " (" + (counts.pending + counts.confirmed) + ")" : s.tabs.blocked + " (" + blocked.length + ")"}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden", minHeight: 0 }}>

        {/* ── SERVICES TAB — 3-column ── */}
        {tab === "services" && (
          <>
            {/* Col 1: Service list */}
            <div style={{ width: 240, flexShrink: 0, borderRight: `1px solid ${border}`, display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <div style={{ padding: 14, borderBottom: `1px solid ${border}` }}>
                <Btn onClick={() => { setShowAddSvc(true); setSelectedSvcId(null); resetSvcForm(); }} variant="gold">{s.svc.new}</Btn>
              </div>
              <div style={{ overflowY: "auto", flex: 1 }}>
                {services.length === 0 ? (
                  <div style={{ padding: "20px 16px", color: textMuted, fontSize: 13, textAlign: "center" }}>{s.svc.empty}</div>
                ) : services.map(svc => (
                  <div key={svc.id} onClick={() => { setSelectedSvcId(svc.id); setShowAddSvc(false); populateSvcForm(svc); loadAvailability(svc.id); }}
                    style={{ padding: "12px 16px", cursor: "pointer", borderBottom: `1px solid ${border}`, borderLeft: selectedSvcId === svc.id ? "3px solid " + gold : "3px solid transparent", background: selectedSvcId === svc.id ? "rgba(245,197,66,0.05)" : "transparent" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: svc.color, flexShrink: 0 }} />
                      <span style={{ fontWeight: 600, fontSize: 13, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{svc.name}</span>
                      {!svc.active && <span style={{ fontSize: 9, color: textMuted, background: "rgba(255,255,255,0.06)", padding: "2px 5px", borderRadius: 4 }}>{s.svc.paused}</span>}
                    </div>
                    <div style={{ fontSize: 11, color: textMuted, marginTop: 3, paddingLeft: 16 }}>
                      {svc.duration_minutes} min{Number(svc.price) > 0 ? " · " + svc.currency + " " + Number(svc.price).toFixed(2) : ""}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Col 2: Service form */}
            <div style={{ width: 320, flexShrink: 0, borderRight: `1px solid ${border}`, overflowY: "auto", padding: "20px 20px" }}>
              {!selectedSvc && !showAddSvc ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "50%", color: textMuted, textAlign: "center", gap: 10, paddingTop: 40 }}>
                  <div style={{ fontSize: 36, opacity: 0.3 }}>📅</div>
                  <p style={{ margin: 0, fontSize: 14, color: "rgba(255,255,255,0.3)", fontWeight: 600 }}>{s.svc.selectHint}</p>
                  <p style={{ margin: 0, fontSize: 12 }}>{s.svc.selectSub}</p>
                </div>
              ) : (
                <>
                  <h2 style={{ fontFamily: "Fraunces, serif", fontSize: 18, fontWeight: 700, marginBottom: 18 }}>
                    {showAddSvc ? s.svc.new.replace("+ ", "") : s.svc.edit}
                  </h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {[
                      { label: s.svc.name, val: svcName, set: setSvcName, ph: "e.g. Strategy Call", full: true },
                    ].map(({ label, val, set, ph }) => (
                      <div key={label}>
                        <label style={{ fontSize: 11, color: textMuted, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label} *</label>
                        <input value={val} onChange={e => set(e.target.value)} placeholder={ph} style={inp} />
                      </div>
                    ))}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <div>
                        <label style={{ fontSize: 11, color: textMuted, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.svc.duration}</label>
                        <input type="number" value={svcDuration} onChange={e => setSvcDuration(e.target.value)} min="15" step="15" style={inp} />
                      </div>
                      <div>
                        <label style={{ fontSize: 11, color: textMuted, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.svc.price}</label>
                        <div style={{ display: "flex", gap: 6 }}>
                          <select value={svcCurrency} onChange={e => setSvcCurrency(e.target.value)} style={{ ...inp, width: "auto", paddingRight: 6 }}>
                            {["USD", "EUR", "GBP", "MXN", "BRL", "PLN"].map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                          <input type="number" value={svcPrice} onChange={e => setSvcPrice(e.target.value)} min="0" step="0.01" style={inp} />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: 11, color: textMuted, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.svc.description}</label>
                      <textarea value={svcDesc} onChange={e => setSvcDesc(e.target.value)} rows={2} placeholder="What clients should expect" style={{ ...inp, resize: "vertical", lineHeight: 1.6 } as React.CSSProperties} />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, color: textMuted, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.svc.timezone}</label>
                      <select value={svcTimezone} onChange={e => setSvcTimezone(e.target.value)} style={inp}>
                        {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz.replace(/_/g, " ")}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: 11, color: textMuted, display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.svc.color}</label>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {COLORS.map(c => (
                          <button key={c} onClick={() => setSvcColor(c)} style={{ width: 26, height: 26, borderRadius: "50%", background: c, border: svcColor === c ? "3px solid #fff" : "2px solid transparent", cursor: "pointer" }} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 20 }}>
                    <Btn onClick={handleSaveService} disabled={savingSvc || !svcName.trim()} variant="gold">
                      {savingSvc ? "…" : selectedSvc ? s.svc.save : s.svc.create}
                    </Btn>
                    {selectedSvc && <Btn onClick={() => handleToggleActive(selectedSvc)} variant="ghost">{selectedSvc.active ? s.svc.pause : s.svc.reactivate}</Btn>}
                    {selectedSvc && <Btn onClick={() => handleDeleteService(selectedSvc)} variant="red">{s.svc.delete}</Btn>}
                  </div>
                </>
              )}
            </div>

            {/* Col 3: Availability + booking link */}
            <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
              {selectedSvc && (
                <>
                  {/* Booking link */}
                  <div style={{ background: "rgba(245,197,66,0.04)", border: "1px solid rgba(245,197,66,0.15)", borderRadius: 10, padding: 14, marginBottom: 20 }}>
                    <p style={{ fontSize: 11, color: textMuted, margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.1em" }}>{s.svc.link}</p>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <code style={{ flex: 1, fontSize: 11, color: gold, wordBreak: "break-all" }}>{bookingLink(selectedSvc)}</code>
                      <Btn small onClick={() => { navigator.clipboard.writeText(bookingLink(selectedSvc)); setNotice(s.svc.copied); }} variant="ghost">{s.svc.copy}</Btn>
                    </div>
                  </div>

                  {/* Availability editor */}
                  <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 12, padding: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                      <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>{s.avail.title}</h3>
                      <div style={{ display: "flex", gap: 6 }}>
                        {[
                          { label: s.avail.weekdays, fn: setWeekdays },
                          { label: s.avail.allDays, fn: setAllDays },
                          { label: s.avail.none, fn: clearDays },
                        ].map(({ label, fn }) => (
                          <button key={label} onClick={fn} style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${border}`, borderRadius: 6, padding: "4px 10px", color: "rgba(255,255,255,0.7)", fontFamily: "Outfit, sans-serif", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>{label}</button>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {avail.map((day, i) => (
                        <div key={day.day} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", borderBottom: i < 6 ? `1px solid ${border}` : "none" }}>
                          <input type="checkbox" checked={day.enabled} onChange={e => { const c = [...avail]; c[i] = { ...c[i], enabled: e.target.checked }; setAvail(c); }}
                            style={{ width: 16, height: 16, cursor: "pointer", accentColor: gold }} />
                          <span style={{ width: 28, fontSize: 13, color: day.enabled ? "#fff" : textMuted, fontWeight: day.enabled ? 600 : 400 }}>{s.days[day.day]}</span>
                          {day.enabled ? (
                            <>
                              <input type="time" value={day.start} onChange={e => { const c = [...avail]; c[i] = { ...c[i], start: e.target.value }; setAvail(c); }} style={{ ...inp, width: "auto", fontSize: 13, padding: "6px 8px" }} />
                              <span style={{ color: textMuted, fontSize: 12 }}>{s.avail.to}</span>
                              <input type="time" value={day.end} onChange={e => { const c = [...avail]; c[i] = { ...c[i], end: e.target.value }; setAvail(c); }} style={{ ...inp, width: "auto", fontSize: 13, padding: "6px 8px" }} />
                              <span style={{ fontSize: 11, color: textMuted }}>
                                {(() => { const toM = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; }; const mins = toM(day.end) - toM(day.start); return mins > 0 ? Math.floor(mins / 60) + "h" + (mins % 60 ? " " + (mins % 60) + "m" : "") : ""; })()}
                              </span>
                            </>
                          ) : (
                            <span style={{ fontSize: 12, color: textMuted }}>{s.avail.unavailable}</span>
                          )}
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: 16 }}>
                      <Btn onClick={handleSaveAvailability} disabled={savingAvail} variant="gold">
                        {savingAvail ? "…" : s.avail.save}
                      </Btn>
                    </div>
                  </div>
                </>
              )}
              {!selectedSvc && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "50%", color: textMuted, fontSize: 13, textAlign: "center", paddingTop: 40 }}>
                  {s.svc.selectHint}
                </div>
              )}
            </div>
          </>
        )}

        {/* ── BOOKINGS TAB ── */}
        {tab === "bookings" && (
          <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px" }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 24, flexWrap: "wrap" }}>
              {(["pending", "confirmed", "completed", "cancelled"] as BookingStatus[]).map(st => (
                <button key={st} onClick={() => setBkgFilter(st)} style={{
                  background: bkgFilter === st ? "rgba(245,197,66,0.12)" : "rgba(255,255,255,0.04)",
                  border: "1px solid " + (bkgFilter === st ? "rgba(245,197,66,0.4)" : border),
                  color: bkgFilter === st ? gold : textMuted,
                  borderRadius: 20, padding: "6px 16px", fontFamily: "Outfit, sans-serif",
                  fontSize: 13, fontWeight: bkgFilter === st ? 700 : 400, cursor: "pointer", textTransform: "capitalize",
                }}>
                  {s.status[st]} ({counts[st] || 0})
                </button>
              ))}
            </div>
            {visibleBookings.length === 0 ? (
              <div style={{ textAlign: "center", color: textMuted, padding: "48px 0", fontSize: 14 }}>{s.bkg.none(s.status[bkgFilter])}</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 680 }}>
                {visibleBookings.map(b => {
                  const dateStr = new Date(b.booking_date + "T12:00:00").toLocaleDateString(lang === "pl" ? "pl-PL" : lang === "pt" ? "pt-BR" : lang === "ru" ? "ru-RU" : lang === "es" ? "es-ES" : "en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
                  const isActioning = actioningId === b.id;
                  return (
                    <div key={b.id} style={{ background: surface, border: `1px solid ${border}`, borderRadius: 12, padding: 20 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
                        <div>
                          <p style={{ margin: "0 0 2px", fontWeight: 700, fontSize: 15 }}>{b.client_name}</p>
                          <p style={{ margin: 0, fontSize: 13, color: textMuted }}>{b.client_email}</p>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <p style={{ margin: "0 0 2px", fontWeight: 600, fontSize: 14, color: gold }}>{dateStr} · {b.booking_time}</p>
                          <p style={{ margin: 0, fontSize: 13, color: textMuted }}>{b.service_name}</p>
                        </div>
                      </div>
                      {b.notes && <p style={{ margin: "0 0 12px", fontSize: 13, color: "rgba(255,255,255,0.6)", background: "rgba(255,255,255,0.03)", padding: "8px 12px", borderRadius: 6 }}>{b.notes}</p>}
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {b.status === "pending" && (
                          <>
                            <Btn onClick={() => handleBookingAction(b, "confirmed")} disabled={isActioning} variant="green">{isActioning ? "…" : s.bkg.confirm}</Btn>
                            <Btn onClick={() => handleBookingAction(b, "cancelled")} disabled={isActioning} variant="red">{isActioning ? "…" : s.bkg.decline}</Btn>
                          </>
                        )}
                        {b.status === "confirmed" && (
                          <>
                            <Btn onClick={() => handleBookingAction(b, "completed")} disabled={isActioning} variant="default">{isActioning ? "…" : s.bkg.complete}</Btn>
                            <Btn onClick={() => handleBookingAction(b, "cancelled")} disabled={isActioning} variant="red">{isActioning ? "…" : s.bkg.cancel}</Btn>
                          </>
                        )}
                        {(b.status === "completed" || b.status === "cancelled") && (
                          <span style={{ fontSize: 12, color: textMuted }}>{b.status === "completed" ? "✓ " + s.status.completed : "✗ " + s.status.cancelled}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── BLOCKED DATES TAB ── */}
        {tab === "blocked" && (
          <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px" }}>
            <div style={{ maxWidth: 500 }}>
              <p style={{ color: textMuted, fontSize: 14, marginBottom: 24 }}>{s.blk.hint}</p>
              <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 12, padding: 20, marginBottom: 28 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 16px" }}>{s.blk.title}</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12, marginBottom: 14 }}>
                  <div>
                    <label style={{ fontSize: 11, color: textMuted, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.blk.date}</label>
                    <input type="date" value={newBlockDate} onChange={e => setNewBlockDate(e.target.value)} min={new Date().toISOString().split("T")[0]} style={{ ...inp, colorScheme: "dark" }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: textMuted, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.blk.reason}</label>
                    <input value={newBlockReason} onChange={e => setNewBlockReason(e.target.value)} placeholder="Holiday, vacation…" style={inp} />
                  </div>
                </div>
                <Btn onClick={handleAddBlock} disabled={addingBlock || !newBlockDate} variant="gold">{addingBlock ? "…" : s.blk.btn}</Btn>
              </div>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: textMuted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>{s.blk.upcoming(blocked.length)}</h3>
              {blocked.length === 0 ? <p style={{ color: textMuted, fontSize: 14 }}>{s.blk.empty}</p> : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {blocked.map(bd => (
                    <div key={bd.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: surface, border: `1px solid ${border}`, borderRadius: 8, padding: "12px 16px" }}>
                      <div>
                        <span style={{ fontWeight: 600, fontSize: 14 }}>{new Date(bd.blocked_date + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</span>
                        {bd.reason && <span style={{ fontSize: 13, color: textMuted, marginLeft: 10 }}>— {bd.reason}</span>}
                      </div>
                      <Btn small onClick={() => handleRemoveBlock(bd.id)} variant="ghost">{s.blk.remove}</Btn>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
