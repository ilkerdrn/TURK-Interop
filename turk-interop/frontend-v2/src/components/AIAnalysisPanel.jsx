import React, { useState } from 'react';
import client from '../api/client';
import { RESOURCE_TR, PRIORITY_TR, DISASTER_TR, ENGINE_TR } from '../utils/tr';

const RISK_STYLE = {
  low:      { bar: 'bg-emerald-500', text: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30', label: 'DÜŞÜK' },
  medium:   { bar: 'bg-amber-500',   text: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/30',     label: 'ORTA'  },
  high:     { bar: 'bg-orange-500',  text: 'text-orange-400',  bg: 'bg-orange-500/10 border-orange-500/30',   label: 'YÜKSEK' },
  critical: { bar: 'bg-red-500',     text: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/30',         label: 'KRİTİK' }
};

const PRIORITY_STYLE = {
  immediate: 'bg-red-500/20 text-red-300 border-red-500/40',
  '24h':     'bg-amber-500/20 text-amber-300 border-amber-500/40',
  '72h':     'bg-sky-500/20 text-sky-300 border-sky-500/40'
};

const RESOURCE_ICON = {
  rescue: '🚁', medical: '🏥', shelter: '⛺',
  water: '💧', food: '🍱', logistics: '🚛', other: '📦'
};

const PRESETS = [
  {
    label: '🌍 Kritik Deprem',
    data: { country: 'TR', disaster_type: 'earthquake', severity: 'critical', people_affected: 850000, resources_needed: ['rescue','medical','shelter'], response_time: '2 saat' }
  },
  {
    label: '🌊 Yüksek Sel',
    data: { country: 'AZ', disaster_type: 'flood', severity: 'high', people_affected: 34000, resources_needed: ['rescue','shelter','water'], response_time: '4 saat' }
  },
  {
    label: '🦠 Salgın',
    data: { country: 'KZ', disaster_type: 'epidemic', severity: 'high', people_affected: 520000, resources_needed: ['medical','food'], response_time: '6 saat' }
  }
];

export default function AIAnalysisPanel() {
  const [input,   setInput]   = useState(JSON.stringify(PRESETS[0].data, null, 2));
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const analyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const parsed = JSON.parse(input);
      const res    = await client.post('/analysis', parsed);
      setResult(res.data);
    } catch (e) {
      setError(e.message.includes('JSON') ? 'Geçersiz JSON' : e.message);
    } finally {
      setLoading(false);
    }
  };

  const rs = result ? RISK_STYLE[result.risk_level] || RISK_STYLE.medium : null;

  return (
    <div className="space-y-4">
      {/* Preset butonları */}
      <div className="flex gap-2 flex-wrap">
        {PRESETS.map((p, i) => (
          <button key={i} onClick={() => { setInput(JSON.stringify(p.data, null, 2)); setResult(null); }}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 border border-slate-700 text-slate-300 hover:border-slate-500 transition-colors">
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Sol: Girdi */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-700">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              📋 Afet Verisi (TI-DS v1)
            </span>
          </div>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            className="w-full bg-transparent p-4 text-xs text-slate-300 font-mono resize-none focus:outline-none"
            rows={12}
            spellCheck={false}
          />
          <div className="px-4 py-3 border-t border-slate-700">
            <button onClick={analyze} disabled={loading}
              className="w-full py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-sm font-semibold text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {loading
                ? <><span className="animate-spin">↻</span> Analiz ediliyor...</>
                : '🤖 AI Analizi Başlat'}
            </button>
          </div>
        </div>

        {/* Sağ: Sonuç */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              🧠 AI Analiz Sonucu
            </span>
            {result && (
              <span className="text-xs text-slate-500">
                {ENGINE_TR[result.engine] || result.engine}
              </span>
            )}
          </div>

          {error && (
            <div className="m-4 bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">⚠️ {error}</div>
          )}

          {!result && !error && (
            <div className="flex flex-col items-center justify-center h-64 text-slate-600 text-sm gap-2">
              <span className="text-4xl">🤖</span>
              Veriyi analiz etmek için butona bas
            </div>
          )}

          {result && rs && (
            <div className="p-4 space-y-4 overflow-y-auto" style={{ maxHeight: '420px' }}>

              {/* Risk skoru */}
              <div className={`rounded-xl p-4 border ${rs.bg}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400 font-medium">RİSK SKORU</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${rs.bg} ${rs.text}`}>
                    {rs.label}
                  </span>
                </div>
                <div className="flex items-end gap-3">
                  <span className={`text-4xl font-black ${rs.text}`}>{result.risk_score}</span>
                  <span className="text-slate-500 text-sm mb-1">/ 100</span>
                </div>
                {/* Progress bar */}
                <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className={`h-full ${rs.bar} rounded-full transition-all duration-700`}
                    style={{ width: `${result.risk_score}%` }} />
                </div>
                <div className="flex justify-between text-xs text-slate-600 mt-1">
                  <span>Düşük</span><span>Orta</span><span>Yüksek</span><span>Kritik</span>
                </div>
              </div>

              {/* Öncelikli ihtiyaçlar */}
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Öncelikli İhtiyaçlar
                </div>
                <div className="space-y-2">
                  {result.priority_needs?.map((n, i) => (
                    <div key={i} className={`flex items-center gap-3 rounded-lg px-3 py-2 border ${PRIORITY_STYLE[n.priority]}`}>
                      <span className="text-base">{RESOURCE_ICON[n.resource] || '📦'}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold capitalize">{RESOURCE_TR[n.resource] || n.resource}</div>
                        {n.estimated_quantity && (
                          <div className="text-xs opacity-70">
                            ~{n.estimated_quantity.amount?.toLocaleString('tr-TR')} {n.estimated_quantity.unit}
                          </div>
                        )}
                      </div>
                      <span className="text-xs font-bold opacity-80 shrink-0">{PRIORITY_TR[n.priority] || n.priority}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Müdahale planı */}
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Önerilen Müdahale Planı
                </div>
                <ol className="space-y-2">
                  {result.intervention_plan?.map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm text-slate-300">
                      <span className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${rs.bg} ${rs.text} border ${rs.bg}`}>
                        {i + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Meta */}
              <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-700">
                <span>⏱ Tahmini müdahale: <span className="text-slate-400">{result.estimated_response_hours} saat</span></span>
                {result.cross_border_alert && (
                  <span className="text-amber-500 font-medium">⚠️ Sınır ötesi uyarı</span>
                )}
              </div>

              {result.reasoning && (
                <div className="bg-slate-900/50 rounded-lg p-3 text-xs text-slate-400 italic">
                  💬 {result.reasoning}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
