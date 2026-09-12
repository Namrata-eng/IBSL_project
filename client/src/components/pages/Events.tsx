import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageBanner from '../PageBanner';
import { fetchEvents, saveEvent, deleteEvent, TempleEvent } from '../../utils/templeStore';
import { CalendarIcon, PeacockFeatherIcon, ClockIcon, PlusIcon, TrashIcon, XIcon } from '../icons';

export function Events() {
  const [events, setEvents] = useState<TempleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventLocation, setEventLocation] = useState('ISKCON Kopargaon Temple Sanctum');
  const [eventCategory, setEventCategory] = useState('Grand Annual Festival');
  const [eventDesc, setEventDesc] = useState('');
  const [eventImage, setEventImage] = useState('');
  const [addSuccess, setAddSuccess] = useState('');

  const checkAdmin = () => {
    const token = localStorage.getItem('adminToken');
    const userData = localStorage.getItem('userData');
    if (token) {
      setIsAdmin(true);
    } else if (userData) {
      try {
        const u = JSON.parse(userData);
        setIsAdmin(u.role === 'admin');
      } catch {
        setIsAdmin(false);
      }
    } else {
      setIsAdmin(false);
    }
  };

  const load = async () => {
    setLoading(true);
    const data = await fetchEvents();
    setEvents(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
    checkAdmin();
    window.addEventListener('storage', checkAdmin);

    const handleUpdate = (e: any) => {
      if (e.detail) setEvents(e.detail);
      else load();
    };
    window.addEventListener('temple_events_updated', handleUpdate);
    return () => {
      window.removeEventListener('storage', checkAdmin);
      window.removeEventListener('temple_events_updated', handleUpdate);
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleAddSubmit = async (e: React.FormEvent) => {
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

    setAddSuccess(`🎉 Festival "${eventName}" published & notification activated!`);
    setEventName('');
    setEventDate('');
    setEventTime('');
    setEventDesc('');
    setEventImage('');
    const updated = await fetchEvents();
    setEvents(updated);
    setTimeout(() => {
      setAddSuccess('');
      setShowAddModal(false);
    }, 1800);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Delete festival "${name}"?`)) {
      await deleteEvent(id);
      const updated = await fetchEvents();
      setEvents(updated);
    }
  };

  const getEventBadge = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(dateStr);
    eventDate.setHours(0, 0, 0, 0);

    const diff = Math.round((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return { label: '🎉 TODAY AT TEMPLE', class: 'today' };
    if (diff === 1) return { label: '🔔 TOMORROW (1 DAY TO GO)', class: 'tomorrow' };
    if (diff < 0) return { label: 'Concluded', class: 'past' };
    return { label: `In ${diff} Days`, class: 'upcoming' };
  };

  return (
    <main className="page">
      <PageBanner
        lead="ANCIENT VAISHNAVA FESTIVALS"
        title="Grand Celebrations & Festivals"
        subtitle="Experience the transcendental ecstasy of Sri Jagannath Rathayatra, Janmashtami, and spiritual gatherings in Kopargaon."
      />

      {isAdmin && (
        <div
          className="card"
          style={{
            maxWidth: '1100px',
            margin: '0 auto 36px',
            padding: '20px 26px',
            background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(12, 25, 40, 0.95) 100%)',
            border: '2px solid var(--gold)',
            boxShadow: '0 0 24px rgba(212, 175, 55, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '26px' }}>👑</span>
            <div>
              <strong style={{ color: 'var(--gold-bright)', fontSize: '16px' }}>
                Admin Festival Publishing Controls Active
              </strong>
              <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--ink-soft)' }}>
                Add new festivals here to automatically trigger 1-day before and same-day notifications.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="btn btn--gold"
              style={{ padding: '10px 22px', fontSize: '14px', fontWeight: 700 }}
            >
              <PlusIcon size={18} />
              <span>+ Add New Festival Now</span>
            </button>
            <Link to="/admin" className="btn btn--ink" style={{ padding: '10px 18px', fontSize: '13px' }}>
              Full Admin Console
            </Link>
          </div>
        </div>
      )}

      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 250,
            background: 'rgba(4, 10, 18, 0.92)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            backdropFilter: 'blur(20px)',
          }}
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="card"
            style={{
              maxWidth: '600px',
              width: '100%',
              padding: '32px',
              border: '2px solid var(--gold)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 30px rgba(212,175,55,0.3)',
              position: 'relative',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '22px' }}>🎉</span>
                <h3 style={{ margin: 0, fontSize: '20px', color: 'var(--gold-bright)' }}>Publish New Festival</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} style={{ color: '#fff', padding: '6px' }}>
                <XIcon size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ display: 'grid', gap: '14px' }}>
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

              <div>
                <label style={{ marginBottom: '6px' }}>Choose Festival Banner from Computer</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ padding: '8px', background: 'rgba(255,255,255,0.06)' }}
                />
              </div>

              <label>
                Or Paste Image Banner URL
                <input
                  placeholder="https://images.unsplash.com/..."
                  value={eventImage}
                  onChange={e => setEventImage(e.target.value)}
                />
              </label>

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

              <button className="btn btn--gold" style={{ width: '100%', padding: '12px', fontWeight: 700 }}>
                🎉 Publish Festival & Activate Notifications
              </button>

              {addSuccess && <p className="success">{addSuccess}</p>}
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--gold)', padding: '60px 0' }}>Loading sacred festival calendar…</p>
      ) : (
        <div className="card-grid">
          {events.map(e => {
            const badge = getEventBadge(e.date);
            return (
              <article className="card" key={e._id}>
                <div
                  className="card-image"
                  style={e.imageUrl ? { backgroundImage: `url(${e.imageUrl})` } : {}}
                >
                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(e._id, e.name)}
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: 'rgba(239, 68, 68, 0.85)',
                        color: '#fff',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '12px',
                        fontWeight: 600,
                        backdropFilter: 'blur(8px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                      }}
                      title="Remove Festival"
                    >
                      <TrashIcon size={14} />
                      <span>Delete</span>
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <PeacockFeatherIcon size={16} />
                    <span className="eyebrow" style={{ margin: 0 }}>{e.category || 'Festival'}</span>
                  </div>
                  <span
                    style={{
                      fontSize: '11.5px',
                      color: badge.class === 'today' ? '#f59e0b' : badge.class === 'tomorrow' ? '#38bdf8' : 'var(--gold)',
                      fontWeight: 700,
                      background: 'rgba(212, 175, 55, 0.12)',
                      padding: '4px 12px',
                      borderRadius: 'var(--radius-pill)',
                      border: '1px solid var(--hairline-gold)',
                    }}
                  >
                    {badge.label}
                  </span>
                </div>

                <h3 style={{ fontSize: '20px' }}>{e.name}</h3>

                <p style={{ color: 'var(--ink-soft)', fontSize: '13.5px', margin: '4px 0 12px' }}>
                  📅 {new Date(e.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  {e.time && ` · 🕒 ${e.time}`}
                </p>

                {e.location && (
                  <p style={{ color: '#38bdf8', fontSize: '13px', margin: '0 0 12px' }}>
                    📍 {e.location}
                  </p>
                )}

                <p>{e.description}</p>

                <div style={{ marginTop: '22px', display: 'flex', gap: '10px' }}>
                  <Link to="/donate" className="btn btn--pearl" style={{ flex: 1, padding: '10px 14px', fontSize: '13px' }}>
                    Sponsor Seva
                  </Link>
                  <Link to="/contact" className="btn btn--ink" style={{ flex: 1, padding: '10px 14px', fontSize: '13px' }}>
                    RSVP / Inquire
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}

export default Events;
