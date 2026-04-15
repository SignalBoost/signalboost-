const axios = require("axios");

module.exports = async (req, res) => {
  try {
    const apiKey = process.env.YT_API_KEY || process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        items: [],
        error: "Missing YouTube API key"
      });
    }

    const yt = await axios.get(
      "https://www.googleapis.com/youtube/v3/videos",
      {
        params: {
          part: "snippet,statistics",
          chart: "mostPopular",
          maxResults: 10,
          regionCode: "US",
          key: apiKey
        }
      }
    );

    const items = yt.data.items.map(v => ({
      id: v.id,
      title: v.snippet.title,
      text: v.snippet.description,
      source: "YouTube",
      link: `https://www.youtube.com/watch?v=${v.id}`,
      publishedAt: v.snippet.publishedAt,
      thumb:
        v.snippet.thumbnails?.maxres?.url ||
        v.snippet.thumbnails?.high?.url ||
        v.snippet.thumbnails?.medium?.url ||
        v.snippet.thumbnails?.default?.url ||
        null
    }));

    res.json({
      success: true,
      items
    });

  } catch (err) {
    console.error("YouTube API error:", err.message);

    res.status(500).json({
      success: false,
      items: [],
      error: "Failed to load YouTube trending"
    });
  }
};
