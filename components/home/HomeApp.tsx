// File: components/home/HomeApp.tsx
// R7 — Concierge-first restructure.
//
// Landing = centered Concierge (ConciergeHero). A query/chip runs the rule
// matcher (conciergeMatch), records the search to anonymous memory, and shows
// results in ConciergeThread. "Browse all" reveals the original 3-column grid
// (preserved verbatim — revenue logic unchanged). NudgeBubble handles idle /
// no-results / returning-visitor prompts. Region + language auto-detected.

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
  sidebarPartners,
  headerPartners,
  topPartners,
  groupedPartners,
  partnerUrl,
  isLocal,
} from "@/lib/home/partners-home";
import { conciergeMatch } from "@/lib/home/concierge-match";
import { getOrCreateMemory, recordSearch, rememberedDestination } from "@/lib/home/visitor-memory";
import ConciergeHero from "@/components/home/ConciergeHero";
import ConciergeThread, { type Turn } from "@/components/home/ConciergeThread";
import NudgeBubble from "@/components/home/NudgeBubble";
import HomeSections from "@/components/home/HomeSections";
import AdminBar from "@/components/home/AdminBar";

type View = "concierge" | "browse";

export default function HomeApp() {
  const { region, lang, regions, setRegion, setLanguage } = useRegion();
  const [partners, setPartners] = useState<HomePartner[]>([]);
  const [view, setView] = useState<View>("concierge");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [noResults, setNoResults] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const [promptOpen, setPromptOpen] = useState(false);

  // Load partners from the live API (Supabase-backed, with static JSON
  // fallback inside the endpoint). Additions/edits/deletions in the database
  // now appear on the site without a redeploy.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/partners", { cache: "no-store" });
        if (!res.ok) throw new Error(String(res.status));
        const data = await res.json();
        if (!cancelled) setPartners(normalizePartners(data));
      } catch {
        // Last-ditch fallback: try the static file directly.
        try {
          const res2 = await fetch("/partners.json", { cache: "no-store" });
          const data2 = await res2.json();
          if (!cancelled) setPartners(normalizePartners(data2));
        } catch {
          if (!cancelled) setPartners([]);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Stamp anonymous visitor memory once region/lang are known.
  useEffect(() => {
    if (region) getOrCreateMemory(region, lang);
  }, [region, lang]);

  // ---- i18n helpers ----
  const t = useMemo(
    () =>
      (key: string, varsOrFallback: Record<string, string> | string = {}) => {
        // Second arg may be a vars object (for {region} substitution) or a
        // plain string fallback. Normalize both.
        const isFallback = typeof varsOrFallback === "string";
        const vars: Record<string, string> = isFallback ? {} : varsOrFallback;
        const fallback = isFallback ? (varsOrFallback as string) : key;
        const raw = I18N[lang]?.[key] || I18N.en[key] || fallback;
        return raw.replace(/{(\w+)}/g, (_: string, k: string) => vars[k] ?? "");
      },
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

  // Option C description resolver (no English leak).
  const partnerDesc = useMemo(
    () =>
      (p: { description?: string; description_i18n?: Record<string, string>; category_key?: string }) => {
        const i18n = p.description_i18n;
        const langKey = lang === "pt-BR" ? "pt" : lang;
        if (i18n && typeof i18n[langKey] === "string" && i18n[langKey].trim()) return i18n[langKey];
        if (i18n && lang === "en" && typeof i18n.en === "string" && i18n.en.trim()) return i18n.en;
        return categoryName(p.category_key || "");
      },
    [lang, categoryName]
  );

  // ---- Concierge query handling ----
  const responseLineFor = (count: number, query: string) => {
    if (count === 0) {
      return (
        {
          en: `I couldn't find a direct match for "${query}". Try describing it differently?`,
          "pt-BR": `Não encontrei algo direto para "${query}". Pode descrever de outro jeito?`,
          es: `No encontré algo directo para "${query}". ¿Puedes describirlo de otra forma?`,
          pl: `Nie znalazłem dopasowania dla "${query}". Opisz to inaczej?`,
          de: `Keine direkte Übereinstimmung für "${query}". Anders beschreiben?`,
          fr: `Aucune correspondance directe pour "${query}". Décrivez-le autrement ?`,
          it: `Nessuna corrispondenza diretta per "${query}". Provi a descriverlo diversamente?`,
        }[lang] || `I couldn't find a direct match for "${query}".`
      );
    }
    return (
      {
        en: `I found ${count} partner${count > 1 ? "s" : ""} that can help.`,
        "pt-BR": `Encontrei ${count} parceiro${count > 1 ? "s" : ""} que podem ajudar.`,
        es: `Encontré ${count} socio${count > 1 ? "s" : ""} que pueden ayudar.`,
        pl: `Znalazłem ${count} pasujących partnerów.`,
        de: `Ich habe ${count} passende Partner gefunden.`,
        fr: `J'ai trouvé ${count} partenaire${count > 1 ? "s" : ""}.`,
        it: `Ho trovato ${count} partner utili.`,
      }[lang] || `I found ${count} partners that can help.`
    );
  };

  // Map an AI /api/chat PartnerCard into the thread's MatchResult shape.
  // We resolve the full HomePartner from the loaded list by id (so category_key,
  // network and description_i18n render/localize correctly), but keep the AI's
  // server-resolved affiliate `url` (revenue-safe, geo-correct).
  const aiCardToMatch = (card: {
    id?: string;
    name?: string;
    category?: string;
    description?: string;
    url?: string;
  }) => {
    const found = partners.find((p) => p.id === card.id);
    const partner: HomePartner =
      found ||
      ({
        id: card.id || card.url || "",
        name: card.name || "",
        category_key: "",
        description: card.description || "",
        regions: [region],
      } as HomePartner);
    return { partner, url: card.url || partnerUrl(partner, region), score: 1 };
  };

  const runQuery = async (rawQuery: string) => {
    // Intent continuity: if the query implies a follow-up ("hotel too") and we
    // have a remembered destination, append it for better matching.
    const dest = rememberedDestination();
    const enriched = dest && !new RegExp(dest, "i").test(rawQuery) ? `${rawQuery} ${dest}` : rawQuery;

    const { intent, matches, useAI } = conciergeMatch(partners, region, enriched);
    recordSearch({
      query: rawQuery,
      intent: intent.category || undefined,
      destination: intent.destination || dest || undefined,
    });
    // Anonymous analytics ping (fire-and-forget; never blocks the search).
    try {
      fetch("/api/track/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: rawQuery,
          intent: intent.category || "",
          region,
          results_count: matches.length,
        }),
        keepalive: true,
      }).catch(() => {});
    } catch {
      /* ignore */
    }

    // Show rule results immediately so the UI is responsive.
    const turnIndex = turns.length;
    setNoResults(matches.length === 0);
    setTurns((prev) => [
      ...prev,
      { query: rawQuery, responseLine: responseLineFor(matches.length, rawQuery), matches },
    ]);
    setView("concierge");

    // If the rules were unsure (vague/conversational/mixed-language or no hit),
    // ask the AI endpoint for a real understanding. It returns server-resolved
    // affiliate URLs, so links stay revenue-safe. Degrade gracefully to the rule
    // results if the call fails or returns nothing.
    if (!useAI) return;
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: rawQuery }], lang }),
      });
      if (!res.ok) return;
      const data = await res.json();
      const cards = Array.isArray(data?.partners) ? data.partners : [];
      if (cards.length === 0) return;
      const aiMatches = cards.map(aiCardToMatch);
      const aiLine =
        typeof data?.reply === "string" && data.reply.trim()
          ? data.reply.trim()
          : responseLineFor(aiMatches.length, rawQuery);
      setNoResults(false);
      setTurns((prev) => {
        const next = [...prev];
        if (next[turnIndex]) {
          next[turnIndex] = { query: rawQuery, responseLine: aiLine, matches: aiMatches };
        }
        return next;
      });
    } catch {
      // Keep the rule results already shown.
    }
  };

  const onChip = (category: string) => {
    const label = categoryName(category);
    runQuery(label);
  };

  const newSearch = () => {
    setTurns([]);
    setNoResults(false);
  };

  // ---- Browse-all grid data (preserved from prior version) ----
  const opts = { region, search, filter: "featured" as const, categoryName };
  const sidebarGroups = useMemo(
    () => groupedPartners(sidebarPartners(partners, opts), categoryName),
    [partners, region, search, lang]
  );
  const headerGroups = useMemo(
    () => groupedPartners(headerPartners(partners, opts), categoryName),
    [partners, region, search, lang]
  );
  const rightPicks = useMemo(() => {
    let picks = topPartners(partners, opts, 8);
    if (region === "us") {
      const amazon = partners.find((p) => p.id === "amazon" && isLocal(p, region));
      if (amazon) picks = [amazon, ...picks.filter((p) => p.id !== "amazon")].slice(0, 8);
    }
    return picks;
  }, [partners, region, lang]);

  const regionName = regions.find((r) => r.key === region)?.label || region;
  const hasLocalLang = (REGION_LANGUAGE[region] || "en") !== "en";

  const refinePlaceholder =
    { en: "Refine or ask for something else…", "pt-BR": "Refine ou peça outra coisa…", es: "Refina o pide otra cosa…", pl: "Doprecyzuj lub zapytaj o coś innego…", de: "Verfeinern oder etwas anderes…", fr: "Affinez ou demandez autre chose…", it: "Affina o chiedi altro…" }[lang] ||
    "Refine or ask for something else…";
  const emptyHelp =
    { en: "Tell me a bit more about what you're looking for, and I'll try again.", "pt-BR": "Conte um pouco mais sobre o que procura e eu tento de novo.", es: "Cuéntame un poco más sobre lo que buscas y lo intento de nuevo.", pl: "Powiedz więcej o tym, czego szukasz, a spróbuję ponownie.", de: "Erzähl mir mehr, dann versuche ich es erneut.", fr: "Dites-m'en un peu plus et je réessaie.", it: "Dimmi un po' di più e riprovo." }[lang] ||
    "Tell me a bit more about what you're looking for.";

  return (
    <div className="sb-home">
      <AdminBar />
      {/* CONCIERGE VIEW */}
      {view === "concierge" && (
        <>
          {turns.length === 0 ? (
            <>
              <ConciergeHero
                lang={lang}
                regionName={regionName}
                onSubmit={runQuery}
                onChip={onChip}
                onBrowseAll={() => setView("browse")}
              />
              <HomeSections lang={lang} onPopular={runQuery} />
            </>
          ) : (
            <div className="concierge-results-wrap">
              <div className="concierge-results-bar">
                <button className="concierge-newsearch" onClick={newSearch}>
                  ← {t("explore_offers", "New search")}
                </button>
                <button className="concierge-browse-link" onClick={() => setView("browse")}>
                  {t("show_all", "Browse all")} →
                </button>
              </div>
              <ConciergeThread
                lang={lang}
                region={region}
                turns={turns}
                onRefine={runQuery}
                refinePlaceholder={refinePlaceholder}
                partnerDesc={partnerDesc}
                emptyHelp={emptyHelp}
              />
            </div>
          )}
        </>
      )}

      {/* BROWSE-ALL VIEW (original grid, preserved) */}
      {view === "browse" && (
        <>
          <header className="top">
            <div className="logo">{t("brand_name", "SignalBoost")}</div>
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

          <div className="browse-back-bar">
            <button className="concierge-newsearch" onClick={() => setView("concierge")}>
              ← {t("explore_offers", "Back to Concierge")}
            </button>
          </div>

          <div className="app">
            <aside className="col left">
              <div className="sidebar-top">
                <div className="small-title">{t("explore_offers", "Explore offers")}</div>
                <input
                  className="partner-search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t("search_placeholder", "Search offers...")}
                />
              </div>
              <div className="column1">
                {sidebarGroups.length === 0 ? (
                  <div className="empty">{t("no_results", "No partners match.")}</div>
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
                                  {partnerDesc(p)}
                                  {isLocal(p, region) ? " • " + t("local", "Local") : ""}
                                </span>
                              </div>
                              <span className="tier-badge">
                                {t("tier", "Tier")} {p.tier || 1}
                              </span>
                            </a>
                          ))}
                        </div>
                      </section>
                    );
                  })()}
              </div>
            </aside>

            <main className="col main">
              <div className="main-layout">
                <section className="trend-strip">
                  <span className="trend-kicker">{t("trending", "Trending")}</span>
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
                      <p>{t("hero_copy", "")}</p>
                    </div>
                    <div className="hero-partners">
                      {topPartners(partners, opts, 3).map((p) => (
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
                    {topPartners(partners, opts, 5).map((p) => (
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
                          <p>{partnerDesc(p)}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </main>

            <aside className="col right">
              <h2>{t("partners", "Partners")}</h2>
              <p className="right-sub">{t("right_sub", "Featured for your region")}</p>
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
                      <span>{partnerDesc(rightPicks[0])}</span>
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
        </>
      )}

      {/* Language trigger + prompt */}
      {hasLocalLang && (
        <button className="language-trigger" data-show="1" onClick={() => setPromptOpen(true)}>
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
            <strong>{t("language_prompt_title", "Choose language")}</strong>
            <p>{t("language_prompt_copy", "")}</p>
          </div>
        </div>
      )}

      {/* Proactive nudge + returning greeting */}
      <NudgeBubble
        lang={lang}
        noResults={noResults}
        onAccept={() => {
          setView("concierge");
          newSearch();
        }}
      />
    </div>
  );
}
