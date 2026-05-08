import React from 'react';

const sel = 'bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-sky-500';

export default function FilterBar({ filters, onChange, onRefresh, loading }) {
  const set = (key) => (e) => onChange({ ...filters, [key]: e.target.value });

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <select className={sel} value={filters.country} onChange={set('country')}>
        <option value="">Tüm Ülkeler</option>
        {['TR', 'AZ', 'KZ', 'UZ', 'TM', 'KG'].map(c => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <select className={sel} value={filters.event_type} onChange={set('event_type')}>
        <option value="">Tüm Tipler</option>
        <option value="earthquake">🌍 Deprem</option>
        <option value="flood">🌊 Sel</option>
        <option value="fire">🔥 Yangın</option>
        <option value="epidemic">🦠 Salgın</option>
        <option value="storm">🌪️ Fırtına</option>
        <option value="other">⚠️ Diğer</option>
      </select>

      <select className={sel} value={filters.severity} onChange={set('severity')}>
        <option value="">Tüm Şiddetler</option>
        <option value="low">Düşük</option>
        <option value="medium">Orta</option>
        <option value="high">Yüksek</option>
        <option value="critical">Kritik</option>
      </select>

      <select className={sel} value={filters.status} onChange={set('status')}>
        <option value="">Tüm Durumlar</option>
        <option value="active">Aktif</option>
        <option value="monitoring">İzleniyor</option>
        <option value="resolved">Çözüldü</option>
      </select>

      <button
        onClick={onRefresh}
        disabled={loading}
        className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm text-slate-200 transition-colors disabled:opacity-50"
      >
        <span className={loading ? 'animate-spin' : ''}>↻</span>
        Yenile
      </button>
    </div>
  );
}
