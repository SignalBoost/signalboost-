export default async function handler(req, res) {
  const channelId = req.query.channel_id || req.query.channelId || '';
  const playlistId = req.query.playlist_id || req.query.playlistId || '';
  const limit = Math.min(Number(req.query.limit || 12), 24);

  const feedUrl = playlistId
    ? `https://www.youtube.com/feeds/videos.xml?playlist_id=${encodeURIComponent(playlistId)}`
    : channelId
      ? `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`
      : '';

  if (!feedUrl) {
    return res.status(200).json({ items: [] });
  }

  try {
    const response = await fetch(feedUrl, {
      headers: {
        'User-Agent': 'SignalBoost/1.0',
        'Accept': 'application/atom+xml,application/xml,text/xml;q=0.9,*/*;q=0.8'
      }
    });

    if (!response.ok) {
      console.error('YouTube feed HTTP error:', response.status);
      return res.status(200).json({ items: [] });
    }

    const xml = await response.text();

    const entries = xml.split('<entry>').slice(1);

    const items = entries.slice(0, limit).map((entry) => {
      const getTag = (tag) => {
        const match = entry.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, 'i'));
        return match ? decodeXml(match[1].trim()) : '';
      };

      const getAttr = (tag, attr) => {
        const match = entry.match(new RegExp(`<${tag}[^>]*${attr}="([^"]+)"`, 'i'));
        return match ? decodeXml(match[1].trim()) : '';
      };

      const videoId =
        getTag('yt:videoId') ||
        getTag('videoId');

      const title = getTag('title');
      const author = getTag('name') || 'YouTube';
      const publishedAt = getTag('published') || new Date().toISOString();

      const watchUrl = videoId
        ? `https://www.youtube.com/watch?v=${videoId}`
        : getAttr('link', 'href');

      const embedUrl = videoId
        ? `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1`
        : '';

      const thumbnail =
        getAttr('media:thumbnail', 'url') ||
        (videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '');

      return {
        platform: 'youtube',
        title,
        description: 'YouTube latest video',
        author,
        publishedAt,
        url: watchUrl,
        postUrl: watchUrl,
        embedUrl,
        thumbnail
      };
    }).filter((item) => item.url && item.embedUrl);

    return res.status(200).json({ items });
  } catch (error) {
    console.error('YouTube feed error:', error);
    return res.status(200).json({ items: [] });
  }
}

function decodeXml(value) {
  return String(value || '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}
