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
  HeartIcon,
  XIcon,
} from '../icons';
import { ImageUploader } from '../ImageUploader';

export function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'donations' | 'gallery' | 'events' | 'inquiries'>('donations');

  // Events State
  const [events, setEvents] = useState<TempleEvent[]>([]);
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventLocation, setEventLocation] = useState('ISKCON Kopargaon Temple Sanctum');
  const [eventCategory, setEventCategory] = useState('Grand Annual Festival');
  const [eventDesc, setEventDesc] = useState('');
  const [eventImage, setEventImage] = useState('');
  const [eventSuccess, setEventSuccess] = useState('');

  // Edit Event State
  const [editingEvent, setEditingEvent] = useState<TempleEvent | null>(null);
  const [editEventName, setEditEventName] = useState('');
  const [editEventDate, setEditEventDate] = useState('');
  const [editEventTime, setEditEventTime] = useState('');
  const [editEventLocation, setEditEventLocation] = useState('');
  const [editEventCategory, setEditEventCategory] = useState('');
  const [editEventDesc, setEditEventDesc] = useState('');
  const [editEventImage, setEditEventImage] = useState('');
  const [editEventSuccess, setEditEventSuccess] = useState('');

  // Gallery State
  const [gallery, setGallery] = useState<GalleryPhoto[]>([]);
  const [photoTitle, setPhotoTitle] = useState('');
  const [photoCategory, setPhotoCategory] = useState('Deity Darshan');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [photoDesc, setPhotoDesc] = useState('');
  const [photoSuccess, setPhotoSuccess] = useState('');

  // Inquiries State
  const [inquiries, setInquiries] = useState<any[]>([]);

  // Donations State
  const [donations, setDonations] = useState<any[]>([]);
  const [donationTotal, setDonationTotal] = useState(0);
  const [verifiedTotal, setVerifiedTotal] = useState(0);
  const [donationCounts, setDonationCounts] = useState({ all: 0, pending: 0, verified: 0, rejected: 0 });
  const [donationFilter, setDonationFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all');
  const [donationPage, setDonationPage] = useState(1);
  const [loadingDonations, setLoadingDonations] = useState(false);

  // Donation Review Modal
  const [selectedDonation, setSelectedDonation] = useState<any | null>(null);
  const [screenshotBlobUrl, setScreenshotBlobUrl] = useState<string | null>(null);
  const [loadingScreenshot, setLoadingScreenshot] = useState(false);
  const [screenshotError, setScreenshotError] = useState('');
  const [verifyDeleteScreenshot, setVerifyDeleteScreenshot] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [modalActionLoading, setModalActionLoading] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

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

    loadDonations('all', 1);
  };

  const loadDonations = async (statusFilter = donationFilter, page = donationPage) => {
    setLoadingDonations(true);
    const token = localStorage.getItem('adminToken') || localStorage.getItem('userToken');
    try {
      const url = `/api/donations?page=${page}&limit=15${statusFilter !== 'all' ? `&status=${statusFilter}` : ''}`;
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setDonations(data.items || []);
        setDonationTotal(data.total || 0);
        setVerifiedTotal(data.verifiedTotal || 0);
        setDonationCounts(data.counts || { all: 0, pending: 0, verified: 0, rejected: 0 });
      }
    } catch (err) {
      console.error('Error loading donations:', err);
    } finally {
      setLoadingDonations(false);
    }
  };

  const handleFilterChange = (filter: 'all' | 'pending' | 'verified' | 'rejected') => {
    setDonationFilter(filter);
    setDonationPage(1);
    loadDonations(filter, 1);
  };

  const handlePageChange = (newPage: number) => {
    setDonationPage(newPage);
    loadDonations(donationFilter, newPage);
  };

  const handleDownloadCsv = async () => {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('userToken');
    try {
      const res = await fetch('/api/donations/export', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `iskcon_kopargaon_donations_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      } else {
        alert('Failed to export donation CSV.');
      }
    } catch {
      alert('Failed to export donation CSV.');
    }
  };

  const openDonationModal = async (donation: any) => {
    setSelectedDonation(donation);
    setVerifyDeleteScreenshot(false);
    setRejectReason(donation.rejectReason || '');
    setModalMessage('');
    setScreenshotError('');

    if (screenshotBlobUrl) {
      URL.revokeObjectURL(screenshotBlobUrl);
      setScreenshotBlobUrl(null);
    }

    if (!donation.hasScreenshot) {
      // Screenshot was already deleted or TTL expired; do NOT call endpoint
      return;
    }

    setLoadingScreenshot(true);
    const token = localStorage.getItem('adminToken') || localStorage.getItem('userToken');
    try {
      const res = await fetch(`/api/donations/${donation._id}/screenshot`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const blob = await res.blob();
        setScreenshotBlobUrl(URL.createObjectURL(blob));
      } else {
        const d = await res.json().catch(() => ({}));
        setScreenshotError(d.message || 'Screenshot deleted');
      }
    } catch {
      setScreenshotError('Unable to load screenshot proof.');
    } finally {
      setLoadingScreenshot(false);
    }
  };

  const closeDonationModal = () => {
    if (screenshotBlobUrl) {
      URL.revokeObjectURL(screenshotBlobUrl);
      setScreenshotBlobUrl(null);
    }
    setSelectedDonation(null);
  };

  const handleVerifyDonation = async () => {
    if (!selectedDonation) return;
    setModalActionLoading(true);
    const token = localStorage.getItem('adminToken') || localStorage.getItem('userToken');
    try {
      const res = await fetch(`/api/donations/${selectedDonation._id}/verify`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ deleteScreenshotNow: verifyDeleteScreenshot }),
      });
      if (res.ok) {
        setModalMessage('✓ Donation verified successfully!');
        await loadDonations();
        setTimeout(() => closeDonationModal(), 1200);
      } else {
        const d = await res.json();
        setScreenshotError(d.message || 'Verification failed');
      }
    } catch (err: any) {
      setScreenshotError(err.message || 'Verification failed');
    } finally {
      setModalActionLoading(false);
    }
  };

  const handleRejectDonation = async () => {
    if (!selectedDonation) return;
    if (!rejectReason.trim()) {
      setScreenshotError('Please provide a reason for rejection.');
      return;
    }
    setModalActionLoading(true);
    const token = localStorage.getItem('adminToken') || localStorage.getItem('userToken');
    try {
      const res = await fetch(`/api/donations/${selectedDonation._id}/reject`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          reason: rejectReason.trim(),
          deleteScreenshotNow: verifyDeleteScreenshot,
        }),
      });
      if (res.ok) {
        setModalMessage('✕ Donation marked as rejected.');
        await loadDonations();
        setTimeout(() => closeDonationModal(), 1200);
      } else {
        const d = await res.json();
        setScreenshotError(d.message || 'Rejection failed');
      }
    } catch (err: any) {
      setScreenshotError(err.message || 'Rejection failed');
    } finally {
      setModalActionLoading(false);
    }
  };

  const handleDeleteScreenshotNow = async () => {
    if (!selectedDonation) return;
    if (selectedDonation.status === 'pending') {
      alert('Verify or reject first before deleting screenshot.');
      return;
    }
    if (!window.confirm('Delete this payment proof screenshot now? This cannot be undone.')) {
      return;
    }

    setModalActionLoading(true);
    const token = localStorage.getItem('adminToken') || localStorage.getItem('userToken');
    try {
      const res = await fetch(`/api/donations/${selectedDonation._id}/screenshot`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        if (screenshotBlobUrl) {
          URL.revokeObjectURL(screenshotBlobUrl);
          setScreenshotBlobUrl(null);
        }
        setSelectedDonation({ ...selectedDonation, hasScreenshot: false });
        setModalMessage('Payment proof screenshot permanently deleted.');
        await loadDonations();
      } else {
        const d = await res.json();
        alert(d.message || 'Could not delete screenshot');
      }
    } catch (err: any) {
      alert(err.message || 'Could not delete screenshot');
    } finally {
      setModalActionLoading(false);
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
      imageUrl: eventImage || '/images/default-event.jpg',
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

  const handleStartEditEvent = (ev: TempleEvent) => {
    setEditingEvent(ev);
    setEditEventName(ev.name);
    setEditEventDate(ev.date);
    setEditEventTime(ev.time || '');
    setEditEventLocation(ev.location || 'ISKCON Kopargaon Temple Sanctum');
    setEditEventCategory(ev.category || 'Grand Annual Festival');
    setEditEventDesc(ev.description || '');
    setEditEventImage(ev.imageUrl || '/images/default-event.jpg');
    setEditEventSuccess('');
  };

  const handleEditEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent || !editEventName || !editEventDate) return;

    await saveEvent({
      _id: editingEvent._id,
      name: editEventName,
      date: editEventDate,
      time: editEventTime || '06:00 PM Onwards',
      location: editEventLocation,
      category: editEventCategory,
      description: editEventDesc,
      imageUrl: editEventImage || '/images/default-event.jpg',
    });

    setEditEventSuccess(`🎉 Festival "${editEventName}" updated successfully!`);
    const updated = await fetchEvents();
    setEvents(updated);
    setTimeout(() => {
      setEditEventSuccess('');
      setEditingEvent(null);
    }, 1200);
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
    if (!photoTitle || !photoUrl) {
      alert('Please provide a photo title and upload an image.');
      return;
    }

    const formData = new FormData();
    formData.append('title', photoTitle);
    formData.append('category', photoCategory);
    if (photoDesc) formData.append('description', photoDesc);
    formData.append('imageUrl', photoUrl);

    await saveGalleryPhoto(formData);

    setPhotoSuccess(`✨ Photo "${photoTitle}" uploaded to Darshan Gallery successfully!`);
    setPhotoTitle('');
    setPhotoUrl('');
    setPhotoDesc('');

    const updated = await fetchGallery();
    setGallery(updated);
    setTimeout(() => setPhotoSuccess(''), 4500);
  };

  const handleDeletePhoto = async (id: string, title: string) => {
    if (window.confirm(`Delete photo "${title}" from the public gallery?`)) {
      await deleteGalleryPhoto(id);
      const updated = await fetchGallery();
      setGallery(updated);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    navigate('/login');
  };

  const totalPages = Math.ceil(donationTotal / 15) || 1;

  return (
    <main className="page" style={{ maxWidth: '1240px', margin: '0 auto', paddingBottom: '80px' }}>
      <PageBanner
        lead="TEMPLE ADMINISTRATION"
        title="Admin Control Console"
        subtitle="Manual donation verification, deity darshan photo publisher, festival manager, and pilgrim inquiries."
      />

      {/* Top Banner Stats */}
      <div
        className="card"
        style={{
          padding: '24px 32px',
          marginBottom: '32px',
          background: 'radial-gradient(circle at 10% 10%, rgba(245, 176, 65, 0.2), rgba(14, 28, 44, 0.95))',
          border: '1.5px solid var(--gold)',
          boxShadow: '0 0 30px rgba(212, 175, 55, 0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <TilakMark size={32} />
          <div>
            <strong style={{ fontSize: '18px', color: 'var(--gold-bright)' }}>ISKCON Kopargaon Sevak Console</strong>
            <p style={{ margin: '2px 0 0', fontSize: '13.5px', color: 'var(--ink-soft)' }}>
              Logged in as Administrator · Changes sync directly with live website visitors
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/gallery" className="btn btn--pearl" style={{ fontSize: '13px' }}>
            View Public Gallery
          </Link>
          <Link to="/events" className="btn btn--ink" style={{ fontSize: '13px' }}>
            View Public Festivals
          </Link>
        </div>
      </div>

      {/* Tab Controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px', marginBottom: '36px' }}>
        <button
          onClick={() => {
            setActiveTab('donations');
            loadDonations();
          }}
          className={`btn ${activeTab === 'donations' ? 'btn--gold' : 'btn--ink'}`}
          style={{ padding: '12px 22px', fontSize: '14.5px', fontWeight: 700 }}
        >
          <HeartIcon size={18} />
          <span>
            💰 Donations & Verification{' '}
            {donationCounts.pending > 0 ? (
              <span style={{ background: '#ef4444', color: '#fff', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', marginLeft: '6px' }}>
                {donationCounts.pending} Pending
              </span>
            ) : (
              `(${donationCounts.all})`
            )}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('gallery')}
          className={`btn ${activeTab === 'gallery' ? 'btn--gold' : 'btn--ink'}`}
          style={{ padding: '12px 22px', fontSize: '14.5px', fontWeight: 700 }}
        >
          <PeacockFeatherIcon size={18} />
          <span>📸 Gallery Photos ({gallery.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('events')}
          className={`btn ${activeTab === 'events' ? 'btn--gold' : 'btn--ink'}`}
          style={{ padding: '12px 22px', fontSize: '14.5px', fontWeight: 700 }}
        >
          <CalendarIcon size={18} />
          <span>🎉 Festivals & Events ({events.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('inquiries')}
          className={`btn ${activeTab === 'inquiries' ? 'btn--gold' : 'btn--ink'}`}
          style={{ padding: '12px 22px', fontSize: '14.5px', fontWeight: 700 }}
        >
          <span>✉️ Inquiries ({inquiries.length})</span>
        </button>

        <button onClick={handleSignOut} className="btn btn--ink" style={{ padding: '12px 20px', marginLeft: 'auto' }}>
          Sign Out
        </button>
      </div>

      {/* =========================================================================
          TAB 1: DONATIONS VERIFICATION CONSOLE
          ========================================================================= */}
      {activeTab === 'donations' && (
        <div>
          {/* Summary Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', marginBottom: '28px' }}>
            <div className="card" style={{ padding: '22px', borderTop: '3px solid #10b981' }}>
              <small style={{ color: 'var(--ink-soft)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Total Verified Seva
              </small>
              <h2 style={{ fontSize: '28px', color: '#10b981', margin: '6px 0 0', fontWeight: 700 }}>
                ₹{verifiedTotal.toLocaleString('en-IN')}
              </h2>
            </div>

            <div className="card" style={{ padding: '22px', borderTop: '3px solid #f59e0b' }}>
              <small style={{ color: 'var(--ink-soft)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Pending Verification
              </small>
              <h2 style={{ fontSize: '28px', color: '#f59e0b', margin: '6px 0 0', fontWeight: 700 }}>
                {donationCounts.pending}
              </h2>
            </div>

            <div className="card" style={{ padding: '22px', borderTop: '3px solid #38bdf8' }}>
              <small style={{ color: 'var(--ink-soft)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Verified Offerings
              </small>
              <h2 style={{ fontSize: '28px', color: '#38bdf8', margin: '6px 0 0', fontWeight: 700 }}>
                {donationCounts.verified}
              </h2>
            </div>

            <div className="card" style={{ padding: '22px', borderTop: '3px solid #ef4444' }}>
              <small style={{ color: 'var(--ink-soft)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Rejected Records
              </small>
              <h2 style={{ fontSize: '28px', color: '#ef4444', margin: '6px 0 0', fontWeight: 700 }}>
                {donationCounts.rejected}
              </h2>
            </div>
          </div>

          {/* Filter & Export Row */}
          <div
            className="card"
            style={{
              padding: '16px 22px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '14px',
            }}
          >
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: 'var(--ink-soft)', marginRight: '6px' }}>Status:</span>
              {(['all', 'pending', 'verified', 'rejected'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => handleFilterChange(f)}
                  className={`btn ${donationFilter === f ? 'btn--gold' : 'btn--ink'}`}
                  style={{ padding: '6px 14px', fontSize: '13px', textTransform: 'capitalize' }}
                >
                  {f === 'all' ? `All (${donationCounts.all})` : `${f} (${donationCounts[f]})`}
                </button>
              ))}
            </div>

            <button
              onClick={handleDownloadCsv}
              className="btn btn--pearl"
              style={{ padding: '8px 18px', fontSize: '13px', fontWeight: 600 }}
            >
              📥 Download CSV
            </button>
          </div>

          {/* Donations Table */}
          <div className="card" style={{ padding: '0', overflowX: 'auto', marginBottom: '24px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.04)', borderBottom: '1px solid var(--hairline-gold)' }}>
                  <th style={{ padding: '14px 18px', color: 'var(--gold)' }}>Date</th>
                  <th style={{ padding: '14px 18px', color: 'var(--gold)' }}>Ref ID</th>
                  <th style={{ padding: '14px 18px', color: 'var(--gold)' }}>Donor Name</th>
                  <th style={{ padding: '14px 18px', color: 'var(--gold)' }}>Phone / Email</th>
                  <th style={{ padding: '14px 18px', color: 'var(--gold)' }}>Amount</th>
                  <th style={{ padding: '14px 18px', color: 'var(--gold)' }}>Seva Type</th>
                  <th style={{ padding: '14px 18px', color: 'var(--gold)' }}>Txn / UTR ID</th>
                  <th style={{ padding: '14px 18px', color: 'var(--gold)' }}>Status</th>
                  <th style={{ padding: '14px 18px', color: 'var(--gold)', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {loadingDonations ? (
                  <tr>
                    <td colSpan={9} style={{ padding: '36px', textAlign: 'center', color: 'var(--ink-soft)' }}>
                      Loading donation records...
                    </td>
                  </tr>
                ) : donations.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ padding: '36px', textAlign: 'center', color: 'var(--ink-soft)' }}>
                      No donations found for this filter.
                    </td>
                  </tr>
                ) : (
                  donations.map((d: any) => (
                    <tr
                      key={d._id}
                      onClick={() => openDonationModal(d)}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <td style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>
                        {new Date(d.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </td>
                      <td style={{ padding: '14px 18px', fontFamily: 'monospace', fontWeight: 700, color: '#fff' }}>
                        {d.referenceId}
                      </td>
                      <td style={{ padding: '14px 18px', fontWeight: 600 }}>{d.donorName}</td>
                      <td style={{ padding: '14px 18px', color: 'var(--ink-soft)' }}>
                        <div>{d.donorPhone}</div>
                        {d.donorEmail && <small style={{ color: 'var(--ink-faint)' }}>{d.donorEmail}</small>}
                      </td>
                      <td style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--gold-bright)' }}>
                        ₹{d.amount?.toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '14px 18px' }}>{d.type}</td>
                      <td style={{ padding: '14px 18px', fontFamily: 'monospace', fontSize: '12.5px', color: 'var(--ink-soft)' }}>
                        {d.transactionId}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        {d.status === 'pending' && (
                          <span style={{ color: '#fbbf24', background: 'rgba(245, 158, 11, 0.15)', padding: '3px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 700 }}>
                            Pending
                          </span>
                        )}
                        {d.status === 'verified' && (
                          <span style={{ color: '#34d399', background: 'rgba(16, 185, 129, 0.15)', padding: '3px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 700 }}>
                            Verified
                          </span>
                        )}
                        {d.status === 'rejected' && (
                          <span style={{ color: '#f87171', background: 'rgba(239, 68, 68, 0.15)', padding: '3px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 700 }}>
                            Rejected
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            openDonationModal(d);
                          }}
                          className="btn btn--ink"
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                        >
                          👁️ Review Proof
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '14px', marginTop: '16px' }}>
              <button
                disabled={donationPage <= 1}
                onClick={() => handlePageChange(donationPage - 1)}
                className="btn btn--ink"
                style={{ padding: '8px 16px', fontSize: '13px' }}
              >
                Previous
              </button>
              <span style={{ color: 'var(--ink-soft)', fontSize: '13.5px' }}>
                Page <strong>{donationPage}</strong> of <strong>{totalPages}</strong> ({donationTotal} total)
              </span>
              <button
                disabled={donationPage >= totalPages}
                onClick={() => handlePageChange(donationPage + 1)}
                className="btn btn--ink"
                style={{ padding: '8px 16px', fontSize: '13px' }}
              >
                Next
              </button>
            </div>
          )}

          {/* Screenshot Review & Verification Modal */}
          {selectedDonation && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 1100,
                backgroundColor: 'rgba(5, 12, 22, 0.88)',
                backdropFilter: 'blur(6px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
                overflowY: 'auto',
              }}
              onClick={e => {
                if (e.target === e.currentTarget && !modalActionLoading) closeDonationModal();
              }}
            >
              <div
                className="card"
                style={{
                  width: '100%',
                  maxWidth: '680px',
                  maxHeight: '94vh',
                  overflowY: 'auto',
                  padding: '30px',
                  position: 'relative',
                  border: '1.5px solid var(--gold)',
                  boxShadow: '0 24px 60px rgba(0, 0, 0, 0.7)',
                  background: 'linear-gradient(135deg, rgba(20, 32, 48, 0.99) 0%, rgba(10, 18, 28, 0.99) 100%)',
                  borderRadius: '12px',
                }}
              >
                {/* Modal Close */}
                <button
                  onClick={closeDonationModal}
                  style={{
                    position: 'absolute',
                    top: '18px',
                    right: '18px',
                    background: 'none',
                    border: 'none',
                    color: 'var(--ink-soft)',
                    cursor: 'pointer',
                    padding: '6px',
                  }}
                  aria-label="Close"
                >
                  <XIcon size={20} />
                </button>

                {/* Header Info */}
                <div style={{ marginBottom: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <LotusIcon size={20} />
                    <span className="eyebrow" style={{ margin: 0 }}>
                      DONATION VERIFICATION REVIEW
                    </span>
                  </div>
                  <h2 style={{ fontSize: '22px', margin: '4px 0 2px', color: '#fff' }}>
                    {selectedDonation.referenceId} — ₹{selectedDonation.amount?.toLocaleString('en-IN')}
                  </h2>
                  <p style={{ margin: 0, color: 'var(--ink-soft)', fontSize: '13.5px' }}>
                    Donor: <strong>{selectedDonation.donorName}</strong> · Phone: {selectedDonation.donorPhone} · Seva:{' '}
                    {selectedDonation.type}
                  </p>
                </div>

                {/* Key Transaction Metadata */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '10px',
                    background: 'rgba(0,0,0,0.3)',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid var(--hairline-gold)',
                    fontSize: '13px',
                    marginBottom: '20px',
                  }}
                >
                  <div>
                    <span style={{ color: 'var(--ink-muted)', display: 'block', fontSize: '11px' }}>TRANSACTION ID</span>
                    <code style={{ color: 'var(--gold-bright)', fontSize: '13px' }}>{selectedDonation.transactionId}</code>
                  </div>
                  <div>
                    <span style={{ color: 'var(--ink-muted)', display: 'block', fontSize: '11px' }}>CURRENT STATUS</span>
                    <strong style={{ textTransform: 'capitalize', color: selectedDonation.status === 'verified' ? '#34d399' : selectedDonation.status === 'rejected' ? '#f87171' : '#fbbf24' }}>
                      {selectedDonation.status}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--ink-muted)', display: 'block', fontSize: '11px' }}>DATE SUBMITTED</span>
                    <span>{new Date(selectedDonation.createdAt).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Screenshot Display Section */}
                <div style={{ marginBottom: '22px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink-soft)', marginBottom: '8px' }}>
                    Payment Screenshot Proof
                  </label>

                  {!selectedDonation.hasScreenshot ? (
                    <div
                      style={{
                        padding: '32px',
                        textAlign: 'center',
                        background: 'rgba(239, 68, 68, 0.08)',
                        border: '1px dashed rgba(239, 68, 68, 0.4)',
                        borderRadius: '8px',
                        color: '#f87171',
                        fontSize: '14px',
                      }}
                    >
                      🚫 Screenshot deleted (retention period elapsed or manually purged)
                    </div>
                  ) : loadingScreenshot ? (
                    <div style={{ padding: '36px', textAlign: 'center', color: 'var(--ink-soft)', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                      Fetching encrypted payment proof image...
                    </div>
                  ) : screenshotBlobUrl ? (
                    <div style={{ textAlign: 'center' }}>
                      <div
                        style={{
                          background: '#0a1018',
                          borderRadius: '8px',
                          border: '1px solid var(--hairline-gold)',
                          padding: '8px',
                          display: 'inline-block',
                          maxWidth: '100%',
                        }}
                      >
                        <img
                          src={screenshotBlobUrl}
                          alt="Donation Proof"
                          style={{
                            maxHeight: '360px',
                            maxWidth: '100%',
                            objectFit: 'contain',
                            borderRadius: '4px',
                            display: 'block',
                            margin: '0 auto',
                          }}
                        />
                      </div>

                      {/* Expiration date notice if set */}
                      {selectedDonation.screenshotExpiresAt && (
                        <p style={{ fontSize: '12px', color: 'var(--gold)', marginTop: '8px', marginBottom: '4px' }}>
                          ⏳ Screenshot will be automatically deleted on{' '}
                          <strong>
                            {new Date(selectedDonation.screenshotExpiresAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </strong>
                        </p>
                      )}

                      {/* Manual delete button for verified/rejected donations */}
                      {selectedDonation.status !== 'pending' && selectedDonation.hasScreenshot && (
                        <div style={{ marginTop: '10px' }}>
                          <button
                            type="button"
                            onClick={handleDeleteScreenshotNow}
                            disabled={modalActionLoading}
                            style={{
                              background: 'rgba(239, 68, 68, 0.15)',
                              border: '1px solid #ef4444',
                              color: '#f87171',
                              padding: '5px 12px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              cursor: 'pointer',
                              fontWeight: 600,
                            }}
                          >
                            🗑️ Delete screenshot now
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ padding: '24px', textAlign: 'center', color: '#f87171' }}>
                      {screenshotError || 'Screenshot deleted'}
                    </div>
                  )}
                </div>

                {modalMessage && (
                  <div style={{ padding: '12px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#34d399', fontSize: '13.5px', marginBottom: '16px', textAlign: 'center' }}>
                    {modalMessage}
                  </div>
                )}

                {/* Immediate Delete Checkbox */}
                <div style={{ marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--ink-soft)' }}>
                  <input
                    type="checkbox"
                    id="del-immediate"
                    checked={verifyDeleteScreenshot}
                    onChange={e => setVerifyDeleteScreenshot(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--gold)' }}
                  />
                  <label htmlFor="del-immediate" style={{ cursor: 'pointer' }}>
                    Delete screenshot immediately upon verification/rejection
                  </label>
                </div>

                {/* Rejection Reason Input (Visible if rejecting or already rejected) */}
                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--ink-soft)', marginBottom: '4px' }}>
                    Rejection Reason (Required if rejecting):
                  </label>
                  <input
                    type="text"
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    placeholder="e.g. Transaction ID not found in bank statement / Invalid amount"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--hairline-gold)',
                      color: '#fff',
                      fontSize: '13.5px',
                    }}
                  />
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    disabled={modalActionLoading}
                    onClick={handleVerifyDonation}
                    className="btn btn--pearl"
                    style={{
                      flex: 1,
                      justifyContent: 'center',
                      background: '#10b981',
                      borderColor: '#10b981',
                      color: '#fff',
                      fontWeight: 700,
                    }}
                  >
                    ✓ Verify Donation
                  </button>

                  <button
                    type="button"
                    disabled={modalActionLoading}
                    onClick={handleRejectDonation}
                    className="btn btn--ink"
                    style={{
                      flex: 1,
                      justifyContent: 'center',
                      background: 'rgba(239, 68, 68, 0.2)',
                      borderColor: '#ef4444',
                      color: '#f87171',
                      fontWeight: 700,
                    }}
                  >
                    ✕ Reject (with reason)
                  </button>

                  <button
                    type="button"
                    disabled={modalActionLoading}
                    onClick={closeDonationModal}
                    className="btn btn--ink"
                    style={{ padding: '10px 18px' }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 2: GALLERY PHOTOS CONSOLE
          ========================================================================= */}
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

              <ImageUploader
                value={photoUrl}
                onChange={setPhotoUrl}
                label="Darshan Gallery Photo"
              />

              <label>
                Photo Caption / Devotional Note
                <textarea
                  rows={2}
                  placeholder="Brief description of the darshan..."
                  value={photoDesc}
                  onChange={e => setPhotoDesc(e.target.value)}
                />
              </label>

              {photoSuccess && (
                <div style={{ color: 'var(--gold-bright)', fontSize: '14px', fontWeight: 600, padding: '8px 12px', background: 'rgba(212,175,55,0.15)', borderRadius: '6px' }}>
                  {photoSuccess}
                </div>
              )}

              <button type="submit" className="btn btn--gold" style={{ justifyContent: 'center', padding: '14px', fontWeight: 700 }}>
                <PlusIcon size={18} />
                <span>Publish to Public Darshan Gallery</span>
              </button>
            </form>
          </div>

          <div>
            <h3 style={{ fontSize: '22px', marginBottom: '6px' }}>Published Photos in Gallery ({gallery.length})</h3>
            <p style={{ color: 'var(--ink-faint)', fontSize: '14px', marginBottom: '20px' }}>
              These images are visible to all devotees on the Darshan Gallery page.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
              {gallery.map(p => (
                <div key={p._id} className="card" style={{ padding: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ height: '130px', borderRadius: '8px', backgroundImage: `url(${p.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', marginBottom: '10px' }} />
                    <span className="eyebrow" style={{ fontSize: '10px' }}>{p.category}</span>
                    <h4 style={{ fontSize: '15px', margin: '4px 0 6px', color: 'var(--ink)' }}>{p.title}</h4>
                  </div>
                  <button onClick={() => handleDeletePhoto(p._id, p.title)} className="btn btn--ink" style={{ padding: '6px 10px', fontSize: '12px', marginTop: '10px', color: '#f87171', justifyContent: 'center' }}>
                    <TrashIcon size={14} />
                    <span>Delete Photo</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: FESTIVALS & EVENTS CONSOLE
          ========================================================================= */}
      {activeTab === 'events' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '32px' }}>
          <div className="card" style={{ padding: '34px', border: '2px solid var(--gold)', boxShadow: '0 0 24px rgba(212, 175, 55, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{ fontSize: '24px' }}>🪔</span>
              <h3 style={{ margin: 0, fontSize: '22px', color: 'var(--ink)' }}>Add Upcoming Festival / Event</h3>
            </div>
            <p style={{ fontSize: '13.5px', color: 'var(--ink-faint)', marginBottom: '22px' }}>
              Publishing will update the navbar notification bell, popup alerts, and public calendar.
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

              <label>
                Location in Kopargaon
                <input
                  placeholder="Tahsil Maidan / Temple Altar"
                  value={eventLocation}
                  onChange={e => setEventLocation(e.target.value)}
                />
              </label>

              <label>
                Category
                <select value={eventCategory} onChange={e => setEventCategory(e.target.value)}>
                  <option>Grand Annual Festival</option>
                  <option>Major Appearance Day</option>
                  <option>Vaishnava Celebration</option>
                  <option>Special Satsang & Kirtan</option>
                </select>
              </label>

              <ImageUploader
                value={eventImage}
                onChange={setEventImage}
                label="Festival Banner Image"
              />

              <label>
                Description & Schedule of Sevas
                <textarea
                  rows={3}
                  placeholder="Details of Abhishek, lecture, feast..."
                  value={eventDesc}
                  onChange={e => setEventDesc(e.target.value)}
                />
              </label>

              {eventSuccess && (
                <div style={{ color: 'var(--gold-bright)', fontSize: '14px', fontWeight: 600, padding: '8px 12px', background: 'rgba(212,175,55,0.15)', borderRadius: '6px' }}>
                  {eventSuccess}
                </div>
              )}

              <button type="submit" className="btn btn--gold" style={{ justifyContent: 'center', padding: '14px', fontWeight: 700 }}>
                <PlusIcon size={18} />
                <span>Publish Festival & Activate Alerts</span>
              </button>
            </form>
          </div>

          <div>
            <h3 style={{ fontSize: '22px', marginBottom: '6px' }}>Active Festivals ({events.length})</h3>
            <p style={{ color: 'var(--ink-faint)', fontSize: '14px', marginBottom: '20px' }}>
              These events drive the live countdown bell notification and upcoming schedule.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {events.map(e => (
                <div key={e._id} className="card" style={{ padding: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span className="eyebrow" style={{ fontSize: '11px' }}>{e.category}</span>
                    <h4 style={{ fontSize: '17px', margin: '2px 0 4px', color: 'var(--ink)' }}>{e.name}</h4>
                    <p style={{ fontSize: '13px', color: 'var(--gold)', margin: 0 }}>
                      📅 {new Date(e.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · 🕒 {e.time || 'All Day'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleStartEditEvent(e)} className="btn btn--gold" style={{ padding: '8px 12px', fontSize: '13px' }}>
                      <span>✏️</span>
                      <span>Edit</span>
                    </button>
                    <button onClick={() => handleDeleteEvent(e._id, e.name)} className="btn btn--ink" style={{ padding: '8px 12px', color: '#f87171' }}>
                      <TrashIcon size={16} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Edit Event Modal in Dashboard */}
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

                <form onSubmit={handleEditEventSubmit} style={{ display: 'grid', gap: '14px' }}>
                  <label>
                    Festival Name *
                    <input
                      required
                      placeholder="e.g. Sri Krishna Janmashtami"
                      value={editEventName}
                      onChange={e => setEditEventName(e.target.value)}
                    />
                  </label>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <label>
                      Date *
                      <input
                        required
                        type="date"
                        value={editEventDate}
                        onChange={e => setEditEventDate(e.target.value)}
                      />
                    </label>
                    <label>
                      Timing
                      <input
                        placeholder="05:00 PM Onwards"
                        value={editEventTime}
                        onChange={e => setEditEventTime(e.target.value)}
                      />
                    </label>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <label>
                      Category
                      <select value={editEventCategory} onChange={e => setEditEventCategory(e.target.value)}>
                        <option>Grand Annual Festival</option>
                        <option>Major Appearance Day</option>
                        <option>Vaishnava Celebration</option>
                        <option>Special Satsang & Kirtan</option>
                      </select>
                    </label>

                    <label>
                      Location / Venue
                      <input
                        value={editEventLocation}
                        onChange={e => setEditEventLocation(e.target.value)}
                      />
                    </label>
                  </div>

                  <ImageUploader
                    value={editEventImage}
                    onChange={setEditEventImage}
                    label="Festival Banner Image"
                  />

                  <label>
                    Festival Description & Schedule *
                    <textarea
                      rows={3}
                      required
                      placeholder="Details regarding Abhishek, Chanting, Discourse, and Mahaprasadam Feast..."
                      value={editEventDesc}
                      onChange={e => setEditEventDesc(e.target.value)}
                    />
                  </label>

                  <button className="btn btn--gold" style={{ width: '100%', padding: '12px', fontWeight: 700 }}>
                    💾 Save Festival Changes
                  </button>

                  {editEventSuccess && <p className="success">{editEventSuccess}</p>}
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 4: INQUIRIES CONSOLE
          ========================================================================= */}
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
