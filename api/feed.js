// ===============================
// HYBRID FEED SERVER (COLUMN 2)
// ===============================

const express = require("express");
const router = express.Router();

// Mock feed items (replace with real sources later)
const mockFeed = [
  {
    id: 1,
    title: "Sample Feed Item #1",
    text: "This is a sample feed card for the infinite scroll area in Column 2.",
    type: "text"
  },
  {
    id: 2,
    title: "Sample Feed Item #2",
    text: "This is a sample feed card for the infinite scroll area in Column 2.",
    type: "text"
  },
  {
    id: 3,
    title: "Sample Feed Item #3",
    text: "This is a sample feed card for the infinite scroll area in Column 2.",
    type: "text"
  },
  {
    id: 4,
    title: "Sample Feed Item #4",
    text: "This is a sample feed card for the infinite scroll area in Column 2.",
    type: "text"
  },
  {
    id: 5,
    title: "Sample Feed Item #5",
    text: "This is a sample feed card for the infinite scroll area in Column 2.",
    type: "text"
  },
  {
    id: 6,
    title: "Sample Feed Item #6",
    text: "This is a sample feed card for the infinite scroll area in Column 2.",
    type: "text"
  }
];

// Pagination logic
router.get("/feed", (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 6;

  const start = (page - 1) * limit;
  const end = start + limit;

  const items = mockFeed.slice(start, end);

  res.json({
    page,
    hasMore: end < mockFeed.length,
    items
  });
});

module.exports = router;
