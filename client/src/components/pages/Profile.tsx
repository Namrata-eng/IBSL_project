import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageBanner from '../PageBanner';
import { TilakMark, HeartIcon, CalendarIcon, LotusIcon, PeacockFeatherIcon } from '../icons';

export function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [japaCount, setJapaCount] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem('userData');
    if (!stored) {
      navigate('/login');
      return;
    }
    const parsed = JSON.parse(stored);
    setUser(parsed);
    const savedJapa = localStorage.getItem(`japa_${parsed.email}`) || '0';
    setJapaCount(Number(savedJapa));
  }, [navigate]);

  const incrementJapa = () => {
    if (!user) return;
    const next = japaCount + 1;
    setJapaCount(next);
    localStorage.setItem(`japa_${user.email}`, String(next));
  };

  const resetJapa = () => {
    if (!user) return;
    setJapaCount(0);
    localStorage.setItem(`japa_${user.email}`, '0');
  };

  const handleSignOut = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('userData');
    navigate('/');
  };

  if (!user) return null;

  return (
    <main className="page">
      <PageBanner
        lead="DEVOTEE PORTAL"
        title={`Hare Krishna, ${user.name}`}
        subtitle="Welcome to your personal spiritual dashboard at ISKCON Kopargaon."
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px', maxWidth: '1000px', margin: '0 auto' }}>
        {/* Profile Card */}
        <div className="card" style={{ padding: '34px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, #fbbf24, #d97706)', color: '#1c0e02', fontSize: '26px', fontWeight: 600, display: 'grid', placeItems: 'center', boxShadow: '0 0 20px var(--gold-glow)' }}>
              {user.name?.[0] || 'D'}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '22px' }}>{user.name}</h3>
              <p style={{ margin: '2px 0 0', color: 'var(--gold)', fontSize: '14px' }}>{user.role === 'admin' ? 'Temple Administrator' : 'Devotee / Sadhaka'}</p>
            </div>
          </div>

          <div style={{ display: 'grid', gap: '12px', fontSize: '14.5px', color: 'var(--ink-soft)', borderTop: '1px solid var(--hairline-gold)', paddingTop: '18px' }}>
            <div><strong>Email:</strong> {user.email}</div>
            {user.phone && <div><strong>Mobile:</strong> {user.phone}</div>}
            <div><strong>Spiritual Focus:</strong> {user.spiritualInterest}</div>
          </div>

          <div style={{ marginTop: '28px', display: 'flex', gap: '12px' }}>
            {user.role === 'admin' && (
              <Link className="btn btn--gold" to="/admin" style={{ flex: 1 }}>
                Admin Portal
              </Link>
            )}
            <button className="btn btn--ink" onClick={handleSignOut} style={{ flex: 1 }}>
              Sign Out
            </button>
          </div>
        </div>

        {/* Daily Japa Counter */}
        <div className="card" style={{ padding: '34px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'radial-gradient(circle at 50% 0%, rgba(245, 176, 65, 0.15), rgba(14, 28, 44, 0.85))' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '4px' }}>
              <LotusIcon size={20} />
              <span className="eyebrow" style={{ margin: 0 }}>DAILY SADHANA</span>
            </div>
            <h3 style={{ fontSize: '20px', marginBottom: '6px' }}>Maha-Mantra Japa Counter</h3>
            <p style={{ fontSize: '13px', color: 'var(--ink-faint)', margin: '0 0 20px', lineHeight: 1.5 }}>
              "Hare Krishna Hare Krishna, Krishna Krishna Hare Hare · Hare Rama Hare Rama, Rama Rama Hare Hare"
            </p>

            <div style={{ fontSize: '56px', fontWeight: 600, color: 'var(--gold)', lineHeight: 1, margin: '16px 0', textShadow: '0 0 24px var(--gold-glow)' }}>
              {japaCount} <span style={{ fontSize: '18px', color: 'var(--ink-soft)' }}>/ 16 rounds</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
            <button className="btn btn--pearl" onClick={incrementJapa} style={{ flex: 2 }}>
              + Complete 1 Round (108 Beads)
            </button>
            <button className="btn btn--ink" onClick={resetJapa} style={{ flex: 1 }}>
              Reset
            </button>
          </div>
        </div>

        {/* Quick Devotional Links */}
        <div className="card" style={{ gridColumn: '1 / -1', padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <PeacockFeatherIcon size={20} />
            <span className="eyebrow" style={{ margin: 0 }}>QUICK TEMPLE ACTIONS</span>
          </div>
          <h3 style={{ fontSize: '20px', marginBottom: '18px' }}>Explore Temple Offerings & Activities</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
            <Link to="/timings" className="btn btn--ink" style={{ justifyContent: 'flex-start', padding: '14px' }}>
              <span>Daily Darshan & Aarti</span>
            </Link>
            <Link to="/annadaan" className="btn btn--ink" style={{ justifyContent: 'flex-start', padding: '14px' }}>
              <span>Annadaan Seva (Sadhu Bhojan)</span>
            </Link>
            <Link to="/gaushala" className="btn btn--ink" style={{ justifyContent: 'flex-start', padding: '14px' }}>
              <span>Gaushala Cow Seva</span>
            </Link>
            <Link to="/events" className="btn btn--ink" style={{ justifyContent: 'flex-start', padding: '14px' }}>
              <span>Rathayatra & Festivals</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Profile;
