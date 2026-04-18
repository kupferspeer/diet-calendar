import React from 'react';

interface Props {
  year: number;
  month: number;
  onPrev: () => void;
  onNext: () => void;
}

const MONTHS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

const btnStyle: React.CSSProperties = {
  width: '44px',
  height: '44px',
  borderRadius: '10px',
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'rgba(255,255,255,0.05)',
  color: '#f1f5f9',
  fontSize: '18px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  transition: 'background 0.15s',
};

export function MonthNav({ year, month, onPrev, onNext }: Props) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
      <button
        onClick={onPrev}
        style={btnStyle}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; }}
        aria-label="Vorheriger Monat"
      >
        ◂
      </button>
      <h2 style={{
        margin: 0,
        fontFamily: "'Playfair Display', serif",
        fontSize: 'clamp(20px, 5.5vw, 28px)',
        color: '#f1f5f9',
        letterSpacing: '-0.3px',
      }}>
        {MONTHS[month]} {year}
      </h2>
      <button
        onClick={onNext}
        style={btnStyle}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; }}
        aria-label="Nächster Monat"
      >
        ▸
      </button>
    </div>
  );
}
