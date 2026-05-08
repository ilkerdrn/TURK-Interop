require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const { CRISIS_TYPES, SEVERITY_LEVELS, STATUS_TYPES } = require('../../shared/schema');

const app = express();
app.use(cors());
app.use(express.json());

// In-memory store (MVP — production'da PostgreSQL)
let events = [];

// Middleware: basit API key kontrolü
const authMiddleware = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// Validasyon
const validateEvent = (body) => {
  const errors = [];
  if (!body.title) errors.push('title required');
  if (!CRISIS_TYPES.includes(body.type)) errors.push(`type must be one of: ${CRISIS_TYPES.join(', ')}`);
  if (!SEVERITY_LEVELS.includes(body.severity)) errors.push(`severity must be one of: ${SEVERITY_LEVELS.join(', ')}`);
  if (!body.location?.country) errors.push('location.country required');
  if (!body.location?.coordinates?.lat || !body.location?.coordinates?.lng) errors.push('coordinates required');
  if (!body.reportedBy) errors.push('reportedBy (country code) required');
  return errors;
};

// GET /events — tüm olayları listele
app.get('/events', (req, res) => {
  const { country, type, severity, status } = req.query;
  let result = [...events];
  if (country) result = result.filter(e => e.location.country === country.toUpperCase());
  if (type) result = result.filter(e => e.type === type);
  if (severity) result = result.filter(e => e.severity === severity);
  if (status) result = result.filter(e => e.status === status);
  res.json({ count: result.length, events: result });
});

// GET /events/:id
app.get('/events/:id', (req, res) => {
  const event = events.find(e => e.id === req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });
  res.json(event);
});

// POST /events — yeni kriz olayı oluştur
app.post('/events', authMiddleware, (req, res) => {
  const errors = validateEvent(req.body);
  if (errors.length) return res.status(400).json({ errors });

  const event = {
    id: uuidv4(),
    type: req.body.type,
    title: req.body.title,
    description: req.body.description || '',
    severity: req.body.severity,
    status: 'active',
    location: {
      country: req.body.location.country.toUpperCase(),
      city: req.body.location.city || '',
      coordinates: req.body.location.coordinates,
      affectedRadiusKm: req.body.location.affectedRadiusKm || 0
    },
    impact: {
      affectedPopulation: req.body.impact?.affectedPopulation || 0,
      casualties: req.body.impact?.casualties || 0,
      injured: req.body.impact?.injured || 0,
      displaced: req.body.impact?.displaced || 0
    },
    needs: req.body.needs || [],
    reportedBy: req.body.reportedBy.toUpperCase(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  events.push(event);
  console.log(`[CRISIS] New event: ${event.id} — ${event.title} (${event.location.country})`);
  res.status(201).json(event);
});

// PATCH /events/:id — güncelle
app.patch('/events/:id', authMiddleware, (req, res) => {
  const idx = events.findIndex(e => e.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Event not found' });

  const allowed = ['title', 'description', 'severity', 'status', 'impact', 'needs'];
  allowed.forEach(field => {
    if (req.body[field] !== undefined) {
      events[idx][field] = req.body[field];
    }
  });
  events[idx].updatedAt = new Date().toISOString();

  if (req.body.status && !STATUS_TYPES.includes(req.body.status)) {
    return res.status(400).json({ error: `status must be one of: ${STATUS_TYPES.join(', ')}` });
  }

  res.json(events[idx]);
});

// DELETE /events/:id — kapat (soft delete yerine status=resolved)
app.delete('/events/:id', authMiddleware, (req, res) => {
  const idx = events.findIndex(e => e.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Event not found' });
  events[idx].status = 'resolved';
  events[idx].updatedAt = new Date().toISOString();
  res.json({ message: 'Event resolved', event: events[idx] });
});

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'crisis-service' }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Crisis Service running on port ${PORT}`));
