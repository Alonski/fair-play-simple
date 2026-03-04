import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '@services/supabase';
import type { User } from '@supabase/supabase-js';
import type { Profile, Household } from '@types';

interface AuthStoreState {
  user: User | null;
  profile: Profile | null;
  household: Household | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  signInWithMagicLink: (email: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  fetchHousehold: () => Promise<void>;
  choosePartnerSlot: (slot: 'partner-a' | 'partner-b') => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStoreState>()((set, get) => ({
  user: null,
  profile: null,
  household: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,

  initialize: async () => {
    if (!isSupabaseConfigured) {
      set({ isLoading: false });
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        set({ user: session.user, isAuthenticated: true });
        await get().fetchProfile();
        await get().fetchHousehold();
      }

      // Listen for auth changes (magic link callback, sign out, etc.)
      supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          set({ user: session.user, isAuthenticated: true });
          await get().fetchProfile();
          await get().fetchHousehold();
        } else {
          set({ user: null, profile: null, household: null, isAuthenticated: false });
        }
      });
    } catch (err) {
      console.error('Auth initialization error:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  signInWithMagicLink: async (email: string) => {
    set({ error: null });

    const redirectTo = `${window.location.origin}${window.location.pathname}`;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });

    if (error) {
      const msg = error.message || 'Failed to send magic link';
      set({ error: msg });
      return { error: msg };
    }

    return { error: null };
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, profile: null, household: null, isAuthenticated: false });
  },

  fetchProfile: async () => {
    const user = get().user;
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return;
    }

    set({ profile: data as Profile });

    // Auto-assign to the first (and only) household if not yet assigned
    if (!data.household_id) {
      const { data: households } = await supabase
        .from('households')
        .select('*')
        .limit(1);

      if (households && households.length > 0) {
        const household = households[0];
        await supabase
          .from('profiles')
          .update({ household_id: household.id })
          .eq('id', user.id);

        set({ profile: { ...data, household_id: household.id } as Profile });
      }
    }
  },

  fetchHousehold: async () => {
    const profile = get().profile;
    if (!profile?.household_id) return;

    const { data, error } = await supabase
      .from('households')
      .select('*')
      .eq('id', profile.household_id)
      .single();

    if (error) {
      console.error('Error fetching household:', error);
      return;
    }

    set({ household: data as Household });
  },

  choosePartnerSlot: async (slot: 'partner-a' | 'partner-b') => {
    const user = get().user;
    const profile = get().profile;
    if (!user || !profile) return;

    const { error } = await supabase
      .from('profiles')
      .update({ partner_slot: slot })
      .eq('id', user.id);

    if (error) {
      console.error('Error setting partner slot:', error);
      set({ error: 'Failed to set partner slot' });
      return;
    }

    set({ profile: { ...profile, partner_slot: slot } });
  },

  clearError: () => set({ error: null }),
}));
