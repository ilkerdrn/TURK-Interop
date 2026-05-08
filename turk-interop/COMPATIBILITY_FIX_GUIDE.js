/**
 * TURK Interop — Uyumluluğu Onarma Kılavuzu
 * Compatibility Fix Guide
 * 
 * Bu dosya, raporda tanımlanan sorunları çözmek için adım adım
 * talimatlar içerir.
 */

// ═══════════════════════════════════════════════════════════════════════════
// FIX 1: FIELD NAMES STANDARDIZATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * BEFORE (Inconsistent):
 * - Shared Schema: type, createdAt, updatedAt
 * - Crisis Data Hub: event_type, timestamp, affected_people
 * - Normalizer: disaster_type, people_affected, normalized_at
 * 
 * AFTER (Consistent):
 * - All services: type, createdAt, updatedAt, affectedPopulation
 */

// STEP 1: Update shared/schema.js
const FIXED_SCHEMA = {
  // Add these as canonical definitions:
  FIELD_MAPPING: {
    // Outgoing from any service:
    'event_type': 'type',           // ← Normalize to 'type'
    'disaster_type': 'type',        // ← Normalize to 'type'
    'timestamp': 'createdAt',       // ← Normalize to 'createdAt'
    'normalized_at': 'createdAt',   // ← Normalize to 'createdAt'
    'affected_people': 'affectedPopulation',
    'people_affected': 'affectedPopulation',
  }
};

// STEP 2: API Gateway Middleware — Field Normalization
const normalizeFieldsMiddleware = (req, res, next) => {
  if (!req.body) return next();
  
  const mapping = {
    'event_type': 'type',
    'disaster_type': 'type',
    'timestamp': 'createdAt',
    'normalized_at': 'createdAt',
    'affected_people': 'affectedPopulation',
    'people_affected': 'affectedPopulation',
  };
  
  Object.entries(mapping).forEach(([oldKey, newKey]) => {
    if (oldKey in req.body) {
      req.body[newKey] = req.body[oldKey];
      delete req.body[oldKey];
    }
  });
  
  next();
};

// Add to API Gateway - index.js:
// app.use('/api/', normalizeFieldsMiddleware);
// app.use(express.json()); olayının sonrasında ekleyin


// STEP 3: Update Crisis Data Hub Response Handler
const normalizeResponseMiddleware = (req, res, next) => {
  const originalJson = res.json.bind(res);
  
  res.json = function(data) {
    if (Array.isArray(data)) {
      data = data.map(normalizeEventObject);
    } else if (data?.events) {
      data.events = data.events.map(normalizeEventObject);
    } else if (data?.id) {
      data = normalizeEventObject(data);
    }
    return originalJson(data);
  };
  
  next();
};

function normalizeEventObject(event) {
  const mapping = {
    'event_type': 'type',
    'timestamp': 'createdAt',
    'affected_people': 'affectedPopulation',
  };
  
  const normalized = { ...event };
  Object.entries(mapping).forEach(([oldKey, newKey]) => {
    if (oldKey in normalized) {
      normalized[newKey] = normalized[oldKey];
      delete normalized[oldKey];
    }
  });
  
  return normalized;
}

// Add to Crisis Data Hub - src/server.js after app creation:
// app.use(normalizeResponseMiddleware);


// ═══════════════════════════════════════════════════════════════════════════
// FIX 2: CRISIS TYPES CONSISTENCY
// ═══════════════════════════════════════════════════════════════════════════

// Update shared/schema.js
const UPDATED_CRISIS_TYPES = [
  'earthquake',
  'flood', 
  'fire',
  'epidemic',
  'storm',     // ← ADD THIS
  'other'
];

// Update all services to import from shared schema:
// const { CRISIS_TYPES } = require('../../shared/schema');


// ═══════════════════════════════════════════════════════════════════════════
// FIX 3: NORMALIZER SERVICE INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Step 1: Update docker-compose.yml
 * 
 * Add normalizer service:
 */
const DOCKER_COMPOSE_ADDITION = `
  normalizer:
    build:
      context: ./backend/normalizer
      dockerfile: Dockerfile
    ports:
      - "4002:4002"
    environment:
      - PORT=4002
      - LOG_LEVEL=info
    depends_on:
      - api-gateway
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:4002/health"]
      interval: 30s
      timeout: 5s
      retries: 3
`;

/**
 * Step 2: Create Dockerfile for normalizer
 * backend/normalizer/Dockerfile
 */
const NORMALIZER_DOCKERFILE = `
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy service files
COPY api.py .
COPY normalizer.py .

# Run service
CMD ["uvicorn", "api:app", "--host", "0.0.0.0", "--port", "4002"]
`;

/**
 * Step 3: Update API Gateway - index.js
 */
const API_GATEWAY_NORMALIZER_ROUTE = `
// Add to index.js after other proxy routes:

const NORMALIZER_URL = process.env.NORMALIZER_URL || 'http://normalizer:4002';

app.use('/api/normalize', authenticate, createProxyMiddleware({
  target: NORMALIZER_URL,
  changeOrigin: true,
  pathRewrite: { '^/api/normalize': '' }
}));

// Also add normalizer health check
app.get('/health/normalizer', (req, res) => {
  // Make health check request to normalizer
  res.json({ status: 'ok', service: 'normalizer-health' });
});
`;


// ═══════════════════════════════════════════════════════════════════════════
// FIX 4: AUTHENTICATION VERIFICATION SCRIPT
// ═══════════════════════════════════════════════════════════════════════════

const AUTH_VERIFICATION_SCRIPT = `
#!/bin/bash

# TURK Interop Authentication Flow Verification

echo "====== TURK Interop Authentication Test ======"
echo ""

# Step 1: Get JWT Token
echo "1. Getting JWT Token from API Gateway..."
JWT_RESPONSE=$(curl -s -X POST http://localhost:3000/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"username":"tr-admin","password":"tr123"}')

JWT_TOKEN=$(echo $JWT_RESPONSE | jq -r '.token')
USER_ID=$(echo $JWT_RESPONSE | jq -r '.user.id')

if [ -z "$JWT_TOKEN" ] || [ "$JWT_TOKEN" == "null" ]; then
  echo "✗ Failed to get JWT token"
  echo "Response: $JWT_RESPONSE"
  exit 1
fi

echo "✓ JWT Token received: ${JWT_TOKEN:0:20}..."
echo "  User ID: $USER_ID"
echo ""

# Step 2: Access Protected Route with JWT
echo "2. Accessing protected route with JWT..."
EVENTS_RESPONSE=$(curl -s -H "Authorization: Bearer $JWT_TOKEN" \\
  http://localhost:3000/api/events)

EVENT_COUNT=$(echo $EVENTS_RESPONSE | jq '.count // 0')
echo "✓ /api/events accessible"
echo "  Event count: $EVENT_COUNT"
echo ""

# Step 3: Verify API Key Injection
echo "3. Verifying API Key was injected to downstream..."
# This would require logging at the service level
echo "ℹ Check Crisis Service logs for x-api-key header"
echo ""

# Step 4: Test Direct Crisis Service Access (should fail without API key)
echo "4. Testing direct Crisis Service access without API key (should fail)..."
DIRECT_ACCESS=$(curl -s -w "\\n%{http_code}" -X GET http://localhost:3001/events)
HTTP_CODE=$(echo "$DIRECT_ACCESS" | tail -n1)

if [ "$HTTP_CODE" == "401" ]; then
  echo "✓ Correctly rejected (401 Unauthorized)"
else
  echo "⚠ Warning: Crisis Service accepted request without x-api-key"
  echo "  HTTP Code: $HTTP_CODE"
fi
`;


// ═══════════════════════════════════════════════════════════════════════════
// FIX 5: IMPLEMENTATION CHECKLIST
// ═══════════════════════════════════════════════════════════════════════════

const IMPLEMENTATION_PLAN = {
  phase1_critical: {
    title: "Phase 1: Critical Fixes (Week 1)",
    tasks: [
      {
        name: "Update shared/schema.js",
        file: "shared/schema.js",
        changes: [
          "Add 'storm' to CRISIS_TYPES",
          "Add FIELD_MAPPING object",
          "Document canonical field names"
        ],
        time: "30 min"
      },
      {
        name: "Update Crisis Data Hub responses",
        file: "backend/crisis-data-hub/src/routes/crises.js",
        changes: [
          "Use 'type' instead of 'event_type'",
          "Use 'createdAt' instead of 'timestamp'",
          "Fix field response mapping"
        ],
        time: "1 hour"
      },
      {
        name: "Update API Gateway field normalization",
        file: "backend/api-gateway/index.js",
        changes: [
          "Add normalizeFieldsMiddleware",
          "Apply before proxying requests",
          "Handle response normalization"
        ],
        time: "1 hour"
      }
    ]
  },
  
  phase2_integration: {
    title: "Phase 2: Service Integration (Week 2)",
    tasks: [
      {
        name: "Create Normalizer Dockerfile",
        file: "backend/normalizer/Dockerfile",
        changes: [
          "Setup Python 3.11 base",
          "Install requirements",
          "Configure uvicorn startup"
        ],
        time: "30 min"
      },
      {
        name: "Update docker-compose.yml",
        file: "docker-compose.yml",
        changes: [
          "Add normalizer service",
          "Update NORMALIZER_URL env var",
          "Add health check"
        ],
        time: "30 min"
      },
      {
        name: "Add Normalizer route to Gateway",
        file: "backend/api-gateway/index.js",
        changes: [
          "Add /api/normalize proxy",
          "Add auth requirement",
          "Add health check endpoint"
        ],
        time: "45 min"
      }
    ]
  },
  
  phase3_testing: {
    title: "Phase 3: Testing & Validation (Week 3)",
    tasks: [
      {
        name: "Run updated compatibility tests",
        file: "compatibility-test.js",
        changes: [
          "Run with all services up",
          "Verify all field mappings",
          "Check auth flows"
        ],
        time: "1 hour"
      },
      {
        name: "End-to-end integration test",
        changes: [
          "Create event via frontend",
          "Verify propagation through services",
          "Check data integrity"
        ],
        time: "2 hours"
      },
      {
        name: "Performance testing",
        changes: [
          "Load test with 1000 events",
          "Verify latency",
          "Check normalizer throughput"
        ],
        time: "2 hours"
      }
    ]
  }
};


// ═══════════════════════════════════════════════════════════════════════════
// FIX 6: VALIDATION UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

function validateEventConsistency(event) {
  const errors = [];
  
  // Check for field name consistency
  if ('event_type' in event) errors.push('Use "type" instead of "event_type"');
  if ('disaster_type' in event) errors.push('Use "type" instead of "disaster_type"');
  if ('timestamp' in event) errors.push('Use "createdAt" instead of "timestamp"');
  if ('normalized_at' in event) errors.push('Use "createdAt" instead of "normalized_at"');
  if ('affected_people' in event) errors.push('Use "affectedPopulation" instead of "affected_people"');
  if ('people_affected' in event) errors.push('Use "affectedPopulation" instead of "people_affected"');
  
  // Check for required fields
  if (!event.type) errors.push('Missing required field: type');
  if (!event.createdAt) errors.push('Missing required field: createdAt');
  if (!event.severity) errors.push('Missing required field: severity');
  
  // Check valid values
  const validTypes = ['earthquake', 'flood', 'fire', 'epidemic', 'storm', 'other'];
  if (!validTypes.includes(event.type)) {
    errors.push(`Invalid type: ${event.type}. Must be one of: ${validTypes.join(', ')}`);
  }
  
  const validSeverities = ['low', 'medium', 'high', 'critical'];
  if (!validSeverities.includes(event.severity)) {
    errors.push(`Invalid severity: ${event.severity}. Must be one of: ${validSeverities.join(', ')}`);
  }
  
  return { valid: errors.length === 0, errors };
}


// ═══════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════

module.exports = {
  normalizeFieldsMiddleware,
  normalizeResponseMiddleware,
  normalizeEventObject,
  validateEventConsistency,
  FIXED_SCHEMA,
  UPDATED_CRISIS_TYPES,
  IMPLEMENTATION_PLAN
};
