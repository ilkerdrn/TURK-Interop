const VALID_EVENT_TYPES = ['earthquake', 'flood', 'fire', 'epidemic', 'storm', 'other'];
const VALID_SEVERITIES  = ['low', 'medium', 'high', 'critical'];

/**
 * Kriz verisi validasyonu
 * Zorunlu alanları ve enum değerlerini kontrol eder
 */
const validateCrisis = (req, res, next) => {
  const { country, event_type, severity, affected_people } = req.body;
  const errors = [];

  if (!country || typeof country !== 'string' || country.trim().length < 2)
    errors.push('country: 2+ karakterli string zorunlu (ISO 3166-1, örn: TR, AZ, KZ)');

  if (!event_type || !VALID_EVENT_TYPES.includes(event_type))
    errors.push(`event_type: şunlardan biri olmalı — ${VALID_EVENT_TYPES.join(', ')}`);

  if (!severity || !VALID_SEVERITIES.includes(severity))
    errors.push(`severity: şunlardan biri olmalı — ${VALID_SEVERITIES.join(', ')}`);

  if (affected_people !== undefined && (isNaN(affected_people) || Number(affected_people) < 0))
    errors.push('affected_people: 0 veya üzeri sayı olmalı');

  if (errors.length) return res.status(400).json({ error: 'Validation failed', details: errors });

  next();
};

module.exports = { validateCrisis, VALID_EVENT_TYPES, VALID_SEVERITIES };
