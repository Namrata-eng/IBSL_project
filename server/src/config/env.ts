import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import dns from 'node:dns';

// Workspace scripts run from /server, while the shared .env belongs at the project root.
dotenv.config({ path: fileURLToPath(new URL('../../../.env', import.meta.url)) });

// Some local networks reject DNS SRV lookups required by mongodb+srv URIs.
// Set DNS_SERVERS only when an explicit resolver is needed, e.g. 1.1.1.1,1.0.0.1.
const dnsServers = process.env.DNS_SERVERS?.split(',').map((server) => server.trim()).filter(Boolean);
if (dnsServers?.length) dns.setServers(dnsServers);
