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
      imageUrl: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=800&q=80',
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
      imageUrl: 'https://i.pinimg.com/736x/af/d1/3a/afd13a1cad7f876e957f35f200a1ba49.jpg',
      timing: 'Daily 08:00 AM - 06:00 PM',
      published: true,
    },
    {
      title: 'Gita Life & Value Education',
      subtitle: 'Practical wisdom for harmonious living',
      category: 'Spiritual Courses',
      description:
        'Systematic certificate courses on Bhagavad Gita As It Is, Srimad Bhagavatam, and stress management for students, working professionals, and families.',
      imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
      timing: 'Weekend Batches (Online & Offline)',
      published: true,
    },
    {
      title: 'Harinam Sankirtan & Nagar Kirtan',
      subtitle: 'Spreading the divine names in every street',
      category: 'Devotion',
      description:
        'Public chanting of Hare Krishna Maha Mantra with musical instruments, spreading transcendental joy throughout Kopargaon.',
      imageUrl: 'https://i.pinimg.com/1200x/5a/39/63/5a39630f63ef88c48ae23e0d770ca253.jpg',
      timing: 'Every Sunday 05:30 PM',
      published: true,
    },
    {
      title: 'Samskar Child Development Classes',
      subtitle: 'Shaping young minds through timeless values',
      category: 'Children Development',
      description:
        'Sunday school for children teaching Vedic stories, drama, devotional songs, shloka recitation, and moral ethics.',
      imageUrl: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80',
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
      imageUrl: 'https://i.pinimg.com/736x/34/68/a7/3468a74339a609a50b0a7b0f4fe6abda.jpg',
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
      imageUrl: 'https://i.pinimg.com/736x/92/a6/29/92a6291a18a5d441418c1fc56f74e280.jpg',
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
      imageUrl: 'https://i.pinimg.com/1200x/c9/6e/02/c96e0239c130c0f256ae9b77ffda796b.jpg',
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
      imageUrl: 'https://i.pinimg.com/736x/92/a6/29/92a6291a18a5d441418c1fc56f74e280.jpg',
      category: 'Deity Darshan',
      description: 'Morning Sringar darshan of the divine deities in Kopargaon.',
    },
    {
      title: 'Rathayatra Chariot Procession',
      imageUrl: 'https://i.pinimg.com/736x/34/68/a7/3468a74339a609a50b0a7b0f4fe6abda.jpg',
      category: 'Rathayatra',
      description: 'Devotees pulling the sacred chariot through Kopargaon.',
    },
    {
      title: 'Mother Cow Seva at Gaushala',
      imageUrl: 'https://i.pinimg.com/736x/af/d1/3a/afd13a1cad7f876e957f35f200a1ba49.jpg',
      category: 'Gaushala',
      description: 'Nurturing indigenous Desi cows with love and green fodder.',
    },
    {
      title: 'Ecstatic Harinam Sankirtan',
      imageUrl: 'https://i.pinimg.com/1200x/5a/39/63/5a39630f63ef88c48ae23e0d770ca253.jpg',
      category: 'Kirtan',
      description: 'Soulful chanting of the Hare Krishna Maha Mantra.',
    },
    {
      title: 'Annadaan Community Feeding',
      imageUrl: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=1200&q=80',
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
