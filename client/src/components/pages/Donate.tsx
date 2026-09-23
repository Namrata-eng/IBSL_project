import React, { useState } from 'react';
import PageBanner from '../PageBanner';
import { HeartIcon, TilakMark, LotusIcon } from '../icons';

// ── Razorpay payment link – replace with your actual Razorpay payment link ──
// Get your link from: https://dashboard.razorpay.com → Payment Links
const RAZORPAY_LINK = 'https://pages.razorpay.com/WWo5n2F8kQuickDonate'; // Replace with actual link

function openRazorpay(amount?: string) {
  // If you have amount-specific links, map them here
  // Otherwise the main Razorpay link opens where user can enter amount
  const link = RAZORPAY_LINK;
  if (amount) {
    // Opens Razorpay with pre-filled amount (supported in payment pages)
    window.open(`${link}?amount=${parseInt(amount) * 100}`, '_blank', 'noopener');
  } else {
    window.open(link, '_blank', 'noopener');
  }
}

export function Donate() {
  const [category, setCategory] = useState('Annadaan / Sadhu Bhojan Seva');
  const [amount, setAmount] = useState('1100');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [pan, setPan] = useState('');

  const presetAmounts = ['501', '1100', '2500', '5100', '11000', '21000'];

  const categories = [
    'Annadaan / Sadhu Bhojan Seva',
    'Gift a Gita / Bhagavad Gita Daan',
    'Gaushala / Sacred Cow Care',
    'Sri Sri Radha Krishna Deity & Flower Seva',
    'Temple Construction & Development Fund',
    'Grand Festival Seva (Janmashtami / Rathayatra)',
  ];

  // Quick Seva Cards with direct Razorpay amounts
  const quickSevaCards = [
    {
      emoji: '🍛',
      title: 'Feed 10 Devotees',
      amount: '501',
      desc: 'Sponsor a day\'s prasadam for 10 pilgrims',
      color: '#f59e0b',
    },
    {
      emoji: '📖',
      title: 'Gift a Bhagavad Gita',
      amount: '250',
      desc: 'Spread spiritual knowledge with a Gita gift',
      color: '#38bdf8',
    },
    {
      emoji: '🐄',
      title: 'One Day Gau Seva',
      amount: '501',
      desc: 'Feed and care for sacred cows for one day',
      color: '#34d399',
    },
    {
      emoji: '🌸',
      title: 'Deity Flower Seva',
      amount: '1100',
      desc: 'Beautiful fresh flowers for Sri Radha Krishna',
      color: '#f472b6',
    },
    {
      emoji: '🏛️',
      title: 'Temple Lamp (Deep Seva)',
      amount: '251',
      desc: 'Keep the eternal divine flame burning',
      color: '#fbbf24',
    },
    {
      emoji: '👑',
      title: 'Festival Sponsor',
      amount: '5100',
      desc: 'Sponsor a grand Vaishnava festival celebration',
      color: '#a78bfa',
    },
  ];

  return (
    <main className="page donation">
      <PageBanner
        lead="SEVA & DEVOTIONAL SUPPORT"
        title="Offer Your Heartfelt Seva"
        subtitle="Whatever you do, whatever you offer or give away, do that as an offering unto Lord Krishna. Every contribution transforms lives."
      />

      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        {/* ── Quick Seva Cards ── */}
        <section style={{ marginBottom: '48px' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <span className="eyebrow">QUICK SEVA OFFERINGS</span>
            <h2 style={{ fontSize: '26px', margin: '8px 0 4px' }}>Instant Secure Donation via Razorpay</h2>
            <p style={{ color: 'var(--ink-soft)', fontSize: '14px' }}>Pay securely with UPI, Net Banking, Card, or Wallets</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px' }}>
            {quickSevaCards.map((seva, idx) => (
              <div
                key={idx}
                className="card"
                style={{
                  padding: '24px',
                  borderTop: `3px solid ${seva.color}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  transition: 'transform 0.2s',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-4px)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                <div style={{ fontSize: '32px' }}>{seva.emoji}</div>
                <div>
                  <h3 style={{ fontSize: '17px', margin: '0 0 4px', color: 'var(--ink)' }}>{seva.title}</h3>
                  <p style={{ fontSize: '12.5px', color: 'var(--ink-soft)', margin: 0, lineHeight: 1.5 }}>{seva.desc}</p>
                </div>
                <div style={{ fontSize: '26px', fontWeight: 700, color: seva.color }}>
                  ₹{parseInt(seva.amount).toLocaleString('en-IN')}
                </div>
                <button
                  onClick={() => openRazorpay(seva.amount)}
                  className="btn btn--pearl"
                  style={{ width: '100%', fontSize: '13.5px', padding: '10px' }}
                >
                  🙏 Donate ₹{parseInt(seva.amount).toLocaleString('en-IN')} Now
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ── Custom Amount Form ── */}
        <div className="card" style={{ padding: '36px', marginBottom: '36px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
            <LotusIcon size={22} />
            <span className="eyebrow" style={{ margin: 0 }}>CUSTOM SEVA OFFERING</span>
          </div>

          <div style={{ display: 'grid', gap: '16px' }}>
            <label>
              Select Seva / Campaign
              <select value={category} onChange={e => setCategory(e.target.value)}>
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </label>

            <div>
              <label style={{ marginBottom: '8px' }}>Select Offering Amount (₹)</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '12px' }}>
                {presetAmounts.map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setAmount(p)}
                    className={`btn ${amount === p ? 'btn--pearl' : 'btn--ink'}`}
                    style={{ padding: '10px 8px', fontSize: '14.5px' }}
                  >
                    ₹{p}
                  </button>
                ))}
              </div>
              <input
                type="number"
                min="10"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="Enter custom amount"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <label>
                Your Name
                <input placeholder="Devotee name" value={name} onChange={e => setName(e.target.value)} />
              </label>
              <label>
                Mobile Number
                <input placeholder="+91 98765 43210" value={phone} onChange={e => setPhone(e.target.value)} />
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <label>
                Email for Tax Receipt
                <input type="email" placeholder="name@example.com" value={email} onChange={e => setEmail(e.target.value)} />
              </label>
              <label>
                PAN Number (for 80G Exemption)
                <input placeholder="ABCDE1234F" value={pan} onChange={e => setPan(e.target.value.toUpperCase())} />
              </label>
            </div>

            {/* Razorpay Donate Button */}
            <button
              className="btn btn--pearl"
              onClick={() => openRazorpay(amount)}
              style={{ padding: '14px', fontSize: '16px', fontWeight: 700, letterSpacing: '0.5px' }}
            >
              🙏 Proceed to Secure Donation — ₹{parseInt(amount || '0').toLocaleString('en-IN')} via Razorpay
            </button>

            <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--ink-muted)', margin: '-4px 0 0' }}>
              Secured by Razorpay · UPI / Card / Net Banking / Wallets accepted
            </p>

            <div style={{ textAlign: 'center', fontSize: '12.5px', color: 'var(--ink-muted)', lineHeight: 1.6 }}>
              All donations to ISKCON Kopargaon are eligible for tax exemption under Section 80G of the Income Tax Act.
            </div>
          </div>
        </div>

        {/* ── Direct Bank Transfer ── */}
        <div className="card" style={{ padding: '30px', background: 'radial-gradient(circle at 50% 0%, rgba(212,175,55,0.12), rgba(14,28,44,0.95))' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <TilakMark size={20} />
            <b style={{ color: 'var(--gold)', fontSize: '16px' }}>Direct UPI & Bank Transfer</b>
          </div>
          <div style={{ fontSize: '14px', color: 'var(--ink-soft)', lineHeight: 2, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '8px' }}>
            <div><strong>Beneficiary:</strong> ISKCON Kopargaon</div>
            <div><strong>UPI ID:</strong> <code style={{ color: 'var(--gold)', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: '4px' }}>iskconkopargaon@sbi</code></div>
            <div><strong>Account No:</strong> 39828602100</div>
            <div><strong>IFSC Code:</strong> SBIN0000412</div>
            <div><strong>Bank:</strong> State Bank of India, Kopargaon</div>
            <div><strong>Temple Helpdesk:</strong> +91 90828 60210</div>
          </div>
        </div>

      </div>
    </main>
  );
}

export default Donate;
