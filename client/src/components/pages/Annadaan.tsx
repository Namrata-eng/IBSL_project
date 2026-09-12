import React from 'react';
import PageBanner from '../PageBanner';
import { HeartIcon, LotusIcon } from '../icons';

const ANNADAAN_RAZORPAY = 'https://pages.razorpay.com/WWo5n2F8kQuickDonate'; // Replace with actual Razorpay link

export function Annadaan() {
  const mealTiers = [
    { title: 'Feed 21 Sadhus & Devotees', amount: 1100, desc: 'Full sanctified thali including rice, dal, subji, puri, and sweet.' },
    { title: 'Feed 51 Sadhus & Devotees', amount: 2500, desc: 'Wholesome nutritious satvik lunch for temple visitors and sadhus.' },
    { title: 'Feed 108 Sadhus (Full Day Bhojan)', amount: 5100, desc: 'Special Annadaan offering on birthdays, anniversaries, or in sacred memory.' },
    { title: 'Grand Festival Annadaan (500+ Meals)', amount: 21000, desc: 'Massive prasadam distribution during Janmashtami and Rathayatra.' },
  ];

  const pay = (amount: number) => {
    window.open(`${ANNADAAN_RAZORPAY}?amount=${amount * 100}`, '_blank');
  };

  return (
    <main className="page">
      <PageBanner
        lead="FOOD FOR SOULS"
        title="Annadaan & Sadhu Bhojan Seva"
        subtitle="No one within ten miles of a temple should go hungry. Experience the joy of feeding souls with pure Krishna Prasadam."
      />

      <div className="card" style={{ padding: '36px', maxWidth: '1000px', margin: '0 auto 48px', background: 'radial-gradient(circle at 10% 10%, rgba(245,176,65,0.15), rgba(14,28,44,0.8))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <LotusIcon size={24} />
          <span className="eyebrow" style={{ margin: 0 }}>SACRED NOURISHMENT</span>
        </div>
        <h2 style={{ fontSize: '26px', fontWeight: 400, color: 'var(--ink)' }}>
          Serving Pure Satvik Prasadam in Kopargaon & Rural Ahmednagar
        </h2>
        <p style={{ color: 'var(--ink-soft)', lineHeight: 1.85, fontSize: '15.5px', fontWeight: 300 }}>
          Every day, the temple kitchen prepares fresh, hygienic, and sanctified vegetarian meals offered with love to Lord Krishna before being served to sadhus, pilgrims visiting Shirdi and Kopargaon, and underprivileged families. Your contribution directly feeds souls with transcendental mercy.
        </p>
      </div>

      <section style={{ maxWidth: '1000px', margin: '0 auto 48px' }}>
        <span className="eyebrow" style={{ display: 'block', textAlign: 'center', marginBottom: '24px' }}>
          ANNADAAN SEVA SPONSORSHIP TIERS
        </span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '22px' }}>
          {mealTiers.map((tier, idx) => (
            <div
              className="card"
              key={idx}
              style={{ padding: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderTop: '3px solid var(--gold)', transition: 'transform 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-4px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <div>
                <span className="eyebrow">SEVA OFFERING</span>
                <h3 style={{ fontSize: '19px', margin: '6px 0 10px' }}>{tier.title}</h3>
                <p style={{ fontSize: '13.5px', color: 'var(--ink-faint)', lineHeight: 1.65, marginBottom: '16px' }}>{tier.desc}</p>
              </div>
              <div>
                <div style={{ fontSize: '30px', color: 'var(--gold)', fontWeight: 600, marginBottom: '16px' }}>
                  ₹{tier.amount.toLocaleString('en-IN')}
                </div>
                <button className="btn btn--pearl" style={{ width: '100%' }} onClick={() => pay(tier.amount)}>
                  🙏 Donate via Razorpay
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="card" style={{ maxWidth: '1000px', margin: '0 auto', padding: '36px', textAlign: 'center' }}>
        <HeartIcon size={40} />
        <h3 style={{ fontSize: '22px', margin: '14px 0 8px' }}>Celebrate Auspicious Days with Annadaan</h3>
        <p style={{ color: 'var(--ink-soft)', fontSize: '15px', maxWidth: '640px', margin: '0 auto 24px', lineHeight: 1.65 }}>
          Sponsor Sadhu Bhojan on your birthday, wedding anniversary, children's milestones, or in loving memory of departed ancestors (Shraddha Seva).
        </p>
        <button className="btn btn--gold" onClick={() => pay(1100)}>
          🙏 Offer Annadaan via Razorpay
        </button>
      </div>
    </main>
  );
}

export default Annadaan;
