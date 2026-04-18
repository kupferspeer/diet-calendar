import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Replace these placeholders with your Firebase project config.
// See README.md for setup instructions.
const firebaseConfig = {
  apiKey: 'AIzaSyAqOJTSM5Cqv4YgOjjE2TYCzg0iMMnly6s',
  authDomain: 'diet-calender.firebaseapp.com',
  projectId: 'diet-calender',
  storageBucket: 'diet-calender.firebasestorage.app',
  messagingSenderId: '826485359922',
  appId: '1:826485359922:web:8f31f1e1f67ca36222c32b',
};

export const isFirebaseConfigured = !firebaseConfig.apiKey.startsWith('YOUR_');

export const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null;
export const db = isFirebaseConfigured ? getFirestore(app!) : null;
