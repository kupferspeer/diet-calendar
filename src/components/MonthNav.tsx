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
  border: '1px solid var(--btn-border)',
  background: 'var(--surface-subtle)',
  color: 'var(--text-primary)',
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
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-subtle)'; }}
        aria-label="Vorheriger Monat"
      >
        ◂
      </button>
      <h2 style={{
        margin: 0,
        fontFamily: "'Playfair Display', serif",
        fontSize: 'clamp(20px, 5.5vw, 28px)',
        color: 'var(--text-primary)',
        letterSpacing: '-0.3px',
      }}>
        {MONTHS[month]} {year}
      </h2>
      <button
        onClick={onNext}
        style={btnStyle}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-subtle)'; }}
        aria-label="Nächster Monat"
      >
        ▸
      </button>
    </div>
  );
}
