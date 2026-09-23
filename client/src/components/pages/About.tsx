import React from 'react';
import { Link } from 'react-router-dom';
import PageBanner from '../PageBanner';
import { ChevronRight, FluteDivider, LotusIcon, PeacockFeatherIcon, TilakMark } from '../icons';

export function About() {
  const purposes = [
    { num: '01', title: 'Systematic Spiritual Education', desc: 'To systematically propagate spiritual knowledge to society and educate people in the techniques of spiritual life.' },
    { num: '02', title: 'Krishna Consciousness', desc: 'To propagate a consciousness of Krishna as it is revealed in the Bhagavad-gita and Srimad-Bhagavatam.' },
    { num: '03', title: 'Uniting Society', desc: 'To bring the members of the Society together and closer to Krishna, developing the idea within the members and humanity.' },
    { num: '04', title: 'Harinam Sankirtan', desc: 'To teach and encourage the sankirtan movement, congregational chanting of the holy name of God.' },
    { num: '05', title: 'Holy Sanctuaries', desc: 'To erect for the members and for society at large a holy place of transcendental pastimes dedicated to the personality of Krishna.' },
    { num: '06', title: 'Natural & Simple Living', desc: 'To bring members closer together for the purpose of teaching a simpler, more natural way of life.' },
    { num: '07', title: 'Vedic Literatures', desc: 'To publish and distribute books, periodicals, and other writings realizing the above purposes.' },
  ];

  return (
    <main className="page">
      <PageBanner
        lead="SRI SRI RADHA KRISHNA DHAM"
        title="Sanctuary of Transcendental Wisdom"
        subtitle="An extension centre of ISKCON Juhu in the sacred soil of Kopargaon, Ahmednagar — moments from Shirdi."
      />

      {/* Origin Story Card */}
      <section className="card" style={{ padding: '44px', maxWidth: '1000px', margin: '0 auto 48px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <PeacockFeatherIcon size={26} />
            <span className="eyebrow" style={{ margin: 0 }}>OUR HERITAGE & SACRED MISSION</span>
          </div>

          <h2 style={{ fontSize: '28px', fontWeight: 400, color: 'var(--ink)' }}>
            Spreading the Holy Names & Bhagavad Gita in Kopargaon
          </h2>

          <p style={{ color: 'var(--ink-soft)', lineHeight: 1.85, fontSize: '16px', fontWeight: 300 }}>
            ISKCON Kopargaon is a vibrant spiritual extension centre of ISKCON Juhu, Mumbai. Founded under the spiritual lineage of <strong>His Divine Grace A.C. Bhaktivedanta Swami Prabhupada</strong>, our temple serves as an oasis of devotion, peace, and spiritual learning for devotees, local residents, and pilgrims traveling between Shirdi and Ahmednagar.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginTop: '12px' }}>
            <div style={{ background: 'rgba(245, 176, 65, 0.1)', padding: '18px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--hairline-gold)' }}>
              <b style={{ color: 'var(--gold)', fontSize: '20px', display: 'block' }}>100K+</b>
              <span style={{ fontSize: '13px', color: 'var(--ink-soft)' }}>Sadhu & Pilgrim Meals Served</span>
            </div>
            <div style={{ background: 'rgba(2, 132, 199, 0.1)', padding: '18px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--hairline-peacock)' }}>
              <b style={{ color: '#38bdf8', fontSize: '20px', display: 'block' }}>25K+</b>
              <span style={{ fontSize: '13px', color: 'var(--ink-soft)' }}>Bhagavad Gitas Distributed</span>
            </div>
            <div style={{ background: 'rgba(244, 114, 182, 0.1)', padding: '18px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(244, 114, 182, 0.3)' }}>
              <b style={{ color: '#f472b6', fontSize: '20px', display: 'block' }}>Daily</b>
              <span style={{ fontSize: '13px', color: 'var(--ink-soft)' }}>Mangala & Sandhya Aarti</span>
            </div>
          </div>
        </div>
      </section>

      {/* Srila Prabhupada Section */}
      <section style={{ maxWidth: '1000px', margin: '0 auto 56px' }}>
        <div className="card" style={{ padding: '40px', background: 'radial-gradient(100% 120% at 0% 0%, rgba(245, 176, 65, 0.15) 0%, rgba(14, 28, 44, 0.85) 100%)' }}>
          <span className="eyebrow">FOUNDER-ACHARYA</span>
          <h2 style={{ fontSize: '28px', margin: '8px 0 16px', color: 'var(--ink)' }}>
            His Divine Grace A.C. Bhaktivedanta Swami Prabhupada
          </h2>
          <p style={{ color: 'var(--ink-soft)', lineHeight: 1.8, fontSize: '15.5px', fontWeight: 300 }}>
            In 1965, at the advanced age of 69, Srila Prabhupada traveled from India to the West to fulfill the mission of his spiritual master, Srila Bhaktisiddhanta Sarasvati Thakura. He translated and commented upon over eighty volumes of authoritative Vedic literature, established 108 temples across six continents, and inspired a worldwide spiritual renaissance rooted in pure chanting of the <em>Hare Krishna Maha-Mantra</em>.
          </p>
        </div>
      </section>

      {/* 7 Purposes Grid */}
      <section style={{ maxWidth: '1100px', margin: '0 auto 60px' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <span className="eyebrow">SEVEN FOUNDATIONAL PILLARS</span>
          <h2 style={{ fontSize: '30px', fontWeight: 400 }}>The 7 Purposes of ISKCON</h2>
          <FluteDivider size={140} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {purposes.map(p => (
            <div className="card" key={p.num} style={{ padding: '24px' }}>
              <span style={{ fontSize: '28px', fontWeight: 600, color: 'var(--gold)', opacity: 0.6, display: 'block', marginBottom: '4px' }}>
                {p.num}
              </span>
              <h3 style={{ fontSize: '18px', color: 'var(--ink)', marginBottom: '8px' }}>{p.title}</h3>
              <p style={{ fontSize: '13.5px', color: 'var(--ink-faint)', lineHeight: 1.65 }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Action Banner */}
      <section className="card" style={{ maxWidth: '900px', margin: '0 auto', padding: '36px', textAlign: 'center' }}>
        <LotusIcon size={36} />
        <h3 style={{ fontSize: '22px', margin: '14px 0 8px' }}>Join Us for Daily Darshan & Aarti</h3>
        <p style={{ color: 'var(--ink-soft)', fontSize: '15px', maxWidth: '600px', margin: '0 auto 24px' }}>
          Step into our temple sanctum and experience the divine tranquility of Sri Sri Radha Krishna.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <Link to="/timings" className="btn btn--pearl">
            View Darshan Timings
          </Link>
          <Link to="/contact" className="btn btn--ink">
            Get Directions to Kopargaon
          </Link>
        </div>
      </section>
    </main>
  );
}

export default About;
