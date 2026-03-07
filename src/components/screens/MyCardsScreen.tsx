import { useTranslation } from 'react-i18next';
import { useCardStore } from '@stores/index';
import { useAuthStore } from '@stores/authStore';
import { useGameStore } from '@stores/gameStore';
import CardRow from '@components/cards/CardRow';

export default function MyCardsScreen() {
  const { t } = useTranslation();
  const cards = useCardStore((state) => state.getCards());
  const mySlot = useAuthStore((state) => state.profile?.partnerSlot);
  const { partnerAName, partnerBName } = useGameStore();

  const myCards = mySlot ? cards.filter((c) => c.holder === mySlot) : [];
  const totalTime = myCards.reduce((sum, c) => sum + c.metadata.timeEstimate, 0);
  const myName = mySlot === 'partner-a' ? partnerAName : partnerBName;

  const dotColor = mySlot === 'partner-a' ? 'bg-partner-a' : 'bg-partner-b';

  return (
    <div className="flex flex-col h-full">
      {/* Screen header */}
      <div className="px-4 pt-5 pb-3">
        <h1 className="text-display-sm font-display font-bold text-ink">
          {t('navigation.myCards', 'My Cards')}
        </h1>
        {mySlot && (
          <div className="flex items-center gap-2 mt-1">
            <span className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
            <span className="text-sm font-body text-concrete">
              {myName} &middot; {myCards.length} {t('game.cards', 'cards')} &middot; {totalTime}m/{t('game.week', 'week')}
            </span>
          </div>
        )}
      </div>

      {/* Card list */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {myCards.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <p className="text-lg font-display font-bold text-concrete mb-2">
              {t('cards.noMyCards', 'No cards yet')}
            </p>
            <p className="text-sm font-body text-concrete/70">
              {t('cards.noMyCardsHint', 'Go to Deal to assign cards.')}
            </p>
          </div>
        ) : (
          myCards.map((card) => (
            <CardRow key={card.id} card={card} />
          ))
        )}
      </div>
    </div>
  );
}
