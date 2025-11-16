import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '@stores/index';
import { useCardStore } from '@stores/index';
import { initializeSampleData } from '@services/database';
import { sampleCards } from '@utils/sampleCards';

// Components
import Navigation from '@components/layout/Navigation';
import Background from '@components/layout/Background';
import Dashboard from '@components/layout/Dashboard';

// Styles
import '@styles/globals.css';
import '@styles/animations.css';
import '@styles/textures.css';

export default function App() {
  const { i18n } = useTranslation();
  const { language, theme, animations } = useSettingsStore();

  // Initialize database and load sample cards on mount
  useEffect(() => {
    initializeSampleData().catch(console.error);

    // Load sample cards into store on first run
    const cardStore = useCardStore.getState();
    const hasCards = cardStore.getCards().length > 0;
    if (!hasCards) {
      cardStore.bulkAddCards(sampleCards);
    }
  }, []);

  useEffect(() => {
    // Set language
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
    }

    // Set RTL for Hebrew
    const htmlElement = document.documentElement;
    htmlElement.setAttribute('dir', language === 'he' ? 'rtl' : 'ltr');
    htmlElement.setAttribute('lang', language);
  }, [language, i18n]);

  useEffect(() => {
    // Set theme
    const htmlElement = document.documentElement;
    if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      htmlElement.classList.toggle('dark', prefersDark);
    } else {
      htmlElement.classList.toggle('dark', theme === 'dark');
    }
  }, [theme]);

  useEffect(() => {
    // Control animations
    if (!animations) {
      document.documentElement.style.setProperty('--animation-duration', '0ms');
    } else {
      document.documentElement.style.removeProperty('--animation-duration');
    }
  }, [animations]);

  return (
    <div className="min-h-screen bg-paper text-ink overflow-x-hidden">
      {/* Background element */}
      <Background />

      {/* Main content */}
      <div className="flex flex-col h-screen">
        {/* Navigation */}
        <Navigation />

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto">
          <Dashboard />
        </main>
      </div>
    </div>
  );
}
