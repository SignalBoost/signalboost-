const express = require("express");
const fetch = require("node-fetch");
const router = express.Router();

// -----------------------------
// 1. REDDIT (recent videos)
// -----------------------------
async function fetchRedditRecent() {
  const subs = [
    "travel",
    "solotravel",
    "onebag",
    "cheaptravel",
    "travelhacks",
    "EarthPorn",
    "CityPorn"
  ];

  const results = [];

  for (const sub of subs) {
    try {
      const url = `https://www.reddit.com/r/${sub}/new.json?limit=20`;
      const res = await fetch(url, {
        headers: { "User-Agent": "SignalBoost/1.0" }
      });
      const json = await res.json();

      json.data.children.forEach(post => {
        const p = post.data;
        if (!p.media || !p.media.reddit_video) return;

        results.push({
          platform: "reddit",
          title: p.title,
          thumbnail: p.thumbnail,
          embedHtml: `
            <blockquote class="reddit-card">
              <a href="https://reddit.com${p.permalink}"></a>
            </blockquote>
            <script async src="//embed.redditmedia.com/widgets/platform.js"></script>
          `,
          url: `https://reddit.com${p.permalink}`,
          timestamp: p.created_utc * 1000
        });
      });
    } catch (err) {
      console.error("Reddit error:", err);
    }
  }

  return results;
}

// -----------------------------
// 2. YOUTUBE (recent videos)
// -----------------------------
async function fetchYouTubeRecent() {
  const API_KEY = process.env.YT_KEY;
  if (!API_KEY) return [];

  const query = "travel OR cheap flights OR travel hacks OR travel deals";
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&order=date&q=${encodeURIComponent(
    query
  )}&key=${API_KEY}&maxResults=20`;

  try {
    const res = await fetch(url);
    const json = await res.json();

    return json.items.map(v => ({
      platform: "youtube",
      title: v.snippet.title,
      thumbnail: v.snippet.thumbnails.high.url,
      embedHtml: `
        <iframe width="100%" height="315"
          src="https://www.youtube.com/embed/${v.id.videoId}"
          frameborder="0" allowfullscreen>
        </iframe>
      `,
      url: `https://youtube.com/watch?v=${v.id.videoId}`,
      timestamp: new Date(v.snippet.publishedAt).getTime()
    }));
  } catch (err) {
    console.error("YouTube error:", err);
    return [];
  }
}

// -----------------------------
// 3. INSTAGRAM (recent reels)
// -----------------------------
async function fetchInstagramRecent() {
  const TOKEN = process.env.IG_TOKEN;
  const USER_ID = process.env.IG_USER_ID;

  if (!TOKEN || !USER_ID) return [];

  const url = `https://graph.facebook.com/v19.0/${USER_ID}/media?fields=id,caption,media_type,media_url,permalink,timestamp&access_token=${TOKEN}`;

  try {
    const res = await fetch(url);
    const json = await res.json();

    return json.data
      .filter(m => m.media_type === "VIDEO")
      .map(m => ({
        platform: "instagram",
        title: m.caption || "Instagram Reel",
        thumbnail: m.media_url,
        embedHtml: `
          <blockquote class="instagram-media" data-instgrm-permalink="${m.permalink}"></blockquote>
          <script async src="//www.instagram.com/embed.js"></script>
        `,
        url: m.permalink,
        timestamp: new Date(m.timestamp).getTime()
      }));
  } catch (err) {
    console.error("Instagram error:", err);
    return [];
  }
}

// -----------------------------
// 4. MAIN ROUTE
// -----------------------------
router.get("/", async (req, res) => {
  const page = Number(req.query.page || 0);
  const pageSize = 10;

  try {
    const [reddit, youtube, instagram] = await Promise.all([
      fetchRedditRecent(),
      fetchYouTubeRecent(),
      fetchInstagramRecent()
    ]);

    let feed = [...reddit, ...youtube, ...instagram];

    feed.sort((a, b) => b.timestamp - a.timestamp);

    const start = page * pageSize;
    const end = start + pageSize;

    res.status(200).json(feed.slice(start, end));
  } catch (err) {
    console.error("Hybrid feed error:", err);
    res.status(500).json({ error: "Hybrid feed failed" });
  }
});

module.exports = router;
