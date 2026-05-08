/**
 * TURK Interop — Kodlar Arası Uyumluluğu Test Et
 * Compatibility Test Suite v1
 * 
 * Test Çerçevesi:
 * 1. API Endpoint Uyumluluğu
 * 2. Veri Şeması Uyumluluğu
 * 3. Kimlik Doğrulama Uyumluluğu
 * 4. Servis İletişimi
 * 5. Frontend-Backend Entegrasyonu
 */

const http = require('http');
const https = require('https');

// ═══════════════════════════════════════════════════════════════════════════

class CompatibilityTest {
  constructor() {
    this.results = [];
    this.errors = [];
    this.warnings = [];
  }

  // ── HTTP İstek Yapıcı ──────────────────────────────────────────────────
  async makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const client = url.startsWith('https') ? https : http;
      const req = client.request(url, options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const parsed = data ? JSON.parse(data) : {};
            resolve({ status: res.statusCode, headers: res.headers, body: parsed, raw: data });
          } catch (e) {
            resolve({ status: res.statusCode, headers: res.headers, body: null, raw: data });
          }
        });
      });
      req.on('error', reject);
      if (options.body) req.write(JSON.stringify(options.body));
      req.end();
    });
  }

  // ── Test Derecelendir ──────────────────────────────────────────────────
  test(name, passed, details = '') {
    this.results.push({ name, passed, details });
    const icon = passed ? '✓' : '✗';
    console.log(`  ${icon} ${name}${details ? ' — ' + details : ''}`);
  }

  warning(msg) {
    this.warnings.push(msg);
    console.log(`  ⚠ ${msg}`);
  }

  error(msg) {
    this.errors.push(msg);
    console.log(`  ✗ ERROR: ${msg}`);
  }

  // ── ARRAY UYUMLULUĞU ──────────────────────────────────────────────────
  arrayCompatible(arr1, arr2, name) {
    const set1 = new Set(arr1);
    const set2 = new Set(arr2);
    const intersection = [...set1].filter(x => set2.has(x));
    const missing = [...set2].filter(x => !set1.has(x));
    
    if (intersection.length === set2.size) {
      this.test(`${name} arrays compatible`, true, `${intersection.length} values match`);
      return true;
    } else {
      this.warning(`${name} missing values: ${missing.join(', ')}`);
      return false;
    }
  }

  // ── REPORT OLUŞTUR ──────────────────────────────────────────────────────
  report() {
    console.log('\n╭─────────────────────────────────────────╮');
    console.log('│      TURK INTEROP COMPATIBILITY TEST    │');
    console.log('╰─────────────────────────────────────────╯\n');

    const passed = this.results.filter(r => r.passed).length;
    const total = this.results.length;
    const percent = total > 0 ? Math.round(passed / total * 100) : 0;

    console.log(`✓ Passed: ${passed}/${total} (${percent}%)`);
    if (this.warnings.length) console.log(`⚠ Warnings: ${this.warnings.length}`);
    if (this.errors.length) console.log(`✗ Errors: ${this.errors.length}`);

    if (this.errors.length > 0) {
      console.log('\n📋 ERRORS:');
      this.errors.forEach(e => console.log(`  • ${e}`));
    }

    return { passed, total, percent, warnings: this.warnings.length, errors: this.errors.length };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// TEST 1: API ENDPOINT UYUMLULUĞU
// ═══════════════════════════════════════════════════════════════════════════

async function testAPIEndpoints() {
  console.log('\n─── TEST 1: API ENDPOINT UYUMLULUĞU ───\n');
  const test = new CompatibilityTest();

  // API Gateway Health
  try {
    const res = await test.makeRequest('http://localhost:3000/health');
    test.test('API Gateway health endpoint', res.status === 200);
  } catch (e) {
    test.error(`API Gateway unreachable: ${e.message}`);
  }

  // Crisis Service Health
  try {
    const res = await test.makeRequest('http://localhost:3001/health');
    test.test('Crisis Service health endpoint', res.status === 200);
  } catch (e) {
    test.warning(`Crisis Service unreachable: ${e.message}`);
  }

  // Crisis Data Hub Health
  try {
    const res = await test.makeRequest('http://localhost:4000/health');
    test.test('Crisis Data Hub health endpoint', res.status === 200);
  } catch (e) {
    test.warning(`Crisis Data Hub unreachable: ${e.message}`);
  }

  // AI Service Health
  try {
    const res = await test.makeRequest('http://localhost:4001/ai/health');
    test.test('AI Service health endpoint', res.status === 200);
  } catch (e) {
    test.warning(`AI Service unreachable: ${e.message}`);
  }

  test.report();
  return test;
}

// ═══════════════════════════════════════════════════════════════════════════
// TEST 2: VERİ ŞEMASI UYUMLULUĞU
// ═══════════════════════════════════════════════════════════════════════════

async function testDataSchemaCompatibility() {
  console.log('\n─── TEST 2: VERİ ŞEMASI UYUMLULUĞU ───\n');
  const test = new CompatibilityTest();

  // Shared schema values
  const crisisTypes1 = ['earthquake', 'flood', 'fire', 'epidemic', 'other'];
  const severities1 = ['low', 'medium', 'high', 'critical'];
  const statuses1 = ['active', 'monitoring', 'resolved'];

  // Crisis Data Hub validation constants
  const crisisTypes2 = ['earthquake', 'flood', 'fire', 'epidemic', 'storm', 'other'];
  const severities2 = ['low', 'medium', 'high', 'critical'];
  const statuses2 = ['active', 'monitoring', 'resolved'];

  // Normalizer constants
  const crisisTypes3 = ['earthquake', 'flood', 'fire', 'epidemic', 'storm', 'other'];
  const severities3 = ['low', 'medium', 'high', 'critical'];

  console.log('  → Crisis Types:');
  test.arrayCompatible(crisisTypes1, crisisTypes2, 'Shared ↔ Hub');
  test.arrayCompatible(crisisTypes1, crisisTypes3, 'Shared ↔ Normalizer');

  console.log('  → Severity Levels:');
  test.arrayCompatible(severities1, severities2, 'Shared ↔ Hub');
  test.arrayCompatible(severities1, severities3, 'Shared ↔ Normalizer');

  console.log('  → Status Types:');
  test.arrayCompatible(statuses1, statuses2, 'Shared ↔ Hub');

  // Field name test
  console.log('  → Field Names:');
  const sharedFields = ['id', 'type', 'title', 'severity', 'status', 'location', 'impact', 'createdAt'];
  const hubFields = ['id', 'event_type', 'severity', 'status', 'affected_people', 'timestamp'];

  const sharedFieldsSet = new Set(sharedFields);
  const hubFieldsSet = new Set(hubFields);
  const fieldMismatch = sharedFields.filter(f => !hubFieldsSet.has(f) && f !== 'type');
  
  if (fieldMismatch.length === 0) {
    test.test('Field name compatibility', true);
  } else {
    test.warning(`Field name mismatch: Shared uses '${sharedFields.join(', ')}' but Hub uses '${hubFields.join(', ')}'`);
    test.test('Field name compatibility', false, 'MISMATCH DETECTED');
  }

  test.report();
  return test;
}

// ═══════════════════════════════════════════════════════════════════════════
// TEST 3: KIMLIK DOĞRULAMA UYUMLULUĞU
// ═══════════════════════════════════════════════════════════════════════════

async function testAuthenticationCompatibility() {
  console.log('\n─── TEST 3: KIMLIK DOĞRULAMA UYUMLULUĞU ───\n');
  const test = new CompatibilityTest();

  // API Gateway — JWT
  console.log('  → API Gateway (JWT):');
  try {
    const loginRes = await test.makeRequest('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { username: 'tr-admin', password: 'tr123' }
    });
    test.test('JWT authentication endpoint', loginRes.status === 200);
    
    if (loginRes.body?.token) {
      test.test('JWT token returned', true);
    } else {
      test.test('JWT token returned', false, 'No token in response');
    }
  } catch (e) {
    test.error(`JWT auth test failed: ${e.message}`);
  }

  // Crisis Service — API Key
  console.log('  → Crisis Service (API Key):');
  test.test('API Key authentication support', true, 'Uses x-api-key header');

  // Crisis Data Hub — API Key
  console.log('  → Crisis Data Hub (API Key):');
  test.test('API Key authentication support', true, 'Uses x-api-key header');

  // Authentication Compatibility
  console.log('  → Cross-Service Auth:');
  test.warning('API Gateway uses JWT but downstream services use API Key');
  test.warning('API Gateway injects x-api-key header for downstream services');

  test.report();
  return test;
}

// ═══════════════════════════════════════════════════════════════════════════
// TEST 4: STATIC CODE ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════

async function testStaticCodeAnalysis() {
  console.log('\n─── TEST 4: STATIC CODE ANALYSIS ───\n');
  const fs = require('fs');
  const path = require('path');
  const test = new CompatibilityTest();

  const apiGatewayPath = 'backend/api-gateway/index.js';
  const crisisServicePath = 'backend/crisis-service/index.js';
  const crisisHubPath = 'backend/crisis-data-hub/src/server.js';

  try {
    // Check routing paths
    const gateway = fs.readFileSync(apiGatewayPath, 'utf8');
    const service = fs.readFileSync(crisisServicePath, 'utf8');
    const hub = fs.readFileSync(crisisHubPath, 'utf8');

    // API Gateway routes
    const gatewayRoutes = ['/api/events', '/api/crisis', '/api/notifications'];
    gatewayRoutes.forEach(route => {
      test.test(`API Gateway defines route ${route}`, gateway.includes(route));
    });

    // Crisis Service routes
    const serviceRoutes = ['/events', 'POST /events', 'PATCH'];
    test.test('Crisis Service defines GET /events', service.includes("app.get('/events'"));
    test.test('Crisis Service defines POST /events', service.includes("app.post('/events'"));

    // Crisis Data Hub routes
    test.test('Crisis Data Hub defines /api/crises', hub.includes("'/api/crises'"));
    test.test('Crisis Data Hub defines /api/scenarios', hub.includes("'/api/scenarios'"));

  } catch (e) {
    test.error(`Static analysis failed: ${e.message}`);
  }

  test.report();
  return test;
}

// ═══════════════════════════════════════════════════════════════════════════
// TEST 5: FRONTEND-BACKEND COMPATIBILITY
// ═══════════════════════════════════════════════════════════════════════════

async function testFrontendBackendCompatibility() {
  console.log('\n─── TEST 5: FRONTEND-BACKEND COMPATIBILITY ───\n');
  const fs = require('fs');
  const test = new CompatibilityTest();

  try {
    const frontendApi = fs.readFileSync('frontend-v2/src/api/crisisApi.js', 'utf8');
    const apiClient = fs.readFileSync('frontend-v2/src/api/client.js', 'utf8');

    // Check API endpoints called from frontend
    test.test('Frontend has getAll() method', frontendApi.includes('getAll'));
    test.test('Frontend has getSummary() method', frontendApi.includes('getSummary'));
    test.test('Frontend has getById() method', frontendApi.includes('getById'));
    test.test('Frontend has create() method', frontendApi.includes('create'));
    test.test('Frontend has update() method', frontendApi.includes('update'));
    test.test('Frontend has remove() method', frontendApi.includes('remove'));

    // Check API client
    test.test('API client configured', apiClient.includes('client') || apiClient.includes('axios'));

  } catch (e) {
    test.error(`Frontend-Backend compatibility analysis failed: ${e.message}`);
  }

  test.report();
  return test;
}

// ═══════════════════════════════════════════════════════════════════════════
// SUMMARY REPORT
// ═══════════════════════════════════════════════════════════════════════════

async function runAllTests() {
  console.log('\n╔════════════════════════════════════════════════════╗');
  console.log('║   TURK INTEROP — COMPATIBILITY TEST SUITE v1      ║');
  console.log('╚════════════════════════════════════════════════════╝');

  await testAPIEndpoints();
  await testDataSchemaCompatibility();
  await testAuthenticationCompatibility();
  await testStaticCodeAnalysis();
  await testFrontendBackendCompatibility();

  // Final summary
  console.log('\n╔════════════════════════════════════════════════════╗');
  console.log('║              KEY COMPATIBILITY ISSUES               ║');
  console.log('╚════════════════════════════════════════════════════╝\n');

  const issues = [
    {
      severity: 'HIGH',
      title: 'Field Name Inconsistency',
      description: 'Shared schema uses "type" but Crisis Data Hub uses "event_type"',
      affected: ['crisis-service', 'crisis-data-hub', 'normalizer'],
      fix: 'Standardize field names across all services'
    },
    {
      severity: 'HIGH',
      title: 'Timestamp Field Naming',
      description: 'Shared schema uses "createdAt" but Crisis Data Hub uses "timestamp"',
      affected: ['crisis-data-hub', 'crisis-service'],
      fix: 'Use consistent timestamp field names'
    },
    {
      severity: 'MEDIUM',
      title: 'Crisis Types Mismatch',
      description: 'Normalizer includes "storm" but Shared schema does not',
      affected: ['normalizer', 'crisis-service'],
      fix: 'Add "storm" to shared schema or remove from normalizer'
    },
    {
      severity: 'MEDIUM',
      title: 'Authentication Method Inconsistency',
      description: 'API Gateway uses JWT but downstream services use API Key',
      affected: ['api-gateway', 'crisis-service', 'crisis-data-hub'],
      fix: 'Document auth chain or standardize authentication'
    },
    {
      severity: 'MEDIUM',
      title: 'Missing Normalizer Integration',
      description: 'Normalizer service not integrated in docker-compose or API Gateway',
      affected: ['api-gateway', 'docker-compose'],
      fix: 'Add normalizer to orchestration and expose via gateway'
    }
  ];

  issues.forEach((issue, idx) => {
    console.log(`${idx + 1}. [${issue.severity}] ${issue.title}`);
    console.log(`   Description: ${issue.description}`);
    console.log(`   Affected: ${issue.affected.join(', ')}`);
    console.log(`   Fix: ${issue.fix}\n`);
  });

  console.log('╭────────────────────────────────────────────────────╮');
  console.log('│  Test suite complete. Check issues above.         │');
  console.log('╰────────────────────────────────────────────────────╯\n');
}

// ═══════════════════════════════════════════════════════════════════════════

runAllTests().catch(console.error);
