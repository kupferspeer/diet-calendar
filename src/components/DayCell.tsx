
import { DayStatus } from '../types';

interface Props {
  day: number;
  dateStr: string;
  status: DayStatus | undefined;
  isToday: boolean;
  isFuture: boolean;
  onClick: (dateStr: string) => void;
}

const CFG = {
  over:  { bg: '#E8453C', symbol: '−' },
  hit:   { bg: '#2ECC71', symbol: '○' },
  under: { bg: '#3B82F6', symbol: '+' },
};

export function DayCell({ day, dateStr, status, isToday, isFuture, onClick }: Props) {
  const cfg = status ? CFG[status] : null;

  return (
    <div
      role="button"
      aria-label={`${dateStr}${status ? ` – ${status}` : ''}`}
      onClick={() => !isFuture && onClick(dateStr)}
      style={{
        aspectRatio: '1',
        borderRadius: '10px',
        background: cfg ? cfg.bg : 'rgba(255,255,255,0.04)',
        border: `2px solid ${isToday ? '#facc15' : 'transparent'}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: isFuture ? 'default' : 'pointer',
        opacity: isFuture ? 0.35 : 1,
        transition: 'transform 0.08s ease, opacity 0.1s',
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
        gap: '1px',
      }}
      onMouseDown={(e) => { if (!isFuture) (e.currentTarget as HTMLElement).style.transform = 'scale(0.93)'; }}
      onMouseUp={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
    >
      <span style={{
        fontSize: 'clamp(11px, 2.8vw, 14px)',
        color: cfg ? '#fff' : '#94a3b8',
        fontWeight: isToday ? 700 : 500,
        lineHeight: 1,
      }}>
        {day}
      </span>
      {cfg && (
        <span style={{
          fontSize: 'clamp(11px, 2.8vw, 15px)',
          color: '#fff',
          lineHeight: 1,
          fontWeight: 600,
        }}>
          {cfg.symbol}
        </span>
      )}
    </div>
  );
}
