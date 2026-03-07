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
      <div className="px-4 pt-5 pb-3">
        <h1 className="text-display-sm font-display font-bold text-ink">
          {t('settings.title', 'Settings')}
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
        {/* Language */}
        <div className="bg-white/80 rounded-2xl p-4 border border-gray-100">
          <p className="text-xs font-bold text-concrete uppercase tracking-wider mb-3">
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
                {lang === 'en' ? 'English' : 'עברית'}
              </button>
            ))}
          </div>
        </div>

        {/* Theme */}
        <div className="bg-white/80 rounded-2xl p-4 border border-gray-100">
          <p className="text-xs font-bold text-concrete uppercase tracking-wider mb-3">
            {t('settings.theme', 'Theme')}
          </p>
          <div className="flex bg-gray-100 rounded-xl p-0.5">
            {(['light', 'dark', 'auto'] as const).map((t_) => (
              <button
                key={t_}
                onClick={() => setTheme(t_)}
                className={`flex-1 py-2 rounded-[10px] text-sm font-display font-bold transition-all capitalize ${
                  theme === t_
                    ? 'bg-white shadow-soft-sm text-ink'
                    : 'text-concrete'
                }`}
              >
                {t_}
              </button>
            ))}
          </div>
        </div>

        {/* Sign out */}
        {isFirebaseConfigured && isAuthenticated && (
          <button
            onClick={() => signOut()}
            className="w-full py-4 bg-white/80 rounded-2xl border border-gray-100 text-sm font-display font-bold text-concrete hover:text-ink transition-colors"
          >
            {t('auth.signOut', 'Sign out')}
          </button>
        )}
      </div>
    </div>
  );
}
