import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PageBanner from '../PageBanner';
import { SearchIcon } from '../icons';

// Static searchable content that works offline too
const staticContent = [
  { title: 'Darshan Timings', description: 'Morning Session: 07:00 AM – 01:00 PM (Mangala Aarti at 7:00 AM). Evening Session: 04:00 PM – 09:00 PM (Sandhya Aarti at 7:00 PM).', link: '/timings', type: 'Timings' },
  { title: 'Mangala Aarti', description: 'Morning auspicious aarti at 7:00 AM at ISKCON Kopargaon. Temple opens for darshan after Mangala Aarti.', link: '/timings', type: 'Timings' },
  { title: 'Sandhya Aarti (Evening)', description: 'Evening sandhya aarti at 7:00 PM followed by Bhagavad Gita discourse and prasadam.', link: '/timings', type: 'Timings' },
  { title: 'Gaura Aarti', description: 'Sunday special Gaura Aarti at 7:00 PM followed by the Sunday Love Feast Maha Prasadam.', link: '/timings', type: 'Timings' },
  { title: 'Annadaan / Sadhu Bhojan', description: 'Daily Annadaan — free sanctified vegetarian meals served to all pilgrims, sadhus, and visitors daily at 12:30 PM.', link: '/annadaan', type: 'Service' },
  { title: 'Gaushala & Cow Protection', description: 'Indigenous Desi cow sanctuary. Adopt a cow or sponsor daily fodder. Open daily 8 AM – 6 PM.', link: '/gaushala', type: 'Service' },
  { title: 'Youth Empowerment (IYF)', description: 'Mridanga, harmonium, Vedic music training, Gita life courses, and leadership workshops for youth and college students.', link: '/services', type: 'Service' },
  { title: 'Bhagavad Gita Course', description: 'Systematic study of Bhagavad Gita As It Is by Srila Prabhupada. Weekend batches for all ages.', link: '/services', type: 'Service' },
  { title: 'Harinam Sankirtan Kirtan', description: 'Weekly public Harinam kirtan in Kopargaon every Sunday at 5:30 PM. Spread the holy names of Lord Krishna.', link: '/services', type: 'Service' },
  { title: 'Samskar Value Education', description: 'Children education program with Vedic storytelling, shloka recitation, devotional drama. Sundays 10:00 AM.', link: '/services', type: 'Service' },
  { title: 'Janmashtami Festival', description: 'Grand annual celebration of Sri Krishna Janmashtami with continuous sankirtan, midnight abhishek, and Maha Prasadam feast.', link: '/events', type: 'Festival' },
  { title: 'Rathayatra Festival', description: 'Annual Sri Jagannath Rathayatra grand chariot procession from Tahsil Maidan to MG Charitable Trust in Kopargaon.', link: '/events', type: 'Festival' },
  { title: 'Ram Navami Celebration', description: 'Auspicious celebration of Lord Rama\'s appearance day with kirtan, discourse, and special prasadam.', link: '/events', type: 'Festival' },
  { title: 'Prasadam / Krishna Prasadam', description: 'Sanctified food offered to Lord Krishna before serving. Daily thali, Sunday Love Feast, and pure ghee sweets.', link: '/prasadam', type: 'Prasadam' },
  { title: 'Sunday Love Feast', description: 'Elaborate festive prasadam dinner every Sunday after Gaura Aarti at 7:30 PM onwards.', link: '/prasadam', type: 'Prasadam' },
  { title: 'Govinda Sweets & Snacks', description: 'Pure cow ghee Indian sweets — Laddoo, Kaju Katli, Peda, Gulab Jamun — available daily at temple sweet counter.', link: '/prasadam', type: 'Prasadam' },
  { title: 'Donation & Seva', description: 'Offer your heartfelt seva — Annadaan, Gaushala, Gita distribution, Festival, Deity Flower Seva. Pay via Razorpay.', link: '/donate', type: 'Seva' },
  { title: 'Contact & Address', description: 'ISKCON Kopargaon, Samskar Value Education Centre, Kopargaon, Ahmednagar, Maharashtra 423603. Near Shirdi. Phone: +91 90828 60210.', link: '/contact', type: 'Contact' },
  { title: 'Temple Location / How to Reach', description: 'Kopargaon is 12 km from Shirdi. Nearest railway station: Kopargaon Railway Station. Phone for directions: +91 90828 60210.', link: '/contact', type: 'Contact' },
  { title: 'About ISKCON Kopargaon', description: 'ISKCON Kopargaon is an extension centre of ISKCON Juhu, dedicated to spreading Vedic wisdom, devotional service, and community welfare in Ahmednagar district.', link: '/about', type: 'About' },
  { title: 'Adopt a Cow Gaushala Seva', description: 'Adopt a desi cow for 1 month (₹5000) or 1 year (₹51000) to provide complete care, shelter, and protection.', link: '/gaushala', type: 'Service' },
];

const typeColors: Record<string, string> = {
  'Timings': '#f59e0b',
  'Service': '#38bdf8',
  'Festival': '#f472b6',
  'Prasadam': '#34d399',
  'Seva': '#a78bfa',
  'Contact': '#fb923c',
  'About': '#d4af37',
};

export function SearchPage() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const searchLocally = (query: string) => {
    const q = query.toLowerCase().trim();
    if (q.length < 2) return [];
    return staticContent.filter(item =>
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.type.toLowerCase().includes(q)
    );
  };

  const go = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);

    // Try server first, fallback to local static content
    try {
      const r = await fetch('/api/search?q=' + encodeURIComponent(q.trim()));
      if (r.ok) {
        const d = await r.json();
        const serverResults = d.data || [];
        if (serverResults.length > 0) {
          setResults(serverResults);
        } else {
          // Server returned empty — use local fallback
          setResults(searchLocally(q));
        }
      } else {
        setResults(searchLocally(q));
      }
    } catch {
      // Offline / server not running — use local static search
      setResults(searchLocally(q));
    } finally {
      setLoading(false);
    }
  };

  // Popular topics as quick-links
  const popularTopics = ['Aarti Timings', 'Prasadam', 'Gaushala', 'Donation', 'Janmashtami', 'Contact'];

  return (
    <main className="page">
      <PageBanner
        lead="TEMPLE DIRECTORY"
        title="Search ISKCON Kopargaon"
        subtitle="Find darshan timings, festival announcements, Annadaan seva, Gaushala, and youth empowerment courses."
      />

      <div style={{ maxWidth: '780px', margin: '0 auto' }}>
        <form className="search-form" onSubmit={go} style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search aarti timings, Rathayatra, Gaushala, Sadhu Bhojan, donation…"
              style={{ paddingLeft: '42px', width: '100%' }}
            />
            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-muted)' }}>
              <SearchIcon size={18} />
            </span>
          </div>
          <button className="btn btn--pearl" type="submit" style={{ whiteSpace: 'nowrap' }}>
            🔍 Search
          </button>
        </form>

        {/* Popular Quick Topics */}
        {!searched && (
          <div style={{ marginBottom: '32px' }}>
            <p style={{ fontSize: '13px', color: 'var(--ink-muted)', marginBottom: '10px' }}>Popular searches:</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {popularTopics.map(topic => (
                <button
                  key={topic}
                  className="btn btn--ink"
                  style={{ padding: '6px 14px', fontSize: '13px' }}
                  onClick={() => {
                    setQ(topic);
                    const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
                    // Directly set and search
                    setLoading(true);
                    setSearched(true);
                    setTimeout(() => {
                      setResults(searchLocally(topic));
                      setLoading(false);
                    }, 200);
                  }}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <p style={{ textAlign: 'center', color: 'var(--gold)', padding: '40px 0' }}>
            Searching temple records…
          </p>
        )}

        {searched && !loading && (
          <div>
            <p style={{ fontSize: '13px', color: 'var(--ink-muted)', marginBottom: '16px' }}>
              {results.length > 0
                ? `Found ${results.length} result${results.length !== 1 ? 's' : ''} for "${q}"`
                : `No results found for "${q}"`}
            </p>

            {results.length > 0 ? (
              <div style={{ display: 'grid', gap: '14px' }}>
                {results.map((r: any, i) => (
                  <Link
                    key={i}
                    to={r.link || '#'}
                    style={{ textDecoration: 'none' }}
                  >
                    <article
                      className="card"
                      style={{
                        padding: '20px 24px',
                        display: 'flex',
                        gap: '16px',
                        alignItems: 'flex-start',
                        transition: 'transform 0.2s',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.transform = 'translateX(4px)')}
                      onMouseLeave={e => (e.currentTarget.style.transform = 'translateX(0)')}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap' }}>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              letterSpacing: '0.8px',
                              color: typeColors[r.type] || 'var(--gold)',
                              background: 'rgba(212,175,55,0.1)',
                              padding: '2px 10px',
                              borderRadius: '20px',
                              border: `1px solid ${typeColors[r.type] || 'var(--gold)'}33`,
                            }}
                          >
                            {r.type || 'Temple Info'}
                          </span>
                          <b style={{ color: 'var(--ink)', fontSize: '16px' }}>{r.title || r.name}</b>
                        </div>
                        <p style={{ color: 'var(--ink-soft)', fontSize: '13.5px', margin: 0, lineHeight: 1.6 }}>
                          {r.description || r.timing || r.subtitle}
                        </p>
                      </div>
                      <span style={{ color: 'var(--gold)', fontSize: '18px', flexShrink: 0 }}>→</span>
                    </article>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
                <p style={{ fontSize: '32px', marginBottom: '12px' }}>🔍</p>
                <p style={{ color: 'var(--ink-soft)', marginBottom: '8px' }}>
                  No matching temple records found for "{q}".
                </p>
                <p style={{ color: 'var(--ink-muted)', fontSize: '13.5px' }}>
                  Try searching: "aarti timings", "prasadam", "gaushala", "donation", "festival", "contact"
                </p>
                <p style={{ color: 'var(--ink-muted)', fontSize: '13px', marginTop: '12px' }}>
                  Or ask our Temple Assistant chatbot 💬 at the bottom right corner.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

export default SearchPage;
