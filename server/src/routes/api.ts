import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import nodemailer from 'nodemailer';
import {
  Admin,
  Announcement,
  Donation,
  Event,
  GalleryImage,
  Inquiry,
  Prasadam,
  Service,
  TempleTiming,
  User,
} from '../models/index.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();
const models: any = {
  services: Service,
  events: Event,
  prasadam: Prasadam,
  gallery: GalleryImage,
  timings: TempleTiming,
  announcements: Announcement,
  donations: Donation,
};

const safe = (fn: any) => (req: any, res: any, next: any) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const JWT_SECRET = process.env.JWT_SECRET || 'iskcon_kopargaon_supreme_secret_108';

router.post(
  '/auth/register',
  safe(async (req, res) => {
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
  safe(async (req, res) => {
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
  safe(async (req, res) => {
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

router.get(
  '/events',
  safe(async (req, res) => {
    const q: any = {};
    if (req.query.upcoming === 'true') {
      q.date = { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) };
    }
    const data = await Event.find(q)
      .sort({ date: 1 })
      .limit(Math.min(Number(req.query.limit) || 50, 100));
    res.json({ data });
  })
);

router.post(
  '/events',
  safe(async (req, res) => {
    const item = await Event.create(req.body);
    res.status(201).json({ data: item });
  })
);

router.patch(
  '/events/:id',
  safe(async (req, res) => {
    const item = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.json({ data: item });
  })
);

router.delete(
  '/events/:id',
  safe(async (req, res) => {
    await Event.findByIdAndDelete(req.params.id);
    res.status(204).end();
  })
);

for (const key of ['gallery', 'services', 'prasadam', 'timings', 'announcements', 'donations']) {
  router.get(
    '/' + key,
    safe(async (_req, res) => {
      const query = key === 'timings' ? { active: true } : {};
      const data = await models[key].find(query).sort({ createdAt: -1 });
      res.json({ data });
    })
  );

  router.post(
    '/' + key,
    safe(async (req, res) => {
      const item = await models[key].create(req.body);
      res.status(201).json({ data: item });
    })
  );

  router.patch(
    '/' + key + '/:id',
    safe(async (req, res) => {
      const item = await models[key].findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      res.json({ data: item });
    })
  );

  router.delete(
    '/' + key + '/:id',
    safe(async (req, res) => {
      await models[key].findByIdAndDelete(req.params.id);
      res.status(204).end();
    })
  );
}

router.post(
  '/inquiries',
  safe(async (req, res) => {
    const data = z
      .object({
        name: z.string().trim().min(2).max(100),
        contact: z.string().trim().min(4).max(150),
        message: z.string().trim().min(5).max(3000),
      })
      .parse(req.body);

    await Inquiry.create(data);

    // ── Send email notification to temple admin ──
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.SMTP_USER || 'iskconkopargaon@gmail.com',
          pass: process.env.SMTP_PASS || '', // Set in .env file
        },
      });

      await transporter.sendMail({
        from: `"ISKCON Kopargaon Website" <${process.env.SMTP_USER || 'iskconkopargaon@gmail.com'}>`,
        to: process.env.ADMIN_EMAIL || 'iskconkopargaon@gmail.com',
        subject: `🙏 New Inquiry from ${data.name} — ISKCON Kopargaon Website`,
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
                <td style="padding: 10px 16px; background: #fef3c7; border-radius: 6px; font-weight: bold; color: #92400e;">Contact</td>
                <td style="padding: 10px 16px;">${data.contact}</td>
              </tr>
            </table>

            <div style="background: #fff; border: 1px solid #e7d5a0; border-radius: 6px; padding: 16px; margin-bottom: 20px;">
              <p style="color: #92400e; font-weight: bold; margin: 0 0 8px;">Message:</p>
              <p style="color: #44403c; line-height: 1.7; margin: 0;">${data.message.replace(/\n/g, '<br/>')}</p>
            </div>

            <p style="color: #78716c; font-size: 12px; text-align: center; border-top: 1px solid #e7d5a0; padding-top: 12px;">
              Please reply to this devotee at their contact: ${data.contact}<br/>
              ISKCON Kopargaon — Samskar Value Education Centre, Kopargaon, Maharashtra 423603<br/>
              📞 +91 90828 60210
            </p>
          </div>
        `,
      });
    } catch (emailErr) {
      // Email failed — log but don't block response (inquiry is already saved)
      console.error('📧 Email notification failed (inquiry still saved):', (emailErr as Error).message);
    }

    res.status(201).json({ message: 'Hare Krishna. Inquiry received successfully.' });
  })
);

router.get(
  '/inquiries',
  safe(async (_req, res) => {
    const data = await Inquiry.find().sort({ createdAt: -1 });
    res.json({ data });
  })
);

router.get(
  '/search',
  safe(async (req, res) => {
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
  safe(async (req, res) => {
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
