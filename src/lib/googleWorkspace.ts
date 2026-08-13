import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
// Add Google Tasks & Google Docs & Drive scopes
provider.addScope('https://www.googleapis.com/auth/tasks');
provider.addScope('https://www.googleapis.com/auth/tasks.readonly');
provider.addScope('https://www.googleapis.com/auth/documents');
provider.addScope('https://www.googleapis.com/auth/documents.readonly');
provider.addScope('https://www.googleapis.com/auth/drive.file');

let isSigningIn = false;
let cachedAccessToken: string | null = typeof window !== 'undefined' ? sessionStorage.getItem('zawe_google_token') : null;

export const initWorkspaceAuth = (
  onSuccess: (user: User, token: string) => void,
  onFailure: () => void
) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      const token = cachedAccessToken || (typeof window !== 'undefined' ? sessionStorage.getItem('zawe_google_token') : null) || '';
      cachedAccessToken = token;
      onSuccess(user, token);
    } else if (!isSigningIn) {
      cachedAccessToken = null;
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('zawe_google_token');
      }
      onFailure();
    }
  });
};

export const signInWithGoogleWorkspace = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);

    const token = credential?.accessToken || '';
    if (token) {
      cachedAccessToken = token;
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('zawe_google_token', token);
      }
    }
    return { user: result.user, accessToken: token };
  } catch (err) {
    console.warn('Google Workspace login issue:', err?.message || err);
    throw err;
  } finally {
    isSigningIn = false;
  }
};

export const logoutGoogleWorkspace = async () => {
  await signOut(auth);
  cachedAccessToken = null;
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('zawe_google_token');
  }
};

export const signInWithEmail = async (email: string, pass: string) => {
  return await signInWithEmailAndPassword(auth, email, pass);
};

export const signUpWithEmail = async (email: string, pass: string) => {
  return await createUserWithEmailAndPassword(auth, email, pass);
};

export const sendResetPassword = async (email: string) => {
  return await sendPasswordResetEmail(auth, email);
};

export const getCachedAccessToken = () => cachedAccessToken;

// --- GOOGLE TASKS API CALLS ---
export interface GoogleTask {
  id: string;
  title: string;
  status: 'needsAction' | 'completed';
  notes?: string;
  updated?: string;
}

export interface GoogleTaskList {
  id: string;
  title: string;
}

export async function fetchGoogleTaskLists(token: string): Promise<GoogleTaskList[]> {
  const res = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to fetch task lists (${res.status}): ${errorText}`);
  }
  const data = await res.json();
  return data.items || [];
}

export async function fetchGoogleTasks(token: string, listId: string = '@default'): Promise<GoogleTask[]> {
  const res = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${listId}/tasks?showCompleted=true`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to fetch tasks (${res.status}): ${errorText}`);
  }
  const data = await res.json();
  return data.items || [];
}

export async function createGoogleTask(token: string, listId: string = '@default', title: string, notes?: string): Promise<GoogleTask> {
  const res = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${listId}/tasks`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title,
      notes: notes || 'Created via Zero-Adrenaline Work Engine',
    }),
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to create task (${res.status}): ${errorText}`);
  }
  return await res.json();
}

export async function completeGoogleTask(token: string, listId: string = '@default', taskId: string): Promise<GoogleTask> {
  const res = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${listId}/tasks/${taskId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      status: 'completed',
    }),
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to complete task (${res.status}): ${errorText}`);
  }
  return await res.json();
}

// --- GOOGLE DOCS API CALLS ---
export interface GoogleDoc {
  documentId: string;
  title: string;
}

export async function createGoogleDoc(token: string, title: string, initialBodyText?: string): Promise<GoogleDoc> {
  const res = await fetch('https://docs.googleapis.com/v1/documents', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title,
    }),
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to create Google Doc (${res.status}): ${errorText}`);
  }
  const doc: GoogleDoc = await res.json();

  if (initialBodyText && doc.documentId) {
    await appendToGoogleDoc(token, doc.documentId, initialBodyText);
  }

  return doc;
}

export async function appendToGoogleDoc(token: string, documentId: string, text: string): Promise<void> {
  const res = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [
        {
          insertText: {
            location: { index: 1 },
            text: text + '\n\n',
          },
        },
      ],
    }),
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to update Google Doc (${res.status}): ${errorText}`);
  }
}
