import 'dotenv/config';
import express from 'express';
import cors    from 'cors';
import aiRoutes from './routes/ai.js';

const app  = express();
const PORT = process.env.PORT || 4001;

app.use(cors());
app.use(express.json());

// API key guard — sadece bu servise özel
app.use((req, res, next) => {
  if (req.path === '/ai/health') return next();
  const key = req.headers['x-api-key'];
  if (!key || key !== (process.env.API_KEY || 'hub-secret-key-2024')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});

app.use('/ai', aiRoutes);

app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`\n🤖 TURK Interop — AI Service`);
  console.log(`   Running on http://localhost:${PORT}`);
  console.log(`   Model: ${process.env.OPENAI_MODEL || 'gpt-4o-mini'}\n`);
});
