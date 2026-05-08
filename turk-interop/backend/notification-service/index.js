require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Kayıtlı webhook'lar (MVP — production'da DB'de tutulur)
let webhooks = [
  // { id, country, url, events: ['earthquake', 'flood', ...] }
];

// Bildirim log'u
let notificationLog = [];

// Webhook kaydet
app.post('/webhooks', (req, res) => {
  const { country, url, events } = req.body;
  if (!country || !url) return res.status(400).json({ error: 'country and url required' });

  const webhook = {
    id: `${country}-${Date.now()}`,
    country: country.toUpperCase(),
    url,
    events: events || ['all'],
    createdAt: new Date().toISOString()
  };
  webhooks.push(webhook);
  res.status(201).json(webhook);
});

// Webhook listele
app.get('/webhooks', (req, res) => res.json(webhooks));

// Webhook sil
app.delete('/webhooks/:id', (req, res) => {
  webhooks = webhooks.filter(w => w.id !== req.params.id);
  res.json({ message: 'Webhook removed' });
});

// Bildirim gönder (crisis-service tarafından çağrılır)
app.post('/notify', async (req, res) => {
  const { event } = req.body;
  if (!event) return res.status(400).json({ error: 'event payload required' });

  const targets = webhooks.filter(w =>
    w.events.includes('all') || w.events.includes(event.type)
  );

  const results = await Promise.allSettled(
    targets.map(async (webhook) => {
      try {
        await axios.post(webhook.url, { event }, { timeout: 5000 });
        return { webhook: webhook.id, status: 'sent' };
      } catch (err) {
        return { webhook: webhook.id, status: 'failed', error: err.message };
      }
    })
  );

  const log = {
    eventId: event.id,
    eventType: event.type,
    notifiedAt: new Date().toISOString(),
    results: results.map(r => r.value || r.reason)
  };
  notificationLog.push(log);
  console.log(`[NOTIFY] Event ${event.id} — ${targets.length} webhooks notified`);

  res.json(log);
});

// Bildirim geçmişi
app.get('/logs', (req, res) => res.json(notificationLog));

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'notification-service' }));

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Notification Service running on port ${PORT}`));
