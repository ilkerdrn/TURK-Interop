import React, { useState } from 'react';
import { login } from '../api';

const styles = {
  container: {
    minHeight: '100vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', background: '#0f172a'
  },
  card: {
    background: '#1e293b', padding: '2rem', borderRadius: '12px',
    width: '360px', boxShadow: '0 4px 24px rgba(0,0,0,0.4)'
  },
  logo: { textAlign: 'center', marginBottom: '1.5rem' },
  title: { fontSize: '1.4rem', fontWeight: 700, color: '#38bdf8' },
  subtitle: { fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' },
  label: { display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' },
  input: {
    width: '100%', padding: '0.6rem 0.8rem', borderRadius: '6px',
    border: '1px solid #334155', background: '#0f172a', color: '#e2e8f0',
    fontSize: '0.9rem', marginBottom: '1rem', outline: 'none'
  },
  button: {
    width: '100%', padding: '0.7rem', borderRadius: '6px',
    background: '#0284c7', color: '#fff', border: 'none',
    fontSize: '0.95rem', fontWeight: 600
  },
  error: { color: '#f87171', fontSize: '0.8rem', marginBottom: '0.8rem' },
  hint: { marginTop: '1rem', fontSize: '0.75rem', color: '#475569', textAlign: 'center' }
};

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(username, password);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      onLogin(res.data.user);
    } catch {
      setError('Kullanıcı adı veya şifre hatalı.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <div style={styles.title}>🌍 TURK Interop</div>
          <div style={styles.subtitle}>Türk Dünyası Kriz Koordinasyon Sistemi</div>
        </div>
        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Kullanıcı Adı</label>
          <input style={styles.input} value={username}
            onChange={e => setUsername(e.target.value)} required />
          <label style={styles.label}>Şifre</label>
          <input style={styles.input} type="password" value={password}
            onChange={e => setPassword(e.target.value)} required />
          {error && <div style={styles.error}>{error}</div>}
          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>
        <div style={styles.hint}>
          Test: tr-admin / tr123 · az-admin / az123 · observer / obs123
        </div>
      </div>
    </div>
  );
}
