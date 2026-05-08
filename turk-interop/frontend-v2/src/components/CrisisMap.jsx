import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { SEVERITY, EVENT_TYPE, STATUS } from '../utils/severity';

// Severity'ye göre marker rengi
const SEVERITY_HEX = {
  low:      '#22c55e',
  medium:   '#f59e0b',
  high:     '#f97316',
  critical: '#ef4444'
};

// Severity'ye göre marker boyutu
const SEVERITY_RADIUS = {
  low: 8, medium: 12, high: 16, critical: 22
};

// Haritayı aktif krizlere göre otomatik fit eden yardımcı
function AutoFit({ crises }) {
  const map = useMap();
  useEffect(() => {
    const points = crises
      .filter(c => c.location?.coordinates?.lat && c.location?.coordinates?.lng)
      .map(c => [c.location.coordinates.lat, c.location.coordinates.lng]);
    if (points.length > 0) {
      map.fitBounds(points, { padding: [40, 40], maxZoom: 6 });
    }
  }, [crises, map]);
  return null;
}

export default function CrisisMap({ crises }) {
  // Koordinatı olan krizleri filtrele
  const mappable = crises.filter(
    c => c.location?.coordinates?.lat && c.location?.coordinates?.lng
  );

  return (
    <div className="rounded-xl overflow-hidden border border-slate-700" style={{ height: '420px' }}>
      <MapContainer
        center={[39, 55]}   // Türk Dünyası merkezi
        zoom={4}
        style={{ height: '100%', width: '100%', background: '#0f172a' }}
        zoomControl={true}
      >
        {/* Karanlık tema tile — CartoDB Dark Matter, API key gerektirmez */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          subdomains="abcd"
          maxZoom={19}
        />

        {/* Kriz marker'ları */}
        {mappable.map(crisis => {
          const color  = SEVERITY_HEX[crisis.severity]  || SEVERITY_HEX.low;
          const radius = SEVERITY_RADIUS[crisis.severity] || 10;
          const et     = EVENT_TYPE[crisis.event_type]  || EVENT_TYPE.other;
          const st     = STATUS[crisis.status]          || STATUS.active;

          return (
            <CircleMarker
              key={crisis.id}
              center={[crisis.location.coordinates.lat, crisis.location.coordinates.lng]}
              radius={radius}
              pathOptions={{
                color,
                fillColor: color,
                fillOpacity: crisis.status === 'resolved' ? 0.2 : 0.6,
                weight: crisis.severity === 'critical' ? 2.5 : 1.5,
                opacity: 0.9
              }}
            >
              <Popup className="crisis-popup">
                <div style={{
                  background: '#1e293b', color: '#e2e8f0',
                  borderRadius: '8px', padding: '10px 12px',
                  minWidth: '200px', fontSize: '13px'
                }}>
                  {/* Başlık */}
                  <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '6px' }}>
                    {et.icon} {crisis.title || et.label}
                  </div>

                  {/* Ülke + şehir */}
                  <div style={{ color: '#38bdf8', marginBottom: '4px' }}>
                    📍 {crisis.location.country}{crisis.location.city ? ` — ${crisis.location.city}` : ''}
                  </div>

                  {/* Şiddet + durum */}
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
                    <span style={{
                      background: color + '33', color, border: `1px solid ${color}66`,
                      borderRadius: '20px', padding: '1px 8px', fontSize: '11px', fontWeight: 600
                    }}>
                      {SEVERITY[crisis.severity]?.label || crisis.severity}
                    </span>
                    <span style={{
                      background: '#334155', color: '#94a3b8',
                      borderRadius: '20px', padding: '1px 8px', fontSize: '11px'
                    }}>
                      {st.label}
                    </span>
                  </div>

                  {/* Etkilenen nüfus */}
                  {crisis.affected_people > 0 && (
                    <div style={{ color: '#94a3b8', fontSize: '12px' }}>
                      👥 {crisis.affected_people.toLocaleString('tr-TR')} etkilenen
                    </div>
                  )}

                  {/* Açıklama */}
                  {crisis.description && (
                    <div style={{ color: '#64748b', fontSize: '11px', marginTop: '4px' }}>
                      {crisis.description}
                    </div>
                  )}

                  {/* Zaman */}
                  <div style={{ color: '#475569', fontSize: '11px', marginTop: '6px', borderTop: '1px solid #334155', paddingTop: '4px' }}>
                    {new Date(crisis.timestamp).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' })}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

        <AutoFit crises={mappable} />
      </MapContainer>

      {/* Koordinatsız kriz uyarısı */}
      {crises.length > mappable.length && (
        <div className="text-xs text-slate-500 px-3 py-1.5 bg-slate-800/50 border-t border-slate-700">
          ⚠️ {crises.length - mappable.length} olay koordinat bilgisi olmadığı için haritada gösterilemiyor
        </div>
      )}
    </div>
  );
}
