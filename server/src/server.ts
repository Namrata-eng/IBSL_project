import fs from 'node:fs';
import path from 'node:path';
import './config/env.js';
import { UPLOAD_DIR } from './config/env.js';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import api from './routes/api.js';
import { connectDb, seedDefaultAdmin } from './models/index.js';

// Ensure the upload directory exists
try {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
} catch (dirErr) {
  console.warn('⚠️ Warning creating primary UPLOAD_DIR (will use local fallback):', dirErr);
}

const app = express();
app.set('trust proxy', 1);

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// Allow CORS for any requesting origin (localhost, EC2 IP, domain, HTTP/HTTPS) with credentials
app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 1000 }));

// Serve uploaded media files with caching headers
app.use('/uploads', express.static(UPLOAD_DIR, {
  maxAge: '30d',
  immutable: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.get('/api/health', (_req, res) => {
  const connected = mongoose.connection.readyState === 1;
  res.status(connected ? 200 : 503).json({ status: connected ? 'ok' : 'unavailable', database: connected });
});

app.use('/api', api);

app.use((err: any, _req: any, res: any, _next: any) => {
  console.error('❌ Global Server Error:', err);
  if (err?.name === 'ZodError') {
    const errorDetails = err.errors?.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ') || err.message;
    return res.status(400).json({ message: `Validation Error: ${errorDetails}`, errors: err.errors });
  }
  res.status(err.status || 500).json({ message: err.message || 'Something went wrong. Please try again.' });
});

const port = Number(process.env.PORT) || 5000;
app.listen(port, () => console.log(`ISKCON Kopargaon API listening on port ${port}`));

if (!process.env.MONGODB_URI) {
  console.log('Using default local MongoDB URI: mongodb://127.0.0.1:27017/iskcon_kopargaon');
}

connectDb()
  .then(() => seedDefaultAdmin())
  .catch(error => console.error('MongoDB connection notice:', error.message));
