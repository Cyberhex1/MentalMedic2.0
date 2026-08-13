import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  Unsubscribe,
  query,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserProfile, TodoItem, SymptomLog, NoteItem, SessionLog } from '../types';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// CRITICAL: Initialize Firestore safely with database ID or default
export const db =
  firebaseConfig.firestoreDatabaseId &&
  firebaseConfig.firestoreDatabaseId !== '(default)' &&
  !firebaseConfig.firestoreDatabaseId.startsWith('(')
    ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
    : getFirestore(app);
export const auth = getAuth(app);

// Error Handling Infrastructure
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.warn('Firestore Issue: ', JSON.stringify(errInfo));
  // Not throwing an error to prevent the app from crashing due to unhandled promise rejections
  // in background sync processes.
}

// CRITICAL CONSTRAINT: Boot connection test
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase configuration check: Client is currently offline or loading.');
    }
  }
}
testConnection();

// --- FIRESTORE DATA SYNC HELPERS ---

export async function checkHasCloudProfile(userId: string): Promise<boolean | null> {
  try {
    const docSnap = await getDocFromServer(doc(db, 'users', userId, 'profile', 'main'));
    return docSnap.exists();
  } catch (e) {
    console.warn('Failed to check cloud profile:', e);
    return null;
  }
}

// User Profile
export async function saveUserProfileToFirestore(userId: string, profile: UserProfile) {
  const path = `users/${userId}/profile/main`;
  try {
    await setDoc(doc(db, 'users', userId, 'profile', 'main'), {
      ...profile,
      updatedAt: Date.now(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export function subscribeUserProfileFromFirestore(userId: string, onUpdate: (profile: UserProfile | null) => void): Unsubscribe {
  const path = `users/${userId}/profile/main`;
  return onSnapshot(
    doc(db, 'users', userId, 'profile', 'main'),
    (docSnap) => {
      if (docSnap.exists()) {
        onUpdate(docSnap.data() as UserProfile);
      } else {
        onUpdate(null);
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, path);
    }
  );
}

// Todos
export async function saveTodoToFirestore(userId: string, todo: TodoItem) {
  const path = `users/${userId}/todos/${todo.id}`;
  try {
    await setDoc(doc(db, 'users', userId, 'todos', todo.id), {
      ...todo,
      userId,
      updatedAt: Date.now(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function deleteTodoFromFirestore(userId: string, todoId: string) {
  const path = `users/${userId}/todos/${todoId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'todos', todoId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export function subscribeTodosFromFirestore(userId: string, onUpdate: (todos: TodoItem[]) => void): Unsubscribe {
  const path = `users/${userId}/todos`;
  return onSnapshot(
    collection(db, 'users', userId, 'todos'),
    (querySnap) => {
      const items: TodoItem[] = [];
      querySnap.forEach((docSnap) => {
        items.push(docSnap.data() as TodoItem);
      });
      items.sort((a, b) => b.createdAt - a.createdAt);
      onUpdate(items);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, path);
    }
  );
}

// Symptoms
export async function saveSymptomToFirestore(userId: string, symptom: SymptomLog) {
  const path = `users/${userId}/symptoms/${symptom.id}`;
  try {
    await setDoc(doc(db, 'users', userId, 'symptoms', symptom.id), {
      ...symptom,
      userId,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function deleteSymptomFromFirestore(userId: string, symptomId: string) {
  const path = `users/${userId}/symptoms/${symptomId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'symptoms', symptomId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export function subscribeSymptomsFromFirestore(userId: string, onUpdate: (symptoms: SymptomLog[]) => void): Unsubscribe {
  const path = `users/${userId}/symptoms`;
  return onSnapshot(
    collection(db, 'users', userId, 'symptoms'),
    (querySnap) => {
      const items: SymptomLog[] = [];
      querySnap.forEach((docSnap) => {
        items.push(docSnap.data() as SymptomLog);
      });
      items.sort((a, b) => b.timestamp - a.timestamp);
      onUpdate(items);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, path);
    }
  );
}

// Notes
export async function saveNoteToFirestore(userId: string, note: NoteItem) {
  const path = `users/${userId}/notes/${note.id}`;
  try {
    await setDoc(doc(db, 'users', userId, 'notes', note.id), {
      ...note,
      userId,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function deleteNoteFromFirestore(userId: string, noteId: string) {
  const path = `users/${userId}/notes/${noteId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'notes', noteId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export function subscribeNotesFromFirestore(userId: string, onUpdate: (notes: NoteItem[]) => void): Unsubscribe {
  const path = `users/${userId}/notes`;
  return onSnapshot(
    collection(db, 'users', userId, 'notes'),
    (querySnap) => {
      const items: NoteItem[] = [];
      querySnap.forEach((docSnap) => {
        items.push(docSnap.data() as NoteItem);
      });
      items.sort((a, b) => b.timestamp - a.timestamp);
      onUpdate(items);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, path);
    }
  );
}

// Session Logs
export async function saveSessionLogToFirestore(userId: string, log: SessionLog) {
  const path = `users/${userId}/sessionLogs/${log.id}`;
  try {
    await setDoc(doc(db, 'users', userId, 'sessionLogs', log.id), {
      ...log,
      userId,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export function subscribeSessionLogsFromFirestore(userId: string, onUpdate: (logs: SessionLog[]) => void): Unsubscribe {
  const path = `users/${userId}/sessionLogs`;
  return onSnapshot(
    collection(db, 'users', userId, 'sessionLogs'),
    (querySnap) => {
      const items: SessionLog[] = [];
      querySnap.forEach((docSnap) => {
        items.push(docSnap.data() as SessionLog);
      });
      items.sort((a, b) => b.timestamp - a.timestamp);
      onUpdate(items);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, path);
    }
  );
}

// System / Battery State
export async function saveUserStateToFirestore(userId: string, battery: number) {
  const path = `users/${userId}/state/main`;
  try {
    await setDoc(doc(db, 'users', userId, 'state', 'main'), {
      userId,
      battery,
      updatedAt: Date.now(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export function subscribeUserStateFromFirestore(userId: string, onUpdate: (battery: number | null) => void): Unsubscribe {
  const path = `users/${userId}/state/main`;
  return onSnapshot(
    doc(db, 'users', userId, 'state', 'main'),
    (docSnap) => {
      if (docSnap.exists() && typeof docSnap.data().battery === 'number') {
        onUpdate(docSnap.data().battery);
      } else {
        onUpdate(null);
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, path);
    }
  );
}

// Manual Sync All Helper
export async function syncAllWithFirestore(
  userId: string,
  profile: UserProfile,
  todos: TodoItem[],
  symptomLogs: SymptomLog[],
  notes: NoteItem[],
  sessionLogs: SessionLog[],
  battery: number
) {
  const syncTask = Promise.all([
    saveUserProfileToFirestore(userId, profile),
    saveUserStateToFirestore(userId, battery),
    ...todos.map((todo) => saveTodoToFirestore(userId, todo)),
    ...symptomLogs.map((symptom) => saveSymptomToFirestore(userId, symptom)),
    ...notes.map((note) => saveNoteToFirestore(userId, note)),
    ...sessionLogs.map((log) => saveSessionLogToFirestore(userId, log)),
  ]);

  // Race against a 5-second timeout so the UI doesn't hang indefinitely
  // if Firebase is struggling to connect.
  await Promise.race([
    syncTask,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Sync timeout')), 5000))
  ]);
}
