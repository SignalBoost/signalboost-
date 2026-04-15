// ─────────────────────────────────────────────────────────────
// REDDIT HOT FEED (Top of file)
// ─────────────────────────────────────────────────────────────

const REDDIT_SUBS = [
  "travel",
  "solotravel",
  "digitalnomad",
  "technology",
  "programming",
  "personalfinance",
  "investing"
];

async function fetchRedditHot(sub) {
  try {
    const url = `https://www.reddit.com/r/${sub}/hot.json?limit=10`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "SignalBoost/1.0",
        "Accept": "application/json"
      }
    });

    if (!res.ok) {
      console.warn(`Reddit ${sub} returned HTTP ${res.status}`);
      return [];
    }

    const data = await res.json();
    const posts = data?.data?.children || [];

    return posts
      .map(p => {
        const d = p.data;
        if (!d) return null;

        const link =
          d.url_overridden_by_dest ||
          `https://www.reddit.com${d.permalink}`;

        return {
          id: `reddit-${d.id}`,
          title: d.title,
          text: d.selftext || "",
          source: `r/${sub}`,
          link,
          publishedAt: new Date(d.created_utc * 1000).toISOString(),
          thumb:
            d.thumbnail && d.thumbnail.startsWith("http")
              ? d.thumbnail
              : null
        };
      })
      .filter(Boolean);

  } catch (err) {
    console.error("Reddit error:", err.message);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────
// YOUTUBE TRENDING
// ─────────────────────────────────────────────────────────────

const axios = require("axios");

// ─────────────────────────────────────────────────────────────
// MAIN FEED HANDLER (Reddit + YouTube)
// ─────────────────────────────────────────────────────────────

module.exports = async (req, res) => {
  try {
    const apiKey = process.env.YT_API_KEY || process.env.YOUTUBE_API_KEY;

    // 1. Fetch Reddit Hot (parallel)
    const redditResults = await Promise.all(
      REDDIT_SUBS.map(fetchRedditHot)
    );
    const redditItems = redditResults.flat();

    // 2. Fetch YouTube Trending
    let ytItems = [];
    if (apiKey) {
      const yt = await axios.get(
        "https://www.googleapis.com/youtube/v3/videos",
        {
          params: {
            part: "snippet,statistics",
            chart: "mostPopular",
            maxResults: 10,
            regionCode: "US",
            key: apiKey
          }
        }
      );

      ytItems = yt.data.items.map(v => ({
        id: v.id,
        title: v.snippet.title,
        text: v.snippet.description,
        source: "YouTube",
        link: `https://www.youtube.com/watch?v=${v.id}`,
        publishedAt: v.snippet.publishedAt,
        thumb:
          v.snippet.thumbnails?.maxres?.url ||
          v.snippet.thumbnails?.high?.url ||
          v.snippet.thumbnails?.medium?.url ||
          v.snippet.thumbnails?.default?.url ||
          null
      }));
    } else {
      console.warn("No YouTube API key found — skipping YouTube trending");
    }

    // 3. Merge + sort newest first
    const items = [...ytItems, ...redditItems].sort(
      (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)
    );

    res.json({
      success: true,
      items
    });

  } catch (err) {
    console.error("Feed error:", err.message);

    res.status(500).json({
      success: false,
      items: [],
      error: "Failed to load feed"
    });
  }
};
