// File: components/home/HomeApp.tsx
// Phase B2 of the homepage conversion — the client shell.
//
// Wires useRegion (B1) + the ported selectors (A4) + i18n tables (A3). Loads
// partners from /partners.json with the SAME embedded fallback behavior as the
// current page. Holds UI state (filter, search, active category). Renders the
// three-column layout. Render zones are inline here for now and will be
// extracted into components/home/* (C1–C5) in later commits, each kept green.
//
// Styling: className hooks match the ported CSS module (Phase C6). Until the
// module is wired, layout falls back to unstyled but functional.

"use client";

import { useEffect, useMemo, useState } from "react";
import { useRegion } from "@/components/home/useRegion";
import {
  I18N,
  CATEGORY_META,
  REGION_LABELS,
  REGION_GRAMMAR,
  LANG_LABELS,
  REGION_LANGUAGE,
} from "@/lib/home/i18n-home";
import {
  type HomePartner,
  normalizePartners,
  baseFilteredPartners,
  sidebarPartners,
  headerPartners,
  topPartners,
  groupedPartners,
  partnerUrl,
  isLocal,
} from "@/lib/home/partners-home";

type Filter = "featured" | "all" | "travel" | "local";

export default function HomeApp() {
  const { region, lang, ready, regions, allowedLangs, setRegion, setLanguage } = useRegion();
  const [partners, setPartners] = useState<HomePartner[]>([]);
  const [filter, setFilter] = useState<Filter>("featured");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const [promptOpen, setPromptOpen] = useState(false);

  // Load partners.json (embedded fallback handled by the page passing data, but
  // we also fetch here to mirror current behavior exactly).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/partners.json", { cache: "no-store" });
        if (!res.ok) throw new Error(String(res.status));
        const data = await res.json();
        if (!cancelled) setPartners(normalizePartners(data));
      } catch {
        // Fallback: leave empty; page can hydrate from an embedded list if provided.
        if (!cancelled) setPartners([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // i18n helpers bound to current language
  const t = useMemo(
    () =>
      (key: string, vars: Record<string, string> = {}) =>
        (I18N[lang]?.[key] || I18N.en[key] || key).replace(
          /{(\w+)}/g,
          (_: string, k: string) => vars[k] ?? ""
        ),
    [lang]
  );
  const categoryName = useMemo(
    () => (key: string) =>
      (CATEGORY_META[key] as unknown as Record<string, string>)?.[lang] ||
      CATEGORY_META[key]?.en ||
      key.replace(/_/g, " "),
    [lang]
  );
  const regionLabel = (key: string) =>
    REGION_LABELS[lang]?.[key] || REGION_LABELS.en[key] || key;
  const regionTitleLabel = (key: string) =>
    REGION_GRAMMAR[lang]?.[key] || regionLabel(key);

  const opts = { region, search, filter, categoryName };

  const sidebarGroups = useMemo(
    () => groupedPartners(sidebarPartners(partners, opts), categoryName),
    [partners, region, search, filter, lang]
  );
  const headerGroups = useMemo(
    () => groupedPartners(headerPartners(partners, opts), categoryName),
    [partners, region, search, lang]
  );
  const heroPicks = useMemo(() => topPartners(partners, opts, 3), [partners, region, search, filter, lang]);
  const feedPicks = useMemo(() => topPartners(partners, opts, 5), [partners, region, search, filter, lang]);
  const rightPicks = useMemo(() => {
    let picks = topPartners(partners, opts, 8);
    if (region === "us") {
      const amazon = partners.find((p) => p.id === "amazon" && isLocal(p, region));
      if (amazon) picks = [amazon, ...picks.filter((p) => p.id !== "amazon")].slice(0, 8);
    }
    return picks;
  }, [partners, region, search, filter, lang]);

  const regionName = regions.find((r) => r.key === region)?.label || region;
  const hasLocalLang = (REGION_LANGUAGE[region] || "en") !== "en";

  return (
    <div className="sb-home">
      <header className="top">
        <div className="logo">{t("brand_name")}</div>
        <nav className="travel-header" aria-label="Travel partners">
          {headerGroups.map(([key, items]) => (
            <div className="travel-menu" key={key}>
              <span className="travel-menu-btn">
                <span>{CATEGORY_META[key]?.icon || "•"}</span>
                <span>{categoryName(key)}</span>
                <span className="travel-count">{items.length}</span>
              </span>
            </div>
          ))}
        </nav>
      </header>

      <div className="app">
        {/* LEFT — sidebar */}
        <aside className="col left">
          <div className="sidebar-top">
            <div className="small-title">{t("explore_offers")}</div>
            <input
              className="partner-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("search_placeholder")}
            />
          </div>
          <div className="column1">
            {sidebarGroups.length === 0 ? (
              <div className="empty">{t("no_results")}</div>
            ) : (
              <div className="category-grid">
                {sidebarGroups.map(([key, items]) => (
                  <button
                    key={key}
                    className={"category-tile" + (activeCategory === key ? " active" : "")}
                    onClick={() => setActiveCategory(activeCategory === key ? "" : key)}
                  >
                    <span className="category-tile-left">
                      <span className="category-tile-icon">{CATEGORY_META[key]?.icon || "•"}</span>
                      <span className="category-tile-title">{categoryName(key)}</span>
                    </span>
                    <span className="category-tile-count">{items.length}</span>
                  </button>
                ))}
              </div>
            )}
            {activeCategory &&
              (() => {
                const found = sidebarGroups.find(([k]) => k === activeCategory);
                if (!found) return null;
                const [key, items] = found;
                return (
                  <section className="selected-panel">
                    <div className="selected-panel-head">
                      <strong>
                        {CATEGORY_META[key]?.icon || "•"} {categoryName(key)} ({items.length})
                      </strong>
                      <button className="selected-close" onClick={() => setActiveCategory("")}>
                        ×
                      </button>
                    </div>
                    <div className="selected-list">
                      {items.map((p) => (
                        <a
                          key={p.id}
                          className="partner-row"
                          href={partnerUrl(p, region)}
                          target="_blank"
                          rel="noopener sponsored"
                        >
                          <div className="partner-row-main">
                            <strong>{p.name}</strong>
                            <span>
                              {p.description || p.network || categoryName(p.category_key || "")}
                              {isLocal(p, region) ? " • " + t("local") : ""}
                            </span>
                          </div>
                          <span className="tier-badge">
                            {t("tier")} {p.tier || 1}
                          </span>
                        </a>
                      ))}
                    </div>
                  </section>
                );
              })()}
          </div>
        </aside>

        {/* MAIN — hero + feed */}
        <main className="col main">
          <div className="main-layout">
            <section className="trend-strip">
              <span className="trend-kicker">{t("trending")}</span>
              <div className="trend-items">
                {topPartners(partners, opts, 8).map((p) => (
                  <a
                    key={p.id}
                    className="trend-pill"
                    href={partnerUrl(p, region)}
                    target="_blank"
                    rel="noopener sponsored"
                  >
                    {p.name}
                  </a>
                ))}
              </div>
            </section>
            <div className="hero-feed-row">
              <section className="region-hero">
                <div className="hero-copy">
                  <div className="region-badge">{regionName}</div>
                  <h1>{t("hero_title", { region: regionTitleLabel(region) })}</h1>
                  <p>{t("hero_copy")}</p>
                  <div className="hero-actions">
                    <a className="primary-cta" href="#column1">
                      {t("explore_region")}
                    </a>
                    <button className="secondary-cta" onClick={() => setFilter("all")}>
                      {t("show_all")}
                    </button>
                  </div>
                </div>
                <div className="hero-partners">
                  {heroPicks.map((p) => (
                    <a
                      key={p.id}
                      className="hero-mini-card"
                      href={partnerUrl(p, region)}
                      target="_blank"
                      rel="noopener sponsored"
                    >
                      <strong>{p.name}</strong>
                      <span>
                        {categoryName(p.category_key || "")} • {p.network || ""}
                      </span>
                    </a>
                  ))}
                </div>
              </section>
              <div className="feed-container">
                {feedPicks.map((p) => (
                  <a
                    key={p.id}
                    className="feed-card"
                    href={partnerUrl(p, region)}
                    target="_blank"
                    rel="noopener sponsored"
                  >
                    <div className="feed-content-static">
                      <span className="feed-label">{categoryName(p.category_key || "")}</span>
                      <span className="feed-source">{p.network || ""}</span>
                      <h3>{p.name}</h3>
                      <p>{p.description || ""}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </main>

        {/* RIGHT — featured + chips */}
        <aside className="col right">
          <h2>{t("partners")}</h2>
          <p className="right-sub">{t("right_sub")}</p>
          <div className="partner-chips">
            {rightPicks[0] && (
              <a
                className="featured"
                href={partnerUrl(rightPicks[0], region)}
                target="_blank"
                rel="noopener sponsored"
              >
                <div className="featured-body">
                  <h4>{categoryName(rightPicks[0].category_key || "")}</h4>
                  <p>{rightPicks[0].name}</p>
                  <span>{rightPicks[0].description || rightPicks[0].network || ""}</span>
                </div>
              </a>
            )}
            <div className="chip-grid">
              {rightPicks.slice(1).map((p) => (
                <a
                  key={p.id}
                  className="chip"
                  href={partnerUrl(p, region)}
                  target="_blank"
                  rel="noopener sponsored"
                >
                  {p.name}
                </a>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Language trigger + prompt (Local / English) */}
      {hasLocalLang && (
        <button
          className="language-trigger"
          data-show="1"
          onClick={() => setPromptOpen(true)}
        >
          🌐 <span>{LANG_LABELS[lang] || "Language"}</span>
        </button>
      )}
      {promptOpen && hasLocalLang && (
        <div className="language-prompt" data-open="1" role="dialog">
          <div className="language-tabs">
            <button
              className={"language-tab" + (lang !== "en" ? " active" : "")}
              onClick={() => {
                setLanguage(REGION_LANGUAGE[region] || "en", true);
                setPromptOpen(false);
              }}
            >
              {LANG_LABELS[REGION_LANGUAGE[region]] || "Local"}
            </button>
            <button
              className={"language-tab" + (lang === "en" ? " active" : "")}
              onClick={() => {
                setLanguage("en", true);
                setPromptOpen(false);
              }}
            >
              English
            </button>
            <button className="language-prompt-close" onClick={() => setPromptOpen(false)}>
              ×
            </button>
          </div>
          <div className="language-prompt-body">
            <strong>{t("language_prompt_title")}</strong>
            <p>{t("language_prompt_copy")}</p>
          </div>
        </div>
      )}
    </div>
  );
}
