import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  fetchEvents,
  computeFestivalNotifications,
  FestivalNotification,
  TempleEvent,
} from '../utils/templeStore';
import { NotificationBellIcon, XIcon, CalendarIcon, ChevronRight } from './icons';
import './FestivalNotifications.css';

export function FestivalNotifications() {
  const [notifications, setNotifications] = useState<FestivalNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [activeToast, setActiveToast] = useState<FestivalNotification | null>(null);

  const loadNotifications = async () => {
    const events = await fetchEvents();
    const notifs = computeFestivalNotifications(events);
    setNotifications(notifs);

    const highlight = notifs.find(n => n.status === 'today' || n.status === 'tomorrow');
    if (highlight && !sessionStorage.getItem('dismissed_toast_' + highlight.id)) {
      setActiveToast(highlight);
      setShowToast(true);
    }
  };

  useEffect(() => {
    loadNotifications();

    const handleUpdate = () => {
      loadNotifications();
    };
    window.addEventListener('temple_events_updated', handleUpdate);
    return () => window.removeEventListener('temple_events_updated', handleUpdate);
  }, []);

  const dismissToast = () => {
    if (activeToast) {
      sessionStorage.setItem('dismissed_toast_' + activeToast.id, 'true');
    }
    setShowToast(false);
  };

  const highPriorityCount = notifications.filter(n => n.status === 'today' || n.status === 'tomorrow').length;

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        className="nav__search-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Festival Notifications"
        title="View Festival Alerts"
      >
        <NotificationBellIcon count={highPriorityCount} size={18} />
      </button>

      {isOpen && (
        <div className="festival-notif-dropdown">
          <div className="festival-notif-header">
            <h4>
              <span>🪔</span> Festival & Aarti Alerts
            </h4>
            <button
              onClick={() => setIsOpen(false)}
              style={{ color: 'var(--ink-soft)', padding: '4px' }}
              aria-label="Close"
            >
              <XIcon size={16} />
            </button>
          </div>

          <div className="festival-notif-list">
            {notifications.length > 0 ? (
              notifications.map(n => (
                <div
                  key={n.id}
                  className={`festival-notif-item ${
                    n.status === 'today' ? 'is-today' : n.status === 'tomorrow' ? 'is-tomorrow' : ''
                  }`}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className={`notif-badge ${n.status}`}>
                      {n.status === 'today'
                        ? '🎉 TODAY AT TEMPLE'
                        : n.status === 'tomorrow'
                        ? '🔔 TOMORROW (1 DAY TO GO)'
                        : `IN ${n.daysLeft} DAYS`}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--ink-muted)' }}>
                      {n.date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>

                  <h5 style={{ fontSize: '15px', color: 'var(--ink)', margin: '4px 0 2px' }}>
                    {n.festivalName}
                  </h5>

                  {n.time && (
                    <p style={{ fontSize: '12.5px', color: 'var(--gold)', margin: '2px 0 6px' }}>
                      🕒 {n.time} {n.location && `· 📍 ${n.location}`}
                    </p>
                  )}

                  <p style={{ fontSize: '12.5px', color: 'var(--ink-soft)', lineHeight: 1.45, margin: 0 }}>
                    {n.description.slice(0, 110)}…
                  </p>

                  <div style={{ marginTop: '10px' }}>
                    <Link
                      to="/events"
                      onClick={() => setIsOpen(false)}
                      style={{
                        fontSize: '12.5px',
                        color: '#38bdf8',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontWeight: 500,
                      }}
                    >
                      <span>View Festival Schedule</span>
                      <ChevronRight size={13} />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ textAlign: 'center', color: 'var(--ink-muted)', padding: '24px 0', fontSize: '13.5px' }}>
                No immediate festival alerts. Explore all festivals on the Events page.
              </p>
            )}
          </div>

          <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
            <Link
              to="/events"
              onClick={() => setIsOpen(false)}
              className="btn btn--pearl"
              style={{ width: '100%', padding: '8px 14px', fontSize: '12.5px' }}
            >
              Explore Full Festival Calendar
            </Link>
          </div>
        </div>
      )}

      {showToast && activeToast && (
        <div className="festival-toast">
          <div style={{ fontSize: '26px' }}>🪔</div>
          <div style={{ flex: 1 }}>
            <span className={`notif-badge ${activeToast.status}`} style={{ margin: '0 0 4px' }}>
              {activeToast.status === 'today' ? 'TODAY IN KOPARGAON' : 'TOMORROW · 1 DAY REMINDER'}
            </span>
            <h5 style={{ fontSize: '15px', color: 'var(--ink)', margin: '2px 0' }}>
              {activeToast.festivalName}
            </h5>
            <p style={{ fontSize: '12.5px', color: 'var(--ink-soft)', margin: '2px 0 8px', lineHeight: 1.4 }}>
              {activeToast.time} · {activeToast.location || 'ISKCON Kopargaon Sanctum'}
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Link
                to="/events"
                onClick={dismissToast}
                className="btn btn--pearl"
                style={{ padding: '5px 12px', fontSize: '11.5px' }}
              >
                View Details
              </Link>
              <button
                onClick={dismissToast}
                className="btn btn--ink"
                style={{ padding: '5px 10px', fontSize: '11.5px' }}
              >
                Dismiss
              </button>
            </div>
          </div>
          <button onClick={dismissToast} style={{ color: 'var(--ink-muted)' }}>
            <XIcon size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

export default FestivalNotifications;
