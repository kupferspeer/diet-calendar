import React, { useState } from 'react';
import { UserProfile, WeightEntry } from '../types';

const CHECK_IN_DAYS = 60;

function todayStr() {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
}

function daysBetween(a: string, b: string) {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}

function fmt(d: string) {
  const [y, m, dd] = d.split('-');
  return `${dd}.${m}.${y}`;
}

function addDays(dateStr: string, days: number) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function calorieHint(lossKg: number, periodDays: number): { msg: string; color: string } | null {
  const expected = (4 / 60) * periodDays;
  if (lossKg < expected * 0.5) return { msg: '−200 kcal/Tag empfohlen', color: '#E8453C' };
  if (lossKg < expected * 0.75) return { msg: '−100 kcal/Tag empfohlen', color: '#fbbf24' };
  if (lossKg > expected * 1.3) return { msg: '+100 kcal/Tag (zu schnell — ggf. erhöhen)', color: '#fbbf24' };
  return null;
}

export function isCheckInDue(profile: UserProfile): boolean {
  const last = profile.weightEntries.length > 0
    ? profile.weightEntries[profile.weightEntries.length - 1].date
    : profile.startDate;
  return daysBetween(last, todayStr()) >= CHECK_IN_DAYS;
}

// ── Styles ────────────────────────────────────────────────────────────────────

const card: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '14px',
  padding: '16px',
  marginBottom: '12px',
};

const labelStyle: React.CSSProperties = {
  fontSize: '11px',
  color: '#475569',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  marginBottom: '12px',
};

const inputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '8px',
  padding: '10px 12px',
  color: '#f1f5f9',
  fontSize: '16px',
  width: '100%',
  boxSizing: 'border-box',
  fontFamily: "'DM Sans', sans-serif",
  outline: 'none',
};

const btnPrimary: React.CSSProperties = {
  background: '#3B82F6',
  border: 'none',
  borderRadius: '10px',
  padding: '12px',
  color: '#fff',
  fontSize: '15px',
  fontWeight: 600,
  cursor: 'pointer',
  width: '100%',
  fontFamily: "'DM Sans', sans-serif",
};

const btnGhost: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '10px',
  padding: '10px 16px',
  color: '#94a3b8',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: "'DM Sans', sans-serif",
};

// ── Sub-components ────────────────────────────────────────────────────────────

function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      zIndex: 1000,
      overflowY: 'auto',
      padding: '20px 16px',
      paddingTop: 'max(env(safe-area-inset-top), 20px)',
      paddingBottom: 'max(env(safe-area-inset-bottom), 32px)',
      boxSizing: 'border-box',
    }}>
      <div style={{ maxWidth: '480px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{
            margin: 0,
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(20px, 5vw, 26px)',
            color: '#f1f5f9',
            letterSpacing: '-0.3px',
          }}>
            Gewichtsprofil
          </h2>
          <button onClick={onClose} style={{ ...btnGhost, padding: '8px 14px' }}>
            Schließen
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label: l, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>{l}</div>
      {children}
    </div>
  );
}

function MiniStat({ label: l, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 'clamp(14px, 4vw, 18px)', fontWeight: 700, color, lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>{l}</div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  profile: UserProfile | null;
  onClose: () => void;
  onSave: (profile: UserProfile) => void;
}

export function WeightStats({ profile, onClose, onSave }: Props) {
  const today = todayStr();

  const [sWeight, setSWeight] = useState('');
  const [sDate, setSDate] = useState(today);
  const [sCal, setSCal] = useState('2300');

  const [showAdd, setShowAdd] = useState(false);
  const [eWeight, setEWeight] = useState('');
  const [eDate, setEDate] = useState(today);

  const [editCal, setEditCal] = useState(false);
  const [newCal, setNewCal] = useState('');

  const handleSetup = () => {
    const w = parseFloat(sWeight.replace(',', '.'));
    const c = parseInt(sCal, 10);
    if (isNaN(w) || w <= 0 || !sDate || isNaN(c) || c <= 0) return;
    onSave({ startWeight: w, startDate: sDate, targetCalories: c, weightEntries: [] });
  };

  const handleAddEntry = () => {
    if (!profile) return;
    const w = parseFloat(eWeight.replace(',', '.'));
    if (isNaN(w) || w <= 0 || !eDate) return;
    const entry: WeightEntry = { date: eDate, weight: w };
    const entries = [...profile.weightEntries, entry].sort((a, b) => a.date.localeCompare(b.date));
    onSave({ ...profile, weightEntries: entries });
    setShowAdd(false);
    setEWeight('');
    setEDate(today);
  };

  const handleSaveCal = () => {
    if (!profile) return;
    const c = parseInt(newCal, 10);
    if (isNaN(c) || c <= 0) return;
    onSave({ ...profile, targetCalories: c });
    setEditCal(false);
  };

  // ── Setup screen ────────────────────────────────────────────────────────────
  if (!profile) {
    return (
      <Overlay onClose={onClose}>
        <div style={card}>
          <div style={labelStyle}>Profil einrichten</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Field label="Startgewicht (kg)">
              <input type="number" step="0.1" min="30" max="300" placeholder="z.B. 92.5"
                value={sWeight} onChange={e => setSWeight(e.target.value)}
                style={inputStyle} />
            </Field>
            <Field label="Seit wann?">
              <input type="date" value={sDate} max={today}
                onChange={e => setSDate(e.target.value)} style={inputStyle} />
            </Field>
            <Field label="Tägliches Kalorienziel (kcal)">
              <input type="number" step="50" min="1000" max="5000"
                value={sCal} onChange={e => setSCal(e.target.value)} style={inputStyle} />
            </Field>
            <button style={btnPrimary} onClick={handleSetup}>Speichern</button>
          </div>
        </div>
      </Overlay>
    );
  }

  // ── Stats screen ────────────────────────────────────────────────────────────
  const allEntries = [
    { date: profile.startDate, weight: profile.startWeight },
    ...profile.weightEntries,
  ];
  const latest = allEntries[allEntries.length - 1];
  const totalLoss = profile.startWeight - latest.weight;

  const lastCheckInDate = allEntries[allEntries.length - 1].date;
  const nextCheckIn = addDays(lastCheckInDate, CHECK_IN_DAYS);
  const daysToCheckIn = daysBetween(today, nextCheckIn);
  const overdue = daysToCheckIn <= 0;

  let hint: { msg: string; color: string } | null = null;
  if (allEntries.length >= 2) {
    const prev = allEntries[allEntries.length - 2];
    const curr = allEntries[allEntries.length - 1];
    hint = calorieHint(prev.weight - curr.weight, daysBetween(prev.date, curr.date));
  }

  return (
    <Overlay onClose={onClose}>

      {/* Overview */}
      <div style={card}>
        <div style={labelStyle}>Übersicht</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          <MiniStat label="Start" value={`${profile.startWeight.toFixed(1)} kg`} color="#94a3b8" />
          <MiniStat label="Aktuell" value={`${latest.weight.toFixed(1)} kg`} color="#f1f5f9" />
          <MiniStat
            label="Abgenommen"
            value={totalLoss >= 0 ? `−${totalLoss.toFixed(1)} kg` : `+${Math.abs(totalLoss).toFixed(1)} kg`}
            color={totalLoss > 0 ? '#2ECC71' : '#E8453C'}
          />
        </div>
      </div>

      {/* Calorie target */}
      <div style={card}>
        <div style={labelStyle}>Kalorienziel</div>
        {editCal ? (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input type="number" step="50" min="1000" max="5000"
              value={newCal} onChange={e => setNewCal(e.target.value)}
              style={{ ...inputStyle, flex: 1 }} autoFocus />
            <button style={{ ...btnGhost, padding: '10px 14px' }} onClick={handleSaveCal}>OK</button>
            <button style={{ ...btnGhost, padding: '10px 12px' }} onClick={() => setEditCal(false)}>✕</button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '26px', fontWeight: 700, color: '#f1f5f9' }}>
              {profile.targetCalories}
              <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 400, marginLeft: '6px' }}>kcal/Tag</span>
            </span>
            <button style={{ ...btnGhost, padding: '6px 12px', fontSize: '12px' }}
              onClick={() => { setNewCal(String(profile.targetCalories)); setEditCal(true); }}>
              Anpassen
            </button>
          </div>
        )}
        {hint && (
          <div style={{
            marginTop: '10px',
            padding: '8px 12px',
            background: 'rgba(255,255,255,0.04)',
            borderRadius: '8px',
            fontSize: '13px',
            color: hint.color,
          }}>
            Empfehlung nach letztem Check-in: {hint.msg}
          </div>
        )}
      </div>

      {/* Next check-in */}
      <div style={{
        ...card,
        borderColor: overdue ? 'rgba(250, 204, 21, 0.3)' : 'rgba(255,255,255,0.08)',
      }}>
        <div style={labelStyle}>Nächster Check-in</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ color: '#f1f5f9', fontSize: '16px', fontWeight: 600 }}>{fmt(nextCheckIn)}</div>
            <div style={{ color: '#64748b', fontSize: '12px', marginTop: '3px' }}>
              {overdue
                ? `${Math.abs(daysToCheckIn)} Tag${Math.abs(daysToCheckIn) !== 1 ? 'e' : ''} überfällig`
                : `in ${daysToCheckIn} Tagen`}
            </div>
          </div>
          {overdue && (
            <span style={{
              background: 'rgba(250,204,21,0.12)',
              color: '#fbbf24',
              borderRadius: '20px',
              padding: '4px 12px',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.04em',
            }}>
              Fällig
            </span>
          )}
        </div>
      </div>

      {/* Add entry */}
      {showAdd ? (
        <div style={card}>
          <div style={labelStyle}>Gewicht eintragen</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Field label="Gewicht (kg)">
              <input type="number" step="0.1" min="30" max="300" placeholder="z.B. 89.0"
                value={eWeight} onChange={e => setEWeight(e.target.value)}
                style={inputStyle} autoFocus />
            </Field>
            <Field label="Datum">
              <input type="date" value={eDate} max={today}
                onChange={e => setEDate(e.target.value)} style={inputStyle} />
            </Field>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button style={btnPrimary} onClick={handleAddEntry}>Speichern</button>
              <button style={{ ...btnGhost, flexShrink: 0 }} onClick={() => setShowAdd(false)}>Abbrechen</button>
            </div>
          </div>
        </div>
      ) : (
        <button
          style={{ ...btnGhost, width: '100%', marginBottom: '12px', textAlign: 'center' }}
          onClick={() => setShowAdd(true)}
        >
          + Gewicht eintragen
        </button>
      )}

      {/* Timeline */}
      {allEntries.length > 1 && (
        <div style={card}>
          <div style={labelStyle}>Verlauf</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {[...allEntries].reverse().map((entry, i, arr) => {
              const older = arr[i + 1];
              const change = older ? older.weight - entry.weight : null;
              const isLast = i === arr.length - 1;
              return (
                <div key={entry.date} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 0',
                  borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.05)',
                }}>
                  <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                    {fmt(entry.date)}{isLast ? ' (Start)' : ''}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {change !== null && (
                      <span style={{ fontSize: '12px', color: change > 0 ? '#2ECC71' : '#E8453C' }}>
                        {change > 0 ? `−${change.toFixed(1)}` : `+${Math.abs(change).toFixed(1)}`} kg
                      </span>
                    )}
                    <span style={{ fontSize: '15px', fontWeight: 600, color: '#f1f5f9' }}>
                      {entry.weight.toFixed(1)} kg
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Overlay>
  );
}
