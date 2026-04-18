
import { SyncState } from '../types';
import { isFirebaseConfigured } from '../firebase';

const COLORS = { synced: '#2ECC71', syncing: '#facc15', error: '#E8453C' };
const LABELS = { synced: 'Gespeichert', syncing: 'Synchronisiere …', error: 'Fehler' };

export function SyncStatus({ sync }: { sync: SyncState }) {
  if (!isFirebaseConfigured) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#64748b' }}>
        <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#facc15' }} />
        Lokal
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#64748b' }}>
      <div style={{
        width: '7px',
        height: '7px',
        borderRadius: '50%',
        background: COLORS[sync.status],
        boxShadow: `0 0 5px ${COLORS[sync.status]}88`,
        animation: sync.status === 'syncing' ? 'pulse 1s infinite' : 'none',
        flexShrink: 0,
      }} />
      {LABELS[sync.status]}
    </div>
  );
}
