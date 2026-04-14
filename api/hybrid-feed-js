const express = require('express');
const router = express.Router();

// ===============================
// GET /api/hybrid-feed
// ===============================
router.get('/', async (req, res) => {
  try {
    const type = req.query.type || 'video';
    const sort = req.query.sort || 'recent';
    const page = Number(req.query.page || 0);

    if (type !== 'video') {
      return res.status(200).json([]);
    }

    // ===============================
    // TEMP SAMPLE DATA
    // Replace this later with your real hybrid source aggregation
    // ===============================
    const items = [
      {
        title: 'World Travel Guide',
        platform: 'YouTube',
        thumbnail: 'https://img.youtube.com/vi/Scxs7L0vhZ4/hqdefault.jpg',
        url: 'https://www.youtube.com/watch?v=Scxs7L0vhZ4',
        badge: sort === 'recent' ? 'Recent' : 'Featured',
        embedHtml: `<iframe
          src="https://www.youtube.com/embed/Scxs7L0vhZ4"
          title="Jamaica Travel Guide"
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
        ></iframe>`
      },
      {
        title: 'Cheap Flights Tips',
        platform: 'YouTube',
        thumbnail: 'https://img.youtube.com/vi/aKydtOXW8mI/hqdefault.jpg',
        url: 'https://www.youtube.com/watch?v=aKydtOXW8mI',
        badge: sort === 'recent' ? 'Recent' : 'Featured',
        embedHtml: `<iframe
          src="https://www.youtube.com/embed/aKydtOXW8mI"
          title="Cheap Flights Tips"
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
        ></iframe>`
      }
    ];

    // simple paging
    const pageSize = 10;
    const start = page * pageSize;
    const pagedItems = items.slice(start, start + pageSize);

    return res.status(200).json(pagedItems);
  } catch (error) {
    console.error('Hybrid feed route error:', error);

    return res.status(500).json({
      error: 'Hybrid feed failed',
      message: error.message
    });
  }
});

module.exports = router;
