import { create } from 'zustand';
import { isFirebaseConfigured, auth, db } from '@services/firebase';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  runTransaction,
} from 'firebase/firestore';
import type { UserProfile, PartnerId } from '@types';

const ALLOWED_EMAILS = [
  'alonzorz@gmail.com',
  'swaddlesnaps@gmail.com',
];

const HOUSEHOLD_ID = 'shared';

interface AuthStoreState {
  user: User | null;
  profile: UserProfile | null;
  household: { id: string; [key: string]: unknown } | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  initialize: () => Promise<void>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  choosePartnerSlot: (slot: PartnerId) => Promise<void>;
  clearError: () => void;
}

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

let initialized = false;

async function ensureUserProfile(user: User): Promise<UserProfile> {
  if (!db) throw new Error('Firestore not initialized');

  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return userSnap.data() as UserProfile;
  }

  const newProfile: UserProfile = {
    uid: user.uid,
    displayName: user.displayName || user.email?.split('@')[0] || 'User',
    email: user.email || '',
    householdId: null,
    partnerSlot: null,
    createdAt: new Date().toISOString(),
  };
  await setDoc(userRef, newProfile);
  return newProfile;
}

async function joinOrCreateHousehold(user: User, profile: UserProfile): Promise<UserProfile> {
  if (!db || profile.householdId) return profile;

  const updatedProfile = { ...profile };

  await runTransaction(db, async (transaction) => {
    const householdRef = doc(db!, 'households', HOUSEHOLD_ID);
    const householdSnap = await transaction.get(householdRef);

    let slot: PartnerId;
    if (householdSnap.exists()) {
      const data = householdSnap.data();
      slot = 'partner-b';
      if (!data.partnerBUid) {
        transaction.update(householdRef, { partnerBUid: user.uid });
      }
    } else {
      slot = 'partner-a';
      transaction.set(householdRef, {
        name: 'Our Home',
        partnerAUid: user.uid,
        partnerBUid: null,
        partnerAName: 'Partner A',
        partnerBName: 'Partner B',
        dealMode: 'random',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    transaction.update(doc(db!, 'users', user.uid), { householdId: HOUSEHOLD_ID, partnerSlot: slot });
    updatedProfile.householdId = HOUSEHOLD_ID;
    updatedProfile.partnerSlot = slot;
  });

  return updatedProfile;
}

async function fetchHouseholdDoc(householdId: string) {
  if (!db) return null;
  const snap = await getDoc(doc(db, 'households', householdId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export const useAuthStore = create<AuthStoreState>()((set, get) => ({
  user: null,
  profile: null,
  household: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,

  initialize: async () => {
    if (!isFirebaseConfigured || !auth || initialized) {
      set({ isLoading: false });
      return;
    }
    initialized = true;

    try {
      await getRedirectResult(auth).catch(() => {});

      onAuthStateChanged(auth, async (user) => {
        if (user) {
          // Email allowlist check
          if (!ALLOWED_EMAILS.includes(user.email ?? '')) {
            await auth!.signOut();
            set({
              user: null,
              profile: null,
              household: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'This app is restricted to authorized accounts.',
            });
            return;
          }

          set({ user, isAuthenticated: true });

          let profile = await ensureUserProfile(user);
          profile = await joinOrCreateHousehold(user, profile);

          if (profile.householdId) {
            const household = await fetchHouseholdDoc(profile.householdId);
            set({ household });

            // Backfill partnerSlot for users who joined before auto-assign
            if (!profile.partnerSlot && household && db) {
              const slot: PartnerId = (household as { partnerAUid?: string }).partnerAUid === user.uid
                ? 'partner-a'
                : 'partner-b';
              await updateDoc(doc(db, 'users', user.uid), { partnerSlot: slot });
              profile = { ...profile, partnerSlot: slot };
            }
          }

          set({ profile });
        } else {
          set({ user: null, profile: null, household: null, isAuthenticated: false });
        }
        set({ isLoading: false });
      });
    } catch (err) {
      console.error('Auth initialization error:', err);
      set({ isLoading: false });
    }
  },

  signInWithGoogle: async () => {
    if (!auth) return { error: 'Firebase not configured' };
    set({ error: null });

    const provider = new GoogleAuthProvider();
    try {
      if (isMobile) {
        await signInWithRedirect(auth, provider);
        return { error: null };
      } else {
        await signInWithPopup(auth, provider);
        return { error: null };
      }
    } catch (err) {
      const code = (err as { code?: string }).code;
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        return { error: null };
      }
      const msg = code === 'auth/network-request-failed'
        ? 'No internet connection. Please try again.'
        : code === 'auth/popup-blocked'
        ? 'Popup was blocked. Please allow popups for this site.'
        : 'Sign in failed. Please try again.';
      set({ error: msg });
      return { error: msg };
    }
  },

  signOut: async () => {
    if (!auth) return;
    await auth.signOut();
    set({ user: null, profile: null, household: null, isAuthenticated: false });
  },

  choosePartnerSlot: async (slot: PartnerId) => {
    const { user, profile } = get();
    if (!user || !profile || !db) return;

    try {
      await updateDoc(doc(db, 'users', user.uid), { partnerSlot: slot });
      set({ profile: { ...profile, partnerSlot: slot } });
    } catch (err) {
      console.error('Error setting partner slot:', err);
      set({ error: 'Failed to set partner slot' });
    }
  },

  clearError: () => set({ error: null }),
}));
