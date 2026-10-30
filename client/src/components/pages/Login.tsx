import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageBanner from '../PageBanner';
import { TilakMark } from '../icons';

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const performLogin = (token: string, userObj: any) => {
    const cleanToken = typeof token === 'string' ? token.replace(/^Bearer\s+/i, '').trim() : '';
    localStorage.setItem('userToken', cleanToken);
    localStorage.setItem('userData', JSON.stringify(userObj));
    if (userObj?.role === 'admin' || userObj?.email?.includes('admin')) {
      localStorage.setItem('adminToken', cleanToken);
    }
    window.dispatchEvent(new Event('storage'));
    navigate(userObj?.role === 'admin' ? '/admin' : '/');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const r = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const d = await r.json().catch(() => ({}));
      if (r.ok && d.token && typeof d.token === 'string') {
        performLogin(d.token, d.user);
        return;
      } else {
        setError(d.message || 'Invalid email or password.');
      }
    } catch {
      setError('Unable to reach server. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page">
      <PageBanner
        lead="HARE KRISHNA"
        title="Sign In"
        subtitle="Welcome back, devotee. Please sign in to continue."
      />

      <div style={{ maxWidth: '480px', margin: '0 auto' }}>
        <form className="form" onSubmit={handleSubmit}>
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <TilakMark size={40} />
            <h2 style={{ fontSize: '20px', margin: '10px 0 4px' }}>Devotee Sign In</h2>
            <p style={{ fontSize: '13px', color: 'var(--ink-soft)' }}>Enter your registered email and password</p>
          </div>

          <label>
            Email Address
            <input
              required
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </label>

          <label>
            Password
            <input
              required
              type="password"
              minLength={6}
              placeholder="Enter password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </label>

          <button className="btn btn--pearl" disabled={loading} style={{ marginTop: '8px' }}>
            {loading ? 'Signing in…' : '🙏 Sign In'}
          </button>

          {error && <p className="error">{error}</p>}

          <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px', color: 'var(--ink-soft)' }}>
            New to ISKCON Kopargaon?{' '}
            <Link to="/signup" style={{ color: 'var(--gold)', fontWeight: 600 }}>
              Create a Devotee Account
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}

export default Login;
