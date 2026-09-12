// Unified Dynamic Temple Data Store with Local Cache & Backend REST Sync

export interface TempleEvent {
  _id: string;
  name: string;
  date: string; // ISO string YYYY-MM-DD
  time?: string;
  location?: string;
  category?: string;
  description: string;
  imageUrl?: string;
  published?: boolean;
}

export interface GalleryPhoto {
  _id: string;
  title: string;
  category: string;
  imageUrl: string;
  description?: string;
  createdAt?: string;
}

export interface FestivalNotification {
  id: string;
  festivalName: string;
  date: Date;
  time?: string;
  location?: string;
  description: string;
  status: 'today' | 'tomorrow' | 'upcoming';
  daysLeft: number;
}

// Default Authentic ISKCON Kopargaon Festivals
const DEFAULT_EVENTS: TempleEvent[] = [
  {
    _id: 'e1',
    name: 'Sri Jagannath Rathayatra Kopargaon',
    date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow for demo
    time: '03:30 PM Onwards',
    location: 'Tahsil Maidan to Mahatma Gandhi Charitable Trust, Kopargaon',
    category: 'Grand Annual Festival',
    description:
      'The grand chariot festival carrying Lord Jagannath, Baladeva, and Subhadra Devi across Kopargaon with thousands of devotees, ecstatic kirtan, and 56 Bhog Mahaprasadam.',
    imageUrl: 'https://images.unsplash.com/photo-1629079447777-1b6028564177?auto=format&fit=crop&w=1200&q=85',
    published: true,
  },
  {
    _id: 'e2',
    name: 'Sri Krishna Janmashtami Mahotsav',
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: 'All Day (Maha Abhishek at 10:30 PM)',
    location: 'ISKCON Kopargaon Temple Sanctum',
    category: 'Major Appearance Day',
    description:
      'The appearance day of the Supreme Personality of Godhead, Lord Sri Krishna. Features continuous 24-hour Harinam Sankirtan, 108 Kalash Abhishek, youth dramas, and midnight feast.',
    imageUrl: 'https://images.unsplash.com/photo-1567591414240-e2518e97f0e7?auto=format&fit=crop&w=1200&q=85',
    published: true,
  },
  {
    _id: 'e3',
    name: 'Dussehra & Rama Vijaya Utsav',
    date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '05:00 PM - 09:00 PM',
    location: 'Samskar Value Education Centre Grounds',
    category: 'Festival Celebration',
    description:
      'Celebrating the victory of dharma with special puja, musical kirtan, Ramayana discourses, and festive prasadam for all attendees.',
    imageUrl: 'https://images.unsplash.com/photo-1603555501671-8f96b3fce8b4?auto=format&fit=crop&w=1200&q=85',
    published: true,
  },
];

// Default Authentic Gallery Images
const DEFAULT_GALLERY: GalleryPhoto[] = [
  {
    _id: 'g1',
    title: 'Sri Sri Radha Krishna Deity Sringar Darshan',
    category: 'Deity Darshan',
    imageUrl: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=85',
    description: 'Morning auspicious Sringar darshan of the divine deities in Kopargaon.',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'g2',
    title: 'Grand Jagannath Rathayatra Chariot Procession',
    category: 'Rathayatra',
    imageUrl: 'https://images.unsplash.com/photo-1629079447777-1b6028564177?auto=format&fit=crop&w=1200&q=85',
    description: 'Devotees joyfully pulling the chariot of Lord Jagannath through the streets of Kopargaon.',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'g3',
    title: 'Loving Cow Seva at Kopargaon Gaushala',
    category: 'Gaushala',
    imageUrl: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=1200&q=85',
    description: 'Serving green fodder and unconditional affection to mother cows in Kopargaon.',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'g4',
    title: 'Soul-Stirring Harinam Sankirtan',
    category: 'Kirtan',
    imageUrl: 'https://images.unsplash.com/photo-1583083527882-4bee9aba2eea?auto=format&fit=crop&w=1200&q=85',
    description: 'Devotees immersed in chanting the holy names with mridangas and kartals.',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'g5',
    title: 'Daily Sadhu Bhojan & Annadaan Feeding',
    category: 'Annadaan',
    imageUrl: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=1200&q=85',
    description: 'Serving hot, sanctified satvik meals to pilgrims and sadhus.',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'g6',
    title: 'Deepotsava & Evening Gaura Aarti',
    category: 'Deity Darshan',
    imageUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1200&q=85',
    description: 'Hundreds of ghee lamps offered during the sacred month of Damodara.',
    createdAt: new Date().toISOString(),
  },
];

const EVENTS_KEY = 'iskcon_kopargaon_events_v2';
const GALLERY_KEY = 'iskcon_kopargaon_gallery_v2';

export async function fetchEvents(): Promise<TempleEvent[]> {
  try {
    const res = await fetch('/api/events');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.data) && data.data.length > 0) {
        localStorage.setItem(EVENTS_KEY, JSON.stringify(data.data));
        return data.data;
      }
    }
  } catch (err) {
    console.warn('API fetch failed, reading from storage cache:', err);
  }

  const cached = localStorage.getItem(EVENTS_KEY);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {}
  }

  localStorage.setItem(EVENTS_KEY, JSON.stringify(DEFAULT_EVENTS));
  return DEFAULT_EVENTS;
}

export async function saveEvent(eventData: Omit<TempleEvent, '_id'> & { _id?: string }): Promise<TempleEvent> {
  const token = localStorage.getItem('adminToken') || localStorage.getItem('userToken');
  let newEvent: TempleEvent;

  if (eventData._id) {
    newEvent = { ...eventData, _id: eventData._id };
    try {
      if (token) {
        await fetch(`/api/events/${eventData._id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(newEvent),
        });
      }
    } catch {}
  } else {
    newEvent = {
      ...eventData,
      _id: 'evt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      published: true,
    };
    try {
      if (token) {
        await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(newEvent),
        });
      }
    } catch {}
  }

  const current = await fetchEvents();
  const index = current.findIndex(e => e._id === newEvent._id);
  let updated: TempleEvent[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = newEvent;
  } else {
    updated = [newEvent, ...current];
  }
  localStorage.setItem(EVENTS_KEY, JSON.stringify(updated));

  window.dispatchEvent(new CustomEvent('temple_events_updated', { detail: updated }));
  return newEvent;
}

export async function deleteEvent(id: string): Promise<boolean> {
  const token = localStorage.getItem('adminToken') || localStorage.getItem('userToken');
  try {
    if (token) {
      await fetch(`/api/events/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    }
  } catch {}

  const current = await fetchEvents();
  const updated = current.filter(e => e._id !== id);
  localStorage.setItem(EVENTS_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('temple_events_updated', { detail: updated }));
  return true;
}

export async function fetchGallery(): Promise<GalleryPhoto[]> {
  try {
    const res = await fetch('/api/gallery');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.data) && data.data.length > 0) {
        localStorage.setItem(GALLERY_KEY, JSON.stringify(data.data));
        return data.data;
      }
    }
  } catch (err) {
    console.warn('API gallery fetch failed, using cache:', err);
  }

  const cached = localStorage.getItem(GALLERY_KEY);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {}
  }

  localStorage.setItem(GALLERY_KEY, JSON.stringify(DEFAULT_GALLERY));
  return DEFAULT_GALLERY;
}

export async function saveGalleryPhoto(photoData: Omit<GalleryPhoto, '_id'> & { _id?: string }): Promise<GalleryPhoto> {
  const token = localStorage.getItem('adminToken') || localStorage.getItem('userToken');
  const newPhoto: GalleryPhoto = {
    ...photoData,
    _id: photoData._id || 'gal_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    createdAt: new Date().toISOString(),
  };

  try {
    if (token) {
      await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newPhoto),
      });
    }
  } catch {}

  const current = await fetchGallery();
  const updated = [newPhoto, ...current.filter(p => p._id !== newPhoto._id)];
  localStorage.setItem(GALLERY_KEY, JSON.stringify(updated));

  window.dispatchEvent(new CustomEvent('temple_gallery_updated', { detail: updated }));
  return newPhoto;
}

export async function deleteGalleryPhoto(id: string): Promise<boolean> {
  const token = localStorage.getItem('adminToken') || localStorage.getItem('userToken');
  try {
    if (token) {
      await fetch(`/api/gallery/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    }
  } catch {}

  const current = await fetchGallery();
  const updated = current.filter(p => p._id !== id);
  localStorage.setItem(GALLERY_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('temple_gallery_updated', { detail: updated }));
  return true;
}

export function computeFestivalNotifications(events: TempleEvent[]): FestivalNotification[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const notifications: FestivalNotification[] = [];

  for (const event of events) {
    if (!event.date) continue;
    const eventDate = new Date(event.date);
    eventDate.setHours(0, 0, 0, 0);

    const diffMs = eventDate.getTime() - today.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      notifications.push({
        id: event._id,
        festivalName: event.name,
        date: eventDate,
        time: event.time,
        location: event.location,
        description: event.description,
        status: 'today',
        daysLeft: 0,
      });
    } else if (diffDays === 1) {
      notifications.push({
        id: event._id,
        festivalName: event.name,
        date: eventDate,
        time: event.time,
        location: event.location,
        description: event.description,
        status: 'tomorrow',
        daysLeft: 1,
      });
    } else if (diffDays > 1 && diffDays <= 30) {
      notifications.push({
        id: event._id,
        festivalName: event.name,
        date: eventDate,
        time: event.time,
        location: event.location,
        description: event.description,
        status: 'upcoming',
        daysLeft: diffDays,
      });
    }
  }

  return notifications.sort((a, b) => a.daysLeft - b.daysLeft);
}
