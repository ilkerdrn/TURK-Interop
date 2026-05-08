import React from 'react';
import { SEVERITY } from '../utils/severity';

export default function CountrySummary({ summary }) {
  if (!summary?.countries?.length) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {summary.countries.map((c) => {
        // En yüksek severity'yi bul
        const topSeverity = ['critical', 'high', 'medium', 'low'].find(s => c.by_severity?.[s]);
        const sev = SEVERITY[topSeverity] || SEVERITY.low;
        return (
          <div key={c.country}
            className={`rounded-xl p-3 border ${sev.border} ${sev.bg} text-center`}>
            <div className={`text-xl font-bold ${sev.text}`}>{c.country}</div>
            <div className="text-xs text-slate-400 mt-1">{c.total} olay</div>
            <div className="text-xs text-slate-500">{c.affected_people.toLocaleString('tr-TR')} etkilenen</div>
          </div>
        );
      })}
    </div>
  );
}
