import React from 'react';
import { FluteDivider, LotusIcon, PeacockFeatherIcon, VedicMandalaWallArt } from './icons';

interface PageBannerProps {
  lead?: string;
  title: string;
  subtitle: string;
}

export function PageBanner({ lead = 'HARE KRISHNA · ISKCON KOPARGAON', title, subtitle }: PageBannerProps) {
  return (
    <div className="cinematic-banner" style={{ position: 'relative', overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        <VedicMandalaWallArt size={360} opacity={0.07} color="#d4af37" className="mandala-rotate-slow" />
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '8px' }}>
          <LotusIcon size={20} />
          <span className="banner-lead">{lead}</span>
          <PeacockFeatherIcon size={20} />
        </div>

        <h1>{title}</h1>
        <FluteDivider size={150} />
        <p>{subtitle}</p>
      </div>
    </div>
  );
}

export default PageBanner;
