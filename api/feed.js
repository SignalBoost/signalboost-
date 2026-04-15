// ─────────────────────────────────────────────────────────────
// REDDIT HOT FEED (Place this at the TOP of api/feed.js)
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
