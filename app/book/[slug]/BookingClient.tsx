"use client";

import { useState } from "react";
import useTranslation from "@/components/i18n/useTranslation";

type Service = {
  id: string; name: string; slug: string; duration_minutes: number;
  price: number; currency: string; description: string; color: string; timezone: string;
};

type Lang = "en" | "es" | "pt" | "pl" | "ru";

const S = {
  en: {
    step1: "Select a date", step2: "Select a time", step3: "Your details",
    fullName: "Full Name *", email: "Email *", notes: "Notes (optional)",
    notesPlaceholder: "Anything we should know?",
    requestBtn: "Request Booking →", submitting: "Submitting…",
    doneTitle: "Booking Request Received",
    doneMsg: (svc: string, date: string, time: string) => "We received your request for " + svc + " on " + date + " at " + time + ".",
    doneEmail: (email: string) => "A confirmation email has been sent to " + email + ".",
    doneNote: "We will confirm your booking shortly.",
    noSlots: "No available slots on this date.",
    chooseAnother: "Choose another date",
    loading: "Loading available times…",
    hint: "Highlighted dates have availability.",
    service: "Service", dateTime: "Date & Time", duration: "Duration",
    amount: "Amount", min: "min", free: "Free",
    nameRequired: "Name and email are required.",
    invalidEmail: "Please enter a valid email.",
    failed: "Booking failed. Please try again.",
    emailNote: "You will receive a confirmation email once we review your request.",
    ownerTime: "Owner's time",
    yourTime: "your time",
    timesIn: "Times shown in",
  },
  es: {
    step1: "Selecciona una fecha", step2: "Selecciona un horario", step3: "Tus datos",
    fullName: "Nombre completo *", email: "Email *", notes: "Notas (opcional)",
    notesPlaceholder: "¿Algo que debamos saber?",
    requestBtn: "Solicitar Reserva →", submitting: "Enviando…",
    doneTitle: "Solicitud de Reserva Recibida",
    doneMsg: (svc: string, date: string, time: string) => "Recibimos tu solicitud para " + svc + " el " + date + " a las " + time + ".",
    doneEmail: (email: string) => "Se ha enviado un email de confirmación a " + email + ".",
    doneNote: "Confirmaremos tu reserva en breve.",
    noSlots: "No hay horarios disponibles en esta fecha.",
    chooseAnother: "Elegir otra fecha",
    loading: "Cargando horarios disponibles…",
    hint: "Las fechas resaltadas tienen disponibilidad.",
    service: "Servicio", dateTime: "Fecha y Hora", duration: "Duración",
    amount: "Importe", min: "min", free: "Gratis",
    nameRequired: "El nombre y el email son obligatorios.",
    invalidEmail: "Por favor ingresa un email válido.",
    failed: "Error al reservar. Inténtalo de nuevo.",
    emailNote: "Recibirás un email de confirmación una vez que revisemos tu solicitud.",
    ownerTime: "Hora del proveedor",
    yourTime: "tu hora",
    timesIn: "Horarios en",
  },
  pt: {
    step1: "Selecione uma data", step2: "Selecione um horário", step3: "Seus dados",
    fullName: "Nome completo *", email: "Email *", notes: "Notas (opcional)",
    notesPlaceholder: "Algo que devemos saber?",
    requestBtn: "Solicitar Reserva →", submitting: "Enviando…",
    doneTitle: "Solicitação de Reserva Recebida",
    doneMsg: (svc: string, date: string, time: string) => "Recebemos sua solicitação para " + svc + " em " + date + " às " + time + ".",
    doneEmail: (email: string) => "Um email de confirmação foi enviado para " + email + ".",
    doneNote: "Confirmaremos sua reserva em breve.",
    noSlots: "Sem horários disponíveis nesta data.",
    chooseAnother: "Escolher outra data",
    loading: "Carregando horários disponíveis…",
    hint: "Datas destacadas têm disponibilidade.",
    service: "Serviço", dateTime: "Data e Hora", duration: "Duração",
    amount: "Valor", min: "min", free: "Grátis",
    nameRequired: "Nome e email são obrigatórios.",
    invalidEmail: "Por favor insira um email válido.",
    failed: "Falha na reserva. Tente novamente.",
    emailNote: "Você receberá um email de confirmação assim que analisarmos sua solicitação.",
    ownerTime: "Hora do prestador",
    yourTime: "sua hora",
    timesIn: "Horários em",
  },
  pl: {
    step1: "Wybierz datę", step2: "Wybierz godzinę", step3: "Twoje dane",
    fullName: "Imię i nazwisko *", email: "Email *", notes: "Notatki (opcjonalnie)",
    notesPlaceholder: "Coś, co powinniśmy wiedzieć?",
    requestBtn: "Zarezerwuj →", submitting: "Wysyłanie…",
    doneTitle: "Prośba o Rezerwację Otrzymana",
    doneMsg: (svc: string, date: string, time: string) => "Otrzymaliśmy Twoją prośbę o " + svc + " w dniu " + date + " o godz. " + time + ".",
    doneEmail: (email: string) => "Email potwierdzający został wysłany na adres " + email + ".",
    doneNote: "Potwierdzimy rezerwację wkrótce.",
    noSlots: "Brak dostępnych terminów w tym dniu.",
    chooseAnother: "Wybierz inną datę",
    loading: "Ładowanie dostępnych terminów…",
    hint: "Podświetlone daty mają dostępność.",
    service: "Usługa", dateTime: "Data i Godzina", duration: "Czas trwania",
    amount: "Kwota", min: "min", free: "Bezpłatnie",
    nameRequired: "Imię i email są wymagane.",
    invalidEmail: "Proszę podać prawidłowy email.",
    failed: "Rezerwacja nieudana. Spróbuj ponownie.",
    emailNote: "Otrzymasz email potwierdzający po przejrzeniu Twojej prośby.",
    ownerTime: "Czas dostawcy",
    yourTime: "Twój czas",
    timesIn: "Godziny w strefie",
  },
  ru: {
    step1: "Выберите дату", step2: "Выберите время", step3: "Ваши данные",
    fullName: "Полное имя *", email: "Email *", notes: "Заметки (необязательно)",
    notesPlaceholder: "Что нам следует знать?",
    requestBtn: "Запросить бронирование →", submitting: "Отправка…",
    doneTitle: "Запрос на Бронирование Получен",
    doneMsg: (svc: string, date: string, time: string) => "Мы получили ваш запрос на " + svc + " " + date + " в " + time + ".",
    doneEmail: (email: string) => "Письмо с подтверждением отправлено на " + email + ".",
    doneNote: "Мы подтвердим бронирование в ближайшее время.",
    noSlots: "Нет доступных слотов на эту дату.",
    chooseAnother: "Выбрать другую дату",
    loading: "Загрузка доступного времени…",
    hint: "Выделенные даты имеют доступность.",
    service: "Услуга", dateTime: "Дата и время", duration: "Продолжительность",
    amount: "Сумма", min: "мин", free: "Бесплатно",
    nameRequired: "Имя и email обязательны.",
    invalidEmail: "Пожалуйста, введите корректный email.",
    failed: "Ошибка бронирования. Попробуйте снова.",
    emailNote: "Вы получите письмо с подтверждением после рассмотрения вашего запроса.",
    ownerTime: "Время владельца",
    yourTime: "ваше время",
    timesIn: "Время в зоне",
  },
};

function asLang(v: string): Lang {
  return (["en", "es", "pt", "pl", "ru"] as Lang[]).includes(v as Lang) ? (v as Lang) : "en";
}

const MONTH_NAMES_EN = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const MONTH_NAMES: Record<Lang, string[]> = {
  en: MONTH_NAMES_EN,
  es: ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"],
  pt: ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"],
  pl: ["Styczeń","Luty","Marzec","Kwiecień","Maj","Czerwiec","Lipiec","Sierpień","Wrzesień","Październik","Listopad","Grudzień"],
  ru: ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"],
};
const DAY_NAMES: Record<Lang, string[]> = {
  en: ["Su","Mo","Tu","We","Th","Fr","Sa"],
  es: ["Do","Lu","Ma","Mi","Ju","Vi","Sá"],
  pt: ["Do","Se","Te","Qu","Qu","Se","Sá"],
  pl: ["Nd","Pn","Wt","Śr","Cz","Pt","Sb"],
  ru: ["Вс","Пн","Вт","Ср","Чт","Пт","Сб"],
};

// Convert a time string in ownerTz to clientTz for display
function convertTime(slot: string, date: string, ownerTz: string, clientTz: string): string {
  if (ownerTz === clientTz) return slot;
  try {
    const [h, m] = slot.split(":").map(Number);
    const naiveDate = new Date(date + "T" + slot + ":00.000Z");
    const fmt = (tz: string) => new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "2-digit", minute: "2-digit", hour12: false });
    const ownerParts = fmt(ownerTz).formatToParts(naiveDate);
    const ownerH = parseInt(ownerParts.find(p => p.type === "hour")?.value || "0");
    const ownerM = parseInt(ownerParts.find(p => p.type === "minute")?.value || "0");
    const diff = (h * 60 + m) - (ownerH * 60 + ownerM);
    const adjusted = new Date(naiveDate.getTime() + diff * 60000);
    const clientParts = fmt(clientTz).formatToParts(adjusted);
    const cH = parseInt(clientParts.find(p => p.type === "hour")?.value || "0");
    const cM = parseInt(clientParts.find(p => p.type === "minute")?.value || "0");
    return String(cH).padStart(2, "0") + ":" + String(cM).padStart(2, "0");
  } catch {
    return slot;
  }
}

function getClientTz(): string {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { return "UTC"; }
}

const bg = "#06060a";
const border = "rgba(255,255,255,0.08)";
const textMuted = "rgba(255,255,255,0.45)";

function fieldStyle(): React.CSSProperties {
  return { width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid " + border, borderRadius: 8, padding: "10px 14px", color: "#fff", fontFamily: "Outfit, sans-serif", fontSize: 15, boxSizing: "border-box", outline: "none" };
}

export default function BookingClient({ service, availableDays }: { service: Service; availableDays: number[] }) {
  const { lang: rawLang } = useTranslation();
  const lang = asLang(rawLang);
  const s = S[lang];

  const today = new Date(); today.setHours(0,0,0,0);
  const clientTz = getClientTz();
  const tzDiffers = service.timezone && service.timezone !== clientTz;

  const [step, setStep] = useState<"date"|"time"|"info"|"done">("date");
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedTime, setSelectedTime] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const availSet = new Set(availableDays);

  function cells() {
    const first = new Date(calYear, calMonth, 1).getDay();
    const days = new Date(calYear, calMonth + 1, 0).getDate();
    const out: (number|null)[] = [];
    for (let i = 0; i < first; i++) out.push(null);
    for (let d = 1; d <= days; d++) out.push(d);
    return out;
  }

  function isAvailable(day: number): boolean {
    const d = new Date(calYear, calMonth, day);
    return d >= today && availSet.has(d.getDay());
  }

  function fmtDate(day: number): string {
    return calYear + "-" + String(calMonth+1).padStart(2,"0") + "-" + String(day).padStart(2,"0");
  }

  async function selectDate(day: number) {
    const ds = fmtDate(day);
    setSelectedDate(ds); setSelectedTime(""); setLoadingSlots(true); setStep("time");
    try {
      const res = await fetch("/api/calendar/slots?serviceId=" + service.id + "&date=" + ds);
      const data = await res.json();
      setSlots(data.slots || []);
    } catch { setSlots([]); } finally { setLoadingSlots(false); }
  }

  async function handleSubmit() {
    if (!clientName.trim() || !clientEmail.trim()) { setError(s.nameRequired); return; }
    if (!clientEmail.includes("@")) { setError(s.invalidEmail); return; }
    setSubmitting(true); setError("");
    try {
      const res = await fetch("/api/calendar/book", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ serviceId: service.id, clientName, clientEmail, bookingDate: selectedDate, bookingTime: selectedTime, notes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || s.failed);
      setStep("done");
    } catch (e: unknown) { setError(e instanceof Error ? e.message : s.failed); } finally { setSubmitting(false); }
  }

  const formattedSelected = selectedDate
    ? new Date(selectedDate + "T12:00:00").toLocaleDateString(lang === "pl" ? "pl-PL" : lang === "pt" ? "pt-BR" : lang === "ru" ? "ru-RU" : lang === "es" ? "es-ES" : "en-US", { weekday: "long", month: "long", day: "numeric" })
    : "";

  // Display slot in client's timezone (primary), owner's in secondary
  function displaySlot(slot: string): { primary: string; secondary?: string } {
    if (!service.timezone || !tzDiffers) return { primary: slot };
    const clientTime = convertTime(slot, selectedDate || fmtDate(1), service.timezone, clientTz);
    return { primary: clientTime + " (" + s.yourTime + ")", secondary: slot + " " + (service.timezone.split("/")[1] || service.timezone).replace(/_/g, " ") };
  }

  const calCells = cells();

  return (
    <div style={{ minHeight: "100vh", background: bg, fontFamily: "Outfit, sans-serif", color: "#fff", padding: "40px 20px 80px" }}>
      <div style={{ maxWidth: 820, margin: "0 auto", display: "flex", gap: 48, alignItems: "flex-start" }}>

        {/* Left: Service info */}
        <div style={{ width: 240, flexShrink: 0, paddingTop: 8 }}>
          <span style={{ display: "inline-block", width: 12, height: 12, borderRadius: "50%", background: service.color, marginBottom: 14 }} />
          <h1 style={{ fontFamily: "Fraunces, serif", fontSize: 26, fontWeight: 700, margin: "0 0 10px", lineHeight: 1.2 }}>{service.name}</h1>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
            <span style={{ fontSize: 14, color: textMuted }}>⏱ {service.duration_minutes} {s.min}</span>
            {Number(service.price) > 0 && <span style={{ fontSize: 14, color: textMuted }}>💳 {service.currency} {Number(service.price).toFixed(2)}</span>}
          </div>
          {service.description && <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.65, margin: "0 0 16px" }}>{service.description}</p>}
          {service.timezone && (
            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid " + border, borderRadius: 8, padding: "10px 12px", fontSize: 12, color: textMuted }}>
              <p style={{ margin: "0 0 4px", fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>{s.timesIn}:</p>
              <p style={{ margin: 0 }}>{service.timezone.replace(/_/g, " ")}</p>
              {tzDiffers && <p style={{ margin: "4px 0 0", color: "rgba(255,255,255,0.35)", fontSize: 11 }}>{s.yourTime}: {clientTz.replace(/_/g, " ")}</p>}
            </div>
          )}

          {/* Progress steps */}
          <div style={{ marginTop: 28 }}>
            {[s.step1, s.step2, s.step3].map((label, i) => {
              const stepNames = ["date", "time", "info", "done"];
              const currentIdx = stepNames.indexOf(step);
              const done = currentIdx > i;
              const active = currentIdx === i;
              return (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <span style={{ width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0, background: done ? service.color : active ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.06)", color: done ? "#000" : active ? "#fff" : textMuted }}>
                    {done ? "✓" : i + 1}
                  </span>
                  <span style={{ fontSize: 13, color: active ? "#fff" : done ? "rgba(255,255,255,0.5)" : textMuted, fontWeight: active ? 600 : 400 }}>{label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Booking flow */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Done */}
          {step === "done" && (
            <div style={{ textAlign: "center", paddingTop: 40 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
              <h2 style={{ fontFamily: "Fraunces, serif", fontSize: 24, fontWeight: 700, marginBottom: 12 }}>{s.doneTitle}</h2>
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 15, lineHeight: 1.7 }}>
                {s.doneMsg(service.name, formattedSelected, selectedTime)}<br />
                {s.doneEmail(clientEmail)}<br /><br />
                {s.doneNote}
              </p>
            </div>
          )}

          {/* Step 1: Date */}
          {step === "date" && (
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: textMuted, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 16 }}>{s.step1}</p>
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid " + border, borderRadius: 12, padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <button onClick={() => { if (calMonth===0){setCalMonth(11);setCalYear(y=>y-1);}else setCalMonth(m=>m-1); }} style={{ background:"none",border:"none",color:textMuted,fontSize:20,cursor:"pointer",padding:"0 8px" }}>‹</button>
                  <span style={{ fontWeight:600,fontSize:15 }}>{MONTH_NAMES[lang][calMonth]} {calYear}</span>
                  <button onClick={() => { if (calMonth===11){setCalMonth(0);setCalYear(y=>y+1);}else setCalMonth(m=>m+1); }} style={{ background:"none",border:"none",color:"#fff",fontSize:20,cursor:"pointer",padding:"0 8px" }}>›</button>
                </div>
                <div style={{ display:"grid",gridTemplateColumns:"repeat(7,1fr)",marginBottom:8 }}>
                  {DAY_NAMES[lang].map(d => <div key={d} style={{ textAlign:"center",fontSize:11,color:textMuted,fontWeight:600,padding:"4px 0" }}>{d}</div>)}
                </div>
                <div style={{ display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3 }}>
                  {calCells.map((day,i) => {
                    if (!day) return <div key={i} />;
                    const avail = isAvailable(day);
                    const ds = fmtDate(day);
                    const isSel = ds === selectedDate;
                    return (
                      <button key={i} onClick={() => avail && selectDate(day)} disabled={!avail} style={{ aspectRatio:"1",borderRadius:7,border:"none",fontSize:13,fontWeight:500,background:isSel?service.color:avail?"rgba(255,255,255,0.07)":"transparent",color:isSel?"#000":avail?"#fff":"rgba(255,255,255,0.2)",cursor:avail?"pointer":"default",fontFamily:"Outfit,sans-serif" }}>
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
              <p style={{ fontSize:12,color:textMuted,marginTop:10,textAlign:"center" }}>{s.hint}</p>
            </div>
          )}

          {/* Step 2: Time */}
          {step === "time" && (
            <div>
              <button onClick={() => setStep("date")} style={{ background:"none",border:"none",color:textMuted,cursor:"pointer",fontSize:13,marginBottom:16,padding:0 }}>← {formattedSelected}</button>
              <p style={{ fontSize:12,fontWeight:700,color:textMuted,textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:16 }}>{s.step2}</p>
              {loadingSlots ? (
                <p style={{ color:textMuted,fontSize:14 }}>{s.loading}</p>
              ) : slots.length === 0 ? (
                <div style={{ textAlign:"center",padding:"32px 0" }}>
                  <p style={{ color:textMuted,marginBottom:16 }}>{s.noSlots}</p>
                  <button onClick={() => setStep("date")} style={{ background:service.color,color:"#000",border:"none",borderRadius:8,padding:"10px 20px",fontFamily:"Outfit,sans-serif",fontSize:14,fontWeight:700,cursor:"pointer" }}>{s.chooseAnother}</button>
                </div>
              ) : (
                <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8 }}>
                  {slots.map(slot => {
                    const { primary, secondary } = displaySlot(slot);
                    const isSel = slot === selectedTime;
                    return (
                      <button key={slot} onClick={() => { setSelectedTime(slot); setStep("info"); }} style={{ padding:"12px 8px",border:"1px solid " + (isSel ? service.color : border),borderRadius:8,background:isSel?service.color:"rgba(255,255,255,0.04)",color:isSel?"#000":"#fff",fontFamily:"Outfit,sans-serif",fontSize:13,fontWeight:600,cursor:"pointer",textAlign:"center" }}>
                        <div>{primary}</div>
                        {secondary && <div style={{ fontSize:10,opacity:0.65,marginTop:2 }}>{secondary}</div>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Info form */}
          {step === "info" && (
            <div>
              <button onClick={() => setStep("time")} style={{ background:"none",border:"none",color:textMuted,cursor:"pointer",fontSize:13,marginBottom:16,padding:0 }}>← {formattedSelected} · {selectedTime}</button>
              <p style={{ fontSize:12,fontWeight:700,color:textMuted,textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:20 }}>{s.step3}</p>

              {/* Summary */}
              <div style={{ background:"rgba(255,255,255,0.03)",border:"1px solid "+border,borderRadius:10,padding:16,marginBottom:24 }}>
                {[
                  [s.service, service.name],
                  [s.dateTime, formattedSelected + " · " + selectedTime + (tzDiffers && service.timezone ? " (" + (service.timezone.split("/")[1]||service.timezone).replace(/_/g," ") + ")" : "")],
                  [s.duration, service.duration_minutes + " " + s.min],
                  ...(Number(service.price)>0 ? [[s.amount, service.currency + " " + Number(service.price).toFixed(2)]] : []),
                ].map(([label,val]) => (
                  <div key={label} style={{ display:"flex",justifyContent:"space-between",fontSize:14,marginBottom:6 }}>
                    <span style={{ color:textMuted }}>{label}</span>
                    <span style={{ fontWeight:600 }}>{val}</span>
                  </div>
                ))}
              </div>

              <div style={{ display:"flex",flexDirection:"column",gap:16,marginBottom:20 }}>
                <div>
                  <label style={{ fontSize:12,color:textMuted,display:"block",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.08em" }}>{s.fullName}</label>
                  <input value={clientName} onChange={e=>setClientName(e.target.value)} placeholder="Your name" style={fieldStyle()} />
                </div>
                <div>
                  <label style={{ fontSize:12,color:textMuted,display:"block",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.08em" }}>{s.email}</label>
                  <input type="email" value={clientEmail} onChange={e=>setClientEmail(e.target.value)} placeholder="your@email.com" style={fieldStyle()} />
                </div>
                <div>
                  <label style={{ fontSize:12,color:textMuted,display:"block",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.08em" }}>{s.notes}</label>
                  <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder={s.notesPlaceholder} rows={3} style={{ ...fieldStyle(), lineHeight:1.6,resize:"vertical" } as React.CSSProperties} />
                </div>
              </div>

              {error && <p style={{ color:"#ef4444",fontSize:13,marginBottom:12 }}>{error}</p>}
              <button onClick={handleSubmit} disabled={submitting} style={{ width:"100%",background:service.color,color:"#000",border:"none",borderRadius:10,padding:"14px",fontFamily:"Fraunces,serif",fontSize:16,fontWeight:700,cursor:submitting?"not-allowed":"pointer",opacity:submitting?0.7:1 }}>
                {submitting ? s.submitting : s.requestBtn}
              </button>
              <p style={{ fontSize:12,color:textMuted,textAlign:"center",marginTop:12 }}>{s.emailNote}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
