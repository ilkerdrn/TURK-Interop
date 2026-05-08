export const RISK_STYLE = {
  low:      { bar: 'bg-emerald-500', text: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30', label: 'DÜŞÜK' },
  medium:   { bar: 'bg-amber-500',   text: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/30',     label: 'ORTA'  },
  high:     { bar: 'bg-orange-500',  text: 'text-orange-400',  bg: 'bg-orange-500/10 border-orange-500/30',   label: 'YÜKSEK' },
  critical: { bar: 'bg-red-500',     text: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/30',         label: 'KRİTİK' }
};

export const PRIORITY_STYLE = {
  immediate: 'bg-red-500/20 text-red-300 border-red-500/40',
  '24h':     'bg-amber-500/20 text-amber-300 border-amber-500/40',
  '72h':     'bg-sky-500/20 text-sky-300 border-sky-500/40'
};

export const RESOURCE_ICON = {
  rescue: '🚁', medical: '🏥', shelter: '⛺',
  water: '💧', food: '🍱', logistics: '🚛', other: '📦'
};

export const DISASTER_ICON = {
  earthquake: '🌍', flood: '🌊', fire: '🔥',
  epidemic: '🦠', storm: '🌪️', drought: '🏜️', other: '⚠️'
};
