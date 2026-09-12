import '../config/env.js';
import bcrypt from 'bcryptjs';
import {
  Admin,
  Announcement,
  Event,
  GalleryImage,
  Prasadam,
  Service,
  TempleTiming,
  User,
  connectDb,
} from '../models/index.js';

async function seed() {
  console.log('Connecting to database...');
  await connectDb();

  console.log('Seeding ISKCON Kopargaon authentic data...');

  // 1. Create Default Admin & Devotee
  const adminPassword = await bcrypt.hash('Krishna@108', 10);
  await Admin.findOneAndUpdate(
    { email: 'admin@iskconkopargaon.org' },
    {
      name: 'ISKCON Kopargaon Sevak',
      email: 'admin@iskconkopargaon.org',
      passwordHash: adminPassword,
      role: 'admin',
    },
    { upsert: true, new: true }
  );

  await User.findOneAndUpdate(
    { email: 'devotee@iskconkopargaon.org' },
    {
      name: 'Gauranga Das',
      email: 'devotee@iskconkopargaon.org',
      passwordHash: adminPassword,
      phone: '+91 90828 60210',
      spiritualInterest: 'Bhagavad Gita Classes',
      role: 'devotee',
      japaRounds: 16,
    },
    { upsert: true, new: true }
  );

  // 2. Temple Timings
  await TempleTiming.deleteMany({});
  await TempleTiming.insertMany([
    {
      type: 'Mangala Aarti & Morning Darshan',
      day: 'Daily',
      startTime: '07:00 AM',
      endTime: '08:00 AM',
      description: 'Morning prayer ceremony with melodious kirtan, Tulsi puja, and guru vandana.',
      active: true,
    },
    {
      type: 'Morning Session & Darshan',
      day: 'Daily',
      startTime: '07:00 AM',
      endTime: '01:00 PM',
      description: 'Temple sanctum open for personal prayer, chanting, and circumambulation.',
      active: true,
    },
    {
      type: 'Afternoon Break (Altar Closed)',
      day: 'Daily',
      startTime: '01:00 PM',
      endTime: '04:00 PM',
      description: 'Deity rest period (Pahuda). Sanctum remains closed.',
      active: true,
    },
    {
      type: 'Evening Session & Sandhya Aarti',
      day: 'Daily',
      startTime: '04:00 PM',
      endTime: '09:00 PM',
      description: 'Evening Gaura Aarti at 7:00 PM with ecstatic Harinam Sankirtan and Bhagavad Gita discourse.',
      active: true,
    },
    {
      type: 'Temple Closes (Shayan)',
      day: 'Daily',
      startTime: '09:00 PM',
      endTime: '09:00 PM',
      description: 'Final aarti and night rest for the deities.',
      active: true,
    },
  ]);

  // 3. Services
  await Service.deleteMany({});
  await Service.insertMany([
    {
      title: 'Sadhu Bhojan & Annadaan Seva',
      subtitle: 'Nourishing the soul with Krishna Prasadam',
      category: 'Community Seva',
      description:
        'Daily distribution of sanctified Satvik vegetarian meals to sadhus, pilgrims, and local residents in need across Kopargaon and Ahmednagar.',
      imageUrl: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=800&q=80',
      timing: 'Daily 12:30 PM - 02:00 PM',
      published: true,
    },
    {
      title: 'Youth Empowerment Centre (IYF)',
      subtitle: 'Enlivening youth through Vedic culture & art',
      category: 'Education',
      description:
        'Equipping youth and college students with musical training (Mridanga, Harmonium, Kartals), Bhagavad Gita life skills, event leadership, and public speaking.',
      imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
      timing: 'Every Saturday & Sunday',
      published: true,
    },
    {
      title: 'Gaushala & Sacred Cow Seva',
      subtitle: 'Protecting and serving Mother Cow (Surabhi)',
      category: 'Gau Seva',
      description:
        'Compassionate care for indigenous Desi cows, providing daily green fodder, natural shelter, and medical support.',
      imageUrl: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=800&q=80',
      timing: 'Daily 08:00 AM - 06:00 PM',
      published: true,
    },
    {
      title: 'Gita Life & Value Education',
      subtitle: 'Practical wisdom for harmonious living',
      category: 'Spiritual Courses',
      description:
        'Systematic certificate courses on Bhagavad Gita As It Is, Srimad Bhagavatam, and stress management for students, working professionals, and families.',
      imageUrl: 'https://images.unsplash.com/photo-1532012164546-f432f2e3edd7?auto=format&fit=crop&w=800&q=80',
      timing: 'Weekend Batches (Online & Offline)',
      published: true,
    },
    {
      title: 'Harinam Sankirtan & Nagar Kirtan',
      subtitle: 'Spreading the divine names in every street',
      category: 'Devotion',
      description:
        'Public chanting of Hare Krishna Maha Mantra with musical instruments, spreading transcendental joy throughout Kopargaon.',
      imageUrl: 'https://images.unsplash.com/photo-1583083527882-4bee9aba2eea?auto=format&fit=crop&w=800&q=80',
      timing: 'Every Sunday 05:30 PM',
      published: true,
    },
    {
      title: 'Samskar Child Development Classes',
      subtitle: 'Shaping young minds through timeless values',
      category: 'Children Development',
      description:
        'Sunday school for children teaching Vedic stories, drama, devotional songs, shloka recitation, and moral ethics.',
      imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80',
      timing: 'Sundays 10:00 AM - 12:00 PM',
      published: true,
    },
  ]);

  // 4. Events & Festivals
  await Event.deleteMany({});
  await Event.insertMany([
    {
      name: 'Sri Jagannath Rathayatra Kopargaon',
      date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      time: '03:30 PM Onwards',
      location: 'From Tahsil Maidan to Mahatma Gandhi Charitable Trust, Kopargaon',
      category: 'Grand Festival',
      description:
        'The grand chariot festival of Lord Jagannath, Baladeva, and Subhadra Devi moving through the streets of Kopargaon with thousands of devotees, ecstatic kirtan, and grand 56 bhog prasadam.',
      imageUrl: 'https://images.unsplash.com/photo-1629079447777-1b6028564177?auto=format&fit=crop&w=800&q=80',
      published: true,
    },
    {
      name: 'Sri Krishna Janmashtami Mahotsav',
      date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      time: 'All Day (Abhishekam at 10:30 PM)',
      location: 'ISKCON Kopargaon Temple Hall',
      category: 'Major Appearance Day',
      description:
        'The supreme appearance day of Lord Sri Krishna with continuous 24-hour Harinam Sankirtan, 108 kalash maha abhishek, cultural dramas by youth, and midnight feast.',
      imageUrl: 'https://images.unsplash.com/photo-1567591414240-e2518e97f0e7?auto=format&fit=crop&w=800&q=80',
      published: true,
    },
    {
      name: 'Dussehra & Rama Vijaya Utsav',
      date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      time: '05:00 PM - 09:00 PM',
      location: 'Samskar Value Education Centre Grounds',
      category: 'Celebration',
      description:
        'Celebrating the victory of Lord Sri Ramacandra and righteous dharma over evil, featuring special Ramayana discourses, vibrant deepotsava, and prasadam feast.',
      imageUrl: 'https://images.unsplash.com/photo-1603555501671-8f96b3fce8b4?auto=format&fit=crop&w=800&q=80',
      published: true,
    },
  ]);

  // 5. Prasadam
  await Prasadam.deleteMany({});
  await Prasadam.insertMany([
    {
      name: 'Daily Sadhu & Devotee Annadaan',
      description: 'Freshly cooked pure vegetarian satvik thali (rice, dal, sabji, roti, sweet) sanctified and offered to Lord Krishna.',
      availability: 'Served Daily for all visitors & sadhus',
      timing: '12:30 PM - 02:00 PM',
      active: true,
    },
    {
      name: 'Sunday Love Feast (Maha Prasadam)',
      description: 'Elaborate multi-course festive feast following Sunday satsang and ecstatic kirtan.',
      availability: 'Every Sunday evening',
      timing: '07:30 PM onwards',
      active: true,
    },
    {
      name: 'Govinda Satvik Sweets & Snacks',
      description: 'Pure desi ghee sweets (Laddoo, Peda, Gulab Jamun) and fresh snacks prepared with hygiene and devotion.',
      availability: 'Available throughout temple opening hours',
      timing: '07:00 AM - 09:00 PM',
      active: true,
    },
  ]);

  // 6. Gallery
  await GalleryImage.deleteMany({});
  await GalleryImage.insertMany([
    {
      title: 'Sri Sri Radha Krishna Deity Darshan',
      imageUrl: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80',
      category: 'Deity Darshan',
      description: 'Morning Sringar darshan of the divine deities in Kopargaon.',
    },
    {
      title: 'Rathayatra Chariot Procession',
      imageUrl: 'https://images.unsplash.com/photo-1629079447777-1b6028564177?auto=format&fit=crop&w=1200&q=80',
      category: 'Rathayatra',
      description: 'Devotees pulling the sacred chariot through Kopargaon.',
    },
    {
      title: 'Mother Cow Seva at Gaushala',
      imageUrl: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=1200&q=80',
      category: 'Gaushala',
      description: 'Nurturing indigenous Desi cows with love and green fodder.',
    },
    {
      title: 'Ecstatic Harinam Sankirtan',
      imageUrl: 'https://images.unsplash.com/photo-1583083527882-4bee9aba2eea?auto=format&fit=crop&w=1200&q=80',
      category: 'Kirtan',
      description: 'Soulful chanting of the Hare Krishna Maha Mantra.',
    },
    {
      title: 'Annadaan Community Feeding',
      imageUrl: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=1200&q=80',
      category: 'Annadaan',
      description: 'Distributing warm, sanctified prasadam to all.',
    },
  ]);

  console.log('✅ ISKCON Kopargaon Database Seeded Successfully!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
