/**
 * Modül 1 — Afet Senaryoları
 * 3 farklı ülkede gerçekçi kriz senaryosu
 */

const scenarios = [
  {
    id: "scenario-001",
    country: "TR",
    city: "Kahramanmaraş",
    event_type: "earthquake",
    severity: "critical",
    title: "Doğu Anadolu Depremi",
    description: "Kahramanmaraş merkezli 7.8 büyüklüğünde deprem. Birden fazla il etkilendi.",
    affected_people: 1850000,
    impact: {
      casualties: 4200,
      injured: 18500,
      displaced: 320000,
      destroyed_buildings: 85000
    },
    needs: [
      { type: "rescue", quantity: 120, unit: "ekip", priority: "immediate" },
      { type: "medical", quantity: 45, unit: "mobil hastane", priority: "immediate" },
      { type: "shelter", quantity: 95000, unit: "çadır", priority: "24h" },
      { type: "water", quantity: 500000, unit: "litre/gün", priority: "24h" },
      { type: "food", quantity: 320000, unit: "günlük paket", priority: "48h" }
    ],
    response_timeline: {
      detection_minutes: 2,
      first_notification_minutes: 4,
      first_team_on_site_hours: 1.5,
      full_mobilization_hours: 6,
      estimated_rescue_window_hours: 72
    },
    reported_by: "AFAD",
    status: "active",
    timestamp: "2026-02-06T04:17:00.000Z",
    location: { coordinates: { lat: 37.58, lng: 36.92 }, affectedRadiusKm: 350 }
  },

  {
    id: "scenario-002",
    country: "AZ",
    city: "Gəncə",
    event_type: "flood",
    severity: "high",
    title: "Kür Nehri Büyük Taşkını",
    description: "Barajdan kontrolsüz su bırakılması ve yoğun yağış sonucu Kür nehri taştı. Gəncə ve çevre köyler su altında.",
    affected_people: 280000,
    impact: {
      casualties: 38,
      injured: 210,
      displaced: 75000,
      destroyed_buildings: 12000
    },
    needs: [
      { type: "rescue", quantity: 35, unit: "bot ekibi", priority: "immediate" },
      { type: "shelter", quantity: 22000, unit: "çadır", priority: "immediate" },
      { type: "water", quantity: 150000, unit: "litre/gün", priority: "24h" },
      { type: "medical", quantity: 12, unit: "sağlık ekibi", priority: "24h" },
      { type: "food", quantity: 75000, unit: "günlük paket", priority: "48h" }
    ],
    response_timeline: {
      detection_minutes: 15,
      first_notification_minutes: 20,
      first_team_on_site_hours: 2,
      full_mobilization_hours: 8,
      estimated_rescue_window_hours: 48
    },
    reported_by: "AZ-FHN",
    status: "active",
    timestamp: "2026-03-22T09:45:00.000Z",
    location: { coordinates: { lat: 40.68, lng: 46.36 }, affectedRadiusKm: 120 }
  },

  {
    id: "scenario-003",
    country: "KZ",
    city: "Almatı",
    event_type: "epidemic",
    severity: "high",
    title: "Almatı Solunum Yolu Salgını",
    description: "Hızla yayılan solunum yolu enfeksiyonu. Hastane kapasitesi %140'a ulaştı, yoğun bakım doluluk oranı kritik seviyede.",
    affected_people: 520000,
    impact: {
      casualties: 890,
      injured: 0,
      displaced: 0,
      hospitalized: 14200,
      icu_patients: 1850
    },
    needs: [
      { type: "medical", quantity: 80, unit: "uzman doktor", priority: "immediate" },
      { type: "medical", quantity: 500, unit: "ventilatör", priority: "immediate" },
      { type: "medical", quantity: 2000000, unit: "aşı dozu", priority: "24h" },
      { type: "medical", quantity: 50, unit: "seyyar klinik", priority: "48h" },
      { type: "food", quantity: 14200, unit: "hasta günlük paketi", priority: "24h" }
    ],
    response_timeline: {
      detection_minutes: 0,
      first_notification_minutes: 30,
      first_team_on_site_hours: 4,
      full_mobilization_hours: 24,
      estimated_containment_days: 21
    },
    reported_by: "KZ-DSM",
    status: "active",
    timestamp: "2026-04-10T14:00:00.000Z",
    location: { coordinates: { lat: 43.25, lng: 76.94 }, affectedRadiusKm: 80 }
  }
];

module.exports = scenarios;
