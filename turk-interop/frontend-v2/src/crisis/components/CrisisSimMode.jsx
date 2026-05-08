import React, { useState, useEffect, useRef } from 'react';

const SCENARIOS = {
  earthquake: {
    label: '🌍 Deprem', color: '#ef4444',
    phases: [
      { t: 'T0',    label: 'Deprem Anı',        casualties: 0,    affected: 0,      response: 0,  desc: 'M7.8 depremi gerçekleşti. Sismik sensörler tetiklendi.' },
      { t: 'T+1h',  label: 'İlk Müdahale',      casualties: 1200, affected: 250000, response: 15, desc: 'AFAD ekipleri sahaya indi. İlk enkaz çalışmaları başladı.' },
      { t: 'T+6h',  label: 'Tam Mobilizasyon',  casualties: 3400, affected: 850000, response: 62, desc: 'Komşu ülkelerden destek geldi. 12 USAR ekibi aktif.' },
      { t: 'T+24h', label: 'Koordineli Müdahale',casualties: 4200, affected: 1200000,response: 88, desc: 'Uluslararası koordinasyon tam kapasitede. Tahliye merkezleri kuruldu.' },
      { t: 'T+72h', label: 'Stabilizasyon',     casualties: 4800, affected: 1850000, response: 95, desc: 'Arama kurtarma tamamlandı. İnsani yardım dağıtımı devam ediyor.' }
    ]
  },
  flood: {
    label: '🌊 Sel', color: '#3b82f6',
    phases: [
      { t: 'T0',    label: 'Taşkın Başlangıcı', casualties: 0,   affected: 0,      response: 0,  desc: 'Baraj kapasitesi aşıldı. Tahliye uyarısı verildi.' },
      { t: 'T+1h',  label: 'Tahliye',           casualties: 8,   affected: 45000,  response: 20, desc: 'Bot ekipleri devrede. Kıyı bölgeleri tahliye ediliyor.' },
      { t: 'T+6h',  label: 'Kurtarma',          casualties: 22,  affected: 180000, response: 55, desc: 'Hava kurtarma operasyonu başladı. 3 ülkeden destek.' },
      { t: 'T+24h', label: 'Kontrol',           casualties: 35,  affected: 280000, response: 80, desc: 'Su seviyesi düşüyor. Geçici barınaklar kuruldu.' },
      { t: 'T+72h', label: 'İyileşme',          casualties: 38,  affected: 280000, response: 92, desc: 'Altyapı onarımı başladı. Gıda dağıtımı aktif.' }
    ]
  },
  fire: {
    label: '🔥 Yangın', color: '#f97316',
    phases: [
      { t: 'T0',    label: 'Yangın Çıkışı',     casualties: 0,  affected: 0,     response: 0,  desc: 'Sanayi bölgesinde yangın tespit edildi.' },
      { t: 'T+1h',  label: 'İlk Müdahale',      casualties: 3,  affected: 8000,  response: 25, desc: 'İtfaiye ekipleri sahada. Tahliye başladı.' },
      { t: 'T+6h',  label: 'Kontrol Altında',   casualties: 9,  affected: 35000, response: 65, desc: 'Yangın %40 kontrol altında. Hava desteği aktif.' },
      { t: 'T+24h', label: 'Söndürme',          casualties: 12, affected: 45000, response: 90, desc: 'Yangın %90 söndürüldü. Hasar tespiti başladı.' },
      { t: 'T+72h', label: 'Temizlik',          casualties: 12, affected: 45000, response: 98, desc: 'Yangın tamamen söndürüldü. Çevre temizliği devam ediyor.' }
    ]
  }
};

export default function CrisisSimMode() {
  const [scenario,  setScenario]  = useState('earthquake');
  const [phase,     setPhase]     = useState(0);
  const [running,   setRunning]   = useState(false);
  const [speed,     setSpeed]     = useState(1500);
  const intervalRef = useRef(null);

  const sc = SCENARIOS[scenario];
  const ph = sc.phases[phase];
  const maxPhase = sc.phases.length - 1;

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setPhase(p => {
          if (p >= maxPhase) { setRunning(false); return p; }
          return p + 1;
        });
      }, speed);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, speed, maxPhase]);

  const reset = () => { setRunning(false); setPhase(0); };
  const successRate = phase > 0 ? Math.round((ph.response / 100) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}>
      {/* Senaryo seçimi */}
      <div style={{ display: 'flex', gap: 8 }}>
        {Object.entries(SCENARIOS).map(([key, s]) => (
          <button key={key} onClick={() => { setScenario(key); reset(); }} style={{
            flex: 1, padding: '8px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
            background: scenario === key ? s.color + '33' : 'rgba(30,41,59,0.8)',
            color: scenario === key ? s.color : '#94a3b8',
            border: `1px solid ${scenario === key ? s.color : 'rgba(51,65,85,0.8)'}`,
            cursor: 'pointer', transition: 'all 0.2s'
          }}>{s.label}</button>
        ))}
      </div>

      {/* Zaman çizelgesi */}
      <div style={{ background: 'rgba(30,41,59,0.8)', borderRadius: 12, padding: 16, border: '1px solid rgba(51,65,85,0.8)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          {sc.phases.map((p, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center', position: 'relative' }}>
              {i < sc.phases.length - 1 && (
                <div style={{
                  position: 'absolute', top: 10, left: '50%', width: '100%', height: 2,
                  background: i < phase ? sc.color : 'rgba(51,65,85,0.8)',
                  transition: 'background 0.5s'
                }} />
              )}
              <div style={{
                width: 20, height: 20, borderRadius: '50%', margin: '0 auto 4px',
                background: i <= phase ? sc.color : 'rgba(51,65,85,0.8)',
                border: `2px solid ${i <= phase ? sc.color : 'rgba(51,65,85,0.8)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, color: '#fff', fontWeight: 700, position: 'relative', zIndex: 1,
                transition: 'all 0.5s', boxShadow: i === phase ? `0 0 10px ${sc.color}` : 'none'
              }}>
                {i < phase ? '✓' : i + 1}
              </div>
              <div style={{ fontSize: 9, color: i <= phase ? sc.color : '#475569', fontWeight: i === phase ? 700 : 400 }}>
                {p.t}
              </div>
            </div>
          ))}
        </div>

        {/* Mevcut faz */}
        <div style={{ background: 'rgba(15,23,42,0.6)', borderRadius: 8, padding: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: sc.color, marginBottom: 4 }}>{ph.label}</div>
          <div style={{ fontSize: 11, color: '#94a3b8' }}>{ph.desc}</div>
        </div>
      </div>

      {/* Metrikler */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {[
          { label: 'Kayıp', value: ph.casualties.toLocaleString('tr-TR'), color: '#ef4444' },
          { label: 'Etkilenen', value: ph.affected.toLocaleString('tr-TR'), color: '#38bdf8' },
          { label: 'Müdahale', value: `%${ph.response}`, color: '#22c55e' }
        ].map(m => (
          <div key={m.label} style={{ background: 'rgba(30,41,59,0.8)', borderRadius: 10, padding: 12, border: '1px solid rgba(51,65,85,0.8)', textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: m.color }}>{m.value}</div>
            <div style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>{m.label}</div>
          </div>
        ))}
      </div>

      {/* Başarı analizi */}
      {phase > 0 && (
        <div style={{ background: 'rgba(30,41,59,0.8)', borderRadius: 12, padding: 14, border: '1px solid rgba(51,65,85,0.8)' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
            Sonuç Analizi
          </div>
          {[
            { label: 'Müdahale Başarısı', value: ph.response, color: '#22c55e' },
            { label: 'Koordinasyon Skoru', value: Math.min(100, ph.response + 5), color: '#38bdf8' },
            { label: 'Zarar Azaltma', value: Math.max(0, 100 - Math.round((ph.casualties / 5000) * 100)), color: '#a78bfa' }
          ].map(m => (
            <div key={m.label} style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>{m.label}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: m.color }}>%{m.value}</span>
              </div>
              <div style={{ height: 4, background: 'rgba(51,65,85,0.8)', borderRadius: 2 }}>
                <div style={{ height: '100%', width: `${m.value}%`, background: m.color, borderRadius: 2, transition: 'width 0.8s ease' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Kontroller */}
      <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
        <button onClick={() => setRunning(r => !r)} style={{
          flex: 2, padding: '10px', borderRadius: 8, fontSize: 13, fontWeight: 700,
          background: running ? '#ef4444' : sc.color, color: '#fff', border: 'none', cursor: 'pointer'
        }}>
          {running ? '⏸ Durdur' : phase === 0 ? '▶ Simülasyonu Başlat' : '▶ Devam Et'}
        </button>
        <button onClick={reset} style={{
          flex: 1, padding: '10px', borderRadius: 8, fontSize: 12, fontWeight: 600,
          background: 'rgba(30,41,59,0.8)', color: '#94a3b8', border: '1px solid rgba(51,65,85,0.8)', cursor: 'pointer'
        }}>↺ Sıfırla</button>
        <select value={speed} onChange={e => setSpeed(Number(e.target.value))} style={{
          padding: '0 8px', borderRadius: 8, fontSize: 11,
          background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(51,65,85,0.8)', color: '#94a3b8'
        }}>
          <option value={3000}>Yavaş</option>
          <option value={1500}>Normal</option>
          <option value={600}>Hızlı</option>
        </select>
      </div>
    </div>
  );
}
