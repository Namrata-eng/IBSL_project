import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Hero from './Hero';
import { CalendarIcon, ClockIcon, HeartIcon, ChevronRight, TilakMark } from './icons';
import './Home.css';

export function Home() {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/events?upcoming=true&limit=3')
      .then(r => (r.ok ? r.json() : { data: [] }))
      .then(d => setEvents(d.data || []))
      .catch(() => setEvents([]));
  }, []);

  const corePillars = [
    {
      title: 'Sadhu Bhojan & Annadaan',
      desc: 'Nourishing bodies and souls daily with pure, sanctified satvik vegetarian meals across Kopargaon.',
      tag: 'DAILY SEVA',
      link: '/annadaan',
    },
    {
      title: 'Youth Empowerment (IYF)',
      desc: 'Training youth and college students in Mridanga, Harmonium, Vedic leadership, and Gita life values.',
      tag: 'EDUCATION',
      link: '/services',
    },
    {
      title: 'Gaushala Cow Protection',
      desc: 'Loving care, green fodder, and natural shelter for indigenous Desi cows and calves.',
      tag: 'GAU SEVA',
      link: '/gaushala',
    },
    {
      title: 'Sri Jagannath Rathayatra',
      desc: 'Annual grand chariot procession from Tahsil Maidan to MG Trust with ecstatic kirtan and feasts.',
      tag: 'FESTIVAL',
      link: '/events',
    },
  ];

  return (
    <>
      {/* 1. FULL-VIEWPORT VIDEO HERO */}
      <Hero />

      {/* 2. LIVE AARTI TIMINGS TICKER STRIP */}
      <section className="aarti-ticker">
        <div className="shell aarti-ticker__inner">
          <div className="aarti-badge">
            <span className="live-dot"></span>
            <span>TEMPLE TIMINGS</span>
          </div>
          <div className="aarti-item">
            <strong>Morning Session:</strong> 07:00 AM – 01:00 PM (Mangala Aarti 07:00 AM)
          </div>
          <div className="aarti-divider">|</div>
          <div className="aarti-item">
            <strong>Evening Session:</strong> 04:00 PM – 09:00 PM (Sandhya Aarti 07:00 PM)
          </div>
          <Link to="/timings" className="aarti-link">
            <span>View Full Schedule</span>
            <ChevronRight size={14} />
          </Link>
        </div>
      </section>

      {/* 3. WELCOME INTRO */}
      <section className="home-intro shell">
        <span className="eyebrow">🕉️ HARE KRISHNA — WELCOME TO ISKCON KOPARGAON</span>
        <h2>Sri Sri Radha Krishna's Abode in Ahmednagar</h2>
        <p>
          Samskar Value Education Centre, Kopargaon — nestled in the sacred land of Maharashtra, moments from the divine city of Shirdi — is a dynamic ISKCON extension centre spreading the eternal message of the Bhagavad Gita As It Is. Here, devotion becomes daily life, and every soul finds purpose, peace, and transcendental joy.
        </p>
        <p style={{ color: 'var(--ink-soft)', fontSize: '14.5px', maxWidth: '640px', margin: '0 auto 28px', lineHeight: 1.75 }}>
          Under the guidance of ISKCON Juhu, we serve thousands of families through sacred prasadam distribution, ancient Vedic education, Gaushala cow protection, and ecstatic Harinam Sankirtan kirtan.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <a href="/about" className="btn btn--pearl">
            About ISKCON Kopargaon
          </a>
          <a href="/timings" className="btn btn--ink">
            🛕 Plan Your Temple Visit
          </a>
        </div>
      </section>

      {/* 4. FOUR DEVOTIONAL PILLARS */}
      <section className="home-pillars shell">
        <div className="pillars-header">
          <span className="eyebrow">OUR SACRED MINISTRIES</span>
          <h2>Four Pillars of Devotional Service</h2>
          <p>Serving the Supreme Lord and all living beings through these eternal community programmes in Kopargaon.</p>
        </div>

        <div className="card-grid">
          {corePillars.map((p, idx) => (
            <article className="card pillar-card" key={idx}>
              <span className="eyebrow">{p.tag}</span>
              <h3>{p.title}</h3>
              <p>{p.desc}</p>
              <div style={{ marginTop: '16px' }}>
                <Link to={p.link} className="home-intro-link">
                  <span>Learn More</span>
                  <ChevronRight size={14} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 5. DAILY GITA SHLOKA CARD */}
      <section className="gita-section shell">
        <div className="card gita-card">
          <div className="gita-card__head">
            <TilakMark size={24} />
            <span className="eyebrow">BHAGAVAD GITA VERSE OF CONTEMPLATION</span>
          </div>

          <blockquote className="gita-sanskrit">
            "patraṁ puṣpaṁ phalaṁ toyaṁ yo me bhaktyā prayacchati |<br />
            tad ahaṁ bhakty-upahṛtam aśnāmi prayatātmanaḥ ||"
          </blockquote>

          <p className="gita-translation">
            "If one offers Me with love and devotion a leaf, a flower, a fruit or water, I will accept it."
            <br />
            <strong>— Bhagavad Gita As It Is, Chapter 9, Verse 26</strong>
          </p>
        </div>
      </section>

      {/* 6. UPCOMING FESTIVALS & DARSHAN TIMINGS */}
      <section className="home-split">
        <div className="home-split__grid shell">
          <div className="home-events-card">
            <span className="eyebrow">CELEBRATE WITH US</span>
            <h2>Upcoming Festivals & Events</h2>

            {events.length > 0 ? (
              events.map(e => (
                <article className="event-item" key={e._id}>
                  <div className="event-icon">
                    <CalendarIcon size={20} />
                  </div>
                  <div>
                    <b>{e.name}</b>
                    <p>
                      {new Date(e.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · {e.time || 'Details forthcoming'}
                    </p>
                    {e.location && <small style={{ color: 'var(--ink-muted)', display: 'block', marginTop: '2px' }}>📍 {e.location}</small>}
                  </div>
                </article>
              ))
            ) : (
              <div style={{ display: 'grid', gap: '14px' }}>
                <article className="event-item">
                  <div className="event-icon"><CalendarIcon size={20} /></div>
                  <div>
                    <b>Sri Jagannath Rathayatra Kopargaon</b>
                    <p>Grand Chariot Procession · Tahsil Maidan to MG Trust</p>
                  </div>
                </article>
                <article className="event-item">
                  <div className="event-icon"><CalendarIcon size={20} /></div>
                  <div>
                    <b>Sri Krishna Janmashtami Mahotsav</b>
                    <p>Continuous Harinam Sankirtan & Midnight Abhishek</p>
                  </div>
                </article>
              </div>
            )}

            <div style={{ marginTop: '24px' }}>
              <Link to="/events" className="home-intro-link">
                <span>View all festival celebrations</span>
                <ChevronRight size={16} />
              </Link>
            </div>
          </div>

          <div className="home-timing-card">
            <ClockIcon size={28} />
            <span className="eyebrow">TEMPLE VISITS</span>
            <h3>Daily Darshan Schedule</h3>
            <p>
              Join us for soul-stirring Mangala Aarti at 7:00 AM and divine Sandhya Aarti at 7:00 PM followed by Bhagavad Gita discourse and kirtan.
            </p>
            <div style={{ display: 'grid', gap: '8px', fontSize: '13.5px', marginBottom: '20px', color: 'var(--ink-soft)' }}>
              <div>🌅 <strong>Morning:</strong> 07:00 AM – 01:00 PM</div>
              <div>🌇 <strong>Evening:</strong> 04:00 PM – 09:00 PM</div>
            </div>
            <Link className="btn btn--pearl" to="/timings" style={{ width: '100%' }}>
              View Detailed Timings
            </Link>
          </div>
        </div>
      </section>

      {/* 7. SEVA DONATION BANNER */}
      <section className="home-donate-banner shell">
        <HeartIcon size={44} />
        <div>
          <span className="eyebrow">OFFER DEVOTIONAL SEVA</span>
          <h2>Your Generosity Feeds Souls & Transforms Lives</h2>
          <p>
            Support daily Annadaan, sacred Gaushala cow protection, Gita distribution, and youth value education in Kopargaon.
          </p>
        </div>
        <Link className="btn btn--pearl" to="/donate">
          Donate & Offer Seva
        </Link>
      </section>
    </>
  );
}

export default Home;
