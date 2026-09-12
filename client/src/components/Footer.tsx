import React from 'react';
import { Link } from 'react-router-dom';
import { TilakMark } from './icons';
import './Footer.css';

export function Footer() {
  return (
    <footer className="footer">
      <div className="shell">
        <div className="footer__grid">
          <div className="footer-brand">
            <div className="footer-brand-title">
              <TilakMark size={24} />
              <span>ISKCON TEMPLE</span>
            </div>
            <p>
              A holy sanctuary for devotion, spiritual reflection, Harinam sankirtan, and Vedic learning.
            </p>
          </div>

          <div className="footer-col">
            <b>Visit the Temple</b>
            <p>Daily Mangala Aarti: 4:30 AM</p>
            <p>Evening Sandhya Aarti: 7:00 PM</p>
            <p>Official visiting details & inquiries open daily.</p>
          </div>

          <div className="footer-col">
            <b>Quick Links</b>
            <Link to="/timings">Temple Timings & Darshan</Link>
            <Link to="/events">Festivals & Events</Link>
            <Link to="/prasadam">Prasadam & Annadanam</Link>
            <Link to="/donate">Offer Seva & Donation</Link>
            <Link to="/contact">Send an Inquiry</Link>
          </div>
        </div>

        <div className="footer__mantra">
          Hare Krishna Hare Krishna, Krishna Krishna Hare Hare · Hare Rama Hare Rama, Rama Rama Hare Hare
        </div>

        <div className="footer__bottom">
          <small>© {new Date().getFullYear()} ISKCON Temple. Dedicated to His Divine Grace A.C. Bhaktivedanta Swami Prabhupada.</small>
          <small>International Society for Krishna Consciousness</small>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
