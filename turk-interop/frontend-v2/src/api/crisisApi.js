import client from './client';

/**
 * Crisis API — tüm endpoint çağrıları burada.
 * Backend: http://localhost:4000/api/crises
 */
const BASE = '/crises';

const crisisApi = {
  /**
   * Kriz listesi — opsiyonel filtrelerle
   * GET /api/crisis?country=TR&severity=high&...
   */
  getAll: (filters = {}) => {
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== '' && v !== null && v !== undefined)
    );
    return client.get(BASE, { params });
  },

  /**
   * Ülke bazlı özet istatistikler
   * GET /api/crisis/summary
   */
  getSummary: () => client.get(`${BASE}/summary`),

  /**
   * Tek kayıt
   * GET /api/crisis/:id
   */
  getById: (id) => client.get(`${BASE}/${id}`),

  /**
   * Yeni kriz ekle
   * POST /api/crisis
   */
  create: (data) => client.post(BASE, data),

  /**
   * Kısmi güncelleme
   * PATCH /api/crisis/:id
   */
  update: (id, data) => client.patch(`${BASE}/${id}`, data),

  /**
   * Sil
   * DELETE /api/crisis/:id
   */
  remove: (id) => client.delete(`${BASE}/${id}`)
};

export default crisisApi;
