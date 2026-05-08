import React, { useState } from 'react';
import client from '../api/client';
import { RISK_STYLE, RESOURCE_ICON } from '../utils/styles';
import { RESOURCE_TR, PRIORITY_TR, DISASTER_TR, SEVERITY_TR, ENGINE_TR } from '../utils/tr';

const COUNTRIES = ['TR', 'AZ', 'KZ', 'UZ', 'TM', 'KG'];

const DISASTER_OPTIONS = [
  { value: '',           label: 'Otomatik Seçim' },
  { value: 'earthquake', label: 'Deprem' },
  { value: 'flood',      label: 'Sel / Taşkın' },
  { value: 'fire',       label: 'Yangın' },
  { value: 'epidemic',   label: 'Salgın Hastalık' },
  { value: 'storm',      label: 'Fırtına' },
  { value: 'drought',    label: 'Kuraklık' },
];

const SEVERITY_OPTIONS = [
  { value: '',         label: 'Otomatik Değerlendirme' },
  { value: 'low',      label: 'Düşük Risk' },
  { value: 'medium',   label: 'Orta Risk' },
  { value: 'high',     label: 'Yüksek Risk' },
  { value: 'critical', label: 'Kritik Risk' },
];


// ── Yardımcı bileşenler ───────────────────────────────────────────────────────

function Label({ children }) {
  return (
    <label style={{
      display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em',
      textTransform: 'uppercase', color: '#64748b', marginBottom: 6
    }}>
      {children}
    </label>
  );
}

function Select({ value, onChange, children }) {
  return (
    <select value={value} onChange={onChange} style={{
      width: '100%', padding: '9px 12px', borderRadius: 8, fontSize: 13,
      background: '#0f172a', border: '1px solid #1e293b', color: '#e2e8f0',
      outline: 'none', cursor: 'pointer', appearance: 'none',
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2364748b' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
      backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center'
    }}>
      {children}
    </select>
  );
}

function MetricRow({ label, value, color = '#e2e8f0', border = true }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '10px 0',
      borderBottom: border ? '1px solid rgba(30,41,59,0.8)' : 'none'
    }}>
      <span style={{ fontSize: 12, color: '#64748b' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color }}>{value}</span>
    </div>
  );
}

function RiskBar({ score, level }) {
  const rs = RISK_STYLE[level] || RISK_STYLE.medium;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Risk Skoru
        </span>
        <span style={{ fontSize: 11, fontWeight: 700, color: rs.text.replace('text-', '') }}>
          <span className={rs.text}>{score} / 100</span>
        </span>
      </div>
      <div style={{ height: 6, background: '#1e293b', borderRadius: 3, overflow: 'hidden' }}>
        <div className={rs.bar} style={{ height: '100%', width: `${score}%`, borderRadius: 3, transition: 'width 0.8s ease' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        {['Düşük', 'Orta', 'Yüksek', 'Kritik'].map(l => (
          <span key={l} style={{ fontSize: 9, color: '#334155' }}>{l}</span>
        ))}
      </div>
    </div>
  );
}

function SectionHeader({ children }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
      color: '#334155', borderBottom: '1px solid #1e293b', paddingBottom: 8, marginBottom: 12
    }}>
      {children}
    </div>
  );
}

// ── Ana bileşen ───────────────────────────────────────────────────────────────

export default function SimulatorPanel() {
  const [params,  setParams]  = useState({ country: '', disaster_type: '', severity: '' });
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [history, setHistory] = useState([]);

  const runSim = async () => {
    setLoading(true);
    setError(null);
    try {
      const cleanParams = Object.fromEntries(Object.entries(params).filter(([, v]) => v));
      const res = await client.post('/simulate', cleanParams);
      setResult(res.data);
      setHistory(h => [res.data, ...h.slice(0, 4)]);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const rs = result?.analysis ? RISK_STYLE[result.analysis.risk_level] : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

      {/* ── Üst panel: parametreler ── */}
      <div style={{
        background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px 12px 0 0',
        padding: '20px 24px', borderBottom: 'none'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0' }}>Senaryo Parametreleri</div>
            <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>
              Boş bırakılan alanlar sistem tarafından otomatik belirlenir
            </div>
          </div>
          {result && (
            <div style={{
              fontSize: 10, fontWeight: 600, color: '#475569', padding: '4px 10px',
              background: '#1e293b', borderRadius: 6, border: '1px solid #334155'
            }}>
              {result.engine === 'llm-gpt4o-mini' ? '✦ GPT-4o mini' : '⚙ Kural Motoru'}
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          <div>
            <Label>Ülke</Label>
            <Select value={params.country} onChange={e => setParams(p => ({ ...p, country: e.target.value }))}>
              <option value="">Otomatik Seçim</option>
              {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
          </div>
          <div>
            <Label>Afet Türü</Label>
            <Select value={params.disaster_type} onChange={e => setParams(p => ({ ...p, disaster_type: e.target.value }))}>
              {DISASTER_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </Select>
          </div>
          <div>
            <Label>Risk Seviyesi</Label>
            <Select value={params.severity} onChange={e => setParams(p => ({ ...p, severity: e.target.value }))}>
              {SEVERITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </Select>
          </div>
        </div>
      </div>

      {/* ── Çalıştır butonu ── */}
      <button onClick={runSim} disabled={loading} style={{
        width: '100%', padding: '13px', fontSize: 13, fontWeight: 700,
        background: loading ? '#1e293b' : '#0f4c81',
        color: loading ? '#475569' : '#e2e8f0',
        border: '1px solid #1e293b', borderTop: '1px solid #0284c7',
        cursor: loading ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        transition: 'all 0.2s', letterSpacing: '0.03em'
      }}>
        {loading
          ? <><span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>◌</span> Senaryo Üretiliyor...</>
          : '▶  Simülasyonu Çalıştır'
        }
      </button>

      {/* ── Hata ── */}
      {error && (
        <div style={{
          padding: '12px 16px', background: 'rgba(239,68,68,0.05)',
          border: '1px solid rgba(239,68,68,0.2)', borderTop: 'none',
          fontSize: 12, color: '#f87171'
        }}>
          ⚠ {error}
        </div>
      )}

      {/* ── Sonuç ── */}
      {result && rs && (
        <div style={{
          border: '1px solid #1e293b', borderTop: 'none',
          borderRadius: '0 0 12px 12px', overflow: 'hidden'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>

            {/* Sol: Senaryo detayı */}
            <div style={{ padding: '20px 24px', borderRight: '1px solid #1e293b', background: '#0a0f1a' }}>
              <SectionHeader>Üretilen Senaryo</SectionHeader>

              {/* Başlık satırı */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div className={`${rs.bg} ${rs.border}`} style={{
                  padding: '3px 10px', borderRadius: 4, border: '1px solid',
                  display: 'inline-flex', alignItems: 'center', gap: 6
                }}>
                  <span className={rs.text} style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em' }}>
                    {SEVERITY_TR[result.analysis.risk_level]?.toUpperCase() || result.analysis.risk_level.toUpperCase()}
                  </span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#cbd5e1' }}>
                  {result.scenario.country} — {result.scenario.city}
                </span>
              </div>

              {result.scenario.description && (
                <div style={{
                  fontSize: 12, color: '#64748b', marginBottom: 16,
                  padding: '10px 12px', background: '#0f172a', borderRadius: 6,
                  borderLeft: '3px solid #1e293b'
                }}>
                  {result.scenario.description}
                </div>
              )}

              <MetricRow label="Afet Türü"       value={DISASTER_TR[result.scenario.disaster_type] || result.scenario.disaster_type} />
              <MetricRow label="Etkilenen Nüfus" value={result.scenario.people_affected?.toLocaleString('tr-TR')} color="#38bdf8" />
              <MetricRow label="Müdahale Süresi" value={result.scenario.response_time} />
              {result.scenario.casualties > 0 && (
                <MetricRow label="Tahmini Kayıp" value={result.scenario.casualties.toLocaleString('tr-TR')} color="#f87171" />
              )}
              {result.scenario.injured > 0 && (
                <MetricRow label="Tahmini Yaralı" value={result.scenario.injured.toLocaleString('tr-TR')} color="#fb923c" />
              )}
              <MetricRow label="Veri Kaynağı" value={ENGINE_TR[result.engine] || result.engine} border={false} />

              {/* Gerekli kaynaklar */}
              {result.scenario.resources_needed?.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                    Gerekli Kaynaklar
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {result.scenario.resources_needed.map(r => (
                      <span key={r} style={{
                        padding: '4px 10px', borderRadius: 4, fontSize: 11,
                        background: '#0f172a', border: '1px solid #1e293b', color: '#94a3b8',
                        display: 'flex', alignItems: 'center', gap: 5
                      }}>
                        <span>{RESOURCE_ICON[r] || '▪'}</span> {RESOURCE_TR[r] || r}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sağ: Analiz */}
            <div style={{ padding: '20px 24px', background: '#0a0f1a' }}>
              <SectionHeader>Risk Analizi</SectionHeader>

              <div style={{ marginBottom: 20 }}>
                <RiskBar score={result.analysis.risk_score} level={result.analysis.risk_level} />
              </div>

              <MetricRow label="Tahmini Müdahale" value={`${result.analysis.estimated_response_hours} saat`} color="#38bdf8" />
              <MetricRow
                label="Sınır Ötesi Uyarı"
                value={result.analysis.cross_border_alert ? 'Gerekli' : 'Gerekli Değil'}
                color={result.analysis.cross_border_alert ? '#fbbf24' : '#475569'}
              />

              {/* Müdahale planı */}
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                  Önerilen Müdahale Adımları
                </div>
                <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {result.analysis.intervention_plan?.map((step, i) => (
                    <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{
                        minWidth: 20, height: 20, borderRadius: 4, background: '#1e293b',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, fontWeight: 700, color: '#475569', flexShrink: 0
                      }}>{i + 1}</span>
                      <span style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Geçmiş simülasyonlar ── */}
      {history.length > 1 && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            Önceki Simülasyonlar
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {history.slice(1).map((h, i) => {
              const hrs = RISK_STYLE[h.analysis.risk_level] || RISK_STYLE.medium;
              return (
                <button key={h.simulation_id} onClick={() => setResult(h)} style={{
                  flex: 1, padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                  background: result?.simulation_id === h.simulation_id ? '#0f172a' : '#0a0f1a',
                  border: `1px solid ${result?.simulation_id === h.simulation_id ? '#334155' : '#1e293b'}`,
                  textAlign: 'left', transition: 'all 0.15s'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                    <span className={hrs.text} style={{ fontSize: 12, fontWeight: 700 }}>
                      {h.analysis.risk_score}
                    </span>
                    <span style={{ fontSize: 11, color: '#475569' }}>{h.scenario.country}</span>
                  </div>
                  <div style={{ fontSize: 10, color: '#334155', textTransform: 'capitalize' }}>
                    {DISASTER_TR[h.scenario.disaster_type] || h.scenario.disaster_type}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
