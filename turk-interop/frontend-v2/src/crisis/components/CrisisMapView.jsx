import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { TYPE_META, SEV_META, EVAC_CENTERS } from '../data/crisisStore';

// Leaflet default icon fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const SEV_RADIUS  = { critical: 22, high: 16, medium: 11, low: 7 };
const SEV_OPACITY = { critical: 0.75, high: 0.65, medium: 0.55, low: 0.45 };

// Haritayı olaylara göre otomatik fit eden yardımcı
function AutoFit({ events }) {
  const map = useMap();
  useEffect(() => {
    const pts = events
      .filter(e => e.lat && e.lng)
      .map(e => [e.lat, e.lng]);
    if (pts.length > 0) {
      map.fitBounds(pts, { padding: [60, 60], maxZoom: 6, animate: true });
    }
  }, []); // sadece mount'ta
  return null;
}

// Tahliye merkezi ikonu
const evacIcon = L.divIcon({
  className: '',
  html: `<div style="
    width:22px;height:22px;border-radius:4px;
    background:rgba(56,189,248,0.2);
    border:1.5px solid #38bdf8;
    display:flex;align-items:center;justify-content:center;
    font-size:12px;
  ">🏕</div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

export default function CrisisMapView({ events, resources }) {
  const [filterCountry, setFilterCountry] = useState('');
  const [filterType,    setFilterType]    = useState('');
  const [filterSev,     setFilterSev]     = useState('');
  const [showEvac,      setShowEvac]      = useState(true);

  const filtered = events.filter(ev => {
    if (filterCountry && ev.country !== filterCountry) return false;
    if (filterType    && ev.type    !== filterType)    return false;
    if (filterSev     && ev.severity !== filterSev)    return false;
    return true;
  });

  const selStyle = {
    padding: '5px 10px', borderRadius: 6, fontSize: 11,
    background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(51,65,85,0.8)',
    color: '#94a3b8', outline: 'none', cursor: 'pointer'
  };

  const toggleStyle = (active) => ({
    padding: '5px 10px', borderRadius: 6, fontSize: 11, cursor: 'pointer',
    background: active ? 'rgba(56,189,248,0.15)' : 'rgba(15,23,42,0.9)',
    border: `1px solid ${active ? '#38bdf8' : 'rgba(51,65,85,0.8)'}`,
    color: active ? '#38bdf8' : '#64748b'
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 10 }}>

      {/* Filtre bar */}
      <div style={{
        display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center',
        background: 'rgba(15,23,42,0.7)', borderRadius: 8, padding: '8px 12px',
        border: '1px solid rgba(51,65,85,0.5)', flexShrink: 0
      }}>
        <select style={selStyle} value={filterCountry} onChange={e => setFilterCountry(e.target.value)}>
          <option value="">Tüm Ülkeler</option>
          {['TR','AZ','KZ','UZ','TM','KG'].map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select style={selStyle} value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="">Tüm Tipler</option>
          {Object.entries(TYPE_META).map(([k,v]) => (
            <option key={k} value={k}>{v.icon} {v.label}</option>
          ))}
        </select>
        <select style={selStyle} value={filterSev} onChange={e => setFilterSev(e.target.value)}>
          <option value="">Tüm Şiddetler</option>
          {['critical','high','medium','low'].map(s => (
            <option key={s} value={s}>{SEV_META[s].label}</option>
          ))}
        </select>
        <button style={toggleStyle(showEvac)} onClick={() => setShowEvac(v => !v)}>
          🏕 Tahliye Merkezleri
        </button>
        <span style={{ marginLeft: 'auto', fontSize: 10, color: '#475569' }}>
          {filtered.length} olay gösteriliyor
        </span>
      </div>

      {/* Harita */}
      <div style={{
        flex: 1, minHeight: 0, borderRadius: 12, overflow: 'hidden',
        border: '1px solid rgba(51,65,85,0.6)',
        boxShadow: '0 0 40px rgba(0,0,0,0.5)'
      }}>
        <MapContainer
          center={[42, 58]}
          zoom={4}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          attributionControl={false}
        >
          {/* Karanlık tema tile */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            subdomains="abcd"
            maxZoom={18}
          />

          <ZoomControl position="bottomright" />

          <AutoFit events={filtered} />

          {/* Tahliye merkezleri */}
          {showEvac && EVAC_CENTERS.map(ec => {
            const pct = Math.round((ec.occupied / ec.capacity) * 100);
            return (
              <Marker key={ec.id} position={[ec.lat, ec.lng]} icon={evacIcon}>
                <Popup className="crisis-popup">
                  <div style={popupStyle}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#38bdf8', marginBottom: 6 }}>
                      🏕 {ec.name}
                    </div>
                    <div style={popupRow}>
                      <span style={popupLabel}>Kapasite</span>
                      <span style={popupVal}>{ec.capacity.toLocaleString('tr-TR')}</span>
                    </div>
                    <div style={popupRow}>
                      <span style={popupLabel}>Doluluk</span>
                      <span style={{ ...popupVal, color: pct > 80 ? '#f87171' : '#22c55e' }}>
                        %{pct}
                      </span>
                    </div>
                    <div style={{ marginTop: 8, height: 4, background: '#1e293b', borderRadius: 2 }}>
                      <div style={{
                        height: '100%', width: `${pct}%`, borderRadius: 2,
                        background: pct > 80 ? '#ef4444' : '#22c55e'
                      }} />
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Kriz olayları */}
          {filtered.map(ev => {
            const tm  = TYPE_META[ev.type]    || TYPE_META.other;
            const sm  = SEV_META[ev.severity] || SEV_META.low;
            const r   = SEV_RADIUS[ev.severity]  || 8;
            const op  = SEV_OPACITY[ev.severity] || 0.5;

            return (
              <React.Fragment key={ev.id}>
                {/* Dış halka — etki alanı */}
                {ev.status === 'active' && (
                  <CircleMarker
                    center={[ev.lat, ev.lng]}
                    radius={r + 8}
                    pathOptions={{
                      color: sm.color, fillColor: sm.color,
                      fillOpacity: 0.06, weight: 0.8, opacity: 0.4,
                      dashArray: '4 4'
                    }}
                  />
                )}
                {/* Ana marker */}
                <CircleMarker
                  center={[ev.lat, ev.lng]}
                  radius={r}
                  pathOptions={{
                    color: sm.color,
                    fillColor: sm.color,
                    fillOpacity: op,
                    weight: ev.severity === 'critical' ? 2 : 1.5,
                    opacity: 0.9
                  }}
                >
                  <Popup className="crisis-popup" maxWidth={260}>
                    <div style={popupStyle}>
                      {/* Başlık */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                        <span style={{ fontSize: 20 }}>{tm.icon}</span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13, color: '#f1f5f9' }}>
                            {ev.country} — {ev.city}
                          </div>
                          <div style={{ fontSize: 10, color: '#64748b', marginTop: 1 }}>
                            {ev.description}
                          </div>
                        </div>
                      </div>

                      {/* Badge'ler */}
                      <div style={{ display: 'flex', gap: 5, marginBottom: 10 }}>
                        <span style={{
                          padding: '2px 8px', borderRadius: 4, fontSize: 9, fontWeight: 700,
                          background: sm.bg, color: sm.color, border: `1px solid ${sm.border}`
                        }}>{sm.label}</span>
                        <span style={{
                          padding: '2px 8px', borderRadius: 4, fontSize: 9,
                          background: ev.status === 'active' ? 'rgba(239,68,68,0.15)' : 'rgba(100,116,139,0.15)',
                          color: ev.status === 'active' ? '#f87171' : '#64748b'
                        }}>
                          {ev.status === 'active' ? '● AKTİF' : ev.status === 'monitoring' ? '◐ İZLENİYOR' : '✓ ÇÖZÜLDÜ'}
                        </span>
                      </div>

                      {/* Metrikler */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 8 }}>
                        {[
                          ['Etkilenen', ev.affected.toLocaleString('tr-TR'), '#38bdf8'],
                          ['Kayıp',     ev.casualties.toLocaleString('tr-TR'), '#f87171'],
                          ['Yaralı',    ev.injured.toLocaleString('tr-TR'),    '#fb923c'],
                          ['Ekip',      `${ev.teams} ekip`,                   '#22c55e'],
                        ].map(([l, v, c]) => (
                          <div key={l} style={{ background: 'rgba(15,23,42,0.6)', borderRadius: 6, padding: '6px 8px' }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: c }}>{v}</div>
                            <div style={{ fontSize: 9, color: '#475569' }}>{l}</div>
                          </div>
                        ))}
                      </div>

                      {/* Konum */}
                      <div style={{ fontSize: 9, color: '#475569', borderTop: '1px solid #1e293b', paddingTop: 6 }}>
                        📍 {ev.lat.toFixed(2)}°N, {ev.lng.toFixed(2)}°E · {ev.radius} km etki alanı
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              </React.Fragment>
            );
          })}
        </MapContainer>
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center',
        background: 'rgba(15,23,42,0.7)', borderRadius: 8, padding: '7px 14px',
        border: '1px solid rgba(51,65,85,0.5)', flexShrink: 0
      }}>
        <span style={{ fontSize: 10, color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Şiddet:
        </span>
        {Object.entries(SEV_META).map(([k, v]) => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: v.color, opacity: 0.8 }} />
            <span style={{ fontSize: 10, color: '#64748b' }}>{v.label}</span>
          </div>
        ))}
        <div style={{ width: 1, height: 14, background: 'rgba(51,65,85,0.6)', margin: '0 4px' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: 'rgba(56,189,248,0.3)', border: '1px solid #38bdf8' }} />
          <span style={{ fontSize: 10, color: '#64748b' }}>Tahliye Merkezi</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 14, height: 2, borderTop: '1px dashed rgba(239,68,68,0.5)' }} />
          <span style={{ fontSize: 10, color: '#64748b' }}>Aktif Etki Alanı</span>
        </div>
      </div>

      {/* Leaflet popup dark theme */}
      <style>{`
        .crisis-popup .leaflet-popup-content-wrapper {
          background: #0f172a !important;
          border: 1px solid #1e293b !important;
          border-radius: 10px !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.6) !important;
          padding: 0 !important;
        }
        .crisis-popup .leaflet-popup-content {
          margin: 0 !important;
          width: auto !important;
        }
        .crisis-popup .leaflet-popup-tip {
          background: #0f172a !important;
        }
        .crisis-popup .leaflet-popup-close-button {
          color: #475569 !important;
          font-size: 16px !important;
          top: 6px !important;
          right: 8px !important;
        }
        .leaflet-container {
          background: #0a0f1a !important;
          font-family: 'Segoe UI', sans-serif !important;
        }
        .leaflet-control-zoom a {
          background: rgba(15,23,42,0.9) !important;
          color: #94a3b8 !important;
          border-color: rgba(51,65,85,0.6) !important;
        }
        .leaflet-control-zoom a:hover {
          background: rgba(30,41,59,0.9) !important;
          color: #e2e8f0 !important;
        }
        .leaflet-bar {
          border: 1px solid rgba(51,65,85,0.6) !important;
          border-radius: 6px !important;
          overflow: hidden !important;
        }
      `}</style>
    </div>
  );
}

// Popup içi stil sabitleri
const popupStyle = {
  background: '#0f172a', color: '#e2e8f0',
  borderRadius: 10, padding: '14px 16px', minWidth: 220
};
const popupRow   = { display: 'flex', justifyContent: 'space-between', padding: '3px 0' };
const popupLabel = { fontSize: 11, color: '#64748b' };
const popupVal   = { fontSize: 11, fontWeight: 600, color: '#e2e8f0' };
