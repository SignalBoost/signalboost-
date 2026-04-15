const express = require("express");

const router = express.Router();

/**
 * Required env vars:
 * - YOUTUBE_API_KEY
 * - REDDIT_CLIENT_ID
 * - REDDIT_CLIENT_SECRET
 * - REDDIT_USER_AGENT
 *
 * Optional env vars:
 * - YOUTUBE_QUERY=travel
 * - YOUTUBE_MAX_RESULTS=8
 * - REDDIT_SUBREDDITS=travel,solotravel,backpacking
 * - REDDIT_LIMIT=8
 * - FEED_CACHE_TTL_MS=300000
 */

const CACHE_TTL_MS = Number.parseInt(process.env.FEED_CACHE_TTL_MS || "300000", 10);
const YOUTUBE_QUERY = process.env.YOUTUBE_QUERY || "travel";
const YOUTUBE_MAX_RESULTS = Number.parseInt(process.env.YOUTUBE_MAX_RESULTS || "8", 10);
const REDDIT_LIMIT = Number.parseInt(process.env.REDDIT_LIMIT || "8", 10);
const REDDIT_SUBREDDITS = (process.env.REDDIT_SUBREDDITS || "travel,solotravel,backpacking")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

let cachedFeed = null;
let cachedAt = 0;

/**
 * Small helper to fetch JSON safely.
 */
async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`HTTP ${response.status} for ${url} :: ${text.slice(0, 300)}`);
  }

  return response.json();
}

/**
 * Normalize platform names.
 */
function normalizePlatform(value) {
  return String(value || "").trim().toLowerCase();
}

/**
 * Safe date sort helper.
 */
function sortByPublishedDesc(items) {
  return items.sort((a, b) => {
    const aTime = new Date(a.publishedAt || 0).getTime();
    const bTime = new Date(b.publishedAt || 0).getTime();
    return bTime - aTime;
  });
}

/**
 * YouTube Data API: search.list limited to videos.
 * Docs: https://developers.google.com/youtube/v3/docs/search/list
 */
async function fetchYouTubeItems(query) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    console.warn("YOUTUBE_API_KEY missing; skipping YouTube feed.");
    return [];
  }

  const params = new URLSearchParams({
    part: "snippet",
    q: query,
    type: "video",
    order: "date",
    maxResults: String(YOUTUBE_MAX_RESULTS),
    key: apiKey
  });

  const url = `https://www.googleapis.com/youtube/v3/search?${params.toString()}`;
  const data = await fetchJson(url);

  if (!Array.isArray(data.items)) {
    return [];
  }

  return data.items
    .map((item) => {
      const videoId = item?.id?.videoId;
      const snippet = item?.snippet || {};

      if (!videoId) return null;

      return {
        id: `youtube_${videoId}`,
        title: snippet.title || "Untitled",
        description: snippet.description || "",
        platform: "youtube",
        url: `https://www.youtube.com/watch?v=${videoId}`,
        thumbnail:
          snippet?.thumbnails?.high?.url ||
          snippet?.thumbnails?.medium?.url ||
          snippet?.thumbnails?.default?.url ||
          "",
        publishedAt: snippet.publishedAt || "",
        author: snippet.channelTitle || "YouTube"
      };
    })
    .filter(Boolean);
}

/**
 * Reddit OAuth app-only token.
 * Docs: https://www.reddit.com/dev/api/oauth/
 */
async function getRedditAccessToken() {
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;
  const userAgent = process.env.REDDIT_USER_AGENT || "signalboostapp/1.0";

  if (!clientId || !clientSecret) {
    console.warn("Reddit credentials missing; skipping Reddit feed.");
    return null;
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const body = new URLSearchParams({
    grant_type: "client_credentials"
  });

  const response = await fetch("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": userAgent
    },
    body
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Reddit token failed: HTTP ${response.status} :: ${text.slice(0, 300)}`);
  }

  const data = await response.json();
  return data.access_token || null;
}

/**
 * Fetch latest posts from chosen subreddits.
 */
async function fetchRedditItems(query) {
  const token = await getRedditAccessToken();
  if (!token) return [];

  const userAgent = process.env.REDDIT_USER_AGENT || "signalboostapp/1.0";
  const subredditPath = REDDIT_SUBREDDITS.join("+");

  const params = new URLSearchParams({
    limit: String(REDDIT_LIMIT),
    sort: "new"
  });

  const url = query
    ? `https://oauth.reddit.com/search?q=${encodeURIComponent(query)}&sort=new&limit=${REDDIT_LIMIT}&restrict_sr=false`
    : `https://oauth.reddit.com/r/${subredditPath}/new?${params.toString()}`;

  const data = await fetchJson(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "User-Agent": userAgent
    }
  });

  const children = data?.data?.children;
  if (!Array.isArray(children)) {
    return [];
  }

  return children
    .map((child) => {
      const post = child?.data;
      if (!post?.id) return null;

      const permalink = post.permalink
        ? `https://www.reddit.com${post.permalink}`
        : "https://www.reddit.com/";

      const thumbnail =
        typeof post.thumbnail === "string" &&
        /^https?:\/\//.test(post.thumbnail)
          ? post.thumbnail
          : "";

      return {
        id: `reddit_${post.id}`,
        title: post.title || "Untitled",
        description: post.selftext || "",
        platform: "reddit",
        url: permalink,
        thumbnail,
        publishedAt: post.created_utc
          ? new Date(post.created_utc * 1000).toISOString()
          : "",
        author: post.subreddit_name_prefixed || "Reddit"
      };
    })
    .filter(Boolean);
}

/**
 * Placeholder for future Facebook Page feed support.
 * Meta Graph API is best suited to Pages/accounts you manage or have permission for.
 */
async function fetchFacebookItems() {
  return [];
}

/**
 * Placeholder for future Instagram Business/Creator media support.
 * Meta Instagram Platform is account-based, not broad public discovery.
 */
async function fetchInstagramItems() {
  return [];
}

/**
 * Merge, lightly dedupe, sort.
 */
function mergeFeedItems(groups) {
  const seen = new Set();
  const merged = [];

  for (const items of groups) {
    for (const item of items) {
      const dedupeKey = `${normalizePlatform(item.platform)}::${item.url}`;
      if (seen.has(dedupeKey)) continue;
      seen.add(dedupeKey);
      merged.push(item);
    }
  }

  return sortByPublishedDesc(merged);
}

router.get("/feed", async (req, res) => {
  try {
    const now = Date.now();
    const q = String(req.query.q || YOUTUBE_QUERY).trim();
    const platform = String(req.query.platform || "all").trim().toLowerCase();
    const useCache = !req.query.refresh;

    if (useCache && cachedFeed && now - cachedAt < CACHE_TTL_MS) {
      const cachedItems =
        platform === "all"
          ? cachedFeed
          : cachedFeed.filter((item) => normalizePlatform(item.platform) === platform);

      return res.json({
        success: true,
        cached: true,
        total: cachedItems.length,
        items: cachedItems
      });
    }

    const [youtubeItems, redditItems, facebookItems, instagramItems] = await Promise.all([
      platform === "all" || platform === "youtube" ? fetchYouTubeItems(q) : Promise.resolve([]),
      platform === "all" || platform === "reddit" ? fetchRedditItems(q) : Promise.resolve([]),
      platform === "all" || platform === "facebook" ? fetchFacebookItems() : Promise.resolve([]),
      platform === "all" || platform === "instagram" ? fetchInstagramItems() : Promise.resolve([])
    ]);

    const items = mergeFeedItems([
      youtubeItems,
      redditItems,
      facebookItems,
      instagramItems
    ]);

    cachedFeed = items;
    cachedAt = now;

    return res.json({
      success: true,
      cached: false,
      total: items.length,
      items
    });
  } catch (error) {
    console.error("GET /api/feed failed:", error);

    return res.status(500).json({
      success: false,
      error: "Failed to load feed",
      details: error.message
    });
  }
});

module.exports = router;
