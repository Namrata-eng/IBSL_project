import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './Hero.css';

const HERO_VIDEO_URL = '/new_video.mp4';
const HERO_POSTER_IMAGE = '/krishna_hero.jpg';

const STATS = [
  { figure: '50K+', label: 'Pilgrims', foot: 'Monthly Devotees' },
  { figure: '100K+', label: 'Prasadam', foot: 'Meals Distributed' },
  { figure: '4:30 AM', label: 'Mangala', foot: 'Daily Aarti' },
];

export function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [motionEnabled, setMotionEnabled] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Explicitly set muted & defaultMuted to ensure mobile autoplay restrictions are satisfied
    video.muted = true;
    video.defaultMuted = true;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reducedMotion) {
      video.pause();
      setMotionEnabled(false);
      return;
    }

    video.play().catch(() => {
      // Autoplay with muted is allowed across modern desktop and mobile browsers
    });
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (motionEnabled && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      video.muted = true;
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [motionEnabled]);

  return (
    <section
      className={`hero ${motionEnabled ? 'hero--motion' : 'hero--still'}`}
      id="top"
    >
      <div className="hero__media" aria-hidden="true">
        <video
          ref={videoRef}
          className="hero__video"
          poster={HERO_POSTER_IMAGE}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        >
          <source src={HERO_VIDEO_URL} type="video/mp4" />
        </video>
        <div className="hero__scrim" />
        <div className="hero__god-rays" />
        <div className="hero__motes hero__motes--one" />
        <div className="hero__motes hero__motes--two" />
      </div>

      <div className="hero__body shell">
        <p className="hero__eyebrow"><span /> an evening of devotion</p>
        <h1 className="hero__title">
          <span className="hero__title-lead">Sri Sri Radha Krishna · ISKCON</span>
          Sanctuary for the Soul,<br /><i>Awaken Divine Peace.</i>
        </h1>
        <div className="hero__cta-group">
          <Link className="btn btn--pearl hero__cta" to="/timings">Plan Your Darshan <span>↘</span></Link>
          <Link className="btn btn--ink hero__cta" to="/about">Discover the Temple <span>↗</span></Link>
        </div>
      </div>

      <div className="hero__foot shell">
        <article className="card card--note">
          <span className="hero__note-label">a living stillness</span>
          <h2>Beauty of Pure Devotion</h2>
          <p>From radiant daily darshan and soul-stirring kirtan to timeless Vedic wisdom, discover a sanctuary for the heart and mind.</p>
        </article>
        <p className="hero__caption">Chant Hare Krishna and be happy · Joy in divine selfless service.</p>
        <div className="hero__stats">
          {STATS.map(s => (
            <article key={s.label} className="card card--stat">
              <strong>{s.figure}</strong>
              <span className="card__label">{s.label}</span>
              <span className="card__foot">{s.foot}</span>
            </article>
          ))}
        </div>
      </div>

      <div className="hero__index" aria-hidden="true"><span>01</span><i /><span>03</span></div>
      <button
        className="hero__motion-toggle"
        type="button"
        onClick={() => setMotionEnabled(value => !value)}
        aria-pressed={motionEnabled}
      >
        <span /> {motionEnabled ? 'motion on' : 'motion off'}
      </button>
      <a className="hero__scroll" href="#home-intro"><span>scroll to wander</span><b>↘</b></a>
    </section>
  );
}

export default Hero;
