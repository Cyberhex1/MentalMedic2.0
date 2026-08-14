import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserProfile, TodoItem, SymptomLog, NoteItem, SessionLog } from '../types';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const db =
  firebaseConfig.firestoreDatabaseId &&
  firebaseConfig.firestoreDatabaseId !== '(default)' &&
  !firebaseConfig.firestoreDatabaseId.startsWith('(')
    ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
    : getFirestore(app);
export const auth = getAuth(app);

export interface AppSnapshot {
  userProfile: UserProfile;
  todos: TodoItem[];
  symptomLogs: SymptomLog[];
  notes: NoteItem[];
  sessionLogs: SessionLog[];
  battery: number;
  lastUpdated: number;
}

export async function saveAppSnapshot(userId: string, snapshot: Omit<AppSnapshot, 'lastUpdated'>) {
  try {
    await setDoc(doc(db, 'users', userId, 'snapshot', 'main'), {
      ...snapshot,
      lastUpdated: Date.now(),
    });
  } catch (err) {
    console.error('Failed to save snapshot', err);
  }
}

export function subscribeAppSnapshot(userId: string, onUpdate: (snapshot: AppSnapshot | null) => void): Unsubscribe {
  return onSnapshot(
    doc(db, 'users', userId, 'snapshot', 'main'),
    (docSnap) => {
      if (docSnap.exists()) {
        onUpdate(docSnap.data() as AppSnapshot);
      } else {
        onUpdate(null);
      }
    },
    (err) => {
      console.error('Failed to subscribe to snapshot', err);
    }
  );
}
