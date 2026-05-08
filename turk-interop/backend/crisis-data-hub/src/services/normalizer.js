const axios = require('axios');

const NORMALIZER_URL = process.env.NORMALIZER_URL || 'http://localhost:5500';

/**
 * Ham kriz verisini Python normalizer servisine gönderir,
 * TI-DS v1 standardında normalize edilmiş veriyi döndürür.
 *
 * @param {object} rawData      - Herhangi bir ülkeden gelen ham veri
 * @param {string} countryHint  - Ülke kodu (opsiyonel, adaptör seçimini hızlandırır)
 */
async function normalizeData(rawData, countryHint = null) {
  const res = await axios.post(
    `${NORMALIZER_URL}/normalize`,
    { data: rawData, country_hint: countryHint },
    { timeout: 5000 }
  );
  return res.data;
}

/**
 * Normalizer servisinin şemasını döndürür
 */
async function getSchema() {
  const res = await axios.get(`${NORMALIZER_URL}/schema`, { timeout: 3000 });
  return res.data;
}

module.exports = { normalizeData, getSchema };
