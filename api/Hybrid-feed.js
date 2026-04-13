// ===============================
// HYBRID VIDEO FEED
// signalboostapp.com
// ===============================

const magnetoColumn = document.getElementById('magnetoColumn');
const magnetoFeed = document.getElementById('magnetoFeed');
const magnetoLoader = document.getElementById('magnetoLoader');

let loading = false;
let page = 0;
let hasMore = true;

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function clearPlaceholderCards() {
  if (!magnetoFeed) return;
  const existingCards = magnetoFeed.querySelectorAll('.magneto-card, .magneto-empty');
  existingCards.forEach(card => card.remove());
}

function renderFallbackState(title, text) {
  if (!magnetoFeed || !magnetoLoader) return;

  clearPlaceholderCards();

  const empty = document.createElement('article');
  empty.className = 'magneto-empty';
  empty.innerHTML = `
    <div>
      <div class="magneto-empty-title">${escapeHtml(title)}</div>
      <div class="magneto-empty-text">${escapeHtml(text)}</div>
    </div>
  `;

  magnetoFeed.insertBefore(empty, magnetoLoader);
}

async function fetchHybridVideos(pageNumber) {
  // IMPORTANT:
  // Change BASE_URL only if your API lives on another domain/subdomain.
  // If the JS runs on signalboostapp.com and the API is also there,
  // this can stay exactly like this.
  const BASE_URL = 'https://www.signalboostapp.com';

  const url = `${BASE_URL}/api/hybrid-feed?type=video&sort=recent&page=${pageNumber}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Hybrid feed request failed (${res.status}) ${body.slice(0, 140)}`);
  }

  const data = await res.json();

  // Support multiple backend response shapes
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.results)) return data.results;

  console.warn('Unexpected hybrid feed format:', data);
  return [];
}

function createVideoCard(item) {
  const card = document.createElement('article');
  card.className = 'card card-clickable magneto-card';

  const safeThumb = item?.thumbnail ? String(item.thumbnail).replace(/'/g, '%27') : '';
  const safeTitle = escapeHtml(item?.title || 'Untitled video');
  const safePlatform = item?.platform ? escapeHtml(item.platform) : '';
  const safeUrl = item?.url ? String(item.url) : '';
  const badgeText = item?.badge ? escapeHtml(item.badge) : 'Recent';
  const embedHtml = typeof item?.embedHtml === 'string' ? item.embedHtml.trim() : '';
  const hasEmbed = Boolean(embedHtml);

  if (safeUrl && !hasEmbed) {
    card.addEventListener('click', () => {
      window.open(safeUrl, '_blank', 'noopener');
    });
  }

  const platformHtml = safePlatform ? `<span>${safePlatform}</span>` : '<span></span>';

  const thumbHtml = safeThumb
    ? `<div class="magneto-thumb" style="background-image:url('${safeThumb}'); background-size:cover; background-position:center;"></div>`
    : '';

  const titleHtml = safeUrl
    ? `<a class="magneto-title" href="${safeUrl}" target="_blank" rel="noopener">${safeTitle}</a>`
    : `<div class="magneto-title">${safeTitle}</div>`;

  const embedBlock = hasEmbed
    ? `<div class="magneto-embed">${embedHtml}</div>`
    : '';

  card.innerHTML = `
    ${thumbHtml}
    ${titleHtml}
    <div class="magneto-meta">
      ${platformHtml}
      <span class="magneto-badge">${badgeText}</span>
    </div>
    ${embedBlock}
  `;

  hydrateEmbedProviders(card);
  return card;
}

function loadExternalScriptOnce(src, checkFn) {
  if (typeof checkFn === 'function' && checkFn()) {
    return Promise.resolve();
  }

  const existing = document.querySelector(`script[src="${src}"]`);
  if (existing) {
    return new Promise(resolve => {
      if (typeof checkFn !== 'function' || checkFn()) {
        resolve();
        return;
      }
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => resolve(), { once: true });
    });
  }

  return new Promise(resolve => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => resolve();
    document.body.appendChild(script);
  });
}

async function hydrateEmbedProviders(scope = document) {
  try {
    if (scope.querySelector('.tiktok-embed')) {
      await loadExternalScriptOnce(
        'https://www.tiktok.com/embed.js',
        () => Boolean(window.tiktokEmbed)
      );

      if (window.tiktokEmbed && typeof window.tiktokEmbed.load === 'function') {
        window.tiktokEmbed.load();
      }
    }

    if (scope.querySelector('.instagram-media, blockquote.instagram-media')) {
      await loadExternalScriptOnce(
        'https://www.instagram.com/embed.js',
        () => Boolean(window.instgrm)
      );

      if (window.instgrm?.Embeds?.process) {
        window.instgrm.Embeds.process();
      }
    }

    if (scope.querySelector('.twitter-tweet, blockquote.twitter-tweet')) {
      await loadExternalScriptOnce(
        'https://platform.twitter.com/widgets.js',
        () => Boolean(window.twttr)
      );

      if (window.twttr?.widgets?.load) {
        window.twttr.widgets.load(scope);
      }
    }

    // YouTube iframe embeds do not need extra hydration
  } catch (error) {
    console.error('Embed hydration error:', error);
  }
}

async function loadMoreHybridCards() {
  if (!magnetoFeed || !magnetoLoader) return;
  if (loading || !hasMore) return;

  loading = true;
  magnetoLoader.style.display = '';
  magnetoLoader.textContent = 'Loading…';

  try {
    const items = await fetchHybridVideos(page);

    if (!items || items.length === 0) {
      hasMore = false;

      if (page === 0) {
        renderFallbackState(
          'No videos yet',
          'No embeddable hybrid videos were returned by the feed.'
        );
      }

      magnetoLoader.textContent = 'No more videos.';
      return;
    }

    if (page === 0) {
      clearPlaceholderCards();
    }

    items.forEach(item => {
      const card = createVideoCard(item);
      magnetoFeed.insertBefore(card, magnetoLoader);
    });

    await hydrateEmbedProviders(magnetoFeed);

    page += 1;
    magnetoLoader.textContent = 'Scroll to load more…';
  } catch (err) {
    console.error('Hybrid feed error:', err);

    if (page === 0) {
      renderFallbackState(
        'Hybrid feed unavailable',
        'The page is ready, but /api/hybrid-feed is not returning usable embedded video data yet.'
      );
      magnetoLoader.style.display = 'none';
      return;
    }

    magnetoLoader.textContent = 'Error loading feed.';
  } finally {
    loading = false;
  }
}

function initHybridFeed() {
  if (!magnetoColumn || !magnetoFeed || !magnetoLoader) {
    console.warn('Hybrid feed elements not found on page.');
    return;
  }

  magnetoColumn.addEventListener('scroll', () => {
    const { scrollTop, scrollHeight, clientHeight } = magnetoColumn;

    if (scrollTop + clientHeight >= scrollHeight - 80) {
      loadMoreHybridCards();
    }
  });

  hydrateEmbedProviders(document);
  loadMoreHybridCards();
}

document.addEventListener('DOMContentLoaded', initHybridFeed);
