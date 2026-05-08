const express  = require('express');
const router   = express.Router();
const scenarios = require('../data/scenarios');

/**
 * GET /api/scenarios
 * Tüm afet senaryolarını listele
 */
router.get('/', (req, res) => {
  const { country, event_type, severity } = req.query;
  let result = [...scenarios];
  if (country)    result = result.filter(s => s.country === country.toUpperCase());
  if (event_type) result = result.filter(s => s.event_type === event_type);
  if (severity)   result = result.filter(s => s.severity === severity);
  res.json({ count: result.length, scenarios: result });
});

/**
 * GET /api/scenarios/:id
 */
router.get('/:id', (req, res) => {
  const s = scenarios.find(s => s.id === req.params.id);
  if (!s) return res.status(404).json({ error: 'Scenario not found' });
  res.json(s);
});

module.exports = router;
