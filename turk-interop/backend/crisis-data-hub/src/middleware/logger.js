/**
 * Request logger middleware
 * Her isteği method, path, status ve süre ile loglar
 */
const logger = (req, res, next) => {
  const start = Date.now();
  const { method, originalUrl, ip } = req;

  res.on('finish', () => {
    const ms = Date.now() - start;
    const status = res.statusCode;
    const color = status >= 500 ? '\x1b[31m'   // kırmızı
                : status >= 400 ? '\x1b[33m'   // sarı
                : status >= 200 ? '\x1b[32m'   // yeşil
                : '\x1b[0m';
    console.log(`${color}[${new Date().toISOString()}] ${method} ${originalUrl} ${status} — ${ms}ms (${ip})\x1b[0m`);
  });

  next();
};

module.exports = logger;
