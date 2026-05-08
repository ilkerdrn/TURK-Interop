import { Router } from 'express';
import { chat } from '../llm/client.js';
import {
  REPORT_SYSTEM, buildReportPrompt,
  RISK_SYSTEM,   buildRiskPrompt
} from '../llm/prompts.js';
import { getActiveCrises, getCrisisById } from '../services/crisisData.js';

const router = Router();

// Basit in-memory cache — aynı veri için LLM'i tekrar çağırma
const cache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 dakika

function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL_MS) { cache.delete(key); return null; }
  return entry.value;
}
function setCache(key, value) {
  cache.set(key, { value, ts: Date.now() });
}

/**
 * POST /ai/report
 * Aktif krizlerden otomatik koordinasyon raporu üret.
 * Body (opsiyonel): { country: "TR" }  — ülkeye göre filtrele
 */
router.post('/report', async (req, res) => {
  try {
    let crises = await getActiveCrises();

    if (req.body?.country) {
      crises = crises.filter(c => c.country === req.body.country.toUpperCase());
    }

    if (!crises.length) {
      return res.json({ message: 'Aktif kriz bulunamadı.', report: null });
    }

    // Cache key: aktif kriz id'lerinin hash'i
    const cacheKey = `report:${crises.map(c => c.id).sort().join(',')}`;
    const cached = getCached(cacheKey);
    if (cached) return res.json({ ...cached, cached: true });

    const raw = await chat(REPORT_SYSTEM, buildReportPrompt(crises));

    // LLM bazen markdown code block içinde JSON döner — temizle
    const cleaned = raw.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    const report  = JSON.parse(cleaned);

    const result = { report, generated_at: new Date().toISOString(), source_events: crises.length };
    setCache(cacheKey, result);

    res.json(result);
  } catch (err) {
    console.error('[AI/report]', err.message);
    res.status(500).json({ error: 'Rapor üretilemedi.', detail: err.message });
  }
});

/**
 * POST /ai/risk/:id
 * Belirli bir kriz için risk analizi yap.
 */
router.post('/risk/:id', async (req, res) => {
  try {
    const crisis = await getCrisisById(req.params.id);

    const cacheKey = `risk:${crisis.id}:${crisis.updated_at || crisis.timestamp}`;
    const cached = getCached(cacheKey);
    if (cached) return res.json({ ...cached, cached: true });

    const raw     = await chat(RISK_SYSTEM, buildRiskPrompt(crisis));
    const cleaned = raw.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    const analysis = JSON.parse(cleaned);

    const result = { analysis, analyzed_at: new Date().toISOString() };
    setCache(cacheKey, result);

    res.json(result);
  } catch (err) {
    console.error('[AI/risk]', err.message);
    if (err.response?.status === 404) return res.status(404).json({ error: 'Kriz bulunamadı.' });
    res.status(500).json({ error: 'Risk analizi yapılamadı.', detail: err.message });
  }
});

/**
 * GET /ai/health
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    cache_entries: cache.size
  });
});

export default router;
