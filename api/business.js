
const express = require('express');
const router = express.Router();
const axios = require('axios');
const cacheManager = require('../utils/cacheManager');
const aiSummary = require('../utils/aiSummary');

router.get('/', async (req, res) => {
  try {
    const primary = await axios.get(process.env.PRIMARY_BUSINESS_API);
    cacheManager.save(primary.data);
    return res.json({ source: "primary", data: primary.data });
  } catch (e) {
    try {
      const backup = await axios.get(process.env.BACKUP_BUSINESS_API);
      cacheManager.save(backup.data);
      return res.json({ source: "backup", data: backup.data });
    } catch (e2) {
      const cached = cacheManager.load();
      if (cached) return res.json({ source: "cache", data: cached });
      const summary = await aiSummary.generate("business market update");
      return res.json({ source: "ai", data: summary });
    }
  }
});

module.exports = router;
