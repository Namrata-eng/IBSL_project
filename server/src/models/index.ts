import mongoose, { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';

const opts = { timestamps: true };

export const User = model(
  'User',
  new Schema(
    {
      name: { type: String, required: true, trim: true },
      email: { type: String, required: true, unique: true, lowercase: true, trim: true },
      passwordHash: { type: String, required: true },
      phone: { type: String, trim: true },
      spiritualInterest: {
        type: String,
        enum: ['Bhagavad Gita Classes', 'Youth Forum (IYF)', 'Annadaan Seva', 'Gaushala Seva', 'Harinam Sankirtan', 'General Devotee', 'Temple Administration & Seva'],
        default: 'General Devotee',
      },
      role: { type: String, enum: ['devotee', 'volunteer', 'admin'], default: 'devotee' },
      japaRounds: { type: Number, default: 0 },
    },
    opts
  )
);

export const Admin = model(
  'Admin',
  new Schema(
    {
      name: { type: String, required: true },
      email: { type: String, required: true, unique: true, lowercase: true },
      passwordHash: { type: String, required: true },
      role: { type: String, enum: ['admin'], default: 'admin' },
    },
    opts
  )
);

export const Service = model(
  'Service',
  new Schema(
    {
      title: { type: String, required: true },
      subtitle: String,
      category: { type: String, default: 'Spiritual Service' },
      description: { type: String, required: true },
      imageUrl: String,
      timing: String,
      published: { type: Boolean, default: true },
    },
    opts
  )
);

export const Event = model(
  'Event',
  new Schema(
    {
      name: { type: String, required: true },
      date: { type: Date, required: true },
      time: String,
      location: String,
      category: { type: String, default: 'Festival' },
      description: { type: String, required: true },
      imageUrl: String,
      published: { type: Boolean, default: true },
    },
    opts
  )
);

export const Prasadam = model(
  'Prasadam',
  new Schema(
    {
      name: { type: String, required: true },
      description: { type: String, required: true },
      availability: String,
      timing: String,
      imageUrl: String,
      active: { type: Boolean, default: true },
    },
    opts
  )
);

const imageFileSchema = new Schema(
  {
    filename: { type: String, default: 'image.webp' },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    data: { type: Buffer, required: true, select: false },
  },
  opts
);

export const ImageFile = model('ImageFile', imageFileSchema);

export const GalleryImage = model(
  'GalleryImage',
  new Schema(
    {
      title: { type: String, required: true },
      imageUrl: { type: String, required: true },
      category: { type: String, default: 'Deity Darshan' },
      description: String,
      imageFileId: { type: Schema.Types.ObjectId, ref: 'ImageFile' },
    },
    opts
  )
);

export const TempleTiming = model(
  'TempleTiming',
  new Schema(
    {
      type: { type: String, required: true },
      day: { type: String, default: 'Daily' },
      startTime: String,
      endTime: String,
      description: String,
      active: { type: Boolean, default: true },
    },
    opts
  )
);

export const Announcement = model(
  'Announcement',
  new Schema(
    {
      title: { type: String, required: true },
      description: { type: String, required: true },
      imageUrl: String,
      date: { type: Date, default: Date.now },
      active: { type: Boolean, default: true },
    },
    opts
  )
);

export const Inquiry = model(
  'Inquiry',
  new Schema(
    {
      name: { type: String, required: true },
      contact: { type: String, required: true },
      message: { type: String, required: true },
      status: { type: String, enum: ['new', 'read', 'resolved'], default: 'new' },
    },
    opts
  )
);

const paymentProofSchema = new Schema(
  {
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    data: { type: Buffer, required: true, select: false },
    expiresAt: { type: Date, required: false },
  },
  opts
);

// TTL index for automatic deletion of expired proofs
paymentProofSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const PaymentProof = model('PaymentProof', paymentProofSchema);

export const Donation = model(
  'Donation',
  new Schema(
    {
      referenceId: { type: String, required: true, unique: true, index: true },
      donorName: { type: String, required: true, trim: true },
      donorPhone: { type: String, required: true, trim: true },
      donorEmail: { type: String, trim: true, lowercase: true },
      amount: { type: Number, required: true },
      type: { type: String, default: 'General Seva' },
      transactionId: { type: String, required: true, unique: true, trim: true },
      screenshotId: { type: Schema.Types.ObjectId, ref: 'PaymentProof' },
      status: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending',
        index: true,
      },
      rejectReason: { type: String, default: '' },
      verifiedAt: { type: Date },
      verifiedBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
      userId: { type: Schema.Types.ObjectId, ref: 'User' },
      screenshotDeletedAt: { type: Date },
      screenshotDeletedBy: { type: String, enum: ['auto', 'admin'] },
      paymentId: String,
    },
    opts
  )
);

export const connectDb = () =>
  mongoose
    .connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/iskcon_kopargaon', {
      serverSelectionTimeoutMS: 5000,
    })
    .then(() => console.log('MongoDB connected successfully.'))
    .catch(err => {
      console.warn('MongoDB connection notice:', err.message);
    });

export async function seedDefaultAdmin() {
  try {
    const adminEmail = 'admin@iskconkopargaon.org';
    const existing = await User.findOne({ email: adminEmail });
    if (!existing) {
      const passwordHash = await bcrypt.hash('Krishna@108', 10);
      await User.create({
        name: 'Temple Admin',
        email: adminEmail,
        passwordHash,
        phone: '+91 90828 60210',
        spiritualInterest: 'Temple Administration & Seva',
        role: 'admin',
      });
      await Admin.create({
        name: 'Temple Admin',
        email: adminEmail,
        passwordHash,
        role: 'admin',
      });
      console.log('👑 Default Admin account successfully seeded and saved in MongoDB (admin@iskconkopargaon.org / Krishna@108).');
    }
  } catch (err: any) {
    console.warn('Admin seed notice:', err.message);
  }
}
