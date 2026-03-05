import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@stores/authStore';
import { isSupabaseConfigured } from '@services/supabase';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const { t } = useTranslation();
  const { signOut, isAuthenticated } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { id: 'gameBoard', label: t('navigation.gameBoard'), icon: '\u2261' },
    { id: 'cardGallery', label: t('navigation.cardGallery'), icon: '\u25A6' },
    { id: 'settings', label: t('navigation.settings'), icon: '\u2699' },
  ];

  const handleNav = (id: string) => {
    onTabChange(id);
    setMenuOpen(false);
  };

  return (
    <>
      <nav className="bg-white/85 backdrop-blur-md border-b border-gray-200 px-4 py-3 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="font-display text-lg font-bold text-ink">
            {t('common.appName')}
          </h1>

          {/* Hamburger button */}
          <button
            onClick={() => setMenuOpen(true)}
            className="w-9 h-9 rounded-xl border border-gray-200 bg-white flex flex-col items-center justify-center gap-1 hover:shadow-soft-sm transition-shadow"
            aria-label="Open menu"
          >
            <span className="block w-4 h-0.5 bg-ink rounded-full" />
            <span className="block w-4 h-0.5 bg-ink rounded-full" />
            <span className="block w-4 h-0.5 bg-ink rounded-full" />
          </button>
        </div>
      </nav>

      {/* Overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/25 backdrop-blur-sm z-[200] transition-opacity"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Slide-out menu */}
      <div
        className={`fixed top-0 right-0 w-72 h-full bg-white z-[201] shadow-soft-lg transform transition-transform duration-250 ease-out ${
          menuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6 flex flex-col h-full">
          {/* Close button */}
          <button
            onClick={() => setMenuOpen(false)}
            className="self-end w-8 h-8 bg-gray-100 rounded-lg text-concrete text-lg flex items-center justify-center mb-6"
            aria-label="Close menu"
          >
            &times;
          </button>

          {/* Menu items */}
          <div className="flex-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center gap-3 py-3.5 border-b border-gray-100 font-display font-semibold text-[15px] transition-colors ${
                  activeTab === item.id
                    ? 'text-partner-a'
                    : 'text-ink hover:text-partner-a'
                }`}
              >
                <span className="w-5 text-center text-base">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>

          {/* Sign out */}
          {isSupabaseConfigured && isAuthenticated && (
            <button
              onClick={() => { signOut(); setMenuOpen(false); }}
              className="w-full py-3 text-center text-sm text-concrete font-body hover:text-ink transition-colors border-t border-gray-100"
            >
              {t('auth.signOut', 'Sign out')}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
