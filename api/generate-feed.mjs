/**
 * SignalBoost Hybrid Trending Feed Generator
 *
 * Sources:
 *   - Reddit JSON API (travel + tech + finance subreddits); falls back to RSS
 *     endpoint if the JSON API returns HTTP 403/429 from GitHub Actions.
 *   - RSS feeds (travel blogs / tech / finance news)
 *   - YouTube Data API v3 (optional; requires YOUTUBE_API_KEY secret)
 *
 * Output: /feed.json  { updated_at, items: [{ title, url, cat, source, thumb, ts }] }
 *
 * Usage: node api/generate-feed.mjs
 */

import { writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { XMLParser } from 'fast-xml-parser';

// ─── Configuration ───────────────────────────────────────────────────────────

/** Subreddits to pull (top posts, last 24 h). Add / remove as needed. */
const REDDIT_SUBREDDITS = [
  // travel
  'travel',
  'solotravel',
  'digitalnomad',
  // tech
  'technology',
  'programming',
  // finance
  'personalfinance',
  'investing',
];

/** RSS feeds to include. Replace or extend with any valid RSS/Atom URL. */
const RSS_FEEDS = [
  // Travel
  {
    url: 'https://www.nomadicmatt.com/feed/',
    cat: 'travel',
    source: 'Nomadic Matt',
  },
  {
    url: 'https://feeds.feedburner.com/TravelLeisure',
    cat: 'travel',
    source: 'Travel + Leisure',
  },
  // Tech
  {
    url: 'https://techcrunch.com/feed/',
    cat: 'tech',
    source: 'TechCrunch',
  },
  {
    url: 'https://www.theverge.com/rss/index.xml',
    cat: 'tech',
    source: 'The Verge',
  },
  // Finance
  {
    url: 'https://feeds.marketwatch.com/marketwatch/topstories/',
    cat: 'finance',
    source: 'MarketWatch',
  },
];

/** Maximum total items written to feed.json */
const MAX_ITEMS = 60;

/** Minimum items fetched per Reddit subreddit */
const REDDIT_LIMIT = 10;

/** Maximum items fetched per RSS feed */
const RSS_LIMIT = 10;

/** Maximum YouTube results per category (if API key present) */
const YT_MAX_RESULTS = 10;

/**
 * YouTube video category IDs to search.
 * 19 = Travel & Events, 28 = Science & Technology, 25 = News & Politics
 */
const YT_CATEGORIES = [
  { id: '19', cat: 'travel' },
  { id: '28', cat: 'tech' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const HTTPS_RE = /^https:\/\//i;

/** Browser-like User-Agent used for Reddit requests to reduce likelihood of 403. */
const BROWSER_UA =
  'Mozilla/5.0 (X11; Linux x86_64; rv:124.0) Gecko/20100101 Firefox/124.0';

/** Returns true if url is a valid https URL */
function isHttps(url) {
  if (!url || typeof url !== 'string') return false;
  try {
    const u = new URL(url);
    return u.protocol === 'https:';
  } catch {
    return false;
  }
}

/** Normalise a URL string – ensure https, trim trailing junk */
function normaliseUrl(raw) {
  if (!raw) return null;
  const url = raw.trim();
  if (!HTTPS_RE.test(url)) return null;
  try {
    return new URL(url).href;
  } catch {
    return null;
  }
}

/**
 * Decode common HTML entities left in text when processEntities is disabled.
 * Handles the most frequent entities found in RSS/Atom feed titles.
 */
function decodeEntities(str) {
  if (!str || typeof str !== 'string') return str;
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

/** Fetch with a sensible timeout (default 10 s) */
async function fetchWithTimeout(url, opts = {}, timeoutMs = 10_000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...opts, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

// ─── Reddit ───────────────────────────────────────────────────────────────────

async function fetchReddit(subreddit) {
  const jsonUrl = `https://www.reddit.com/r/${subreddit}/top.json?limit=${REDDIT_LIMIT}&t=day`;
  try {
    const res = await fetchWithTimeout(jsonUrl, {
      headers: {
        'User-Agent': BROWSER_UA,
        Accept: 'application/json',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    });
    if (res.ok) {
      const data = await res.json();
      const posts = data?.data?.children || [];
      return posts
        .map((p) => {
          const d = p.data || {};
          // Prefer the outbound URL; fall back to reddit permalink
          const rawUrl = d.url_overridden_by_dest || `https://www.reddit.com${d.permalink}`;
          const url = normaliseUrl(rawUrl) || normaliseUrl(`https://www.reddit.com${d.permalink}`);
          if (!url) return null;
          return {
            title: d.title || 'Reddit post',
            url,
            cat: redditCat(subreddit),
            source: `r/${subreddit}`,
            thumb: normaliseUrl(d.thumbnail) || null,
            ts: d.created_utc ? new Date(d.created_utc * 1000).toISOString() : null,
          };
        })
        .filter(Boolean);
    }
    if (res.status === 403 || res.status === 429 || res.status === 401) {
      console.warn(
        `[reddit] r/${subreddit} JSON API returned HTTP ${res.status} (common in CI) – trying RSS fallback…`
      );
      return fetchRedditRss(subreddit);
    }
    console.warn(`[reddit] r/${subreddit} returned HTTP ${res.status}`);
    return [];
  } catch (err) {
    console.warn(`[reddit] r/${subreddit} error: ${err.message}`);
    return [];
  }
}

/** Fallback: fetch the subreddit's public RSS feed when JSON API is blocked. */
async function fetchRedditRss(subreddit) {
  const url = `https://www.reddit.com/r/${subreddit}/top.rss?t=day&limit=${REDDIT_LIMIT}`;
  try {
    const res = await fetchWithTimeout(url, {
      headers: {
        'User-Agent': BROWSER_UA,
        Accept: 'application/rss+xml, application/xml, text/xml, */*',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    });
    if (!res.ok) {
      console.warn(`[reddit] r/${subreddit} RSS also failed HTTP ${res.status} – skipping`);
      return [];
    }
    const text = await res.text();
    const parsed = xmlParser.parse(text);
    // Reddit's RSS feed is Atom format
    const feed = parsed?.feed;
    const entries = feed?.entry
      ? Array.isArray(feed.entry)
        ? feed.entry
        : [feed.entry]
      : [];
    const cat = redditCat(subreddit);
    return entries
      .slice(0, REDDIT_LIMIT)
      .map((entry) => {
        let rawUrl =
          typeof entry.link === 'string'
            ? entry.link
            : entry.link?.['@_href'] || entry.link?.['#text'] || null;
        const itemUrl = normaliseUrl(rawUrl);
        if (!itemUrl) return null;
        const rawTitle =
          typeof entry.title === 'string'
            ? entry.title
            : entry.title?.['#text'] || 'Reddit post';
        return {
          title: decodeEntities(rawTitle.trim()),
          url: itemUrl,
          cat,
          source: `r/${subreddit}`,
          thumb: null,
          ts: entry.updated || entry.published || null,
        };
      })
      .filter(Boolean);
  } catch (err) {
    console.warn(`[reddit] r/${subreddit} RSS error: ${err.message} – skipping`);
    return [];
  }
}

function redditCat(subreddit) {
  const travel = ['travel', 'solotravel', 'digitalnomad'];
  const tech = ['technology', 'programming'];
  if (travel.includes(subreddit)) return 'travel';
  if (tech.includes(subreddit)) return 'tech';
  return 'finance';
}

// ─── RSS ──────────────────────────────────────────────────────────────────────

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  allowBooleanAttributes: true,
  // Disable entity expansion to avoid "Entity expansion limit exceeded" errors
  // from feeds with many entity references (e.g. The Guardian).
  // decodeEntities() is used below to handle common HTML entities in titles.
  processEntities: false,
});

async function fetchRss({ url, cat, source }) {
  try {
    const res = await fetchWithTimeout(url, {
      headers: { Accept: 'application/rss+xml, application/xml, text/xml, */*' },
    });
    if (!res.ok) {
      console.warn(`[rss] ${source} returned HTTP ${res.status}`);
      return [];
    }
    const text = await res.text();
    const parsed = xmlParser.parse(text);

    // Support both RSS 2.0 and Atom
    const channel = parsed?.rss?.channel;
    const atomFeed = parsed?.feed;

    let rawItems = [];
    if (channel) {
      rawItems = Array.isArray(channel.item) ? channel.item : channel.item ? [channel.item] : [];
    } else if (atomFeed) {
      rawItems = Array.isArray(atomFeed.entry)
        ? atomFeed.entry
        : atomFeed.entry
        ? [atomFeed.entry]
        : [];
    }

    return rawItems
      .slice(0, RSS_LIMIT)
      .map((item) => {
        // title
        const rawTitle =
          (typeof item.title === 'string' ? item.title : item.title?.['#text']) ||
          'Article';
        const title = decodeEntities(rawTitle.trim());

        // url – RSS uses <link>, Atom uses <link href="">
        let rawUrl = item.link;
        if (rawUrl && typeof rawUrl === 'object') {
          rawUrl = rawUrl['@_href'] || rawUrl['#text'] || null;
        }
        const itemUrl = normaliseUrl(rawUrl);
        if (!itemUrl) return null;

        // thumbnail – <media:content> or <enclosure>
        const thumb =
          normaliseUrl(item['media:content']?.['@_url']) ||
          normaliseUrl(item['enclosure']?.['@_url']) ||
          null;

        // timestamp
        const rawTs = item.pubDate || item.updated || item.published || null;
        const ts = rawTs ? new Date(rawTs).toISOString() : null;

        return { title, url: itemUrl, cat, source, thumb, ts };
      })
      .filter(Boolean);
  } catch (err) {
    console.warn(`[rss] ${source} error: ${err.message}`);
    return [];
  }
}

// ─── YouTube ──────────────────────────────────────────────────────────────────

async function fetchYouTube(apiKey) {
  const items = [];
  for (const { id: videoCategoryId, cat } of YT_CATEGORIES) {
    const url =
      `https://www.googleapis.com/youtube/v3/videos` +
      `?part=snippet,statistics,status` +
      `&chart=mostPopular` +
      `&videoCategoryId=${encodeURIComponent(videoCategoryId)}` +
      `&maxResults=${YT_MAX_RESULTS}` +
      `&regionCode=US` +
      `&key=${encodeURIComponent(apiKey)}`;
    try {
      const res = await fetchWithTimeout(url);
      if (!res.ok) {
        const body = await res.text();
        console.warn(`[youtube] category ${videoCategoryId} HTTP ${res.status}: ${body.slice(0, 200)}`);
        continue;
      }
      const data = await res.json();
      for (const video of data.items || []) {
        if (video.status?.embeddable === false) continue;
        const id = video.id;
        const snippet = video.snippet || {};
        const thumbs = snippet.thumbnails || {};
        const thumb =
          thumbs.maxres?.url ||
          thumbs.standard?.url ||
          thumbs.high?.url ||
          thumbs.medium?.url ||
          thumbs.default?.url ||
          null;
        items.push({
          title: snippet.title || 'YouTube video',
          url: `https://www.youtube.com/watch?v=${id}`,
          cat,
          source: snippet.channelTitle || 'YouTube',
          thumb: normaliseUrl(thumb),
          ts: snippet.publishedAt || null,
        });
      }
    } catch (err) {
      console.warn(`[youtube] category ${videoCategoryId} error: ${err.message}`);
    }
  }
  return items;
}

// ─── Deduplication ───────────────────────────────────────────────────────────

function dedupe(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (!item.url || seen.has(item.url)) return false;
    seen.add(item.url);
    return true;
  });
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('[feed] Starting feed generation…');

  const results = await Promise.allSettled([
    // Reddit (all subreddits in parallel)
    ...REDDIT_SUBREDDITS.map(fetchReddit),
    // RSS feeds in parallel
    ...RSS_FEEDS.map(fetchRss),
  ]);

  let items = results.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));

  // YouTube (sequential because quota is shared)
  const ytKey = process.env.YOUTUBE_API_KEY;
  if (ytKey) {
    console.log('[feed] YOUTUBE_API_KEY found – fetching YouTube…');
    const ytItems = await fetchYouTube(ytKey);
    items = [...ytItems, ...items];
  } else {
    console.log('[feed] No YOUTUBE_API_KEY – skipping YouTube.');
  }

  // Filter: must be https, must have title
  items = items.filter((i) => i.url && isHttps(i.url) && i.title);

  // De-duplicate by URL
  items = dedupe(items);

  // Limit
  items = items.slice(0, MAX_ITEMS);

  const feed = {
    updated_at: new Date().toISOString(),
    items,
  };

  // Write to /feed.json (repo root)
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const outPath = resolve(__dirname, '..', 'feed.json');
  await writeFile(outPath, JSON.stringify(feed, null, 2) + '\n', 'utf8');

  console.log(`[feed] Done. Wrote ${items.length} items to ${outPath}`);
}

main().catch((err) => {
  console.error('[feed] Fatal error:', err);
  process.exit(1);
});
