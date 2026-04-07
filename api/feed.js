
const express = require('express');
const router = express.Router();
const axios = require('axios');

router.get('/', async (req, res) => {
  try {
    // Example YouTube call
    const ytRes = await axios.get(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=business&type=video&maxResults=5&key=${process.env.YOUTUBE_KEY}`
    );
    const ytVideos = ytRes.data.items.map(v => ({
      source: "youtube",
      title: v.snippet.title,
      thumbnail: v.snippet.thumbnails.medium.url,
      channel: v.snippet.channelTitle
    }));

    // Example Instagram call
    const igRes = await axios.get(
      `https://graph.instagram.com/me/media?fields=id,caption,media_url,like_count&access_token=${process.env.INSTAGRAM_TOKEN}`
    );
    const igPosts = igRes.data.data.map(p => ({
      source: "instagram",
      title: p.caption,
      thumbnail: p.media_url,
      likes: p.like_count
    }));

    // TikTok-style mock
    const tkVideos = [{
      source: "tiktok-style",
      title: "Travel & Business Insight",
      thumbnail: "travel-business-thumb.jpg",
      stats: { views: "2.1K", comments: "50" }
    }];

    res.json([...ytVideos, ...igPosts, ...tkVideos]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Feed unavailable" });
  }
});

module.exports = router;
