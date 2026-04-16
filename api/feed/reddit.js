export default async function handler(req, res) {
  const subreddit = String(req.query.subreddit || 'travel').replace(/[^a-zA-Z0-9_]/g, '');
  const limit = Math.min(Math.max(parseInt(req.query.limit || '12', 10), 1), 25);

  const redditUrl = `https://www.reddit.com/r/${subreddit}/hot.json?limit=${limit}&raw_json=1`;

  try {
    const response = await fetch(redditUrl, {
      headers: {
        'User-Agent': 'SignalBoost/1.0'
      }
    });

    if (!response.ok) {
      const body = await response.text();
      return res.status(response.status).json({
        items: [],
        error: `Reddit returned ${response.status}`,
        details: body.slice(0, 500)
      });
    }

    const data = await response.json();

    const posts = (data?.data?.children || []).map(x => x.data);

    const items = posts
      .map((post) => {
        const redditVideo =
          post?.secure_media?.reddit_video ||
          post?.media?.reddit_video ||
          post?.preview?.reddit_video_preview;

        const fallbackUrl = redditVideo?.fallback_url || '';
        if (!fallbackUrl || !fallbackUrl.includes('.mp4')) return null;

        const thumbnail =
          typeof post?.thumbnail === 'string' && post.thumbnail.startsWith('http')
            ? post.thumbnail
            : (
                post?.preview?.images?.[0]?.source?.url
                  ? post.preview.images[0].source.url.replace(/&amp;/g, '&')
                  : null
              );

        return {
          platform: 'reddit',
          title: post.title || 'Reddit video',
          description: post.selftext ? post.selftext.slice(0, 180) : '',
          author: post.author ? `u/${post.author}` : 'Reddit',
          url: fallbackUrl,
          videoUrl: fallbackUrl,
          postUrl: post.permalink ? `https://www.reddit.com${post.permalink}` : '',
          publishedAt: new Date((post.created_utc || 0) * 1000).toISOString(),
          thumbnail
        };
      })
      .filter(Boolean)
      .slice(0, limit);

    return res.status(200).json({ items });
  } catch (error) {
    return res.status(500).json({
      items: [],
      error: 'Failed to fetch Reddit videos',
      details: error?.message || String(error)
    });
  }
}
