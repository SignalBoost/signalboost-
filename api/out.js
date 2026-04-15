export default function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).send('Missing URL');
  }

  try {
    const decoded = decodeURIComponent(url);

    // Optional: log click (for future monetization tracking)
    console.log('Outbound click:', decoded);

    return res.redirect(decoded);
  } catch (err) {
    return res.status(400).send('Invalid URL');
  }
}
