import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import GameBoard from '@components/game/GameBoard';
import { useCardStore } from '@stores/index';

/**
 * Dashboard component - main landing/overview or game board page
 */
export default function Dashboard() {
  const { t } = useTranslation();
  const cards = useCardStore((state) => state.getCards());
  const [hasCards, setHasCards] = useState(false);

  useEffect(() => {
    setHasCards(cards.length > 0);
  }, [cards]);

  if (hasCards) {
    return <GameBoard />;
  }

  return (
    <div className="relative z-10 min-h-full flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="text-center py-20">
          <h2 className="text-display-lg font-display font-bold text-ink mb-6">
            Welcome to Fair Play Deck
          </h2>
          <p className="text-lg font-body text-concrete mb-8 max-w-2xl mx-auto">
            {t('common.appDescription')}
          </p>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 mb-12">
            {[
              {
                title: 'Deal Cards',
                description: 'Distribute household tasks fairly',
                icon: '🎴',
              },
              {
                title: 'Negotiate',
                description: 'Swap and adjust assignments',
                icon: '🤝',
              },
              {
                title: 'Track Time',
                description: 'Monitor workload balance',
                icon: '⏱️',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-paper border-3 border-ink p-8 rounded-lg brutalist-border hover:shadow-brutal transition-all stagger-{i+1}"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="font-display text-lg font-bold text-ink mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm font-body text-concrete">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Call to action */}
          <p className="text-sm font-body text-concrete/70 mb-6">
            The app is ready to use! Navigate to the Game Board tab to start.
          </p>
          <button className="px-8 py-3 bg-partner-a text-paper font-display font-bold rounded-lg hover:shadow-brutal transition-all animate-pulse">
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}
