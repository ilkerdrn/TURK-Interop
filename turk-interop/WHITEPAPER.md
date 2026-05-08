# TURK Interop: Türk Dünyası Kamu Hizmetleri Birlikte Çalışabilirlik ve Kriz Koordinasyon Modeli

**Whitepaper v1.0**
**Mayıs 2026**

---

> *"Ortak tehdit, ortak sistem gerektirir."*

---

## İçindekiler

1. Giriş
2. Problem Tanımı
3. Çözüm Modeli
4. Teknik Mimari
5. Uygulama Yöntemi
6. Beklenen Etki
7. Sonuç
8. Referanslar

---

## 1. Giriş

Türk Dünyası, Orta Asya steplerinden Anadolu'ya uzanan geniş bir coğrafyada altı bağımsız devleti kapsamaktadır: Türkiye, Azerbaycan, Kazakistan, Özbekistan, Türkmenistan ve Kırgızistan. Bu devletler, ortak dil ailesi, tarihsel bağlar ve kültürel miras temelinde güçlü bir dayanışma zeminine sahip olmakla birlikte, dijital kamu altyapıları bakımından birbirinden büyük ölçüde ayrışmaktadır.

Söz konusu ayrışma, olağan dönemlerde idari bir verimsizlik olarak değerlendirilebilir. Ancak kriz dönemlerinde — deprem, sel, salgın hastalık veya büyük ölçekli insani acil durumlar söz konusu olduğunda — bu ayrışma, insan hayatını doğrudan tehdit eden bir koordinasyon boşluğuna dönüşmektedir.

**TURK Interop**, bu boşluğu kapatmak amacıyla tasarlanmış açık standartlara dayalı, çok taraflı bir kriz koordinasyon ve veri birlikte çalışabilirlik platformudur. Platform; ülkeler arası gerçek zamanlı veri paylaşımını, ortak kriz veri standardını ve yapay zeka destekli karar destek mekanizmalarını tek bir çatı altında birleştirmektedir.

Bu whitepaper, TURK Interop'un tasarım gerekçesini, teknik mimarisini, uygulama yol haritasını ve beklenen stratejik etkisini akademik ve teknik bir perspektiften ele almaktadır.

---

## 2. Problem Tanımı

### 2.1 Koordinasyon Boşluğu

2023 Kahramanmaraş depremleri, bölgesel koordinasyonun ne denli kritik olduğunu somut biçimde ortaya koymuştur. Azerbaycan, Kazakistan ve diğer Türk Dünyası devletleri yardım göndermek istemiş; ancak bu süreç diplomatik kanallar, telefon görüşmeleri ve e-posta yazışmaları aracılığıyla yürütülmek zorunda kalınmıştır. Sonuç olarak:

- Yardım ekiplerinin koordinasyonu saatler almıştır.
- Aynı bölgeye birden fazla ülkeden mükerrer malzeme sevkiyatı gerçekleşmiştir.
- Bazı kritik ihtiyaç alanları ise hiçbir ekip tarafından karşılanamamıştır.

Bu tablo, teknik bir yetersizlikten değil, **yapısal bir birlikte çalışabilirlik eksikliğinden** kaynaklanmaktadır.

### 2.2 Mevcut Sistemlerin Sınırlılıkları

Türk Dünyası devletlerinin her biri, kendi ulusal afet yönetim sistemlerini bağımsız olarak geliştirmiştir. Bu sistemler arasında şu temel uyumsuzluklar gözlemlenmektedir:

| Boyut | Mevcut Durum |
|---|---|
| Veri formatı | Her ülke farklı şema kullanmaktadır |
| İletişim protokolü | Standart dışı, ikili anlaşmalara bağlı |
| Erişim yönetimi | Merkezi kimlik doğrulama yoktur |
| Gerçek zamanlılık | Veri paylaşımı reaktif, manuel süreçlere dayanmaktadır |
| Yapay zeka desteği | Karar destek mekanizması bulunmamaktadır |

### 2.3 Egemenlik ve Güven Sorunu

Ülkeler arası veri paylaşımının önündeki en büyük engellerden biri, veri egemenliği kaygısıdır. Hassas coğrafi veriler, nüfus bilgileri ve altyapı konumları, ulusal güvenlik kapsamında değerlendirilmektedir. Bu nedenle herhangi bir çözüm modeli, teknik birlikte çalışabilirliği sağlarken ulusal egemenlik ilkesini de güvence altına almak zorundadır.

---

## 3. Çözüm Modeli

### 3.1 Tasarım İlkeleri

TURK Interop, aşağıdaki dört temel ilke üzerine inşa edilmiştir:

**Egemenlik önce gelir.** Her ülke, kendi ham verisi üzerinde tam kontrolü elinde tutar. Platform yalnızca normalize edilmiş, onaylanmış kriz verisini paylaşır.

**Standart, zorunlu değil gönüllüdür.** Ortak veri şeması bir dayatma değil, bir kolaylaştırıcıdır. Ülkeler mevcut sistemlerini adapter katmanı aracılığıyla entegre edebilir.

**Gerçek zamanlılık, kritik bir gerekliliktir.** Kriz anında saatlik raporlar değil, dakikalık güncellemeler hayat kurtarır.

**Yapay zeka, insan kararını destekler; yerini almaz.** LLM tabanlı analiz araçları, koordinatörlere karar desteği sunar; nihai otorite her zaman insan operatördedir.

### 3.2 TURK Interop Veri Standardı (TI-DS v1)

Platform, tüm ülkelerin üzerinde mutabık kaldığı minimum ortak veri şemasını tanımlamaktadır:

```
TI-DS v1 Kriz Olayı Şeması:
├── id              : UUID (sistem tarafından atanır)
├── country         : ISO 3166-1 alpha-2
├── event_type      : earthquake | flood | fire | epidemic | storm | other
├── severity        : low | medium | high | critical
├── affected_people : integer
├── location
│   ├── city        : string
│   └── coordinates : { lat, lng } (±5km hassasiyet)
├── impact
│   ├── casualties  : integer
│   ├── injured     : integer
│   └── displaced   : integer
├── needs           : string[] (rescue, medical, shelter, water, food)
├── reported_by     : string (kurum adı)
├── status          : active | monitoring | resolved
└── timestamp       : ISO 8601
```

Bu şema kasıtlı olarak minimal tutulmuştur. Ülkeler kendi iç sistemlerinde daha zengin veri tutabilir; ancak platforma yalnızca bu alanları iletmekle yükümlüdür.

### 3.3 Katmanlı Güven Modeli

```
Katman 1 — Diplomatik: İkili veya çok taraflı anlaşmalar
Katman 2 — Teknik:    JWT tabanlı kimlik doğrulama, API key yönetimi
Katman 3 — Veri:      Normalize edilmiş, egemenlik korumalı paylaşım
Katman 4 — Denetim:   Tüm işlemlerin değiştirilemez audit log'u
```

---

## 4. Teknik Mimari

### 4.1 Genel Bakış

TURK Interop, mikroservis mimarisi üzerine inşa edilmiş, Kubernetes üzerinde çalışan dağıtık bir platformdur. Her ülke için izole bir namespace sağlanmakta; merkezi servisler ise paylaşımlı altyapı üzerinde çalışmaktadır.

```
┌─────────────────────────────────────────────────────────┐
│                    TURK Interop Platform                │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │  TR NS   │  │  AZ NS   │  │  KZ NS   │  ...        │
│  │ Adapter  │  │ Adapter  │  │ Adapter  │             │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘             │
│       └──────────────┼─────────────┘                   │
│                      ▼                                  │
│            ┌─────────────────┐                         │
│            │   API Gateway   │  ← Auth, Rate Limit     │
│            └────────┬────────┘                         │
│                     │                                   │
│        ┌────────────┼────────────┐                     │
│        ▼            ▼            ▼                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐               │
│  │  Crisis  │ │ Notif.   │ │    AI    │               │
│  │ Service  │ │ Service  │ │ Service  │               │
│  └──────────┘ └──────────┘ └──────────┘               │
│        │                        │                      │
│        ▼                        ▼                      │
│  ┌──────────┐            ┌──────────┐                  │
│  │PostgreSQL│            │  OpenAI  │                  │
│  │  Redis   │            │   API    │                  │
│  └──────────┘            └──────────┘                  │
└─────────────────────────────────────────────────────────┘
```

### 4.2 Servis Kataloğu

| Servis | Teknoloji | Sorumluluk |
|---|---|---|
| API Gateway | Node.js / Express | Kimlik doğrulama, yönlendirme, hız sınırlama |
| Crisis Service | Node.js / Express | Kriz verisi CRUD, filtreleme, özetleme |
| Notification Service | Node.js / Express | Webhook yönetimi, gerçek zamanlı bildirim |
| AI Service | Node.js / OpenAI SDK | Rapor üretimi, risk analizi |
| Frontend Dashboard | React / Tailwind CSS | Operatör arayüzü, gerçek zamanlı görselleştirme |

### 4.3 Veri Akışı

Bir kriz olayının sisteme girişinden ülkelere iletilmesine kadar geçen süreç şu şekilde işlemektedir:

```
T+0  : Operatör → Dashboard form → POST /api/crisis
T+1s : API Gateway → JWT doğrulama → Crisis Service
T+2s : Crisis Service → Veri validasyonu → PostgreSQL kayıt
T+3s : Crisis Service → Notification Service tetikleme
T+4s : Notification Service → Kayıtlı webhook'lara paralel POST
T+5s : Diğer ülke dashboard'ları → 30s polling ile güncelleme
T+30s: AI Service → Otomatik risk skoru hesaplama (arka planda)
```

Kritik tasarım kararı: bildirim mekanizması **push + pull** hibrit modelini kullanmaktadır. Webhook desteği olan ülkeler anlık bildirim alırken, webhook altyapısı olmayan ülkeler polling ile sisteme entegre olabilmektedir.

### 4.4 Güvenlik Mimarisi

- **Kimlik doğrulama:** JWT (8 saatlik token ömrü) + API key (servisler arası iletişim)
- **Yetkilendirme:** Rol tabanlı erişim kontrolü (RBAC) — admin, operatör, gözlemci
- **Veri iletimi:** TLS 1.3 zorunlu
- **Denetim:** Tüm yazma işlemleri değiştirilemez audit log'a kaydedilir
- **Koordinat hassasiyeti:** Paylaşılan koordinatlar ±5km hassasiyetle yuvarlanır

### 4.5 Yapay Zeka Entegrasyonu

AI Service, iki temel işlev sunmaktadır:

**Koordinasyon Raporu Üretimi:** Aktif kriz verileri toplanarak GPT-4o-mini modeline iletilir. Model, koordinatörlere yönelik eyleme dönük bir brifing raporu üretir. Rapor; kritik olayları, öncelikli ihtiyaçları ve ülkeler arası koordinasyon önerilerini içerir.

**Risk Analizi:** Tek bir kriz olayı için birincil riskler, ikincil riskler, zaman hassasiyeti ve sınır ötesi etki değerlendirmesi yapılır. Risk skoru 0-100 ölçeğinde hesaplanır.

Her iki işlev de 5 dakikalık önbellek mekanizmasıyla desteklenmekte; böylece API maliyeti ve gecikme süresi minimize edilmektedir.

---

## 5. Uygulama Yöntemi

### 5.1 Aşamalı Entegrasyon Modeli

TURK Interop, "büyük patlama" yaklaşımı yerine aşamalı entegrasyon modelini benimsemektedir. Bu model, her ülkenin kendi hızında sisteme dahil olmasına imkân tanımaktadır.

**Faz 1 — Pilot (Ay 1-6)**
- Türkiye, Azerbaycan, Kazakistan ile sınırlı pilot
- Yalnızca deprem ve sel olay tipleri
- Manuel veri girişi (adapter entegrasyonu yok)
- Temel dashboard ve bildirim sistemi

**Faz 2 — Genişleme (Ay 7-18)**
- Özbekistan, Türkmenistan, Kırgızistan entegrasyonu
- Tüm olay tipleri
- Ulusal sistemlerle adapter entegrasyonu
- AI destekli rapor ve risk analizi

**Faz 3 — Olgunlaşma (Ay 19-36)**
- Gerçek zamanlı sismik sensör entegrasyonu
- Mobil saha uygulaması
- Çok dilli arayüz desteği
- Uluslararası afet yönetim standartlarıyla uyum (Sendai Çerçevesi)

### 5.2 Yönetişim Modeli

Platform, teknik bir yapı olduğu kadar siyasi bir mutabakat zeminidir. Önerilen yönetişim modeli şu unsurları içermektedir:

- **Teknik Komite:** Her ülkeden bir teknik temsilci, standart güncellemelerini yönetir
- **Operasyonel Komite:** Kriz anında koordinasyonu yürüten operatörler topluluğu
- **Bağımsız Denetim:** Yıllık güvenlik ve uyumluluk denetimi
- **Açık Kaynak Taahhüdü:** Platform çekirdeği açık kaynak olarak yayımlanır; ülkeler kodu denetleyebilir

### 5.3 Minimum Uygulanabilir Ürün (MVP) Kapsamı

MVP, altı temel bileşeni kapsamaktadır:

1. Kriz olayı oluşturma, güncelleme ve listeleme API'si
2. Ülke bazlı filtreleme ve özetleme
3. Webhook tabanlı gerçek zamanlı bildirim
4. JWT kimlik doğrulama ve rol yönetimi
5. React tabanlı operatör dashboard'u
6. Temel AI rapor üretimi

---

## 6. Beklenen Etki

### 6.1 Operasyonel Etki

Mevcut koordinasyon süreçleriyle karşılaştırıldığında TURK Interop'un sağlaması beklenen iyileştirmeler:

| Metrik | Mevcut Durum | Hedef |
|---|---|---|
| İlk bildirim süresi | 2-6 saat (diplomatik kanal) | < 5 dakika |
| Koordinasyon toplantısı | Fiziksel veya video konferans | Gereksiz — dashboard yeterli |
| Mükerrer yardım sevkiyatı | Sık görülmektedir | Minimize edilir |
| Kapsanmayan ihtiyaç alanları | Tespit edilememektedir | Gerçek zamanlı görünür |
| Karar destek | Yok | AI destekli risk analizi |

### 6.2 Stratejik Etki

TURK Interop, teknik bir platform olmanın ötesinde stratejik bir anlam taşımaktadır:

**Türk Dünyası entegrasyonunun somutlaşması.** Ortak dil ve kültürün ötesinde, ortak dijital altyapı, bölgesel entegrasyonun en güçlü göstergelerinden biridir.

**Uluslararası standartlarla uyum.** Sendai Afet Risk Azaltma Çerçevesi (2015-2030) ve BM Sürdürülebilir Kalkınma Hedefleri (SDG 11, 13) ile doğrudan örtüşmektedir.

**Model ihracatı potansiyeli.** Başarılı bir pilot, benzer coğrafi ve kültürel bağlara sahip diğer bölgesel örgütler için referans model oluşturabilir.

### 6.3 Ölçülebilir Başarı Kriterleri

Projenin başarısı aşağıdaki ölçütlerle değerlendirilecektir:

- Pilot fazda en az 3 ülkenin aktif kullanımı
- Kriz bildirimi süresinin 10 dakikanın altına inmesi
- Sistem erişilebilirliğinin %99.5 üzerinde seyretmesi
- Kullanıcı memnuniyetinin operatör anketlerinde %80 üzerinde çıkması
- İlk 18 ayda en az bir gerçek kriz senaryosunda aktif kullanım

---

## 7. Sonuç

TURK Interop, Türk Dünyası devletleri arasındaki dijital koordinasyon boşluğunu kapatmaya yönelik, teknik olarak uygulanabilir ve siyasi olarak gerçekçi bir çözüm sunmaktadır.

Platform, egemenlik ilkesini merkeze alarak tasarlanmıştır. Ülkeler, kendi iç sistemlerini değiştirmek zorunda kalmadan platforma entegre olabilmektedir. Ortak veri standardı, bir dayatma değil; gönüllü bir kolaylaştırıcıdır.

Yapay zeka entegrasyonu, koordinatörlerin bilgi yüküyle boğulmadan kritik kararlara odaklanmasını sağlamaktadır. Ancak sistem, insan kararını desteklemek için tasarlanmıştır; yerini almak için değil.

Kriz anında saniyeler hayat kurtarır. TURK Interop, bu saniyelerden tasarruf etmek için inşa edilmiştir.

---

## 8. Referanslar

1. UNDRR. (2015). *Sendai Framework for Disaster Risk Reduction 2015-2030*. United Nations Office for Disaster Risk Reduction.
2. UNOCHA. (2023). *Coordination in Complex Emergencies: Lessons from the 2023 Türkiye-Syria Earthquake Response*. UN Office for the Coordination of Humanitarian Affairs.
3. Türk Devletleri Teşkilatı. (2022). *Dijital Dönüşüm Stratejisi 2022-2026*. TDT Genel Sekreterliği.
4. AFAD. (2023). *2023 Kahramanmaraş Depremleri Koordinasyon Raporu*. Afet ve Acil Durum Yönetimi Başkanlığı.
5. Newman, S. (2021). *Building Microservices: Designing Fine-Grained Systems* (2nd ed.). O'Reilly Media.
6. OpenAI. (2024). *GPT-4 Technical Report*. OpenAI.
7. ISO/IEC 27001:2022. *Information Security Management Systems — Requirements*. International Organization for Standardization.

---

*Bu whitepaper, TURK Interop projesinin teknik ve stratejik temellerini belgelemek amacıyla hazırlanmıştır. İçerik, projenin gelişimine paralel olarak güncellenecektir.*

**Versiyon:** 1.0
**Son Güncelleme:** Mayıs 2026
**Durum:** Taslak — İnceleme Aşamasında
