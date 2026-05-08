import React, { useState } from 'react';
import { createEvent } from '../api';

const overlay = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
};
const modal = {
  background: '#1e293b', borderRadius: '12px', padding: '1.5rem',
  width: '480px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto'
};
const title = { fontSize: '1rem', fontWeight: 700, color: '#38bdf8', marginBottom: '1rem' };
const label = { display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '4px', marginTop: '0.7rem' };
const input = {
  width: '100%', padding: '0.5rem 0.7rem', borderRadius: '6px',
  border: '1px solid #334155', background: '#0f172a', color: '#e2e8f0', fontSize: '0.85rem'
};
const row = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.7rem' };
const btnRow = { display: 'flex', gap: '0.7rem', marginTop: '1.2rem', justifyContent: 'flex-end' };
const cancelBtn = { padding: '0.5rem 1rem', borderRadius: '6px', background: '#334155', color: '#e2e8f0', border: 'none' };
const submitBtn = { padding: '0.5rem 1.2rem', borderRadius: '6px', background: '#0284c7', color: '#fff', border: 'none', fontWeight: 600 };
const errStyle = { color: '#f87171', fontSize: '0.78rem', marginTop: '0.5rem' };

const NEEDS_OPTIONS = ['food', 'water', 'medical', 'shelter', 'rescue', 'other'];
const NEEDS_TR = { food: 'Gıda', water: 'Su', medical: 'Tıbbi', shelter: 'Barınak', rescue: 'Kurtarma', other: 'Diğer' };

export default function CreateEventModal({ user, onClose, onCreated }) {
  const [form, setForm] = useState({
    type: 'earthquake', title: '', description: '',
    severity: 'medium', country: user.country === 'ALL' ? 'TR' : user.country,
    city: '', lat: '', lng: '', radius: '',
    affectedPopulation: '', casualties: '', injured: '',
    needs: []
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const toggleNeed = (need) => {
    setForm(f => ({
      ...f,
      needs: f.needs.includes(need) ? f.needs.filter(n => n !== need) : [...f.needs, need]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.lat || !form.lng) { setError('Koordinatlar zorunlu.'); return; }
    setLoading(true);
    try {
      await createEvent({
        type: form.type,
        title: form.title,
        description: form.description,
        severity: form.severity,
        location: {
          country: form.country,
          city: form.city,
          coordinates: { lat: parseFloat(form.lat), lng: parseFloat(form.lng) },
          affectedRadiusKm: parseFloat(form.radius) || 0
        },
        impact: {
          affectedPopulation: parseInt(form.affectedPopulation) || 0,
          casualties: parseInt(form.casualties) || 0,
          injured: parseInt(form.injured) || 0
        },
        needs: form.needs,
        reportedBy: user.country === 'ALL' ? form.country : user.country
      });
      onCreated();
    } catch (err) {
      setError(err.response?.data?.errors?.join(', ') || 'Olay oluşturulamadı.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={modal}>
        <div style={title}>🆕 Yeni Kriz Olayı</div>
        <form onSubmit={handleSubmit}>
          <div style={row}>
            <div>
              <label style={label}>Olay Tipi</label>
              <select style={input} value={form.type} onChange={e => set('type', e.target.value)}>
                <option value="earthquake">🌍 Deprem</option>
                <option value="flood">🌊 Sel</option>
                <option value="fire">🔥 Yangın</option>
                <option value="epidemic">🦠 Salgın</option>
                <option value="other">⚠️ Diğer</option>
              </select>
            </div>
            <div>
              <label style={label}>Şiddet</label>
              <select style={input} value={form.severity} onChange={e => set('severity', e.target.value)}>
                <option value="low">Düşük</option>
                <option value="medium">Orta</option>
                <option value="high">Yüksek</option>
                <option value="critical">Kritik</option>
              </select>
            </div>
          </div>

          <label style={label}>Başlık *</label>
          <input style={input} value={form.title} onChange={e => set('title', e.target.value)} required />

          <label style={label}>Açıklama</label>
          <textarea style={{ ...input, minHeight: '60px', resize: 'vertical' }}
            value={form.description} onChange={e => set('description', e.target.value)} />

          <div style={row}>
            <div>
              <label style={label}>Ülke Kodu *</label>
              <input style={input} value={form.country} maxLength={2}
                onChange={e => set('country', e.target.value.toUpperCase())} required />
            </div>
            <div>
              <label style={label}>Şehir</label>
              <input style={input} value={form.city} onChange={e => set('city', e.target.value)} />
            </div>
          </div>

          <div style={row}>
            <div>
              <label style={label}>Enlem *</label>
              <input style={input} type="number" step="any" value={form.lat}
                onChange={e => set('lat', e.target.value)} placeholder="39.9" required />
            </div>
            <div>
              <label style={label}>Boylam *</label>
              <input style={input} type="number" step="any" value={form.lng}
                onChange={e => set('lng', e.target.value)} placeholder="32.8" required />
            </div>
          </div>

          <div style={row}>
            <div>
              <label style={label}>Etki Yarıçapı (km)</label>
              <input style={input} type="number" value={form.radius} onChange={e => set('radius', e.target.value)} />
            </div>
            <div>
              <label style={label}>Etkilenen Nüfus</label>
              <input style={input} type="number" value={form.affectedPopulation}
                onChange={e => set('affectedPopulation', e.target.value)} />
            </div>
          </div>

          <div style={row}>
            <div>
              <label style={label}>Kayıp Sayısı</label>
              <input style={input} type="number" value={form.casualties}
                onChange={e => set('casualties', e.target.value)} />
            </div>
            <div>
              <label style={label}>Yaralı Sayısı</label>
              <input style={input} type="number" value={form.injured}
                onChange={e => set('injured', e.target.value)} />
            </div>
          </div>

          <label style={label}>İhtiyaçlar</label>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {NEEDS_OPTIONS.map(n => (
              <button key={n} type="button"
                style={{
                  padding: '4px 10px', borderRadius: '4px', border: '1px solid',
                  fontSize: '0.78rem', cursor: 'pointer',
                  background: form.needs.includes(n) ? '#0284c7' : '#334155',
                  color: '#fff', borderColor: form.needs.includes(n) ? '#0284c7' : '#475569'
                }}
                onClick={() => toggleNeed(n)}>
                {NEEDS_TR[n]}
              </button>
            ))}
          </div>

          {error && <div style={errStyle}>{error}</div>}

          <div style={btnRow}>
            <button type="button" style={cancelBtn} onClick={onClose}>İptal</button>
            <button type="submit" style={submitBtn} disabled={loading}>
              {loading ? 'Kaydediliyor...' : 'Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
