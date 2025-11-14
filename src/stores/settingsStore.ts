import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppSettings, DealMode } from '@types/index';

interface SettingsStore extends AppSettings {
  // Actions
  setLanguage: (language: 'en' | 'he') => void;
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  toggleAnimations: () => void;
  toggleSound: () => void;
  toggleNotifications: () => void;
  setDefaultDealMode: (mode: DealMode) => void;
  getSettings: () => AppSettings;
  resetSettings: () => void;
}

const defaultSettings: AppSettings = {
  language: 'en',
  theme: 'auto',
  animations: true,
  soundEnabled: true,
  notifications: true,
  defaultDealMode: 'random',
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      ...defaultSettings,

      setLanguage: (language) =>
        set(() => ({
          language,
        })),

      setTheme: (theme) =>
        set(() => ({
          theme,
        })),

      toggleAnimations: () =>
        set((state) => ({
          animations: !state.animations,
        })),

      toggleSound: () =>
        set((state) => ({
          soundEnabled: !state.soundEnabled,
        })),

      toggleNotifications: () =>
        set((state) => ({
          notifications: !state.notifications,
        })),

      setDefaultDealMode: (mode) =>
        set(() => ({
          defaultDealMode: mode,
        })),

      getSettings: () => {
        const state = get();
        return {
          language: state.language,
          theme: state.theme,
          animations: state.animations,
          soundEnabled: state.soundEnabled,
          notifications: state.notifications,
          defaultDealMode: state.defaultDealMode,
        };
      },

      resetSettings: () =>
        set(() => defaultSettings),
    }),
    {
      name: 'settings-store',
      version: 1,
    }
  )
);
