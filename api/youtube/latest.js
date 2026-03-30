/*
==============================================================
SIGNALBOOST AI - YOUTUBE LATEST API
--------------------------------------------------------------
PURPOSE
- Returns a rotating set of newer YouTube uploads
- Used to build the Fresh Picks section on the homepage

REQUIREMENTS
- Vercel environment variable:
  YOUTUBE_API_KEY

RETURNED FIELDS
- id
- title
- channel
- publishedAt
- thumbnail
- watchUrl
- embedPlayerUrl
- embeddable

NOTE
- If this route returns empty items, Fresh Picks will shrink or disappear
- Verify deployment and environment variables first
==============================================================
*/
export default async function handler(req, res) {
  const region = req.query.region || 'US';
  const key = process.env.YOUTUBE_API_KEY;

  if (!key) {
    return res.status(500).json({ error: 'Missing YOUTUBE_API_KEY' });
  }

  try {
    const topics = ['news', 'technology', 'finance', 'travel', 'sports'];
    const q = topics[Math.floor(Math.random() * topics.length)];

    const searchUrl =
      `https://www.googleapis.com/youtube/v3/search` +
      `?part=snippet` +
      `&type=video` +
      `&order=date` +
      `&maxResults=9` +
      `&q=${encodeURIComponent(q)}` +
      `&regionCode=${encodeURIComponent(region)}` +
      `&key=${encodeURIComponent(key)}`;

    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (!searchResponse.ok) {
      return res.status(searchResponse.status).json({ error: searchData });
    }

    const ids = (searchData.items || [])
      .map((item) => item.id?.videoId)
      .filter(Boolean);

    if (!ids.length) {
      return res.status(200).json({ items: [] });
    }

    const videosUrl =
      `https://www.googleapis.com/youtube/v3/videos` +
      `?part=snippet,status` +
      `&id=${encodeURIComponent(ids.join(','))}` +
      `&key=${encodeURIComponent(key)}`;

    const videosResponse = await fetch(videosUrl);
    const videosData = await videosResponse.json();

    if (!videosResponse.ok) {
      return res.status(videosResponse.status).json({ error: videosData });
    }

    const items = (videosData.items || []).map((video) => {
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
