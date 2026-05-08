/**
 * Türkçe terim sözlüğü — tüm İngilizce enum değerlerinin Türkçe karşılıkları
 */

export const RESOURCE_TR = {
  rescue:    'Arama Kurtarma',
  medical:   'Tıbbi Müdahale',
  shelter:   'Barınma',
  water:     'İçme Suyu',
  food:      'Gıda',
  logistics: 'Lojistik',
  other:     'Diğer'
};

export const PRIORITY_TR = {
  immediate: 'Acil',
  '24h':     '24 Saat',
  '72h':     '72 Saat'
};

export const DISASTER_TR = {
  earthquake: 'Deprem',
  flood:      'Sel / Taşkın',
  fire:       'Yangın',
  epidemic:   'Salgın Hastalık',
  storm:      'Fırtına',
  drought:    'Kuraklık',
  other:      'Diğer'
};

export const SEVERITY_TR = {
  low:      'Düşük',
  medium:   'Orta',
  high:     'Yüksek',
  critical: 'Kritik'
};

export const STATUS_TR = {
  active:     'Aktif',
  monitoring: 'İzleniyor',
  resolved:   'Çözüldü',
  deployed:   'Sahada',
  transit:    'Yolda',
  standby:    'Hazırda'
};

export const ENGINE_TR = {
  'llm-gpt4o-mini': 'GPT-4o mini',
  'rule-based':     'Kural Motoru',
  'js-fallback':    'Yedek Motor'
};
