
VIDEO_POOL = items.map(normalizeFeedItem);

// NEW: newest first (best-effort)
VIDEO_POOL.sort((a, b) => {
  // normalizeFeedItem can optionally carry through publishedAt; if not, treat as 0
  const ta = Date.parse(a.publishedAt || a.date || '') || 0;
  const tb = Date.parse(b.publishedAt || b.date || '') || 0;
  return tb - ta;
});
