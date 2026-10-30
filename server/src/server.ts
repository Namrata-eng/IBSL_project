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
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const app = express();
app.set('trust proxy', 1);

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

const clientUrl = process.env.CLIENT_URL;
app.use(cors({
  origin: clientUrl ? clientUrl.split(',').map((u) => u.trim()) : 'http://localhost:5173',
  credentials: true,
}));

app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 500 }));

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

app.use((_err: any, _req: any, res: any, _next: any) => {
  if (_err?.name === 'ZodError') return res.status(400).json({ message: 'Please check the submitted information.' });
  console.error(_err);
  res.status(500).json({ message: 'Something went wrong. Please try again.' });
});

const port = Number(process.env.PORT) || 5000;
app.listen(port, () => console.log(`ISKCON Kopargaon API listening on port ${port}`));

if (!process.env.MONGODB_URI) {
  console.log('Using default local MongoDB URI: mongodb://127.0.0.1:27017/iskcon_kopargaon');
}

connectDb()
  .then(() => seedDefaultAdmin())
  .catch(error => console.error('MongoDB connection notice:', error.message));
