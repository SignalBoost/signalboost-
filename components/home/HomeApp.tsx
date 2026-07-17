"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import ConciergeHero from "./ConciergeHero";
import ModuleGrid from "@/components/ModuleGrid";
import useTranslation from "@/components/i18n/useTranslation";
import partners from "@/partners.json";

interface HomeAppProps {
  lang?: string;
  regionName?: string;
  afterHero?: React.ReactNode;
}

type HomepagePartner = {
  id: string;
  name: string;
  logo?: string;
  description?: string;
  category_key?: string;
  category_label?: string;
  category?: string;
  network?: string;
  featured?: boolean;
};

type PortableProduct = {
  name: string;
  label: string;
  description: string;
  capabilities: string[];
  href: string;
  action: string;
  status: "Available" | "Enterprise";
};

const portableProducts: PortableProduct[] = [
  {
    name: "Campaign Studio",
    label: "Agency campaign engine",
    description:
      "Turn one business brief into a coordinated campaign with copy, creative direction, voice, and rendered media.",
    capabilities: ["Agency workflow", "Bring your own AI keys", "Portable licensing"],
    href: "/campaign-studio",
    action: "Explore Campaign Studio",
    status: "Available",
  },
  {
    name: "Render Engine",
    label: "Creative production engine",
    description:
      "A reusable production layer for voice, video, captions, and campaign-ready media inside your own product.",
    capabilities: ["Voice production", "Video rendering", "White-label integration"],
    href: "https://saas.signalboostapp.com/",
    action: "Open SignalBoost SaaS",
    status: "Enterprise",
  },
  {
    name: "Console Hub",
    label: "AI operations command center",
    description:
      "Centralize provider access, operational controls, approvals, monitoring, and secure enterprise administration.",
    capabilities: ["Provider control", "Approval governance", "Operational visibility"],
    href: "https://saas.signalboostapp.com/",
    action: "View the platform",
    status: "Enterprise",
  },
  {
    name: "Marketing & Sales Engine",
    label: "Growth workflow platform",
    description:
      "Coordinate campaign planning, audience intelligence, outreach, sales activity, and measurable follow-through.",
    capabilities: ["Campaign planning", "Sales workflows", "Performance intelligence"],
    href: "https://saas.signalboostapp.com/",
    action: "View the platform",
    status: "Enterprise",
  },
  {
    name: "Executive COS",
    label: "AI chief-of-staff platform",
    description:
      "Bring business signals, recommendations, approvals, and next actions into one executive operating surface.",
    capabilities: ["Executive briefings", "Decision support", "Controlled actions"],
    href: "https://saas.signalboostapp.com/",
    action: "View the platform",
    status: "Enterprise",
  },
];

function fallbackText(value: string, fallback: string) {
  return /^[a-zA-Z][\w$]*(\.[\w$]+)+$/.test(value) ? fallback : value;
}

function Panel({ children }: { children: React.ReactNode }) {
  return <section style={styles.panel}>{children}</section>;
}

export default function HomeApp({ afterHero }: HomeAppProps) {
  const { t } = useTranslation();

  const categories = useMemo(() => {
    const map = new Map<string, { key: string; label: string; count: number }>();
    for (const partner of partners as HomepagePartner[]) {
      const key = partner.category_key || partner.category || "other";
      const label = partner.category_label || partner.category || "Other";
      const existing = map.get(key);
      if (existing) existing.count += 1;
      else map.set(key, { key, label, count: 1 });
    }
    return Array.from(map.values());
  }, []);

  const partnerSingular = fallbackText(t("home.partnerSingular"), "partner");
  const partnerPlural = fallbackText(t("home.partnerPlural"), "partners");

  return (
    <main style={styles.mainCanvas}>
      <div style={styles.bgGlow} aria-hidden="true" />
      <div style={styles.bgGrain} aria-hidden="true" />

      <div style={styles.pageStack}>
        <ConciergeHero />

        {afterHero}

        <Panel>
          <div style={styles.portableIntro}>
            <div>
              <span style={styles.sectionBadge}>SignalBoost product portfolio</span>
              <h2 style={styles.portableHeading}>Use the products. License the engines.</h2>
              <p style={styles.portableLead}>
                Deploy SignalBoost as a service, integrate selected capabilities into your organization,
                or license portable products for a white-label experience.
              </p>
            </div>
            <div style={styles.licensePill}>SaaS · Enterprise · White label</div>
          </div>

          <div style={styles.productGrid}>
            {portableProducts.map((product, index) => (
              <article key={product.name} style={styles.productCard}>
                <div style={styles.productCardTop}>
                  <span style={styles.productIndex}>{String(index + 1).padStart(2, "0")}</span>
                  <span style={product.status === "Available" ? styles.availableStatus : styles.enterpriseStatus}>
                    {product.status}
                  </span>
                </div>

                <span style={styles.productLabel}>{product.label}</span>
                <h3 style={styles.productName}>{product.name}</h3>
                <p style={styles.productDescription}>{product.description}</p>

                <div style={styles.capabilityList}>
                  {product.capabilities.map((capability) => (
                    <span key={capability} style={styles.capabilityChip}>{capability}</span>
                  ))}
                </div>

                <Link href={product.href} style={styles.productLink}>
                  {product.action} <span aria-hidden="true">→</span>
                </Link>
              </article>
            ))}
          </div>

          <div style={styles.portableFooter}>
            <div>
              <strong style={styles.portableFooterTitle}>Built for adoption without exposing proprietary intelligence.</strong>
              <p style={styles.portableFooterText}>
                Customers see the business value and usable product surfaces. Private orchestration, prompts,
                provider logic, and internal architecture remain protected on the server.
              </p>
            </div>
            <Link href="/campaign-studio" style={styles.goldButton}>See a portable product</Link>
          </div>
        </Panel>

        <Panel>
          <div style={styles.sectionHeaderZone}>
            <span style={styles.sectionBadge}>{fallbackText(t("home.marketplaceBadge"), "Partner marketplace")}</span>
            <h2 style={styles.sectionHeading}>{fallbackText(t("home.marketplaceHeading"), "Browse trusted partners by category")}</h2>
          </div>

          <div style={styles.categoryGrid}>
            {categories.map((category) => (
              <Link key={category.key}
                href={`/marketplace?category=${category.key}`}
                style={styles.categoryCard}
                aria-label={fallbackText(t("home.browseCategoryAria"), `Browse ${category.label} partners`).replace("{label}", fallbackText(t(`categories.${category.key}`), category.label))}
              >
                <span style={styles.categoryCardCopy}>
                  <span style={styles.categoryName}>{fallbackText(t(`categories.${category.key}`), category.label)}</span>
                  <span style={styles.categoryMeta}>
                    {category.count} {category.count === 1 ? partnerSingular : partnerPlural}
                  </span>
                </span>
                <span style={styles.categoryArrow} aria-hidden="true">→</span>
              </Link>
            ))}
          </div>

          <div style={styles.browseAllRow}>
            <Link href="/marketplace" style={styles.browseAllButton}>
              {fallbackText(t("home.viewFullMarketplace"), "View the full marketplace")}
            </Link>
          </div>
        </Panel>

        <Panel>
          <div style={styles.sectionHeaderZone}>
            <span style={styles.sectionBadge}>{fallbackText(t("home.modulesBadge"), "Workspace modules")}</span>
            <h2 style={styles.sectionHeading}>{fallbackText(t("home.modulesHeading"), "Promote, assist, price, and report after the hero flow")}</h2>
          </div>
          <ModuleGrid />
        </Panel>

        <Panel>
          <div style={styles.sectionHeaderZone}>
            <span style={styles.sectionBadge}>{fallbackText(t("home.howBadge"), "How it works")}</span>
            <h2 style={styles.sectionHeading}>{fallbackText(t("home.howHeading"), "From discovery to booking in four steps")}</h2>
          </div>

          <div style={styles.stepsGrid}>
            <div style={styles.stepGlassCard}>
              <div style={styles.stepNumberBadge}>01</div>
              <p style={styles.stepBodyText}>{fallbackText(t("home.step1"), "Search or describe what you need.")}</p>
            </div>
            <div style={styles.stepGlassCard}>
              <div style={styles.stepNumberBadge}>02</div>
              <p style={styles.stepBodyText}>{fallbackText(t("home.step2"), "We match you with trusted partners in your region.")}</p>
            </div>
            <div style={styles.stepGlassCard}>
              <div style={styles.stepNumberBadge}>03</div>
              <p style={styles.stepBodyText}>{fallbackText(t("home.step3"), "Compare options and pick the partner that fits.")}</p>
            </div>
            <div style={styles.stepGlassCard}>
              <div style={styles.stepNumberBadge}>04</div>
              <p style={styles.stepBodyText}>{fallbackText(t("home.step4"), "Click through and book directly with the partner.")}</p>
            </div>
          </div>
        </Panel>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  mainCanvas: { position: "relative", backgroundColor: "#06060a", minHeight: "100vh", overflowX: "hidden" },
  bgGlow: {
    position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
    background: "radial-gradient(60vw 50vh at 22% -5%, rgba(245,197,66,.10), transparent 60%), radial-gradient(50vw 46vh at 88% 8%, rgba(34,211,238,.06), transparent 60%), linear-gradient(180deg,#06060a,#08080f)",
  },
  bgGrain: {
    position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", opacity: 0.025,
    backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
  },
  pageStack: { position: "relative", zIndex: 1, maxWidth: "100%", margin: "0 auto", padding: "0 0 80px", display: "flex", flexDirection: "column", gap: "20px" },
  panel: { position: "relative", borderRadius: "28px", border: "1px solid rgba(255,255,255,.08)", background: "linear-gradient(180deg, rgba(17,17,24,.72), rgba(9,9,15,.72))", backdropFilter: "saturate(140%) blur(14px)", WebkitBackdropFilter: "saturate(140%) blur(14px)", boxShadow: "0 30px 80px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.05)", padding: "clamp(28px, 4vw, 56px)" },
  sectionHeaderZone: { textAlign: "center", marginBottom: "36px" },
  sectionBadge: { fontSize: "11px", fontWeight: 700, color: "#dfa837", letterSpacing: "0.2em", textTransform: "uppercase" },
  sectionHeading: { fontSize: "clamp(22px, 3vw, 28px)", fontWeight: 600, color: "#ffffff", marginTop: "8px", letterSpacing: "-0.02em" },

  portableIntro: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "24px", flexWrap: "wrap", marginBottom: "34px" },
  portableHeading: { fontSize: "clamp(28px, 4vw, 44px)", lineHeight: 1.05, color: "#fff", letterSpacing: "-0.04em", margin: "10px 0 14px", maxWidth: "720px" },
  portableLead: { color: "#a8b0bd", fontSize: "16px", lineHeight: 1.7, margin: 0, maxWidth: "760px" },
  licensePill: { border: "1px solid rgba(223,168,55,.28)", background: "rgba(223,168,55,.08)", color: "#f5c542", padding: "12px 16px", borderRadius: "999px", fontSize: "12px", fontWeight: 800, whiteSpace: "nowrap" },
  productGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" },
  productCard: { display: "flex", flexDirection: "column", minHeight: "360px", padding: "24px", borderRadius: "20px", border: "1px solid rgba(255,255,255,.08)", background: "linear-gradient(160deg, rgba(19,20,29,.92), rgba(8,9,15,.94))", boxShadow: "inset 0 1px 0 rgba(255,255,255,.04)" },
  productCardTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" },
  productIndex: { color: "rgba(255,255,255,.28)", fontSize: "12px", fontWeight: 800, letterSpacing: ".14em" },
  availableStatus: { color: "#86efac", border: "1px solid rgba(134,239,172,.24)", background: "rgba(34,197,94,.08)", borderRadius: "999px", padding: "6px 9px", fontSize: "10px", fontWeight: 900, textTransform: "uppercase", letterSpacing: ".1em" },
  enterpriseStatus: { color: "#f5c542", border: "1px solid rgba(245,197,66,.22)", background: "rgba(245,197,66,.07)", borderRadius: "999px", padding: "6px 9px", fontSize: "10px", fontWeight: 900, textTransform: "uppercase", letterSpacing: ".1em" },
  productLabel: { color: "#dfa837", fontSize: "11px", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".13em" },
  productName: { color: "#fff", fontSize: "23px", lineHeight: 1.15, margin: "8px 0 12px", letterSpacing: "-.03em" },
  productDescription: { color: "#9ca3af", fontSize: "14px", lineHeight: 1.65, margin: 0 },
  capabilityList: { display: "flex", flexWrap: "wrap", gap: "8px", margin: "20px 0 24px" },
  capabilityChip: { color: "#cbd5e1", background: "rgba(255,255,255,.045)", border: "1px solid rgba(255,255,255,.07)", borderRadius: "999px", padding: "7px 9px", fontSize: "10px", fontWeight: 700 },
  productLink: { marginTop: "auto", color: "#f5c542", textDecoration: "none", fontSize: "13px", fontWeight: 900, display: "inline-flex", justifyContent: "space-between", alignItems: "center", gap: "12px" },
  portableFooter: { marginTop: "26px", paddingTop: "24px", borderTop: "1px solid rgba(255,255,255,.07)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "24px", flexWrap: "wrap" },
  portableFooterTitle: { color: "#fff", fontSize: "15px" },
  portableFooterText: { color: "#8f98a7", fontSize: "13px", lineHeight: 1.6, maxWidth: "760px", margin: "6px 0 0" },
  goldButton: { display: "inline-flex", alignItems: "center", justifyContent: "center", minHeight: "46px", padding: "0 22px", borderRadius: "999px", background: "linear-gradient(135deg,#f5c542,#dfa837)", color: "#0a0a0d", textDecoration: "none", fontWeight: 900, fontSize: "13px", boxShadow: "0 12px 28px rgba(223,168,55,.18)" },

  categoryGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: "14px" },
  categoryCard: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", backgroundColor: "rgba(15, 15, 22, 0.6)", border: "1px solid rgba(245, 197, 66, 0.14)", borderRadius: "18px", padding: "18px 20px", boxShadow: "inset 0 1px 0 rgba(255,255,255,.05)", textDecoration: "none", minHeight: "84px" },
  categoryCardCopy: { display: "flex", flexDirection: "column", minWidth: 0 },
  categoryName: { fontSize: "16px", fontWeight: 800, color: "#f8fafc" },
  categoryMeta: { fontSize: "12px", color: "#dfa837", fontWeight: 800, marginTop: "4px" },
  categoryArrow: { color: "#f5c542", fontSize: "18px", fontWeight: 900, flexShrink: 0 },
  browseAllRow: { display: "flex", justifyContent: "center", marginTop: "36px" },
  browseAllButton: { display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: "999px", border: "1px solid rgba(255,255,255,.14)", background: "rgba(255,255,255,.06)", color: "#fff", minHeight: "48px", padding: "0 26px", fontWeight: 900, fontSize: "14px", textDecoration: "none" },
  stepsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" },
  stepGlassCard: { backgroundColor: "rgba(10, 10, 15, 0.4)", border: "1px solid rgba(255, 255, 255, 0.06)", padding: "30px 24px", borderRadius: "18px", textAlign: "left" },
  stepNumberBadge: { width: "32px", height: "32px", backgroundColor: "rgba(223, 168, 55, 0.08)", border: "1px solid rgba(223, 168, 55, 0.25)", color: "#dfa837", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "13px", marginBottom: "20px" },
  stepBodyText: { fontSize: "15px", color: "#94a3b8", fontWeight: 500, margin: 0, lineHeight: "1.6" },
};