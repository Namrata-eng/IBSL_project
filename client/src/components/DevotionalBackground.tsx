import React from 'react';
import { VedicMandalaWallArt, LotusMuralWallArt } from './icons';
import './DevotionalBackground.css';

export function DevotionalBackground() {
  const motes = [
    { left: '6%', delay: '0s', duration: '15s', size: 16, color: '#d4af37' },
    { left: '20%', delay: '3s', duration: '18s', size: 14, color: '#f472b6' },
    { left: '38%', delay: '1s', duration: '14s', size: 18, color: '#38bdf8' },
    { left: '55%', delay: '6s', duration: '20s', size: 16, color: '#fbbf24' },
    { left: '72%', delay: '2s', duration: '16s', size: 20, color: '#f472b6' },
    { left: '88%', delay: '4s', duration: '15s', size: 14, color: '#0ea5e9' },
  ];

  return (
    <div className="devotional-bg" aria-hidden="true">
      <div className="bg-ambient-light-1" />
      <div className="bg-ambient-light-2" />
      <div className="bg-ambient-light-3" />

      <div className="bg-mandala-wrapper bg-mandala-top-right">
        <VedicMandalaWallArt size={480} opacity={0.13} color="#d4af37" className="mandala-rotate-slow" />
      </div>

      <div className="bg-mandala-wrapper bg-mandala-bottom-left">
        <LotusMuralWallArt size={450} opacity={0.12} color="#f3c650" className="mandala-rotate-reverse" />
      </div>

      {motes.map((m, i) => (
        <div
          key={i}
          className="floating-mote"
          style={{
            left: m.left,
            animationDelay: m.delay,
            animationDuration: m.duration,
          }}
        >
          <svg width={m.size} height={m.size} viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2C13 8 19 11 19 15C19 18.5 15.8 21 12 21C8.2 21 5 18.5 5 15C5 11 11 8 12 2Z"
              fill={m.color}
              opacity="0.3"
              stroke={m.color}
              strokeWidth="0.8"
            />
          </svg>
        </div>
      ))}
    </div>
  );
}

export default DevotionalBackground;
