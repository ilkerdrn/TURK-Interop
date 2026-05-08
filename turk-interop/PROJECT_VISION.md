# TURK Interop
## Cross-Border Crisis Coordination System
### Türk Dünyası Bölgesel Kamu Operasyon Platformu

**Versiyon:** 2.0 — Kriz Odaklı Revizyon  
**Durum:** Aktif Geliştirme  
**Kapsam:** TR · AZ · KZ · UZ · TM · KG

---

## Revize Edilmiş Proje Tanımı

TURK Interop, Türk Devletleri Teşkilatı üyesi altı ülkenin afet ve kriz yönetim sistemlerini tek bir operasyonel çatı altında birleştiren, gerçek zamanlı veri paylaşımı ve yapay zeka destekli karar desteği sunan **bölgesel kamu operasyon platformudur.**

Platform; kamu hizmeti entegrasyonunun ötesine geçerek NATO ve BM OCHA standartlarıyla uyumlu, egemenlik korumalı, modüler bir **Cross-Border Crisis Coordination System** olarak konumlandırılmıştır.

---

## Güncellenmiş Amaç

| Önceki Kapsam | Revize Kapsam |
|---|---|
| Kamu hizmeti veri paylaşımı | Gerçek zamanlı kriz koordinasyonu |
| Teknik birlikte çalışabilirlik | Operasyonel müdahale kapasitesi |
| Veri standardizasyonu | Ortak komuta ve kontrol |
| Bildirim sistemi | Erken uyarı ve tahmin |

**Temel Dönüşüm:** Pasif veri köprüsünden aktif operasyon merkezine.

---

## Özgün Değer Önerisi

```
Sorun:  Kriz anında 6 ülke, 6 farklı sistem, 6 farklı format.
        Koordinasyon saatler alıyor. Her saat hayat kaybı demek.

Çözüm: Tek platform. Ortak dil. Gerçek zamanlı koordinasyon.
        İlk bildirim: < 3 dakika.
        Tam mobilizasyon: < 2 saat.
```

**Rakip sistemlerden farkı:**
- Egemenlik korumalı — ülkeler ham veriyi paylaşmaz, sadece normalize edilmiş kriz verisini
- Hibrit model — gerçek API verisi + simülasyon verisi aynı pipeline'da
- AI-native — kural motoru + LLM hibrit analiz, API key olmadan da çalışır
- Modüler — her ülke kendi hızında entegre olur, sistem kesintisiz çalışır

---

## Teknik Mimari

```
┌─────────────────────────────────────────────────────────────────┐
│                    TURK Interop v2.0                            │
│              Cross-Border Crisis Coordination System            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  VERI KAYNAKLARI                                                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │   AFAD   │ │   USGS   │ │  NASA    │ │OpenWeather│         │
│  │ Deprem   │ │Earthquake│ │  FIRMS   │ │  Hava    │          │
│  │   API    │ │   API    │ │ Yangın   │ │ Durumu   │          │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘          │
│       └────────────┴────────────┴────────────┘                 │
│                            │                                    │
│                            ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              DATA INTEGRATION LAYER                     │   │
│  │   Adapter Pattern · Normalizasyon · TI-DS v1 Schema     │   │
│  └─────────────────────────┬───────────────────────────────┘   │
│                            │                                    │
│                            ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  API GATEWAY                            │   │
│  │         JWT Auth · Rate Limit · RBAC · Audit            │   │
│  └──────┬──────────┬──────────┬──────────┬─────────────────┘   │
│         │          │          │          │                      │
│         ▼          ▼          ▼          ▼                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │  Crisis  │ │Normalize │ │   AI     │ │Simulate  │          │
│  │ Service  │ │ Service  │ │ Service  │ │ Service  │          │
│  │  CRUD    │ │ Python   │ │GPT+Rules │ │Scenario  │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              REALTIME LAYER                             │   │
│  │         Socket.io · WebSocket · 30s Polling             │   │
│  └─────────────────────────┬───────────────────────────────┘   │
│                            │                                    │
│                            ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              COMMAND CENTER FRONTEND                    │   │
│  │   React + Tailwind · Dark Mode · Real-time Dashboard    │   │
│  │                                                         │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │   │
│  │  │  Crisis  │ │  Early   │ │  Cross-  │ │   KPI    │  │   │
│  │  │  Center  │ │ Warning  │ │  Border  │ │Dashboard │  │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │   │
│  │  │  Crisis  │ │   Map    │ │Simulation│ │Interop   │  │   │
│  │  │   Mode   │ │  View    │ │  Module  │ │Governance│  │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Teknoloji Yığını

| Katman | Teknoloji | Gerekçe |
|---|---|---|
| Frontend | React + Tailwind CSS | Hızlı geliştirme, component mimarisi |
| Build | Vite | Anlık HMR, üretim optimizasyonu |
| Backend | Node.js + Express | Mikroservis uyumu, async I/O |
| Normalizasyon | Python + FastAPI | Veri dönüşüm işlemleri için ideal |
| Realtime | WebSocket + Polling | Hibrit — bağlantı kopsa polling devreye girer |
| Harita | SVG + Leaflet (opsiyonel) | API key gerektirmez, her ortamda çalışır |
| AI | OpenAI GPT-4o mini + Kural Motoru | API key yoksa kural motoru devreye girer |
| Auth | JWT + API Key | Stateless, ölçeklenebilir |
| Container | Docker + docker-compose | Tek komutla ayağa kalkma |

---

## Modül Yapısı

### Modül 1 — Live Crisis Center
**Amaç:** Aktif kriz olaylarının gerçek zamanlı takibi

- Deprem, sel, yangın, salgın, fırtına, kuraklık olay yönetimi
- Ülke bazlı risk skoru (0-100) ve trend göstergesi
- Olay kartları: etkilenen nüfus, kayıp, yaralı, saha ekibi
- 4 saniyede bir otomatik güncelleme
- Olay detay paneli: koordinat, etki yarıçapı, müdahale süresi

**Mevcut durum:** ✅ Üretimde

---

### Modül 2 — Early Warning & AI Risk Analysis
**Amaç:** Kriz öncesi erken tespit ve risk skorlama

- 6 sensör tipi: sismik, hidrolojik, biyolojik, meteorolojik, iklimsel
- Bölgesel Risk İndeksi: 6 ülkenin ağırlıklı ortalaması
- Otomatik uyarı üretimi: her 20 saniyede bir yeni uyarı
- AI risk skoru: kural motoru (deterministik) + GPT-4o mini (LLM)
- Canlı sensör feed: gerçek zamanlı bar grafik güncellemesi

**Mevcut durum:** ✅ Üretimde

---

### Modül 3 — Cross-Border Response Management
**Amaç:** Ülkeler arası kaynak koordinasyonu

- Kaynak tipleri: USAR, Tıbbi, Lojistik
- Durum takibi: Sahada / Yolda / Hazırda
- Koordinasyon skoru: aktif olay başına düşen kaynak oranı
- Ülke katkı matrisi
- Görev atama: kaynak → olay eşleştirme

**Mevcut durum:** ✅ Üretimde

---

### Modül 4 — Real-Time Data Integration
**Amaç:** Harici API'lerden gerçek veri çekme

| Kaynak | Veri | Endpoint |
|---|---|---|
| USGS | Deprem (M2.5+, son 24 saat) | earthquake.usgs.gov/fdsnws |
| NASA FIRMS | Aktif yangın noktaları | firms.modaps.eosdis.nasa.gov |
| OpenWeather | Hava durumu + uyarılar | api.openweathermap.org |
| AFAD | Deprem verileri | deprem.afad.gov.tr |

**Entegrasyon modeli:** Adapter pattern — her kaynak kendi adaptörüyle normalize edilir, TI-DS v1 şemasına dönüştürülür.

**Mevcut durum:** 🔄 Adaptör katmanı hazır, API bağlantıları yapılandırılabilir

---

### Modül 5 — Crisis Simulation Module
**Amaç:** Masa başı tatbikat ve karar destek

- 3 senaryo: Deprem / Sel / Yangın
- 5 zaman dilimi: T0 → T+1h → T+6h → T+24h → T+72h
- Her fazda: kayıp, etkilenen nüfus, müdahale yüzdesi
- Sonuç analizi: müdahale başarısı, koordinasyon skoru, zarar azaltma
- Hız kontrolü: Yavaş / Normal / Hızlı

**Mevcut durum:** ✅ Üretimde

---

### Modül 6 — Interoperability Governance Layer
**Amaç:** Veri yönetişimi ve standart uyumu

**TI-DS v1 Ortak Veri Sözlüğü:**
```
country         → ISO 3166-1 alpha-2
disaster_type   → earthquake | flood | fire | epidemic | storm | drought
severity        → low | medium | high | critical
people_affected → integer ≥ 0
resources_needed→ rescue | medical | shelter | water | food | logistics
response_time   → string (okunabilir süre)
```

**Güvenlik katmanı:**
- Koordinat hassasiyeti: ±5km (hassas konum paylaşılmaz)
- Rol tabanlı erişim: admin / operatör / gözlemci
- Değiştirilemez audit log
- TLS 1.3 zorunlu

**Mevcut durum:** ✅ Üretimde

---

### Modül 7 — Dashboard & Command Center
**Amaç:** NATO/AFAD seviyesinde operasyon merkezi

- Dark mode, slate/navy renk paleti
- Sticky navbar + tab navigasyon
- Gerçek zamanlı stat kartları (4s güncelleme)
- SVG tabanlı Türk Dünyası haritası (hover tooltip)
- KPI paneli: müdahale süresi, koordinasyon skoru, zarar azaltma
- Canlı uyarı akışı
- Kriz Modu: tam ekran operasyon merkezi

**Mevcut durum:** ✅ Üretimde

---

### Modül 8 — Impact & Scalability
**Ölçülebilir hedefler:**

| Metrik | Mevcut (manuel) | Hedef (TURK Interop) |
|---|---|---|
| İlk bildirim süresi | 2-6 saat | < 3 dakika |
| Koordinasyon toplantısı | Fiziksel/video | Dashboard yeterli |
| Mükerrer sevkiyat | Sık | Minimize |
| Kapsanmayan ihtiyaç | Tespit edilemiyor | Gerçek zamanlı görünür |
| Karar destek | Yok | AI destekli |

**Ölçeklenme yolu:**
- Faz 1: TR + AZ + KZ (pilot, 6 ay)
- Faz 2: + UZ + TM + KG (18 ay)
- Faz 3: Diğer OIC üyelerine açılım (36 ay)

---

## Veri Akış Mimarisi

```
HARICI KAYNAKLAR          NORMALIZASYON           PLATFORM
─────────────────         ─────────────           ────────

USGS API ──────────►  TR Adaptör  ──────►
AFAD API ──────────►  AZ Adaptör  ──────►  TI-DS v1  ──►  Crisis DB
NASA FIRMS ────────►  KZ Adaptör  ──────►  Şeması    ──►  AI Engine
OpenWeather ───────►  Generic     ──────►            ──►  Notify
Operatör Girişi ───►  Adaptör     ──────►            ──►  Dashboard

                    ↑
              Her adaptör:
              - Kendi formatını okur
              - Ortak şemaya çevirir
              - Ham veriyi saklar (_raw)
              - Sadece normalize veri paylaşılır
```

**Kritik tasarım kararı:** Ülkeler birbirinin ham verisini görmez. Sadece TI-DS v1 formatındaki normalize veri paylaşılır. Veri egemenliği korunur.

---

## Kriz Yönetim Senaryoları

### Senaryo A — Büyük Deprem (Türkiye)
```
T+0:00  Sismik sensör tetiklendi → otomatik olay oluşturma
T+0:03  5 ülkeye webhook bildirimi gönderildi
T+0:05  AI risk analizi: skor 91/100, "Kritik"
T+0:10  Azerbaycan USAR ekibi hazırlık bildirdi
T+0:45  Kazakistan tıbbi destek onayladı
T+2:00  Koordinasyon skoru: %78
T+6:00  3 ülkeden 8 ekip sahada
```

### Senaryo B — Salgın (Kazakistan)
```
T+0:00  Biyolojik sensör anomali tespit etti
T+0:30  Erken uyarı: R0 = 1.8, yayılım riski yüksek
T+1:00  AI analizi: salgın tipi, yüksek risk, 24h müdahale
T+2:00  Türkiye tıbbi ekip gönderme teklifi
T+6:00  Ortak karantina protokolü aktif
```

### Senaryo C — Tatbikat (Masa Başı)
```
Simülasyon Modu aktif
Senaryo: Sel / Yüksek Risk
T0 → T+72h otomatik akış
Sonuç: Müdahale %88, Koordinasyon %91, Zarar Azaltma %94
Rapor: PDF olarak dışa aktarılabilir
```

---

## Yaygın Etki Analizi

### Kısa Vadeli (0-12 ay)
- 3 pilot ülkede aktif kullanım
- Yılda ortalama 15-20 kriz olayında koordinasyon
- Müdahale süresinde %60-70 azalma
- Mükerrer kaynak sevkiyatında %80 azalma

### Orta Vadeli (1-3 yıl)
- 6 ülke tam entegrasyon
- Ortak afet tatbikat altyapısı
- Bölgesel erken uyarı ağı
- Türk Devletleri Teşkilatı dijital altyapısının parçası

### Uzun Vadeli (3-10 yıl)
- OIC üyelerine model ihracatı
- BM OCHA ile entegrasyon
- Bölgesel dayanıklılık endeksinde ölçülebilir artış
- Dijital kamu yönetişiminde bölgesel liderlik

---

## Yarışma Sunumu Çerçevesi

### Problem (30 saniye)
> "2023 Kahramanmaraş depreminde Azerbaycan yardım göndermek istedi. Koordinasyon 6 saat sürdü. 6 saat, enkaz altındaki hayatta kalanlar için altın penceredir."

### Çözüm (60 saniye)
> "TURK Interop, 6 ülkenin kriz sistemlerini tek platformda birleştirir. Deprem olduğu anda 5 ülkeye 3 dakikada bildirim gider. AI risk analizi yapar. Koordinasyon dashboard'dan yürütülür."

### Kanıt (90 saniye)
> Canlı demo: Kriz Modu → Deprem olayı oluştur → AI analizi → Koordinasyon paneli → KPI

### Etki (30 saniye)
> "Müdahale süresi 6 saatten 3 dakikaya. Koordinasyon skoru %87. Zarar azaltma %94. Ölçeklenebilir, egemenlik korumalı, açık kaynak."

---

*TURK Interop v2.0 — Cross-Border Crisis Coordination System*  
*Türk Devletleri Teşkilatı Dijital Dönüşüm Girişimi*
