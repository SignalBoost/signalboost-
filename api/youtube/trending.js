export default async function handler(req, res) {
  const region = req.query.region || 'US';
  const key = process.env.YOUTUBE_API_KEY;

  if (!key) {
    return res.status(500).json({ error: 'Missing YOUTUBE_API_KEY' });
  }

  try {
    const url =
      `https://www.googleapis.com/youtube/v3/videos` +
      `?part=snippet,statistics` +
      `&chart=mostPopular` +
      `&maxResults=6` +
      `&regionCode=${encodeURIComponent(region)}` +
      `&key=${encodeURIComponent(key)}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data });
    }

    const items = (data.items || []).map(video => ({
      id: video.id,
      title: video.snippet.title,
      channel: video.snippet.channelTitle,
      publishedAt: video.snippet.publishedAt,
      views: video.statistics.viewCount,
      embed: `https://www.youtube.com/embed/${video.id}`
    }));

    return res.status(200).json({ items });

  } catch (error) {
    return res.status(500).json({
      error: error.message || 'Server error'
    });
  }
}
