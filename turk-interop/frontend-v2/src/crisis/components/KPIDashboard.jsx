import React from 'react';

function KPICard({ label, value, unit, sub, color, trend }) {
  return (
    <div style={{ background: 'rgba(30,41,59,0.8)', borderRadius: 12, padding: '14px 16px', border: '1px solid rgba(51,65,85,0.8)' }}>
      <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span style={{ fontSize: 28, fontWeight: 900, color }}>{value}</span>
        {unit && <span style={{ fontSize: 12, color: '#64748b' }}>{unit}</span>}
      </div>
      {sub && <div style={{ fontSize: 10, color: '#475569', marginTop: 4 }}>{sub}</div>}
      {trend && (
        <div style={{ fontSize: 10, color: trend > 0 ? '#22c55e' : '#ef4444', marginTop: 4 }}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% geçen aya göre
        </div>
      )}
    </div>
  );
}

function BarChart({ data, color }) {
  const max = Math.max(...data.map(d => d.value));
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 60 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <div style={{
            width: '100%', background: color, borderRadius: '3px 3px 0 0', opacity: 0.7 + (i / data.length) * 0.3,
            height: `${(d.value / max) * 100}%`, minHeight: 2, transition: 'height 0.5s ease'
          }} />
          <span style={{ fontSize: 8, color: '#475569' }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function KPIDashboard({ events }) {
  const active    = events.filter(e => e.status === 'active').length;
  const resolved  = events.filter(e => e.status === 'resolved').length;
  const total     = events.length;
  const totalAff  = events.reduce((s, e) => s + e.affected, 0);
  const totalCas  = events.reduce((s, e) => s + e.casualties, 0);
  const avgTeams  = total > 0 ? Math.round(events.reduce((s, e) => s + e.teams, 0) / total) : 0;
  const resRate   = total > 0 ? Math.round((resolved / total) * 100) : 0;
  const damageRed = totalAff > 0 ? Math.round((1 - totalCas / totalAff) * 100) : 99;

  const responseData = [
    { label: 'TR', value: 2  },
    { label: 'AZ', value: 4  },
    { label: 'KZ', value: 6  },
    { label: 'UZ', value: 3  },
    { label: 'TM', value: 8  },
    { label: 'KG', value: 12 }
  ];

  const coordData = [
    { label: 'Pzt', value: 72 },
    { label: 'Sal', value: 78 },
    { label: 'Çar', value: 65 },
    { label: 'Per', value: 88 },
    { label: 'Cum', value: 91 },
    { label: 'Cmt', value: 85 },
    { label: 'Paz', value: 94 }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, height: '100%', overflowY: 'auto' }}>
      {/* Ana KPI'lar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        <KPICard label="Müdahale Süresi" value="3.2" unit="saat" color="#38bdf8" sub="Ortalama ilk müdahale" trend={-18} />
        <KPICard label="Koordinasyon" value={`%${resRate > 0 ? Math.min(94, resRate + 60) : 87}`} color="#22c55e" sub="Ülkeler arası skor" trend={12} />
        <KPICard label="Zarar Azaltma" value={`%${damageRed}`} color="#a78bfa" sub="Kayıp/etkilenen oranı" trend={8} />
        <KPICard label="Aktif Olay" value={active} color="#f97316" sub={`${total} toplam · ${resolved} çözüldü`} />
      </div>

      {/* Müdahale süresi grafiği */}
      <div style={{ background: 'rgba(30,41,59,0.8)', borderRadius: 12, padding: 14, border: '1px solid rgba(51,65,85,0.8)' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
          Ülke Bazlı Müdahale Süresi (saat)
        </div>
        <BarChart data={responseData} color="#38bdf8" />
      </div>

      {/* Koordinasyon trendi */}
      <div style={{ background: 'rgba(30,41,59,0.8)', borderRadius: 12, padding: 14, border: '1px solid rgba(51,65,85,0.8)' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
          Haftalık Koordinasyon Skoru
        </div>
        <BarChart data={coordData} color="#22c55e" />
      </div>

      {/* Özet tablo */}
      <div style={{ background: 'rgba(30,41,59,0.8)', borderRadius: 12, padding: 14, border: '1px solid rgba(51,65,85,0.8)' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
          Sistem Özeti
        </div>
        {[
          ['Toplam Etkilenen Nüfus', totalAff.toLocaleString('tr-TR'), '#38bdf8'],
          ['Toplam Kayıp',           totalCas.toLocaleString('tr-TR'), '#ef4444'],
          ['Ortalama Saha Ekibi',    `${avgTeams} ekip/olay`,          '#a78bfa'],
          ['Çözüm Oranı',            `%${resRate}`,                    '#22c55e']
        ].map(([l, v, c]) => (
          <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(51,65,85,0.4)' }}>
            <span style={{ fontSize: 11, color: '#94a3b8' }}>{l}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: c }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
