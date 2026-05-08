/**
 * Modül 3 — AI Analiz Motoru
 *
 * OpenAI yoksa deterministik kural motoru devreye girer.
 * OpenAI varsa LLM analizi yapılır, kural motoru fallback olarak kalır.
 */

// ── Kural Motoru ──────────────────────────────────────────────────────────────

const RISK_WEIGHTS = {
  // Afet türü ağırlıkları
  disaster_type: {
    earthquake: 35, epidemic: 30, flood: 25,
    fire: 20, storm: 15, drought: 10, other: 5
  },
  // Şiddet ağırlıkları
  severity: { critical: 40, high: 28, medium: 15, low: 5 },
  // Etkilenen nüfus ağırlıkları
  people_affected: [
    { min: 1_000_000, score: 25 },
    { min: 100_000,   score: 18 },
    { min: 10_000,    score: 10 },
    { min: 1_000,     score: 5  },
    { min: 0,         score: 1  }
  ]
};

const RESOURCE_RULES = {
  earthquake: ['rescue', 'medical', 'shelter', 'water', 'food'],
  flood:      ['rescue', 'shelter', 'water',   'food',  'logistics'],
  fire:       ['rescue', 'medical', 'water',   'shelter'],
  epidemic:   ['medical', 'food',   'water',   'logistics'],
  storm:      ['shelter', 'rescue', 'food',    'water'],
  drought:    ['water',   'food',   'medical', 'logistics'],
  other:      ['rescue',  'medical','shelter', 'water']
};

const INTERVENTION_PLANS = {
  critical: [
    'İlk 2 saat içinde ağır kurtarma ekipleri sahaya indirilmeli',
    'Mobil hastane ve acil tıbbi birimler bölgeye sevk edilmeli',
    'Komşu ülkelerden acil yardım talep edilmeli (TURK Interop kanalı)',
    'Hava koridoru açılarak lojistik önceliklendirilmeli',
    'Kriz komuta merkezi kurulmalı, 7/24 operasyon başlatılmalı'
  ],
  high: [
    'İlk 6 saat içinde arama kurtarma ekipleri bölgede olmalı',
    'Sağlık ekipleri ve ilaç sevkiyatı başlatılmalı',
    'Geçici barınma alanları kurulmalı',
    'Komşu ülkeler bilgilendirilmeli, destek hazır tutulmalı',
    'Durum 12 saatte bir güncellenmeli'
  ],
  medium: [
    'Yerel ekipler 12 saat içinde sahada olmalı',
    'İhtiyaç değerlendirme ekibi bölgeye gönderilmeli',
    'Temel ihtiyaç malzemeleri hazırlanmalı',
    'Durum 24 saatte bir izlenmeli'
  ],
  low: [
    'Yerel yetkililer durumu takip etmeli',
    'Önleyici tedbirler alınmalı',
    'Durum 48 saatte bir raporlanmalı'
  ]
};

function calcRiskScore(data) {
  const typeScore   = RISK_WEIGHTS.disaster_type[data.disaster_type] ?? 5;
  const sevScore    = RISK_WEIGHTS.severity[data.severity] ?? 15;
  const peopleScore = RISK_WEIGHTS.people_affected.find(
    r => (data.people_affected || 0) >= r.min
  )?.score ?? 1;
  return Math.min(100, typeScore + sevScore + peopleScore);
}

function scoreToLevel(score) {
  if (score >= 75) return 'critical';
  if (score >= 50) return 'high';
  if (score >= 25) return 'medium';
  return 'low';
}

function ruleBasedAnalysis(data) {
  const score     = calcRiskScore(data);
  const riskLevel = scoreToLevel(score);
  const resources = RESOURCE_RULES[data.disaster_type] || RESOURCE_RULES.other;
  const plan      = INTERVENTION_PLANS[riskLevel];

  // Öncelikli ihtiyaçlar: etkilenen nüfusa göre miktar tahmini
  const pop = data.people_affected || 0;
  const priorityNeeds = resources.map((r, i) => ({
    resource:    r,
    priority:    i < 2 ? 'immediate' : i < 4 ? '24h' : '72h',
    estimated_quantity: estimateQuantity(r, pop)
  }));

  return {
    risk_score:        score,
    risk_level:        riskLevel,
    priority_needs:    priorityNeeds,
    intervention_plan: plan,
    estimated_response_hours: { critical: 2, high: 6, medium: 12, low: 24 }[riskLevel],
    cross_border_alert: score >= 65,
    engine:            'rule-based'
  };
}

function estimateQuantity(resource, population) {
  const ratios = {
    rescue:    { ratio: 0.001, unit: 'ekip'         },
    medical:   { ratio: 0.005, unit: 'sağlık personeli' },
    shelter:   { ratio: 0.3,   unit: 'çadır/birim'  },
    water:     { ratio: 3,     unit: 'litre/gün'    },
    food:      { ratio: 1,     unit: 'günlük paket' },
    logistics: { ratio: 0.002, unit: 'araç'         }
  };
  const r = ratios[resource] || { ratio: 0.01, unit: 'birim' };
  return { amount: Math.ceil(population * r.ratio), unit: r.unit };
}

// ── LLM Analizi (OpenAI varsa) ────────────────────────────────────────────────

async function llmAnalysis(data) {
  // OpenAI key yoksa kural motoruna düş
  if (!process.env.OPENAI_API_KEY) return null;

  try {
    const { default: OpenAI } = await import('openai');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = `
Aşağıdaki normalize edilmiş afet verisini analiz et.

VERİ:
${JSON.stringify(data, null, 2)}

Şu JSON formatında yanıt ver (başka hiçbir şey yazma):
{
  "risk_score": 0-100 arası sayı,
  "risk_level": "low | medium | high | critical",
  "priority_needs": [
    {
      "resource": "rescue | medical | shelter | water | food | logistics",
      "priority": "immediate | 24h | 72h",
      "estimated_quantity": { "amount": sayı, "unit": "birim" }
    }
  ],
  "intervention_plan": ["adım 1", "adım 2", "adım 3", "adım 4", "adım 5"],
  "estimated_response_hours": sayı,
  "cross_border_alert": true/false,
  "reasoning": "2-3 cümle analiz gerekçesi"
}
`.trim();

    const res = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      temperature: 0.2,
      max_tokens: 800,
      messages: [
        { role: 'system', content: 'Sen TURK Interop kriz analiz motorusun. Sadece JSON döndür.' },
        { role: 'user',   content: prompt }
      ]
    });

    const raw     = res.choices[0].message.content.trim();
    const cleaned = raw.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    return { ...JSON.parse(cleaned), engine: 'llm-gpt4o-mini' };
  } catch {
    return null; // LLM başarısız → kural motoruna düş
  }
}

// ── Ana Fonksiyon ─────────────────────────────────────────────────────────────

async function analyzeDisaster(normalizedData) {
  const llm    = await llmAnalysis(normalizedData);
  const result = llm || ruleBasedAnalysis(normalizedData);

  return {
    ...result,
    analyzed_at: new Date().toISOString(),
    input_summary: {
      country:        normalizedData.country,
      disaster_type:  normalizedData.disaster_type,
      severity:       normalizedData.severity,
      people_affected: normalizedData.people_affected
    }
  };
}

module.exports = { analyzeDisaster, ruleBasedAnalysis };
