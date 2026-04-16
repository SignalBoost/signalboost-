const express = require('express');

const app = express();
const PORT = 3000;

// Serve your index.html and other static files from the current folder
app.use(express.static(__dirname));

// Reddit feed endpoint
app.get('/api/feed/reddit', async (req, res) => {
  try {
    const subreddit = req.query.subreddit || 'travel';
    const limit = req.query.limit || '20';

    const redditUrl = `https://www.reddit.com/r/${subreddit}/hot.json?limit=${limit}`;

    const response = await fetch(redditUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Reddit returned status ${response.status}`);
    }

    const data = await response.json();

    const videos = (data.data?.children || [])
      .map(item => item.data)
      .filter(post => post.secure_media && post.secure_media.reddit_video)
      .map(post => ({
        platform: 'reddit',
        title: post.title || '',
        url: post.secure_media.reddit_video.fallback_url,
        date: (post.created_utc || 0) * 1000,
        thumbnail:
          post.thumbnail && post.thumbnail.startsWith('http')
            ? post.thumbnail
            : null
      }));

    res.json(videos);
  } catch (error) {
    console.error('Reddit fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch Reddit feed' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
