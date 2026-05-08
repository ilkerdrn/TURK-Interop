import axios from 'axios';

const hub = axios.create({
  baseURL: process.env.CRISIS_HUB_URL || 'http://localhost:4000',
  timeout: 5000,
  headers: { 'x-api-key': process.env.CRISIS_HUB_API_KEY || 'hub-secret-key-2024' }
});

/** Aktif krizleri çek */
export async function getActiveCrises() {
  const res = await hub.get('/api/crises', { params: { status: 'active' } });
  return res.data?.data ?? [];
}

/** Tek kriz kaydını çek */
export async function getCrisisById(id) {
  const res = await hub.get(`/api/crises/${id}`);
  return res.data;
}
