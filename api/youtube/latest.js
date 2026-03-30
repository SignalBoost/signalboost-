export default async function handler(req, res) {
  const region = req.query.region || 'US';
  const key = process.env.YOUTUBE_API_KEY;

  if (!key) {
    return res.status(500).json({ error: 'Missing YOUTUBE_API_KEY' });
  }

  try {
    const url =
      `https://www.googleapis.com/youtube/v3/search` +
      `?part=snippet` +
      `&type=video` +
      `&order=date` +
      `&maxResults=6` +
      `&regionCode=${encodeURIComponent(region)}` +
      `&key=${encodeURIComponent(key)}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data });
    }

    const items = (data.items || []).map(video => ({
      id: video.id?.videoId,
      title: video.snippet?.title || 'YouTube video',
      channel: video.snippet?.channelTitle || 'YouTube',
      publishedAt: video.snippet?.publishedAt || null,
      embed: `https://www.youtube.com/embed/${video.id?.videoId}`
    })).filter(v => v.id);

    return res.status(200).json({ items });
  } catch (error) {
    return res.status(500).json({
      error: error.message || 'Server error'
    });
  }
}
