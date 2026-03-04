import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '@stores/index';
import { useAuthStore } from '@stores/authStore';
import { isSupabaseConfigured } from '@services/supabase';
import type { SyncService } from '@services/syncService';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  syncService?: SyncService | null;
}

function ConnectionStatus({ syncService }: { syncService?: SyncService | null }) {
  const [status, setStatus] = useState<string>(syncService?.status || 'offline');

  useEffect(() => {
    if (!syncService) return;
    setStatus(syncService.status);
    const unsub = syncService.onStatusChange(setStatus);
    return () => { unsub(); };
  }, [syncService]);

  if (!isSupabaseConfigured) return null;

  const colors: Record<string, string> = {
    connected: 'bg-green-500',
    syncing: 'bg-yellow-500 animate-pulse',
    offline: 'bg-red-500',
  };

  return (
    <div className="flex items-center gap-1.5" title={status}>
      <div className={`w-2 h-2 rounded-full ${colors[status] || colors.offline}`} />
    </div>
  );
}

export default function Navigation({ activeTab, onTabChange, syncService }: NavigationProps) {
  const { t } = useTranslation();
  const { setLanguage, language } = useSettingsStore();
  const { signOut, isAuthenticated } = useAuthStore();

  const navItems = [
    { id: 'gameBoard', label: t('navigation.gameBoard') },
    { id: 'cardGallery', label: t('navigation.cardGallery') },
    { id: 'settings', label: t('navigation.settings') },
  ];

  return (
    <nav className="bg-paper border-b-2 border-ink shadow-brutal-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <h1 className="font-display text-xl sm:text-2xl font-bold text-ink">
              {t('common.appName')}
            </h1>
            <ConnectionStatus syncService={syncService} />
          </div>

          {/* Navigation items - desktop */}
          <div className="hidden md:flex gap-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`text-sm font-body transition-all ${
                  activeTab === item.id
                    ? 'text-partner-a font-bold'
                    : 'text-ink hover:text-partner-b'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Right side controls */}
          <div className="flex gap-3 items-center">
            <button
              onClick={() => setLanguage(language === 'en' ? 'he' : 'en')}
              className="px-3 py-1 bg-unassigned text-ink rounded-md font-body text-sm font-bold hover:shadow-brutal-sm transition-all"
            >
              {language === 'en' ? 'עברית' : 'English'}
            </button>

            {isSupabaseConfigured && isAuthenticated && (
              <button
                onClick={() => signOut()}
                className="px-3 py-1 bg-concrete/20 text-ink rounded-md font-body text-sm hover:bg-concrete/30 transition-all"
              >
                {t('auth.signOut', 'Sign out')}
              </button>
            )}
          </div>
        </div>

        {/* Mobile navigation */}
        <div className="md:hidden pb-4 flex gap-2 overflow-x-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`px-3 py-1 rounded text-xs whitespace-nowrap transition-all ${
                activeTab === item.id
                  ? 'bg-partner-a text-paper font-bold'
                  : 'bg-concrete text-paper hover:bg-ink'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
