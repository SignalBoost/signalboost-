import axios from "axios";

export default async function handler(req, res) {
  try {
    const YT_API_KEY = process.env.YT_API_KEY;

    const yt = await axios.get(
      "https://www.googleapis.com/youtube/v3/videos",
      {
        params: {
          part: "snippet,statistics",
          chart: "mostPopular",
          maxResults: 10,
          regionCode: "US",
          key: YT_API_KEY
        }
      }
    );

    const items = yt.data.items.map(v => ({
      id: v.id,
      title: v.snippet.title,
      text: v.snippet.description,
      source: "YouTube",
      link: `https://www.youtube.com/watch?v=${v.id}`,
      publishedAt: v.snippet.publishedAt
    }));

    res.status(200).json({
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
}
