import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '@stores/index';

export default function Navigation() {
  const { t } = useTranslation();
  const { setLanguage, language } = useSettingsStore();
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const navItems = [
    { id: 'dashboard', label: t('navigation.dashboard') },
    { id: 'gameBoard', label: t('navigation.gameBoard') },
    { id: 'cardGallery', label: t('navigation.cardGallery') },
    { id: 'insights', label: t('navigation.insights') },
    { id: 'settings', label: t('navigation.settings') },
  ];

  return (
    <nav className="bg-paper border-b-2 border-ink shadow-brutal-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="font-display text-xl sm:text-2xl font-bold text-ink">
              {t('common.appName')}
            </h1>
          </div>

          {/* Navigation items - desktop */}
          <div className="hidden md:flex gap-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
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

          {/* Language toggle and settings */}
          <div className="flex gap-4 items-center">
            <button
              onClick={() => setLanguage(language === 'en' ? 'he' : 'en')}
              className="px-3 py-1 bg-unassigned text-ink rounded-md font-body text-sm font-bold hover:shadow-brutal-sm transition-all"
            >
              {language === 'en' ? 'עברית' : 'English'}
            </button>
          </div>
        </div>

        {/* Mobile navigation */}
        <div className="md:hidden pb-4 flex gap-2 overflow-x-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
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
