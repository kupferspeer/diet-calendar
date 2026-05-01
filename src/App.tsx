import { useState, useEffect } from 'react';
import { Calendar } from './components/Calendar';
import { Stats } from './components/Stats';
import { SyncStatus } from './components/SyncStatus';
import { CodeEntry } from './components/CodeEntry';
import { WeightStats, isCheckInDue } from './components/WeightStats';
import { useCalendarData } from './hooks/useCalendarData';
import { useProfile } from './hooks/useProfile';
import { isFirebaseConfigured } from './firebase';

const now = new Date();
const TODAY = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
const LS_CODE_KEY = 'diet-calendar-code';
const LS_THEME_KEY = 'diet-calendar-theme';

export function App() {
  const [userCode, setUserCode] = useState<string | null>(() => localStorage.getItem(LS_CODE_KEY));
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [showWeight, setShowWeight] = useState(false);
  const { days, sync, toggleDay } = useCalendarData(userCode);
  const { profile, saveProfile, resetProfile } = useProfile(userCode);
  const firstTrackedDay = Object.keys(days).sort()[0] ?? TODAY;
  const checkInDue = profile ? isCheckInDue(profile, firstTrackedDay) : false;

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const stored = localStorage.getItem(LS_THEME_KEY) as 'light' | 'dark' | null;
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(LS_THEME_KEY, theme);
  }, [theme]);

  if (!userCode) {
    return (
      <CodeEntry onSubmit={(code) => {
        localStorage.setItem(LS_CODE_KEY, code);
        setUserCode(code);
      }} />
    );
  }

  const handleChangeCode = () => {
    localStorage.removeItem(LS_CODE_KEY);
    setUserCode(null);
  };

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
      background: 'var(--bg-page)',
      padding: '20px 16px',
      paddingTop: 'max(env(safe-area-inset-top), 20px)',
      paddingBottom: 'max(env(safe-area-inset-bottom), 24px)',
      boxSizing: 'border-box',
    }}>
      <div style={{ maxWidth: '480px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h1 style={{
            margin: 0,
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(22px, 6vw, 30px)',
            color: 'var(--text-primary)',
            letterSpacing: '-0.3px',
          }}>
            Diät-Kalender
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SyncStatus sync={sync} />
            <button
              onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
              title={theme === 'dark' ? 'Hellmodus' : 'Dunkelmodus'}
              style={{
                background: 'none',
                border: '1px solid var(--btn-border)',
                borderRadius: '8px',
                padding: '6px 10px',
                color: 'var(--text-muted)',
                fontSize: '16px',
                cursor: 'pointer',
                lineHeight: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {theme === 'dark' ? '☀' : '☽'}
            </button>
            <button
              onClick={() => setShowWeight(true)}
              style={{
                position: 'relative',
                background: 'none',
                border: '1px solid var(--btn-border)',
                borderRadius: '8px',
                padding: '6px 10px',
                color: 'var(--text-muted)',
                fontSize: '18px',
                cursor: 'pointer',
                lineHeight: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Gewichtsprofil"
            >
              ⚖
              {checkInDue && (
                <span style={{
                  position: 'absolute',
                  top: '-3px',
                  right: '-3px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#E8453C',
                  border: '2px solid var(--bg-deep)',
                  display: 'block',
                }} />
              )}
            </button>
          </div>
        </div>

        {/* Active code + change button */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          padding: '10px 14px',
          background: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
          borderRadius: '10px',
        }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Code: <span style={{ color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.05em' }}>{userCode}</span>
          </div>
          <button
            onClick={handleChangeCode}
            style={{
              background: 'none',
              border: '1px solid var(--btn-border)',
              borderRadius: '6px',
              padding: '4px 10px',
              fontSize: '11px',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Code ändern
          </button>
        </div>

        {/* Firebase not configured banner */}
        {!isFirebaseConfigured && (
          <div style={{
            background: 'rgba(250, 204, 21, 0.1)',
            border: '1px solid rgba(250, 204, 21, 0.2)',
            borderRadius: '10px',
            padding: '10px 14px',
            marginBottom: '20px',
            fontSize: '12px',
            color: '#fbbf24',
            lineHeight: 1.5,
          }}>
            Firebase nicht konfiguriert — Daten werden lokal gespeichert.
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
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
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

      {showWeight && (
        <WeightStats
          profile={profile}
          firstTrackedDay={firstTrackedDay}
          days={days}
          onClose={() => setShowWeight(false)}
          onSave={saveProfile}
          onReset={resetProfile}
        />
      )}
    </div>
  );
}
