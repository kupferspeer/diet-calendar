import React, { useState } from 'react';
import { UserProfile, WeightEntry, DaysMap } from '../types';

// Cumulative offset in days from firstTrackedDay for the next check-in.
// Check-ins 1–3: day 60 / 120 / 180  (every 2 months)
// Check-ins 4+:  day 360 / 540 / …   (every 6 months)
function nextCheckInOffset(doneCount: number): number {
  if (doneCount < 3) return (doneCount + 1) * 60;
  return (doneCount - 1) * 180;
}

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

function shortDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('de-DE', { month: 'short', year: '2-digit' });
}

function addDays(dateStr: string, days: number) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function calorieHint(lossKg: number, periodDays: number): { msg: string; color: string } | null {
  const expected = (0.5 / 7) * periodDays;
  if (lossKg < expected * 0.5) return { msg: 'Kalorienziel um 200 kcal/Tag senken', color: '#E8453C' };
  if (lossKg < expected * 0.75) return { msg: 'Kalorienziel um 100 kcal/Tag senken', color: '#fbbf24' };
  if (lossKg > expected * 1.4) return { msg: 'Kalorienziel um 100 kcal/Tag erhöhen — Abnahme zu schnell', color: '#fbbf24' };
  return null;
}

export function isCheckInDue(profile: UserProfile, firstTrackedDay: string): boolean {
  const doneCount = profile.weightEntries.length;
  const nextCheckIn = addDays(firstTrackedDay, nextCheckInOffset(doneCount));
  return daysBetween(todayStr(), nextCheckIn) <= 0;
}

// ── Styles ────────────────────────────────────────────────────────────────────

const card: React.CSSProperties = {
  background: 'var(--card-bg)',
  border: '1px solid var(--card-border)',
  borderRadius: '14px',
  padding: '16px',
  marginBottom: '12px',
};

const labelStyle: React.CSSProperties = {
  fontSize: '11px',
  color: 'var(--text-faint)',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  marginBottom: '12px',
};

const inputStyle: React.CSSProperties = {
  background: 'var(--input-bg)',
  border: '1px solid var(--input-border)',
  borderRadius: '8px',
  padding: '10px 12px',
  color: 'var(--text-primary)',
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
  background: 'var(--btn-ghost-bg)',
  border: '1px solid var(--btn-border)',
  borderRadius: '10px',
  padding: '10px 16px',
  color: 'var(--text-secondary)',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: "'DM Sans', sans-serif",
};

// ── Chart ─────────────────────────────────────────────────────────────────────

interface ChartEntry { date: string; weight: number; }

function ColorBox({ color, sym }: { color: string; sym: string }) {
  return (
    <div style={{
      width: '22px', height: '22px', borderRadius: '6px',
      background: color, display: 'flex', alignItems: 'center',
      justifyContent: 'center', color: '#fff', fontSize: '13px',
      fontWeight: 600, flexShrink: 0,
    }}>
      {sym}
    </div>
  );
}

function WeightChart({ entries, startWeight, masked }: { entries: ChartEntry[]; startWeight: number; masked: boolean }) {
  if (entries.length < 2) return null;

  const VW = 300;
  const VH = 130;
  const PAD = { top: 22, right: 12, bottom: 22, left: 12 };
  const iW = VW - PAD.left - PAD.right;
  const iH = VH - PAD.top - PAD.bottom;

  const startT = new Date(entries[0].date).getTime();
  const lastT = new Date(entries[entries.length - 1].date).getTime();
  const tRange = lastT - startT || 1;

  const expectedAt = (dateStr: string) => {
    const days = (new Date(dateStr).getTime() - startT) / 86400000;
    return startWeight - (0.5 / 7) * days;
  };

  const expWeights = entries.map(e => expectedAt(e.date));
  const allW = [...entries.map(e => e.weight), ...expWeights];
  const minW = Math.min(...allW) - 0.8;
  const maxW = Math.max(...allW) + 0.8;
  const wRange = maxW - minW || 1;

  const toX = (dateStr: string) =>
    PAD.left + ((new Date(dateStr).getTime() - startT) / tRange) * iW;

  const toY = (w: number) => PAD.top + ((maxW - w) / wRange) * iH;

  const pts = entries.map(e => ({ x: toX(e.date), y: toY(e.weight), ...e }));
  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  const expPath = entries.map((e, i) => {
    const x = toX(e.date);
    const y = toY(expectedAt(e.date));
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  const showLabel = (i: number) =>
    i === 0 || i === pts.length - 1 || pts.length <= 4;

  return (
    <div>
      <svg viewBox={`0 0 ${VW} ${VH}`} style={{ width: '100%', display: 'block' }}>
        {[0.25, 0.5, 0.75].map(f => (
          <line key={f}
            x1={PAD.left} y1={PAD.top + f * iH}
            x2={PAD.left + iW} y2={PAD.top + f * iH}
            style={{ stroke: 'var(--chart-grid)' }} strokeWidth="1" />
        ))}
        <path d={expPath} fill="none" stroke="#2ECC71"
          strokeWidth="1.2" strokeDasharray="5 3" opacity="0.55" />
        <path d={pathD} fill="none" stroke="#3B82F6"
          strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, i) => (
          <g key={p.date}>
            {!masked && (
              <text x={p.x} y={p.y - 9} textAnchor="middle"
                fontSize="8" style={{ fill: 'var(--text-primary)' }}
                fontFamily="DM Sans, sans-serif" fontWeight="600">
                {p.weight.toFixed(1)}
              </text>
            )}
            <circle cx={p.x} cy={p.y} r="4.5" fill="#3B82F6" stroke="var(--bg-deep)" strokeWidth="2" />
            {showLabel(i) && (
              <text x={p.x} y={VH - 3}
                textAnchor={i === 0 ? 'start' : i === pts.length - 1 ? 'end' : 'middle'}
                fontSize="7.5" style={{ fill: 'var(--text-faint)' }}
                fontFamily="DM Sans, sans-serif">
                {shortDate(p.date)}
              </text>
            )}
          </g>
        ))}
      </svg>
      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '6px' }}>
        <ChartLegend color="#3B82F6" label="Ist" dashed={false} />
        <ChartLegend color="#2ECC71" label="Soll (−0,5 kg/Wo.)" dashed={true} />
      </div>
    </div>
  );
}

function ChartLegend({ color, label, dashed }: { color: string; label: string; dashed: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', color: 'var(--text-muted)' }}>
      <svg width="18" height="6" style={{ flexShrink: 0 }}>
        <line x1="0" y1="3" x2="18" y2="3" stroke={color} strokeWidth="2"
          strokeDasharray={dashed ? '4 2' : undefined} />
      </svg>
      {label}
    </div>
  );
}

// ── Helper sub-components ─────────────────────────────────────────────────────

function Overlay({ children, onClose, masked, onToggleMask }: {
  children: React.ReactNode;
  onClose: () => void;
  masked: boolean;
  onToggleMask: () => void;
}) {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'var(--bg-page)',
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
            color: 'var(--text-primary)',
            letterSpacing: '-0.3px',
          }}>
            Gewichtsprofil
          </h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={onToggleMask}
              title={masked ? 'Werte anzeigen' : 'Werte verstecken'}
              style={{
                ...btnGhost,
                padding: '8px 12px',
                fontSize: '17px',
                opacity: masked ? 0.5 : 1,
              }}>
              🔑
            </button>
            <button onClick={onClose} style={{ ...btnGhost, padding: '8px 14px' }}>
              Schließen
            </button>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label: l, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>{l}</div>
      {children}
    </div>
  );
}

function MiniStat({ label: l, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 'clamp(14px, 4vw, 18px)', fontWeight: 700, color, lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{l}</div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  profile: UserProfile | null;
  firstTrackedDay: string;
  days: DaysMap;
  onClose: () => void;
  onSave: (profile: UserProfile) => void;
  onReset: () => void;
}

export function WeightStats({ profile, firstTrackedDay, days, onClose, onSave, onReset }: Props) {
  const today = todayStr();

  const [sWeight, setSWeight] = useState('');
  const [sCal, setSCal] = useState('2300');

  const [showAdd, setShowAdd] = useState(false);
  const [eWeight, setEWeight] = useState('');
  const [eDate, setEDate] = useState(today);

  const [editCal, setEditCal] = useState(false);
  const [newCal, setNewCal] = useState('');

  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editWeight, setEditWeight] = useState('');
  const [editDate, setEditDate] = useState('');

  const [masked, setMasked] = useState(true);
  const hide = (val: string) => masked ? '●●●' : val;

  const handleSetup = () => {
    const w = parseFloat(sWeight.replace(',', '.'));
    const c = parseInt(sCal, 10);
    if (isNaN(w) || w <= 0 || isNaN(c) || c <= 0) return;
    onSave({ startWeight: w, targetCalories: c, weightEntries: [] });
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

  const handleEditSave = (idx: number) => {
    if (!profile) return;
    const w = parseFloat(editWeight.replace(',', '.'));
    if (isNaN(w) || w <= 0 || !editDate) return;
    const updated = profile.weightEntries
      .map((e, i) => i === idx ? { date: editDate, weight: w } : e)
      .sort((a, b) => a.date.localeCompare(b.date));
    onSave({ ...profile, weightEntries: updated });
    setEditingIdx(null);
  };

  const handleSaveCal = () => {
    if (!profile) return;
    const c = parseInt(newCal, 10);
    if (isNaN(c) || c <= 0) return;
    onSave({ ...profile, targetCalories: c });
    setEditCal(false);
  };

  // ── Setup screen ─────────────────────────────────────────────────────────────
  if (!profile) {
    return (
      <Overlay onClose={onClose} masked={false} onToggleMask={() => {}}>
        <div style={card}>
          <div style={labelStyle}>Profil einrichten</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Erfasst seit: <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{fmt(firstTrackedDay)}</span>
            </div>
            <Field label="Startgewicht (kg)">
              <input type="number" step="0.1" min="30" max="300" placeholder="z.B. 92.5"
                value={sWeight} onChange={e => setSWeight(e.target.value)} style={inputStyle} />
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

  // ── Stats screen ──────────────────────────────────────────────────────────────
  const allVals = Object.values(days);
  const calOver  = allVals.filter(v => v === 'over').length;
  const calHit   = allVals.filter(v => v === 'hit').length;
  const calUnder = allVals.filter(v => v === 'under').length;
  const calTotal = calOver + calHit + calUnder;
  const calTotalDays = firstTrackedDay
    ? Math.max(1, Math.floor((Date.now() - new Date(firstTrackedDay).getTime()) / 86400000) + 1)
    : 0;
  const idealKg  = calTotalDays * 500 / 7700;
  const actualKg = (calHit + calUnder) * 500 / 7700;

  const allEntries = [
    { date: firstTrackedDay, weight: profile.startWeight },
    ...profile.weightEntries,
  ];
  const latest = allEntries[allEntries.length - 1];
  const totalLoss = profile.startWeight - latest.weight;
  const doneCount = profile.weightEntries.length;

  const nextCheckIn = addDays(firstTrackedDay, nextCheckInOffset(doneCount));
  const daysToCheckIn = daysBetween(today, nextCheckIn);
  const overdue = daysToCheckIn <= 0;

  const scheduleHint = doneCount < 3
    ? `Check-in ${doneCount + 1} von 3 · danach alle 6 Monate`
    : 'Routine · alle 6 Monate';

  const totalDays = daysBetween(firstTrackedDay, today);
  let hint: { msg: string; color: string } | null = null;
  if (allEntries.length >= 2 && totalDays >= 60) {
    hint = calorieHint(totalLoss, totalDays);
  }

  return (
    <Overlay onClose={onClose} masked={masked} onToggleMask={() => setMasked(m => !m)}>

      {/* Overview */}
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '12px' }}>
          <div style={{ ...labelStyle, marginBottom: 0 }}>Übersicht</div>
          <div style={{ fontSize: '11px', color: 'var(--text-veryfaint)' }}>seit {fmt(firstTrackedDay)}</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: allEntries.length >= 2 ? '16px' : 0 }}>
          <MiniStat label="Start" value={hide(`${profile.startWeight.toFixed(1)} kg`)} color="var(--text-secondary)" />
          <MiniStat label="Aktuell" value={hide(`${latest.weight.toFixed(1)} kg`)} color="var(--text-primary)" />
          <MiniStat
            label="Abgenommen"
            value={hide(totalLoss >= 0 ? `−${totalLoss.toFixed(1)} kg` : `+${Math.abs(totalLoss).toFixed(1)} kg`)}
            color={totalLoss > 0 ? '#2ECC71' : '#E8453C'}
          />
        </div>
        <WeightChart entries={allEntries} startWeight={profile.startWeight} masked={masked} />
        {hint && (
          <div style={{
            marginTop: '12px',
            padding: '8px 12px',
            background: 'var(--surface-subtle)',
            borderRadius: '8px',
            fontSize: '13px',
            color: hint.color,
          }}>
            {hint.msg}
          </div>
        )}
      </div>

      {/* Possible weight loss */}
      {calTotal > 0 && (
        <div style={{
          ...card,
          background: 'rgba(46, 204, 113, 0.05)',
          border: '1px solid rgba(46, 204, 113, 0.15)',
        }}>
          <div style={labelStyle}>Möglicher Gewichtsverlust</div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
              <ColorBox color="#2ECC71" sym="○" />
              <div>
                <div style={{ fontSize: 'clamp(16px, 4.5vw, 20px)', fontWeight: 700, color: '#2ECC71', lineHeight: 1 }}>
                  −{idealKg.toFixed(1)} kg
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-faint)', marginTop: '2px' }}>ideal</div>
              </div>
            </div>
            <div style={{ color: 'var(--text-faint)', fontSize: '16px', fontWeight: 600 }}>−</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
              <ColorBox color="#E8453C" sym="−" />
              <div>
                <div style={{ fontSize: 'clamp(16px, 4.5vw, 20px)', fontWeight: 700, color: '#3B82F6', lineHeight: 1 }}>
                  −{actualKg.toFixed(1)} kg
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-faint)', marginTop: '2px' }}>tatsächlich</div>
              </div>
            </div>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-veryfaint)', marginTop: '10px' }}>
            {calTotalDays} Tage seit Start · {calOver} Überschreitungen abgezogen
          </div>
        </div>
      )}

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
            <span style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {hide(String(profile.targetCalories))}
              <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 400, marginLeft: '6px' }}>{masked ? '' : 'kcal/Tag'}</span>
            </span>
            <button style={{ ...btnGhost, padding: '6px 12px', fontSize: '12px' }}
              onClick={() => { setNewCal(String(profile.targetCalories)); setEditCal(true); }}>
              Anpassen
            </button>
          </div>
        )}
      </div>

      {/* Next check-in */}
      <div style={{
        ...card,
        borderColor: overdue ? 'rgba(250, 204, 21, 0.3)' : 'var(--card-border)',
      }}>
        <div style={labelStyle}>Nächster Check-in</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ color: 'var(--text-primary)', fontSize: '16px', fontWeight: 600 }}>{fmt(nextCheckIn)}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '3px' }}>
              {overdue
                ? `${Math.abs(daysToCheckIn)} Tag${Math.abs(daysToCheckIn) !== 1 ? 'e' : ''} überfällig`
                : `in ${daysToCheckIn} Tagen`}
            </div>
            <div style={{ color: 'var(--text-veryfaint)', fontSize: '11px', marginTop: '4px' }}>{scheduleHint}</div>
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
            <Field label="Datum (frei wählbar)">
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
          <div style={{ maxHeight: '220px', overflowY: 'auto', marginRight: '-4px', paddingRight: '4px' }}>
            {[...allEntries].reverse().map((entry, i, arr) => {
              const older = arr[i + 1];
              const change = older ? older.weight - entry.weight : null;
              const isStart = i === arr.length - 1;
              const entryIdx = profile.weightEntries.length - 1 - i;
              const isEditing = !isStart && editingIdx === entryIdx;

              if (isEditing) {
                return (
                  <div key={entry.date} style={{ padding: '8px 0', borderBottom: '1px solid var(--card-border)' }}>
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
                      <input type="number" step="0.1" min="30" max="300"
                        value={editWeight} onChange={e => setEditWeight(e.target.value)}
                        style={{ ...inputStyle, flex: 1, minWidth: 0, width: 'auto', padding: '8px 10px' }} />
                      <input type="date" value={editDate} max={today}
                        onChange={e => setEditDate(e.target.value)}
                        style={{ ...inputStyle, flex: 1, minWidth: 0, width: 'auto', padding: '8px 10px' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => handleEditSave(entryIdx)}
                        style={{ ...btnGhost, flex: 1, textAlign: 'center', color: '#2ECC71', borderColor: 'rgba(46,204,113,0.3)' }}>
                        ✓ Speichern
                      </button>
                      <button onClick={() => setEditingIdx(null)}
                        style={{ ...btnGhost, flex: 1, textAlign: 'center' }}>
                        Abbrechen
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div key={entry.date} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 0',
                  borderBottom: isStart ? 'none' : '1px solid var(--card-border)',
                }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {fmt(entry.date)}{isStart ? ' · Start' : ''}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {change !== null && !masked && (
                      <span style={{ fontSize: '12px', color: change > 0 ? '#2ECC71' : '#E8453C' }}>
                        {change > 0 ? `−${change.toFixed(1)}` : `+${Math.abs(change).toFixed(1)}`} kg
                      </span>
                    )}
                    <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {hide(`${entry.weight.toFixed(1)} kg`)}
                    </span>
                    {!isStart && (
                      <>
                        <button
                          onClick={() => { setEditingIdx(entryIdx); setEditWeight(String(entry.weight)); setEditDate(entry.date); }}
                          style={{ background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', fontSize: '15px', padding: '4px', lineHeight: 1 }}
                          title="Bearbeiten">
                          ✏
                        </button>
                        <button
                          onClick={() => onSave({ ...profile, weightEntries: profile.weightEntries.filter((_, idx) => idx !== entryIdx) })}
                          style={{ background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', fontSize: '14px', padding: '4px', lineHeight: 1 }}
                          title="Löschen">
                          ✕
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Reset */}
      <button
        onClick={() => { if (window.confirm('Gewichtsprofil wirklich löschen?')) onReset(); }}
        style={{ ...btnGhost, width: '100%', textAlign: 'center', color: '#E8453C', borderColor: 'rgba(232,69,60,0.2)', marginTop: '4px' }}
      >
        Gewichtsprofil zurücksetzen
      </button>
    </Overlay>
  );
}
