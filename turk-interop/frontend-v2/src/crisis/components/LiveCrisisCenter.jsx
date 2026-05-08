import React, { useState } from 'react';
import { TYPE_META, SEV_META } from '../data/crisisStore';

const RISK_COLOR = { critical: '#ef4444', high: '#f97316', medium: '#f59e0b', low: '#22c55e' };

function StatusDot({ status, color }) {
  if (status !== 'active') return null;
  return (
    <span style={{
      display: 'inline-block',
      width: 7, height: 7, borderRadius: '50%',
      background: color, flexShrink: 0,
      boxShadow: `0 0 6px ${color}`
    }} />
  );
}

function EventCard({ ev, selected, onClick }) {
  const tm  = TYPE_META[ev.type]     || TYPE_META.other;
  const sm  = SEV_META[ev.severity]  || SEV_META.low;
  const age = Math.floor((Date.now() - ev.timestamp) / 60000);
  const ageStr = age < 60 ? `${age}dk önce` : `${Math.floor(age / 60)}sa önce`;

  return (
    <div
      onClick={onClick}
      style={{
        background: selected ? sm.bg : 'rgba(30,41,59,0.7)',
        border: `1px solid ${selected ? sm.border : 'rgba(51,65,85,0.6)'}`,
        borderRadius: 10,
        padding: '12px 14px',
        cursor: 'pointer',
        transition: 'border-color 0.15s, background 0.15s',
        /* KRİTİK: position static, overflow visible — iç içe geçmeyi önler */
        position: 'static',
        overflow: 'visible',
        flexShrink: 0   /* flex child olarak ezilmesin */
      }}
    >
      {/* Satır 1: ikon + başlık + durum noktası */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 18, lineHeight: 1, flexShrink: 0 }}>{tm.icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 12, color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {ev.country} — {ev.city}
          </div>
          <div style={{ fontSize: 10, color: '#64748b', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {ev.description}
          </div>
        </div>
        <StatusDot status={ev.status} color={sm.color} />
      </div>

      {/* Satır 2: badge'ler */}
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 8 }}>
        <span style={{
          padding: '1px 7px', borderRadius: 4, fontSize: 9, fontWeight: 700,
          background: sm.bg, color: sm.color, border: `1px solid ${sm.border}`
        }}>{sm.label}</span>
        <span style={{
          padding: '1px 7px', borderRadius: 4, fontSize: 9,
          background: 'rgba(51,65,85,0.6)', color: '#94a3b8'
        }}>{tm.label}</span>
        <span style={{
          padding: '1px 7px', borderRadius: 4, fontSize: 9,
          background: ev.status === 'active'
            ? 'rgba(239,68,68,0.12)'
            : ev.status === 'monitoring'
            ? 'rgba(245,158,11,0.12)'
            : 'rgba(100,116,139,0.15)',
          color: ev.status === 'active' ? '#f87171'
            : ev.status === 'monitoring' ? '#fbbf24'
            : '#64748b'
        }}>
          {ev.status === 'active' ? 'AKTİF' : ev.status === 'monitoring' ? 'İZLENİYOR' : 'ÇÖZÜLDÜ'}
        </span>
      </div>

      {/* Satır 3: metrikler */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
        <div style={{ background: 'rgba(15,23,42,0.5)', borderRadius: 6, padding: '5px 8px' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#38bdf8' }}>
            {ev.affected.toLocaleString('tr-TR')}
          </div>
          <div style={{ fontSize: 9, color: '#475569' }}>Etkilenen</div>
        </div>
        <div style={{ background: 'rgba(15,23,42,0.5)', borderRadius: 6, padding: '5px 8px' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#f87171' }}>
            {ev.casualties.toLocaleString('tr-TR')}
          </div>
          <div style={{ fontSize: 9, color: '#475569' }}>Kayıp</div>
        </div>
      </div>

      {/* Satır 4: alt bilgi */}
      <div style={{ marginTop: 7, fontSize: 9, color: '#475569', display: 'flex', justifyContent: 'space-between' }}>
        <span>{ev.teams} ekip sahada</span>
        <span>{ageStr}</span>
      </div>
    </div>
  );
}

export default function LiveCrisisCenter({ events, countryRisk, onSelectEvent, selectedEvent }) {
  const [filter, setFilter] = useState('all');

  const filtered = events.filter(ev => {
    if (filter === 'active')   return ev.status === 'active';
    if (filter === 'critical') return ev.severity === 'critical' || ev.severity === 'high';
    return true;
  });

  return (
    /* Dış kapsayıcı: tam yükseklik, flex column, taşma yok */
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100%', minHeight: 0, gap: 10
    }}>

      {/* Ülke risk grid — sabit yükseklik */}
      <div style={{ flexShrink: 0 }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 7 }}>
          Ülke Risk Durumu
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 5 }}>
          {Object.entries(countryRisk).map(([country, risk]) => (
            <div key={country} style={{
              background: 'rgba(30,41,59,0.7)', borderRadius: 7, padding: '7px 9px',
              border: `1px solid ${RISK_COLOR[risk.level]}2a`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: 12, color: '#e2e8f0' }}>{country}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: RISK_COLOR[risk.level] }}>{risk.score}</span>
              </div>
              <div style={{ marginTop: 4, height: 2, background: 'rgba(51,65,85,0.7)', borderRadius: 1 }}>
                <div style={{
                  height: '100%', width: `${risk.score}%`,
                  background: RISK_COLOR[risk.level], borderRadius: 1,
                  transition: 'width 1s ease'
                }} />
              </div>
              <div style={{ fontSize: 8, color: '#475569', marginTop: 3 }}>
                {risk.trend === 'up' ? '↑' : risk.trend === 'down' ? '↓' : '→'} {risk.level.toUpperCase()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filtre bar — sabit yükseklik */}
      <div style={{ display: 'flex', gap: 5, alignItems: 'center', flexShrink: 0 }}>
        {[['all', 'Tümü'], ['active', 'Aktif'], ['critical', 'Kritik']].map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)} style={{
            padding: '3px 10px', borderRadius: 5, fontSize: 10, fontWeight: 600,
            background: filter === v ? '#0284c7' : 'rgba(30,41,59,0.7)',
            color: filter === v ? '#fff' : '#94a3b8',
            border: `1px solid ${filter === v ? '#0284c7' : 'rgba(51,65,85,0.6)'}`,
            cursor: 'pointer'
          }}>{l}</button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 10, color: '#475569' }}>
          {filtered.length} olay
        </span>
      </div>

      {/* Kart listesi — kalan alanı kaplar, scroll edilebilir */}
      <div style={{
        flex: 1,
        minHeight: 0,          /* flex child'ın shrink edebilmesi için şart */
        overflowY: 'auto',
        overflowX: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: 7,
        paddingRight: 2        /* scrollbar için küçük boşluk */
      }}>
        {filtered.map(ev => (
          <EventCard
            key={ev.id}
            ev={ev}
            selected={selectedEvent?.id === ev.id}
            onClick={() => onSelectEvent(ev)}
          />
        ))}
      </div>
    </div>
  );
}
