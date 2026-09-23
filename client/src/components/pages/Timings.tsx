import React, { useEffect, useState } from 'react';
import PageBanner from '../PageBanner';
import { ClockIcon, LotusIcon, PeacockFeatherIcon, TilakMark } from '../icons';

export function Timings() {
  const [timings, setTimings] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/timings')
      .then(r => (r.ok ? r.json() : { data: [] }))
      .then(d => setTimings(d.data || []))
      .catch(() => setTimings([]));
  }, []);

  const defaultSchedule = [
    { title: 'Mangala Aarti & Morning Darshan', time: '07:00 AM – 08:00 AM', desc: 'Auspicious dawn ceremony, Tulsi Puja, and Sri Sri Radha Krishna darshan with melodious kirtan.' },
    { title: 'Morning Visiting Session', time: '07:00 AM – 01:00 PM', desc: 'Temple open for personal prayers, chanting, japa meditation, and circumambulation.' },
    { title: 'Afternoon Altar Closure (Pahuda)', time: '01:00 PM – 04:00 PM', desc: 'Deity resting period. Altar remains closed during these hours.' },
    { title: 'Evening Visiting Session', time: '04:00 PM – 09:00 PM', desc: 'Evening darshan, spiritual books reading, and devotee association.' },
    { title: 'Sandhya Gaura Aarti & Kirtan', time: '07:00 PM – 08:00 PM', desc: 'Soul-stirring musical kirtan with mridangas and kartals, followed by Bhagavad Gita discourse.' },
    { title: 'Temple Closes (Shayan Aarti)', time: '09:00 PM', desc: 'Final evening prayer and temple closing for the night.' },
  ];

  const scheduleToDisplay = timings.length > 0
    ? timings.map((t: any) => ({
        title: t.type,
        time: `${t.startTime || ''} ${t.endTime ? '– ' + t.endTime : ''}`,
        desc: t.description || 'Devotional prayer and darshan.',
      }))
    : defaultSchedule;

  return (
    <main className="page">
      <PageBanner
        lead="DIVINE DAILY SCHEDULE"
        title="Temple Timings & Daily Aarti"
        subtitle="Behold the divine forms of Sri Sri Radha Krishna. Join us for soul-stirring morning and evening ceremonies in Kopargaon."
      />

      {/* Live Session Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', maxWidth: '960px', margin: '0 auto 48px' }}>
        <div className="card" style={{ padding: '32px', borderTop: '4px solid var(--gold)', textAlign: 'center', background: 'radial-gradient(circle at 50% 0%, rgba(245, 176, 65, 0.15), rgba(14, 28, 44, 0.8))' }}>
          <ClockIcon size={36} />
          <h3 style={{ fontSize: '22px', margin: '12px 0 6px', color: 'var(--ink)' }}>Morning Session</h3>
          <p style={{ fontSize: '26px', color: 'var(--gold)', fontWeight: 600, margin: '6px 0' }}>07:00 AM – 01:00 PM</p>
          <span className="eyebrow" style={{ color: '#38bdf8' }}>Mangala Aarti at 07:00 AM</span>
        </div>

        <div className="card" style={{ padding: '32px', borderTop: '4px solid #f472b6', textAlign: 'center', background: 'radial-gradient(circle at 50% 0%, rgba(244, 114, 182, 0.15), rgba(14, 28, 44, 0.8))' }}>
          <ClockIcon size={36} />
          <h3 style={{ fontSize: '22px', margin: '12px 0 6px', color: 'var(--ink)' }}>Evening Session</h3>
          <p style={{ fontSize: '26px', color: '#f472b6', fontWeight: 600, margin: '6px 0' }}>04:00 PM – 09:00 PM</p>
          <span className="eyebrow" style={{ color: 'var(--gold)' }}>Sandhya Aarti at 07:00 PM</span>
        </div>
      </div>

      {/* Detailed Aarti Schedule List */}
      <section style={{ maxWidth: '960px', margin: '0 auto 48px' }}>
        <div className="card" style={{ padding: '20px 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--hairline-gold)', paddingBottom: '14px' }}>
            <PeacockFeatherIcon size={24} />
            <h3 style={{ margin: 0, fontSize: '20px' }}>Daily Aarti Ceremonies</h3>
          </div>

          {scheduleToDisplay.map((item, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '18px 0',
                borderBottom: idx === scheduleToDisplay.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.08)',
                flexWrap: 'wrap',
                gap: '14px',
              }}
            >
              <div>
                <b style={{ fontSize: '16.5px', color: 'var(--gold)', display: 'block' }}>{item.title}</b>
                <p style={{ fontSize: '14px', color: 'var(--ink-soft)', margin: '4px 0 0', fontWeight: 300 }}>{item.desc}</p>
              </div>
              <div style={{ background: 'rgba(245, 176, 65, 0.15)', border: '1px solid var(--hairline-gold)', padding: '6px 16px', borderRadius: 'var(--radius-pill)', color: '#ffffff', fontWeight: 500, fontSize: '13px' }}>
                {item.time}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Visitor Etiquette Card */}
      <div className="card" style={{ maxWidth: '960px', margin: '0 auto', padding: '34px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <LotusIcon size={24} />
          <span className="eyebrow" style={{ margin: 0 }}>VISITOR GUIDELINES</span>
        </div>
        <h3 style={{ fontSize: '20px', margin: '4px 0 14px' }}>Temple Etiquette & Darshan Protocols</h3>
        <ul style={{ color: 'var(--ink-soft)', fontSize: '14px', lineHeight: 1.75, display: 'grid', gap: '8px', paddingLeft: '20px', listStyleType: 'disc' }}>
          <li>Please leave footwear at the shoe counter before entering the temple sanctum.</li>
          <li>Modest traditional clothing is requested to maintain the sacred atmosphere of the temple.</li>
          <li>Please maintain silence or participate joyfully in congregational chanting (Harinam Sankirtan).</li>
          <li>For special abhishek sponsorships or group pilgrimages from Shirdi, call our helpdesk at <strong>+91 90828 60210</strong>.</li>
        </ul>
      </div>
    </main>
  );
}

export default Timings;
