import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageBanner from '../PageBanner';
import { fetchGallery, saveGalleryPhoto, deleteGalleryPhoto, GalleryPhoto } from '../../utils/templeStore';
import { XIcon, PeacockFeatherIcon, PlusIcon, TrashIcon } from '../icons';

export function Gallery() {
  const [images, setImages] = useState<GalleryPhoto[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedImage, setSelectedImage] = useState<GalleryPhoto | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [photoTitle, setPhotoTitle] = useState('');
  const [photoCategory, setPhotoCategory] = useState('Deity Darshan');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoDesc, setPhotoDesc] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');

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
    const data = await fetchGallery();
    setImages(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
    checkAdmin();
    window.addEventListener('storage', checkAdmin);

    const handleUpdate = (e: any) => {
      if (e.detail) setImages(e.detail);
      else load();
    };
    window.addEventListener('temple_gallery_updated', handleUpdate);
    return () => {
      window.removeEventListener('storage', checkAdmin);
      window.removeEventListener('temple_gallery_updated', handleUpdate);
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoTitle || !photoUrl) return;

    await saveGalleryPhoto({
      title: photoTitle,
      category: photoCategory,
      imageUrl: photoUrl,
      description: photoDesc,
    });

    setUploadSuccess(`✨ "${photoTitle}" uploaded successfully to Darshan Gallery!`);
    setPhotoTitle('');
    setPhotoUrl('');
    setPhotoDesc('');
    const updated = await fetchGallery();
    setImages(updated);
    setTimeout(() => {
      setUploadSuccess('');
      setShowUploadModal(false);
    }, 1800);
  };

  const handleDeletePhoto = async (e: React.MouseEvent, id: string, title: string) => {
    e.stopPropagation();
    if (window.confirm(`Delete photo "${title}" from the gallery?`)) {
      await deleteGalleryPhoto(id);
      const updated = await fetchGallery();
      setImages(updated);
    }
  };

  const categories = ['All', 'Deity Darshan', 'Rathayatra', 'Gaushala', 'Kirtan', 'Annadaan', 'Festival Abhishek'];

  const filtered = activeCategory === 'All'
    ? images
    : images.filter(x => x.category.toLowerCase() === activeCategory.toLowerCase());

  return (
    <main className="page">
      <PageBanner
        lead="DIVINE DEITY DARSHAN"
        title="Darshan & Festival Gallery"
        subtitle="Behold the celestial beauty of Sri Sri Radha Krishna, ecstatic Rathayatra chariot celebrations, Gaushala cow seva, and Harinam in Kopargaon."
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
                Admin Photo Upload Controls Active
              </strong>
              <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--ink-soft)' }}>
                You can upload new photos directly or click below to open the upload console.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={() => setShowUploadModal(true)}
              className="btn btn--gold"
              style={{ padding: '10px 22px', fontSize: '14px', fontWeight: 700 }}
            >
              <PlusIcon size={18} />
              <span>+ Upload Deity Photo Now</span>
            </button>
            <Link to="/admin" className="btn btn--ink" style={{ padding: '10px 18px', fontSize: '13px' }}>
              Full Admin Console
            </Link>
          </div>
        </div>
      )}

      {showUploadModal && (
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
          onClick={() => setShowUploadModal(false)}
        >
          <div
            className="card"
            style={{
              maxWidth: '560px',
              width: '100%',
              padding: '32px',
              border: '2px solid var(--gold)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 30px rgba(212,175,55,0.3)',
              position: 'relative',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '22px' }}>📸</span>
                <h3 style={{ margin: 0, fontSize: '20px', color: 'var(--gold-bright)' }}>Upload Deity / Festival Photo</h3>
              </div>
              <button onClick={() => setShowUploadModal(false)} style={{ color: '#fff', padding: '6px' }}>
                <XIcon size={18} />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} style={{ display: 'grid', gap: '16px' }}>
              <label>
                Photo Title *
                <input
                  required
                  placeholder="e.g. Sri Sri Radha Krishna Morning Sringar"
                  value={photoTitle}
                  onChange={e => setPhotoTitle(e.target.value)}
                />
              </label>

              <label>
                Category *
                <select value={photoCategory} onChange={e => setPhotoCategory(e.target.value)}>
                  <option>Deity Darshan</option>
                  <option>Rathayatra</option>
                  <option>Gaushala</option>
                  <option>Kirtan</option>
                  <option>Annadaan</option>
                  <option>Festival Abhishek</option>
                </select>
              </label>

              <div>
                <label style={{ marginBottom: '6px' }}>Choose Photo from Computer / Phone</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ padding: '8px', background: 'rgba(255,255,255,0.06)' }}
                />
              </div>

              <label>
                Or Paste Direct Image URL (HD Photo)
                <input
                  placeholder="https://images.unsplash.com/..."
                  value={photoUrl}
                  onChange={e => setPhotoUrl(e.target.value)}
                />
              </label>

              {photoUrl && (
                <div style={{ height: '140px', borderRadius: '10px', backgroundImage: `url(${photoUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', border: '1px solid var(--hairline-gold)' }} />
              )}

              <label>
                Description / Caption
                <textarea
                  rows={2}
                  placeholder="Brief devotional description..."
                  value={photoDesc}
                  onChange={e => setPhotoDesc(e.target.value)}
                />
              </label>

              <button className="btn btn--gold" style={{ width: '100%', padding: '12px', fontWeight: 700 }}>
                📤 Publish Photo to Gallery Now
              </button>

              {uploadSuccess && <p className="success">{uploadSuccess}</p>}
            </form>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px', marginBottom: '40px' }}>
        {categories.map(c => (
          <button
            key={c}
            onClick={() => setActiveCategory(c)}
            className={`btn ${activeCategory === c ? 'btn--pearl' : 'btn--ink'}`}
            style={{ padding: '9px 20px', fontSize: '13.5px' }}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--gold)', padding: '60px 0' }}>Loading divine darshan images…</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {filtered.map(img => (
            <div
              key={img._id}
              onClick={() => setSelectedImage(img)}
              className="card"
              style={{
                padding: '0',
                overflow: 'hidden',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  height: '260px',
                  backgroundImage: `url(${img.imageUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  transition: 'transform .5s ease',
                  position: 'relative',
                }}
              >
                {isAdmin && (
                  <button
                    onClick={(e) => handleDeletePhoto(e, img._id, img.title)}
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
                    title="Remove Photo"
                  >
                    <TrashIcon size={14} />
                    <span>Delete</span>
                  </button>
                )}
              </div>
              <div style={{ padding: '18px 22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <PeacockFeatherIcon size={14} />
                  <span className="eyebrow" style={{ fontSize: '11px', margin: 0 }}>{img.category}</span>
                </div>
                <h3 style={{ fontSize: '17px', margin: '4px 0 2px', color: 'var(--ink)' }}>{img.title}</h3>
                {img.description && (
                  <p style={{ color: 'var(--ink-faint)', fontSize: '13px', margin: 0, fontWeight: 300 }}>{img.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedImage && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            background: 'rgba(4, 10, 18, 0.96)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            backdropFilter: 'blur(20px)',
          }}
          onClick={() => setSelectedImage(null)}
        >
          <div
            style={{ maxWidth: '960px', width: '100%', position: 'relative' }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              style={{
                position: 'absolute',
                top: '-48px',
                right: '0',
                color: '#fff',
                background: 'rgba(255,255,255,0.15)',
                borderRadius: '50%',
                padding: '10px',
                display: 'grid',
                placeItems: 'center',
              }}
              aria-label="Close"
            >
              <XIcon size={22} />
            </button>
            <img
              src={selectedImage.imageUrl}
              alt={selectedImage.title}
              style={{
                width: '100%',
                maxHeight: '75vh',
                objectFit: 'contain',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--hairline-gold)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
              }}
            />
            <div style={{ marginTop: '18px', textAlign: 'center' }}>
              <span className="eyebrow">{selectedImage.category}</span>
              <h2 style={{ fontSize: '22px', color: 'var(--ink)', margin: '4px 0 6px' }}>{selectedImage.title}</h2>
              {selectedImage.description && (
                <p style={{ color: 'var(--ink-soft)', fontSize: '14.5px' }}>
                  {selectedImage.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default Gallery;
