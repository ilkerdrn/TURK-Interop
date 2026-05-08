import React from 'react';

export default function StatCard({ label, value, sub, color = 'text-sky-400' }) {
  return (
    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
      <div className={`text-3xl font-bold ${color}`}>{value ?? '—'}</div>
      <div className="text-sm text-slate-400 mt-1">{label}</div>
      {sub && <div className="text-xs text-slate-500 mt-0.5">{sub}</div>}
    </div>
  );
}
