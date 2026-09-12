import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageBanner from '../PageBanner';
import { LotusIcon } from '../icons';

export function Prasadam() {
  const [prasadamList, setPrasadamList] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/prasadam')
      .then(r => (r.ok ? r.json() : { data: [] }))
      .then(d => setPrasadamList(d.data || []))
      .catch(() => setPrasadamList([]));
  }, []);

  const defaultPrasadam = [
    {
      _id: 'p1',
      name: 'Daily Sadhu & Devotee Annadaan',
      description: 'Wholesome, freshly cooked pure satvik vegetarian thali offered to Lord Krishna before serving with love.',
      availability: 'Served daily to all visitors and sadhus',
      timing: '12:30 PM - 02:00 PM',
      imageUrl: 'https://i.pinimg.com/736x/c9/1d/fa/c91dfa40c8b0c78dd2d797db8323afa6.jpg',
    },
    {
      _id: 'p2',
      name: 'Sunday Love Feast (Maha Prasadam)',
      description: 'Elaborate festive dinner feast following Sunday evening Gaura Aarti, ecstatic kirtan, and Bhagavad Gita lecture.',
      availability: 'Every Sunday evening',
      timing: '07:30 PM onwards',
      imageUrl: 'https://i.pinimg.com/1200x/7d/5b/00/7d5b00e50c50d429bfa6a48d6e871c87.jpg',
    },
    {
      _id: 'p3',
      name: 'Govinda Pure Ghee Sweets & Snacks',
      description: 'Traditional Indian sweets made with pure cow ghee (Besan Laddoo, Kaju Katli, Peda, Gulab Jamun) and savory snacks.',
      availability: 'Available daily at the temple sweet counter',
      timing: '07:00 AM - 09:00 PM',
      imageUrl: 'https://i.pinimg.com/1200x/61/c7/10/61c7107bcef9a6c25f954c96de43e864.jpg',
    },
  ];

  const list = prasadamList.length > 0 ? prasadamList : defaultPrasadam;

  return (
    <main className="page">
      <PageBanner
        lead="KARMA-FREE SATVIK FEAST"
        title="Sanctified Krishna Prasadam"
        subtitle="Food prepared with love and devotion and offered to the Supreme Lord Krishna purifies the heart and bestows spiritual joy."
      />

      <div className="card-grid">
        {list.map((item: any) => (
          <article className="card" key={item._id}>
            <div
              className="card-image"
              style={item.imageUrl ? { backgroundImage: `url(${item.imageUrl})` } : {}}
            />
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
