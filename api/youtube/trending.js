export default async function handler(req, res) {
  const region = req.query.region || 'US';
  const key = process.env.YOUTUBE_API_KEY;

  if (!key) {
    return res.status(500).json({ error: 'Missing YOUTUBE_API_KEY' });
  }

  try {
    const url =
      `https://www.googleapis.com/youtube/v3/videos` +
      `?part=snippet,statistics,status` +
      `&chart=mostPopular` +
      `&maxResults=9` +
      `&regionCode=${encodeURIComponent(region)}` +
      `&key=${encodeURIComponent(key)}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data });
    }

    const items = (data.items || []).map(video => {
      const id = video.id;
      const snippet = video.snippet || {};
      const thumbs = snippet.thumbnails || {};
      const thumb =
        thumbs.maxres?.url ||
        thumbs.standard?.url ||
        thumbs.high?.url ||
        thumbs.medium?.url ||
        thumbs.default?.url ||
        '';

      return {
        id,
        title: snippet.title || 'YouTube video',
        channel: snippet.channelTitle || 'YouTube',
        publishedAt: snippet.publishedAt || null,
        views: Number(video.statistics?.viewCount || 0),
        thumbnail: thumb,
        watchUrl: `https://www.youtube.com/watch?v=${id}`,
        embedPlayerUrl: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`,
        embeddable: video.status?.embeddable !== false
      };
    });

    return res.status(200).json({ items });
  } catch (error) {
    return res.status(500).json({
      error: error.message || 'Server error'
    });
  }
}
