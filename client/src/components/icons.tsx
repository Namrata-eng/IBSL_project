import React from 'react';

export function VedicMandalaWallArt({ size = 380, className = '', opacity = 0.12, color = '#d4af37' }: { size?: number; className?: string; opacity?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ opacity }}
    >
      <g stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="200" cy="200" r="12" fill={color} fillOpacity="0.3" />
        <circle cx="200" cy="200" r="28" strokeDasharray="3 3" />
        <circle cx="200" cy="200" r="45" />
        <circle cx="200" cy="200" r="70" />
        <circle cx="200" cy="200" r="105" strokeDasharray="6 4" />
        <circle cx="200" cy="200" r="140" />
        <circle cx="200" cy="200" r="175" />
        <circle cx="200" cy="200" r="192" strokeWidth="2" />

        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
          <g key={'inner_' + i} transform={`rotate(${angle} 200 200)`}>
            <path d="M200 155 Q212 175 200 188 Q188 175 200 155 Z" fill={color} fillOpacity="0.08" />
            <path d="M200 130 Q225 165 200 200 Q175 165 200 130 Z" />
            <circle cx="200" cy="142" r="3" fill={color} />
          </g>
        ))}

        {[0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180, 202.5, 225, 247.5, 270, 292.5, 315, 337.5].map((angle, i) => (
          <g key={'mid_' + i} transform={`rotate(${angle} 200 200)`}>
            <path d="M200 95 Q220 125 200 150 Q180 125 200 95 Z" />
            <path d="M190 105 L200 82 L210 105" />
            <line x1="200" y1="95" x2="200" y2="135" strokeDasharray="2 2" />
          </g>
        ))}

        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => (
          <g key={'outer_' + i} transform={`rotate(${angle} 200 200)`}>
            <path d="M200 25 L222 65 L200 95 L178 65 Z" fill={color} fillOpacity="0.05" strokeWidth="1.6" />
            <path d="M200 8 L232 55 L200 85 L168 55 Z" strokeWidth="1.2" />
            <circle cx="200" cy="45" r="4" fill={color} fillOpacity="0.4" />
            <path d="M178 65 Q200 50 222 65" strokeWidth="1" />
          </g>
        ))}
      </g>
    </svg>
  );
}

export function LotusMuralWallArt({ size = 360, className = '', opacity = 0.14, color = '#f3c650' }: { size?: number; className?: string; opacity?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 360 360"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ opacity }}
    >
      <g stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="180" cy="180" r="18" fill={color} fillOpacity="0.25" />
        <circle cx="180" cy="180" r="32" strokeDasharray="4 3" />

        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
          <g key={'l1_' + i} transform={`rotate(${angle} 180 180)`}>
            <path d="M180 135 C192 150 192 165 180 175 C168 165 168 150 180 135 Z" fill={color} fillOpacity="0.1" />
            <line x1="180" y1="140" x2="180" y2="168" />
          </g>
        ))}

        {[0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180, 202.5, 225, 247.5, 270, 292.5, 315, 337.5].map((angle, i) => (
          <g key={'l2_' + i} transform={`rotate(${angle} 180 180)`}>
            <path d="M180 90 C205 120 200 150 180 160 C160 150 155 120 180 90 Z" fill={color} fillOpacity="0.06" strokeWidth="1.3" />
            <path d="M174 105 C180 120 180 135 174 148" opacity="0.6" />
            <path d="M186 105 C180 120 180 135 186 148" opacity="0.6" />
          </g>
        ))}

        {[0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 195, 210, 225, 240, 255, 270, 285, 300, 315, 330, 345].map((angle, i) => (
          <g key={'l3_' + i} transform={`rotate(${angle} 180 180)`}>
            <path d="M180 35 C215 75 210 125 180 145 C150 125 145 75 180 35 Z" strokeWidth="1.4" />
            <path d="M172 55 C184 80 184 105 172 125" opacity="0.5" />
            <path d="M188 55 C176 80 176 105 188 125" opacity="0.5" />
            <line x1="180" y1="42" x2="180" y2="135" opacity="0.7" strokeDasharray="3 3" />
          </g>
        ))}
      </g>
    </svg>
  );
}

export function NotificationBellIcon({ count = 0, size = 20 }: { count?: number; size?: number }) {
  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {count > 0 && (
        <span
          style={{
            position: 'absolute',
            top: '-5px',
            right: '-6px',
            background: 'linear-gradient(135deg, #f59e0b, #ea580c)',
            color: '#fff',
            fontSize: '10px',
            fontWeight: 700,
            borderRadius: '50%',
            width: '17px',
            height: '17px',
            display: 'grid',
            placeItems: 'center',
            boxShadow: '0 0 10px rgba(245, 158, 11, 0.8)',
            animation: 'bellPulse 2s infinite',
          }}
        >
          {count > 9 ? '9+' : count}
        </span>
      )}
    </div>
  );
}

export function TilakMark({ size = 22, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M12 2C13.5 7 18 8 18 12C18 15.5 15.3 17 12 17C8.7 17 6 15.5 6 12C6 8 10.5 7 12 2Z"
        stroke="#d4af37"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.2" fill="#0284c7" />
      <circle cx="12" cy="12" r="1" fill="#f472b6" />
      <path d="M12 17V22" stroke="#d4af37" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M9.5 22Q12 23 14.5 22" stroke="#f0b4c4" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function FluteDivider({ size = 160 }: { size?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '14px auto', opacity: 0.9 }}>
      <svg width={size} height={size * 0.22} viewBox="0 0 160 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 18H145" stroke="#d4af37" strokeWidth="3" strokeLinecap="round" />
        <circle cx="50" cy="18" r="2" fill="#060e17" stroke="#d4af37" strokeWidth="1.2" />
        <circle cx="70" cy="18" r="2" fill="#060e17" stroke="#d4af37" strokeWidth="1.2" />
        <circle cx="90" cy="18" r="2" fill="#060e17" stroke="#d4af37" strokeWidth="1.2" />
        <circle cx="110" cy="18" r="2" fill="#060e17" stroke="#d4af37" strokeWidth="1.2" />
        <circle cx="130" cy="18" r="2" fill="#060e17" stroke="#d4af37" strokeWidth="1.2" />
        <path d="M25 18C25 24 20 28 15 32" stroke="#f472b6" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="15" cy="32" r="2" fill="#f472b6" />
        <path d="M125 18C130 10 142 6 150 4" stroke="#0284c7" strokeWidth="1.5" strokeLinecap="round" />
        <ellipse cx="150" cy="4" rx="4" ry="2.5" transform="rotate(-15 150 4)" fill="#0284c7" opacity="0.6" stroke="#fbbf24" strokeWidth="1" />
      </svg>
    </div>
  );
}

export function PeacockFeatherIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="peacock-sway">
      <path d="M16 28C16 18 20 10 26 4" stroke="#0284c7" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M16 28C14 20 10 14 6 8" stroke="#10b981" strokeWidth="1.4" strokeLinecap="round" />
      <ellipse cx="24" cy="7" rx="6" ry="4.5" transform="rotate(-20 24 7)" fill="rgba(2, 132, 199, 0.4)" stroke="#d4af37" strokeWidth="1.5" />
      <circle cx="24" cy="7" r="2.5" fill="#f59e0b" />
      <circle cx="24" cy="7" r="1.2" fill="#0369a1" />
    </svg>
  );
}

export function LotusIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="lotus-float">
      <path d="M12 3C13.5 7.5 17 9.5 17 14C17 17.5 14.5 20 12 20C9.5 20 7 17.5 7 14C7 9.5 10.5 7.5 12 3Z" fill="rgba(244, 114, 182, 0.35)" stroke="#f472b6" strokeWidth="1.2" />
      <path d="M12 20C15 20 20 17 21 13C21 10 18 9 15 11C13.5 12 12.5 14 12 20Z" fill="rgba(244, 114, 182, 0.2)" stroke="#f472b6" strokeWidth="1" />
      <path d="M12 20C9 20 4 17 3 13C3 10 6 9 9 11C10.5 12 11.5 14 12 20Z" fill="rgba(244, 114, 182, 0.2)" stroke="#f472b6" strokeWidth="1" />
    </svg>
  );
}

export function MenuIcon({ open = false, size = 20 }: { open?: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {open ? (
        <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      ) : (
        <path d="M4 8H20M4 16H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      )}
    </svg>
  );
}

export function SearchIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
      <path d="M20 20L16 16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function HeartIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        fill="rgba(244, 114, 182, 0.25)"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CalendarIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="4" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M16 2V6M8 2V6M3 10H21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function ClockIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 7V12L15 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChevronRight({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SendIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MessageCircleIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function XIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PlusIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function TrashIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 6H21M19 6L18.1 19.3A2 2 0 0 1 16.1 21H7.9A2 2 0 0 1 5.9 19.3L5 6M8 6V4A2 2 0 0 1 10 2H14A2 2 0 0 1 16 4V6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
