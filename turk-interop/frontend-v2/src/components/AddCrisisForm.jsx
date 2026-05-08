import React, { useState } from 'react';

const COUNTRIES   = ['TR', 'AZ', 'KZ', 'UZ', 'TM', 'KG'];
const EVENT_TYPES = ['earthquake', 'flood', 'fire', 'epidemic', 'storm', 'other'];
const SEVERITIES  = ['low', 'medium', 'high', 'critical'];
const ET_LABELS   = { earthquake: '🌍 Deprem', flood: '🌊 Sel', fire: '🔥 Yangın', epidemic: '🦠 Salgın', storm: '🌪️ Fırtına', other: '⚠️ Diğer' };
const SEV_LABELS  = { low: 'Düşük', medium: 'Orta', high: 'Yüksek', critical: 'Kritik' };

const inputCls = 'w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-sky-500 placeholder-slate-600';
const labelCls = 'block text-xs text-slate-400 mb-1.5 font-medium';

const EMPTY = { country: 'TR', event_type: 'earthquake', severity: 'medium', affected_people: '', description: '', reported_by: '' };

export default function AddCrisisForm({ onAdd, onClose, submitting, submitError }) {
  const [form, setForm] = useState(EMPTY);
  const [localError, setLocalError] = useState('');

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  // submitError prop'u veya local validasyon hatası
  const error = submitError || localError;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    try {
      await onAdd({
        ...form,
        affected_people: form.affected_people ? Number(form.affected_people) : 0
      });
      setForm(EMPTY);
      onClose();
    } catch {
      // hata zaten hook'tan submitError olarak geliyor
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <h2 className="font-semibold text-slate-100">Yeni Kriz Olayı</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Ülke + Tip */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Ülke *</label>
              <select className={inputCls} value={form.country} onChange={set('country')}>
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Olay Tipi *</label>
              <select className={inputCls} value={form.event_type} onChange={set('event_type')}>
                {EVENT_TYPES.map(t => <option key={t} value={t}>{ET_LABELS[t]}</option>)}
              </select>
            </div>
          </div>

          {/* Şiddet */}
          <div>
            <label className={labelCls}>Şiddet *</label>
            <div className="grid grid-cols-4 gap-2">
              {SEVERITIES.map(s => (
                <button key={s} type="button"
                  onClick={() => setForm(f => ({ ...f, severity: s }))}
                  className={`py-2 rounded-lg text-xs font-semibold border transition-all ${
                    form.severity === s
                      ? s === 'low'      ? 'bg-emerald-500/30 text-emerald-300 border-emerald-500'
                      : s === 'medium'   ? 'bg-amber-500/30 text-amber-300 border-amber-500'
                      : s === 'high'     ? 'bg-orange-500/30 text-orange-300 border-orange-500'
                      :                   'bg-red-500/30 text-red-300 border-red-500'
                      : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-500'
                  }`}>
                  {SEV_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          {/* Etkilenen nüfus */}
          <div>
            <label className={labelCls}>Etkilenen Nüfus</label>
            <input className={inputCls} type="number" min="0" placeholder="0"
              value={form.affected_people} onChange={set('affected_people')} />
          </div>

          {/* Açıklama */}
          <div>
            <label className={labelCls}>Açıklama</label>
            <textarea className={`${inputCls} resize-none`} rows={2}
              placeholder="Kısa açıklama..."
              value={form.description} onChange={set('description')} />
          </div>

          {/* Raporlayan */}
          <div>
            <label className={labelCls}>Raporlayan Kurum</label>
            <input className={inputCls} placeholder="AFAD, AZ-DFT..."
              value={form.reported_by} onChange={set('reported_by')} />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-sm text-slate-200 transition-colors">
              İptal
            </button>
            <button type="submit" disabled={submitting}
              className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-sm font-semibold text-white transition-colors disabled:opacity-50">
              {submitting ? 'Kaydediliyor...' : 'Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
