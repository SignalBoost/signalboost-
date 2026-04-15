const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

/* =========================
   STATIC FILES (FRONTEND)
========================= */

// serves index.html, CSS, JS
app.use(express.static(path.join(__dirname)));

/* =========================
   API: FEED (WORKING)
========================= */

app.get("/api/feed", (req, res) => {
  const q = String(req.query.q || "").toLowerCase();
  const platform = String(req.query.platform || "all").toLowerCase();

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
      description: "Reddit discussion about cheap travel.",
      platform: "reddit",
      url: "https://www.reddit.com/r/travel/",
      thumbnail: "",
      publishedAt: "2026-04-12T15:00:00Z",
      author: "r/travel"
    },
    {
      id: "ig1",
      title: "Hidden Beaches",
      description: "Instagram travel inspiration.",
      platform: "instagram",
      url: "https://www.instagram.com/",
      thumbnail: "",
      publishedAt: "2026-04-11T18:00:00Z",
      author: "BeachExplorer"
    },
    {
      id: "fb1",
      title: "Family Travel Deals",
      description: "Facebook travel deals.",
      platform: "facebook",
      url: "https://www.facebook.com/",
      thumbnail: "",
      publishedAt: "2026-04-10T09:00:00Z",
      author: "Travel Deals"
    }
  ];

  const filtered = items.filter(item => {
    const matchesQuery =
      !q ||
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.author.toLowerCase().includes(q);

    const matchesPlatform =
      platform === "all" || item.platform === platform;

    return matchesQuery && matchesPlatform;
  });

  filtered.sort((a, b) => {
    return new Date(b.publishedAt) - new Date(a.publishedAt);
  });

  res.json({
    success: true,
    total: filtered.length,
    items: filtered
  });
});

/* =========================
   FALLBACK (INDEX)
========================= */

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

/* =========================
   START SERVER
========================= */

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
