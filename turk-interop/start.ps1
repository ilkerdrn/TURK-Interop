# TURK Interop — Tek Komutla Başlat
# Kullanım: ./start.ps1

Write-Host "`n🌍 TURK Interop baslatiliyor...`n" -ForegroundColor Cyan

# .env yoksa oluştur
$envPath = "backend/crisis-data-hub/.env"
if (-not (Test-Path $envPath)) {
    Copy-Item "backend/crisis-data-hub/.env.example" $envPath
    Write-Host "✅ .env olusturuldu" -ForegroundColor Green
}

# Backend bağımlılıkları
Write-Host "📦 Backend bagimliliklar yukleniyor..." -ForegroundColor Yellow
Set-Location backend/crisis-data-hub
npm install --silent
Set-Location ../..

# Frontend bağımlılıkları
Write-Host "📦 Frontend bagimliliklar yukleniyor..." -ForegroundColor Yellow
Set-Location frontend-v2
npm install --silent
Set-Location ..

Write-Host "`n✅ Hazir! Simdi 2 terminal ac:`n" -ForegroundColor Green
Write-Host "  Terminal 1 (Backend):" -ForegroundColor White
Write-Host "    cd turk-interop/backend/crisis-data-hub" -ForegroundColor Gray
Write-Host "    node src/server.js`n" -ForegroundColor Gray
Write-Host "  Terminal 2 (Frontend):" -ForegroundColor White
Write-Host "    cd turk-interop/frontend-v2" -ForegroundColor Gray
Write-Host "    npm run dev`n" -ForegroundColor Gray
Write-Host "  Tarayici: http://localhost:5174`n" -ForegroundColor Cyan
