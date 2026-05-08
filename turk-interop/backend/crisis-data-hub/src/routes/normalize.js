const express = require('express');
const router  = express.Router();
const { v4: uuidv4 } = require('uuid');
const { normalizeData, getSchema } = require('../services/normalizer');

/**
 * POST /api/normalize
 * Ham kriz verisini TI-DS v1 standardına dönüştürür.
 *
 * Body: { data: {...}, country_hint: "TR" }
 */
router.post('/', async (req, res) => {
  const { data, country_hint } = req.body;
  if (!data || typeof data !== 'object') {
    return res.status(400).json({ error: '"data" alanı zorunlu ve object olmalı' });
  }
  try {
    const result = await normalizeData(data, country_hint);
    res.json(result);
  } catch (err) {
    // Normalizer servisi kapalıysa fallback: basit JS normalizasyonu
    if (err.code === 'ECONNREFUSED') {
      return res.json(fallbackNormalize(data, country_hint));
    }
    res.status(500).json({ error: 'Normalizasyon başarısız', detail: err.message });
  }
});

/**
 * GET /api/normalize/schema
 * TI-DS v1 şemasını döndürür
 */
router.get('/schema', async (req, res) => {
  try {
    const schema = await getSchema();
    res.json(schema);
  } catch {
    res.json(FALLBACK_SCHEMA);
  }
});

// ── Fallback: Python servisi kapalıysa JS ile temel normalizasyon ─────────────

const FALLBACK_SCHEMA = {
  version: "TI-DS v1",
  fields: {
    id: "UUID", country: "ISO 3166-1 alpha-2",
    disaster_type: "earthquake|flood|fire|epidemic|storm|other",
    severity: "low|medium|high|critical",
    people_affected: "integer", resources_needed: "array",
    response_time: "string", normalized_at: "ISO 8601"
  }
};

function fallbackNormalize(data, countryHint) {
  const pick = (...keys) => keys.map(k => data[k]).find(v => v !== undefined) ?? null;
  return {
    id:               uuidv4(),
    country:          (countryHint || pick('country','country_code','ISO','ulke') || 'XX').toUpperCase().slice(0,2),
    disaster_type:    pick('disaster_type','event_type','event','afet_turu','crisis_type') || 'other',
    severity:         pick('severity','siddet') || 'medium',
    people_affected:  Number(pick('people_affected','affected','etkilenen_kisi','population_impacted') || 0),
    resources_needed: pick('resources_needed','needs','ihtiyaclar','required_resources') || [],
    response_time:    String(pick('response_time','eta_hours','mudahale_suresi','response_eta') || 'unknown'),
    normalized_at:    new Date().toISOString(),
    source_format:    'js-fallback',
    _raw:             data
  };
}

module.exports = router;
