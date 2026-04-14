export default async function handler(req, res) {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    const q = (req.query.q || "travel").toString().trim();

    if (!apiKey) {
      return res.status(500).json({
        error: "Missing YOUTUBE_API_KEY"
      });
    }

    const [youtubeItems, redditItems, instagramItems] = await Promise.all([
      fetchYouTube(q, apiKey),
      fetchRedditRSS(q),
      fetchInstagramMock(q) // 👈 placeholder for now
    ]);

    const items = [
      ...youtubeItems,
      ...redditItems,
      ...instagramItems
    ].sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

    return res.status(200).json({
      query: q,
      count: items.length,
      items
    });

  } catch (error) {
    console.error("Feed error:", error);

    return res.status(500).json({
      error: "Feed failed",
      message: error.message
    });
  }
}

async function fetchYouTube(q, apiKey) {
  const url =
    `https://www.googleapis.com/youtube/v3/search` +
    `?key=${apiKey}` +
    `&part=snippet` +
    `&q=${encodeURIComponent(q)}` +
    `&maxResults=8` +
    `&type=video` +
    `&order=date`;

  const res = await fetch(url);
  const data = await res.json();

  return (data.items || []).map(item => ({
    id: `youtube_${item.id.videoId}`,
    title: item.snippet.title,
    description: item.snippet.description,
    author: item.snippet.channelTitle,
    platform: "youtube",
    url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    thumbnail: item.snippet.thumbnails.medium.url,
    publishedAt: item.snippet.publishedAt
  }));
}

async function fetchRedditRSS(q) {
  try {
    const url = `https://www.reddit.com/search.rss?q=${encodeURIComponent(q)}`;

    const res = await fetch(url);
    const xml = await res.text();

    const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)];

    return entries.slice(0, 8).map((match, i) => {
      const entry = match[1];

      const title = extract(entry, "title");
      const link = extractLink(entry);
      const date = extract(entry, "updated");

      return {
        id: `reddit_${i}`,
        title: decode(title),
        description: "",
        author: "Reddit",
        platform: "reddit",
        url: link,
        thumbnail: "",
        publishedAt: date || new Date().toISOString()
      };
    });

  } catch {
    return [];
  }
}

/* ========================= */
/* INSTAGRAM (MOCK FOR NOW) */
/* ========================= */

async function fetchInstagramMock(q) {
  return [
    {
      id: "instagram_1",
      title: "🌴 Travel vibes from Instagram",
      description: `Popular travel content about "${q}"`,
      author: "insta_travel",
      platform: "instagram",
      url: "https://www.instagram.com/",
      thumbnail: "",
      publishedAt: new Date().toISOString()
    },
    {
      id: "instagram_2",
      title: "📸 Explore destinations",
      description: "Top trending places shared on Instagram",
      author: "explore_world",
      platform: "instagram",
      url: "https://www.instagram.com/",
      thumbnail: "",
      publishedAt: new Date().toISOString()
    }
  ];
}

/* ========================= */
/* HELPERS */
/* ========================= */

function extract(xml, tag) {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
  return m ? m[1] : "";
}

function extractLink(xml) {
  const m = xml.match(/<link[^>]+href="([^"]+)"/);
  return m ? m[1] : "";
}

function decode(str) {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"');
}
