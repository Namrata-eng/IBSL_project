import '../config/env.js';
import mongoose from 'mongoose';
import { connectDb, Service, Event, GalleryImage, Prasadam } from '../models/index.js';

const URL_MAP: Record<string, string> = {
  // Pinterest image mappings
  'https://i.pinimg.com/736x/34/68/a7/3468a74339a609a50b0a7b0f4fe6abda.jpg': '/images/rathayatra.jpg',
  'https://i.pinimg.com/736x/92/a6/29/92a6291a18a5d441418c1fc56f74e280.jpg': '/images/radha-krishna.jpg',
  'https://i.pinimg.com/1200x/c9/6e/02/c96e0239c130c0f256ae9b77ffda796b.jpg': '/images/rama-vijaya.jpg',
  'https://i.pinimg.com/736x/af/d1/3a/afd13a1cad7f876e957f35f200a1ba49.jpg': '/images/gaushala.jpg',
  'https://i.pinimg.com/1200x/5a/39/63/5a39630f63ef88c48ae23e0d770ca253.jpg': '/images/harinam.jpg',
};

function resolveNewUrl(currentUrl?: string | null, itemTitle?: string, collectionName?: string): string | null {
  if (!currentUrl) {
    if (collectionName === 'Prasadam') {
      const t = (itemTitle || '').toLowerCase();
      if (t.includes('sadhu') || t.includes('annadaan')) return '/images/sadhu-bhojan.jpg';
      if (t.includes('sunday') || t.includes('feast')) return '/images/sunday-feast.jpg';
      if (t.includes('sweet') || t.includes('govinda') || t.includes('snack')) return '/images/govinda-sweets.jpg';
      return '/images/sadhu-bhojan.jpg';
    }
    return null;
  }

  // Already migrated to local path
  if (currentUrl.startsWith('/images/')) return null;

  // Direct mapping
  if (URL_MAP[currentUrl]) return URL_MAP[currentUrl];

  // Match Unsplash ID patterns regardless of query parameters
  if (currentUrl.includes('photo-1610057099443-fde8c4d50f91')) {
    const t = (itemTitle || '').toLowerCase();
    if (t.includes('sunday') || t.includes('feast')) return '/images/sunday-feast.jpg';
    return '/images/sadhu-bhojan.jpg';
  }
  if (currentUrl.includes('photo-1585937421612-70a008356fbe')) {
    return '/images/sadhu-bhojan.jpg';
  }
  if (currentUrl.includes('photo-1599488615731-7e5c2823ff28')) {
    return '/images/govinda-sweets.jpg';
  }
  if (currentUrl.includes('photo-1544717305-2782549b5136')) {
    return '/images/youth-iyf.jpg';
  }
  if (currentUrl.includes('photo-1544716278-ca5e3f4abd8c')) {
    return '/images/gita-life.jpg';
  }
  if (currentUrl.includes('photo-1577896851231-70ef18881754')) {
    return '/images/samskar-children.jpg';
  }
  if (currentUrl.includes('photo-1605629921711-2f6b00c6bbf4')) {
    return '/images/deepotsava.jpg';
  }
  if (currentUrl.includes('photo-1567591414240-e2518e97f0e7')) {
    return '/images/default-event.jpg';
  }

  return null;
}

async function migrate() {
  console.log('Connecting to database...');
  await connectDb();

  let updatedCount = 0;

  // 1. Services
  console.log('\n--- Checking Services ---');
  const services = await Service.find();
  for (const doc of services) {
    const targetUrl = resolveNewUrl(doc.imageUrl, doc.title, 'Service');
    if (targetUrl && targetUrl !== doc.imageUrl) {
      console.log(`[Service] "${doc.title}": ${doc.imageUrl} -> ${targetUrl}`);
      doc.imageUrl = targetUrl;
      await doc.save();
      updatedCount++;
    }
  }

  // 2. Events
  console.log('\n--- Checking Events ---');
  const events = await Event.find();
  for (const doc of events) {
    const targetUrl = resolveNewUrl(doc.imageUrl, doc.name, 'Event');
    if (targetUrl && targetUrl !== doc.imageUrl) {
      console.log(`[Event] "${doc.name}": ${doc.imageUrl} -> ${targetUrl}`);
      doc.imageUrl = targetUrl;
      await doc.save();
      updatedCount++;
    }
  }

  // 3. GalleryImage
  console.log('\n--- Checking Gallery ---');
  const gallery = await GalleryImage.find();
  for (const doc of gallery) {
    const targetUrl = resolveNewUrl(doc.imageUrl, doc.title, 'GalleryImage');
    if (targetUrl && targetUrl !== doc.imageUrl) {
      console.log(`[Gallery] "${doc.title}": ${doc.imageUrl} -> ${targetUrl}`);
      doc.imageUrl = targetUrl;
      await doc.save();
      updatedCount++;
    }
  }

  // 4. Prasadam
  console.log('\n--- Checking Prasadam ---');
  const prasadam = await Prasadam.find();
  for (const doc of prasadam) {
    const targetUrl = resolveNewUrl(doc.imageUrl, doc.name, 'Prasadam');
    if (targetUrl && targetUrl !== doc.imageUrl) {
      console.log(`[Prasadam] "${doc.name}": ${doc.imageUrl || '(none)'} -> ${targetUrl}`);
      doc.imageUrl = targetUrl;
      await doc.save();
      updatedCount++;
    }
  }

  console.log(`\n========================================`);
  console.log(`Image URL Migration Complete!`);
  console.log(`Total documents updated: ${updatedCount}`);
  console.log(`========================================\n`);

  await mongoose.disconnect();
  process.exit(0);
}

migrate().catch(err => {
  console.error('Fatal migration error:', err);
  process.exit(1);
});
