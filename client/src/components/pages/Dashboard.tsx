import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PageBanner from '../PageBanner';
import {
  fetchEvents,
  saveEvent,
  deleteEvent,
  fetchGallery,
  saveGalleryPhoto,
  deleteGalleryPhoto,
  TempleEvent,
  GalleryPhoto,
} from '../../utils/templeStore';
import {
  PlusIcon,
  TrashIcon,
  CalendarIcon,
  PeacockFeatherIcon,
  LotusIcon,
  TilakMark,
  XIcon,
} from '../icons';

export function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'events' | 'gallery' | 'inquiries'>('gallery');

  const [events, setEvents] = useState<TempleEvent[]>([]);
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventLocation, setEventLocation] = useState('ISKCON Kopargaon Temple Sanctum');
  const [eventCategory, setEventCategory] = useState('Grand Annual Festival');
  const [eventDesc, setEventDesc] = useState('');
  const [eventImage, setEventImage] = useState('');
  const [eventSuccess, setEventSuccess] = useState('');

  const [gallery, setGallery] = useState<GalleryPhoto[]>([]);
  const [photoTitle, setPhotoTitle] = useState('');
  const [photoCategory, setPhotoCategory] = useState('Deity Darshan');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoDesc, setPhotoDesc] = useState('');
  const [photoSuccess, setPhotoSuccess] = useState('');

  const [inquiries, setInquiries] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('userToken');
    const userData = localStorage.getItem('userData');
    if (!token && !userData) {
      navigate('/login');
      return;
    }
    loadAllData();
  }, [navigate]);

  const loadAllData = async () => {
    const evts = await fetchEvents();
    setEvents(evts);
    const gal = await fetchGallery();
    setGallery(gal);

    try {
      const res = await fetch('/api/inquiries');
      if (res.ok) {
        const data = await res.json();
        setInquiries(data.data || []);
      }
    } catch {}
  };

  const handlePhotoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setPhotoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEventFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setEventImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventName || !eventDate) return;

    await saveEvent({
      name: eventName,
      date: eventDate,
      time: eventTime || '06:00 PM Onwards',
      location: eventLocation,
      category: eventCategory,
      description: eventDesc || 'Auspicious festival celebration at ISKCON Kopargaon.',
      imageUrl: eventImage || 'https://images.unsplash.com/photo-1567591414240-e2518e97f0e7?auto=format&fit=crop&w=1200&q=85',
    });

    setEventSuccess(`🎉 Festival "${eventName}" published & notification activated!`);
    setEventName('');
    setEventDate('');
    setEventTime('');
    setEventDesc('');
    setEventImage('');

    const updated = await fetchEvents();
    setEvents(updated);
    setTimeout(() => setEventSuccess(''), 4500);
  };

  const handleDeleteEvent = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove the festival "${name}"?`)) {
      await deleteEvent(id);
      const updated = await fetchEvents();
      setEvents(updated);
    }
  };

  const handleAddPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoTitle || !photoUrl) return;

    await saveGalleryPhoto({
      title: photoTitle,
      category: photoCategory,
      imageUrl: photoUrl,
      description: photoDesc,
    });

    setPhotoSuccess(`✨ Photo "${photoTitle}" uploaded to Darshan Gallery successfully!`);
    setPhotoTitle('');
    setPhotoUrl('');
    setPhotoDesc('');

    const updated = await fetchGallery();
    setGallery(updated);
    setTimeout(() => setPhotoSuccess(''), 4500);
  };

  const handleDeletePhoto = async (id: string, title: string) => {
    if (window.confirm(`Delete "${title}" from the gallery?`)) {
      await deleteGalleryPhoto(id);
      const updated = await fetchGallery();
      setGallery(updated);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    window.dispatchEvent(new Event('storage'));
    navigate('/login');
  };

  return (
    <main className="page" style={{ maxWidth: '1200px' }}>
      <PageBanner
        lead="👑 TEMPLE MANAGEMENT CONSOLE"
        title="Admin Control Dashboard"
        subtitle="Dynamically upload deity photos, publish upcoming festivals, and broadcast real-time devotee notifications."
      />

      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.22) 0%, rgba(12, 25, 40, 0.95) 100%)',
          border: '2px solid var(--gold)',
          padding: '24px 30px',
          marginBottom: '32px',
          boxShadow: '0 0 28px rgba(212, 175, 55, 0.25)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '20px', color: 'var(--gold-bright)' }}>
              👑 Welcome, Temple Administrator!
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '14px', color: 'var(--ink-soft)' }}>
              Select a section below to add new festivals or upload new deity photos directly into the website:
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/gallery" className="btn btn--ink" style={{ fontSize: '13px' }}>
              View Public Gallery
            </Link>
            <Link to="/events" className="btn btn--ink" style={{ fontSize: '13px' }}>
              View Public Festivals
            </Link>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '14px', marginBottom: '36px' }}>
        <button
          onClick={() => setActiveTab('gallery')}
          className={`btn ${activeTab === 'gallery' ? 'btn--gold' : 'btn--ink'}`}
          style={{ padding: '12px 26px', fontSize: '15px', fontWeight: 700 }}
        >
          <PeacockFeatherIcon size={18} />
          <span>📸 Upload Deity & Gallery Photos ({gallery.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('events')}
          className={`btn ${activeTab === 'events' ? 'btn--gold' : 'btn--ink'}`}
          style={{ padding: '12px 26px', fontSize: '15px', fontWeight: 700 }}
        >
          <CalendarIcon size={18} />
          <span>🎉 Add & Publish Festivals ({events.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('inquiries')}
          className={`btn ${activeTab === 'inquiries' ? 'btn--gold' : 'btn--ink'}`}
          style={{ padding: '12px 26px', fontSize: '15px', fontWeight: 700 }}
        >
          <span>✉️ Visitor Inquiries ({inquiries.length})</span>
        </button>

        <button onClick={handleSignOut} className="btn btn--ink" style={{ padding: '12px 20px', marginLeft: 'auto' }}>
          Sign Out
        </button>
      </div>

      {activeTab === 'gallery' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '32px' }}>
          <div className="card" style={{ padding: '34px', border: '2px solid #38bdf8', boxShadow: '0 0 24px rgba(56, 189, 248, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{ fontSize: '24px' }}>📸</span>
              <h3 style={{ margin: 0, fontSize: '22px', color: 'var(--ink)' }}>Upload Deity / Festival Photo</h3>
            </div>
            <p style={{ fontSize: '13.5px', color: 'var(--ink-faint)', marginBottom: '22px' }}>
              Choose an image from your computer or paste an image URL to publish to the Darshan Gallery.
            </p>

            <form onSubmit={handleAddPhoto} style={{ display: 'grid', gap: '16px' }}>
              <label>
                Photo Title *
                <input
                  required
                  placeholder="e.g. Sri Sri Radha Krishna Evening Sringar"
                  value={photoTitle}
                  onChange={e => setPhotoTitle(e.target.value)}
                />
              </label>

              <label>
                Darshan Category *
                <select value={photoCategory} onChange={e => setPhotoCategory(e.target.value)}>
                  <option>Deity Darshan</option>
                  <option>Rathayatra</option>
                  <option>Gaushala</option>
                  <option>Kirtan</option>
                  <option>Annadaan</option>
                  <option>Festival Abhishek</option>
                </select>
              </label>

              <div style={{ background: 'rgba(56, 189, 248, 0.08)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                <label style={{ marginBottom: '6px', fontWeight: 600, color: '#38bdf8' }}>
                  Option A: Choose Image File from Device
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoFile}
                  style={{ padding: '8px', background: 'rgba(0,0,0,0.4)', borderRadius: '8px' }}
                />
              </div>

              <label>
                Option B: Or Direct Image Web URL (HD Unsplash Photo)
                <input
                  placeholder="https://images.unsplash.com/..."
                  value={photoUrl}
                  onChange={e => setPhotoUrl(e.target.value)}
                />
              </label>

              {photoUrl && (
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--gold)', display: 'block', marginBottom: '4px' }}>Image Preview:</span>
                  <div style={{ height: '160px', borderRadius: '10px', backgroundImage: `url(${photoUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', border: '1px solid var(--gold)' }} />
                </div>
              )}

              <label>
                Photo Caption / Devotional Note
                <textarea
                  rows={2}
                  placeholder="Brief description of the darshan..."
                  value={photoDesc}
                  onChange={e => setPhotoDesc(e.target.value)}
                />
              </label>

              <button
                className="btn btn--gold"
                style={{
                  width: '100%',
                  marginTop: '8px',
                  padding: '14px',
                  fontSize: '15px',
                  fontWeight: 700,
                  boxShadow: '0 8px 24px rgba(212, 175, 55, 0.4)',
                }}
              >
                📤 UPLOAD PHOTO TO GALLERY NOW
              </button>

              {photoSuccess && <p className="success">{photoSuccess}</p>}
            </form>
          </div>

          <div className="card" style={{ padding: '32px' }}>
            <h3 style={{ fontSize: '20px', marginBottom: '4px' }}>Live Darshan Gallery Photos ({gallery.length})</h3>
            <p style={{ fontSize: '13px', color: 'var(--ink-faint)', marginBottom: '18px' }}>
              These photos are live on the public Darshan Gallery page. Click remove to delete any photo.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '14px', maxHeight: '580px', overflowY: 'auto' }}>
              {gallery.map(p => (
                <div
                  key={p._id}
                  style={{
                    position: 'relative',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    border: '1px solid var(--hairline-gold)',
                    background: '#0a1624',
                  }}
                >
                  <img
                    src={p.imageUrl}
                    alt={p.title}
                    style={{ width: '100%', height: '110px', objectFit: 'cover' }}
                  />
                  <div style={{ padding: '8px' }}>
                    <span style={{ fontSize: '10px', color: 'var(--gold)', fontWeight: 600 }}>{p.category}</span>
                    <h5 style={{ fontSize: '12px', margin: '2px 0 6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</h5>
                    <button
                      onClick={() => handleDeletePhoto(p._id, p.title)}
                      style={{
                        width: '100%',
                        color: '#f87171',
                        background: 'rgba(239, 68, 68, 0.15)',
                        padding: '4px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                      }}
                    >
                      <TrashIcon size={12} />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'events' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '32px' }}>
          <div className="card" style={{ padding: '34px', border: '2px solid var(--gold)', boxShadow: '0 0 24px rgba(212, 175, 55, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{ fontSize: '24px' }}>🎉</span>
              <h3 style={{ margin: 0, fontSize: '22px', color: 'var(--ink)' }}>Publish New Festival</h3>
            </div>
            <p style={{ fontSize: '13.5px', color: 'var(--ink-faint)', marginBottom: '22px' }}>
              Publishing a festival automatically broadcasts notifications 1 day prior and on festival day to all visitors!
            </p>

            <form onSubmit={handleAddEvent} style={{ display: 'grid', gap: '16px' }}>
              <label>
                Festival / Event Name *
                <input
                  required
                  placeholder="e.g. Sri Balarama Jayanti Mahotsav"
                  value={eventName}
                  onChange={e => setEventName(e.target.value)}
                />
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <label>
                  Festival Date *
                  <input
                    required
                    type="date"
                    value={eventDate}
                    onChange={e => setEventDate(e.target.value)}
                  />
                </label>

                <label>
                  Timings
                  <input
                    placeholder="e.g. 05:00 PM - 09:00 PM"
                    value={eventTime}
                    onChange={e => setEventTime(e.target.value)}
                  />
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <label>
                  Category
                  <select value={eventCategory} onChange={e => setEventCategory(e.target.value)}>
                    <option>Grand Annual Festival</option>
                    <option>Major Appearance Day</option>
                    <option>Festival Celebration</option>
                    <option>Rathayatra</option>
                    <option>Sankirtan Utsav</option>
                    <option>Youth Satsang</option>
                  </select>
                </label>

                <label>
                  Location / Venue
                  <input
                    value={eventLocation}
                    onChange={e => setEventLocation(e.target.value)}
                  />
                </label>
              </div>

              <div style={{ background: 'rgba(212, 175, 55, 0.08)', padding: '14px', borderRadius: '10px', border: '1px solid var(--hairline-gold)' }}>
                <label style={{ marginBottom: '6px', fontWeight: 600, color: 'var(--gold)' }}>
                  Option A: Choose Festival Banner from Device
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleEventFile}
                  style={{ padding: '8px', background: 'rgba(0,0,0,0.4)', borderRadius: '8px' }}
                />
              </div>

              <label>
                Option B: Or Paste Image Banner URL
                <input
                  placeholder="https://images.unsplash.com/..."
                  value={eventImage}
                  onChange={e => setEventImage(e.target.value)}
                />
              </label>

              {eventImage && (
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--gold)', display: 'block', marginBottom: '4px' }}>Banner Preview:</span>
                  <div style={{ height: '140px', borderRadius: '10px', backgroundImage: `url(${eventImage})`, backgroundSize: 'cover', backgroundPosition: 'center', border: '1px solid var(--gold)' }} />
                </div>
              )}

              <label>
                Festival Description & Schedule *
                <textarea
                  rows={3}
                  required
                  placeholder="Details regarding Abhishek, Chanting, Discourse, and Mahaprasadam Feast..."
                  value={eventDesc}
                  onChange={e => setEventDesc(e.target.value)}
                />
              </label>

              <button
                className="btn btn--gold"
                style={{
                  width: '100%',
                  marginTop: '8px',
                  padding: '14px',
                  fontSize: '15px',
                  fontWeight: 700,
                  boxShadow: '0 8px 24px rgba(212, 175, 55, 0.4)',
                }}
              >
                🎉 PUBLISH FESTIVAL & ACTIVATE NOTIFICATIONS
              </button>

              {eventSuccess && <p className="success">{eventSuccess}</p>}
            </form>
          </div>

          <div className="card" style={{ padding: '32px' }}>
            <h3 style={{ fontSize: '20px', marginBottom: '4px' }}>Published Festivals & Notifications ({events.length})</h3>
            <p style={{ fontSize: '13px', color: 'var(--ink-faint)', marginBottom: '18px' }}>
              These festivals are active on the website and trigger notification bell alerts.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '580px', overflowY: 'auto' }}>
              {events.map(ev => (
                <div
                  key={ev._id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(6, 15, 24, 0.75)',
                    border: '1px solid var(--hairline-gold)',
                    gap: '12px',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--gold)', fontWeight: 600, textTransform: 'uppercase' }}>
                      {ev.category} · 📅 {new Date(ev.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                    <h4 style={{ fontSize: '16px', color: 'var(--ink)', margin: '2px 0' }}>{ev.name}</h4>
                    <p style={{ fontSize: '12.5px', color: 'var(--ink-soft)', margin: 0 }}>
                      🕒 {ev.time} {ev.location && `· 📍 ${ev.location}`}
                    </p>
                  </div>

                  <button
                    onClick={() => handleDeleteEvent(ev._id, ev.name)}
                    style={{
                      color: '#f87171',
                      background: 'rgba(239, 68, 68, 0.12)',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '12px',
                    }}
                    title="Remove Festival"
                  >
                    <TrashIcon size={14} />
                    <span>Delete</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'inquiries' && (
        <div className="card" style={{ padding: '36px' }}>
          <h3 style={{ fontSize: '22px', marginBottom: '6px' }}>Devotee & Pilgrim Inquiries</h3>
          <p style={{ color: 'var(--ink-faint)', fontSize: '14px', marginBottom: '24px' }}>
            Messages received via the Contact Us form and temple inquiry helpdesk.
          </p>

          {inquiries.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {inquiries.map((inq: any, i) => (
                <div
                  key={inq._id || i}
                  style={{
                    padding: '20px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(6, 15, 24, 0.8)',
                    border: '1px solid var(--hairline-gold)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <strong style={{ color: 'var(--gold)', fontSize: '16px' }}>{inq.name}</strong>
                    <span style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>
                      {inq.contact || 'No contact provided'}
                    </span>
                  </div>
                  <p style={{ color: 'var(--ink-soft)', fontSize: '14px', margin: 0, lineHeight: 1.6 }}>
                    "{inq.message}"
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="placeholder">No pending visitor inquiries at the moment.</p>
          )}
        </div>
      )}
    </main>
  );
}

export default Dashboard;
