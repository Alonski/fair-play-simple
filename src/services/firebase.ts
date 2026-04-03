// PERF OPTIMIZATION OPPORTUNITY (P1): Lazy-load Firebase SDK
// Currently Firebase modules are eagerly imported at module level, adding ~100-150KB
// to the initial bundle even when isFirebaseConfigured=false (local-only mode).
//
// To optimize: convert to an async initializeFirebase() that uses dynamic imports:
//   export async function initializeFirebase() {
//     const { initializeApp } = await import('firebase/app');
//     const { getAuth, ... } = await import('firebase/auth');
//     const { initializeFirestore, ... } = await import('firebase/firestore');
//     // ... rest of init logic
//   }
// Then have App.tsx call initializeFirebase() on mount.
//
// This requires updating all consumers (syncService, authStore, etc.) to await
// the initialization, so it's a non-trivial refactor. Skipping for now to avoid
// breaking changes.

import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, GoogleAuthProvider, signInWithCredential, type Auth } from 'firebase/auth';
import { initializeFirestore, connectFirestoreEmulator, persistentLocalCache, type Firestore } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(
  import.meta.env.VITE_FIREBASE_PROJECT_ID && import.meta.env.VITE_FIREBASE_API_KEY
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = initializeFirestore(app, {
    localCache: persistentLocalCache(),
  });

  // Connect to emulators in development
  if (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATORS !== 'false') {
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, 'localhost', 8080);
    const functions = getFunctions(app);
    connectFunctionsEmulator(functions, 'localhost', 5001);
    console.log('Connected to Firebase emulators (auth:9099, firestore:8080, functions:5001)');
  }
} else {
  console.warn('Firebase credentials not found. Running in local-only mode.');
}

// Dev helper: sign in with emulator Google account from console
// Usage: window.__devSignIn('alonzorz@gmail.com', 'Alon')
if (import.meta.env.DEV && auth) {
  (window as unknown as Record<string, unknown>).__devSignIn = async (email: string, name: string) => {
    const fakeIdToken = JSON.stringify({ sub: email, email, name, email_verified: true });
    const credential = GoogleAuthProvider.credential(fakeIdToken);
    const result = await signInWithCredential(auth!, credential);
    console.log('Signed in as:', result.user.email);
    return result;
  };
}

export { app, auth, db };
