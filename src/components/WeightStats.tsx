import React, { useState } from 'react';
import { UserProfile, WeightEntry } from '../types';

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

// ── Chart ─────────────────────────────────────────────────────────────────────

interface ChartEntry { date: string; weight: number; }

function WeightChart({ entries, startWeight }: { entries: ChartEntry[]; startWeight: number }) {
  if (entries.length < 2) return null;

  const VW = 300;
  const VH = 130;
  const PAD = { top: 22, right: 12, bottom: 22, left: 12 };
  const iW = VW - PAD.left - PAD.right;
  const iH = VH - PAD.top - PAD.bottom;

  const startT = new Date(entries[0].date).getTime();
  const lastT = new Date(entries[entries.length - 1].date).getTime();
  const tRange = lastT - startT || 1;

  // Expected weight (−0.5 kg/week)
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

  // Higher weight = top of chart (y small), lower weight = bottom (y large)
  const toY = (w: number) => PAD.top + ((maxW - w) / wRange) * iH;

  const pts = entries.map(e => ({ x: toX(e.date), y: toY(e.weight), ...e }));
  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  // Expected line (dashed)
  const expPath = entries.map((e, i) => {
    const x = toX(e.date);
    const y = toY(expectedAt(e.date));
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  // Show date labels only at first + last (+ middle if ≤ 4 entries)
  const showLabel = (i: number) =>
    i === 0 || i === pts.length - 1 || pts.length <= 4;

  return (
    <div>
      <svg viewBox={`0 0 ${VW} ${VH}`} style={{ width: '100%', display: 'block' }}>
        {/* Grid lines (subtle) */}
        {[0.25, 0.5, 0.75].map(f => (
          <line key={f}
            x1={PAD.left} y1={PAD.top + f * iH}
            x2={PAD.left + iW} y2={PAD.top + f * iH}
            stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        ))}

        {/* Expected trajectory */}
        <path d={expPath} fill="none" stroke="#2ECC71"
          strokeWidth="1.2" strokeDasharray="5 3" opacity="0.55" />

        {/* Actual line */}
        <path d={pathD} fill="none" stroke="#3B82F6"
          strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Dots + labels */}
        {pts.map((p, i) => (
          <g key={p.date}>
            {/* Weight label above dot */}
            <text x={p.x} y={p.y - 9} textAnchor="middle"
              fontSize="8" fill="#e2e8f0" fontFamily="DM Sans, sans-serif" fontWeight="600">
              {p.weight.toFixed(1)}
            </text>
            {/* Dot */}
            <circle cx={p.x} cy={p.y} r="4.5" fill="#3B82F6" stroke="#1e293b" strokeWidth="2" />
            {/* Date label below chart */}
            {showLabel(i) && (
              <text x={p.x} y={VH - 3} textAnchor={i === 0 ? 'start' : i === pts.length - 1 ? 'end' : 'middle'}
                fontSize="7.5" fill="#475569" fontFamily="DM Sans, sans-serif">
                {shortDate(p.date)}
              </text>
            )}
          </g>
        ))}
      </svg>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '6px' }}>
        <ChartLegend color="#3B82F6" label="Ist" dashed={false} />
        <ChartLegend color="#2ECC71" label="Soll (−0,5 kg/Wo.)" dashed={true} />
      </div>
    </div>
  );
}

function ChartLegend({ color, label, dashed }: { color: string; label: string; dashed: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', color: '#64748b' }}>
      <svg width="18" height="6" style={{ flexShrink: 0 }}>
        <line x1="0" y1="3" x2="18" y2="3" stroke={color} strokeWidth="2"
          strokeDasharray={dashed ? '4 2' : undefined} />
      </svg>
      {label}
    </div>
  );
}

// ── Helper sub-components ─────────────────────────────────────────────────────

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
  firstTrackedDay: string;
  onClose: () => void;
  onSave: (profile: UserProfile) => void;
  onReset: () => void;
}

export function WeightStats({ profile, firstTrackedDay, onClose, onSave, onReset }: Props) {
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
      <Overlay onClose={onClose}>
        <div style={card}>
          <div style={labelStyle}>Profil einrichten</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              Erfasst seit: <span style={{ color: '#94a3b8', fontWeight: 600 }}>{fmt(firstTrackedDay)}</span>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '12px' }}>
          <div style={{ ...labelStyle, marginBottom: 0 }}>Übersicht</div>
          <div style={{ fontSize: '11px', color: '#334155' }}>seit {fmt(firstTrackedDay)}</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: allEntries.length >= 2 ? '16px' : 0 }}>
          <MiniStat label="Start" value={`${profile.startWeight.toFixed(1)} kg`} color="#94a3b8" />
          <MiniStat label="Aktuell" value={`${latest.weight.toFixed(1)} kg`} color="#f1f5f9" />
          <MiniStat
            label="Abgenommen"
            value={totalLoss >= 0 ? `−${totalLoss.toFixed(1)} kg` : `+${Math.abs(totalLoss).toFixed(1)} kg`}
            color={totalLoss > 0 ? '#2ECC71' : '#E8453C'}
          />
        </div>
        <WeightChart entries={allEntries} startWeight={profile.startWeight} />
        {hint && (
          <div style={{
            marginTop: '12px',
            padding: '8px 12px',
            background: 'rgba(255,255,255,0.04)',
            borderRadius: '8px',
            fontSize: '13px',
            color: hint.color,
          }}>
            {hint.msg}
          </div>
        )}
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
            <div style={{ color: '#334155', fontSize: '11px', marginTop: '4px' }}>{scheduleHint}</div>
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
                  <div key={entry.date} style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
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
                  borderBottom: isStart ? 'none' : '1px solid rgba(255,255,255,0.05)',
                }}>
                  <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                    {fmt(entry.date)}{isStart ? ' · Start' : ''}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {change !== null && (
                      <span style={{ fontSize: '12px', color: change > 0 ? '#2ECC71' : '#E8453C' }}>
                        {change > 0 ? `−${change.toFixed(1)}` : `+${Math.abs(change).toFixed(1)}`} kg
                      </span>
                    )}
                    <span style={{ fontSize: '15px', fontWeight: 600, color: '#f1f5f9' }}>
                      {entry.weight.toFixed(1)} kg
                    </span>
                    {!isStart && (
                      <>
                        <button
                          onClick={() => { setEditingIdx(entryIdx); setEditWeight(String(entry.weight)); setEditDate(entry.date); }}
                          style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: '15px', padding: '4px', lineHeight: 1 }}
                          title="Bearbeiten">
                          ✏
                        </button>
                        <button
                          onClick={() => onSave({ ...profile, weightEntries: profile.weightEntries.filter((_, idx) => idx !== entryIdx) })}
                          style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: '14px', padding: '4px', lineHeight: 1 }}
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
        onClick={() => { if (window.confirm('Profil wirklich löschen?')) onReset(); }}
        style={{ ...btnGhost, width: '100%', textAlign: 'center', color: '#E8453C', borderColor: 'rgba(232,69,60,0.2)', marginTop: '4px' }}
      >
        Profil zurücksetzen
      </button>
    </Overlay>
  );
}
