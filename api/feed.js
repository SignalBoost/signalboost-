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
      fetchReddit(q)
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
      title: item.snippet.title || "Untitled video",
      description: item.snippet.description || "",
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

async function fetchReddit(q) {
  try {
    const redditUrl =
      `https://www.reddit.com/search.json` +
      `?q=${encodeURIComponent(q)}` +
      `&limit=10` +
      `&sort=new`;

    const redditRes = await fetch(redditUrl, {
      headers: {
        "User-Agent": "SignalBoostApp/1.0 (by u/SignalBoostApp)",
        "Accept": "application/json"
      }
    });

    if (!redditRes.ok) {
      console.error("Reddit API error:", redditRes.status);
      return [];
    }

    const redditData = await redditRes.json();

    return ((redditData.data && redditData.data.children) || [])
      .map(child => child.data)
      .filter(post => post && post.id)
      .map(post => ({
        id: `reddit_${post.id}`,
        title: post.title || "Untitled post",
        description: post.selftext || "",
        author: post.author ? `u/${post.author}` : "Reddit",
        platform: "reddit",
        url: post.permalink
          ? `https://www.reddit.com${post.permalink}`
          : "https://www.reddit.com",
        thumbnail:
          typeof post.thumbnail === "string" && post.thumbnail.startsWith("http")
            ? post.thumbnail
            : "",
        publishedAt: post.created_utc
          ? new Date(post.created_utc * 1000).toISOString()
          : new Date().toISOString()
      }));
  } catch (error) {
    console.error("Reddit fetch failed:", error);
    return [];
  }
}
