import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageBanner from '../PageBanner';
import { LotusIcon, XIcon } from '../icons';
import { ImageUploader } from '../ImageUploader';

export function Prasadam() {
  const [prasadamList, setPrasadamList] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  // Edit Prasadam State
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editAvailability, setEditAvailability] = useState('');
  const [editTiming, setEditTiming] = useState('');
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

  const loadPrasadam = () => {
    fetch('/api/prasadam')
      .then(r => (r.ok ? r.json() : { data: [] }))
      .then(d => setPrasadamList(d.data || []))
      .catch(() => setPrasadamList([]));
  };

  useEffect(() => {
    loadPrasadam();
    checkAdmin();
    window.addEventListener('storage', checkAdmin);
    return () => window.removeEventListener('storage', checkAdmin);
  }, []);

  const defaultPrasadam = [
    {
      _id: 'p1',
      name: 'Daily Sadhu & Devotee Annadaan',
      description: 'Wholesome, freshly cooked pure satvik vegetarian thali offered to Lord Krishna before serving with love.',
      availability: 'Served daily to all visitors and sadhus',
      timing: '12:30 PM - 02:00 PM',
      imageUrl: '/images/sadhu-bhojan.jpg',
    },
    {
      _id: 'p2',
      name: 'Sunday Love Feast (Maha Prasadam)',
      description: 'Elaborate festive dinner feast following Sunday evening Gaura Aarti, ecstatic kirtan, and Bhagavad Gita lecture.',
      availability: 'Every Sunday evening',
      timing: '07:30 PM onwards',
      imageUrl: '/images/sunday-feast.jpg',
    },
    {
      _id: 'p3',
      name: 'Govinda Pure Ghee Sweets & Snacks',
      description: 'Traditional Indian sweets made with pure cow ghee (Besan Laddoo, Kaju Katli, Peda, Gulab Jamun) and savory snacks.',
      availability: 'Available daily at the temple sweet counter',
      timing: '07:00 AM - 09:00 PM',
      imageUrl: '/images/govinda-sweets.jpg',
    },
  ];

  const list = prasadamList.length > 0 ? prasadamList : defaultPrasadam;

  const handleStartEdit = (item: any) => {
    setEditingItem(item);
    setEditName(item.name || '');
    setEditDesc(item.description || '');
    setEditAvailability(item.availability || '');
    setEditTiming(item.timing || '');
    setEditImage(item.imageUrl || '');
    setEditSuccess('');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const token = localStorage.getItem('adminToken') || localStorage.getItem('userToken');
    const payload = {
      name: editName,
      description: editDesc,
      availability: editAvailability,
      timing: editTiming,
      imageUrl: editImage,
    };

    try {
      const res = await fetch(`/api/prasadam/${editingItem._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setEditSuccess('✨ Prasadam item updated successfully!');
        loadPrasadam();
        setTimeout(() => {
          setEditSuccess('');
          setEditingItem(null);
        }, 1200);
      } else {
        setPrasadamList(prev =>
          prev.length > 0
            ? prev.map(p => (p._id === editingItem._id ? { ...p, ...payload } : p))
            : defaultPrasadam.map(p => (p._id === editingItem._id ? { ...p, ...payload } : p))
        );
        setEditSuccess('✨ Prasadam item updated locally!');
        setTimeout(() => {
          setEditSuccess('');
          setEditingItem(null);
        }, 1200);
      }
    } catch {
      setEditSuccess('✨ Prasadam item updated locally!');
      setTimeout(() => {
        setEditSuccess('');
        setEditingItem(null);
      }, 1200);
    }
  };

  return (
    <main className="page">
      <PageBanner
        lead="KARMA-FREE SATVIK FEAST"
        title="Sanctified Krishna Prasadam"
        subtitle="Food prepared with love and devotion and offered to the Supreme Lord Krishna purifies the heart and bestows spiritual joy."
      />

      <div className="card-grid">
        {list.map((item: any) => (
          <article className="card" key={item._id} style={{ position: 'relative' }}>
            <div
              className="card-image"
              style={item.imageUrl ? { backgroundImage: `url(${item.imageUrl})` } : {}}
            >
              {isAdmin && (
                <button
                  onClick={() => handleStartEdit(item)}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
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
                  title="Edit Prasadam"
                >
                  <span>✏️</span>
                  <span>Edit</span>
                </button>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <LotusIcon size={16} />
              <span className="eyebrow" style={{ margin: 0 }}>{item.availability || 'Prasadam'}</span>
            </div>
            <h3>{item.name}</h3>
            {item.timing && (
              <p style={{ color: 'var(--gold)', fontSize: '13px', marginBottom: '8px' }}>
                🕒 {item.timing}
              </p>
            )}
            <p>{item.description}</p>
          </article>
        ))}
      </div>

      {/* Edit Prasadam Modal */}
      {editingItem && (
        <div className="modal-backdrop" onClick={() => setEditingItem(null)}>
          <div className="modal" style={{ maxWidth: '560px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '20px' }}>✏️ Edit Prasadam: {editingItem.name}</h3>
              <button onClick={() => setEditingItem(null)} className="btn btn--ink" style={{ padding: '6px' }}>
                <XIcon size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: 'grid', gap: '14px' }}>
              <label>
                Prasadam Name *
                <input
                  required
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                />
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <label>
                  Availability / Timing Note
                  <input
                    value={editAvailability}
                    onChange={e => setEditAvailability(e.target.value)}
                  />
                </label>
                <label>
                  Service Hours
                  <input
                    value={editTiming}
                    onChange={e => setEditTiming(e.target.value)}
                  />
                </label>
              </div>

              <ImageUploader
                value={editImage}
                onChange={setEditImage}
                label="Prasadam Dish Photo"
              />

              <label>
                Description *
                <textarea
                  rows={3}
                  required
                  value={editDesc}
                  onChange={e => setEditDesc(e.target.value)}
                />
              </label>

              <button className="btn btn--gold" style={{ width: '100%', padding: '12px', fontWeight: 700 }}>
                💾 Save Prasadam Changes
              </button>

              {editSuccess && <p className="success">{editSuccess}</p>}
            </form>
          </div>
        </div>
      )}

      <div className="card" style={{ maxWidth: '840px', margin: '48px auto 0', padding: '36px', textAlign: 'center' }}>
        <LotusIcon size={36} />
        <h3 style={{ fontSize: '22px', margin: '12px 0 10px' }}>Sponsor a Day of Maha Prasadam</h3>
        <p style={{ color: 'var(--ink-soft)', fontSize: '15px', lineHeight: 1.65, marginBottom: '24px' }}>
          Bring transcendental auspiciousness to your family by sponsoring the Sunday Love Feast or daily Annadaan for sadhus and pilgrims in Kopargaon.
        </p>
        <Link to="/donate" className="btn btn--pearl">
          Sponsor Prasadam Seva
        </Link>
      </div>
    </main>
  );
}

export default Prasadam;
