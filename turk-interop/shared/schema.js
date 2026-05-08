// TURK Interop — Ortak Veri Şeması v1
const CRISIS_TYPES = ['earthquake', 'flood', 'fire', 'epidemic', 'other'];
const SEVERITY_LEVELS = ['low', 'medium', 'high', 'critical'];
const STATUS_TYPES = ['active', 'monitoring', 'resolved'];

const crisisEventSchema = {
  id: 'string (uuid)',
  type: 'CRISIS_TYPES',
  title: 'string',
  description: 'string',
  severity: 'SEVERITY_LEVELS',
  status: 'STATUS_TYPES',
  location: {
    country: 'string (ISO 3166-1 alpha-2)',
    city: 'string',
    coordinates: { lat: 'number', lng: 'number' },
    affectedRadiusKm: 'number'
  },
  impact: {
    affectedPopulation: 'number',
    casualties: 'number',
    injured: 'number',
    displaced: 'number'
  },
  needs: ['food', 'water', 'medical', 'shelter', 'rescue', 'other'],
  reportedBy: 'string (country code)',
  createdAt: 'ISO8601',
  updatedAt: 'ISO8601'
};

module.exports = { CRISIS_TYPES, SEVERITY_LEVELS, STATUS_TYPES, crisisEventSchema };
