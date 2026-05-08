import React, { useState } from 'react';
import client from '../api/client';
import { RESOURCE_TR, DISASTER_TR, SEVERITY_TR } from '../utils/tr';

const SAMPLES = {
  TR: {
    label: "🇹🇷 Türkiye — AFAD",
    hint: "TR",
    data: {
      ulke: "TR",
      afet_turu: "deprem",
      siddet: "kritik",
      etkilenen_kisi: 125000,
      ihtiyaclar: ["arama_kurtarma", "tibbi_yardim", "barinma"],
      mudahale_suresi: "2 saat"
    }
  },
  AZ: {
    label: "🇦🇿 Azerbaycan — FHN",
    hint: "AZ",
    data: {
      country_code: "AZ",
      event: "flood",
      level: 3,
      affected: 34000,
      needs: ["rescue", "shelter", "water"],
      eta_hours: 4
    }
  },
  KZ: {
    label: "🇰🇿 Kazakistan — DSM",
    hint: "KZ",
    data: {
      ISO: "KZ",
      crisis_type: "epidemic",
      risk_score: 78,
      population_impacted: 520000,
      required_resources: ["medical", "food"],
      response_eta: "PT6H"
    }
  }
};

const SEVERITY_COLOR = {
  low: 'text-emerald-400', medium: 'text-amber-400',
  high: 'text-orange-400', critical: 'text-red-400'
};

const RESOURCE_ICON = {
  rescue: '🚁', medical: '🏥', shelter: '⛺',
  water: '💧', food: '🍱', logistics: '🚛', other: '📦'
};

export default function NormalizerPanel() {
  const [selected,  setSelected]  = useState('TR');
  const [rawInput,  setRawInput]  = useState(JSON.stringify(SAMPLES.TR.data, null, 2));
  const [hint,      setHint]      = useState('TR');
  const [result,    setResult]    = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);

  const selectSample = (key) => {
    setSelected(key);
    setRawInput(JSON.stringify(SAMPLES[key].data, null, 2));
    setHint(SAMPLES[key].hint);
    setResult(null);
    setError(null);
  };

  const handleNormalize = async () => {
    setLoading(true);
    setError(null);
    try {
      const parsed = JSON.parse(rawInput);
      const res = await client.post('/normalize', { data: parsed, country_hint: hint || null });
      setResult(res.data);
    } catch (e) {
      setError(e.message.includes('JSON') ? 'Geçersiz JSON formatı' : e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Örnek seçici */}
      <div className="flex gap-2 flex-wrap">
        {Object.entries(SAMPLES).map(([key, s]) => (
          <button key={key} onClick={() => selectSample(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
              selected === key
                ? 'bg-sky-600 border-sky-500 text-white'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
            }`}>
            {s.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Sol: Ham veri girişi */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              📥 Ham Veri Girişi
            </span>
            <div className="flex items-center gap-2">
              <input
                value={hint}
                onChange={e => setHint(e.target.value.toUpperCase().slice(0,2))}
                placeholder="TR"
                maxLength={2}
                className="w-12 text-center bg-slate-900 border border-slate-600 rounded px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-sky-500"
              />
              <span className="text-xs text-slate-500">ülke kodu</span>
            </div>
          </div>
          <textarea
            value={rawInput}
            onChange={e => setRawInput(e.target.value)}
            className="w-full bg-transparent p-4 text-xs text-slate-300 font-mono resize-none focus:outline-none"
            rows={14}
            spellCheck={false}
          />
          <div className="px-4 py-3 border-t border-slate-700">
            <button onClick={handleNormalize} disabled={loading}
              className="w-full py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-sm font-semibold text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {loading
                ? <><span className="animate-spin">↻</span> Dönüştürülüyor...</>
                : '⚡ Normalize Et'}
            </button>
          </div>
        </div>

        {/* Sağ: Normalize edilmiş çıktı */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-700">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              📤 TI-DS v1 — Ortak Model
            </span>
          </div>

          {error && (
            <div className="m-4 bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
              ⚠️ {error}
            </div>
          )}

          {!result && !error && (
            <div className="flex flex-col items-center justify-center h-48 text-slate-600 text-sm gap-2">
              <span className="text-3xl">🔄</span>
              Sol taraftaki veriyi normalize etmek için butona bas
            </div>
          )}

          {result && (
            <div className="p-4 space-y-3">
              {/* Ana alanlar */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Ülke',        value: result.country,                                    color: 'text-sky-400' },
                  { label: 'Afet Türü',   value: DISASTER_TR[result.disaster_type] || result.disaster_type, color: 'text-slate-200' },
                  { label: 'Şiddet',      value: SEVERITY_TR[result.severity] || result.severity,   color: SEVERITY_COLOR[result.severity] },
                  { label: 'Kaynak',      value: result.source_format,                              color: 'text-slate-400' },
                ].map(f => (
                  <div key={f.label} className="bg-slate-900/50 rounded-lg p-2.5">
                    <div className="text-xs text-slate-500 mb-0.5">{f.label}</div>
                    <div className={`text-sm font-semibold ${f.color}`}>{f.value}</div>
                  </div>
                ))}
              </div>

              {/* Etkilenen */}
              <div className="bg-slate-900/50 rounded-lg p-3 flex items-center justify-between">
                <span className="text-xs text-slate-500">Etkilenen Kişi</span>
                <span className="text-lg font-bold text-violet-400">
                  {result.people_affected.toLocaleString('tr-TR')}
                </span>
              </div>

              {/* Müdahale süresi */}
              <div className="bg-slate-900/50 rounded-lg p-3 flex items-center justify-between">
                <span className="text-xs text-slate-500">Müdahale Süresi</span>
                <span className="text-sm font-semibold text-slate-200">{result.response_time}</span>
              </div>

              {/* Kaynaklar */}
              {result.resources_needed?.length > 0 && (
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <div className="text-xs text-slate-500 mb-2">Gerekli Kaynaklar</div>
                  <div className="flex flex-wrap gap-2">
                    {result.resources_needed.map(r => (
                      <span key={r} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-700 text-xs text-slate-300">
                        {RESOURCE_ICON[r] || '📦'} {RESOURCE_TR[r] || r}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* ID + zaman */}
              <div className="text-xs text-slate-600 space-y-0.5 pt-1 border-t border-slate-700">
                <div>ID: <span className="font-mono">{result.id}</span></div>
                <div>Normalize: {new Date(result.normalized_at).toLocaleString('tr-TR')}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
