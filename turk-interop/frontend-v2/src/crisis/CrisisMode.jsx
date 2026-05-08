import React, { useState } from 'react';
import { useLiveData } from './hooks/useLiveData';
import { RESOURCES } from './data/crisisStore';
import LiveCrisisCenter  from './components/LiveCrisisCenter';
import CrisisMapView     from './components/CrisisMapView';
import CoordinationPanel from './components/CoordinationPanel';
import EarlyWarning      from './components/EarlyWarning';
import CrisisSimMode     from './components/CrisisSimMode';
import KPIDashboard      from './components/KPIDashboard';

const TABS = [
  { id: 'center',  label: '🔴 Kriz Merkezi'  },
  { id: 'map',     label: '🗺️ Harita'        },
  { id: 'coord',   label: '🤝 Koordinasyon'  },
  { id: 'warning', label: '⚡ Erken Uyarı'   },
  { id: 'sim',     label: '🎲 Simülasyon'    },
  { id: 'kpi',     label: '📊 KPI'           }
];

export default function CrisisMode({ onExit }) {
  const [activeTab,     setActiveTab]     = useState('center');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const { events, countryRisk, lastUpdate, alerts } = useLiveData();

  const activeCrises  = events.filter(e => e.status === 'active').length;
  const criticalCount = events.filter(e => e.severity === 'critical').length;
  const totalAffected = events.reduce((s, e) => s + e.affected, 0);

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#0a0f1a', zIndex: 1000,
      display: 'flex', flexDirection: 'column', fontFamily: "'Segoe UI', sans-serif"
    }}>
      {/* Üst bar */}
      <div style={{
        background: 'rgba(15,23,42,0.95)', borderBottom: '1px solid rgba(239,68,68,0.3)',
        padding: '0 20px', display: 'flex', alignItems: 'center', gap: 16, height: 52,
        backdropFilter: 'blur(10px)'
      }}>
        {/* Logo + mod */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 8px #ef4444', animation: 'pulse 1.5s infinite' }} />
          <span style={{ fontWeight: 900, fontSize: 14, color: '#ef4444', letterSpacing: 1 }}>KRİZ MODU</span>
          <span style={{ color: 'rgba(51,65,85,0.8)', fontSize: 12 }}>|</span>
          <span style={{ fontWeight: 700, fontSize: 13, color: '#e2e8f0' }}>TURK Interop</span>
        </div>

        {/* Canlı metrikler */}
        <div style={{ display: 'flex', gap: 20, marginLeft: 20 }}>
          {[
            { label: 'AKTİF', value: activeCrises,  color: '#ef4444' },
            { label: 'KRİTİK', value: criticalCount, color: '#f97316' },
            { label: 'ETKİLENEN', value: totalAffected.toLocaleString('tr-TR'), color: '#38bdf8' }
          ].map(m => (
            <div key={m.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 16, fontWeight: 900, color: m.color }}>{m.value}</span>
              <span style={{ fontSize: 9, color: '#475569', fontWeight: 600 }}>{m.label}</span>
            </div>
          ))}
        </div>

        {/* Canlı göstergesi */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
            <span style={{ fontSize: 10, color: '#22c55e', fontWeight: 600 }}>CANLI</span>
          </div>
          <span style={{ fontSize: 10, color: '#475569', fontFamily: 'monospace' }}>
            {new Date(lastUpdate).toLocaleTimeString('tr-TR')}
          </span>
          <button onClick={onExit} style={{
            padding: '5px 12px', borderRadius: 6, fontSize: 11, fontWeight: 600,
            background: 'rgba(239,68,68,0.15)', color: '#f87171',
            border: '1px solid rgba(239,68,68,0.3)', cursor: 'pointer'
          }}>✕ Çıkış</button>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{
        background: 'rgba(15,23,42,0.9)', borderBottom: '1px solid rgba(51,65,85,0.5)',
        display: 'flex', padding: '0 20px', gap: 2
      }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            padding: '10px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
            background: 'transparent', border: 'none',
            color: activeTab === tab.id ? '#38bdf8' : '#64748b',
            borderBottom: `2px solid ${activeTab === tab.id ? '#38bdf8' : 'transparent'}`,
            transition: 'all 0.2s'
          }}>{tab.label}</button>
        ))}
      </div>

      {/* İçerik */}
      <div style={{ flex: 1, overflow: 'hidden', padding: 16, minHeight: 0 }}>
        {activeTab === 'center' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, height: '100%', minHeight: 0 }}>
            {/* Sol: Olay listesi — scroll edilebilir */}
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
              <LiveCrisisCenter events={events} countryRisk={countryRisk}
                onSelectEvent={setSelectedEvent} selectedEvent={selectedEvent} />
            </div>
            {/* Sağ: Detay paneli */}
            <div style={{
              background: 'rgba(15,23,42,0.6)', borderRadius: 12,
              border: '1px solid rgba(51,65,85,0.5)', padding: 16,
              overflowY: 'auto', minHeight: 0
            }}>
              {selectedEvent ? (
                <EventDetail event={selectedEvent} />
              ) : (
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center', height: '100%', color: '#475569', gap: 12
                }}>
                  <div style={{ fontSize: 36, opacity: 0.4 }}>◎</div>
                  <span style={{ fontSize: 12, letterSpacing: '0.05em' }}>Detay için sol panelden bir olay seçin</span>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'map' && (
          <div style={{ height: '100%', minHeight: 0 }}>
            <CrisisMapView events={events} resources={RESOURCES} />
          </div>
        )}

        {activeTab === 'coord' && (
          <div style={{ height: '100%', minHeight: 0, overflowY: 'auto' }}>
            <CoordinationPanel events={events} />
          </div>
        )}

        {activeTab === 'warning' && (
          <div style={{ height: '100%', minHeight: 0, overflowY: 'auto' }}>
            <EarlyWarning alerts={alerts} />
          </div>
        )}

        {activeTab === 'sim' && (
          <div style={{ height: '100%', minHeight: 0, overflowY: 'auto', maxWidth: 760, margin: '0 auto', width: '100%' }}>
            <CrisisSimMode />
          </div>
        )}

        {activeTab === 'kpi' && (
          <div style={{ height: '100%', minHeight: 0, overflowY: 'auto' }}>
            <KPIDashboard events={events} />
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}

function EventDetail({ event }) {
  const age = Math.floor((Date.now() - event.timestamp) / 60000);
  const tm  = { earthquake:'🌍', flood:'🌊', fire:'🔥', epidemic:'🦠', storm:'🌪️', drought:'🏜️', other:'⚠️' };
  const sm  = { critical:'#ef4444', high:'#f97316', medium:'#f59e0b', low:'#22c55e' };
  const sl  = { critical:'KRİTİK', high:'YÜKSEK', medium:'ORTA', low:'DÜŞÜK' };
  const tl  = { earthquake:'Deprem', flood:'Sel', fire:'Yangın', epidemic:'Salgın', storm:'Fırtına', drought:'Kuraklık', other:'Diğer' };

  return (
    <div style={{ color: '#e2e8f0', height: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Başlık */}
      <div style={{ borderBottom: '1px solid rgba(51,65,85,0.5)', paddingBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <span style={{ fontSize: 24 }}>{tm[event.type] || '⚠️'}</span>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>
              {event.country} — {event.city}
            </div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{event.description}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <span style={{
            padding: '3px 10px', borderRadius: 4, fontSize: 10, fontWeight: 700,
            background: `${sm[event.severity]}22`, color: sm[event.severity],
            border: `1px solid ${sm[event.severity]}44`
          }}>{sl[event.severity]}</span>
          <span style={{
            padding: '3px 10px', borderRadius: 4, fontSize: 10,
            background: 'rgba(51,65,85,0.5)', color: '#94a3b8'
          }}>{tl[event.type] || event.type}</span>
          <span style={{
            padding: '3px 10px', borderRadius: 4, fontSize: 10,
            background: event.status === 'active' ? 'rgba(239,68,68,0.15)' : 'rgba(100,116,139,0.15)',
            color: event.status === 'active' ? '#f87171' : '#64748b'
          }}>
            {event.status === 'active' ? '● AKTİF' : event.status === 'monitoring' ? '◐ İZLENİYOR' : '✓ ÇÖZÜLDÜ'}
          </span>
        </div>
      </div>

      {/* Metrikler */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {[
          { label: 'Etkilenen Nüfus', value: event.affected.toLocaleString('tr-TR'), color: '#38bdf8' },
          { label: 'Kayıp',           value: event.casualties.toLocaleString('tr-TR'), color: '#ef4444' },
          { label: 'Yaralı',          value: event.injured.toLocaleString('tr-TR'),    color: '#f97316' },
          { label: 'Saha Ekibi',      value: `${event.teams} ekip`,                   color: '#22c55e' }
        ].map(m => (
          <div key={m.label} style={{
            background: 'rgba(30,41,59,0.6)', borderRadius: 8, padding: '12px 14px',
            border: '1px solid rgba(51,65,85,0.4)'
          }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: m.color, lineHeight: 1 }}>{m.value}</div>
            <div style={{ fontSize: 10, color: '#475569', marginTop: 4 }}>{m.label}</div>
          </div>
        ))}
      </div>

      {/* Konum bilgisi */}
      <div style={{
        background: 'rgba(30,41,59,0.4)', borderRadius: 8, padding: '12px 14px',
        border: '1px solid rgba(51,65,85,0.4)'
      }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
          Konum Bilgisi
        </div>
        {[
          ['Koordinatlar', `${event.lat.toFixed(2)}°N, ${event.lng.toFixed(2)}°E`],
          ['Etki Yarıçapı', `${event.radius} km`],
          ['Olay Zamanı', age < 60 ? `${age} dakika önce` : `${Math.floor(age/60)} saat önce`]
        ].map(([l, v]) => (
          <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid rgba(51,65,85,0.3)' }}>
            <span style={{ fontSize: 11, color: '#64748b' }}>{l}</span>
            <span style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'monospace' }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
