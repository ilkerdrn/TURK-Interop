import React, { useState, useEffect } from 'react';
import client from '../../api/client';

const FEED_ITEMS = [
  { type: 'seismic',  msg: 'Sismik aktivite: Doğu Anadolu +0.4 M/s²',  risk: 78, country: 'TR' },
  { type: 'hydro',    msg: 'Kür nehri su seviyesi: +1.2m (kritik eşik)', risk: 65, country: 'AZ' },
  { type: 'bio',      msg: 'Almatı R0 katsayısı: 1.8 (yayılım riski)',  risk: 71, country: 'KZ' },
  { type: 'meteo',    msg: 'Taşkent rüzgar hızı: 85 km/h (yangın riski)',risk: 52, country: 'UZ' },
  { type: 'climate',  msg: 'Aşgabat yağış anomalisi: -%60 (kuraklık)',  risk: 44, country: 'TM' },
  { type: 'seismic',  msg: 'Bişkek bölgesi: M2.1 artçı sarsıntı',      risk: 22, country: 'KG' }
];

const TYPE_ICON = { seismic: '📡', hydro: '🌊', bio: '🦠', meteo: '🌪️', climate: '🏜️' };

function RiskGauge({ score }) {
  const color = score >= 75 ? '#ef4444' : score >= 50 ? '#f97316' : score >= 25 ? '#f59e0b' : '#22c55e';
  const label = score >= 75 ? 'KRİTİK' : score >= 50 ? 'YÜKSEK' : score >= 25 ? 'ORTA' : 'DÜŞÜK';
  const circumference = 2 * Math.PI * 28;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div style={{ position: 'relative', width: 80, height: 80 }}>
      <svg width="80" height="80" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r="28" fill="none" stroke="rgba(51,65,85,0.8)" strokeWidth="6" />
        <circle cx="40" cy="40" r="28" fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(-90 40 40)"
          style={{ transition: 'stroke-dashoffset 1s ease' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 16, fontWeight: 900, color, lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: 7, color: '#64748b', fontWeight: 600 }}>{label}</span>
      </div>
    </div>
  );
}

export default function EarlyWarning({ alerts }) {
  const [feed, setFeed] = useState(FEED_ITEMS);
  const [tick, setTick] = useState(0);
  const [usgsData, setUsgsData] = useState(null);

  // USGS gerçek deprem verisi
  useEffect(() => {
    client.get('/external/earthquakes')
      .then(r => setUsgsData(r.data))
      .catch(() => {}); // sessizce başarısız ol
  }, []);

  useEffect(() => {
    const iv = setInterval(() => {
      setTick(t => t + 1);
      setFeed(prev => prev.map(item => ({
        ...item,
        risk: Math.min(100, Math.max(0, item.risk + (Math.random() - 0.5) * 4))
      })));
    }, 3000);
    return () => clearInterval(iv);
  }, []);

  const avgRisk = Math.round(feed.reduce((s, f) => s + f.risk, 0) / feed.length);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}>
      {/* Genel risk */}
      <div style={{ background: 'rgba(30,41,59,0.8)', borderRadius: 12, padding: 16, border: '1px solid rgba(51,65,85,0.8)', display: 'flex', alignItems: 'center', gap: 16 }}>
        <RiskGauge score={avgRisk} />
        <div>
          <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
            Bölgesel Risk İndeksi
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#f1f5f9', marginTop: 2 }}>
            TURK Dünyası
          </div>
          <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>
            6 ülke · {feed.filter(f => f.risk >= 50).length} yüksek risk bölgesi
          </div>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <div style={{ fontSize: 10, color: '#475569' }}>Son güncelleme</div>
          <div style={{ fontSize: 11, color: '#38bdf8', fontFamily: 'monospace' }}>
            {new Date().toLocaleTimeString('tr-TR')}
          </div>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', marginLeft: 'auto', marginTop: 4, boxShadow: '0 0 6px #22c55e' }} />
        </div>
      </div>

      {/* USGS Gerçek Veri Göstergesi */}
      {usgsData && (
        <div style={{ background: 'rgba(30,41,59,0.8)', borderRadius: 8, padding: '10px 12px', border: '1px solid rgba(51,65,85,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14 }}>📡</span>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#e2e8f0' }}>USGS Canlı Deprem Verisi</div>
              <div style={{ fontSize: 10, color: '#64748b' }}>Son 24 saat · M2.5+ · Türk Dünyası</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#38bdf8' }}>{usgsData.count}</div>
            <div style={{ fontSize: 9, color: '#475569' }}>olay</div>
          </div>
        </div>
      )}

      {/* Sensör feed */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
          Canlı Sensör Verisi
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {feed.map((item, i) => {
            const color = item.risk >= 75 ? '#ef4444' : item.risk >= 50 ? '#f97316' : item.risk >= 25 ? '#f59e0b' : '#22c55e';
            return (
              <div key={i} style={{ background: 'rgba(30,41,59,0.8)', borderRadius: 8, padding: '10px 12px', border: '1px solid rgba(51,65,85,0.8)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 16 }}>{TYPE_ICON[item.type]}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, color: '#e2e8f0', marginBottom: 4 }}>{item.msg}</div>
                  <div style={{ height: 3, background: 'rgba(51,65,85,0.8)', borderRadius: 2 }}>
                    <div style={{ height: '100%', width: `${item.risk}%`, background: color, borderRadius: 2, transition: 'width 1s ease' }} />
                  </div>
                </div>
                <div style={{ textAlign: 'right', minWidth: 40 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color }}>{Math.round(item.risk)}</div>
                  <div style={{ fontSize: 9, color: '#475569' }}>{item.country}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Uyarı akışı */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
          Otomatik Uyarılar
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {alerts.length === 0 && (
            <div style={{ fontSize: 11, color: '#475569', textAlign: 'center', padding: 16 }}>
              Uyarı bekleniyor...
            </div>
          )}
          {alerts.map(a => (
            <div key={a.id} style={{ background: 'rgba(15,23,42,0.6)', borderRadius: 6, padding: '6px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(51,65,85,0.5)' }}>
              <span style={{ fontSize: 11, color: '#cbd5e1' }}>{a.msg}</span>
              <span style={{ fontSize: 9, color: '#475569', whiteSpace: 'nowrap', marginLeft: 8 }}>{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
