const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Allow browser requests
app.use(cors({
  origin: '*',
  methods: ['GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept']
}));

app.use(express.json());

// ===============================
// HYBRID FEED API
// ===============================
app.get('/api/hybrid-feed', async (req, res) => {
  try {
    const type = req.query.type || 'video';
    const sort = req.query.sort || 'recent';
    const page = Number(req.query.page || 0);

    // Replace this with your real hybrid source aggregation logic
    const items = [
      {
        title: 'Jamaica Travel Guide',
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

    if (type !== 'video') {
      return res.json([]);
    }

    // Simulate paging
    const pageSize = 10;
    const start = page * pageSize;
    const pagedItems = items.slice(start, start + pageSize);

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(pagedItems);
  } catch (error) {
    console.error('Hybrid feed API error:', error);
    res.status(500).json({
      error: 'Hybrid feed failed',
      message: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
