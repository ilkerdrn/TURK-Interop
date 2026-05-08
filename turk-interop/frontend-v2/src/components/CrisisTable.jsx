import React from 'react';
import SeverityBadge from './SeverityBadge';
import { STATUS, EVENT_TYPE } from '../utils/severity';

export default function CrisisTable({ crises, onResolve, canEdit }) {
  if (!crises.length) {
    return (
      <div className="text-center py-16 text-slate-500">
        <div className="text-4xl mb-3">🔍</div>
        <div>Filtreyle eşleşen kriz olayı bulunamadı.</div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-700">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-800 text-slate-400 text-left">
            <th className="px-4 py-3 font-medium">Ülke</th>
            <th className="px-4 py-3 font-medium">Olay</th>
            <th className="px-4 py-3 font-medium">Şiddet</th>
            <th className="px-4 py-3 font-medium">Etkilenen</th>
            <th className="px-4 py-3 font-medium">Durum</th>
            <th className="px-4 py-3 font-medium">Tarih</th>
            {canEdit && <th className="px-4 py-3 font-medium">İşlem</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700/50">
          {crises.map((c) => {
            const et  = EVENT_TYPE[c.event_type] || EVENT_TYPE.other;
            const st  = STATUS[c.status] || STATUS.active;
            return (
              <tr key={c.id} className="bg-slate-800/40 hover:bg-slate-800 transition-colors">
                <td className="px-4 py-3">
                  <span className="font-bold text-sky-400">{c.country}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="mr-1.5">{et.icon}</span>
                  <span className="text-slate-200">{et.label}</span>
                  {c.description && (
                    <div className="text-xs text-slate-500 mt-0.5 truncate max-w-[200px]">{c.description}</div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <SeverityBadge level={c.severity} />
                </td>
                <td className="px-4 py-3 text-slate-300">
                  {c.affected_people > 0 ? c.affected_people.toLocaleString('tr-TR') : '—'}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${st.cls}`}>
                    {st.label}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-400 text-xs">
                  {new Date(c.timestamp).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' })}
                </td>
                {canEdit && (
                  <td className="px-4 py-3">
                    {c.status !== 'resolved' && (
                      <button
                        onClick={() => onResolve(c.id)}
                        className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors border border-emerald-500/30"
                      >
                        Çözüldü
                      </button>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
