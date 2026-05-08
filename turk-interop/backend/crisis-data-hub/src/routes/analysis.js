const express  = require('express');
const router   = express.Router();
const { analyzeDisaster } = require('../services/aiAnalysis');

// Basit in-memory cache — aynı veri için tekrar analiz yapma
const cache = new Map();
const TTL   = 10 * 60 * 1000; // 10 dakika

function cacheKey(data) {
  return `${data.country}:${data.disaster_type}:${data.severity}:${data.people_affected}`;
}

/**
 * POST /api/analysis
 * Normalize edilmiş afet verisini analiz eder.
 * Body: TI-DS v1 formatında normalize edilmiş veri
 */
router.post('/', async (req, res) => {
  const data = req.body;

  if (!data?.disaster_type || !data?.severity) {
    return res.status(400).json({
      error: 'Normalize edilmiş veri gerekli (disaster_type, severity zorunlu)'
    });
  }

  const key    = cacheKey(data);
  const cached = cache.get(key);
  if (cached && Date.now() - cached.ts < TTL) {
    return res.json({ ...cached.result, cached: true });
  }

  try {
    const result = await analyzeDisaster(data);
    cache.set(key, { result, ts: Date.now() });
    res.json(result);
  } catch (err) {
    console.error('[ANALYSIS]', err.message);
    res.status(500).json({ error: 'Analiz başarısız', detail: err.message });
  }
});

/**
 * POST /api/analysis/batch
 * Birden fazla olayı tek seferde analiz eder.
 */
router.post('/batch', async (req, res) => {
  const { events } = req.body;
  if (!Array.isArray(events) || !events.length) {
    return res.status(400).json({ error: '"events" array zorunlu' });
  }

  try {
    const results = await Promise.all(events.map(analyzeDisaster));
    // Risk skoruna göre sırala (yüksekten düşüğe)
    results.sort((a, b) => b.risk_score - a.risk_score);
    res.json({ count: results.length, analyses: results });
  } catch (err) {
    res.status(500).json({ error: 'Batch analiz başarısız', detail: err.message });
  }
});

module.exports = router;
