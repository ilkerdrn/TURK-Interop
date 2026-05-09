import React, { useState, useEffect, useRef } from 'react';
import client from '../api/client';
import { RESOURCE_TR, PRIORITY_TR, DISASTER_TR, SEVERITY_TR } from '../utils/tr';

const RISK_COLOR = { critical: '#ef4444', high: '#f97316', medium: '#f59e0b', low: '#22c55e' };
const RESOURCE_ICON = { rescue:'🚁', medical:'🏥', shelter:'⛺', water:'💧', food:'🍱', logistics:'🚛', other:'📦' };

export default function ReportModal({ scenario, onClose }) {
  const [report,  setReport]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const printRef = useRef();

  useEffect(() => {
    client.post('/report/generate/scenario', { scenario })
      .then(r => { setReport(r.data); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  const handlePrint = () => {
    const content = printRef.current?.innerHTML;
    if (!content) return;
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>TURK Interop Kriz Raporu</title>
      <style>
        body { font-family: 'Segoe UI', sans-serif; color: #1e293b; padding: 32px; max-width: 800px; margin: 0 auto; }
        h1 { font-size: 20px; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }
        h2 { font-size: 14px; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 24px; }
        .meta { color: #64748b; font-size: 12px; margin-bottom: 24px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 12px 0; }
        .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
        .card .val { font-size: 20px; font-weight: 700; }
        .card .lbl { font-size: 11px; color: #94a3b8; margin-top: 2px; }
        .badge { display: inline-block; padding: 2px 10px; border-radius: 4px; font-size: 11px; font-weight: 700; }
        .need { display: flex; align-items: center; gap: 8px; padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 6px; margin-bottom: 6px; }
        .step { display: flex; gap: 10px; margin-bottom: 8px; font-size: 13px; }
        .step-num { min-width: 22px; height: 22px; border-radius: 4px; background: #f1f5f9; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 11px; }
        .summary { background: #f8fafc; border-left: 3px solid #0284c7; padding: 12px 16px; border-radius: 0 6px 6px 0; font-size: 13px; line-height: 1.6; }
        .risk-bar { height: 8px; background: #e2e8f0; border-radius: 4px; margin-top: 6px; }
        .risk-fill { height: 100%; border-radius: 4px; }
        @media print { body { padding: 16px; } }
      </style></head><body>${content}</body></html>
    `);
    win.document.close();
    win.print();
  };

  const overlay = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
    backdropFilter: 'blur(4px)', zIndex: 2000,
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
  };

  if (loading) return (
    <div style={overlay}>
      <div style={{ background: '#0f172a', borderRadius: 12, padding: 40, border: '1px solid #1e293b', textAlign: 'center', color: '#64748b' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
        <div style={{ fontSize: 13 }}>Rapor hazırlanıyor...</div>
      </div>
    </div>
  );

  if (error) return (
    <div style={overlay} onClick={onClose}>
      <div style={{ background: '#0f172a', borderRadius: 12, padding: 32, border: '1px solid #ef4444', color: '#f87171', maxWidth: 400 }}>
        ⚠️ {error}
      </div>
    </div>
  );

  const { crisis, analysis, summary, recommendations, report_id, generated_at } = report;
  const sevColor = RISK_COLOR[analysis.risk_level] || '#64748b';
  const typeLabel = DISASTER_TR[crisis.event_type || crisis.disaster_type] || 'Afet';
  const sevLabel  = SEVERITY_TR[crisis.severity] || crisis.severity;

  return (
    <div style={overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: '#0a0f1a', borderRadius: 14, border: '1px solid #1e293b',
        width: '100%', maxWidth: 760, maxHeight: '90vh',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 64px rgba(0,0,0,0.7)'
      }}>
        {/* Modal header */}
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid #1e293b',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0
        }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>Kriz Durum Raporu</div>
            <div style={{ fontSize: 10, color: '#475569', marginTop: 2, fontFamily: 'monospace' }}>
              {report_id} · {new Date(generated_at).toLocaleString('tr-TR')}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handlePrint} style={{
              padding: '6px 14px', borderRadius: 6, fontSize: 11, fontWeight: 600,
              background: 'rgba(2,132,199,0.15)', color: '#38bdf8',
              border: '1px solid rgba(2,132,199,0.3)', cursor: 'pointer'
            }}>🖨 Yazdır / PDF</button>
            <button onClick={onClose} style={{
              padding: '6px 12px', borderRadius: 6, fontSize: 11,
              background: 'rgba(51,65,85,0.5)', color: '#94a3b8',
              border: '1px solid #1e293b', cursor: 'pointer'
            }}>✕ Kapat</button>
          </div>
        </div>

        {/* Rapor içeriği */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          <div ref={printRef}>

            {/* Başlık */}
            <h1 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#f1f5f9', marginBottom: 4 }}>
              TURK Interop — Kriz Durum Raporu
            </h1>
            <div className="meta" style={{ fontSize: 11, color: '#475569', marginBottom: 20 }}>
              Rapor No: {report_id} · Oluşturulma: {new Date(generated_at).toLocaleString('tr-TR')} · Kaynak: TURK Interop v2.0
            </div>

            {/* Olay özeti */}
            <Section title="1. Olay Bilgileri">
              <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
                <Badge label={typeLabel} color={sevColor} />
                <Badge label={sevLabel + ' Risk'} color={sevColor} />
                <Badge label={crisis.status === 'active' ? 'AKTİF' : 'İZLENİYOR'} color={crisis.status === 'active' ? '#ef4444' : '#f59e0b'} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                <InfoRow label="Ülke / Şehir" value={`${crisis.country}${crisis.city ? ` — ${crisis.city}` : ''}`} />
                <InfoRow label="Afet Türü"    value={typeLabel} />
                <InfoRow label="Risk Seviyesi" value={sevLabel} color={sevColor} />
                <InfoRow label="Raporlayan"   value={crisis.reported_by || '—'} />
              </div>
              {crisis.description && (
                <div style={{ fontSize: 12, color: '#94a3b8', background: 'rgba(30,41,59,0.5)', borderRadius: 6, padding: '10px 12px', borderLeft: `3px solid ${sevColor}` }}>
                  {crisis.description}
                </div>
              )}
            </Section>

            {/* Etki verileri */}
            <Section title="2. Etki Verileri">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {[
                  { label: 'Etkilenen Nüfus', value: (crisis.affected_people || 0).toLocaleString('tr-TR'), color: '#38bdf8' },
                  { label: 'Kayıp',           value: (crisis.impact?.casualties || 0).toLocaleString('tr-TR'), color: '#ef4444' },
                  { label: 'Yaralı',          value: (crisis.impact?.injured || 0).toLocaleString('tr-TR'),    color: '#f97316' },
                  { label: 'Yerinden Edilmiş',value: (crisis.impact?.displaced || crisis.impact?.hospitalized || 0).toLocaleString('tr-TR'), color: '#a78bfa' }
                ].map(m => (
                  <div key={m.label} style={{ background: 'rgba(30,41,59,0.6)', borderRadius: 8, padding: '12px', border: '1px solid rgba(51,65,85,0.4)', textAlign: 'center' }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: m.color }}>{m.value}</div>
                    <div style={{ fontSize: 10, color: '#475569', marginTop: 3 }}>{m.label}</div>
                  </div>
                ))}
              </div>
            </Section>

            {/* AI Risk Analizi */}
            <Section title="3. AI Risk Analizi">
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 36, fontWeight: 900, color: sevColor, lineHeight: 1 }}>{analysis.risk_score}</div>
                  <div style={{ fontSize: 10, color: '#475569' }}>/ 100</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: '#64748b' }}>Risk Skoru</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: sevColor }}>{sevLabel.toUpperCase()}</span>
                  </div>
                  <div style={{ height: 8, background: 'rgba(51,65,85,0.6)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${analysis.risk_score}%`, background: sevColor, borderRadius: 4, transition: 'width 1s' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
                    {['Düşük','Orta','Yüksek','Kritik'].map(l => (
                      <span key={l} style={{ fontSize: 9, color: '#334155' }}>{l}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <InfoRow label="Tahmini Müdahale" value={`${analysis.estimated_response_hours} saat`} color="#38bdf8" />
                <InfoRow label="Sınır Ötesi Uyarı" value={analysis.cross_border_alert ? 'Gerekli' : 'Gerekli Değil'} color={analysis.cross_border_alert ? '#fbbf24' : '#475569'} />
                <InfoRow label="Analiz Motoru" value={analysis.engine === 'llm-gpt4o-mini' ? 'GPT-4o mini' : 'Kural Motoru'} />
              </div>
            </Section>

            {/* Özet */}
            <Section title="4. Durum Özeti">
              <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.7, background: 'rgba(30,41,59,0.4)', borderRadius: 8, padding: '14px 16px', borderLeft: `3px solid #0284c7` }}>
                {summary}
              </div>
            </Section>

            {/* Öncelikli ihtiyaçlar */}
            {analysis.priority_needs?.length > 0 && (
              <Section title="5. Öncelikli İhtiyaçlar">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {analysis.priority_needs.map((n, i) => {
                    const pColor = n.priority === 'immediate' ? '#ef4444' : n.priority === '24h' ? '#f59e0b' : '#38bdf8';
                    return (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        background: 'rgba(30,41,59,0.5)', borderRadius: 7, padding: '9px 12px',
                        border: `1px solid ${pColor}22`
                      }}>
                        <span style={{ fontSize: 16 }}>{RESOURCE_ICON[n.resource] || '📦'}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0' }}>
                            {RESOURCE_TR[n.resource] || n.resource}
                          </div>
                          {n.estimated_quantity && (
                            <div style={{ fontSize: 10, color: '#64748b' }}>
                              Tahmini: ~{n.estimated_quantity.amount?.toLocaleString('tr-TR')} {n.estimated_quantity.unit}
                            </div>
                          )}
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 700, color: pColor, padding: '2px 8px', borderRadius: 4, background: `${pColor}15`, border: `1px solid ${pColor}33` }}>
                          {PRIORITY_TR[n.priority] || n.priority}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </Section>
            )}

            {/* Müdahale planı */}
            <Section title="6. Önerilen Müdahale Planı">
              <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {recommendations.map((step, i) => (
                  <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{
                      minWidth: 22, height: 22, borderRadius: 4, background: 'rgba(30,41,59,0.8)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, fontWeight: 700, color: '#475569', flexShrink: 0,
                      border: '1px solid rgba(51,65,85,0.6)'
                    }}>{i + 1}</span>
                    <span style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>{step}</span>
                  </li>
                ))}
              </ol>
            </Section>

            {/* Footer */}
            <div style={{ marginTop: 24, paddingTop: 14, borderTop: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#334155' }}>
              <span>TURK Interop v2.0 — Cross-Border Crisis Coordination System</span>
              <span>Gizlilik: Dahili Kullanım</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Yardımcı bileşenler
function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10, paddingBottom: 6, borderBottom: '1px solid #1e293b' }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function Badge({ label, color }) {
  return (
    <span style={{ padding: '3px 10px', borderRadius: 4, fontSize: 10, fontWeight: 700, background: `${color}18`, color, border: `1px solid ${color}33` }}>
      {label}
    </span>
  );
}

function InfoRow({ label, value, color = '#e2e8f0' }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(30,41,59,0.8)' }}>
      <span style={{ fontSize: 11, color: '#64748b' }}>{label}</span>
      <span style={{ fontSize: 11, fontWeight: 600, color }}>{value}</span>
    </div>
  );
}
