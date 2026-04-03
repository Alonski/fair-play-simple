import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet } from '@tanstack/react-router';
import { useSettingsStore } from '@stores/index';
import { useCardStore } from '@stores/index';
import { useAuthStore } from '@stores/authStore';
import { isFirebaseConfigured } from '@services/firebase';
import { SyncService } from '@services/syncService';
import { initPushNotifications } from '@services/pushService';
import { sampleCards } from '@utils/sampleCards';

// Components
import Navigation from '@components/layout/Navigation';
import Background from '@components/layout/Background';
import AuthScreen from '@components/auth/AuthScreen';
import ErrorScreen from '@components/auth/ErrorScreen';
import SyncStatusBar from '@components/ui/SyncStatusBar';

// Styles
import '@styles/globals.css';
import '@styles/animations.css';
import '@styles/textures.css';

export default function App() {
  const { t, i18n } = useTranslation();
  const { language, theme, animations } = useSettingsStore();
  const { isLoading, isAuthenticated, profile, error, readOnlyMode, initialize } = useAuthStore();
  const syncRef = useRef<SyncService | null>(null);

  // Initialize auth on mount
  useEffect(() => {
    if (isFirebaseConfigured) {
      initialize();
    }
  }, [initialize]);

  // Start sync service when authenticated with a household
  useEffect(() => {
    if (!isFirebaseConfigured || !isAuthenticated || !profile?.householdId) {
      return;
    }

    const user = useAuthStore.getState().user;
    if (!user) return;

    const sync = new SyncService(profile.householdId, user.uid);
    syncRef.current = sync;

    sync.start().then(async () => {
      const currentCards = useCardStore.getState().getCards();
      // Only partner-a seeds to prevent race condition when both partners open simultaneously
      if (currentCards.length === 0 && profile?.partnerSlot === 'partner-a') {
        useCardStore.getState().bulkAddCards(sampleCards);
        await sync.seedCards(sampleCards);
      }
      // Register for push notifications
      initPushNotifications(user.uid).catch(console.error);
    });

    return () => {
      sync.stop();
      syncRef.current = null;
    };
  }, [isAuthenticated, profile?.householdId]);

  useEffect(() => {
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
    }
    const htmlElement = document.documentElement;
    htmlElement.setAttribute('dir', language === 'he' ? 'rtl' : 'ltr');
    htmlElement.setAttribute('lang', language);
  }, [language, i18n]);

  useEffect(() => {
    const htmlElement = document.documentElement;
    if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      htmlElement.classList.toggle('dark', prefersDark);
    } else {
      htmlElement.classList.toggle('dark', theme === 'dark');
    }
  }, [theme]);

  useEffect(() => {
    if (!animations) {
      document.documentElement.style.setProperty('--animation-duration', '0ms');
    } else {
      document.documentElement.style.removeProperty('--animation-duration');
    }
  }, [animations]);

  // Auth gate (only when Firebase is configured)
  if (isFirebaseConfigured) {
    if (isLoading) {
      return (
        <div className="min-h-screen bg-paper flex items-center justify-center">
          <div className="animate-pulse text-xl font-display font-bold text-concrete">
            {t('common.loading', 'Loading...')}
          </div>
        </div>
      );
    }

    if (!isAuthenticated && !readOnlyMode) {
      if (error) {
        return <ErrorScreen />;
      }
      return <AuthScreen />;
    }
  }

  return (
    <div className="min-h-screen bg-paper text-ink overflow-x-hidden">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus:text-ink">
        Skip to content
      </a>
      <Background />
      {isAuthenticated && <SyncStatusBar syncRef={syncRef} />}
      <div className="flex flex-col h-screen relative z-10">
        <main id="main-content" className="flex-1 overflow-y-auto pb-20">
          <div className="max-w-2xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
        <Navigation />
      </div>
    </div>
  );
}
