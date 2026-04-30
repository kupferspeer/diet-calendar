import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
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
    getDoc(doc(db, 'profiles', code)).then((snap) => {
      if (snap.exists()) {
        const data = snap.data() as UserProfile;
        setProfile(data);
        localStorage.setItem(lsKey(code), JSON.stringify(data));
      }
    }).catch(() => {});
  }, [code]);

  const saveProfile = async (updated: UserProfile) => {
    if (!code) return;
    setProfile(updated);
    localStorage.setItem(lsKey(code), JSON.stringify(updated));
    if (!isFirebaseConfigured || !db) return;
    await setDoc(doc(db, 'profiles', code), updated);
  };

  return { profile, saveProfile };
}
