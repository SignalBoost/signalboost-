export default async function handler(req, res) {
  const subreddits = (req.query.subreddits || req.query.subreddit || 'travel')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const limitPerSubreddit = Math.min(Number(req.query.limit || 20), 25);

  try {
    const allItems = [];

    for (const subreddit of subreddits) {
      const redditUrl = `https://www.reddit.com/r/${encodeURIComponent(subreddit)}/hot.json?limit=${limitPerSubreddit}`;

      try {
        const response = await fetch(redditUrl, {
          headers: {
            'User-Agent': 'SignalBoost/1.0'
          }
        });

        if (!response.ok) {
          console.error(`Reddit HTTP error for r/${subreddit}:`, response.status);
          continue;
        }

        const data = await response.json();

        const items = (data?.data?.children || [])
          .map((child) => child?.data)
          .filter(Boolean)
          .map((post) => {
            const videoUrl =
              post.secure_media?.reddit_video?.fallback_url ||
              post.media?.reddit_video?.fallback_url ||
              post.preview?.reddit_video_preview?.fallback_url ||
              '';

            const thumbnail =
              (post.thumbnail && /^https?:\/\//i.test(post.thumbnail) && post.thumbnail) ||
              post.preview?.images?.[0]?.source?.url?.replace(/&amp;/g, '&') ||
              '';

            return {
              platform: 'reddit',
              title: post.title || '',
              url: videoUrl,
              publishedAt: post.created_utc
                ? new Date(post.created_utc * 1000).toISOString()
                : new Date().toISOString(),
              thumbnail,
              author: post.author || 'Reddit'
            };
          })
          .filter((item) => item.url && item.url.includes('.mp4'));

        allItems.push(...items);
      } catch (subError) {
        console.error(`Reddit fetch error for r/${subreddit}:`, subError);
      }
    }

    const seen = new Set();
    const deduped = allItems.filter((item) => {
      if (seen.has(item.url)) return false;
      seen.add(item.url);
      return true;
    });

    return res.status(200).json({ items: deduped });
  } catch (error) {
    console.error('Reddit route failed:', error);
    return res.status(200).json({ items: [] });
  }
}
