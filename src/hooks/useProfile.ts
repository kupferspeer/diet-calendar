import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc, deleteDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase';
import { UserProfile } from '../types';

function lsKey(code: string) { return `diet-calendar-profile-${code}`; }

export function useProfile(code: string | null) {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!code) { setProfile(null); return; }
    const stored = localStorage.getItem(lsKey(code));
    if (stored) {
      try { setProfile(JSON.parse(stored)); } catch {}
    }
    if (!isFirebaseConfigured || !db) return;
    const unsub = onSnapshot(
      doc(db, 'profiles', code),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as UserProfile;
          setProfile(data);
          localStorage.setItem(lsKey(code), JSON.stringify(data));
        }
      },
      () => {}
    );
    return unsub;
  }, [code]);

  const saveProfile = async (updated: UserProfile) => {
    if (!code) return;
    setProfile(updated);
    localStorage.setItem(lsKey(code), JSON.stringify(updated));
    if (!isFirebaseConfigured || !db) return;
    await setDoc(doc(db, 'profiles', code), updated);
  };

  const resetProfile = async () => {
    if (!code) return;
    setProfile(null);
    localStorage.removeItem(lsKey(code));
    if (!isFirebaseConfigured || !db) return;
    await deleteDoc(doc(db, 'profiles', code));
  };

  return { profile, saveProfile, resetProfile };
}
