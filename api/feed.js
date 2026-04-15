const express = require("express");
const router = express.Router();

// Example feed data (replace with real sources later)
const sampleFeed = [
  {
    id: "f1",
    title: "Dark entity in my dream tried to make me denounce Jesus",
    text: "Astral dream travel - met a hindu godlike entity...",
    source: "Reddit",
    link: "https://reddit.com/r/examplepost"
  },
  {
    id: "f2",
    title: "Helped my wife escape a dangerous situation...",
    text: "I married my wife last year in Hollywood...",
    source: "Reddit",
    link: "https://reddit.com/r/examplepost2"
  }
];

// GET /api/feed?page=1
router.get("/feed", (req, res) => {
  const page = parseInt(req.query.page) || 1;

  res.json({
    success: true,
    page,
    items: sampleFeed
  });
});

module.exports = router;
