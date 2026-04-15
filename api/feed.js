export default function handler(req, res) {
  const q = (req.query.q || "").toLowerCase();
  const platform = (req.query.platform || "all").toLowerCase();

  const items = [
    {
      id: "yt1",
      title: "Top 10 Things To Do in Lisbon",
      description: "Best places to visit in Lisbon.",
      platform: "youtube",
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
      publishedAt: "2026-04-14T12:00:00Z",
      author: "SignalBoost Travel"
    },
    {
      id: "yt2",
      title: "Weekend in Rome Travel Guide",
      description: "48 hours in Rome travel tips.",
      platform: "youtube",
      url: "https://www.youtube.com/watch?v=3JZ_D3ELwOQ",
      thumbnail: "https://img.youtube.com/vi/3JZ_D3ELwOQ/hqdefault.jpg",
      publishedAt: "2026-04-13T10:00:00Z",
      author: "City Breaks"
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

  const filtered = items.filter(item => {
    const matchesQuery =
      !q ||
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q);

    const matchesPlatform =
      platform === "all" || item.platform === platform;

    return matchesQuery && matchesPlatform;
  });

  filtered.sort((a, b) => {
    return new Date(b.publishedAt) - new Date(a.publishedAt);
  });

  res.status(200).json({
    success: true,
    total: filtered.length,
    items: filtered
  });
}
