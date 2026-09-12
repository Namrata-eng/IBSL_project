import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageBanner from '../PageBanner';
import { TilakMark, LotusIcon } from '../icons';

export function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [spiritualInterest, setSpiritualInterest] = useState('Bhagavad Gita Classes');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const r = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone, spiritualInterest }),
      });

      const d = await r.json();
      if (!r.ok) {
        setError(d.message || 'Unable to register. Please try again.');
        setLoading(false);
        return;
      }

      // Save token and user details
      localStorage.setItem('userToken', d.token);
      localStorage.setItem('userData', JSON.stringify(d.user));
      navigate('/profile');
    } catch {
      setError('Network connection error. Please ensure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page">
      <PageBanner
        lead="JOIN OUR SANGHA"
        title="Devotee Registration"
        subtitle="Connect with ISKCON Kopargaon, enroll in Gita study circles, receive festival updates, and volunteer for sacred seva."
      />

      <form className="form" onSubmit={handleSubmit}>
        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          <TilakMark size={36} />
        </div>

        <label>
          Full Name
          <input
            required
            placeholder="e.g. Radheshyam Sharma"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </label>

        <label>
          Email Address
          <input
            required
            type="email"
            placeholder="devotee@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </label>

        <label>
          Mobile Number (for WhatsApp Updates)
          <input
            placeholder="+91 98765 43210"
            value={phone}
            onChange={e => setPhone(e.target.value)}
          />
        </label>

        <label>
          Primary Spiritual Focus
          <select
            value={spiritualInterest}
            onChange={e => setSpiritualInterest(e.target.value)}
          >
            <option>Bhagavad Gita Classes</option>
            <option>Youth Forum (IYF)</option>
            <option>Annadaan Seva</option>
            <option>Gaushala Seva</option>
            <option>Harinam Sankirtan</option>
            <option>General Devotee</option>
          </select>
        </label>

        <label>
          Create Password (min. 6 characters)
          <input
            required
            type="password"
            minLength={6}
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </label>

        <button className="btn btn--pearl" disabled={loading} style={{ marginTop: '8px' }}>
          {loading ? 'Creating Devotee Account…' : 'Register Devotee Account'}
        </button>

        {error && <p className="error">{error}</p>}

        <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px', color: 'var(--ink-soft)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--gold)', fontWeight: 600 }}>
            Sign In Here
          </Link>
        </div>
      </form>
    </main>
  );
}

export default Signup;
