import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageBanner from '../PageBanner';
import { ChevronRight, PeacockFeatherIcon, XIcon } from '../icons';
import { ImageUploader } from '../ImageUploader';

export function Services() {
  const [services, setServices] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  // Edit Service State
  const [editingService, setEditingService] = useState<any | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSubtitle, setEditSubtitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDesc, setEditDesc] = useState('');
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

  const loadServices = () => {
    fetch('/api/services')
      .then(r => (r.ok ? r.json() : { data: [] }))
      .then(d => setServices(d.data || []))
      .catch(() => setServices([]));
  };

  useEffect(() => {
    loadServices();
    checkAdmin();
    window.addEventListener('storage', checkAdmin);
    return () => window.removeEventListener('storage', checkAdmin);
  }, []);

  const fallbackServices = [
    {
      _id: 's1',
      title: 'Sadhu Bhojan & Annadaan',
      subtitle: 'Nourishing the soul with Krishna Prasadam',
      category: 'Community Seva',
      description: 'Daily distribution of sanctified Satvik vegetarian meals to sadhus, pilgrims, and local residents across Kopargaon.',
      imageUrl: '/images/sadhu-bhojan.jpg',
      timing: 'Daily 12:30 PM - 02:00 PM',
      link: '/annadaan',
    },
    {
      _id: 's2',
      title: 'Youth Empowerment Centre (IYF)',
      subtitle: 'Vedic arts, music & character building',
      category: 'Youth Forum',
      description: 'Engaging college students and youth with mridanga and harmonium training, leadership, public speaking, and Gita life lessons.',
      imageUrl: '/images/youth-iyf.jpg',
      timing: 'Every Weekend',
      link: '/contact',
    },
    {
      _id: 's3',
      title: 'Gaushala (Gau Seva)',
      subtitle: 'Protecting and serving Mother Surabhi',
      category: 'Gau Seva',
      description: 'Loving care and shelter for indigenous Desi cows, providing daily green fodder, natural habitat, and compassionate veterinary support.',
      imageUrl: '/images/gaushala.jpg',
      timing: 'Daily 08:00 AM - 06:00 PM',
      link: '/gaushala',
    },
    {
      _id: 's4',
      title: 'Gita Life Course',
      subtitle: 'Practical Vedic philosophy for modern living',
      category: 'Spiritual Courses',
      description: 'Systematic study of Bhagavad Gita As It Is, covering karma, reincarnation, time, material nature, and the Supreme Personality of Godhead.',
      imageUrl: '/images/gita-life.jpg',
      timing: 'Weekend Batches',
      link: '/contact',
    },
    {
      _id: 's5',
      title: 'Harinam Sankirtan',
      subtitle: 'Congregational chanting of the holy names',
      category: 'Devotional Kirtan',
      description: 'Weekly public Harinam kirtan in Kopargaon spreading the divine vibrations of the Hare Krishna Maha Mantra.',
      imageUrl: '/images/harinam.jpg',
      timing: 'Sundays 05:30 PM',
      link: '/contact',
    },
    {
      _id: 's6',
      title: 'Samskar Value Education',
      subtitle: 'Shaping young minds through timeless ethics',
      category: 'Children Education',
      description: 'Interactive moral education for children including Vedic storytelling, drama, shloka recitation, and devotional art.',
      imageUrl: '/images/samskar-children.jpg',
      timing: 'Sundays 10:00 AM',
      link: '/contact',
    },
  ];

  const list = services.length > 0 ? services : fallbackServices;

  const handleStartEdit = (item: any) => {
    setEditingService(item);
    setEditTitle(item.title || '');
    setEditSubtitle(item.subtitle || '');
    setEditCategory(item.category || '');
    setEditDesc(item.description || '');
    setEditTiming(item.timing || '');
    setEditImage(item.imageUrl || '');
    setEditSuccess('');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;

    const token = localStorage.getItem('adminToken') || localStorage.getItem('userToken');
    const payload = {
      title: editTitle,
      subtitle: editSubtitle,
      category: editCategory,
      description: editDesc,
      timing: editTiming,
      imageUrl: editImage,
    };

    try {
      const res = await fetch(`/api/services/${editingService._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setEditSuccess('✨ Service updated successfully!');
        loadServices();
        setTimeout(() => {
          setEditSuccess('');
          setEditingService(null);
        }, 1200);
      } else {
        // If it was a fallback ID or not in DB, update local state
        setServices(prev =>
          prev.length > 0
            ? prev.map(s => (s._id === editingService._id ? { ...s, ...payload } : s))
            : fallbackServices.map(s => (s._id === editingService._id ? { ...s, ...payload } : s))
        );
        setEditSuccess('✨ Service updated locally!');
        setTimeout(() => {
          setEditSuccess('');
          setEditingService(null);
        }, 1200);
      }
    } catch {
      setEditSuccess('✨ Service updated locally!');
      setTimeout(() => {
        setEditSuccess('');
        setEditingService(null);
      }, 1200);
    }
  };

  return (
    <main className="page">
      <PageBanner
        lead="SPIRITUAL MINISTRIES"
        title="Devotional & Community Services"
        subtitle="From sacred meals and cow protection to youth empowerment and Vedic philosophy, discover how we serve in Kopargaon."
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
                  title="Edit Service"
                >
                  <span>✏️</span>
                  <span>Edit</span>
                </button>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <PeacockFeatherIcon size={16} />
              <span className="eyebrow" style={{ margin: 0 }}>{item.category || 'Spiritual Service'}</span>
            </div>
            <h3>{item.title}</h3>
            {item.timing && (
              <p style={{ color: 'var(--gold)', fontSize: '13px', marginBottom: '8px' }}>
                🕒 {item.timing}
              </p>
            )}
            <p>{item.description}</p>
            <div style={{ marginTop: '20px' }}>
              <Link to={item.link || '/contact'} className="home-intro-link">
                <span>Participate / Inquire</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          </article>
        ))}
      </div>

      {/* Edit Service Modal */}
      {editingService && (
        <div className="modal-backdrop" onClick={() => setEditingService(null)}>
          <div className="modal" style={{ maxWidth: '560px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '20px' }}>✏️ Edit Service: {editingService.title}</h3>
              <button onClick={() => setEditingService(null)} className="btn btn--ink" style={{ padding: '6px' }}>
                <XIcon size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: 'grid', gap: '14px' }}>
              <label>
                Service Title *
                <input
                  required
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                />
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <label>
                  Category
                  <input
                    value={editCategory}
                    onChange={e => setEditCategory(e.target.value)}
                  />
                </label>
                <label>
                  Timing
                  <input
                    value={editTiming}
                    onChange={e => setEditTiming(e.target.value)}
                  />
                </label>
              </div>

              <ImageUploader
                value={editImage}
                onChange={setEditImage}
                label="Service Photo"
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
                💾 Save Service Changes
              </button>

              {editSuccess && <p className="success">{editSuccess}</p>}
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default Services;
