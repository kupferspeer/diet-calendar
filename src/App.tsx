import { useState } from 'react';
import { Calendar } from './components/Calendar';
import { Stats } from './components/Stats';
import { SyncStatus } from './components/SyncStatus';
import { useCalendarData } from './hooks/useCalendarData';
import { isFirebaseConfigured } from './firebase';

const now = new Date();
const TODAY = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

export function App() {
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(3); // April
  const { days, sync, toggleDay } = useCalendarData();

  const prevMonth = () => {
    if (month === 0) { setYear((y) => y - 1); setMonth(11); }
    else setMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (month === 11) { setYear((y) => y + 1); setMonth(0); }
    else setMonth((m) => m + 1);
  };

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      padding: 'env(safe-area-inset-top, 20px) 16px env(safe-area-inset-bottom, 24px)',
      paddingTop: 'max(env(safe-area-inset-top), 20px)',
      paddingBottom: 'max(env(safe-area-inset-bottom), 24px)',
    }}>
      <div style={{ maxWidth: '480px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h1 style={{
            margin: 0,
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(22px, 6vw, 32px)',
            color: '#f1f5f9',
            letterSpacing: '-0.3px',
          }}>
            Diät-Kalender
          </h1>
          <SyncStatus sync={sync} />
        </div>

        {/* Firebase not configured banner */}
        {!isFirebaseConfigured && (
          <div style={{
            background: 'rgba(250, 204, 21, 0.1)',
            border: '1px solid rgba(250, 204, 21, 0.25)',
            borderRadius: '10px',
            padding: '10px 14px',
            marginBottom: '20px',
            fontSize: '12px',
            color: '#fbbf24',
            lineHeight: 1.5,
          }}>
            Firebase nicht konfiguriert — Daten werden lokal gespeichert. Siehe README für Setup.
          </div>
        )}

        <Calendar
          year={year}
          month={month}
          days={days}
          today={TODAY}
          onToggle={toggleDay}
          onPrevMonth={prevMonth}
          onNextMonth={nextMonth}
        />

        <Stats days={days} year={year} month={month} />

        {/* Legend */}
        <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            { color: '#E8453C', label: 'Über Ziel', sym: '−' },
            { color: '#2ECC71', label: 'Ziel getroffen', sym: '○' },
            { color: '#3B82F6', label: 'Unter Ziel', sym: '+' },
          ].map(({ color, label, sym }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#94a3b8' }}>
              <div style={{
                width: '22px', height: '22px', borderRadius: '6px',
                background: color, display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: '#fff', fontSize: '13px', fontWeight: 600,
                flexShrink: 0,
              }}>
                {sym}
              </div>
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
