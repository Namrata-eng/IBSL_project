import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageBanner from '../PageBanner';
import { fetchEvents, saveEvent, deleteEvent, TempleEvent } from '../../utils/templeStore';
import { CalendarIcon, PeacockFeatherIcon, ClockIcon, PlusIcon, TrashIcon, XIcon } from '../icons';
import { ImageUploader } from '../ImageUploader';

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

  // Edit Event State
  const [editingEvent, setEditingEvent] = useState<TempleEvent | null>(null);
  const [editName, setEditName] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editImage, setEditImage] = useState('');
  const [editSuccess, setEditSuccess] = useState('');

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
      imageUrl: eventImage || '/images/default-event.jpg',
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

  const handleStartEdit = (e: TempleEvent) => {
    setEditingEvent(e);
    setEditName(e.name);
    setEditDate(e.date);
    setEditTime(e.time || '');
    setEditLocation(e.location || 'ISKCON Kopargaon Temple Sanctum');
    setEditCategory(e.category || 'Grand Annual Festival');
    setEditDesc(e.description || '');
    setEditImage(e.imageUrl || '/images/default-event.jpg');
    setEditSuccess('');
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent || !editName || !editDate) return;

    await saveEvent({
      _id: editingEvent._id,
      name: editName,
      date: editDate,
      time: editTime || '06:00 PM Onwards',
      location: editLocation,
      category: editCategory,
      description: editDesc,
      imageUrl: editImage || '/images/default-event.jpg',
    });

    setEditSuccess(`🎉 Festival "${editName}" updated successfully!`);
    const updated = await fetchEvents();
    setEvents(updated);
    setTimeout(() => {
      setEditSuccess('');
      setEditingEvent(null);
    }, 1200);
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
    const eventDateObj = new Date(dateStr);
    eventDateObj.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((eventDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return { label: 'TODAY', class: 'today' };
    if (diffDays === 1) return { label: 'TOMORROW', class: 'tomorrow' };
    if (diffDays > 1 && diffDays <= 7) return { label: `IN ${diffDays} DAYS`, class: 'soon' };
    if (diffDays < 0) return { label: 'PAST FESTIVAL', class: 'past' };
    return { label: 'UPCOMING', class: 'upcoming' };
  };

  return (
    <main className="page">
      <PageBanner
        lead="VAISHNAVA FESTIVAL CALENDAR"
        title="Upcoming Utsavs & Celebrations"
        subtitle="Join us at ISKCON Kopargaon for transcendent celebrations, kirtans, abhishek, and satvik prasadam."
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <p style={{ margin: 0, color: 'var(--ink-faint)', fontSize: '14.5px' }}>
          Showing <strong>{events.length}</strong> upcoming festivals & auspicious appearance tithis in Kopargaon.
        </p>

        {isAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn--gold"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontWeight: 700 }}
          >
            <PlusIcon size={18} />
            <span>Publish Upcoming Festival</span>
          </button>
        )}
      </div>

      {/* Add Festival Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal" style={{ maxWidth: '580px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CalendarIcon size={22} />
                <h3 style={{ margin: 0, fontSize: '20px' }}>Publish Upcoming Festival</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="btn btn--ink" style={{ padding: '6px' }}>
                <XIcon size={16} />
              </button>
            </div>

            <p style={{ color: 'var(--ink-faint)', fontSize: '13.5px', marginBottom: '20px' }}>
              Publishing will immediately notify devotees on the navbar alert bell and show on the homepage.
            </p>

            <form onSubmit={handleAddSubmit} style={{ display: 'grid', gap: '14px' }}>
              <label>
                Festival Name *
                <input
                  required
                  placeholder="e.g. Sri Balarama Jayanti Mahotsav"
                  value={eventName}
                  onChange={e => setEventName(e.target.value)}
                />
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <label>
                  Date *
                  <input
                    required
                    type="date"
                    value={eventDate}
                    onChange={e => setEventDate(e.target.value)}
                  />
                </label>
                <label>
                  Timing
                  <input
                    placeholder="05:30 PM Onwards"
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

              <ImageUploader
                value={eventImage}
                onChange={setEventImage}
                label="Festival Banner Image"
              />

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

      {/* Edit Festival Modal */}
      {editingEvent && (
        <div className="modal-backdrop" onClick={() => setEditingEvent(null)}>
          <div className="modal" style={{ maxWidth: '580px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CalendarIcon size={22} />
                <h3 style={{ margin: 0, fontSize: '20px' }}>Edit Festival: {editingEvent.name}</h3>
              </div>
              <button onClick={() => setEditingEvent(null)} className="btn btn--ink" style={{ padding: '6px' }}>
                <XIcon size={16} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ display: 'grid', gap: '14px' }}>
              <label>
                Festival Name *
                <input
                  required
                  placeholder="e.g. Sri Krishna Janmashtami"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                />
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <label>
                  Date *
                  <input
                    required
                    type="date"
                    value={editDate}
                    onChange={e => setEditDate(e.target.value)}
                  />
                </label>
                <label>
                  Timing
                  <input
                    placeholder="05:00 PM Onwards"
                    value={editTime}
                    onChange={e => setEditTime(e.target.value)}
                  />
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <label>
                  Category
                  <select value={editCategory} onChange={e => setEditCategory(e.target.value)}>
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
                    value={editLocation}
                    onChange={e => setEditLocation(e.target.value)}
                  />
                </label>
              </div>

              <ImageUploader
                value={editImage}
                onChange={setEditImage}
                label="Festival Banner Image"
              />

              <label>
                Festival Description & Schedule *
                <textarea
                  rows={3}
                  required
                  placeholder="Details regarding Abhishek, Chanting, Discourse, and Mahaprasadam Feast..."
                  value={editDesc}
                  onChange={e => setEditDesc(e.target.value)}
                />
              </label>

              <button className="btn btn--gold" style={{ width: '100%', padding: '12px', fontWeight: 700 }}>
                💾 Save Festival Changes
              </button>

              {editSuccess && <p className="success">{editSuccess}</p>}
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
                    <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => handleStartEdit(e)}
                        style={{
                          background: 'rgba(212, 175, 55, 0.95)',
                          color: '#1a1005',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '12px',
                          fontWeight: 700,
                          backdropFilter: 'blur(8px)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                          cursor: 'pointer',
                          border: 'none',
                        }}
                        title="Edit Festival"
                      >
                        <span>✏️</span>
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(e._id, e.name)}
                        style={{
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
                          cursor: 'pointer',
                          border: 'none',
                        }}
                        title="Remove Festival"
                      >
                        <TrashIcon size={14} />
                        <span>Delete</span>
                      </button>
                    </div>
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
