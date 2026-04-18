import { useState, useEffect, useCallback } from 'react';
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured, signInAnonymously, onAuthStateChanged } from '../firebase';
import { DaysMap, DayStatus, SyncState } from '../types';

const LS_KEY = 'diet-calendar-days';

function loadLS(): DaysMap {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}'); }
  catch { return {}; }
}

function saveLS(days: DaysMap) {
  localStorage.setItem(LS_KEY, JSON.stringify(days));
}

const STATUS_CYCLE: (DayStatus | undefined)[] = [undefined, 'over', 'hit', 'under'];

export function useCalendarData() {
  const [uid, setUid] = useState<string | null>(null);
  const [days, setDays] = useState<DaysMap>(loadLS);
  const [sync, setSync] = useState<SyncState>({ status: isFirebaseConfigured ? 'syncing' : 'synced' });

  // Firebase auth
  useEffect(() => {
    if (!isFirebaseConfigured || !auth) return;
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid);
      } else {
        try {
          await signInAnonymously(auth!);
        } catch (e) {
          setSync({ status: 'error', error: String(e) });
        }
      }
    });
    return unsub;
  }, []);

  // Firestore real-time sync
  useEffect(() => {
    if (!uid || !db) return;
    setSync({ status: 'syncing' });
    const daysCol = collection(db, 'users', uid, 'days');
    const unsub = onSnapshot(
      daysCol,
      (snap) => {
        const map: DaysMap = {};
        snap.forEach((d) => { map[d.id] = d.data().status as DayStatus; });
        setDays(map);
        saveLS(map);
        setSync({ status: 'synced' });
      },
      (err) => {
        setSync({ status: 'error', error: err.message });
      }
    );
    return unsub;
  }, [uid]);

  const toggleDay = useCallback(async (dateStr: string) => {
    const current = days[dateStr];
    const idx = STATUS_CYCLE.indexOf(current);
    const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];

    // Optimistic update
    const updated = { ...days };
    if (next === undefined) delete updated[dateStr];
    else updated[dateStr] = next;
    setDays(updated);
    saveLS(updated);

    if (!isFirebaseConfigured || !uid || !db) return;

    setSync({ status: 'syncing' });
    const ref = doc(db, 'users', uid, 'days', dateStr);
    try {
      if (next === undefined) await deleteDoc(ref);
      else await setDoc(ref, { status: next });
    } catch (e) {
      setSync({ status: 'error', error: String(e) });
    }
  }, [days, uid]);

  return { days, sync, toggleDay };
}
