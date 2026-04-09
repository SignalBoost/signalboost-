// script.js

/* ----------------------------
   Affiliate click tracking
---------------------------- */
const clickTracker = {};

window.trackClick = function trackClick(partner) {
  clickTracker[partner] = (clickTracker[partner] || 0) + 1;
  localStorage.setItem("affiliate_clicks", JSON.stringify(clickTracker));
};

try {
  const saved = localStorage.getItem("affiliate_clicks");
  if (saved) Object.assign(clickTracker, JSON.parse(saved));
} catch {}

/* ----------------------------
   Feed rendering (dynamic)
---------------------------- */
let VIDEO_POOL = [];
let promoIdx = 0;
let heroIdx = 0;
let widgetIdx = 0;

function getEmbedIcon(type) {
  const icons = { youtube: "▶️", tiktok: "♪", instagram: "📷", reddit: "🔴" };
  return icons[type] || "🎬";
}

function pickFirstSource(raw) {
  if (raw?.url) return { type: raw.type, url: raw.url };
  if (Array.isArray(raw?.sources) && raw.sources.length) return raw.sources[0];
  if (raw?.source?.url) return raw.source;
  return null;
}

function toIsoDate(raw) {
  // Accepts multiple possible shapes
  if (raw?.publishedAt) return raw.publishedAt;
  if (raw?.pubDate) return raw.pubDate;
  if (raw?.date) return raw.date;
  if (raw?.createdAt) return raw.createdAt;

  // Reddit often: created_utc (seconds)
  if (typeof raw?.created_utc === "number") return new Date(raw.created_utc * 1000).toISOString();

  return "";
}

function normalizeFeedItem(raw) {
  const source = pickFirstSource(raw);

  const type =
    raw?.type ||
    source?.type ||
    (raw?.platform ? String(raw.platform).toLowerCase() : "other");

  const url =
    raw?.url ||
    source?.url ||
    "#";

  return {
    uid: raw?.uid || raw?.id || (crypto?.randomUUID?.() ?? String(Math.random())),
    platform: raw?.platform || (type ? type[0].toUpperCase() + type.slice(1) : "Platform"),
    type,
    title: raw?.title || "Untitled",
    desc: raw?.desc || raw?.user || raw?.author || "",
    views: raw?.views || raw?.analytics?.views || "",
    image: raw?.image || raw?.thumb || "",
    publishedAt: toIsoDate(raw),
    url
  };
}

function gradientsRand() {
  const gradients = ["g1", "g2", "g3", "g4", "g5"];
  return gradients[Math.floor(Math.random() * gradients.length)];
}

function buildPromoCard(item) {
  const card = document.createElement("a");
  card.className = "promo-card";
  card.href = item.url;
  card.target = "_blank";
  card.rel = "noopener";

  const grad = gradientsRand();
  const icon = getEmbedIcon(item.type);

  const thumb = document.createElement("div");
  thumb.className = "promo-thumb " + grad;
  thumb.innerHTML =
    `<div class="embed-placeholder">${icon}<span class="embed-label">${item.platform} - Click to watch</span></div>` +
    `<span class="promo-new-badge">${item.platform}</span>`;

  const body = document.createElement("div");
  body.className = "promo-body";
  body.innerHTML =
    `<div class="promo-kicker">${item.platform}</div>` +
    `<div class="promo-title">${escapeHtml(item.title)}</div>` +
    `<div class="promo-desc">${escapeHtml(item.desc || "")}</div>` +
    `<div class="promo-meta">${item.views ? `👁 ${escapeHtml(String(item.views))}` : ""}</div>`;

  card.appendChild(thumb);
  card.appendChild(body);
  return card;
}

function buildHeroCard(item) {
  const card = document.createElement("a");
  card.className = "hero-card";
  card.href = item.url;
  card.target = "_blank";
  card.rel = "noopener";

  const grad = gradientsRand();
  const icon = getEmbedIcon(item.type);

  const thumb = document.createElement("div");
  thumb.className = "hero-thumb " + grad;
  thumb.innerHTML =
    `<div class="embed-placeholder" style="font-size:5rem;">${icon}<span class="embed-label">${item.platform} - Click to watch</span></div>` +
    `<div class="overlay-grad"></div>` +
    `<div class="hero-badge">${item.platform}</div>` +
    `<div class="hero-info"><h3>${escapeHtml(item.title)}</h3></div>`;

  const actions = document.createElement("div");
  actions.className = "hero-actions";
  actions.innerHTML =
    `<button class="hero-action-btn primary" type="button">▶ Watch</button>` +
    `<span class="hero-stats">${item.views ? `👁 ${escapeHtml(String(item.views))}` : ""}</span>`;

  // ensure button still opens link
  const btn = actions.querySelector("button");
  if (btn) {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      window.open(item.url, "_blank", "noopener");
    });
  }

  card.appendChild(thumb);
  card.appendChild(actions);
  return card;
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function loadFeedJson() {
  const res = await fetch(`feed.json?ts=${Date.now()}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`feed.json fetch failed (${res.status})`);
  const data = await res.json();

  const items = Array.isArray(data.items) ? data.items : [];
  VIDEO_POOL = items.map(normalizeFeedItem);

  // newest-first always
  VIDEO_POOL.sort((a, b) => {
    const ta = Date.parse(a.publishedAt || "") || 0;
    const tb = Date.parse(b.publishedAt || "") || 0;
    return tb - ta;
  });

  if (!VIDEO_POOL.length) {
    VIDEO_POOL = [
      normalizeFeedItem({ platform: "Feed", type: "other", title: "No items found in feed.json", desc: "Check GitHub Actions", url: "#" })
    ];
  }
}

function clearFeeds() {
  const ids = ["promoFeed", "heroFeed", "widgetFeed"];
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = "";
  });
}

function appendInitial(feedId, builder, start, count) {
  const feed = document.getElementById(feedId);
  if (!feed) return;

  for (let i = 0; i < count; i++) {
    const item = VIDEO_POOL[(start + i) % VIDEO_POOL.length];
    feed.appendChild(builder(item));
  }
}

function makeObserver(sentinelId, feedId, builder, getIdx, setIdx) {
  const sentinel = document.getElementById(sentinelId);
  const feed = document.getElementById(feedId);
  if (!sentinel || !feed) return;

  const obs = new IntersectionObserver(
    (entries) => {
      if (!entries[0].isIntersecting) return;
      const idx = getIdx();
      const item = VIDEO_POOL[idx % VIDEO_POOL.length];
      feed.appendChild(builder(item));
      setIdx(idx + 1);
    },
    { rootMargin: "300px" }
  );

  obs.observe(sentinel);
}

async function initFeeds() {
  await loadFeedJson();
  clearFeeds();

  // Seed newest items first across columns
  appendInitial("promoFeed", buildPromoCard, 0, 2);
  appendInitial("heroFeed", buildHeroCard, 2, 2);
  appendInitial("widgetFeed", buildPromoCard, 4, 2);

  promoIdx = 6;
  heroIdx = 8;
  widgetIdx = 10;

  makeObserver("promoSentinel", "promoFeed", buildPromoCard, () => promoIdx, (v) => (promoIdx = v));
  makeObserver("heroSentinel", "heroFeed", buildHeroCard, () => heroIdx, (v) => (heroIdx = v));
  makeObserver("widgetSentinel", "widgetFeed", buildPromoCard, () => widgetIdx, (v) => (widgetIdx = v));
}

initFeeds().catch(console.error);

/* ----------------------------
   Existing UI logic
---------------------------- */
window.toggleCat = function toggleCat(id) {
  document.getElementById(id)?.classList.toggle("open");
};

document.getElementById("partnerSearch")?.addEventListener("input", function () {
  const q = this.value.toLowerCase();
  document.querySelectorAll(".partner-item").forEach((el) => {
    const name = el.querySelector(".p-name");
    el.style.display = name && name.textContent.toLowerCase().includes(q) ? "" : "none";
  });
});

document.getElementById("themeBtn")?.addEventListener("click", function () {
  const on = document.body.classList.toggle("light-theme");
  this.textContent = on ? "🌙 Dark" : "☀️ Light";
  localStorage.setItem("sb_theme", on ? "light" : "dark");
});

if (localStorage.getItem("sb_theme") === "light") {
  document.body.classList.add("light-theme");
  const themeBtn = document.getElementById("themeBtn");
  if (themeBtn) themeBtn.textContent = "🌙 Dark";
}
