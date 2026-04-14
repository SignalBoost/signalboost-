export default async function handler(req, res) {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    const q = (req.query.q || "travel").toString();

    if (!apiKey) {
      return res.status(500).json({
        error: "Missing YOUTUBE_API_KEY"
      });
    }

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
      throw new Error(`YouTube API error: ${text}`);
    }

    const ytData = await ytRes.json();

    const youtubeItems = (ytData.items || []).map(item => ({
      id: `youtube_${item.id.videoId}`,
      title: item.snippet.title,
      description: item.snippet.description,
      author: item.snippet.channelTitle,
      platform: "youtube",
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      thumbnail: item.snippet.thumbnails.medium.url,
      publishedAt: item.snippet.publishedAt
    }));

    return res.status(200).json({
      items: youtubeItems
    });

  } catch (error) {
    console.error("Feed error:", error);

    return res.status(500).json({
      error: "Feed failed",
      message: error.message
    });
  }
}
