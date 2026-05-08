export const SEVERITY = {
  low:      { label: 'Düşük',   bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/40', dot: 'bg-emerald-400' },
  medium:   { label: 'Orta',    bg: 'bg-amber-500/20',   text: 'text-amber-400',   border: 'border-amber-500/40',   dot: 'bg-amber-400'   },
  high:     { label: 'Yüksek',  bg: 'bg-orange-500/20',  text: 'text-orange-400',  border: 'border-orange-500/40',  dot: 'bg-orange-400'  },
  critical: { label: 'Kritik',  bg: 'bg-red-500/20',     text: 'text-red-400',     border: 'border-red-500/40',     dot: 'bg-red-400'     }
};

export const STATUS = {
  active:     { label: 'Aktif',      cls: 'bg-red-500/20 text-red-400'     },
  monitoring: { label: 'İzleniyor',  cls: 'bg-amber-500/20 text-amber-400' },
  resolved:   { label: 'Çözüldü',    cls: 'bg-slate-500/20 text-slate-400' }
};

export const EVENT_TYPE = {
  earthquake: { label: 'Deprem',  icon: '🌍' },
  flood:      { label: 'Sel',     icon: '🌊' },
  fire:       { label: 'Yangın',  icon: '🔥' },
  epidemic:   { label: 'Salgın',  icon: '🦠' },
  storm:      { label: 'Fırtına', icon: '🌪️' },
  other:      { label: 'Diğer',   icon: '⚠️' }
};
