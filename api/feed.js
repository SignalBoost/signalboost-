export default async function handler(req, res) {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    const q = (req.query.q || "travel").toString().trim();

    if (!apiKey) {
      return res.status(500).json({
        error: "Missing YOUTUBE_API_KEY"
      });
    }

    const [youtubeItems, redditItems] = await Promise.all([
      fetchYouTube(q, apiKey),
      fetchRedditRSS(q)
    ]);

    const items = [...youtubeItems, ...redditItems].sort((a, b) => {
      const da = new Date(a.publishedAt || 0).getTime();
      const db = new Date(b.publishedAt || 0).getTime();
      return db - da;
    });

    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");

    return res.status(200).json({
      query: q,
      count: items.length,
      items
    });
  } catch (error) {
    console.error("API /api/feed error:", error);

    return res.status(500).json({
      error: "Feed failed",
      message: error.message
    });
  }
}

async function fetchYouTube(q, apiKey) {
  const ytUrl =
    `https://www.googleapis.com/youtube/v3/search` +
    `?key=${encodeURIComponent(apiKey)}` +
    `&part=snippet` +
    `&q=${encodeURIComponent(q)}` +
    `&maxResults=10` +
    `&type=video` +
    `&order=date`;

  const ytRes = await fetch(ytUrl);

  if (!ytRes.ok) {
    const text = await ytRes.text();
    throw new Error(`YouTube API error ${ytRes.status}: ${text}`);
  }

  const ytData = await ytRes.json();

  return (ytData.items || [])
    .filter(item => item?.id?.videoId && item?.snippet)
    .map(item => ({
      id: `youtube_${item.id.videoId}`,
      title: decodeHtml(item.snippet.title || "Untitled video"),
      description: decodeHtml(item.snippet.description || ""),
      author: item.snippet.channelTitle || "YouTube",
      platform: "youtube",
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      thumbnail:
        item.snippet?.thumbnails?.medium?.url ||
        item.snippet?.thumbnails?.high?.url ||
        item.snippet?.thumbnails?.default?.url ||
        "",
      publishedAt: item.snippet.publishedAt || new Date().toISOString()
    }));
}

async function fetchRedditRSS(q) {
  try {
    const redditUrl = `https://www.reddit.com/search.rss?q=${encodeURIComponent(q)}&sort=new`;

    const redditRes = await fetch(redditUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 SignalBoostApp/1.0",
        "Accept": "application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8"
      }
    });

    if (!redditRes.ok) {
      console.error("Reddit RSS error:", redditRes.status);
      return [];
    }

    const xml = await redditRes.text();
    const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)];

    return entries.slice(0, 10).map((match, index) => {
      const entry = match[1];

      const title = extractTag(entry, "title");
      const published = extractTag(entry, "updated") || extractTag(entry, "published");
      const author = extractAuthorName(entry);
      const url = extractLink(entry);
      const description = stripHtml(decodeHtml(extractTag(entry, "content")));

      return {
        id: `reddit_${index}_${safeId(title || url || index)}`,
        title: decodeHtml(title || "Untitled Reddit post"),
        description: truncate(description, 240),
        author: author || "Reddit",
        platform: "reddit",
        url: url || "https://www.reddit.com",
        thumbnail: "",
        publishedAt: published || new Date().toISOString()
      };
    });
  } catch (error) {
    console.error("Reddit RSS fetch failed:", error);
    return [];
  }
}

function extractTag(xml, tagName) {
  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i");
  const match = xml.match(regex);
  return match ? match[1].trim() : "";
}

function extractAuthorName(xml) {
  const authorBlock = xml.match(/<author>([\s\S]*?)<\/author>/i);
  if (!authorBlock) return "";
  const nameMatch = authorBlock[1].match(/<name>([\s\S]*?)<\/name>/i);
  return nameMatch ? decodeHtml(nameMatch[1].trim()) : "";
}

function extractLink(xml) {
  const linkMatch = xml.match(/<link[^>]+href="([^"]+)"/i);
  return linkMatch ? decodeHtml(linkMatch[1]) : "";
}

function stripHtml(value) {
  if (!value) return "";
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(value, maxLength) {
  if (!value) return "";
  if (value.length <= maxLength) return value;
  return value.slice(0, maxLength - 1).trim() + "…";
}

function safeId(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40);
}

function decodeHtml(value) {
  if (!value) return "";
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/")
    .replace(/&#(\d+);/g, (_, code) => {
      const n = Number(code);
      return Number.isNaN(n) ? _ : String.fromCharCode(n);
    });
}
