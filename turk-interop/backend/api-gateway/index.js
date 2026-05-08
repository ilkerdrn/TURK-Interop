require('dotenv').config();
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const CRISIS_SERVICE_URL = process.env.CRISIS_SERVICE_URL || 'http://localhost:3001';
const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3002';
const JWT_SECRET = process.env.JWT_SECRET || 'turk-interop-jwt-secret';

// Rate limiting — 100 istek/dakika
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, slow down.' }
});
app.use(limiter);

// Kullanıcılar (MVP — production'da DB)
const users = [
  { id: '1', username: 'tr-admin', password: 'tr123', country: 'TR', role: 'admin' },
  { id: '2', username: 'az-admin', password: 'az123', country: 'AZ', role: 'admin' },
  { id: '3', username: 'kz-admin', password: 'kz123', country: 'KZ', role: 'admin' },
  { id: '4', username: 'observer', password: 'obs123', country: 'ALL', role: 'observer' }
];

// Login — JWT token al
app.post('/auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign(
    { id: user.id, username: user.username, country: user.country, role: user.role },
    JWT_SECRET,
    { expiresIn: '8h' }
  );
  res.json({ token, user: { id: user.id, username: user.username, country: user.country, role: user.role } });
});

// JWT doğrulama middleware
const authenticate = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Token required' });

  try {
    const decoded = jwt.verify(auth.split(' ')[1], JWT_SECRET);
    req.user = decoded;
    // Downstream servislere API key ekle
    req.headers['x-api-key'] = process.env.INTERNAL_API_KEY || 'turk-interop-secret-key';
    req.headers['x-user-country'] = decoded.country;
    req.headers['x-user-role'] = decoded.role;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Sadece admin yazabilir
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin role required' });
  next();
};

// Proxy: GET /api/events — herkese açık (token ile)
app.use('/api/events', authenticate, createProxyMiddleware({
  target: CRISIS_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: { '^/api/events': '/events' }
}));

// Proxy: POST/PATCH/DELETE — sadece admin
app.use('/api/crisis', authenticate, requireAdmin, createProxyMiddleware({
  target: CRISIS_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: { '^/api/crisis': '' }
}));

// Proxy: Bildirimler
app.use('/api/notifications', authenticate, requireAdmin, createProxyMiddleware({
  target: NOTIFICATION_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: { '^/api/notifications': '' }
}));

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'api-gateway' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API Gateway running on port ${PORT}`));
