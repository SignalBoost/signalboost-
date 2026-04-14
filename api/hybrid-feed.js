// api/hybrid-feed.js

export default function handler(req, res) {
  // Parse query params
  const { type = 'video', sort = 'recent', page = 0 } = req.query;

  if (type !== 'video') {
    return res.status(200).json([]);
  }

  // TEMP SAMPLE DATA
  // Replace this with your real hybrid source aggregation in the future
  const items = [
    {
      title: 'World Travel Guide',
      platform: 'YouTube',
      thumbnail: 'https://img.youtube.com/vi/Scxs7L0vhZ4/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=Scxs7L0vhZ4',
      badge: sort === 'recent' ? 'Recent' : 'Featured',
      embedHtml: `<iframe src="https://www.youtube.com/embed/Scxs7L0vhZ4" frameborder="0" allowfullscreen></iframe>`,
    },
    // Add more items as needed
  ];

  res.status(200).json(items);
}
