import React from 'react';
import { updateEvent } from '../api';

const SEVERITY_COLOR = {
  low: '#22c55e', medium: '#f59e0b', high: '#f97316', critical: '#ef4444'
};
const STATUS_COLOR = {
  active: '#ef4444', monitoring: '#f59e0b', resolved: '#22c55e'
};
const TYPE_EMOJI = {
  earthquake: '🌍', flood: '🌊', fire: '🔥', epidemic: '🦠', other: '⚠️'
};
const TYPE_TR = {
  earthquake: 'Deprem', flood: 'Sel', fire: 'Yangın', epidemic: 'Salgın', other: 'Diğer'
};
const NEEDS_TR = {
  food: 'Gıda', water: 'Su', medical: 'Tıbbi', shelter: 'Barınak', rescue: 'Kurtarma', other: 'Diğer'
};

const styles = {
  card: {
    background: '#1e293b', borderRadius: '10px', padding: '1rem',
    border: '1px solid #334155', position: 'relative'
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' },
  title: { fontWeight: 600, fontSize: '0.95rem', color: '#f1f5f9' },
  type: { fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' },
  badge: {
    padding: '2px 8px', borderRadius: '20px', fontSize: '0.7rem',
    fontWeight: 600, color: '#fff'
  },
  row: { display: 'flex', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' },
  info: { fontSize: '0.8rem', color: '#94a3b8' },
  needs: { display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '0.5rem' },
  needTag: {
    padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem',
    background: '#334155', color: '#94a3b8'
  },
  actions: { display: 'flex', gap: '0.5rem', marginTop: '0.8rem' },
  btn: {
    padding: '0.3rem 0.7rem', borderRadius: '4px', border: 'none',
    fontSize: '0.75rem', fontWeight: 600
  },
  footer: { fontSize: '0.7rem', color: '#475569', marginTop: '0.6rem' }
};

export default function EventCard({ event, canEdit, onResolve, onRefresh }) {
  const handleStatusChange = async (newStatus) => {
    await updateEvent(event.id, { status: newStatus });
    onRefresh();
  };

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div>
          <div style={styles.title}>{TYPE_EMOJI[event.type]} {event.title}</div>
          <div style={styles.type}>{TYPE_TR[event.type]} · {event.location.country}</div>
        </div>
        <span style={{ ...styles.badge, background: SEVERITY_COLOR[event.severity] }}>
          {event.severity.toUpperCase()}
        </span>
      </div>

      {event.description && (
        <div style={{ ...styles.info, marginBottom: '0.5rem' }}>{event.description}</div>
      )}

      <div style={styles.row}>
        <span style={{ ...styles.badge, background: STATUS_COLOR[event.status], fontSize: '0.7rem' }}>
          {event.status}
        </span>
        {event.location.city && (
          <span style={styles.info}>📍 {event.location.city}</span>
        )}
        {event.location.affectedRadiusKm > 0 && (
          <span style={styles.info}>⭕ {event.location.affectedRadiusKm} km</span>
        )}
      </div>

      {(event.impact.affectedPopulation > 0 || event.impact.casualties > 0) && (
        <div style={styles.row}>
          {event.impact.affectedPopulation > 0 && (
            <span style={styles.info}>👥 {event.impact.affectedPopulation.toLocaleString()} etkilenen</span>
          )}
          {event.impact.casualties > 0 && (
            <span style={{ ...styles.info, color: '#f87171' }}>💔 {event.impact.casualties} kayıp</span>
          )}
          {event.impact.injured > 0 && (
            <span style={styles.info}>🏥 {event.impact.injured} yaralı</span>
          )}
        </div>
      )}

      {event.needs?.length > 0 && (
        <div style={styles.needs}>
          <span style={{ ...styles.info, marginRight: '4px' }}>İhtiyaç:</span>
          {event.needs.map(n => (
            <span key={n} style={styles.needTag}>{NEEDS_TR[n] || n}</span>
          ))}
        </div>
      )}

      {canEdit && event.status !== 'resolved' && (
        <div style={styles.actions}>
          {event.status === 'active' && (
            <button style={{ ...styles.btn, background: '#f59e0b', color: '#000' }}
              onClick={() => handleStatusChange('monitoring')}>
              İzlemeye Al
            </button>
          )}
          {event.status === 'monitoring' && (
            <button style={{ ...styles.btn, background: '#0284c7', color: '#fff' }}
              onClick={() => handleStatusChange('active')}>
              Aktife Al
            </button>
          )}
          <button style={{ ...styles.btn, background: '#22c55e', color: '#000' }}
            onClick={() => onResolve(event.id)}>
            Çözüldü
          </button>
        </div>
      )}

      <div style={styles.footer}>
        Raporlayan: {event.reportedBy} · {new Date(event.createdAt).toLocaleString('tr-TR')}
      </div>
    </div>
  );
}
