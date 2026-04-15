module.exports = (req, res) => {
  try {
    const q = String(req.query.q || "").toLowerCase();
    const platform = String(req.query.platform || "all").toLowerCase();

    const items = [
      {
        id: "yt1",
        title: "Rick Astley - Waiting On You (Official Video)",
        description: "Official video.",
        platform: "youtube",
        url: "https://www.youtube.com/watch?v=ghb6eDopW8I",
        thumbnail: "https://img.youtube.com/vi/ghb6eDopW8I/hqdefault.jpg",
        publishedAt: "2026-04-14T12:00:00Z",
        author: "Rick Astley"
      },
      {
        id: "rd1",
        title: "Best Budget Travel Tips",
        description: "Reddit travel discussion.",
        platform: "reddit",
        url: "https://www.reddit.com/r/travel/",
        thumbnail: "",
        publishedAt: "2026-04-12T15:00:00Z",
        author: "r/travel"
      }
    ];

    const filtered = items
      .filter((item) => {
        const matchesQuery =
          !q ||
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.author.toLowerCase().includes(q);

        const matchesPlatform =
          platform === "all" || item.platform === platform;

        return matchesQuery && matchesPlatform;
      })
      .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({
      success: true,
      total: filtered.length,
      items: filtered
    }));
  } catch (error) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({
      success: false,
      error: error.message || "Unknown server error"
    }));
  }
};
