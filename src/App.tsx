import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '@stores/index';
import { useCardStore } from '@stores/index';
import { useAuthStore } from '@stores/authStore';
import { isSupabaseConfigured } from '@services/supabase';
import { SyncService } from '@services/syncService';
import { sampleCards } from '@utils/sampleCards';

// Components
import Navigation from '@components/layout/Navigation';
import Background from '@components/layout/Background';
import GameBoard from '@components/game/GameBoard';
import AuthScreen from '@components/auth/AuthScreen';
import SetupScreen from '@components/auth/SetupScreen';

// Styles
import '@styles/globals.css';
import '@styles/animations.css';
import '@styles/textures.css';

export default function App() {
  const { t, i18n } = useTranslation();
  const { language, theme, animations } = useSettingsStore();
  const { isLoading, isAuthenticated, profile, initialize } = useAuthStore();
  const [activeTab, setActiveTab] = useState('gameBoard');
  const syncRef = useRef<SyncService | null>(null);

  // Initialize auth on mount
  useEffect(() => {
    if (isSupabaseConfigured) {
      initialize();
    }
  }, [initialize]);

  // Start sync service when authenticated with a household
  useEffect(() => {
    if (!isSupabaseConfigured || !isAuthenticated || !profile?.household_id) {
      return;
    }

    const user = useAuthStore.getState().user;
    if (!user) return;

    const sync = new SyncService(profile.household_id, user.id);
    syncRef.current = sync;

    // Start sync, then seed cards if this is the first user in the household
    sync.start().then(async () => {
      const currentCards = useCardStore.getState().getCards();
      if (currentCards.length === 0) {
        // No cards in Supabase yet — seed the sample cards
        useCardStore.getState().bulkAddCards(sampleCards);
        await sync.seedCards(sampleCards);
      }
    });

    return () => {
      sync.stop();
      syncRef.current = null;
    };
  }, [isAuthenticated, profile?.household_id]);

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

  // Auth gate (only when Supabase is configured)
  if (isSupabaseConfigured) {
    if (isLoading) {
      return (
        <div className="min-h-screen bg-paper flex items-center justify-center">
          <div className="animate-pulse text-xl font-display font-bold text-concrete">
            {t('common.loading', 'Loading...')}
          </div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return <AuthScreen />;
    }

    if (!profile?.partner_slot) {
      return <SetupScreen />;
    }
  } else {
    // No Supabase configured — load sample cards locally (original behavior)
    // This effect is handled below
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'gameBoard':
        return <GameBoard />;
      case 'cardGallery':
        return <GameBoard />;
      case 'settings':
        return (
          <div className="relative z-10 max-w-7xl mx-auto px-4 py-12 text-center">
            <h2 className="text-display-md font-display font-bold text-ink mb-4">
              {t('settings.title')}
            </h2>
            <p className="text-lg font-body text-concrete">
              {t('game.comingSoon')}
            </p>
          </div>
        );
      default:
        return <GameBoard />;
    }
  };

  return (
    <div className="min-h-screen bg-paper text-ink overflow-x-hidden">
      <Background />
      <div className="flex flex-col h-screen">
        <Navigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          syncService={syncRef.current}
        />
        <main className="flex-1 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
