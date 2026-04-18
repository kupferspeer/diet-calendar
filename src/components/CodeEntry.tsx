import { useState } from 'react';

interface Props {
  onSubmit: (code: string) => void;
}

export function CodeEntry({ onSubmit }: Props) {
  const [input, setInput] = useState('');
  const valid = input.trim().length >= 3;

  const handleSubmit = () => {
    if (!valid) return;
    onSubmit(input.trim().toLowerCase().replace(/\s+/g, ''));
  };

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
    }}>
      <div style={{ width: '100%', maxWidth: '340px' }}>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(28px, 8vw, 40px)',
          color: '#f1f5f9',
          margin: '0 0 8px',
          letterSpacing: '-0.3px',
          textAlign: 'center',
        }}>
          Diät-Kalender
        </h1>
        <p style={{
          textAlign: 'center',
          color: '#64748b',
          fontSize: '14px',
          margin: '0 0 36px',
          lineHeight: 1.5,
        }}>
          Gib deinen persönlichen Code ein
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="z.B. silvio123"
            autoFocus
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '12px',
              padding: '14px 16px',
              fontSize: '20px',
              color: '#f1f5f9',
              outline: 'none',
              width: '100%',
              boxSizing: 'border-box',
              fontFamily: "'DM Sans', sans-serif",
              letterSpacing: '0.08em',
              textAlign: 'center',
            }}
          />
          <button
            onClick={handleSubmit}
            disabled={!valid}
            style={{
              background: valid ? '#2ECC71' : 'rgba(255,255,255,0.05)',
              border: 'none',
              borderRadius: '12px',
              padding: '14px',
              fontSize: '16px',
              fontWeight: 600,
              color: valid ? '#0f172a' : '#475569',
              cursor: valid ? 'pointer' : 'default',
              transition: 'background 0.2s, color 0.2s',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Kalender öffnen
          </button>
        </div>

        <p style={{
          textAlign: 'center',
          color: '#475569',
          fontSize: '12px',
          marginTop: '24px',
          lineHeight: 1.7,
        }}>
          Nutze den gleichen Code auf allen Geräten,<br />
          um deine Daten zu synchronisieren.
        </p>
      </div>
    </div>
  );
}
