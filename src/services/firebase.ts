import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, GoogleAuthProvider, signInWithCredential, type Auth } from 'firebase/auth';
import { initializeFirestore, connectFirestoreEmulator, persistentLocalCache, type Firestore } from 'firebase/firestore';

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
    console.log('Connected to Firebase emulators (auth:9099, firestore:8080)');
  }
} else {
  console.warn('Firebase credentials not found. Running in local-only mode.');
}

// Dev helper: sign in with emulator Google account from console
// Usage: window.__devSignIn('alon@test.com', 'Alon')
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
