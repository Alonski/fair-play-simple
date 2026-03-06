import { describe, it, expect, beforeEach } from 'vitest';
import { useSettingsStore } from './settingsStore';

const defaultSettings = {
  language: 'en' as const,
  theme: 'auto' as const,
  animations: true,
  soundEnabled: true,
  notifications: true,
  defaultDealMode: 'random' as const,
};

beforeEach(() => {
  useSettingsStore.setState(defaultSettings);
});

describe('settingsStore', () => {
  describe('setLanguage', () => {
    it('updates language', () => {
      useSettingsStore.getState().setLanguage('he');
      expect(useSettingsStore.getState().language).toBe('he');
    });
  });

  describe('setTheme', () => {
    it('updates theme', () => {
      useSettingsStore.getState().setTheme('dark');
      expect(useSettingsStore.getState().theme).toBe('dark');
    });
  });

  describe('toggleAnimations', () => {
    it('toggles from true to false', () => {
      useSettingsStore.getState().toggleAnimations();
      expect(useSettingsStore.getState().animations).toBe(false);
    });

    it('toggles from false to true', () => {
      useSettingsStore.setState({ animations: false });
      useSettingsStore.getState().toggleAnimations();
      expect(useSettingsStore.getState().animations).toBe(true);
    });
  });

  describe('toggleSound', () => {
    it('toggles soundEnabled', () => {
      useSettingsStore.getState().toggleSound();
      expect(useSettingsStore.getState().soundEnabled).toBe(false);
      useSettingsStore.getState().toggleSound();
      expect(useSettingsStore.getState().soundEnabled).toBe(true);
    });
  });

  describe('toggleNotifications', () => {
    it('toggles notifications', () => {
      useSettingsStore.getState().toggleNotifications();
      expect(useSettingsStore.getState().notifications).toBe(false);
    });
  });

  describe('setDefaultDealMode', () => {
    it('updates default deal mode', () => {
      useSettingsStore.getState().setDefaultDealMode('weighted');
      expect(useSettingsStore.getState().defaultDealMode).toBe('weighted');
    });
  });

  describe('getSettings', () => {
    it('returns all settings fields', () => {
      const settings = useSettingsStore.getState().getSettings();
      expect(settings).toMatchObject(defaultSettings);
    });

    it('reflects mutations', () => {
      useSettingsStore.getState().setLanguage('he');
      useSettingsStore.getState().setTheme('dark');
      const settings = useSettingsStore.getState().getSettings();
      expect(settings.language).toBe('he');
      expect(settings.theme).toBe('dark');
    });
  });

  describe('resetSettings', () => {
    it('restores defaults', () => {
      useSettingsStore.getState().setLanguage('he');
      useSettingsStore.getState().setTheme('dark');
      useSettingsStore.getState().toggleAnimations();
      useSettingsStore.getState().resetSettings();
      expect(useSettingsStore.getState().getSettings()).toMatchObject(defaultSettings);
    });
  });
});
