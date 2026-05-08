const express = require('express');
const router = express.Router();
const store = require('../data/store');
const { validateCrisis, VALID_EVENT_TYPES, VALID_SEVERITIES } = require('../middleware/validate');

/**
 * GET /api/crises
 * Tüm kriz olaylarını listele, opsiyonel filtrelerle
 *
 * Query params:
 *   country     — ülke kodu (TR, AZ, KZ...)
 *   event_type  — earthquake | flood | fire | epidemic | storm | other
 *   severity    — low | medium | high | critical
 *   status      — active | monitoring | resolved
 *   limit       — max kayıt sayısı (default: 50)
 *   offset      — sayfalama başlangıcı (default: 0)
 */
router.get('/', (req, res) => {
  const { country, event_type, severity, status, limit = 50, offset = 0 } = req.query;

  let results = store.filter({ country, event_type, severity, status });

  // Tarihe göre sırala (en yeni önce)
  results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const total = results.length;
  const paginated = results.slice(Number(offset), Number(offset) + Number(limit));

  res.json({
    total,
    limit: Number(limit),
    offset: Number(offset),
    data: paginated
  });
});

/**
 * GET /api/crises/summary
 * Ülke bazlı özet istatistikler
 */
router.get('/summary', (req, res) => {
  const all = store.getAll();

  const summary = all.reduce((acc, c) => {
    if (!acc[c.country]) {
      acc[c.country] = { country: c.country, total: 0, active: 0, affected_people: 0, by_severity: {} };
    }
    acc[c.country].total++;
    if (c.status === 'active') acc[c.country].active++;
    acc[c.country].affected_people += c.affected_people;
    acc[c.country].by_severity[c.severity] = (acc[c.country].by_severity[c.severity] || 0) + 1;
    return acc;
  }, {});

  res.json({
    total_events: all.length,
    countries: Object.values(summary)
  });
});

/**
 * GET /api/crises/:id
 * Tek bir kriz olayını getir
 */
router.get('/:id', (req, res) => {
  const crisis = store.getById(req.params.id);
  if (!crisis) return res.status(404).json({ error: 'Crisis event not found' });
  res.json(crisis);
});

/**
 * POST /api/crises
 * Yeni kriz olayı ekle
 *
 * Body (zorunlu): country, event_type, severity
 * Body (opsiyonel): affected_people, description, reported_by
 */
router.post('/', validateCrisis, (req, res) => {
  const crisis = store.create(req.body);
  res.status(201).json(crisis);
});

/**
 * PATCH /api/crises/:id
 * Kriz olayını güncelle (kısmi güncelleme)
 *
 * Güncellenebilir alanlar: severity, affected_people, description, status
 */
router.patch('/:id', (req, res) => {
  const { severity, status } = req.body;

  if (severity && !VALID_SEVERITIES.includes(severity))
    return res.status(400).json({ error: `severity must be one of: ${VALID_SEVERITIES.join(', ')}` });

  const VALID_STATUSES = ['active', 'monitoring', 'resolved'];
  if (status && !VALID_STATUSES.includes(status))
    return res.status(400).json({ error: `status must be one of: ${VALID_STATUSES.join(', ')}` });

  const updated = store.update(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Crisis event not found' });

  res.json(updated);
});

/**
 * DELETE /api/crises/:id
 * Kriz olayını sil
 */
router.delete('/:id', (req, res) => {
  const deleted = store.delete(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Crisis event not found' });
  res.json({ message: 'Crisis event deleted', id: req.params.id });
});

module.exports = router;
