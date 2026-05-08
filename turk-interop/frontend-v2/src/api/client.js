import axios from 'axios';

/**
 * Merkezi axios instance
 * Tüm istekler buradan geçer — base URL, headers, interceptor'lar burada.
 */
const client = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': import.meta.env.VITE_API_KEY || 'hub-secret-key-2024'
  }
});

// Request interceptor — her isteği logla (dev only)
client.interceptors.request.use((config) => {
  if (import.meta.env.DEV) {
    console.debug(`[API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
  }
  return config;
});

// Response interceptor — hataları normalize et
client.interceptors.response.use(
  (response) => response,
  (error) => {
    const status  = error.response?.status;
    const data    = error.response?.data;

    // Sunucudan gelen hata mesajını düzgün bir Error'a çevir
    let message = 'Beklenmeyen bir hata oluştu.';

    if (!error.response) {
      // Ağ hatası — sunucu kapalı veya CORS
      message = 'Sunucuya ulaşılamıyor. Backend çalışıyor mu? (localhost:4000)';
    } else if (status === 400) {
      message = data?.details?.join(', ') || data?.error || 'Geçersiz istek.';
    } else if (status === 401) {
      message = 'Yetkisiz erişim. API key kontrol et.';
    } else if (status === 404) {
      message = 'Kayıt bulunamadı.';
    } else if (status >= 500) {
      message = 'Sunucu hatası. Lütfen tekrar dene.';
    }

    return Promise.reject(new Error(message));
  }
);

export default client;
