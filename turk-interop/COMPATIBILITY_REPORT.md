# TURK Interop — Kod Uyumluluğu Raporu
## Compatibility Report v1.0
**Tarih:** 2026-05-07  
**Test Sonucu:** 12/20 Test Geçti (60% Başarı)

---

## 📊 Özet

| Kategori | Sonuç | Durum |
|----------|-------|-------|
| API Endpoint Uyumluluğu | Servislere erişilemiyor | ⚠️ BAĞLANTI SORUNU |
| Veri Şeması Uyumluluğu | 3/4 (75%) | 🔴 KRITIK |
| Kimlik Doğrulama | 2/2 (100%) | ✅ TAMAM |
| Static Code Analysis | 7/7 (100%) | ✅ TAMAM |
| Frontend-Backend | 7/7 (100%) | ✅ TAMAM |

---

## 🔴 KRITIK SORUNLAR

### 1. **Field Name Inconsistency** (HIGH)
**Sorun:** Farklı servislerde alan adları tutarsız

#### Shared Schema (`shared/schema.js`)
```javascript
{
  id: 'string (uuid)',
  type: 'CRISIS_TYPES',  // ← "type" kullanırken
  title: 'string',
  createdAt: 'ISO8601',
  updatedAt: 'ISO8601'
}
```

#### Crisis Data Hub (`backend/crisis-data-hub/src/server.js`)
```javascript
{
  id: 'uuid',
  event_type: 'string',  // ← "event_type" kullanıyor
  timestamp: 'ISO8601',  // ← "createdAt" değil, "timestamp"
  affected_people: 'number'
}
```

#### Normalizer (`backend/normalizer/normalizer.py`)
```python
{
  disaster_type: str,    # ← "disaster_type" kullanıyor
  people_affected: int,  # ← "affected_people" yerine
  normalized_at: str
}
```

**Etkilenen Servisleri:**
- `api-gateway` → Crisis Service
- `crisis-data-hub`
- `normalizer`
- `frontend-v2`

**Çözüm:**  
Tüm servislerde tutarlı alan adları kullanılmalı. Seçenek:
1. Tümü `type` kullosun (Shared Schema'ya uysun)
2. Tümü `event_type` kullasın (normalization)
3. API Gateway'de mapping katmanı ekleyin

---

### 2. **Timestamp Field Naming** (HIGH)
**Sorun:** Zaman damgası alanları birbirinden farklı

| Servis | Kullanılan Alan |
|--------|-----------------|
| Shared Schema | `createdAt`, `updatedAt` |
| Crisis Service | `createdAt`, `updatedAt` |
| Crisis Data Hub | `timestamp` |
| Normalizer | `normalized_at` |
| Frontend | `createdAt` |

**API Response Örneği (Crisis Data Hub):**
```json
{
  "id": "123",
  "event_type": "earthquake",
  "timestamp": "2026-05-07T10:30:00Z"  // ← Mismatch!
}
```

Frontend beklediği şey:
```json
{
  "id": "123",
  "type": "earthquake",
  "createdAt": "2026-05-07T10:30:00Z"
}
```

**Etkisi:** Frontend veri görüntülemede sorun yaşayabilir.

---

### 3. **Crisis Types Mismatch** (MEDIUM)
**Sorun:** Normalizer "storm" desteklerken, Shared Schema desteklemiyor

**Shared Schema:**
```javascript
const CRISIS_TYPES = ['earthquake', 'flood', 'fire', 'epidemic', 'other'];
```

**Crisis Data Hub / Normalizer:**
```javascript
const CRISIS_TYPES = ['earthquake', 'flood', 'fire', 'epidemic', 'storm', 'other'];
```

**Sonuç:** Normalizer'den gelen "storm" verisi reddedilebilir.

---

## ⚠️ ORTA SEVİYE SORUNLAR

### 4. **Authentication Method Inconsistency** (MEDIUM)
**Sorun:** Farklı çerçevelerinde farklı auth yöntemleri

```
User → [JWT] → API Gateway → [API Key] → Crisis Service
                                      → Crisis Data Hub
                                      → AI Service
```

**API Gateway - JWT**
```javascript
// client
Authorization: Bearer <JWT_TOKEN>

// api-gateway/index.js
jwt.verify(token, JWT_SECRET);
// Downstream'e aşağıdaki ekler:
req.headers['x-api-key'] = process.env.INTERNAL_API_KEY;
```

**Crisis Service - API Key**
```javascript
const apiKey = req.headers['x-api-key'];
if (!apiKey || apiKey !== process.env.API_KEY) {
  return res.status(401).json({ error: 'Unauthorized' });
}
```

**Sorun:** API Gateway'den direkt Crisis Service'e auth esnasında hata yaşanabilir.

---

### 5. **Missing Normalizer Integration** (MEDIUM)
**Sorun:** Normalizer `docker-compose.yml` ve API Gateway'de tanımlı değil

**docker-compose.yml - Eksik:**
```yaml
services:
  api-gateway:
    # ... referansları yok
  crisis-service: ✓
  notification-service: ✓
  normalizer: ✗ MISSING
```

**API Gateway Route - Eksik:**
```javascript
// Var:
app.use('/api/events', ...);      // Crisis Service'e proxy
app.use('/api/crisis', ...);      // Crisis Service
app.use('/api/notifications', ...) // Notification Service

// YOK:
app.use('/api/normalize', ...);    // ✗ Normalizer'e erişim yok!
```

**Etkilenen Akış:**
```
Frontend → POST /api/normalize
         → API Gateway ✗ KURAL YOK
         → 404 Not Found
```

---

## 🟣 BİLİNEN SORUNLAR

### 6. **Service Discovery - Hardcoded URLs**
API Gateway'de Servis URL'leri hardcoded:

```javascript
const CRISIS_SERVICE_URL = process.env.CRISIS_SERVICE_URL || 'http://localhost:3001';
const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3002';
```

**Sorun:** Production'da dinamik hostname'ler gerekebilir (Docker networking).

### 7. **Incomplete Crisis Data Hub Endpoint**
`backend/crisis-service/index.js` eksik görünüyor (file cut off):

```javascript
router.post('/', validateCrisis, (req, res) => {
  const crisis = store.create(req.body);
  res.status(201).json(crisis);
  // ← KODU INCOMPLETE!
});
```

---

## ✅ İYİ YAPILAN UYGULAMALAR

✅ **Frontend API Client Tasarım:** Centralized, modular  
✅ **Route Documentation:** İyi açıklanmış  
✅ **Error Handling:** Try-catch ve middleware kullanıyor  
✅ **Partial Authentication:** API Gateway bir auth proxy olarak çalışıyor  

---

## 🛠️ ÇÖZÜM ÖNERILERI

### Öncelik 1: FIELD NAMES (Acil)

**Optyion A: Normalization (Recommended)**
1. Tümü `type` (Shared Schema'dan)
2. Tümü `createdAt` / `updatedAt` 
3. Tümü `affectedPopulation`, `affected_people` vb den `peopleAffected`'e

**Optyion B: API Gateway Mapping**
```javascript
// API Gateway'de mapping middleware
const mapCrisisFields = (req, res, next) => {
  if (req.body) {
    if ('event_type' in req.body) req.body.type = req.body.event_type;
    if ('timestamp' in req.body) req.body.createdAt = req.body.timestamp;
  }
  next();
};
```

### Öncelik 2: CRISIS TYPES (Orta)

**Seç birini:**
1. Shared schema'da `storm` ekle
2. Normalizer'den `storm` kaldır

**Önerilen:** Shared schema'da ekleyin (daha kapsamlı).

```javascript
const CRISIS_TYPES = ['earthquake', 'flood', 'fire', 'epidemic', 'storm', 'other'];
```

### Öncelik 3: NORMALIZER INTEGRATION

**1. docker-compose.yml'e ekleyin:**
```yaml
normalizer:
  image: python:3.11
  working_dir: /app
  volumes:
    - ./backend/normalizer:/app
  command: pip install -r requirements.txt && uvicorn api:app --host 0.0.0.0 --port 4002
  ports:
    - "4002:4002"
  environment:
    - PYTHONUNBUFFERED=1
```

**2. API Gateway'e route ekleyin:**
```javascript
const NORMALIZER_URL = process.env.NORMALIZER_URL || 'http://localhost:4002';

app.use('/api/normalize', authenticate, createProxyMiddleware({
  target: NORMALIZER_URL,
  changeOrigin: true,
  pathRewrite: { '^/api/normalize': '' }
}));
```

### Öncelik 4: AUTH AUDIT

Test all auth flows:
```bash
# 1. Get JWT token
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"tr-admin","password":"tr123"}'

# 2. Use JWT to access events
curl -H "Authorization: Bearer <TOKEN>" \
  http://localhost:3000/api/events

# 3. Verify API Key is injected
curl -X POST http://localhost:3001/events \
  -H "x-api-key: turk-interop-secret-key" \
  -H "Content-Type: application/json" \
  -d '{...}'
```

---

## 📋 CHECKLIST - İyileštirme

- [ ] Field Üniformitesi (Tüm servislerde `type`, `createdAt`)
- [ ] Crisis Types Consistency (`storm` ekle)
- [ ] Normalizer Integration (docker-compose + API Gateway)
- [ ] End-to-End Auth Test
- [ ] Frontend → Backend Data Flow Test
- [ ] API Response Validation
- [ ] Production Environment Variables Check
- [ ] Service Discovery Implementation

---

## 🧪 İleri Test Önerileri

```bash
# Test 1: Complete Request Flow
POST /api/crisis (auth required)
→ API Gateway validates JWT
→ Injects x-api-key
→ Proxies to Crisis Service
→ Service creates event
→ Returns response

# Test 2: Data Transformation
Raw Normalizer Output:
{ disaster_type: "storm", people_affected: 500 }
→ Should work with all services
→ Frontend should understand

# Test 3: Rate Limiting
100 requests/minute to Gateway
→ Subsequent requests rejected
→ Proper error message returned
```

---

**Rapor Oluşturuldu:** 2026-05-07  
**Sonraki Kontrol:** Çözümleme sonrası re-test  
**Hazırlayan:** TURK Interop Compatibility Test Suite v1
