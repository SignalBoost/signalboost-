export default async function handler(req, res) {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    const q = (req.query.q || "travel").toString().trim();

    if (!apiKey) {
      return res.status(500).json({
        error: "Missing YOUTUBE_API_KEY"
      });
    }

    const [youtubeItems, redditItems, instagramItems, facebookItems] =
      await Promise.all([
        fetchYouTube(q, apiKey),
        fetchRedditRSS(q),
        fetchInstagramMock(q),
        fetchFacebookMock(q)
      ]);

    const items = [
      ...youtubeItems,
      ...redditItems,
      ...instagramItems,
      ...facebookItems
    ].sort((a, b) => {
      return new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0);
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
    `&maxResults=8` +
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

    return entries.slice(0, 8).map((match, index) => {
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

async function fetchInstagramMock(q) {
  return [
    {
      id: `instagram_${safeId(q)}_1`,
      title: `Instagram travel inspiration for ${q}`,
      description: `Popular Instagram-style content related to "${q}". Replace this with the real Meta Instagram API later.`,
      author: "insta_travel_daily",
      platform: "instagram",
      url: "https://www.instagram.com/",
      thumbnail: "",
      publishedAt: new Date(Date.now() - 1000 * 60 * 20).toISOString()
    },
    {
      id: `instagram_${safeId(q)}_2`,
      title: `Best photo spots for ${q}`,
      description: `Curated visual content for "${q}" from an Instagram placeholder source.`,
      author: "explore_with_signalboost",
      platform: "instagram",
      url: "https://www.instagram.com/",
      thumbnail: "",
      publishedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString()
    }
  ];
}

async function fetchFacebookMock(q) {
  return [
    {
      id: `facebook_${safeId(q)}_1`,
      title: `Facebook community post about ${q}`,
      description: `Sample Facebook page content for "${q}". Replace this with the Meta Pages API later.`,
      author: "SignalBoost Community",
      platform: "facebook",
      url: "https://www.facebook.com/",
      thumbnail: "",
      publishedAt: new Date(Date.now() - 1000 * 60 * 35).toISOString()
    },
    {
      id: `facebook_${safeId(q)}_2`,
      title: `Top discussions and updates for ${q}`,
      description: `Mock Facebook feed item to keep your hybrid structure ready for real Page data.`,
      author: "SignalBoost Updates",
      platform: "facebook",
      url: "https://www.facebook.com/",
      thumbnail: "",
      publishedAt: new Date(Date.now() - 1000 * 60 * 140).toISOString()
    }
  ];
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
