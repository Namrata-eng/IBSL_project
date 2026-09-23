import './config/env.js';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import api from './routes/api.js';
import { connectDb, seedDefaultAdmin } from './models/index.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 500 }));

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
