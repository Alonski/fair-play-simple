import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from '@tanstack/react-router';
import { useCardStore } from '@stores/index';
import { useAuthStore } from '@stores/authStore';
import { useGameStore } from '@stores/gameStore';
import CardRow from '@components/cards/CardRow';

function formatTime(minutes: number): string {
  if (minutes >= 60) {
    const h = minutes / 60;
    return h % 1 === 0 ? `${h}h` : `${h.toFixed(1)}h`;
  }
  return `${minutes}m`;
}

export default function MyCardsScreen() {
  const { t } = useTranslation();
  const cards = useCardStore((state) => state.getCards());
  const mySlot = useAuthStore((state) => state.profile?.partnerSlot);
  const { partnerAName, partnerBName } = useGameStore();

  useEffect(() => {
    document.title = 'My Cards — Fair Play';
  }, []);

  const myCards = mySlot ? cards.filter((c) => c.holder === mySlot && c.status !== 'not-in-play') : [];
  const totalTime = myCards.reduce((sum, c) => sum + c.metadata.timeEstimate, 0);
  const myName = mySlot === 'partner-a' ? partnerAName : partnerBName;
  const isA = mySlot === 'partner-a';

  return (
    <div className="flex flex-col h-full">
      {/* Header — gradient wash with partner colour */}
      <div
        className="relative px-5 pt-10 pb-6 overflow-hidden"
        style={{
          background: isA
            ? 'linear-gradient(160deg, var(--color-partner-a-light) 0%, var(--color-paper) 60%)'
            : 'linear-gradient(160deg, var(--color-partner-b-light) 0%, var(--color-paper) 60%)',
        }}
      >
        {/* Decorative circle */}
        <div
          className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-20"
          style={{ background: isA ? 'var(--color-partner-a)' : 'var(--color-partner-b)' }}
        />

        <p className="text-xs font-display font-bold uppercase tracking-widest text-concrete mb-1 relative">
          {t('navigation.myCards', 'My Cards')}
        </p>
        <h1 className="text-3xl font-display font-bold text-ink relative leading-tight">
          {myName || t('common.loading', 'Loading...')}
        </h1>

        {mySlot && myCards.length > 0 && (
          <div className="flex items-center gap-3 mt-3 relative">
            <span
              className="px-3 py-1 rounded-full text-xs font-display font-bold"
              style={{
                background: isA ? 'var(--color-partner-a-light)' : 'var(--color-partner-b-light)',
                color: isA ? 'var(--color-partner-a)' : 'var(--color-partner-b)',
                border: `1px solid color-mix(in srgb, ${isA ? 'var(--color-partner-a)' : 'var(--color-partner-b)'} 20%, transparent)`,
              }}
            >
              {myCards.length} {myCards.length === 1 ? 'card' : 'cards'}
            </span>
            <span className="text-xs text-concrete font-body">
              {formatTime(totalTime)} / {t('game.week', 'week')}
            </span>
          </div>
        )}
      </div>

      {/* Card list */}
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-4">
        {myCards.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-52 text-center px-8">
            <div className="text-4xl mb-4" aria-hidden="true">🃏</div>
            <p className="font-display font-bold text-ink text-lg mb-1">
              {t('cards.noMyCards', 'No cards yet')}
            </p>
            <p className="text-sm text-concrete font-body mb-3 leading-relaxed">
              {t('cards.noMyCardsExplain', 'Cards are household responsibilities you own — things like groceries, school pickup, or bedtime routine.')}
            </p>
            <Link
              to="/deal"
              className="text-sm font-body text-partner-a font-bold leading-relaxed px-4 py-2 bg-partner-a/10 rounded-xl inline-block underline underline-offset-2 hover:bg-partner-a/20 transition-colors"
            >
              {t('cards.noMyCardsHint', 'Head to Deal to assign cards →')}
            </Link>
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
