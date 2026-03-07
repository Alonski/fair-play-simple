import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '@stores/index';
import { useAuthStore } from '@stores/authStore';
import { isFirebaseConfigured } from '@services/firebase';

export default function MoreScreen() {
  const { t } = useTranslation();
  const { language, theme, setLanguage, setTheme } = useSettingsStore();
  const { signOut, isAuthenticated } = useAuthStore();

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

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
        {/* Language */}
        <div className="bg-white/80 rounded-2xl border border-gray-100/80 shadow-soft-sm overflow-hidden">
          <div className="px-4 pt-4 pb-3">
            <p className="text-[10px] font-display font-bold uppercase tracking-widest text-concrete/70 mb-3">
              {t('settings.language', 'Language')}
            </p>
            <div className="flex bg-gray-100 rounded-xl p-0.5">
              {(['en', 'he'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`flex-1 py-2 rounded-[10px] text-sm font-display font-bold transition-all ${
                    language === lang
                      ? 'bg-white shadow-soft-sm text-ink'
                      : 'text-concrete'
                  }`}
                >
                  {lang === 'en' ? '🇬🇧 English' : '🇮🇱 עברית'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Theme */}
        <div className="bg-white/80 rounded-2xl border border-gray-100/80 shadow-soft-sm overflow-hidden">
          <div className="px-4 pt-4 pb-3">
            <p className="text-[10px] font-display font-bold uppercase tracking-widest text-concrete/70 mb-3">
              {t('settings.theme', 'Appearance')}
            </p>
            <div className="flex bg-gray-100 rounded-xl p-0.5">
              {([
                { value: 'light', label: '☀️ Light' },
                { value: 'dark', label: '🌙 Dark' },
                { value: 'auto', label: '⚙️ Auto' },
              ] as const).map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  className={`flex-1 py-2 rounded-[10px] text-sm font-display font-bold transition-all ${
                    theme === value
                      ? 'bg-white shadow-soft-sm text-ink'
                      : 'text-concrete'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Spacer */}
        <div className="h-2" />

        {/* Sign out */}
        {isFirebaseConfigured && isAuthenticated && (
          <button
            onClick={() => signOut()}
            className="w-full py-4 bg-white/80 rounded-2xl border border-gray-100/80 shadow-soft-sm text-sm font-display font-bold text-concrete/70 hover:text-partner-a transition-colors"
          >
            {t('auth.signOut', 'Sign out')}
          </button>
        )}
      </div>
    </div>
  );
}
