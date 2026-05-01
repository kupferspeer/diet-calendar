import React from 'react';
import { DaysMap } from '../types';

interface Props {
  days: DaysMap;
  year: number;
  month: number;
}

function pad(n: number) { return String(n).padStart(2, '0'); }

const cardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '14px',
  padding: '16px',
};

const labelStyle: React.CSSProperties = {
  fontSize: '11px',
  color: '#475569',
  fontWeight: 600,
  marginBottom: '14px',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
};

export function Stats({ days, year, month }: Props) {
  const prefix = `${year}-${pad(month + 1)}-`;
  const monthVals = Object.entries(days).filter(([k]) => k.startsWith(prefix));
  const mOver  = monthVals.filter(([, v]) => v === 'over').length;
  const mHit   = monthVals.filter(([, v]) => v === 'hit').length;
  const mUnder = monthVals.filter(([, v]) => v === 'under').length;
  const mTotal = monthVals.length;
  const successRate = mTotal > 0 ? Math.round(((mHit + mUnder) / mTotal) * 100) : 0;

  const allVals = Object.values(days);
  const aOver  = allVals.filter(v => v === 'over').length;
  const aHit   = allVals.filter(v => v === 'hit').length;
  const aUnder = allVals.filter(v => v === 'under').length;
  const aTotal = aOver + aHit + aUnder;

  const barOver  = aTotal > 0 ? (aOver  / aTotal) * 100 : 0;
  const barHit   = aTotal > 0 ? (aHit   / aTotal) * 100 : 0;
  const barUnder = aTotal > 0 ? (aUnder / aTotal) * 100 : 0;

  return (
    <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* Monthly card */}
      <div style={cardStyle}>
        <div style={labelStyle}>Dieser Monat</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
          <StatCell value={mOver}  label="Über"      color="#E8453C" />
          <StatCell value={mHit}   label="Getroffen" color="#2ECC71" />
          <StatCell value={mUnder} label="Darunter"  color="#3B82F6" />
          <StatCell value={`${successRate}%`} label="Erfolg" color="#facc15" />
        </div>
      </div>

      {/* Overall progress bar */}
      {aTotal > 0 && (
        <div style={cardStyle}>
          <div style={labelStyle}>Gesamtfortschritt · {aTotal} Tage</div>
          <div style={{
            height: '10px',
            borderRadius: '5px',
            overflow: 'hidden',
            display: 'flex',
            background: 'rgba(255,255,255,0.05)',
          }}>
            {barOver  > 0 && <div style={{ width: `${barOver}%`,  background: '#E8453C', transition: 'width 0.4s ease' }} />}
            {barHit   > 0 && <div style={{ width: `${barHit}%`,   background: '#2ECC71', transition: 'width 0.4s ease' }} />}
            {barUnder > 0 && <div style={{ width: `${barUnder}%`, background: '#3B82F6', transition: 'width 0.4s ease' }} />}
          </div>
          <div style={{ display: 'flex', gap: '14px', marginTop: '10px', flexWrap: 'wrap' }}>
            <Legend color="#E8453C" label={`Über: ${aOver}`} />
            <Legend color="#2ECC71" label={`Getroffen: ${aHit}`} />
            <Legend color="#3B82F6" label={`Darunter: ${aUnder}`} />
          </div>
        </div>
      )}

      {/* Possible weight loss */}
      {aTotal > 0 && (() => {
        const allKeys = Object.keys(days);
        const firstDay = allKeys.length > 0 ? allKeys.sort()[0] : null;
        const totalDays = firstDay
          ? Math.max(1, Math.floor((Date.now() - new Date(firstDay).getTime()) / 86400000) + 1)
          : 0;
        const idealKg = (totalDays * 500 / 7700);
        const actualKg = ((aHit + aUnder) * 500 / 7700);
        return (
          <div style={{
            ...cardStyle,
            background: 'rgba(46, 204, 113, 0.06)',
            border: '1px solid rgba(46, 204, 113, 0.2)',
          }}>
            <div style={labelStyle}>Möglicher Gewichtsverlust</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Row 1: ideal */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ColorBox color="#2ECC71" sym="○" />
                <span style={{ fontSize: 'clamp(20px, 5vw, 26px)', fontWeight: 700, color: '#2ECC71', lineHeight: 1 }}>
                  −{idealKg.toFixed(1)} kg
                </span>
                <span style={{ fontSize: '11px', color: '#475569', marginLeft: '2px' }}>ideal</span>
              </div>
              {/* Row 2: actual */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <ColorBox color="#2ECC71" sym="○" />
                <span style={{ fontSize: '15px', color: '#64748b', fontWeight: 600 }}>−</span>
                <ColorBox color="#E8453C" sym="−" />
                <span style={{ fontSize: '15px', color: '#64748b', fontWeight: 600 }}>=</span>
                <span style={{ fontSize: 'clamp(20px, 5vw, 26px)', fontWeight: 700, color: '#3B82F6', lineHeight: 1 }}>
                  −{actualKg.toFixed(1)} kg
                </span>
                <span style={{ fontSize: '11px', color: '#475569', marginLeft: '2px' }}>tatsächlich</span>
              </div>
            </div>
            <div style={{ fontSize: '11px', color: '#334155', marginTop: '10px' }}>
              {totalDays} Tage seit Start · {aOver} Überschreitungen abgezogen
            </div>
          </div>
        );
      })()}
    </div>
  );
}

function StatCell({ value, label, color }: { value: number | string; label: string; color: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 'clamp(20px, 5vw, 26px)', fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>{label}</div>
    </div>
  );
}

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

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#64748b' }}>
      <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: color, flexShrink: 0 }} />
      {label}
    </div>
  );
}
