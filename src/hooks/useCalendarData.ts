import { useState, useEffect, useCallback } from 'react';
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase';
import { DaysMap, DayStatus, SyncState } from '../types';

const STATUS_CYCLE: (DayStatus | undefined)[] = [undefined, 'over', 'hit', 'under'];

function lsKey(code: string) { return `diet-calendar-${code}`; }

export function useCalendarData(code: string | null) {
  const [days, setDays] = useState<DaysMap>({});
  const [sync, setSync] = useState<SyncState>({ status: 'synced' });

  useEffect(() => {
    if (!code) {
      setDays({});
      setSync({ status: 'synced' });
      return;
    }

    const key = lsKey(code);
    try { setDays(JSON.parse(localStorage.getItem(key) || '{}')); }
    catch { setDays({}); }

    if (!isFirebaseConfigured || !db) {
      setSync({ status: 'synced' });
      return;
    }

    setSync({ status: 'syncing' });
    const daysCol = collection(db, 'calendars', code, 'days');
    const unsub = onSnapshot(
      daysCol,
      (snap) => {
        const map: DaysMap = {};
        snap.forEach((d) => { map[d.id] = d.data().status as DayStatus; });
        setDays(map);
        localStorage.setItem(key, JSON.stringify(map));
        setSync({ status: 'synced' });
      },
      (err) => setSync({ status: 'error', error: err.message })
    );
    return unsub;
  }, [code]);

  const toggleDay = useCallback(async (dateStr: string) => {
    if (!code) return;
    const current = days[dateStr];
    const idx = STATUS_CYCLE.indexOf(current);
    const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];

    const updated = { ...days };
    if (next === undefined) delete updated[dateStr];
    else updated[dateStr] = next;
    setDays(updated);
    localStorage.setItem(lsKey(code), JSON.stringify(updated));

    if (!isFirebaseConfigured || !db) return;
    setSync({ status: 'syncing' });
    const ref = doc(db, 'calendars', code, 'days', dateStr);
    try {
      if (next === undefined) await deleteDoc(ref);
      else await setDoc(ref, { status: next });
    } catch (e) {
      setSync({ status: 'error', error: String(e) });
    }
  }, [code, days]);

  return { days, sync, toggleDay };
}
