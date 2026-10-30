import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import dns from 'node:dns';
import path from 'node:path';

// Load both root .env and server/.env
dotenv.config({ path: fileURLToPath(new URL('../../../.env', import.meta.url)) });
dotenv.config({ path: fileURLToPath(new URL('../../.env', import.meta.url)) });

// Some local networks reject DNS SRV lookups required by mongodb+srv URIs.
// Set DNS_SERVERS only when an explicit resolver is needed, e.g. 1.1.1.1,1.0.0.1.
const dnsServers = process.env.DNS_SERVERS?.split(',').map((server) => server.trim()).filter(Boolean);
if (dnsServers?.length) dns.setServers(dnsServers);

export const SCREENSHOT_RETENTION_VERIFIED_DAYS =
  Number(process.env.SCREENSHOT_RETENTION_VERIFIED_DAYS) || 30;
export const SCREENSHOT_RETENTION_REJECTED_DAYS =
  Number(process.env.SCREENSHOT_RETENTION_REJECTED_DAYS) || 15;

export const UPLOAD_DIR = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.resolve(process.cwd(), 'uploads');
