import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  try {
    const total = Number((await kv.get('clicks:total')) || 0);

    const today = new Date().toISOString().slice(0, 10);
    const clicksToday = Number((await kv.get(`clicks:day:${today}`)) || 0);

    const recentRaw = (await kv.lrange('clicks:recent', 0, 49)) || [];
    const recent = recentRaw.map((row) => {
      try {
        return typeof row === 'string' ? JSON.parse(row) : row;
      } catch {
        return null;
      }
    }).filter(Boolean);

    const partnerCounts = {};
    const sourceCounts = {};

    for (const row of recent) {
      partnerCounts[row.partner] = (partnerCounts[row.partner] || 0) + 1;
      sourceCounts[row.source] = (sourceCounts[row.source] || 0) + 1;
    }

    const topPartners = Object.entries(partnerCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, clicks]) => ({ name, clicks }));

    res.status(200).json({
      total,
      clicksToday,
      topPartners,
      sourceCounts,
      recent
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load stats' });
  }
}
