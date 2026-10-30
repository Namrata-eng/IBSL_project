import { Router } from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import nodemailer from 'nodemailer';
import multer from 'multer';
import sharp from 'sharp';
import rateLimit from 'express-rate-limit';
import {
  Admin,
  Announcement,
  Donation,
  Event,
  GalleryImage,
  ImageFile,
  Inquiry,
  PaymentProof,
  Prasadam,
  Service,
  TempleTiming,
  User,
} from '../models/index.js';
import { requireAdmin } from '../middleware/auth.js';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {
  SCREENSHOT_RETENTION_VERIFIED_DAYS,
  SCREENSHOT_RETENTION_REJECTED_DAYS,
  UPLOAD_DIR,
} from '../config/env.js';

const router = Router();
const models: any = {
  services: Service,
  events: Event,
  prasadam: Prasadam,
  timings: TempleTiming,
  announcements: Announcement,
};

const safe = (fn: any) => (req: any, res: any, next: any) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const JWT_SECRET = process.env.JWT_SECRET || 'iskcon_kopargaon_supreme_secret_108';

// Multer memory storage configuration for Donations (Max 5 MB, JPEG / PNG / WebP / PDF)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'application/pdf'];
    const isPdf = file.mimetype === 'application/pdf' || file.originalname?.toLowerCase().endsWith('.pdf');
    const isImage = file.mimetype?.startsWith('image/') || allowed.includes(file.mimetype);
    if (!allowed.includes(file.mimetype) && !isPdf && !isImage) {
      return cb(new Error('Only JPEG, PNG, WebP images and PDF documents (up to 5 MB) are allowed for payment proof.'));
    }
    cb(null, true);
  },
});

// Multer memory storage configuration for Gallery (Max 8 MB, JPEG / PNG / WebP only)
const galleryUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Only JPEG, PNG, and WebP images are allowed.'));
    }
    cb(null, true);
  },
});

// Rate limiter for public donation submissions & tracking (10 reqs per 15 min per IP)
const donationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many donation requests from this IP. Please try again after 15 minutes.' },
});

// Helper: auto-generate sequential unique reference ID: DON-YYYY-0001
async function generateReferenceId(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `DON-${year}-`;
  const last = await Donation.findOne(
    { referenceId: new RegExp(`^${prefix}`) },
    { referenceId: 1 }
  ).sort({ referenceId: -1 });

  let seq = 1;
  if (last?.referenceId) {
    const parts = last.referenceId.split('-');
    const lastSeq = parseInt(parts[2], 10);
    if (!isNaN(lastSeq)) seq = lastSeq + 1;
  }

  let refId = `${prefix}${String(seq).padStart(4, '0')}`;
  while (await Donation.exists({ referenceId: refId })) {
    seq++;
    refId = `${prefix}${String(seq).padStart(4, '0')}`;
  }
  return refId;
}

/* ==========================================================================
   PUBLIC STREAMING IMAGE ROUTE
   ========================================================================== */

/**
 * Public: Stream image stored in MongoDB ImageFile collection
 * Cache-Control: public, max-age=31536000, immutable
 */
router.get(
  '/images/:id',
  safe(async (req: any, res: any) => {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Image not found' });
    }

    const imageFile = await ImageFile.findById(id).select('+data');
    if (!imageFile || !imageFile.data) {
      return res.status(404).json({ message: 'Image not found' });
    }

    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('Content-Type', imageFile.mimeType || 'image/webp');
    res.setHeader('Content-Length', imageFile.size);
    res.end(imageFile.data);
  })
);

/* ==========================================================================
   ADMIN MEDIA UPLOAD ROUTE (Stored in UPLOAD_DIR on disk)
   ========================================================================== */

const generalUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Only JPEG, PNG, and WebP images are allowed.'));
    }
    cb(null, true);
  },
});

router.post(
  '/upload',
  requireAdmin,
  (req: any, res: any, next: any) => {
    generalUpload.single('image')(req, res, (err: any) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: 'File is too large. Maximum allowed size is 5 MB.' });
        }
        return res.status(400).json({ message: err.message });
      } else if (err) {
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  },
  safe(async (req: any, res: any) => {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded.' });
    }

    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }

    const ext = req.file.mimetype === 'image/png' ? 'png' : req.file.mimetype === 'image/webp' ? 'webp' : 'jpg';
    const filename = `${crypto.randomUUID()}.${ext}`;
    const destPath = path.join(UPLOAD_DIR, filename);

    if (ext === 'webp') {
      await sharp(req.file.buffer)
        .resize(1600, 1600, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 82 })
        .toFile(destPath);
    } else if (ext === 'png') {
      await sharp(req.file.buffer)
        .resize(1600, 1600, { fit: 'inside', withoutEnlargement: true })
        .png({ quality: 85, compressionLevel: 8 })
        .toFile(destPath);
    } else {
      await sharp(req.file.buffer)
        .resize(1600, 1600, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 82 })
        .toFile(destPath);
    }

    return res.status(201).json({
      url: `/uploads/${filename}`,
      filename,
    });
  })
);

/* ==========================================================================
   AUTH ROUTES
   ========================================================================== */

router.post(
  '/auth/register',
  safe(async (req: any, res: any) => {
    const schema = z.object({
      name: z.string().min(2, 'Name must be at least 2 characters'),
      email: z.string().email('Invalid email address'),
      password: z.string().min(6, 'Password must be at least 6 characters'),
      phone: z.string().optional(),
      spiritualInterest: z.string().optional(),
    });

    const data = schema.parse(req.body);
    const existing = await User.findOne({ email: data.email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await User.create({
      name: data.name,
      email: data.email.toLowerCase(),
      passwordHash,
      phone: data.phone || '',
      spiritualInterest: data.spiritualInterest || 'General Devotee',
      role: 'devotee',
    });

    const token = jwt.sign({ id: user._id, role: user.role, email: user.email }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        spiritualInterest: user.spiritualInterest,
        role: user.role,
      },
    });
  })
);

router.post(
  '/auth/login',
  safe(async (req: any, res: any) => {
    const data = z
      .object({
        email: z.string().email(),
        password: z.string().min(6),
      })
      .parse(req.body);

    const email = data.email.toLowerCase();

    let account: any = await User.findOne({ email });
    let role = account?.role || 'devotee';

    if (!account) {
      account = await Admin.findOne({ email });
      if (account) role = 'admin';
    }

    if (!account || !(await bcrypt.compare(data.password, account.passwordHash))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign({ id: account._id || account.id, role, email: account.email }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({
      token,
      user: {
        id: account._id || account.id,
        name: account.name,
        email: account.email,
        phone: account.phone || '',
        spiritualInterest: account.spiritualInterest || 'General Devotee',
        role,
      },
    });
  })
);

router.get(
  '/auth/me',
  safe(async (req: any, res: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      const user = (await User.findById(decoded.id)) || (await Admin.findById(decoded.id));
      if (!user) return res.status(404).json({ message: 'User not found' });
      res.json({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: (user as any).phone || '',
          spiritualInterest: (user as any).spiritualInterest || 'General Devotee',
          role: (user as any).role || 'devotee',
          japaRounds: (user as any).japaRounds || 0,
        },
      });
    } catch {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  })
);

/* ==========================================================================
   EVENTS ROUTES
   ========================================================================== */

router.get(
  '/events',
  safe(async (req: any, res: any) => {
    const q: any = {};
    if (req.query.upcoming === 'true') {
      q.date = { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) };
    }
    // Admin dashboard can request all events (including hidden / custom) with ?all=true
    if (req.query.all !== 'true' && req.query.admin !== 'true') {
      q.published = { $ne: false };
    }
    const data = await Event.find(q)
      .sort({ date: 1 })
      .limit(Math.min(Number(req.query.limit) || 100, 200));
    res.json({ data });
  })
);

router.post(
  '/events',
  safe(async (req: any, res: any) => {
    const payload = { ...req.body };
    // Prevent CastError if client sent a temporary string _id like 'evt_...'
    if (payload._id && typeof payload._id === 'string' && payload._id.startsWith('evt_')) {
      delete payload._id;
    }
    if (payload.published === undefined) {
      payload.published = true;
    }
    if (!payload.status) {
      payload.status = payload.published ? 'approved' : 'hidden';
    }
    const item = await Event.create(payload);
    res.status(201).json({ data: item });
  })
);

router.patch(
  '/events/:id',
  requireAdmin,
  safe(async (req: any, res: any) => {
    const item = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.json({ data: item });
  })
);

router.put(
  '/events/:id',
  requireAdmin,
  safe(async (req: any, res: any) => {
    const item = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.json({ data: item });
  })
);

router.delete(
  '/events/:id',
  requireAdmin,
  safe(async (req: any, res: any) => {
    await Event.findByIdAndDelete(req.params.id);
    res.status(204).end();
  })
);

/* ==========================================================================
   GALLERY ROUTES (Stored in MongoDB ImageFile & GalleryImage)
   ========================================================================== */

router.get(
  '/gallery',
  safe(async (_req: any, res: any) => {
    const data = await GalleryImage.find().sort({ createdAt: -1 });
    res.json({ data });
  })
);

router.post(
  '/gallery',
  requireAdmin,
  (req: any, res: any, next: any) => {
    galleryUpload.single('image')(req, res, (err: any) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: 'Image file size exceeds 8 MB limit.' });
        }
        return res.status(400).json({ message: err.message });
      } else if (err) {
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  },
  safe(async (req: any, res: any) => {
    const { title, category = 'Deity Darshan', description = '' } = req.body;

    if (!title || !String(title).trim()) {
      return res.status(400).json({ message: 'Photo title is required.' });
    }

    let imageUrl = req.body.imageUrl || '';
    let imageFileId: any = undefined;

    if (req.file) {
      // Compress with sharp (max width 1600, webp 80)
      const compressed = await sharp(req.file.buffer)
        .resize({ width: 1600, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();

      const imageFile = await ImageFile.create({
        filename: req.file.originalname || `${Date.now()}.webp`,
        mimeType: 'image/webp',
        size: compressed.length,
        data: compressed,
      });

      imageUrl = `/api/images/${imageFile._id}`;
      imageFileId = imageFile._id;
    } else if (imageUrl.startsWith('data:')) {
      // If a base64 string was submitted, extract and compress to ImageFile
      const match = imageUrl.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      if (match) {
        const rawBuffer = Buffer.from(match[2], 'base64');
        const compressed = await sharp(rawBuffer)
          .resize({ width: 1600, withoutEnlargement: true })
          .webp({ quality: 80 })
          .toBuffer();

        const imageFile = await ImageFile.create({
          filename: 'uploaded.webp',
          mimeType: 'image/webp',
          size: compressed.length,
          data: compressed,
        });

        imageUrl = `/api/images/${imageFile._id}`;
        imageFileId = imageFile._id;
      }
    }

    if (!imageUrl) {
      return res.status(400).json({ message: 'Image file or valid image URL is required.' });
    }

    const item = await GalleryImage.create({
      title: String(title).trim(),
      category: String(category).trim() || 'Deity Darshan',
      description: String(description).trim(),
      imageUrl,
      imageFileId,
    });

    res.status(201).json({ data: item });
  })
);

router.delete(
  '/gallery/:id',
  requireAdmin,
  safe(async (req: any, res: any) => {
    const item = await GalleryImage.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }

    // Delete linked ImageFile from MongoDB if present
    if (item.imageFileId) {
      await ImageFile.findByIdAndDelete(item.imageFileId);
    } else if (item.imageUrl && item.imageUrl.startsWith('/api/images/')) {
      const parts = item.imageUrl.split('/');
      const possibleId = parts[parts.length - 1];
      if (mongoose.Types.ObjectId.isValid(possibleId)) {
        await ImageFile.findByIdAndDelete(possibleId);
      }
    }

    await GalleryImage.findByIdAndDelete(req.params.id);
    res.status(204).end();
  })
);

/* ==========================================================================
   GENERIC CONTENT CRUD ROUTES (Services, Prasadam, Timings, Announcements)
   ========================================================================== */

for (const key of ['services', 'prasadam', 'timings', 'announcements']) {
  router.get(
    '/' + key,
    safe(async (_req: any, res: any) => {
      const query = key === 'timings' ? { active: true } : {};
      const data = await models[key].find(query).sort({ createdAt: -1 });
      res.json({ data });
    })
  );

  router.post(
    '/' + key,
    safe(async (req: any, res: any) => {
      const item = await models[key].create(req.body);
      res.status(201).json({ data: item });
    })
  );

  router.patch(
    '/' + key + '/:id',
    safe(async (req: any, res: any) => {
      const item = await models[key].findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      res.json({ data: item });
    })
  );

  router.put(
    '/' + key + '/:id',
    safe(async (req: any, res: any) => {
      const item = await models[key].findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      res.json({ data: item });
    })
  );

  router.delete(
    '/' + key + '/:id',
    safe(async (req: any, res: any) => {
      await models[key].findByIdAndDelete(req.params.id);
      res.status(204).end();
    })
  );
}

/* ==========================================================================
   DONATION VERIFICATION ROUTES
   ========================================================================== */

/**
 * Public: Submit a donation with payment screenshot or PDF proof
 * Multipart form-data with field 'screenshot', 'proof', or 'file'
 */
router.post(
  '/donations',
  donationLimiter,
  (req: any, res: any, next: any) => {
    upload.any()(req, res, (err: any) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: 'Proof file size exceeds 5 MB limit.' });
        }
        return res.status(400).json({ message: err.message });
      } else if (err) {
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  },
  safe(async (req: any, res: any) => {
    // Look for proof file under any common field name
    const uploadedFile =
      req.file ||
      req.files?.find((f: any) => ['screenshot', 'proof', 'paymentProof', 'file'].includes(f.fieldname)) ||
      req.files?.[0];

    if (!uploadedFile) {
      return res.status(400).json({ message: 'Payment screenshot or PDF receipt proof is required.' });
    }

    const donationSchema = z.object({
      donorName: z.string().trim().min(2, 'Name must be at least 2 characters').max(80, 'Name cannot exceed 80 characters'),
      donorPhone: z.string().trim().regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number'),
      donorEmail: z.string().trim().email('Invalid email address').optional().or(z.literal('')),
      amount: z.coerce.number().int().min(1, 'Amount must be at least ₹1').max(500000, 'Amount cannot exceed ₹5,00,000'),
      transactionId: z.string().trim().min(6, 'Transaction ID must be at least 6 characters').max(30, 'Transaction ID cannot exceed 30 characters').regex(/^[a-zA-Z0-9]+$/, 'Transaction ID must be alphanumeric'),
      type: z.string().trim().optional(),
      purpose: z.string().trim().optional(),
    });

    const data = donationSchema.parse(req.body);

    // Reject duplicate transactionId with a clear message
    const existing = await Donation.findOne({ transactionId: data.transactionId });
    if (existing) {
      return res.status(409).json({
        message: 'A donation with this Transaction ID has already been submitted. Please check your transaction details.',
      });
    }

    const isPdf =
      uploadedFile.mimetype === 'application/pdf' ||
      uploadedFile.originalname?.toLowerCase().endsWith('.pdf');

    let mimeType = isPdf ? 'application/pdf' : 'image/webp';
    let fileBuffer = uploadedFile.buffer;
    let ext = isPdf ? 'pdf' : 'webp';

    if (!isPdf) {
      try {
        fileBuffer = await sharp(uploadedFile.buffer)
          .resize({ width: 1400, withoutEnlargement: true })
          .webp({ quality: 80 })
          .toBuffer();
        mimeType = 'image/webp';
        ext = 'webp';
      } catch {
        fileBuffer = uploadedFile.buffer;
        mimeType = uploadedFile.mimetype || 'image/jpeg';
        ext = uploadedFile.mimetype?.includes('png') ? 'png' : 'jpg';
      }
    }

    // Save proof file to disk in UPLOAD_DIR for reliable persistent serving
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
    const diskFilename = `proof_${Date.now()}_${crypto.randomUUID().slice(0, 8)}.${ext}`;
    const destPath = path.join(UPLOAD_DIR, diskFilename);
    fs.writeFileSync(destPath, fileBuffer);
    const proofUrl = `/uploads/${diskFilename}`;

    // Create PaymentProof document
    const proof = await PaymentProof.create({
      mimeType,
      size: fileBuffer.length,
      data: fileBuffer,
    });

    // Extract optional userId if token is present
    let userId: any = undefined;
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded: any = jwt.verify(token, JWT_SECRET);
        if (decoded?.id) userId = decoded.id;
      } catch {}
    }

    const referenceId = await generateReferenceId();
    const sevaPurpose = data.purpose || data.type || 'General Seva';

    const donation = await Donation.create({
      referenceId,
      donorName: data.donorName,
      donorPhone: data.donorPhone,
      donorEmail: data.donorEmail || '',
      amount: data.amount,
      type: sevaPurpose,
      purpose: sevaPurpose,
      transactionId: data.transactionId,
      screenshotId: proof._id,
      proofUrl,
      status: 'pending',
      userId,
      user: userId,
    });

    // Optionally email admin via nodemailer
    try {
      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        await transporter.sendMail({
          from: `"ISKCON Kopargaon Website" <${process.env.SMTP_USER}>`,
          to: process.env.ADMIN_EMAIL || process.env.SMTP_USER,
          subject: `🙏 New Donation Submitted (${donation.referenceId}) — ₹${donation.amount}`,
          html: `
            <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #fdf8ee; padding: 32px; border-radius: 8px; border: 2px solid #d4af37;">
              <h2 style="color: #b7791f; font-size: 22px; margin-bottom: 4px;">🙏 Hare Krishna — New Donation Awaiting Verification</h2>
              <p style="color: #78716c; font-size: 13px; margin-bottom: 24px;">Received from ISKCON Kopargaon Website Donation Form</p>
              
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 10px 16px; background: #fef3c7; border-radius: 6px; font-weight: bold; color: #92400e; width: 140px;">Reference ID</td>
                  <td style="padding: 10px 16px;"><strong>${donation.referenceId}</strong></td>
                </tr>
                <tr>
                  <td style="padding: 10px 16px; background: #fef3c7; border-radius: 6px; font-weight: bold; color: #92400e;">Donor Name</td>
                  <td style="padding: 10px 16px;">${donation.donorName}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 16px; background: #fef3c7; border-radius: 6px; font-weight: bold; color: #92400e;">Phone</td>
                  <td style="padding: 10px 16px;">${donation.donorPhone}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 16px; background: #fef3c7; border-radius: 6px; font-weight: bold; color: #92400e;">Amount</td>
                  <td style="padding: 10px 16px; font-size: 18px; color: #b7791f; font-weight: bold;">₹${donation.amount.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 16px; background: #fef3c7; border-radius: 6px; font-weight: bold; color: #92400e;">Seva Type</td>
                  <td style="padding: 10px 16px;">${donation.type}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 16px; background: #fef3c7; border-radius: 6px; font-weight: bold; color: #92400e;">Transaction ID</td>
                  <td style="padding: 10px 16px;"><code>${donation.transactionId}</code></td>
                </tr>
              </table>

              <p style="color: #78716c; font-size: 12px; text-align: center; border-top: 1px solid #e7d5a0; padding-top: 12px;">
                Please log in to the ISKCON Kopargaon Admin Dashboard to review payment proof and verify.
              </p>
            </div>
          `,
        });
      }
    } catch (mailErr: any) {
      console.warn('📧 Donation notification email notice:', mailErr.message);
    }

    res.status(201).json({
      referenceId: donation.referenceId,
      status: donation.status,
      message: 'Hare Krishna! Your donation has been received and is pending verification within 24 hours.',
    });
  })
);

/**
 * Public: Track donation status by referenceId & phone
 * Returns ONLY { referenceId, amount, status, createdAt, rejectReason }
 */
router.get(
  '/donations/track',
  donationLimiter,
  safe(async (req: any, res: any) => {
    const referenceId = String(req.query.referenceId || '').trim();
    const phone = String(req.query.phone || '').trim();

    if (!referenceId || !phone) {
      return res.status(400).json({ message: 'Both Reference ID and Phone Number are required.' });
    }

    const donation = await Donation.findOne({
      referenceId: new RegExp(`^${referenceId}$`, 'i'),
      donorPhone: phone,
    });

    if (!donation) {
      return res.status(404).json({
        message: 'No matching donation found. Please verify your Reference ID and Phone Number.',
      });
    }

    res.json({
      data: {
        referenceId: donation.referenceId,
        amount: donation.amount,
        status: donation.status,
        createdAt: (donation as any).createdAt,
        rejectReason: donation.rejectReason || undefined,
      },
    });
  })
);

/**
 * Admin: Export donations as CSV
 */
router.get(
  '/donations/export',
  requireAdmin,
  safe(async (_req: any, res: any) => {
    const donations = await Donation.find().sort({ createdAt: -1 }).lean();

    const escapeCsv = (val: any) => `"${String(val ?? '').replace(/"/g, '""')}"`;

    const headers = [
      'Reference ID',
      'Date',
      'Donor Name',
      'Phone',
      'Email',
      'Amount (INR)',
      'Seva Type',
      'Transaction ID',
      'Status',
      'Reject Reason',
      'Verified At',
    ];

    const rows = donations.map((d: any) =>
      [
        escapeCsv(d.referenceId),
        escapeCsv(d.createdAt ? new Date(d.createdAt).toISOString().split('T')[0] : ''),
        escapeCsv(d.donorName),
        escapeCsv(d.donorPhone),
        escapeCsv(d.donorEmail || ''),
        d.amount,
        escapeCsv(d.type),
        escapeCsv(d.transactionId),
        escapeCsv(d.status),
        escapeCsv(d.rejectReason || ''),
        escapeCsv(d.verifiedAt ? new Date(d.verifiedAt).toISOString() : ''),
      ].join(',')
    );

    const csvContent = [headers.join(','), ...rows].join('\r\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="iskcon_kopargaon_donations.csv"');
    res.send(csvContent);
  })
);

/**
 * Admin: List donations with status filter, pagination, counts & verified sum
 */
router.get(
  '/donations',
  requireAdmin,
  safe(async (req: any, res: any) => {
    const { status, page = 1, limit = 20, from, to } = req.query;

    const q: any = {};
    if (status && ['pending', 'verified', 'rejected'].includes(status)) {
      q.status = status;
    }

    if (from || to) {
      q.createdAt = {};
      if (from) q.createdAt.$gte = new Date(from);
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        q.createdAt.$lte = toDate;
      }
    }

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));

    const [total, items, allCount, pendingCount, verifiedCount, rejectedCount, verifiedSumResult] =
      await Promise.all([
        Donation.countDocuments(q),
        Donation.find(q)
          .sort({ createdAt: -1 })
          .skip((pageNum - 1) * limitNum)
          .limit(limitNum)
          .lean(),
        Donation.countDocuments(),
        Donation.countDocuments({ status: 'pending' }),
        Donation.countDocuments({ status: 'verified' }),
        Donation.countDocuments({ status: 'rejected' }),
        Donation.aggregate([
          { $match: { status: 'verified' } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
      ]);

    const verifiedTotal = verifiedSumResult[0]?.total || 0;

    // Check if PaymentProof exists for each item to compute hasScreenshot & screenshotExpiresAt
    const screenshotIds = items.map((d: any) => d.screenshotId).filter(Boolean);
    const proofs = await PaymentProof.find(
      { _id: { $in: screenshotIds } },
      { _id: 1, expiresAt: 1 }
    ).lean();

    const proofMap = new Map<string, any>(proofs.map((p: any) => [p._id.toString(), p]));

    const enrichedItems = items.map((d: any) => {
      const proof = d.screenshotId ? proofMap.get(d.screenshotId.toString()) : null;
      return {
        ...d,
        hasScreenshot: !!proof || !!d.proofUrl,
        screenshotExpiresAt: proof?.expiresAt || null,
        proofUrl: d.proofUrl || (proof ? `/api/donations/${d._id}/screenshot` : null),
        mimeType: proof?.mimeType || (d.proofUrl?.endsWith('.pdf') ? 'application/pdf' : 'image/webp'),
      };
    });

    res.json({
      items: enrichedItems,
      total,
      verifiedTotal,
      counts: {
        all: allCount,
        pending: pendingCount,
        verified: verifiedCount,
        rejected: rejectedCount,
      },
    });
  })
);

/**
 * Admin: Stream payment screenshot image or PDF document
 */
router.get(
  '/donations/:id/screenshot',
  requireAdmin,
  safe(async (req: any, res: any) => {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    if (donation.screenshotId) {
      const proof = await PaymentProof.findById(donation.screenshotId).select('+data');
      if (proof && proof.data) {
        res.setHeader('Cache-Control', 'private, no-store');
        res.setHeader('Content-Type', proof.mimeType || 'image/webp');
        res.setHeader('Content-Length', proof.size);
        return res.end(proof.data);
      }
    }

    // Fallback: If proof file exists on disk in UPLOAD_DIR
    if (donation.proofUrl) {
      const filename = path.basename(donation.proofUrl);
      const filePath = path.join(UPLOAD_DIR, filename);
      if (fs.existsSync(filePath)) {
        const isPdf = filename.endsWith('.pdf');
        res.setHeader('Cache-Control', 'private, no-store');
        res.setHeader('Content-Type', isPdf ? 'application/pdf' : 'image/webp');
        return fs.createReadStream(filePath).pipe(res);
      }
    }

    return res.status(404).json({ message: 'Screenshot deleted or not found' });
  })
);

/**
 * Admin: Delete screenshot manually
 * Only allowed for non-pending donations
 */
router.delete(
  '/donations/:id/screenshot',
  requireAdmin,
  safe(async (req: any, res: any) => {
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ message: 'Donation not found' });

    if (donation.status === 'pending') {
      return res.status(400).json({ message: 'Verify or reject first' });
    }

    const now = new Date();
    if (donation.screenshotId) {
      await PaymentProof.findByIdAndDelete(donation.screenshotId);
    }
    donation.screenshotDeletedAt = now;
    donation.screenshotDeletedBy = 'admin';
    await donation.save();

    res.json({ message: 'Screenshot deleted successfully' });
  })
);

/**
 * Admin: Verify donation
 */
router.patch(
  '/donations/:id/verify',
  requireAdmin,
  safe(async (req: any, res: any) => {
    const { deleteScreenshotNow } = req.body || {};
    const now = new Date();

    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ message: 'Donation not found' });

    donation.status = 'verified';
    donation.verifiedAt = now;
    donation.verifiedBy = (req as any).user?.id || (req as any).user?._id;

    if (deleteScreenshotNow) {
      if (donation.screenshotId) {
        await PaymentProof.findByIdAndDelete(donation.screenshotId);
      }
      donation.screenshotDeletedAt = now;
      donation.screenshotDeletedBy = 'admin';
    } else if (donation.screenshotId) {
      const expiresAt = new Date(
        now.getTime() + SCREENSHOT_RETENTION_VERIFIED_DAYS * 24 * 60 * 60 * 1000
      );
      await PaymentProof.findByIdAndUpdate(donation.screenshotId, { expiresAt });
    }

    await donation.save();
    res.json({ message: 'Donation verified successfully', data: donation });
  })
);

/**
 * Admin: Reject donation
 */
router.patch(
  '/donations/:id/reject',
  requireAdmin,
  safe(async (req: any, res: any) => {
    const { reason, deleteScreenshotNow } = req.body || {};
    if (!reason || !reason.trim()) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const now = new Date();
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ message: 'Donation not found' });

    donation.status = 'rejected';
    donation.rejectReason = reason.trim();

    if (deleteScreenshotNow) {
      if (donation.screenshotId) {
        await PaymentProof.findByIdAndDelete(donation.screenshotId);
      }
      donation.screenshotDeletedAt = now;
      donation.screenshotDeletedBy = 'admin';
    } else if (donation.screenshotId) {
      const expiresAt = new Date(
        now.getTime() + SCREENSHOT_RETENTION_REJECTED_DAYS * 24 * 60 * 60 * 1000
      );
      await PaymentProof.findByIdAndUpdate(donation.screenshotId, { expiresAt });
    }

    await donation.save();
    res.json({ message: 'Donation marked as rejected', data: donation });
  })
);

/* ==========================================================================
   INQUIRIES, SEARCH & CHATBOT ROUTES
   ========================================================================== */

router.post(
  '/inquiries',
  safe(async (req: any, res: any) => {
    const data = z
      .object({
        name: z.string().trim().min(2).max(100),
        phone: z.string().trim().optional(),
        email: z.string().trim().optional(),
        contact: z.string().trim().optional(),
        subject: z.string().trim().optional(),
        message: z.string().trim().min(2).max(3000),
      })
      .parse(req.body);

    const phone = data.phone || '';
    const email = data.email || '';
    const contact = data.contact || [phone, email].filter(Boolean).join(' | ') || 'Not provided';
    const subject = data.subject || 'General Inquiry';

    const item = await Inquiry.create({
      name: data.name,
      phone,
      email,
      contact,
      subject,
      message: data.message,
      status: 'new',
    });

    try {
      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.SMTP_USER || 'iskconkopargaon@gmail.com',
            pass: process.env.SMTP_PASS || '',
          },
        });

        await transporter.sendMail({
          from: `"ISKCON Kopargaon Website" <${process.env.SMTP_USER || 'iskconkopargaon@gmail.com'}>`,
          to: process.env.ADMIN_EMAIL || 'iskconkopargaon@gmail.com',
          subject: `🙏 New Inquiry: ${subject} (${data.name}) — ISKCON Kopargaon`,
          html: `
            <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #fdf8ee; padding: 32px; border-radius: 8px; border: 2px solid #d4af37;">
              <h2 style="color: #b7791f; font-size: 22px; margin-bottom: 4px;">🙏 Hare Krishna — New Temple Inquiry</h2>
              <p style="color: #78716c; font-size: 13px; margin-bottom: 24px;">Received from ISKCON Kopargaon Website Contact Form</p>
              
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 10px 16px; background: #fef3c7; border-radius: 6px; font-weight: bold; color: #92400e; width: 120px;">Name</td>
                  <td style="padding: 10px 16px;">${data.name}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 16px; background: #fef3c7; border-radius: 6px; font-weight: bold; color: #92400e;">Phone</td>
                  <td style="padding: 10px 16px;">${phone || 'Not provided'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 16px; background: #fef3c7; border-radius: 6px; font-weight: bold; color: #92400e;">Email</td>
                  <td style="padding: 10px 16px;">${email || 'Not provided'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 16px; background: #fef3c7; border-radius: 6px; font-weight: bold; color: #92400e;">Subject</td>
                  <td style="padding: 10px 16px;">${subject}</td>
                </tr>
              </table>

              <div style="background: #fff; border: 1px solid #e7d5a0; border-radius: 6px; padding: 16px; margin-bottom: 20px;">
                <p style="color: #92400e; font-weight: bold; margin: 0 0 8px;">Message:</p>
                <p style="color: #44403c; line-height: 1.7; margin: 0;">${data.message.replace(/\n/g, '<br/>')}</p>
              </div>

              <p style="color: #78716c; font-size: 12px; text-align: center; border-top: 1px solid #e7d5a0; padding-top: 12px;">
                Please reply to this devotee at ${phone || email || contact}<br/>
                ISKCON Kopargaon — Samskar Value Education Centre, Kopargaon, Maharashtra 423603<br/>
                📞 +91 90828 60210
              </p>
            </div>
          `,
        });
      }
    } catch (emailErr: any) {
      console.error('📧 Email notification failed (inquiry still saved):', emailErr.message);
    }

    res.status(201).json({ message: 'Hare Krishna. Inquiry received successfully.', data: item });
  })
);

router.get(
  '/inquiries',
  requireAdmin,
  safe(async (req: any, res: any) => {
    const filter: any = {};
    if (req.query.status && req.query.status !== 'all') {
      filter.status = req.query.status;
    }
    const data = await Inquiry.find(filter).sort({ createdAt: -1 });
    res.json({ data });
  })
);

router.patch(
  '/inquiries/:id',
  requireAdmin,
  safe(async (req: any, res: any) => {
    const { status } = req.body;
    const item = await Inquiry.findByIdAndUpdate(
      req.params.id,
      { status: status || 'resolved' },
      { new: true }
    );
    if (!item) return res.status(404).json({ message: 'Inquiry not found' });
    res.json({ data: item });
  })
);

router.delete(
  '/inquiries/:id',
  requireAdmin,
  safe(async (req: any, res: any) => {
    await Inquiry.findByIdAndDelete(req.params.id);
    res.status(204).end();
  })
);

router.get(
  '/search',
  safe(async (req: any, res: any) => {
    const q = String(req.query.q || '').trim();
    if (q.length < 2) return res.json({ data: [] });
    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

    const [services, events, announcements, prasadam, timings] = await Promise.all([
      Service.find({ $or: [{ title: regex }, { description: regex }] }).limit(6),
      Event.find({ $or: [{ name: regex }, { description: regex }] }).limit(6),
      Announcement.find({ $or: [{ title: regex }, { description: regex }] }).limit(6),
      Prasadam.find({ $or: [{ name: regex }, { description: regex }] }).limit(4),
      TempleTiming.find({ $or: [{ type: regex }, { description: regex }] }).limit(4),
    ]);

    res.json({ data: [...services, ...events, ...announcements, ...prasadam, ...timings] });
  })
);

router.post(
  '/chat',
  safe(async (req: any, res: any) => {
    const { message } = z
      .object({
        message: z.string().trim().min(1).max(500),
      })
      .parse(req.body);

    const m = message.toLowerCase();

    if (m.includes('timing') || m.includes('aarti') || m.includes('darshan') || m.includes('time')) {
      return res.json({
        reply:
          'Hare Krishna! ISKCON Kopargaon temple timings: Morning Session: 7:00 AM – 1:00 PM (Mangala Aarti at 7:00 AM). Evening Session: 4:00 PM – 9:00 PM (Sandhya Aarti at 7:00 PM). Temple closes at 9:00 PM.',
      });
    }

    if (m.includes('where') || m.includes('address') || m.includes('location') || m.includes('contact') || m.includes('phone') || m.includes('shirdi')) {
      return res.json({
        reply:
          'Hare Krishna! ISKCON Kopargaon is located at Samskar Value Education Centre, Kopargaon, Ahmednagar, Maharashtra 423603 (near Shirdi). Phone: +91 90828 60210. Email: iskconkopargaon@gmail.com.',
      });
    }

    if (m.includes('prasadam') || m.includes('food') || m.includes('annadaan') || m.includes('sadhu bhojan') || m.includes('eat')) {
      return res.json({
        reply:
          'Hare Krishna! We offer sacred Sadhu Bhojan and Annadaan daily. Pure, sanctified vegetarian Satvik meals are distributed to devotees, sadhus, and visitors with reverence and love.',
      });
    }

    if (m.includes('gaushala') || m.includes('cow') || m.includes('gau')) {
      return res.json({
        reply:
          'Hare Krishna! Our Gaushala in Kopargaon provides loving care, green fodder, and medical support for indigenous cows (Desi Gau Seva). You can sponsor fodder or adopt a cow.',
      });
    }

    if (m.includes('youth') || m.includes('iyf') || m.includes('gita life') || m.includes('student') || m.includes('course')) {
      return res.json({
        reply:
          'Hare Krishna! Our Youth Empowerment Centre (IYF) & Gita Life programs help college students and youth master musical instruments (Mridanga/Harmonium), Vedic public speaking, and Gita wisdom.',
      });
    }

    if (m.includes('rath') || m.includes('festival') || m.includes('janmashtami')) {
      return res.json({
        reply:
          'Hare Krishna! We celebrate Sri Jagannath Rathayatra through Kopargaon (from Tahsil Maidan to MG Charitable Trust), Sri Krishna Janmashtami, Ram Navami, and Dussehra with ecstatic kirtan and feasts!',
      });
    }

    const q = new RegExp(
      message
        .split(/\s+/)
        .filter((w: string) => w.length > 2)
        .join('|'),
      'i'
    );

    const [timings, events, services] = await Promise.all([
      TempleTiming.find({ $or: [{ type: q }, { description: q }], active: true }).limit(3),
      Event.find({ $or: [{ name: q }, { description: q }], published: true })
        .sort({ date: 1 })
        .limit(3),
      Service.find({ $or: [{ title: q }, { description: q }], published: true }).limit(3),
    ]);

    const facts = [
      ...timings.map(x => `${x.type}: ${x.startTime || ''} - ${x.endTime || ''}`),
      ...events.map(x => `${x.name} on ${new Date(x.date).toLocaleDateString()}`),
      ...services.map(x => x.title),
    ];

    const reply = facts.length
      ? `Hare Krishna! Here is the published information: ${facts.join('; ')}.`
      : 'Hare Krishna! Chant Hare Krishna Hare Rama and be happy. For any temple inquiry or visit planning, call us at +91 90828 60210 or email iskconkopargaon@gmail.com.';

    res.json({ reply });
  })
);

export default router;
