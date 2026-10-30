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
  status?: string;
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
    imageUrl: '/images/rathayatra.jpg',
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
    imageUrl: '/images/radha-krishna.jpg',
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
    imageUrl: '/images/rama-vijaya.jpg',
    published: true,
  },
];

// Default Authentic Gallery Images
const DEFAULT_GALLERY: GalleryPhoto[] = [
  {
    _id: 'g1',
    title: 'Sri Sri Radha Krishna Deity Darshan',
    category: 'Deity Darshan',
    imageUrl: '/images/radha-krishna.jpg',
    description: 'Morning auspicious Sringar darshan of the divine deities in Kopargaon.',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'g2',
    title: 'Rathayatra Chariot Procession',
    category: 'Rathayatra',
    imageUrl: '/images/rathayatra.jpg',
    description: 'Devotees joyfully pulling the chariot of Lord Jagannath through the streets of Kopargaon.',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'g3',
    title: 'Mother Cow Seva at Gaushala',
    category: 'Gaushala',
    imageUrl: '/images/gaushala.jpg',
    description: 'Serving green fodder and unconditional affection to mother cows in Kopargaon.',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'g4',
    title: 'Ecstatic Harinam Sankirtan',
    category: 'Kirtan',
    imageUrl: '/images/harinam.jpg',
    description: 'Devotees immersed in chanting the holy names with mridangas and kartals.',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'g5',
    title: 'Annadaan Community Feeding',
    category: 'Annadaan',
    imageUrl: '/images/sadhu-bhojan.jpg',
    description: 'Serving hot, sanctified satvik meals to pilgrims and sadhus.',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'g6',
    title: 'Deepotsava & Evening Gaura Aarti',
    category: 'Deity Darshan',
    imageUrl: '/images/deepotsava.jpg',
    description: 'Hundreds of ghee lamps offered during the sacred month of Damodara.',
    createdAt: new Date().toISOString(),
  },
];

const EVENTS_KEY = 'iskcon_kopargaon_events_v6';
const GALLERY_KEY = 'iskcon_kopargaon_gallery_v6';

// Automatically purge outdated legacy cache containing dummy placeholder photos or donation records
try {
  ['v1', 'v2', 'v3', 'v4', 'v5'].forEach(v => {
    localStorage.removeItem(`iskcon_kopargaon_events_${v}`);
    localStorage.removeItem(`iskcon_kopargaon_gallery_${v}`);
  });
  localStorage.removeItem('iskcon_kopargaon_donations');
  localStorage.removeItem('temple_donations');
  const existingGal = localStorage.getItem(GALLERY_KEY);
  if (existingGal && existingGal.includes('data:image/')) {
    localStorage.removeItem(GALLERY_KEY);
  }
} catch {}

export async function fetchEvents(all: boolean = false): Promise<TempleEvent[]> {
  try {
    const url = all ? '/api/events?all=true' : '/api/events';
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.data) && data.data.length > 0) {
        if (!all) {
          localStorage.setItem(EVENTS_KEY, JSON.stringify(data.data));
        }
        return data.data;
      }
    }
  } catch (err) {
    console.warn('API fetch failed, reading from storage cache:', err);
  }

  const cached = localStorage.getItem(EVENTS_KEY);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {}
  }

  localStorage.setItem(EVENTS_KEY, JSON.stringify(DEFAULT_EVENTS));
  return DEFAULT_EVENTS;
}

const getCleanToken = (): string | null => {
  const raw = localStorage.getItem('adminToken') || localStorage.getItem('userToken');
  if (!raw || typeof raw !== 'string') return null;
  const token = raw.replace(/^Bearer\s+/i, '').trim();
  if (token.split('.').length !== 3 || token.startsWith('mock_') || token === 'undefined' || token === 'null') {
    return null;
  }
  return token;
};

export async function saveEvent(eventData: Omit<TempleEvent, '_id'> & { _id?: string }): Promise<TempleEvent> {
  const token = getCleanToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let savedItem: TempleEvent | null = null;
  const isExistingInDb = eventData._id && !eventData._id.startsWith('evt_');

  if (isExistingInDb) {
    try {
      const res = await fetch(`/api/events/${eventData._id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(eventData),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) savedItem = json.data;
      }
    } catch {}
  } else {
    try {
      const payload: any = { ...eventData };
      if (payload._id?.startsWith('evt_')) delete payload._id;
      if (payload.published === undefined) payload.published = true;
      const res = await fetch('/api/events', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) savedItem = json.data;
      }
    } catch {}
  }

  const finalEvent: TempleEvent = savedItem || {
    ...eventData,
    _id: eventData._id || 'evt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    published: eventData.published !== false,
  };

  const current = await fetchEvents();
  const index = current.findIndex(e => e._id === finalEvent._id || (eventData._id && e._id === eventData._id));
  let updated: TempleEvent[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = finalEvent;
  } else {
    updated = [finalEvent, ...current];
  }
  localStorage.setItem(EVENTS_KEY, JSON.stringify(updated));

  window.dispatchEvent(new CustomEvent('temple_events_updated', { detail: updated }));
  return finalEvent;
}

export async function deleteEvent(id: string): Promise<boolean> {
  const token = getCleanToken();
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    await fetch(`/api/events/${id}`, {
      method: 'DELETE',
      headers,
    });
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
        // Strip out any legacy base64 images before caching to prevent localStorage quota issues
        const cleanData = data.data.filter((item: GalleryPhoto) => !item.imageUrl?.startsWith('data:'));
        try {
          localStorage.setItem(GALLERY_KEY, JSON.stringify(cleanData));
        } catch {}
        return data.data;
      }
    }
  } catch (err) {
    console.warn('API gallery fetch failed, using cache:', err);
  }

  const cached = localStorage.getItem(GALLERY_KEY);
  if (cached) {
    try {
      const parsed: GalleryPhoto[] = JSON.parse(cached);
      // Clean base64 items if found in cache
      const clean = parsed.filter(p => !p.imageUrl?.startsWith('data:'));
      if (clean.length !== parsed.length) {
        try {
          localStorage.setItem(GALLERY_KEY, JSON.stringify(clean));
        } catch {}
      }
      const hasLegacyPlaceholder = clean.some(
        p =>
          p.imageUrl?.includes('photo-1596704017254') ||
          p.imageUrl?.includes('photo-1514565131')
      );
      if (!hasLegacyPlaceholder && Array.isArray(clean) && clean.length > 0) {
        return clean;
      }
    } catch {}
  }

  localStorage.setItem(GALLERY_KEY, JSON.stringify(DEFAULT_GALLERY));
  return DEFAULT_GALLERY;
}

export async function saveGalleryPhoto(
  photoInput: FormData | (Omit<GalleryPhoto, '_id'> & { _id?: string; file?: File })
): Promise<GalleryPhoto> {
  const token = getCleanToken();
  let formData: FormData;

  if (photoInput instanceof FormData) {
    formData = photoInput;
  } else {
    formData = new FormData();
    if (photoInput._id) formData.append('_id', photoInput._id);
    formData.append('title', photoInput.title);
    formData.append('category', photoInput.category || 'Deity Darshan');
    if (photoInput.description) formData.append('description', photoInput.description);
    if (photoInput.file) {
      formData.append('image', photoInput.file);
    } else if (photoInput.imageUrl) {
      formData.append('imageUrl', photoInput.imageUrl);
    }
  }

  let savedPhoto: GalleryPhoto | null = null;

  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    // Do not manually set Content-Type header when sending FormData

    const res = await fetch('/api/gallery', {
      method: 'POST',
      headers,
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      if (data.data) {
        savedPhoto = data.data;
      }
    }
  } catch (err) {
    console.warn('API gallery upload failed:', err);
  }

  let title = '';
  let category = 'Deity Darshan';
  let description = '';
  let imageUrl = '';
  if (photoInput instanceof FormData) {
    title = (photoInput.get('title') as string) || '';
    category = (photoInput.get('category') as string) || 'Deity Darshan';
    description = (photoInput.get('description') as string) || '';
    imageUrl = (photoInput.get('imageUrl') as string) || '';
  } else {
    title = photoInput.title;
    category = photoInput.category;
    description = photoInput.description || '';
    imageUrl = photoInput.imageUrl || '';
  }

  const finalPhoto: GalleryPhoto = savedPhoto || {
    ...(photoInput instanceof FormData ? {} : (photoInput as any)),
    _id: 'gal_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    title,
    category,
    imageUrl,
    description,
    createdAt: new Date().toISOString(),
  };

  const current = await fetchGallery();
  // Strip any base64 images from caching in localStorage
  const cleanCurrent = current.filter(p => !p.imageUrl?.startsWith('data:') && p._id !== finalPhoto._id);
  const updated = finalPhoto.imageUrl?.startsWith('data:')
    ? cleanCurrent
    : [finalPhoto, ...cleanCurrent];

  try {
    localStorage.setItem(GALLERY_KEY, JSON.stringify(updated));
  } catch {}

  window.dispatchEvent(new CustomEvent('temple_gallery_updated', { detail: updated }));
  return finalPhoto;
}

export async function deleteGalleryPhoto(id: string): Promise<boolean> {
  const token = getCleanToken();
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
  try {
    localStorage.setItem(GALLERY_KEY, JSON.stringify(updated.filter(p => !p.imageUrl?.startsWith('data:'))));
  } catch {}
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
