import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useCardStore, useGameStore } from '@stores/index';
import CardRow from '@components/cards/CardRow';
import CardModal from '@components/cards/CardModal';
import type { Card as CardType, CardStatus } from '@types';

type Segment = 'partner-a' | 'partner-b' | 'unassigned';

export default function DealScreen() {
  const { t } = useTranslation();
  const cards = useCardStore((state) => state.getCards());
  const { currentDealMode, setCurrentDealMode, partnerAName, partnerBName } = useGameStore();

  const [segment, setSegment] = useState<Segment>('unassigned');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editCard, setEditCard] = useState<CardType | undefined>();

  const partnerACards = cards.filter((c) => c.holder === 'partner-a');
  const partnerBCards = cards.filter((c) => c.holder === 'partner-b');
  const unassignedCards = cards.filter((c) => !c.holder);

  // Auto-switch segment to unassigned if there are unassigned cards, else partner-a
  useEffect(() => {
    if (unassignedCards.length > 0 && segment === 'unassigned') return;
    if (unassignedCards.length === 0 && segment === 'unassigned') {
      setSegment('partner-a');
    }
  }, [unassignedCards.length]);

  const handleDeal = () => {
    if (currentDealMode !== 'random') return;
    const unassigned = cards.filter((c) => !c.holder);
    if (unassigned.length === 0) return;

    const shuffled = [...unassigned];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    useCardStore.setState((state) => ({
      cards: state.cards.map((c) => {
        const idx = shuffled.findIndex((s) => s.id === c.id);
        if (idx === -1) return c;
        return { ...c, holder: idx % 2 === 0 ? 'partner-a' : 'partner-b', status: 'held' as CardStatus };
      }),
    }));
    setSegment('partner-a');
  };

  const handleReset = () => {
    useCardStore.setState((state) => ({
      cards: state.cards.map((c) => ({ ...c, holder: null, status: 'unassigned' as CardStatus })),
    }));
    setSegment('unassigned');
  };

  const handleAssign = (cardId: string, holderId: 'partner-a' | 'partner-b' | null) => {
    useCardStore.setState((state) => ({
      cards: state.cards.map((c) =>
        c.id === cardId
          ? { ...c, holder: holderId, status: (holderId ? 'held' : 'unassigned') as CardStatus }
          : c
      ),
    }));
  };

  const visibleCards: CardType[] =
    segment === 'partner-a'
      ? partnerACards
      : segment === 'partner-b'
      ? partnerBCards
      : unassignedCards;

  const segmentLabel = (seg: Segment) => {
    if (seg === 'partner-a') return partnerAName;
    if (seg === 'partner-b') return partnerBName;
    return t('cards.unassigned', 'Unassigned');
  };

  const segmentCount = (seg: Segment) => {
    if (seg === 'partner-a') return partnerACards.length;
    if (seg === 'partner-b') return partnerBCards.length;
    return unassignedCards.length;
  };

  const segments: Segment[] = ['partner-a', 'partner-b', 'unassigned'];

  return (
    <div className="flex flex-col h-full">
      {/* Screen header */}
      <div className="px-4 pt-5 pb-2">
        <h1 className="text-display-sm font-display font-bold text-ink mb-3">
          {t('navigation.deal', 'Deal')}
        </h1>

        {/* Deal controls row */}
        <div className="flex items-center gap-2 mb-3">
          <select
            value={currentDealMode}
            onChange={(e) => setCurrentDealMode(e.target.value as typeof currentDealMode)}
            className="flex-1 px-3 py-2 rounded-xl border border-gray-200 bg-white font-display font-bold text-sm text-ink focus:outline-none focus:ring-2 focus:ring-partner-a/30"
          >
            <option value="random">{t('game.dealModes.random', 'Random')}</option>
            <option value="weighted" disabled>{t('game.dealModes.weighted', 'Weighted')}</option>
            <option value="draft" disabled>{t('game.dealModes.draft', 'Draft')}</option>
          </select>
          <button
            onClick={handleDeal}
            disabled={unassignedCards.length === 0}
            className="px-4 py-2 bg-ink text-white font-display font-bold rounded-xl text-sm disabled:opacity-40"
          >
            {t('game.deal', 'Deal')}
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-100 text-ink font-display font-bold rounded-xl text-sm"
          >
            {t('game.reset', 'Reset')}
          </button>
          <button
            onClick={() => { setEditCard(undefined); setIsModalOpen(true); }}
            className="px-4 py-2 bg-partner-a text-white font-display font-bold rounded-xl text-sm"
          >
            +
          </button>
        </div>

        {/* Balance bar */}
        <div className="flex items-center gap-3 mb-3 text-sm font-body">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-partner-a" />
            <span className="font-bold text-partner-a">{partnerACards.length}</span>
            <span className="text-concrete">{partnerAName}</span>
          </span>
          <span className="text-concrete/40">&middot;</span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-partner-b" />
            <span className="font-bold text-partner-b">{partnerBCards.length}</span>
            <span className="text-concrete">{partnerBName}</span>
          </span>
          <span className="text-concrete/40">&middot;</span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-unassigned" />
            <span className="font-bold text-unassigned">{unassignedCards.length}</span>
            <span className="text-concrete">{t('cards.unassigned', 'Unassigned')}</span>
          </span>
        </div>

        {/* Segment control */}
        <div className="flex bg-gray-100 rounded-xl p-0.5 mb-1">
          {segments.map((seg) => (
            <button
              key={seg}
              onClick={() => setSegment(seg)}
              className={`flex-1 py-1.5 rounded-[10px] text-xs font-display font-bold transition-all ${
                segment === seg
                  ? 'bg-white shadow-soft-sm text-ink'
                  : 'text-concrete'
              }`}
            >
              {segmentLabel(seg)} {segmentCount(seg) > 0 && `(${segmentCount(seg)})`}
            </button>
          ))}
        </div>
      </div>

      {/* Card list */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {visibleCards.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <p className="text-sm font-body text-concrete">
              {segment === 'unassigned'
                ? t('game.allAssigned', 'All cards are assigned')
                : t('cards.noneHere', 'No cards here')}
            </p>
          </div>
        ) : (
          visibleCards.map((card) => (
            <CardRow
              key={card.id}
              card={card}
              dealMode={true}
              draggable={true}
              onAssign={(holderId) => handleAssign(card.id, holderId)}
              onEdit={() => { setEditCard(card); setIsModalOpen(true); }}
              onDragStart={(e) => {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('cardId', card.id);
              }}
            />
          ))
        )}
      </div>

      <CardModal
        isOpen={isModalOpen}
        card={editCard}
        onClose={() => { setIsModalOpen(false); setEditCard(undefined); }}
        onSuccess={() => {}}
      />
    </div>
  );
}
