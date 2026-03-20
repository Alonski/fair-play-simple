import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '@stores/index';
import { useAuthStore } from '@stores/authStore';
import { isFirebaseConfigured } from '@services/firebase';
import { getHistory, restoreSnapshot } from '@services/historyService';
import ConfirmDialog from '@components/ui/ConfirmDialog';
import type { DealHistoryEvent } from '@types';

function relativeTime(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const eventIcons: Record<string, string> = {
  deal: '🎲',
  reset: '🔄',
  restore: '⏪',
};

export default function MoreScreen() {
  const { t } = useTranslation();
  const { language, theme, setLanguage, setTheme } = useSettingsStore();
  const { signOut, isAuthenticated, user } = useAuthStore();

  const [historyExpanded, setHistoryExpanded] = useState(false);
  const [historyEvents, setHistoryEvents] = useState<DealHistoryEvent[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [restoreTarget, setRestoreTarget] = useState<DealHistoryEvent | null>(null);
  const [signOutConfirmOpen, setSignOutConfirmOpen] = useState(false);

  // Fix #12: Set document title on mount
  useEffect(() => {
    document.title = 'Settings — Fair Play';
  }, []);

  const handleToggleHistory = async () => {
    if (!historyExpanded) {
      setHistoryLoading(true);
      const events = await getHistory(20).catch(() => []);
      setHistoryEvents(events);
      setHistoryLoading(false);
    }
    setHistoryExpanded((v) => !v);
  };

  const handleRestore = async () => {
    if (!restoreTarget || !user) return;
    await restoreSnapshot(restoreTarget.id, user.uid).catch(console.error);
    setRestoreTarget(null);
    // Refresh history list
    const events = await getHistory(20).catch(() => []);
    setHistoryEvents(events);
  };

  const handleSignOut = () => {
    setSignOutConfirmOpen(false);
    signOut();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 pt-10 pb-6">
        <p className="text-xs font-display font-bold uppercase tracking-widest text-concrete mb-1">
          {t('navigation.more', 'More')}
        </p>
        <h1 className="text-3xl font-display font-bold text-ink leading-tight">
          {t('settings.title', 'Settings')}
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-2">
        {/* Language */}
        <div className="bg-white/80 dark:bg-white/10 rounded-2xl border border-gray-100/80 dark:border-white/10 shadow-soft-sm overflow-hidden">
          <div className="px-4 pt-4 pb-4">
            <p className="text-xs font-display font-semibold uppercase tracking-widest text-concrete mb-3">
              {t('settings.language', 'Language')}
            </p>
            <div className="flex bg-gray-100 dark:bg-white/10 rounded-xl p-1" role="tablist">
              {(['en', 'he'] as const).map((lang) => (
                <button
                  key={lang}
                  role="tab"
                  aria-selected={language === lang}
                  onClick={() => setLanguage(lang)}
                  className={`flex-1 py-2 rounded-[10px] text-sm font-display font-bold transition-all ${
                    language === lang
                      ? 'bg-white dark:bg-white/15 shadow-soft-sm text-ink'
                      : 'text-concrete hover:bg-white/50 active:scale-[0.98]'
                  }`}
                >
                  {lang === 'en' ? 'English' : 'עברית'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Theme */}
        <div className="bg-white/80 dark:bg-white/10 rounded-2xl border border-gray-100/80 dark:border-white/10 shadow-soft-sm overflow-hidden">
          <div className="px-4 pt-4 pb-4">
            <p className="text-xs font-display font-semibold uppercase tracking-widest text-concrete mb-3">
              {t('settings.theme', 'Appearance')}
            </p>
            <div className="flex bg-gray-100 dark:bg-white/10 rounded-xl p-1" role="tablist">
              {([
                { value: 'light', label: 'Light' },
                { value: 'dark', label: 'Dark' },
                { value: 'auto', label: 'Auto' },
              ] as const).map(({ value, label }) => (
                <button
                  key={value}
                  role="tab"
                  aria-selected={theme === value}
                  onClick={() => setTheme(value)}
                  className={`flex-1 py-2 rounded-[10px] text-sm font-display font-bold transition-all ${
                    theme === value
                      ? 'bg-white dark:bg-white/15 shadow-soft-sm text-ink'
                      : 'text-concrete hover:bg-white/50 active:scale-[0.98]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* History */}
        {isFirebaseConfigured && isAuthenticated && (
          <div className="bg-white/80 dark:bg-white/10 rounded-2xl border border-gray-100/80 dark:border-white/10 shadow-soft-sm overflow-hidden">
            <button
              onClick={handleToggleHistory}
              aria-expanded={historyExpanded}
              className="w-full px-5 py-4 flex items-center justify-between"
            >
              <p className="text-xs font-display font-semibold uppercase tracking-widest text-concrete">
                History
              </p>
              <span
                className="text-concrete/70"
                style={{
                  transform: historyExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                  transition: 'transform 200ms',
                  fontSize: 10,
                  display: 'inline-block',
                }}
              >
                ▶
              </span>
            </button>

            <div className={`expandable-grid ${historyExpanded ? 'open' : ''}`}>
              <div className="expandable-inner">
                <div className="px-5 pb-4">
                  {historyLoading ? (
                    <p className="text-sm font-body text-concrete py-2">Loading...</p>
                  ) : historyEvents.length === 0 ? (
                    <p className="text-sm font-body text-concrete py-2">
                      After you assign or redistribute cards, you'll see a timeline here.
                    </p>
                  ) : (
                    <div className="space-y-1.5">
                      {historyEvents.map((event) => (
                        <div
                          key={event.id}
                          className="flex items-center gap-3 py-2 px-3 rounded-xl bg-gray-50/60 dark:bg-white/5"
                        >
                          <span className="text-base">{eventIcons[event.type] || '📋'}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-display font-bold text-ink capitalize">
                              {event.label || event.type}
                            </p>
                            <p className="text-[10px] text-concrete">
                              {relativeTime(event.timestamp)}
                            </p>
                          </div>
                          <button
                            onClick={() => setRestoreTarget(event)}
                            className="text-[10px] px-2.5 py-1 bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 text-concrete font-display font-bold rounded-lg hover:bg-gray-50 dark:hover:bg-white/15 transition-colors"
                          >
                            Restore
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Spacer */}
        <div className="h-2" />

        {/* Sign out */}
        {isFirebaseConfigured && isAuthenticated && (
          <button
            onClick={() => setSignOutConfirmOpen(true)}
            className="w-full py-4 bg-white/80 rounded-2xl border border-gray-100/80 shadow-soft-sm text-sm font-display font-bold text-concrete hover:text-partner-a transition-colors"
          >
            {t('auth.signOut', 'Sign out')}
          </button>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!restoreTarget}
        title="Restore this state?"
        message={restoreTarget
          ? `This will reset all card assignments to the state from ${new Date(restoreTarget.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}. Your current assignments will be saved in history first.`
          : ''}
        confirmLabel="Restore"
        variant="default"
        onConfirm={handleRestore}
        onCancel={() => setRestoreTarget(null)}
      />

      <ConfirmDialog
        isOpen={signOutConfirmOpen}
        title="Sign out?"
        message="You'll need to sign in again to access your cards."
        confirmLabel="Sign out"
        variant="default"
        onConfirm={handleSignOut}
        onCancel={() => setSignOutConfirmOpen(false)}
      />
    </div>
  );
}
