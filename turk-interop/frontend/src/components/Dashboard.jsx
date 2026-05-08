import React, { useState, useEffect, useCallback } from 'react';
import { getEvents, resolveEvent } from '../api';
import EventCard from './EventCard';
import CreateEventModal from './CreateEventModal';

const SEVERITY_COLOR = {
  low: '#22c55e', medium: '#f59e0b', high: '#f97316', critical: '#ef4444'
};

const styles = {
  root: { minHeight: '100vh', background: '#0f172a' },
  header: {
    background: '#1e293b', padding: '0.8rem 1.5rem',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    borderBottom: '1px solid #334155'
  },
  logo: { fontSize: '1.1rem', fontWeight: 700, color: '#38bdf8' },
  userInfo: { fontSize: '0.8rem', color: '#94a3b8', display: 'flex', gap: '1rem', alignItems: 'center' },
  logoutBtn: {
    padding: '0.3rem 0.8rem', borderRadius: '4px',
    background: '#334155', color: '#e2e8f0', border: 'none', fontSize: '0.8rem'
  },
  main: { padding: '1.5rem' },
  toolbar: { display: 'flex', gap: '0.8rem', marginBottom: '1.2rem', flexWrap: 'wrap', alignItems: 'center' },
  select: {
    padding: '0.4rem 0.7rem', borderRadius: '6px',
    border: '1px solid #334155', background: '#1e293b', color: '#e2e8f0', fontSize: '0.85rem'
  },
  addBtn: {
    padding: '0.4rem 1rem', borderRadius: '6px',
    background: '#0284c7', color: '#fff', border: 'none', fontWeight: 600, fontSize: '0.85rem',
    marginLeft: 'auto'
  },
  stats: { display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' },
  statCard: {
    background: '#1e293b', borderRadius: '8px', padding: '0.8rem 1.2rem',
    minWidth: '120px', textAlign: 'center'
  },
  statNum: { fontSize: '1.6rem', fontWeight: 700 },
  statLabel: { fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' },
  empty: { textAlign: 'center', color: '#475569', padding: '3rem', fontSize: '0.9rem' },
  refreshBtn: {
    padding: '0.4rem 0.8rem', borderRadius: '6px',
    background: '#334155', color: '#e2e8f0', border: 'none', fontSize: '0.8rem'
  }
};

export default function Dashboard({ user, onLogout }) {
  const [events, setEvents] = useState([]);
  const [filters, setFilters] = useState({ type: '', severity: '', status: '' });
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      const res = await getEvents(params);
      setEvents(res.data.events);
    } catch (err) {
      console.error('Events fetch failed:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  // 30 saniyede bir otomatik yenile
  useEffect(() => {
    const interval = setInterval(fetchEvents, 30000);
    return () => clearInterval(interval);
  }, [fetchEvents]);

  const handleResolve = async (id) => {
    if (!window.confirm('Bu olayı çözüldü olarak işaretle?')) return;
    await resolveEvent(id);
    fetchEvents();
  };

  const active = events.filter(e => e.status === 'active').length;
  const critical = events.filter(e => e.severity === 'critical').length;
  const countries = [...new Set(events.map(e => e.location.country))].length;

  return (
    <div style={styles.root}>
      <header style={styles.header}>
        <div style={styles.logo}>🌍 TURK Interop</div>
        <div style={styles.userInfo}>
          <span>{user.country} · {user.role}</span>
          <span style={{ color: '#64748b' }}>|</span>
          <span>{user.username}</span>
          <button style={styles.logoutBtn} onClick={onLogout}>Çıkış</button>
        </div>
      </header>

      <main style={styles.main}>
        {/* İstatistikler */}
        <div style={styles.stats}>
          <div style={styles.statCard}>
            <div style={{ ...styles.statNum, color: '#38bdf8' }}>{events.length}</div>
            <div style={styles.statLabel}>Toplam Olay</div>
          </div>
          <div style={styles.statCard}>
            <div style={{ ...styles.statNum, color: '#f97316' }}>{active}</div>
            <div style={styles.statLabel}>Aktif</div>
          </div>
          <div style={styles.statCard}>
            <div style={{ ...styles.statNum, color: '#ef4444' }}>{critical}</div>
            <div style={styles.statLabel}>Kritik</div>
          </div>
          <div style={styles.statCard}>
            <div style={{ ...styles.statNum, color: '#a78bfa' }}>{countries}</div>
            <div style={styles.statLabel}>Ülke</div>
          </div>
        </div>

        {/* Toolbar */}
        <div style={styles.toolbar}>
          <select style={styles.select} value={filters.type}
            onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}>
            <option value="">Tüm Tipler</option>
            <option value="earthquake">Deprem</option>
            <option value="flood">Sel</option>
            <option value="fire">Yangın</option>
            <option value="epidemic">Salgın</option>
            <option value="other">Diğer</option>
          </select>
          <select style={styles.select} value={filters.severity}
            onChange={e => setFilters(f => ({ ...f, severity: e.target.value }))}>
            <option value="">Tüm Şiddetler</option>
            <option value="low">Düşük</option>
            <option value="medium">Orta</option>
            <option value="high">Yüksek</option>
            <option value="critical">Kritik</option>
          </select>
          <select style={styles.select} value={filters.status}
            onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
            <option value="">Tüm Durumlar</option>
            <option value="active">Aktif</option>
            <option value="monitoring">İzleniyor</option>
            <option value="resolved">Çözüldü</option>
          </select>
          <button style={styles.refreshBtn} onClick={fetchEvents} disabled={loading}>
            {loading ? '...' : '↻ Yenile'}
          </button>
          {user.role === 'admin' && (
            <button style={styles.addBtn} onClick={() => setShowCreate(true)}>
              + Yeni Olay
            </button>
          )}
        </div>

        {/* Olay listesi */}
        {events.length === 0 ? (
          <div style={styles.empty}>
            {loading ? 'Yükleniyor...' : 'Kayıtlı kriz olayı bulunamadı.'}
          </div>
        ) : (
          <div style={styles.grid}>
            {events.map(event => (
              <EventCard
                key={event.id}
                event={event}
                canEdit={user.role === 'admin'}
                onResolve={handleResolve}
                onRefresh={fetchEvents}
              />
            ))}
          </div>
        )}
      </main>

      {showCreate && (
        <CreateEventModal
          user={user}
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); fetchEvents(); }}
        />
      )}
    </div>
  );
}
