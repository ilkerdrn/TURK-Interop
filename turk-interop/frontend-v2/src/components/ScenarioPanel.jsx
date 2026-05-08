import React, { useState, useEffect } from 'react';
import client from '../api/client';
import { SEVERITY, EVENT_TYPE } from '../utils/severity';
import { RESOURCE_TR, PRIORITY_TR } from '../utils/tr';

const PRIORITY_COLOR = {
  immediate: 'text-red-400 bg-red-500/10 border-red-500/30',
  '24h':     'text-amber-400 bg-amber-500/10 border-amber-500/30',
  '48h':     'text-sky-400 bg-sky-500/10 border-sky-500/30'
};

const NEED_ICON = {
  rescue: '🚁', medical: '🏥', shelter: '⛺', water: '💧', food: '🍱'
};

export default function ScenarioPanel() {
  const [scenarios, setScenarios] = useState([]);
  const [selected,  setSelected]  = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  useEffect(() => {
    client.get('/scenarios')
      .then(r => { setScenarios(r.data.scenarios); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-12 text-slate-500 gap-2">
      <span className="animate-spin">↻</span> Senaryolar yükleniyor...
    </div>
  );

  if (error) return (
    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
      ⚠️ {error}
    </div>
  );

  const active = selected || scenarios[0];

  return (
    <div className="space-y-4">
      {/* Senaryo seçici */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {scenarios.map(s => {
          const sev = SEVERITY[s.severity] || SEVERITY.low;
          const et  = EVENT_TYPE[s.event_type] || EVENT_TYPE.other;
          const isActive = active?.id === s.id;
          return (
            <button key={s.id} onClick={() => setSelected(s)}
              className={`text-left rounded-xl p-4 border transition-all ${
                isActive
                  ? `${sev.bg} ${sev.border} ring-1 ring-offset-0`
                  : 'bg-slate-800/50 border-slate-700 hover:border-slate-500'
              }`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{et.icon}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${sev.bg} ${sev.text} ${sev.border}`}>
                  {sev.label}
                </span>
              </div>
              <div className="font-semibold text-sm text-slate-100">{s.title}</div>
              <div className="text-xs text-slate-400 mt-0.5">
                📍 {s.country} — {s.city}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                👥 {s.affected_people.toLocaleString('tr-TR')} etkilenen
              </div>
            </button>
          );
        })}
      </div>

      {/* Detay paneli */}
      {active && <ScenarioDetail scenario={active} />}
    </div>
  );
}

function ScenarioDetail({ scenario: s }) {
  const sev = SEVERITY[s.severity] || SEVERITY.low;
  const et  = EVENT_TYPE[s.event_type] || EVENT_TYPE.other;

  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className={`px-5 py-4 border-b border-slate-700 ${sev.bg}`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{et.icon}</span>
              <span className="font-bold text-slate-100 text-base">{s.title}</span>
            </div>
            <div className="text-sm text-slate-400">{s.description}</div>
          </div>
          <span className={`shrink-0 text-xs font-bold px-3 py-1 rounded-full border ${sev.bg} ${sev.text} ${sev.border}`}>
            {sev.label}
          </span>
        </div>
      </div>

      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Etki verileri */}
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Etki Verileri</div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Etkilenen',   value: s.affected_people, color: 'text-sky-400' },
              { label: 'Kayıp',       value: s.impact.casualties, color: 'text-red-400' },
              { label: 'Yaralı',      value: s.impact.injured, color: 'text-orange-400' },
              { label: 'Yerinden Ed.', value: s.impact.displaced || s.impact.hospitalized, color: 'text-violet-400' }
            ].map(item => (
              <div key={item.label} className="bg-slate-900/50 rounded-lg p-3">
                <div className={`text-lg font-bold ${item.color}`}>
                  {(item.value || 0).toLocaleString('tr-TR')}
                </div>
                <div className="text-xs text-slate-500">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Müdahale süresi */}
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Müdahale Süresi</div>
          <div className="space-y-2">
            {[
              { label: 'Tespit',          value: `${s.response_timeline.detection_minutes} dk` },
              { label: 'İlk bildirim',    value: `${s.response_timeline.first_notification_minutes} dk` },
              { label: 'İlk ekip sahada', value: `${s.response_timeline.first_team_on_site_hours} saat` },
              { label: 'Tam mobilizasyon', value: `${s.response_timeline.full_mobilization_hours} saat` },
              {
                label: s.response_timeline.estimated_rescue_window_hours ? 'Kurtarma penceresi' : 'Kontrol süresi',
                value: s.response_timeline.estimated_rescue_window_hours
                  ? `${s.response_timeline.estimated_rescue_window_hours} saat`
                  : `${s.response_timeline.estimated_containment_days} gün`
              }
            ].map(item => (
              <div key={item.label} className="flex justify-between items-center text-sm">
                <span className="text-slate-400">{item.label}</span>
                <span className="font-semibold text-slate-200 tabular-nums">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* İhtiyaçlar */}
        <div className="md:col-span-2">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">İhtiyaçlar</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {s.needs.map((need, i) => (
              <div key={i} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 border ${PRIORITY_COLOR[need.priority]}`}>
                <span className="text-lg">{NEED_ICON[need.type] || '📦'}</span>
                <div className="min-w-0">
                  <div className="text-sm font-semibold capitalize">{need.type}</div>
                  <div className="text-xs opacity-80 truncate">
                    {need.quantity.toLocaleString('tr-TR')} {need.unit}
                  </div>
                </div>
                <span className="ml-auto text-xs font-bold opacity-70 shrink-0">{need.priority}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-slate-700 flex items-center justify-between text-xs text-slate-500">
        <span>Raporlayan: <span className="text-slate-400 font-medium">{s.reported_by}</span></span>
        <span>{new Date(s.timestamp).toLocaleString('tr-TR', { dateStyle: 'medium', timeStyle: 'short' })}</span>
      </div>
    </div>
  );
}
