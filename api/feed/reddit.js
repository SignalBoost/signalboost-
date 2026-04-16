export default async function handler(req, res) {
  const subreddit = req.query.subreddit || 'travel';
  const limit = Math.min(Number(req.query.limit || 20), 50);
  const redditUrl = `https://www.reddit.com/r/${encodeURIComponent(subreddit)}/hot.json?limit=${limit}`;

  try {
    const response = await fetch(redditUrl, {
      headers: {
        'User-Agent': 'SignalBoost/1.0'
      }
    });

    if (!response.ok) {
      return res.status(200).json({ items: [] });
    }

    const data = await response.json();

    const items = (data?.data?.children || [])
      .map((child) => child?.data)
      .filter(Boolean)
      .filter((post) => post.secure_media?.reddit_video?.fallback_url)
      .map((post) => ({
        platform: 'reddit',
        title: post.title || '',
        url: post.secure_media.reddit_video.fallback_url,
        date: (post.created_utc || 0) * 1000,
        publishedAt: post.created_utc
          ? new Date(post.created_utc * 1000).toISOString()
          : new Date().toISOString(),
        thumbnail:
          post.thumbnail && /^https?:\/\//i.test(post.thumbnail)
            ? post.thumbnail
            : '',
        author: post.author || 'Reddit'
      }));

    return res.status(200).json({ items });
  } catch (error) {
    console.error('Reddit fetch error:', error);
    return res.status(200).json({ items: [] });
  }
}
