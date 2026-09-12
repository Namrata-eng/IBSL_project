import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageBanner from '../PageBanner';
import { ChevronRight, PeacockFeatherIcon } from '../icons';

export function Services() {
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/services')
      .then(r => (r.ok ? r.json() : { data: [] }))
      .then(d => setServices(d.data || []))
      .catch(() => setServices([]));
  }, []);

  const fallbackServices = [
    {
      _id: 's1',
      title: 'Sadhu Bhojan & Annadaan',
      subtitle: 'Nourishing the soul with Krishna Prasadam',
      category: 'Community Seva',
      description: 'Daily distribution of sanctified Satvik vegetarian meals to sadhus, pilgrims, and local residents across Kopargaon.',
      imageUrl: 'https://i.pinimg.com/736x/e0/f3/16/e0f316214eedd54a72dd974e1b698fcb.jpg',
      timing: 'Daily 12:30 PM - 02:00 PM',
      link: '/annadaan',
    },
    {
      _id: 's2',
      title: 'Youth Empowerment Centre (IYF)',
      subtitle: 'Vedic arts, music & character building',
      category: 'Youth Forum',
      description: 'Engaging college students and youth with mridanga and harmonium training, leadership, public speaking, and Gita life lessons.',
      imageUrl: 'https://i.pinimg.com/1200x/6c/28/5d/6c285dd8376c719c6c5e98089e4528e8.jpg',
      timing: 'Every Weekend',
      link: '/contact',
    },
    {
      _id: 's3',
      title: 'Gaushala (Gau Seva)',
      subtitle: 'Protecting and serving Mother Surabhi',
      category: 'Gau Seva',
      description: 'Loving care and shelter for indigenous Desi cows, providing daily green fodder, natural habitat, and compassionate veterinary support.',
      imageUrl: 'https://i.pinimg.com/736x/85/0c/00/850c00c3927caa78b397ad8359c0f531.jpg',
      timing: 'Daily 08:00 AM - 06:00 PM',
      link: '/gaushala',
    },
    {
      _id: 's4',
      title: 'Gita Life Course',
      subtitle: 'Practical Vedic philosophy for modern living',
      category: 'Spiritual Courses',
      description: 'Systematic study of Bhagavad Gita As It Is, covering karma, reincarnation, time, material nature, and the Supreme Personality of Godhead.',
      imageUrl: 'https://i.pinimg.com/736x/4a/20/20/4a20208d984e7e82ba1ac933b3d33dd6.jpg',
      timing: 'Weekend Batches',
      link: '/contact',
    },
    {
      _id: 's5',
      title: 'Harinam Sankirtan',
      subtitle: 'Congregational chanting of the holy names',
      category: 'Devotional Kirtan',
      description: 'Weekly public Harinam kirtan in Kopargaon spreading the divine vibrations of the Hare Krishna Maha Mantra.',
      imageUrl: 'https://i.pinimg.com/1200x/4b/8b/1a/4b8b1af0e9e5c1e5ac281fe8d06bbe47.jpg',
      timing: 'Sundays 05:30 PM',
      link: '/contact',
    },
    {
      _id: 's6',
      title: 'Samskar Value Education',
      subtitle: 'Shaping young minds through timeless ethics',
      category: 'Children Education',
      description: 'Interactive moral education for children including Vedic storytelling, drama, shloka recitation, and devotional art.',
      imageUrl: 'https://i.pinimg.com/736x/ab/11/b1/ab11b1d54f28d7cc96e1c8e1358b4352.jpg',
      timing: 'Sundays 10:00 AM',
      link: '/contact',
    },
  ];

  const list = services.length > 0 ? services : fallbackServices;

  return (
    <main className="page">
      <PageBanner
        lead="SPIRITUAL MINISTRIES"
        title="Devotional & Community Services"
        subtitle="From sacred meals and cow protection to youth empowerment and Vedic philosophy, discover how we serve in Kopargaon."
      />

      <div className="card-grid">
        {list.map((item: any) => (
          <article className="card" key={item._id}>
            <div
              className="card-image"
              style={item.imageUrl ? { backgroundImage: `url(${item.imageUrl})` } : {}}
            />
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
    </main>
  );
}

export default Services;
