/**
 * Kriz Modu — merkezi veri deposu
 * Gerçek zamanlı hissi için interval ile güncellenir
 */

export const COUNTRIES = ['TR', 'AZ', 'KZ', 'UZ', 'TM', 'KG'];

export const INITIAL_EVENTS = [
  {
    id: 'ev-001', country: 'TR', city: 'Kahramanmaraş', type: 'earthquake',
    severity: 'critical', affected: 1850000, casualties: 4200, injured: 18500,
    lat: 37.58, lng: 36.92, radius: 350, status: 'active',
    teams: 12, timestamp: Date.now() - 3600000 * 2,
    description: '7.8 büyüklüğünde deprem'
  },
  {
    id: 'ev-002', country: 'AZ', city: 'Gəncə', type: 'flood',
    severity: 'high', affected: 280000, casualties: 38, injured: 210,
    lat: 40.68, lng: 46.36, radius: 120, status: 'active',
    teams: 6, timestamp: Date.now() - 3600000 * 5,
    description: 'Kür nehri taşkını'
  },
  {
    id: 'ev-003', country: 'KZ', city: 'Almatı', type: 'epidemic',
    severity: 'high', affected: 520000, casualties: 890, injured: 14200,
    lat: 43.25, lng: 76.94, radius: 80, status: 'monitoring',
    teams: 8, timestamp: Date.now() - 3600000 * 12,
    description: 'Solunum yolu salgını'
  },
  {
    id: 'ev-004', country: 'UZ', city: 'Taşkent', type: 'fire',
    severity: 'medium', affected: 45000, casualties: 12, injured: 89,
    lat: 41.29, lng: 69.24, radius: 30, status: 'active',
    teams: 4, timestamp: Date.now() - 3600000 * 1,
    description: 'Sanayi bölgesi yangını'
  },
  {
    id: 'ev-005', country: 'TM', city: 'Aşgabat', type: 'drought',
    severity: 'medium', affected: 120000, casualties: 0, injured: 0,
    lat: 37.95, lng: 58.38, radius: 200, status: 'monitoring',
    teams: 2, timestamp: Date.now() - 3600000 * 48,
    description: 'Uzun süreli kuraklık'
  },
  {
    id: 'ev-006', country: 'KG', city: 'Bişkek', type: 'storm',
    severity: 'low', affected: 8200, casualties: 2, injured: 15,
    lat: 42.87, lng: 74.59, radius: 50, status: 'resolved',
    teams: 1, timestamp: Date.now() - 3600000 * 24,
    description: 'Kuzey fırtınası'
  }
];

export const COUNTRY_RISK = {
  TR: { level: 'critical', score: 94, trend: 'up'   },
  AZ: { level: 'high',     score: 71, trend: 'up'   },
  KZ: { level: 'high',     score: 68, trend: 'stable'},
  UZ: { level: 'medium',   score: 45, trend: 'down' },
  TM: { level: 'medium',   score: 38, trend: 'stable'},
  KG: { level: 'low',      score: 18, trend: 'down' }
};

export const RESOURCES = [
  { id: 'r-001', country: 'TR', type: 'USAR', name: 'AFAD Ağır Kurtarma', count: 8,  status: 'deployed',  target: 'ev-001' },
  { id: 'r-002', country: 'AZ', type: 'Medical', name: 'FHN Sağlık Ekibi', count: 4, status: 'deployed',  target: 'ev-002' },
  { id: 'r-003', country: 'KZ', type: 'USAR', name: 'KZ Kurtarma Birliği', count: 3, status: 'transit',   target: 'ev-001' },
  { id: 'r-004', country: 'UZ', type: 'Medical', name: 'UZ Tıbbi Destek',  count: 2, status: 'standby',   target: null     },
  { id: 'r-005', country: 'TR', type: 'Logistics', name: 'AFAD Lojistik',  count: 12, status: 'deployed', target: 'ev-001' },
  { id: 'r-006', country: 'KG', type: 'Medical', name: 'KG Sağlık',        count: 1, status: 'standby',   target: null     }
];

export const EVAC_CENTERS = [
  { id: 'ec-001', name: 'Malatya Tahliye Merkezi', lat: 38.35, lng: 38.31, capacity: 15000, occupied: 12400, country: 'TR' },
  { id: 'ec-002', name: 'Adıyaman Çadır Kent',     lat: 37.76, lng: 38.27, capacity: 8000,  occupied: 7200,  country: 'TR' },
  { id: 'ec-003', name: 'Gəncə Barınak',           lat: 40.70, lng: 46.40, capacity: 5000,  occupied: 3800,  country: 'AZ' }
];

export const TYPE_META = {
  earthquake: { icon: '🌍', label: 'Deprem',   color: '#ef4444' },
  flood:      { icon: '🌊', label: 'Sel',       color: '#3b82f6' },
  fire:       { icon: '🔥', label: 'Yangın',    color: '#f97316' },
  epidemic:   { icon: '🦠', label: 'Salgın',    color: '#a855f7' },
  storm:      { icon: '🌪️', label: 'Fırtına',  color: '#06b6d4' },
  drought:    { icon: '🏜️', label: 'Kuraklık', color: '#eab308' },
  other:      { icon: '⚠️', label: 'Diğer',    color: '#6b7280' }
};

export const SEV_META = {
  critical: { label: 'KRİTİK', color: '#ef4444', bg: 'rgba(239,68,68,0.15)',  border: 'rgba(239,68,68,0.4)'  },
  high:     { label: 'YÜKSEK', color: '#f97316', bg: 'rgba(249,115,22,0.15)', border: 'rgba(249,115,22,0.4)' },
  medium:   { label: 'ORTA',   color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.4)' },
  low:      { label: 'DÜŞÜK',  color: '#22c55e', bg: 'rgba(34,197,94,0.15)',  border: 'rgba(34,197,94,0.4)'  }
};
