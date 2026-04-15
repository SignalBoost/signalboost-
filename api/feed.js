const express = require("express");
const router = express.Router();

/*
Required for YouTube:
- YOUTUBE_API_KEY

Optional for Reddit:
- REDDIT_CLIENT_ID
- REDDIT_CLIENT_SECRET
- REDDIT_USER_AGENT

Optional:
- YOUTUBE_QUERY=travel
- YOUTUBE_MAX_RESULTS=8
- REDDIT_SUBREDDITS=travel,solotravel,backpacking
- REDDIT_LIMIT=8
*/

const YOUTUBE_QUERY = process.env.YOUTUBE_QUERY || "travel";
const YOUTUBE_MAX_RESULTS = Number.parseInt(process.env.YOUTUBE_MAX_RESULTS || "8", 10);
const REDDIT_LIMIT = Number.parseInt(process.env.REDDIT_LIMIT || "8", 10);
const REDDIT_SUBREDDITS = (process.env.REDDIT_SUBREDDITS || "travel,solotravel,backpacking")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`HTTP ${response.status} for ${url} :: ${text.slice(0, 200)}`);
  }

  return response.json();
}

function normalizePlatform(value) {
  return String(value || "").trim().toLowerCase();
}

function sortByPublishedDesc(items) {
  return items.sort((a, b) => {
    const aTime = new Date(a.publishedAt || 0).getTime();
    const bTime = new Date(b.publishedAt || 0).getTime();
    return bTime - aTime;
  });
}

async function fetchYouTubeItems(query) {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
      console.warn("YOUTUBE_API_KEY missing; skipping YouTube.");
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

    if (!Array.isArray(data.items)) return [];

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
  } catch (err) {
    console.error("YouTube fetch failed:", err.message);
    return [];
  }
}

async function getRedditAccessToken() {
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;
  const userAgent = process.env.REDDIT_USER_AGENT || "signalboostapp/1.0";

  if (!clientId || !clientSecret) {
    return null;
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const body = new URLSearchParams({ grant_type: "client_credentials" });

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
    throw new Error(`Reddit token failed: HTTP ${response.status} :: ${text.slice(0, 200)}`);
  }

  const data = await response.json();
  return data.access_token || null;
}

async function fetchRedditItems(query) {
  try {
    const token = await getRedditAccessToken();
    if (!token) {
      console.warn("Reddit credentials missing; skipping Reddit.");
      return [];
    }

    const userAgent = process.env.REDDIT_USER_AGENT || "signalboostapp/1.0";
    const subredditPath = REDDIT_SUBREDDITS.join("+");

    const url = query
      ? `https://oauth.reddit.com/search?q=${encodeURIComponent(query)}&sort=new&limit=${REDDIT_LIMIT}&restrict_sr=false`
      : `https://oauth.reddit.com/r/${subredditPath}/new?limit=${REDDIT_LIMIT}`;

    const data = await fetchJson(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "User-Agent": userAgent
      }
    });

    const children = data?.data?.children;
    if (!Array.isArray(children)) return [];

    return children
      .map((child) => {
        const post = child?.data;
        if (!post?.id) return null;

        const thumbnail =
          typeof post.thumbnail === "string" && /^https?:\/\//.test(post.thumbnail)
            ? post.thumbnail
            : "";

        return {
          id: `reddit_${post.id}`,
          title: post.title || "Untitled",
          description: post.selftext || "",
          platform: "reddit",
          url: post.permalink ? `https://www.reddit.com${post.permalink}` : "https://www.reddit.com/",
          thumbnail,
          publishedAt: post.created_utc ? new Date(post.created_utc * 1000).toISOString() : "",
          author: post.subreddit_name_prefixed || "Reddit"
        };
      })
      .filter(Boolean);
  } catch (err) {
    console.error("Reddit fetch failed:", err.message);
    return [];
  }
}

async function fetchFacebookItems() {
  return [];
}

async function fetchInstagramItems() {
  return [];
}

function mergeFeedItems(groups) {
  const seen = new Set();
  const merged = [];

  for (const items of groups) {
    for (const item of items) {
      const key = `${normalizePlatform(item.platform)}::${item.url}`;
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(item);
    }
  }

  return sortByPublishedDesc(merged);
}

router.get("/feed", async (req, res) => {
  const q = String(req.query.q || YOUTUBE_QUERY).trim();
  const platform = String(req.query.platform || "all").trim().toLowerCase();

  try {
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

    return res.json({
      success: true,
      total: items.length,
      items
    });
  } catch (err) {
    console.error("GET /api/feed crashed:", err);

    return res.json({
      success: true,
      total: 0,
      items: [],
      error: err.message
    });
  }
});

module.exports = router;
