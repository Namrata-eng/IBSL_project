import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { TilakMark, MenuIcon, SearchIcon, PlusIcon } from './icons';
import ChantPlayer from './ChantPlayer';
import FestivalNotifications from './FestivalNotifications';
import './Navbar.css';

const PRIMARY_LINKS = [
  { path: '/', label: 'Home' },
  { path: '/about', label: 'About Us' },
  { path: '/timings', label: 'Timings' },
  { path: '/services', label: 'Services' },
  { path: '/annadaan', label: 'Annadaan' },
  { path: '/gaushala', label: 'Gaushala' },
  { path: '/events', label: 'Festivals' },
];

const MORE_LINKS = [
  { path: '/prasadam', label: 'Prasadam' },
  { path: '/gallery', label: 'Darshan Gallery' },
  { path: '/donate', label: 'Campaigns & Seva' },
  { path: '/contact', label: 'Contact Us' },
];

const ALL_LINKS = [...PRIMARY_LINKS, ...MORE_LINKS];

export function Navbar() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const checkUser = () => {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('userToken');
    const storedUser = localStorage.getItem('userData');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    } else if (token) {
      setUser({ role: 'admin', name: 'Temple Admin' });
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    checkUser();
    window.addEventListener('storage', checkUser);
    return () => window.removeEventListener('storage', checkUser);
  }, [location.pathname]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const isMoreActive = MORE_LINKS.some(l => location.pathname.startsWith(l.path));
  const isAdmin = user?.role === 'admin' || !!localStorage.getItem('adminToken');

  return (
    <header className="nav">
      <div className="nav__inner shell">
        {/* 1. BRAND */}
        <Link className="nav__brand" to="/" onClick={() => setOpen(false)}>
          <TilakMark size={24} className="nav__brand-icon" />
          <div className="nav__brand-text">
            <span>ISKCON KOPARGAON</span>
            <small>NEAR SHIRDI · AHMEDNAGAR</small>
          </div>
        </Link>

        {/* 2. FLOATING RAIL (CENTERED) */}
        <nav className="nav__rail" aria-label="Primary">
          {PRIMARY_LINKS.map(({ path, label }) => (
            <Link
              key={path}
              to={path}
              className={isActive(path) ? 'is-active' : ''}
            >
              {label}
            </Link>
          ))}

          <div
            className={`nav__dropdown ${dropdownOpen ? 'is-open' : ''} ${isMoreActive ? 'is-active-parent' : ''}`}
            ref={dropdownRef}
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <button
              type="button"
              className="nav__more-btn"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              aria-expanded={dropdownOpen}
            >
              <span>More</span>
              <span className="dropdown-caret">▾</span>
            </button>

            <div className={`nav__dropdown-menu ${dropdownOpen ? 'show' : ''}`}>
              {MORE_LINKS.map(({ path, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={isActive(path) ? 'is-dropdown-active' : ''}
                  onClick={() => setDropdownOpen(false)}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        {/* 3. ACTIONS */}
        <div className="nav__actions">
          <ChantPlayer />

          <FestivalNotifications />

          <Link to="/search" className="nav__search-btn" aria-label="Search temple information">
            <SearchIcon size={17} />
          </Link>

          {/* ADMIN PROMINENT UPLOAD BUTTON */}
          {isAdmin ? (
            <Link
              to="/admin"
              className="btn btn--gold"
              style={{
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 700,
                boxShadow: '0 0 16px rgba(245, 176, 65, 0.4)',
                border: '1px solid #fbbf24',
              }}
            >
              👑 Admin Console
            </Link>
          ) : user ? (
            <Link to="/profile" className="nav__user-btn" title="Devotee Profile">
              <span className="nav__user-avatar">{user.name?.[0] || 'D'}</span>
              <span className="nav__user-name">{user.name?.split(' ')[0]}</span>
            </Link>
          ) : (
            <Link className="nav__login-link" to="/login">
              Sign In
            </Link>
          )}

          <Link className="btn btn--pearl" to="/donate">
            Donate
          </Link>
        </div>

        {/* 4. TOGGLE */}
        <button
          className="nav__toggle"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          <MenuIcon open={open} size={20} />
        </button>
      </div>

      {/* MOBILE SHEET */}
      {open && (
        <div className="nav__sheet">
          <div className="nav__sheet-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ChantPlayer />
              <FestivalNotifications />
            </div>
            {isAdmin ? (
              <Link to="/admin" onClick={() => setOpen(false)} style={{ color: 'var(--gold-bright)', fontWeight: 700 }}>
                👑 Admin Control Console
              </Link>
            ) : user ? (
              <Link to="/profile" onClick={() => setOpen(false)} style={{ color: 'var(--gold)', fontWeight: 500 }}>
                Hare Krishna, {user.name}
              </Link>
            ) : (
              <div style={{ display: 'flex', gap: '14px' }}>
                <Link to="/login" onClick={() => setOpen(false)}>Sign In</Link>
                <Link to="/signup" onClick={() => setOpen(false)} style={{ color: 'var(--gold)', fontWeight: 500 }}>Sign Up</Link>
              </div>
            )}
          </div>

          <div className="nav__sheet-links">
            {ALL_LINKS.map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                className={isActive(path) ? 'is-active' : ''}
                onClick={() => setOpen(false)}
              >
                <span>{label}</span>
                {isActive(path) && <span style={{ color: 'var(--gold)' }}>●</span>}
              </Link>
            ))}
            <Link to="/search" onClick={() => setOpen(false)}>
              <span>Search Temple Directory</span>
              <SearchIcon size={16} />
            </Link>
          </div>

          {isAdmin && (
            <Link className="btn btn--gold" to="/admin" onClick={() => setOpen(false)} style={{ marginTop: '12px' }}>
              👑 Open Admin Console (Upload Photos & Festivals)
            </Link>
          )}

          <Link className="btn btn--pearl" to="/donate" onClick={() => setOpen(false)} style={{ marginTop: '12px' }}>
            Offer Seva & Donate
          </Link>
        </div>
      )}
    </header>
  );
}

export default Navbar;
