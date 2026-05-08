import React, { useState } from 'react';
import { RESOURCES, INITIAL_EVENTS } from '../data/crisisStore';

const STATUS_STYLE = {
  deployed: { color: '#22c55e', label: 'Sahada'   },
  transit:  { color: '#f59e0b', label: 'Yolda'    },
  standby:  { color: '#64748b', label: 'Hazırda'  }
};

const TYPE_ICON = { USAR: '🚁', Medical: '🏥', Logistics: '🚛', Other: '📦' };

export default function CoordinationPanel({ events }) {
  const [resources, setResources] = useState(RESOURCES);

  // Koordinasyon skoru hesapla
  const activeEvents  = events.filter(e => e.status === 'active').length;
  const deployedCount = resources.filter(r => r.status === 'deployed').length;
  const coordScore    = activeEvents > 0
    ? Math.min(100, Math.round((deployedCount / (activeEvents * 2)) * 100))
    : 100;

  const assignResource = (resourceId, eventId) => {
    setResources(prev => prev.map(r =>
      r.id === resourceId ? { ...r, target: eventId, status: 'transit' } : r
    ));
  };

  // Ülke bazlı görev özeti
  const byCountry = resources.reduce((acc, r) => {
    if (!acc[r.country]) acc[r.country] = { deployed: 0, transit: 0, standby: 0, total: 0 };
    acc[r.country][r.status]++;
    acc[r.country].total++;
    return acc;
  }, {});

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}>
      {/* Koordinasyon skoru */}
      <div style={{ background: 'rgba(30,41,59,0.8)', borderRadius: 12, padding: 16, border: '1px solid rgba(51,65,85,0.8)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>KOORDİNASYON SKORU</span>
          <span style={{ fontSize: 24, fontWeight: 900, color: coordScore > 70 ? '#22c55e' : coordScore > 40 ? '#f59e0b' : '#ef4444' }}>
            %{coordScore}
          </span>
        </div>
        <div style={{ height: 6, background: 'rgba(51,65,85,0.8)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 3, transition: 'width 1s ease',
            width: `${coordScore}%`,
            background: coordScore > 70 ? '#22c55e' : coordScore > 40 ? '#f59e0b' : '#ef4444'
          }} />
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
          {[['deployed','Sahada','#22c55e'],['transit','Yolda','#f59e0b'],['standby','Hazırda','#64748b']].map(([s,l,c]) => (
            <div key={s}>
              <span style={{ fontSize: 16, fontWeight: 700, color: c }}>
                {resources.filter(r => r.status === s).length}
              </span>
              <span style={{ fontSize: 10, color: '#475569', marginLeft: 4 }}>{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Ülke bazlı özet */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
          Ülke Katkıları
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
          {Object.entries(byCountry).map(([country, stats]) => (
            <div key={country} style={{ background: 'rgba(30,41,59,0.8)', borderRadius: 8, padding: '8px 10px', border: '1px solid rgba(51,65,85,0.8)' }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#38bdf8', marginBottom: 4 }}>{country}</div>
              <div style={{ fontSize: 10, color: '#64748b' }}>{stats.total} kaynak</div>
              <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                {stats.deployed > 0 && <span style={{ fontSize: 9, color: '#22c55e' }}>●{stats.deployed}</span>}
                {stats.transit  > 0 && <span style={{ fontSize: 9, color: '#f59e0b' }}>●{stats.transit}</span>}
                {stats.standby  > 0 && <span style={{ fontSize: 9, color: '#64748b' }}>●{stats.standby}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Kaynak listesi */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
          Kaynaklar
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {resources.map(r => {
            const ss  = STATUS_STYLE[r.status];
            const target = events.find(e => e.id === r.target);
            return (
              <div key={r.id} style={{ background: 'rgba(30,41,59,0.8)', borderRadius: 8, padding: '10px 12px', border: '1px solid rgba(51,65,85,0.8)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 18 }}>{TYPE_ICON[r.type] || '📦'}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {r.name}
                  </div>
                  <div style={{ fontSize: 10, color: '#64748b' }}>
                    {r.country} · {r.count} birim
                    {target && <span style={{ color: '#38bdf8' }}> → {target.city}</span>}
                  </div>
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, color: ss.color, whiteSpace: 'nowrap' }}>
                  ● {ss.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
