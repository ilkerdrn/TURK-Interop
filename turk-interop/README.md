# TURK Interop — MVP

Türk Dünyası Kriz Koordinasyon Sistemi

## Hızlı Başlangıç

### Geliştirme (manuel)

```bash
# Crisis Service
cd backend/crisis-service
cp .env.example .env
npm install
npm run dev

# Notification Service (yeni terminal)
cd backend/notification-service
npm install
npm run dev

# API Gateway (yeni terminal)
cd backend/api-gateway
cp .env.example .env
npm install
npm run dev

# Frontend (yeni terminal)
cd frontend
npm install
npm run dev
```

Aç: http://localhost:5173

### Docker ile

```bash
docker-compose up --build
```

## Test Kullanıcıları

| Kullanıcı | Şifre | Ülke | Rol |
|---|---|---|---|
| tr-admin | tr123 | TR | admin |
| az-admin | az123 | AZ | admin |
| kz-admin | kz123 | KZ | admin |
| observer | obs123 | ALL | observer |

## API Örnekleri

```bash
# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"tr-admin","password":"tr123"}'

# Olayları listele
curl http://localhost:3000/api/events \
  -H "Authorization: Bearer <TOKEN>"

# Yeni olay oluştur
curl -X POST http://localhost:3000/api/crisis/events \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "earthquake",
    "title": "Doğu Anadolu Depremi",
    "severity": "critical",
    "location": {
      "country": "TR",
      "city": "Malatya",
      "coordinates": { "lat": 38.35, "lng": 38.31 },
      "affectedRadiusKm": 150
    },
    "impact": { "affectedPopulation": 500000, "casualties": 1200, "injured": 8000 },
    "needs": ["rescue", "medical", "shelter"],
    "reportedBy": "TR"
  }'
```

## Servisler

| Servis | Port | Açıklama |
|---|---|---|
| API Gateway | 3000 | Auth, routing, rate limiting |
| Crisis Service | 3001 | Olay CRUD |
| Notification Service | 3002 | Webhook bildirimleri |
| Frontend | 5173 | React dashboard |
