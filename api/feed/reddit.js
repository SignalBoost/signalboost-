export default async function handler(req, res) {
  const subreddit = String(req.query.subreddit || 'travel').replace(/[^a-zA-Z0-9_]/g, '');
  const limit = Math.min(Math.max(parseInt(req.query.limit || '12', 10), 1), 25);

  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;
  const redditUsername = process.env.REDDIT_USERNAME || 'your_reddit_username';

  if (!clientId || !clientSecret) {
    return res.status(500).json({
      items: [],
      error: 'Missing Reddit credentials',
      details: 'Set REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET in your deployment environment.'
    });
  }

  try {
    // 1) Get OAuth token
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const tokenResponse = await fetch('https://www.reddit.com/api/v1/access_token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': `web:signalboostapp:v1.0.0 (by /u/${redditUsername})`
      },
      body: 'grant_type=client_credentials'
    });

    if (!tokenResponse.ok) {
      const body = await tokenResponse.text();
      return res.status(tokenResponse.status).json({
        items: [],
        error: `Token request failed with ${tokenResponse.status}`,
        details: body.slice(0, 500)
      });
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      return res.status(500).json({
        items: [],
        error: 'No access token returned by Reddit',
        details: JSON.stringify(tokenData).slice(0, 500)
      });
    }

    // 2) Fetch posts through oauth.reddit.com
    const apiUrl = `https://oauth.reddit.com/r/${subreddit}/hot?limit=${limit}`;

    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': `web:signalboostapp:v1.0.0 (by /u/${redditUsername})`
      }
    });

    if (!response.ok) {
      const body = await response.text();
      return res.status(response.status).json({
        items: [],
        error: `Reddit API returned ${response.status}`,
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
