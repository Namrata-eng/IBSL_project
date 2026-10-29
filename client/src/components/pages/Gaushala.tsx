import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PageBanner from '../PageBanner';
import { HeartIcon, PeacockFeatherIcon } from '../icons';
import DonationForm from '../DonationForm';

// ── Razorpay payment link for Gaushala ──
const GAUSHALA_RAZORPAY_LINK = 'https://pages.razorpay.com/WWo5n2F8kQuickDonate';

export function Gaushala() {
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number | string>(501);

  const sevaOptions = [
    { title: '1 Day Green Fodder Seva', amount: 501, desc: 'Fresh nutritious green grass and fodder for the cows.' },
    { title: '1 Month Jaggery & Nutrition Diet', amount: 2100, desc: 'Special protein and jaggery mix for cows and newborn calves.' },
    { title: 'Adopt a Cow for 1 Month', amount: 5000, desc: 'Complete shelter, veterinary care, feeding, and loving service for one cow.' },
    { title: 'Adopt a Cow for 1 Year (Gau Palan)', amount: 51000, desc: 'Annual sponsorship ensuring comprehensive lifelong care and protection.' },
  ];

  const gauStats = [
    { label: 'Sacred Cows Protected', value: '40+', emoji: '🐄' },
    { label: 'Years of Seva', value: '12+', emoji: '🌿' },
    { label: 'Daily Devotees Visiting', value: '500+', emoji: '🙏' },
    { label: 'Families Supported', value: '200+', emoji: '❤️' },
  ];

  const donateToGaushala = (amount: number) => {
    window.open(`${GAUSHALA_RAZORPAY_LINK}?amount=${amount * 100}`, '_blank', 'noopener');
    setSelectedAmount(amount);
    setShowVerifyModal(true);
  };

  return (
    <main className="page">
      <PageBanner
        lead="MOTHER SURABHI SEVA"
        title="Gaushala & Sacred Cow Protection"
        subtitle="Protecting and serving indigenous Desi cows with love, natural shelter, and nutritious fodder in Kopargaon."
      />

      {/* Verification submission prompt */}
      <div
        className="card"
        style={{
          maxWidth: '1000px',
          margin: '0 auto 36px',
          padding: '16px 24px',
          background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.15) 0%, rgba(12, 25, 40, 0.95) 100%)',
          border: '1.5px solid #38bdf8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '24px' }}>🐄</span>
          <div>
            <strong style={{ color: '#38bdf8', fontSize: '15px' }}>
              Already Made a Gau Seva Donation?
            </strong>
            <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--ink-soft)' }}>
              Submit your receipt screenshot and transaction ID for official verification within 24 hours.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setSelectedAmount(501);
            setShowVerifyModal(true);
          }}
          className="btn btn--peacock"
          style={{ padding: '9px 18px', fontSize: '13.5px', fontWeight: 700 }}
        >
          ✍️ I Have Paid — Submit Details
        </button>
      </div>

      {/* Intro card */}
      <div className="card" style={{ padding: '36px', maxWidth: '1000px', margin: '0 auto 36px', background: 'radial-gradient(circle at 10% 10%, rgba(2, 132, 199, 0.15), rgba(14, 28, 44, 0.8))' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <PeacockFeatherIcon size={24} />
            <span className="eyebrow" style={{ margin: 0 }}>COMPASSIONATE CARE</span>
          </div>
          <h2 style={{ fontSize: '26px', fontWeight: 400, color: 'var(--ink)' }}>
            Serving Indigenous Desi Cows with Devotion
          </h2>
          <p style={{ color: 'var(--ink-soft)', lineHeight: 1.85, fontSize: '15.5px', fontWeight: 300 }}>
            In Vedic culture, the cow is revered as our mother who nurtures humanity with life-giving milk and brings auspiciousness to the environment. The ISKCON Kopargaon Gaushala provides a serene sanctuary for aging, abandoned, and indigenous cows, ensuring they live in peace and dignity throughout their natural lives.
          </p>
        </div>
      </div>

      {/* Stats row */}
      <section style={{ maxWidth: '1000px', margin: '0 auto 48px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {gauStats.map((s, i) => (
            <div key={i} className="card" style={{ padding: '24px', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>{s.emoji}</div>
              <div style={{ fontSize: '32px', fontWeight: 700, color: '#38bdf8' }}>{s.value}</div>
              <div style={{ fontSize: '13px', color: 'var(--ink-soft)', marginTop: '4px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Seva Sponsorship Cards with Razorpay */}
      <section style={{ maxWidth: '1000px', margin: '0 auto 48px' }}>
        <span className="eyebrow" style={{ display: 'block', textAlign: 'center', marginBottom: '8px' }}>
          GAU SEVA SPONSORSHIP OPTIONS
        </span>
        <p style={{ textAlign: 'center', color: 'var(--ink-soft)', fontSize: '14px', marginBottom: '28px' }}>
          Pay securely via Razorpay · UPI / Card / Net Banking accepted
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '22px' }}>
          {sevaOptions.map((opt, idx) => (
            <div className="card" key={idx} style={{ padding: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderTop: '3px solid #38bdf8', transition: 'transform 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-4px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <div>
                <span className="eyebrow">GAU SEVA</span>
                <h3 style={{ fontSize: '19px', margin: '6px 0 10px' }}>{opt.title}</h3>
                <p style={{ fontSize: '13.5px', color: 'var(--ink-faint)', lineHeight: 1.65, marginBottom: '16px' }}>{opt.desc}</p>
              </div>

              <div>
                <div style={{ fontSize: '30px', color: '#38bdf8', fontWeight: 600, marginBottom: '16px' }}>
                  ₹{opt.amount.toLocaleString('en-IN')}
                </div>
                <button
                  onClick={() => donateToGaushala(opt.amount)}
                  className="btn btn--peacock"
                  style={{ width: '100%' }}
                >
                  🐄 Offer Gau Seva via Razorpay
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Visit card */}
      <div className="card" style={{ maxWidth: '1000px', margin: '0 auto 48px', padding: '36px', textAlign: 'center' }}>
        <HeartIcon size={40} />
        <h3 style={{ fontSize: '22px', margin: '14px 0 8px' }}>Visit the Gaushala in Kopargaon</h3>
        <p style={{ color: 'var(--ink-soft)', fontSize: '15px', maxWidth: '640px', margin: '0 auto 24px', lineHeight: 1.65 }}>
          Experience the peace of feeding the cows in person. Open daily from 08:00 AM to 06:00 PM for families and visitors.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/contact" className="btn btn--ink">
            Get Gaushala Directions
          </Link>
          <button
            onClick={() => donateToGaushala(501)}
            className="btn btn--peacock"
          >
            🐄 Sponsor Fodder Seva
          </button>
        </div>
      </div>

      <DonationForm
        isOpen={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
        initialAmount={selectedAmount}
        initialType="Gaushala Seva"
        title="Submit Gaushala Cow Seva Payment Proof"
      />
    </main>
  );
}

export default Gaushala;
