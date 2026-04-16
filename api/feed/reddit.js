export default async function handler(req, res) {
  const subreddit = String(req.query.subreddit || 'travel').replace(/[^a-zA-Z0-9_]/g, '');
  const limit = Math.min(Math.max(parseInt(req.query.limit || '12', 10), 1), 25);

  const urls = [
    `https://www.reddit.com/r/${subreddit}/hot.json?limit=${limit}&raw_json=1`,
    `https://www.reddit.com/r/${subreddit}/new.json?limit=${limit}&raw_json=1`,
    `https://www.reddit.com/r/${subreddit}/top.json?t=week&limit=${limit}&raw_json=1`
  ];

  try {
    const results = await Promise.all(
      urls.map(async (url) => {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'SignalBoost/1.0'
          }
        });

        if (!response.ok) {
          throw new Error(`Reddit returned ${response.status} for ${url}`);
        }

        return response.json();
      })
    );

    const posts = results.flatMap(data => data?.data?.children || []).map(x => x.data);

    const seen = new Set();

    const items = posts
      .map((post) => {
        const redditVideo =
          post?.secure_media?.reddit_video ||
          post?.media?.reddit_video ||
          post?.preview?.reddit_video_preview;

        const fallbackUrl = redditVideo?.fallback_url || '';

        if (!fallbackUrl || !fallbackUrl.includes('.mp4')) return null;

        const postUrl = post?.permalink
          ? `https://www.reddit.com${post.permalink}`
          : '';

        const thumb =
          typeof post?.thumbnail === 'string' && post.thumbnail.startsWith('http')
            ? post.thumbnail
            : (
                post?.preview?.images?.[0]?.source?.url
                  ? post.preview.images[0].source.url.replace(/&amp;/g, '&')
                  : null
              );

        return {
          id: post.id || fallbackUrl,
          platform: 'reddit',
          title: post.title || 'Reddit video',
          description: post.selftext ? post.selftext.slice(0, 180) : '',
          author: post.author ? `u/${post.author}` : 'Reddit',
          url: fallbackUrl,
          videoUrl: fallbackUrl,
          postUrl,
          publishedAt: new Date((post.created_utc || 0) * 1000).toISOString(),
          thumbnail: thumb
        };
      })
      .filter(Boolean)
      .filter((item) => {
        if (seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
      })
      .slice(0, limit);

    res.status(200).json({ items });
  } catch (error) {
    console.error('Reddit API error:', error);
    res.status(500).json({
      items: [],
      error: 'Failed to fetch Reddit videos'
    });
  }
}
