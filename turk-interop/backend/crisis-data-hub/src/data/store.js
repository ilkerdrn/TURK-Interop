/**
 * In-memory veri deposu
 * Production'da PostgreSQL ile değiştirilir.
 * Aynı interface korunarak sadece bu dosya güncellenir.
 */
const { v4: uuidv4 } = require('uuid');

// Örnek seed verisi
let crises = [
  {
    id: 'a1b2c3d4-0001-0000-0000-000000000001',
    country: 'TR',
    event_type: 'earthquake',
    severity: 'critical',
    affected_people: 125000,
    description: 'Doğu Anadolu fay hattı depremi',
    timestamp: '2026-03-15T04:17:00.000Z',
    reported_by: 'AFAD',
    status: 'active',
    location: { country: 'TR', city: 'Malatya', coordinates: { lat: 38.35, lng: 38.31 }, affectedRadiusKm: 150 }
  },
  {
    id: 'a1b2c3d4-0002-0000-0000-000000000002',
    country: 'AZ',
    event_type: 'flood',
    severity: 'high',
    affected_people: 34000,
    description: 'Kura nehri taşkını',
    timestamp: '2026-04-02T11:30:00.000Z',
    reported_by: 'AZ-DFT',
    status: 'active',
    location: { country: 'AZ', city: 'Mingəçevir', coordinates: { lat: 40.77, lng: 47.05 }, affectedRadiusKm: 60 }
  },
  {
    id: 'a1b2c3d4-0003-0000-0000-000000000003',
    country: 'KZ',
    event_type: 'storm',
    severity: 'medium',
    affected_people: 8200,
    description: 'Kuzey bozkır fırtınası',
    timestamp: '2026-04-20T08:00:00.000Z',
    reported_by: 'KZ-EM',
    status: 'monitoring',
    location: { country: 'KZ', city: 'Astana', coordinates: { lat: 51.18, lng: 71.45 }, affectedRadiusKm: 200 }
  }
];

const store = {
  getAll: () => [...crises],

  getById: (id) => crises.find(c => c.id === id) || null,

  filter: ({ country, event_type, severity, status }) => {
    return crises.filter(c => {
      if (country    && c.country    !== country.toUpperCase()) return false;
      if (event_type && c.event_type !== event_type)            return false;
      if (severity   && c.severity   !== severity)              return false;
      if (status     && c.status     !== status)                return false;
      return true;
    });
  },

  create: (data) => {
    const record = {
      id: uuidv4(),
      country: data.country.toUpperCase(),
      event_type: data.event_type,
      severity: data.severity,
      affected_people: Number(data.affected_people) || 0,
      description: data.description || '',
      timestamp: new Date().toISOString(),
      reported_by: data.reported_by || 'unknown',
      status: 'active'
    };
    crises.push(record);
    return record;
  },

  update: (id, data) => {
    const idx = crises.findIndex(c => c.id === id);
    if (idx === -1) return null;
    const allowed = ['severity', 'affected_people', 'description', 'status'];
    allowed.forEach(key => {
      if (data[key] !== undefined) crises[idx][key] = data[key];
    });
    crises[idx].updated_at = new Date().toISOString();
    return crises[idx];
  },

  delete: (id) => {
    const idx = crises.findIndex(c => c.id === id);
    if (idx === -1) return false;
    crises.splice(idx, 1);
    return true;
  }
};

module.exports = store;
