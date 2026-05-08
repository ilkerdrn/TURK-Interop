const express = require('express');
const router  = express.Router();
const { fetchAllExternalData, fetchUSGSEarthquakes } = require('../services/externalApis');

// 5 dakika cache
let cache = null;
let cacheTs = 0;
const TTL = 5 * 60 * 1000;

/**
 * GET /api/external
 * Tüm harici kaynaklardan veri çek (USGS + NASA + OpenWeather)
 */
router.get('/', async (req, res) => {
  if (cache && Date.now() - cacheTs < TTL) {
    return res.json({ ...cache, cached: true });
  }
  try {
    const data = await fetchAllExternalData();
    cache   = data;
    cacheTs = Date.now();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Harici veri alınamadı', detail: err.message });
  }
});

/**
 * GET /api/external/earthquakes
 * Sadece USGS deprem verisi
 */
router.get('/earthquakes', async (req, res) => {
  try {
    const data = await fetchUSGSEarthquakes();
    res.json({ count: data.length, earthquakes: data });
  } catch (err) {
    res.status(500).json({ error: 'USGS verisi alınamadı', detail: err.message });
  }
});

module.exports = router;
