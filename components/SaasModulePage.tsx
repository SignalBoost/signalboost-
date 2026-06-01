"use client";
import Link from "next/link";
import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import { saasModules } from "@/lib/saas-modules";
import { CockpitShell } from "@/components/CockpitShell";
import ModuleBackendPanel from "@/components/ModuleBackendPanel";
import useTranslation from "@/components/i18n/useTranslation";

function fallbackText(value: string, fallback: string) {
  return /^[a-zA-Z][\w$]*(\.[\w$]+)+$/.test(value) ? fallback : value;
}

// Tools that are NOT yet functional. Landing on one of these shows an honest
// "in development" page (no fake telemetry) instead of a tool that does nothing.
// Remove a slug from this set when its real tool ships.
const COMING_SOON = new Set(["calendar", "spreadsheets", "outreach"]);

type Notice = {
  badge: string;
  heading: string;
  body: string;
  ctaPromote: string;
  ctaReviews: string;
};

const NOTICE: Record<string, Notice> = {
  en: {
    badge: "In development",
    heading: "This tool isn't available yet",
    body: "We're still building it. In the meantime, here's what's live right now:",
    ctaPromote: "Open Promote",
    ctaReviews: "Open Reviews",
  },
  es: {
    badge: "En desarrollo",
    heading: "Esta herramienta aún no está disponible",
    body: "Todavía la estamos creando. Mientras tanto, esto ya está disponible:",
    ctaPromote: "Abrir Promover",
    ctaReviews: "Abrir Reseñas",
  },
  pt: {
    badge: "Em desenvolvimento",
    heading: "Esta ferramenta ainda não está disponível",
    body: "Ainda estamos construindo. Enquanto isso, veja o que já está disponível:",
    ctaPromote: "Abrir Promover",
    ctaReviews: "Abrir Avaliações",
  },
  pl: {
    badge: "W trakcie tworzenia",
    heading: "To narzędzie nie jest jeszcze dostępne",
    body: "Wciąż je tworzymy. W międzyczasie sprawdź, co już działa:",
    ctaPromote: "Otwórz Promuj",
    ctaReviews: "Otwórz Opinie",
  },
  ru: {
    badge: "В разработке",
    heading: "Этот инструмент пока недоступен",
    body: "Мы всё ещё работаем над ним. А пока — вот что уже доступно:",
    ctaPromote: "Открыть Продвижение",
    ctaReviews: "Открыть Отзывы",
  },
};

export default function SaasModulePage({ slug }: { slug: string }) {
  const module = saasModules.find((item) => item.slug === slug);
  const { t, lang } = useTranslation();
  if (!module) notFound();

  const title = fallbackText(t(module.titleKey), module.title);
  const eyebrow = fallbackText(t(module.eyebrowKey), module.eyebrow);
  const summary = fallbackText(t(module.summaryKey), module.summary);

  // Not-yet-built tools: honest "in development" state, no fake telemetry.
  if (COMING_SOON.has(slug)) {
    const n = NOTICE[lang] ?? NOTICE.en;
    return (
      <CockpitShell eyebrow
