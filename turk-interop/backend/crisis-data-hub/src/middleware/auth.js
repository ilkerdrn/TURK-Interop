/**
 * API Key auth middleware
 * Sadece /api/crises yazma işlemleri için x-api-key zorunlu.
 * /api/analysis, /api/simulate, /api/normalize — public (key gerekmez)
 */
const PUBLIC_PATHS = ['/api/analysis', '/api/simulate', '/api/normalize', '/api/scenarios'];

const auth = (req, res, next) => {
  const WRITE_METHODS = ['POST', 'PATCH', 'DELETE'];
  if (!WRITE_METHODS.includes(req.method)) return next();

  // Public route'lar için auth atla
  const isPublic = PUBLIC_PATHS.some(p => req.path.startsWith(p) || req.originalUrl.startsWith(p));
  if (isPublic) return next();

  const key = req.headers['x-api-key'];
  if (!key || key !== (process.env.API_KEY || 'hub-secret-key-2024')) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'x-api-key header required for write operations'
    });
  }
  next();
};

module.exports = auth;
