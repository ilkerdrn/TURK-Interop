const express = require('express');
const router  = express.Router();
const store   = require('../data/store');
const { analyzeDisaster } = require('../services/aiAnalysis');

/**
 * POST /api/report/:id
 * Belirli bir kriz olayı için tam rapor üret
 */
router.post('/:id', async (req, res) => {
  const crisis = store.getById(req.params.id);
  if (!crisis) return res.status(404).json({ error: 'Kriz olayı bulunamadı' });

  try {
    // Normalize edilmiş veriyi analiz motoruna gönder
    const normalizedForAnalysis = {
      country:          crisis.country,
      disaster_type:    crisis.event_type,
      severity:         crisis.severity,
      people_affected:  crisis.affected_people,
      resources_needed: crisis.needs || [],
      response_time:    'Değerlendiriliyor'
    };

    const analysis = await analyzeDisaster(normalizedForAnalysis);

    const report = {
      report_id:    `RPT-${Date.now()}`,
      generated_at: new Date().toISOString(),
      crisis,
      analysis,
      summary: buildSummary(crisis, analysis),
      recommendations: buildRecommendations(crisis, analysis)
    };

    res.json(report);
  } catch (err) {
    res.status(500).json({ error: 'Rapor üretilemedi', detail: err.message });
  }
});

/**
 * POST /api/report/scenario
 * Senaryo verisi için rapor üret (id olmadan)
 */
router.post('/generate/scenario', async (req, res) => {
  const { scenario } = req.body;
  if (!scenario) return res.status(400).json({ error: 'scenario verisi zorunlu' });

  try {
    const normalizedForAnalysis = {
      country:          scenario.country,
      disaster_type:    scenario.event_type || scenario.disaster_type,
      severity:         scenario.severity,
      people_affected:  scenario.affected_people || scenario.people_affected || 0,
      resources_needed: (scenario.needs || []).map(n => n.type || n),
      response_time:    'Değerlendiriliyor'
    };

    const analysis = await analyzeDisaster(normalizedForAnalysis);

    const report = {
      report_id:    `RPT-${Date.now()}`,
      generated_at: new Date().toISOString(),
      crisis:       scenario,
      analysis,
      summary:         buildSummary(scenario, analysis),
      recommendations: buildRecommendations(scenario, analysis)
    };

    res.json(report);
  } catch (err) {
    res.status(500).json({ error: 'Rapor üretilemedi', detail: err.message });
  }
});

function buildSummary(crisis, analysis) {
  const typeMap = { earthquake:'Deprem', flood:'Sel', fire:'Yangın', epidemic:'Salgın', storm:'Fırtına', drought:'Kuraklık', other:'Diğer' };
  const sevMap  = { critical:'Kritik', high:'Yüksek', medium:'Orta', low:'Düşük' };
  const type    = typeMap[crisis.event_type || crisis.disaster_type] || 'Afet';
  const sev     = sevMap[crisis.severity] || crisis.severity;
  const country = crisis.country;
  const city    = crisis.city || crisis.location?.city || '';
  const pop     = (crisis.affected_people || crisis.people_affected || 0).toLocaleString('tr-TR');

  return `${country}${city ? ` — ${city}` : ''} bölgesinde ${sev.toLowerCase()} şiddetinde ${type.toLowerCase()} meydana gelmiştir. ` +
    `Tahminen ${pop} kişi doğrudan etkilenmiştir. ` +
    `AI risk analizi ${analysis.risk_score}/100 puan ile "${sev}" risk seviyesi belirlemiştir. ` +
    `Tahmini ilk müdahale süresi ${analysis.estimated_response_hours} saattir.` +
    (analysis.cross_border_alert ? ' Sınır ötesi koordinasyon gereklidir.' : '');
}

function buildRecommendations(crisis, analysis) {
  const recs = [...(analysis.intervention_plan || [])];
  if (analysis.cross_border_alert) {
    recs.push('TURK Interop kanalı üzerinden komşu ülkelere acil bildirim gönderilmelidir.');
  }
  if ((crisis.affected_people || 0) > 100000) {
    recs.push('Uluslararası insani yardım kuruluşları (OCHA, IFRC) bilgilendirilmelidir.');
  }
  return recs;
}

module.exports = router;
