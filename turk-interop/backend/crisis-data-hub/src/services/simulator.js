/**
 * Modül 5 — Simülasyon Motoru
 * Akış: Senaryo Üret → Normalize Et → Analiz Et → Sonuç Döndür
 */

const { v4: uuidv4 } = require('uuid');
const { analyzeDisaster } = require('./aiAnalysis');

// ── Senaryo Üretici ──────────────────────────────────────────────────────

const DISASTER_TYPES  = ['earthquake', 'flood', 'fire', 'epidemic', 'storm', 'drought'];
const SEVERITIES      = ['low', 'medium', 'high', 'critical'];
const COUNTRIES       = ['TR', 'AZ', 'KZ', 'UZ', 'TM', 'KG'];
const RESOURCE_TYPES  = ['rescue', 'medical', 'shelter', 'water', 'food', 'logistics'];

const SEVERITY_POPULATION = {
  low:      { min: 100,     max: 5000 },
  medium:   { min: 5000,    max: 50000 },
  high:     { min: 50000,   max: 500000 },
  critical: { min: 500000,  max: 2000000 }
};

const CITY_MAP = {
  TR: ['İstanbul', 'Ankara', 'İzmir', 'Kahramanmaraş', 'Malatya', 'Gaziantep'],
  AZ: ['Bakü', 'Gəncə', 'Sumqayıt', 'Mingəçevir', 'Şirvan'],
  KZ: ['Almatı', 'Astana', 'Şimkent', 'Karaganda'],
  UZ: ['Taşkent', 'Semerkant', 'Buhara', 'Andican'],
  TM: ['Aşgabat', 'Türkmenabat', 'Daşoguz'],
  KG: ['Bişkek', 'Oş', 'Celal-Abad']
};

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Kural tabanlı rastgele senaryo üretir
 */
function generateScenario(params = {}) {
  const country      = params.country || randomChoice(COUNTRIES);
  const disasterType = params.disaster_type || randomChoice(DISASTER_TYPES);
  const severity     = params.severity || randomChoice(SEVERITIES);

  const popRange = SEVERITY_POPULATION[severity];
  const peopleAffected = params.people_affected || randomInt(popRange.min, popRange.max);

  // Kaynak ihtiyaçları — rastgele seç
  const resourceCount = randomInt(2, 5);
  const resources = [...new Set(
    Array.from({ length: resourceCount }, () => randomChoice(RESOURCE_TYPES))
  )];

  // Müdahale süresi — şiddete göre
  const responseHours = {
    low: randomInt(12, 24),
    medium: randomInt(6, 12),
    high: randomInt(2, 6),
    critical: randomInt(1, 3)
  };

  const city      = randomChoice(CITY_MAP[country] || ['Bilinmeyen']);
  const timestamp = new Date(Date.now() - randomInt(0, 3600000)).toISOString(); // son 1 saat

  return {
    id:               uuidv4(),
    country,
    city,
    disaster_type:    disasterType,
    severity,
    people_affected:  peopleAffected,
    resources_needed: resources,
    response_time:    `${responseHours[severity]} saat`,
    source_format:    'simulator-generated',
    generated_at:     new Date().toISOString(),
    timestamp
  };
}

// ── LLM Senaryo Üretimi (OpenAI varsa) ────────────────────────────────────

async function generateScenarioWithLLM(params = {}) {
  if (!process.env.OPENAI_API_KEY) return null;

  try {
    const { default: OpenAI } = await import('openai');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = `
Gerçekçi bir afet senaryosu üret.
Parametreler: ${JSON.stringify(params)}

Şu JSON formatında yanıt ver (başka hiçbir şey yazma):
{
  "country": "TR | AZ | KZ | UZ | TM | KG",
  "city": "şehir adı",
  "disaster_type": "earthquake | flood | fire | epidemic | storm | drought",
  "severity": "low | medium | high | critical",
  "people_affected": sayı,
  "resources_needed": ["rescue", "medical", ...],
  "response_time": "X saat",
  "description": "1-2 cümle açıklama",
  "casualties": sayı,
  "injured": sayı
}
`.trim();

    const res = await openai.chat.completions.create({
      model:       process.env.OPENAI_MODEL || 'gpt-4o-mini',
      temperature: 0.9, // Yüksek sıcaklık = daha yaratıcı senaryo
      max_tokens:  500,
      messages: [
        { role: 'system', content: 'Sen TURK Interop kriz senaryo üreticisisin. Gerçekçi, detaylı ve çeşitli senaryolar üretirsin.' },
        { role: 'user',   content: prompt }
      ]
    });

    const raw     = res.choices[0].message.content.trim();
    const cleaned = raw.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    const parsed  = JSON.parse(cleaned);

    return {
      id:              uuidv4(),
      ...parsed,
      source_format:   'llm-gpt4o-mini',
      generated_at:    new Date().toISOString(),
      timestamp:       new Date().toISOString()
    };
  } catch {
    return null;
  }
}

// ── Ana Simülasyon Pipeline ──────────────────────────────────────────────

async function runSimulation(params = {}) {
  // 1. Senaryo üret
  let scenario = await generateScenarioWithLLM(params);
  let engine    = 'llm-gpt4o-mini';

  if (!scenario) {
    scenario = generateScenario(params);
    engine   = 'rule-based';
  }

  // 2. Analiz et
  const analysis = await analyzeDisaster(scenario);

  // 3. Sonucu birleştir
  return {
    simulation_id: uuidv4(),
    generated_at:  new Date().toISOString(),
    engine,
    scenario,
    analysis
  };
}

module.exports = { runSimulation, generateScenario, generateScenarioWithLLM };
