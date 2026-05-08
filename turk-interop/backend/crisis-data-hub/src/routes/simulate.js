const express = require('express');
const router  = express.Router();
const { runSimulation, generateScenario } = require('../services/simulator');

// Basit cache — tekrar eden istekler için
const cache = new Map();
const TTL   = 30000; // 30 sn

/**
 * POST /api/simulate
 * Yeni bir kriz senaryosu üret ve analiz et.
 *
 * Body (opsiyonel): { country, disaster_type, severity, people_affected }
 * Herhangi biri verilirse o parametre sabitlenir, diğerleri rastgele üretilir.
 */
router.post('/', async (req, res) => {
  const params = req.body || {};

  // Cache key — aynı parametre kombinasyonu için tekrar üretme
  const key = JSON.stringify(params);
  const cached = cache.get(key);
  if (cached && Date.now() - cached.ts < TTL) {
    return res.json({ ...cached.result, cached: true });
  }

  try {
    const result = await runSimulation(params);
    cache.set(key, { result, ts: Date.now() });
    res.json(result);
  } catch (err) {
    console.error('[SIMULATE]', err.message);
    res.status(500).json({ error: 'Simülasyon başarısız', detail: err.message });
  }
});

/**
 * POST /api/simulate/batch
 * Birden fazla senaryo üret (örn. eğitim simülasyonu için)
 */
router.post('/batch', async (req, res) => {
  const { count = 5, params = {} } = req.body;
  const results = [];

  for (let i = 0; i < Math.min(count, 10); i++) {
    try {
      const sim = await runSimulation(params);
      results.push(sim);
    } catch {
      // tek bir simülasyon başarısız olursa devam et
    }
  }

  // Risk skoruna göre sırala
  results.sort((a, b) => b.analysis.risk_score - a.analysis.risk_score);

  res.json({ count: results.length, simulations: results });
});

/**
 * GET /api/simulate/quick
 * Hızlı senaryo üret (analiz yok, sadece scenario)
 */
router.get('/quick', (req, res) => {
  const params = {
    country:       req.query.country,
    disaster_type: req.query.disaster_type,
    severity:      req.query.severity
  };
  // undefined değerleri temizle
  Object.keys(params).forEach(k => { if (!params[k]) delete params[k]; });

  const scenario = generateScenario(params);
  res.json(scenario);
});

module.exports = router;
