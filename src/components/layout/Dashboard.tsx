import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Dashboard component - main landing/overview page
 */
export default function Dashboard() {
  const { t } = useTranslation();

  return (
    <div className="relative z-10 min-h-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-20">
          <h2 className="text-display-lg font-display font-bold text-ink mb-6">
            Welcome to Fair Play Deck
          </h2>
          <p className="text-lg font-body text-concrete mb-8 max-w-2xl mx-auto">
            {t('common.appDescription')}
          </p>

          {/* Placeholder cards showing the app is loading */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-paper border-2 border-ink p-8 rounded-lg brutalist-border animate-pulse"
              >
                <div className="h-8 bg-unassigned rounded mb-4" />
                <div className="h-4 bg-concrete rounded mb-2" />
                <div className="h-4 bg-concrete rounded w-3/4" />
              </div>
            ))}
          </div>

          {/* Call to action */}
          <button className="mt-12 px-8 py-3 bg-partner-a text-paper font-display font-bold rounded-lg hover:shadow-brutal-sm transition-all">
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}
