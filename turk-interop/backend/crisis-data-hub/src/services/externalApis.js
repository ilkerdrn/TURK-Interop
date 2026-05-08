/**
 * Modül 4 — Real-Time Data Integration
 * Harici API adaptörleri: USGS, NASA FIRMS, OpenWeather
 * Her adaptör TI-DS v1 formatına normalize eder.
 */

const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

// ── USGS Earthquake API ───────────────────────────────────────────────────────
// Ücretsiz, API key gerektirmez
// Son 24 saatte M2.5+ depremler, Türk Dünyası bölgesi

async function fetchUSGSEarthquakes() {
  const bbox = '35,55,55,80'; // minLat, minLng, maxLat, maxLng — Türk Dünyası
  const url  = 'https://earthquake.usgs.gov/fdsnws/event/1/query';

  const res = await axios.get(url, {
    params: {
      format:    'geojson',
      starttime: new Date(Date.now() - 86400000).toISOString(), // son 24 saat
      minmagnitude: 2.5,
      minlatitude:  35, maxlatitude:  55,
      minlongitude: 35, maxlongitude: 80,
      limit: 20
    },
    timeout: 8000
  });

  return res.data.features.map(f => ({
    id:              `usgs-${f.id}`,
    country:         geoToCountry(f.geometry.coordinates[1], f.geometry.coordinates[0]),
    disaster_type:   'earthquake',
    severity:        magnitudeToSeverity(f.properties.mag),
    people_affected: 0, // USGS nüfus verisi sağlamaz
    resources_needed: f.properties.mag >= 6 ? ['rescue', 'medical', 'shelter'] : ['rescue'],
    response_time:   'Değerlendiriliyor',
    source_format:   'USGS-FDSN',
    title:           f.properties.title,
    magnitude:       f.properties.mag,
    depth_km:        f.geometry.coordinates[2],
    coordinates:     { lat: f.geometry.coordinates[1], lng: f.geometry.coordinates[0] },
    timestamp:       new Date(f.properties.time).toISOString(),
    normalized_at:   new Date().toISOString(),
    _raw:            f.properties
  }));
}

function magnitudeToSeverity(mag) {
  if (mag >= 7.0) return 'critical';
  if (mag >= 5.5) return 'high';
  if (mag >= 4.0) return 'medium';
  return 'low';
}

// Basit koordinat → ülke eşleştirme (Türk Dünyası bbox'ları)
function geoToCountry(lat, lng) {
  if (lat >= 36 && lat <= 42 && lng >= 26 && lng <= 45) return 'TR';
  if (lat >= 38 && lat <= 42 && lng >= 44 && lng <= 51) return 'AZ';
  if (lat >= 40 && lat <= 56 && lng >= 50 && lng <= 88) return 'KZ';
  if (lat >= 37 && lat <= 46 && lng >= 56 && lng <= 74) return 'UZ';
  if (lat >= 35 && lat <= 43 && lng >= 52 && lng <= 67) return 'TM';
  if (lat >= 39 && lat <= 44 && lng >= 69 && lng <= 81) return 'KG';
  return 'XX';
}

// ── NASA FIRMS (Fire Information for Resource Management System) ──────────────
// Ücretsiz MAP_KEY ile erişilebilir
// Aktif yangın noktaları

async function fetchNASAFires() {
  const MAP_KEY = process.env.NASA_FIRMS_KEY || 'DEMO_KEY';
  const url = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${MAP_KEY}/VIIRS_SNPP_NRT/world/1`;

  try {
    const res = await axios.get(url, { timeout: 8000 });
    const lines = res.data.split('\n').slice(1, 21); // ilk 20 kayıt

    return lines
      .filter(l => l.trim())
      .map(line => {
        const [lat, lng, brightness, scan, track, acq_date, acq_time, satellite, confidence, version, bright_t31, frp, daynight] = line.split(',');
        const parsedLat = parseFloat(lat);
        const parsedLng = parseFloat(lng);
        if (isNaN(parsedLat) || isNaN(parsedLng)) return null;

        return {
          id:              `firms-${acq_date}-${lat}-${lng}`.replace(/\./g, ''),
          country:         geoToCountry(parsedLat, parsedLng),
          disaster_type:   'fire',
          severity:        frpToSeverity(parseFloat(frp)),
          people_affected: 0,
          resources_needed: ['rescue', 'water'],
          response_time:   'Değerlendiriliyor',
          source_format:   'NASA-FIRMS-VIIRS',
          coordinates:     { lat: parsedLat, lng: parsedLng },
          frp:             parseFloat(frp),
          confidence:      confidence?.trim(),
          timestamp:       new Date(`${acq_date}T${acq_time?.slice(0,2)}:${acq_time?.slice(2,4)}:00Z`).toISOString(),
          normalized_at:   new Date().toISOString()
        };
      })
      .filter(Boolean);
  } catch {
    return []; // FIRMS erişilemezse boş dön
  }
}

function frpToSeverity(frp) {
  if (frp >= 500) return 'critical';
  if (frp >= 100) return 'high';
  if (frp >= 20)  return 'medium';
  return 'low';
}

// ── OpenWeather Severe Weather Alerts ────────────────────────────────────────
// API key gerektirir (ücretsiz tier mevcut)

async function fetchWeatherAlerts(cities = [
  { name: 'Ankara',  lat: 39.93, lng: 32.85, country: 'TR' },
  { name: 'Bakü',    lat: 40.41, lng: 49.87, country: 'AZ' },
  { name: 'Almatı',  lat: 43.25, lng: 76.94, country: 'KZ' },
  { name: 'Taşkent', lat: 41.29, lng: 69.24, country: 'UZ' }
]) {
  const API_KEY = process.env.OPENWEATHER_KEY;
  if (!API_KEY) return [];

  const results = [];
  for (const city of cities) {
    try {
      const res = await axios.get('https://api.openweathermap.org/data/3.0/onecall', {
        params: { lat: city.lat, lon: city.lng, appid: API_KEY, exclude: 'minutely,hourly,daily' },
        timeout: 5000
      });

      if (res.data.alerts?.length) {
        res.data.alerts.forEach(alert => {
          results.push({
            id:              `ow-${city.country}-${alert.start}`,
            country:         city.country,
            disaster_type:   weatherEventToType(alert.event),
            severity:        'high',
            people_affected: 0,
            resources_needed: ['shelter', 'food'],
            response_time:   'Değerlendiriliyor',
            source_format:   'OpenWeather-OneCall',
            title:           alert.event,
            description:     alert.description?.slice(0, 200),
            coordinates:     { lat: city.lat, lng: city.lng },
            timestamp:       new Date(alert.start * 1000).toISOString(),
            normalized_at:   new Date().toISOString()
          });
        });
      }
    } catch { /* tek şehir başarısız olursa devam et */ }
  }
  return results;
}

function weatherEventToType(event) {
  const e = event.toLowerCase();
  if (e.includes('flood') || e.includes('rain')) return 'flood';
  if (e.includes('storm') || e.includes('wind') || e.includes('tornado')) return 'storm';
  if (e.includes('fire') || e.includes('heat')) return 'fire';
  if (e.includes('drought') || e.includes('dry')) return 'drought';
  return 'other';
}

// ── Ana Fonksiyon ─────────────────────────────────────────────────────────────

async function fetchAllExternalData() {
  const [earthquakes, fires, weather] = await Promise.allSettled([
    fetchUSGSEarthquakes(),
    fetchNASAFires(),
    fetchWeatherAlerts()
  ]);

  return {
    earthquakes: earthquakes.status === 'fulfilled' ? earthquakes.value : [],
    fires:       fires.status       === 'fulfilled' ? fires.value       : [],
    weather:     weather.status     === 'fulfilled' ? weather.value     : [],
    fetched_at:  new Date().toISOString(),
    sources: {
      usgs:        earthquakes.status === 'fulfilled' ? 'ok' : 'error',
      nasa_firms:  fires.status       === 'fulfilled' ? 'ok' : 'error',
      openweather: weather.status     === 'fulfilled' ? 'ok' : 'error'
    }
  };
}

module.exports = { fetchAllExternalData, fetchUSGSEarthquakes, fetchNASAFires, fetchWeatherAlerts };
