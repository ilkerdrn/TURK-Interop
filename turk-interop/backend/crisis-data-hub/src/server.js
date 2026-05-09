require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const logger  = require('./middleware/logger');
const auth    = require('./middleware/auth');
const crisisRoutes   = require('./routes/crises');
const scenarioRoutes = require('./routes/scenarios');
const normalizeRoutes = require('./routes/normalize');
const analysisRoutes  = require('./routes/analysis');
const simulateRoutes  = require('./routes/simulate');
const externalRoutes  = require('./routes/external');
const reportRoutes    = require('./routes/report');

const app  = express();
const PORT = process.env.PORT || 4000;

// ── Global middleware ──────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(logger);   // tüm istekleri logla
app.use(auth);     // yazma işlemleri için API key kontrolü

// ── Routes ────────────────────────────────────────────────────
app.use('/api/crises',    crisisRoutes);
app.use('/api/scenarios', scenarioRoutes);
app.use('/api/normalize', normalizeRoutes);
app.use('/api/analysis',  analysisRoutes);
app.use('/api/simulate',  simulateRoutes);
app.use('/api/external',  externalRoutes);
app.use('/api/report',    reportRoutes);

// ── Health check ──────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'crisis-data-hub',
    version: '1.0.0',
    uptime: Math.floor(process.uptime()) + 's'
  });
});

// ── 404 handler ───────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── Global error handler ──────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`\n🌍 TURK Interop — Crisis Data Hub`);
  console.log(`   Running on http://localhost:${PORT}`);
  console.log(`   API Key required for write ops (x-api-key header)\n`);
});
