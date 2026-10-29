import '../config/env.js';
import sharp from 'sharp';
import mongoose from 'mongoose';
import { connectDb, GalleryImage, ImageFile } from '../models/index.js';

async function migrate() {
  console.log('Connecting to database...');
  await connectDb();

  console.log('Searching for gallery items with base64 imageUrl...');
  const base64Images = await GalleryImage.find({
    imageUrl: { $regex: /^data:/ },
  });

  console.log(`Found ${base64Images.length} gallery images to migrate.`);

  let migratedCount = 0;
  let errorCount = 0;

  for (const item of base64Images) {
    try {
      const match = item.imageUrl.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      if (!match) {
        console.warn(`[Skip] Item "${item.title}" (${item._id}) has unrecognized data URI format.`);
        continue;
      }

      const rawBuffer = Buffer.from(match[2], 'base64');

      // Compress with sharp: max width 1600, webp quality 80
      const compressed = await sharp(rawBuffer)
        .resize({ width: 1600, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();

      const sanitizedTitle = (item.title || 'gallery')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_');

      const imageFile = await ImageFile.create({
        filename: `${sanitizedTitle}_${Date.now()}.webp`,
        mimeType: 'image/webp',
        size: compressed.length,
        data: compressed,
      });

      item.imageUrl = `/api/images/${imageFile._id}`;
      item.imageFileId = imageFile._id as any;
      await item.save();

      migratedCount++;
      console.log(`[Migrated] "${item.title}" -> ${item.imageUrl} (size: ${(compressed.length / 1024).toFixed(1)} KB)`);
    } catch (err) {
      errorCount++;
      console.error(`[Error] Failed to migrate item "${item.title}" (${item._id}):`, err);
    }
  }

  console.log(`\nMigration completed!`);
  console.log(`Successfully migrated: ${migratedCount}`);
  console.log(`Errors: ${errorCount}`);

  await mongoose.disconnect();
  process.exit(0);
}

migrate().catch(err => {
  console.error('Fatal migration error:', err);
  process.exit(1);
});

