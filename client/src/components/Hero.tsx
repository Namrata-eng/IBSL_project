import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Hero.css';

const HERO_VIDEO_URL = '/hero.mp4';

const STATS = [
  { figure: '50K+', label: 'Pilgrims', foot: 'Monthly Devotees' },
  { figure: '100K+', label: 'Prasadam', foot: 'Meals Distributed' },
  { figure: '4:30 AM', label: 'Mangala', foot: 'Daily Aarti' },
];

export function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const play = video.play();
    if (play?.catch) play.catch(() => {});
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      video.pause();
      setReady(true);
    }
  }, []);

  return (
    <section className="hero" id="top">
      {/* FULL-VIEWPORT LOOPING VIDEO LAYER */}
      <div className="hero__media" aria-hidden="true">
        <video
          ref={videoRef}
          className={`hero__video ${ready ? 'is-ready' : ''}`}
          src={HERO_VIDEO_URL}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onCanPlay={() => setReady(true)}
        />
        <div className="hero__scrim" />
      </div>

      {/* CENTER BLOCK */}
      <div className="hero__body shell">
        <h1 className="hero__title">
          <span className="hero__title-lead">Sri Sri Radha Krishna · ISKCON</span>
          Sanctuary for the Soul, Awaken Divine Peace.
        </h1>
        <div className="hero__cta-group">
          <Link className="btn btn--pearl hero__cta" to="/timings">
            Plan Your Darshan
          </Link>
          <Link className="btn btn--ink hero__cta" to="/about">
            Discover the Temple
          </Link>
        </div>
      </div>

      {/* FOOT ROW */}
      <div className="hero__foot shell">
        <article className="card card--note">
          <h2>Beauty of Pure Devotion</h2>
          <p>
            From radiant daily darshan and soul-stirring kirtan to timeless Vedic wisdom, discover a sanctuary for the heart and mind.
          </p>
        </article>

        <p className="hero__caption">
          Chant Hare Krishna and be happy · Joy in divine selfless service.
        </p>

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
    </section>
  );
}

export default Hero;
