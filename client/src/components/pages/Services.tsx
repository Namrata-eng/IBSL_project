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
      imageUrl: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=800&q=80',
      timing: 'Daily 12:30 PM - 02:00 PM',
      link: '/annadaan',
    },
    {
      _id: 's2',
      title: 'Youth Empowerment Centre (IYF)',
      subtitle: 'Vedic arts, music & character building',
      category: 'Youth Forum',
      description: 'Engaging college students and youth with mridanga and harmonium training, leadership, public speaking, and Gita life lessons.',
      imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
      timing: 'Every Weekend',
      link: '/contact',
    },
    {
      _id: 's3',
      title: 'Gaushala (Gau Seva)',
      subtitle: 'Protecting and serving Mother Surabhi',
      category: 'Gau Seva',
      description: 'Loving care and shelter for indigenous Desi cows, providing daily green fodder, natural habitat, and compassionate veterinary support.',
      imageUrl: 'https://i.pinimg.com/736x/af/d1/3a/afd13a1cad7f876e957f35f200a1ba49.jpg',
      timing: 'Daily 08:00 AM - 06:00 PM',
      link: '/gaushala',
    },
    {
      _id: 's4',
      title: 'Gita Life Course',
      subtitle: 'Practical Vedic philosophy for modern living',
      category: 'Spiritual Courses',
      description: 'Systematic study of Bhagavad Gita As It Is, covering karma, reincarnation, time, material nature, and the Supreme Personality of Godhead.',
      imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
      timing: 'Weekend Batches',
      link: '/contact',
    },
    {
      _id: 's5',
      title: 'Harinam Sankirtan',
      subtitle: 'Congregational chanting of the holy names',
      category: 'Devotional Kirtan',
      description: 'Weekly public Harinam kirtan in Kopargaon spreading the divine vibrations of the Hare Krishna Maha Mantra.',
      imageUrl: 'https://i.pinimg.com/1200x/5a/39/63/5a39630f63ef88c48ae23e0d770ca253.jpg',
      timing: 'Sundays 05:30 PM',
      link: '/contact',
    },
    {
      _id: 's6',
      title: 'Samskar Value Education',
      subtitle: 'Shaping young minds through timeless ethics',
      category: 'Children Education',
      description: 'Interactive moral education for children including Vedic storytelling, drama, shloka recitation, and devotional art.',
      imageUrl: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80',
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
