export default function handler(req, res) {
  try {
    const mockFeed = [
      {
        id: 1,
        title: "Sample Feed Item #1",
        description: "This is a sample feed card for Column 2.",
        author: "SignalBoost",
        platform: "internal",
        url: "https://www.signalboostapp.com",
        thumbnail: "",
        publishedAt: new Date().toISOString()
      },
      {
        id: 2,
        title: "Sample Feed Item #2",
        description: "This is another sample feed item.",
        author: "SignalBoost",
        platform: "internal",
        url: "https://www.signalboostapp.com",
        thumbnail: "",
        publishedAt: new Date().toISOString()
      },
      {
        id: 3,
        title: "Sample Feed Item #3",
        description: "Your hybrid feed endpoint is now working.",
        author: "SignalBoost",
        platform: "internal",
        url: "https://www.signalboostapp.com",
        thumbnail: "",
        publishedAt: new Date().toISOString()
      }
    ];

    res.status(200).json({ items: mockFeed });
  } catch (error) {
    console.error("API /api/feed error:", error);
    res.status(500).json({
      error: "Feed failed",
      message: error.message
    });
  }
}
