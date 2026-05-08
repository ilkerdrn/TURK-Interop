import React from 'react';
import { SEVERITY } from '../utils/severity';

export default function SeverityBadge({ level }) {
  const s = SEVERITY[level] || SEVERITY.low;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${s.bg} ${s.text} ${s.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}
