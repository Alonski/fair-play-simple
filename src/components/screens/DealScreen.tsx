import { useState } from 'react';
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
  const [notInPlayExpanded, setNotInPlayExpanded] = useState(false);

  const partnerACards = cards.filter((c) => c.holder === 'partner-a' && c.status !== 'not-in-play');
  const partnerBCards = cards.filter((c) => c.holder === 'partner-b' && c.status !== 'not-in-play');
  const unassignedCards = cards.filter((c) => !c.holder && c.status !== 'not-in-play');
  const notInPlayCards = cards.filter((c) => c.status === 'not-in-play');

  const handleDeal = () => {
    if (currentDealMode !== 'random') return;
    const unassigned = cards.filter((c) => !c.holder && c.status !== 'not-in-play');
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
      cards: state.cards.map((c) =>
        c.status === 'not-in-play' ? c : { ...c, holder: null, status: 'unassigned' as CardStatus }
      ),
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

  const handleToggleNotInPlay = (card: CardType) => {
    useCardStore.setState((state) => ({
      cards: state.cards.map((c) =>
        c.id === card.id
          ? card.status === 'not-in-play'
            ? { ...c, status: 'unassigned' as CardStatus }
            : { ...c, status: 'not-in-play' as CardStatus, holder: null }
          : c
      ),
    }));
  };

  const activeCards = cards.filter((c) => c.status !== 'not-in-play');
  const total = activeCards.length;
  const aFrac = total > 0 ? partnerACards.length / total : 0;
  const bFrac = total > 0 ? partnerBCards.length / total : 0;
  const uFrac = total > 0 ? unassignedCards.length / total : 0;

  const segments: { id: Segment; label: string; count: number }[] = [
    { id: 'partner-a', label: partnerAName, count: partnerACards.length },
    { id: 'partner-b', label: partnerBName, count: partnerBCards.length },
    { id: 'unassigned', label: t('cards.unassigned', 'Unassigned'), count: unassignedCards.length },
  ];

  const visibleCards =
    segment === 'partner-a' ? partnerACards :
    segment === 'partner-b' ? partnerBCards :
    unassignedCards;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 pt-10 pb-4 bg-paper/80">
        <p className="text-xs font-display font-bold uppercase tracking-widest text-concrete mb-1">
          {t('navigation.deal', 'Deal')}
        </p>
        <h1 className="text-3xl font-display font-bold text-ink leading-tight mb-4">
          Fair Play
        </h1>

        {/* Action row */}
        <div className="flex items-center gap-2 mb-4">
          <select
            value={currentDealMode}
            onChange={(e) => setCurrentDealMode(e.target.value as typeof currentDealMode)}
            className="flex-1 px-3 py-2 rounded-xl border border-gray-200 bg-white font-display font-bold text-sm text-ink focus:outline-none focus:ring-2 focus:ring-partner-a/20 shadow-soft-sm"
          >
            <option value="random">{t('game.dealModes.random', 'Random')}</option>
            <option value="weighted" disabled>{t('game.dealModes.weighted', 'Weighted')}</option>
            <option value="draft" disabled>{t('game.dealModes.draft', 'Draft')}</option>
          </select>
          <button
            onClick={handleDeal}
            disabled={unassignedCards.length === 0}
            className="px-4 py-2 bg-ink text-white font-display font-bold rounded-xl text-sm shadow-soft-sm disabled:opacity-40 active:scale-95 transition-transform"
          >
            {t('game.deal', 'Deal')}
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-white border border-gray-200 text-ink font-display font-bold rounded-xl text-sm shadow-soft-sm active:scale-95 transition-transform"
          >
            {t('game.reset', 'Reset')}
          </button>
          <button
            onClick={() => { setEditCard(undefined); setIsModalOpen(true); }}
            className="w-9 h-9 bg-partner-a text-white font-display font-bold rounded-xl text-lg shadow-soft-sm active:scale-95 transition-transform flex items-center justify-center"
          >
            +
          </button>
        </div>

        {/* Balance bar */}
        {total > 0 && (
          <div className="mb-4">
            <div className="flex h-2 rounded-full overflow-hidden bg-gray-100 mb-2">
              <div className="bg-partner-a transition-all duration-500" style={{ width: `${aFrac * 100}%` }} />
              <div className="bg-partner-b transition-all duration-500" style={{ width: `${bFrac * 100}%` }} />
              <div className="bg-unassigned transition-all duration-500" style={{ width: `${uFrac * 100}%` }} />
            </div>
            <div className="flex items-center gap-4 text-xs font-body">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-partner-a" />
                <span className="font-bold text-partner-a">{partnerACards.length}</span>
                <span className="text-concrete">{partnerAName}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-partner-b" />
                <span className="font-bold text-partner-b">{partnerBCards.length}</span>
                <span className="text-concrete">{partnerBName}</span>
              </span>
              <span className="flex items-center gap-1.5 ml-auto">
                <span className="w-2 h-2 rounded-full bg-unassigned" />
                <span className="font-bold text-concrete">{unassignedCards.length}</span>
                <span className="text-concrete">{t('cards.unassigned', 'Unassigned')}</span>
              </span>
            </div>
          </div>
        )}

        {/* Segment control */}
        <div className="flex bg-gray-100 rounded-2xl p-1">
          {segments.map((seg) => (
            <button
              key={seg.id}
              onClick={() => setSegment(seg.id)}
              className={`flex-1 py-2 px-1 rounded-xl text-xs font-display font-bold transition-all ${
                segment === seg.id
                  ? 'bg-white shadow-soft-sm text-ink'
                  : 'text-concrete'
              }`}
            >
              {seg.label}
              {seg.count > 0 && (
                <span className={`ml-1 ${segment === seg.id ? 'text-concrete' : 'text-concrete/50'}`}>
                  ({seg.count})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Card list */}
      <div className="flex-1 overflow-y-auto px-4 pt-3 pb-4">
        {visibleCards.length === 0 && segment !== 'unassigned' ? (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <p className="text-sm font-body text-concrete">
              {t('cards.noneHere', 'No cards here')}
            </p>
          </div>
        ) : (
          <>
            {visibleCards.map((card) => (
              <CardRow
                key={card.id}
                card={card}
                dealMode={true}
                draggable={true}
                onAssign={(holderId) => handleAssign(card.id, holderId)}
                onToggleNotInPlay={() => handleToggleNotInPlay(card)}
                onEdit={() => { setEditCard(card); setIsModalOpen(true); }}
                onDragStart={(e) => {
                  e.dataTransfer.effectAllowed = 'move';
                  e.dataTransfer.setData('cardId', card.id);
                }}
              />
            ))}

            {segment === 'unassigned' && visibleCards.length === 0 && (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <p className="text-sm font-body text-concrete">
                  {t('game.allAssigned', 'All cards assigned')}
                </p>
              </div>
            )}

            {/* Not in Play collapsible section */}
            {segment === 'unassigned' && notInPlayCards.length > 0 && (
              <div className="mt-2">
                <button
                  onClick={() => setNotInPlayExpanded((v) => !v)}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-display font-bold text-concrete/70 hover:bg-gray-50 transition-colors"
                >
                  <span style={{ fontSize: 8, transform: notInPlayExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 200ms', display: 'inline-block' }}>▶</span>
                  Not in Play ({notInPlayCards.length})
                </button>
                {notInPlayExpanded && notInPlayCards.map((card) => (
                  <CardRow
                    key={card.id}
                    card={card}
                    dealMode={true}
                    onToggleNotInPlay={() => handleToggleNotInPlay(card)}
                    onEdit={() => { setEditCard(card); setIsModalOpen(true); }}
                  />
                ))}
              </div>
            )}
          </>
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
