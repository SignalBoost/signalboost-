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
const COMING_SOON = new Set(["calendar", "outreach"]);

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
      <CockpitShell eyebrow={eyebrow} title={title} subtitle={summary}>
        <section className="cockpit-section" style={styles.noticeWrap}>
          <div style={styles.noticeCard}>
            <span style={styles.badge}>{n.badge}</span>
            <h2 style={styles.heading}>{n.heading}</h2>
            <p style={styles.body}>{n.body}</p>
            <div style={styles.ctaRow}>
              <Link href="/promote" style={styles.primaryBtn}>{n.ctaPromote}</Link>
              <Link href="/reviews" style={styles.ghostBtn}>{n.ctaReviews}</Link>
            </div>
          </div>
        </section>
      </CockpitShell>
    );
  }

  // Functional / preview path (kept for any module not marked coming-soon).
  const signal = fallbackText(t(module.signalKey), module.signal);
  const telemetry = fallbackText(t(module.telemetryKey), module.telemetry);
  const features = module.features.map((f, i) => fallbackText(t(module.featureKeys[i]), f));
  const automations = module.automations.map((a, i) => fallbackText(t(module.automationKeys[i]), a));

  const missionSignalLabel = fallbackText(t("modules.detail.missionSignal"), "Mission signal");
  const coreSystemsLabel = fallbackText(t("modules.detail.coreSystems"), "Core systems");
  const automationsLabel = fallbackText(t("modules.detail.automations"), "Concierge AI automations");

  const conciergeEyebrow = fallbackText(t("modules.concierge.eyebrow"), "Concierge AI");
  const conciergeTitle = fallbackText(
    t("modules.concierge.title"),
    "Connected to marketplace discovery and SaaS execution"
  );
  const conciergeBody = fallbackText(
    t("modules.concierge.body"),
    "SignalBoost routes buyer intent, partner data, and operational tasks through a single assistant layer so teams can move from question to action."
  );
  const conciergeCta = fallbackText(t("modules.concierge.cta"), "Open Concierge");

  return (
    <CockpitShell eyebrow={eyebrow} title={title} subtitle={summary}>
      <section className="cockpit-section module-detail" style={{ "--module-accent": module.accent } as CSSProperties}>
        <div className="module-detail-panel module-prime">
          <span className="telemetry-label">{missionSignalLabel}</span>
          <strong>{signal}</strong>
          <p>{telemetry}</p>
        </div>
        <div className="module-detail-panel">
          <span className="telemetry-label">{coreSystemsLabel}</span>
          <ul>
            {features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </div>
        <div className="module-detail-panel">
          <span className="telemetry-label">{automationsLabel}</span>
          <ul>
            {automations.map((automation) => (
              <li key={automation}>{automation}</li>
            ))}
          </ul>
        </div>
      </section>
      <ModuleBackendPanel slug={module.slug} />
      <section className="cockpit-section concierge-band">
        <div>
          <p className="cockpit-eyebrow">{conciergeEyebrow}</p>
          <h2>{conciergeTitle}</h2>
          <p>{conciergeBody}</p>
        </div>
        <Link className="cockpit-primary" href="/assistant">{conciergeCta}</Link>
      </section>
    </CockpitShell>
  );
}

const styles: Record<string, CSSProperties> = {
  noticeWrap: { display: "flex", justifyContent: "center" },
  noticeCard: {
    maxWidth: 560,
    textAlign: "center",
    border: "1px solid rgba(255,255,255,.09)",
    borderRadius: 20,
    padding: "36px 28px",
    background: "linear-gradient(180deg, rgba(20,20,28,.8), rgba(10,10,16,.8))",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,.05)",
  },
  badge: {
    display: "inline-block",
    color: "#dfa837",
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    border: "1px solid rgba(223,168,55,.3)",
    borderRadius: 999,
    padding: "5px 12px",
  },
  heading: { color: "#fff", fontSize: 22, fontWeight: 700, margin: "16px 0 8px", letterSpacing: "-0.01em" },
  body: { color: "#9aa8b8", fontSize: 15, margin: "0 auto 22px", lineHeight: 1.55, maxWidth: 440 },
  ctaRow: { display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" },
  primaryBtn: {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    padding: "11px 20px", borderRadius: 11, color: "#06060a", fontWeight: 800, fontSize: 14,
    textDecoration: "none", background: "linear-gradient(135deg, #f5c542, #dfa837)",
  },
  ghostBtn: {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    padding: "11px 20px", borderRadius: 11, border: "1px solid rgba(255,255,255,.14)",
    background: "rgba(255,255,255,.05)", color: "#fff", fontWeight: 700, fontSize: 14, textDecoration: "none",
  },
};
