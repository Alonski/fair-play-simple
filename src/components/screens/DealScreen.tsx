import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useCardStore, useGameStore } from '@stores/index';
import { useAuthStore } from '@stores/authStore';
import { saveSnapshot } from '@services/historyService';
import { recordEvent, recordDeal, recordReset, recordAssignment } from '@services/statsService';
import CardRow from '@components/cards/CardRow';
import CardModal from '@components/cards/CardModal';
import OnboardingScreen from '@components/screens/OnboardingScreen';
import { Button } from '@components/catalyst/button';
import { Select } from '@components/catalyst/select';
import { Divider } from '@components/catalyst/divider';
import ConfirmDialog from '@components/ui/ConfirmDialog';
import type { Card as CardType, CardStatus } from '@types';

type Segment = 'partner-a' | 'partner-b' | 'unassigned';

export default function DealScreen() {
  const { t } = useTranslation();
  const cards = useCardStore((state) => state.getCards());
  const { currentDealMode, setCurrentDealMode, partnerAName, partnerBName } = useGameStore();

  const userId = useAuthStore((s) => s.user?.uid ?? '');
  const readOnlyMode = useAuthStore((s) => s.readOnlyMode);

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [segment, setSegment] = useState<Segment>('unassigned');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editCard, setEditCard] = useState<CardType | undefined>();
  const [notInPlayExpanded, setNotInPlayExpanded] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showDealConfirm, setShowDealConfirm] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Deal — Fair Play';
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const partnerACards = cards.filter((c) => c.holder === 'partner-a' && c.status !== 'not-in-play');
  const partnerBCards = cards.filter((c) => c.holder === 'partner-b' && c.status !== 'not-in-play');
  const unassignedCards = cards.filter((c) => !c.holder && c.status !== 'not-in-play');
  const notInPlayCards = cards.filter((c) => c.status === 'not-in-play');

  const handleDeal = async () => {
    if (currentDealMode !== 'random') return;
    const unassigned = cards.filter((c) => !c.holder && c.status !== 'not-in-play');
    if (unassigned.length === 0) return;

    // Save snapshot before dealing
    await saveSnapshot('deal', userId).catch(console.error);

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
    setToast(t('game.cardsDealt', 'Cards dealt!'));
    recordDeal(userId, useCardStore.getState().getCards()).catch(console.error);
  };

  const handleDealConfirmed = async () => {
    setShowDealConfirm(false);
    await handleDeal();
  };

  const handleResetConfirmed = async () => {
    setShowResetConfirm(false);
    // Save snapshot before resetting
    await saveSnapshot('reset', userId).catch(console.error);
    useCardStore.setState((state) => ({
      cards: state.cards.map((c) =>
        c.status === 'not-in-play' || c.status === 'deleted' ? c : { ...c, holder: null, status: 'unassigned' as CardStatus }
      ),
    }));
    setSegment('unassigned');
    setToast(t('game.cardsReset', 'Cards reset'));
    recordReset(userId, useCardStore.getState().getCards()).catch(console.error);
  };

  const handleAssign = (cardId: string, holderId: 'partner-a' | 'partner-b' | null) => {
    const card = cards.find((c) => c.id === cardId);
    const prevHolder = card?.holder ?? null;
    useCardStore.setState((state) => ({
      cards: state.cards.map((c) =>
        c.id === cardId
          ? { ...c, holder: holderId, status: (holderId ? 'held' : 'unassigned') as CardStatus }
          : c
      ),
    }));
    if (card) {
      recordAssignment(userId, useCardStore.getState().getCards(), cardId, card.title.en, card.category, prevHolder, holderId).catch(console.error);
    }
  };

  const handleToggleNotInPlay = (card: CardType) => {
    const wasSkipped = card.status === 'not-in-play';
    useCardStore.setState((state) => ({
      cards: state.cards.map((c) =>
        c.id === card.id
          ? wasSkipped
            ? { ...c, status: 'unassigned' as CardStatus }
            : { ...c, status: 'not-in-play' as CardStatus, holder: null }
          : c
      ),
    }));
    recordEvent(wasSkipped ? 'card_unskipped' : 'card_skipped', userId, useCardStore.getState().getCards(), {
      cardId: card.id, cardTitle: card.title.en, category: card.category,
    }).catch(console.error);
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

  // Show onboarding when all cards are unassigned (first-time use)
  const noCardsAssigned = partnerACards.length === 0 && partnerBCards.length === 0;
  if (showOnboarding || (noCardsAssigned && cards.length > 0 && !localStorage.getItem('fp-onboarding-done'))) {
    return (
      <OnboardingScreen onComplete={() => {
        setShowOnboarding(false);
        localStorage.setItem('fp-onboarding-done', '1');
      }} />
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 pt-10 pb-4 bg-paper/80 dark:bg-paper/90">
        <p className="text-xs font-display font-bold uppercase tracking-widest text-concrete mb-1">
          {t('navigation.deal', 'Deal')}
        </p>
        <h1 className="text-3xl font-display font-bold text-ink leading-tight mb-3">
          Fair Play
        </h1>

        {/* Read-only mode indicator */}
        {readOnlyMode && (
          <p className="text-xs font-body text-concrete mb-3">
            {t('game.readOnly', 'Read-only mode — sign in to make changes')}
          </p>
        )}

        {/* Action row */}
        <div className="flex items-center gap-2 mb-3">
          <Select
            value={currentDealMode}
            onChange={(e) => setCurrentDealMode(e.target.value as typeof currentDealMode)}
            aria-label="Deal mode"
            className="min-w-0 flex-1"
          >
            <option value="random">{t('game.dealModes.random', 'Random')}</option>
          </Select>
          <Button
            color="dark/zinc"
            onClick={() => setShowDealConfirm(true)}
            disabled={unassignedCards.length === 0 || readOnlyMode}
            className="whitespace-nowrap"
          >
            {t('game.deal', 'Deal')}
          </Button>
          <Button
            outline
            onClick={() => setShowResetConfirm(true)}
            disabled={readOnlyMode}
            className="whitespace-nowrap"
          >
            {t('game.reset', 'Reset')}
          </Button>
          <Button
            outline
            onClick={() => { setEditCard(undefined); setIsModalOpen(true); }}
            aria-label="Add new card"
            className="shrink-0 !px-2.5"
          >
            +
          </Button>
        </div>

        {/* Toast feedback */}
        {toast && (
          <div
            className="mb-3 px-4 py-2 rounded-xl bg-accent/10 dark:bg-accent/20 text-accent text-xs font-display font-bold text-center flex items-center justify-center gap-2"
            style={{ animation: 'revealUp 0.3s ease forwards' }}
          >
            <span className="text-sm">✓</span>
            {toast}
          </div>
        )}

        {/* Balance bar */}
        {total > 0 && (
          <div
            className="mb-3"
            role="img"
            aria-label={`Card distribution: ${partnerACards.length} ${partnerAName}, ${partnerBCards.length} ${partnerBName}, ${unassignedCards.length} Unassigned`}
          >
            <div className="flex h-3 rounded-full overflow-hidden bg-gray-100 dark:bg-white/10 mb-2 shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)]">
              <div className="bg-gradient-to-b from-partner-a to-partner-a/90 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]" style={{ width: `${aFrac * 100}%` }} />
              <div className="bg-gradient-to-b from-partner-b to-partner-b/90 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]" style={{ width: `${bFrac * 100}%` }} />
              <div className="bg-gradient-to-b from-unassigned to-unassigned/80 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]" style={{ width: `${uFrac * 100}%` }} />
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
              <span className="flex items-center gap-1.5 ms-auto">
                <span className="w-2 h-2 rounded-full bg-unassigned" />
                <span className="font-bold text-concrete">{unassignedCards.length}</span>
                <span className="text-concrete">{t('cards.unassigned', 'Unassigned')}</span>
              </span>
            </div>
          </div>
        )}

        {/* Segment control */}
        <div className="flex bg-gray-100 dark:bg-white/10 rounded-xl p-1" role="tablist">
          {segments.map((seg) => {
            const isActive = segment === seg.id;
            const borderColor =
              seg.id === 'partner-a' ? 'border-partner-a' :
              seg.id === 'partner-b' ? 'border-partner-b' :
              'border-concrete';
            return (
              <button
                key={seg.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setSegment(seg.id)}
                className={`flex-1 py-2 px-1 rounded-xl text-xs font-display font-bold transition-all ${
                  isActive
                    ? `bg-white dark:bg-white/15 shadow-soft-sm text-ink border-b-2 ${borderColor}`
                    : 'text-concrete'
                }`}
              >
                {seg.label}
                {seg.count > 0 && (
                  <span className={`ml-1 ${isActive ? 'text-concrete' : 'text-concrete/70'}`}>
                    ({seg.count})
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Card list */}
      <div className="flex-1 overflow-y-auto px-5 pt-3 pb-4">
        {visibleCards.length === 0 && segment !== 'unassigned' ? (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <p className="text-sm font-body text-concrete">
              {t('cards.noneHere', 'No cards here')}
            </p>
          </div>
        ) : (
          <>
            {visibleCards.map((card, i) => (
              <CardRow
                key={card.id}
                card={card}
                index={i}
                dealMode={true}
                onAssign={(holderId) => handleAssign(card.id, holderId)}
                onToggleNotInPlay={() => handleToggleNotInPlay(card)}
                onEdit={() => { setEditCard(card); setIsModalOpen(true); }}
              />
            ))}

            {segment === 'unassigned' && visibleCards.length === 0 && (
              <div className="flex flex-col items-center justify-center h-32 text-center"
                style={{ animation: 'revealUp 0.4s ease forwards' }}
              >
                <span className="text-2xl mb-2" aria-hidden="true">🎉</span>
                <p className="text-sm font-display font-bold text-partner-b">
                  {t('game.allAssigned', 'All cards assigned!')}
                </p>
                <p className="text-xs text-concrete mt-1">{t('game.balanced', 'Your household is balanced')}</p>
              </div>
            )}

            {/* Not in Play collapsible section */}
            {segment === 'unassigned' && notInPlayCards.length > 0 && (
              <div className="mt-6">
                {visibleCards.length === 0 && <Divider soft className="mb-4" />}
                <button
                  onClick={() => setNotInPlayExpanded((v) => !v)}
                  aria-expanded={notInPlayExpanded}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-display font-bold text-concrete hover:bg-gray-50 transition-colors"
                >
                  <span style={{ fontSize: 8, transform: notInPlayExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 200ms', display: 'inline-block' }}>&#9654;</span>
                  {t('game.skipped', 'Skipped')} ({notInPlayCards.length})
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

      <ConfirmDialog
        isOpen={showDealConfirm}
        title="Deal cards?"
        message="This will randomly assign unassigned cards between partners. Continue?"
        confirmLabel="Deal"
        onConfirm={handleDealConfirmed}
        onCancel={() => setShowDealConfirm(false)}
      />

      <ConfirmDialog
        isOpen={showResetConfirm}
        title="Reset all cards?"
        message="This will unassign all cards and move them back to Unassigned. Your current assignments will be saved in history so you can restore them later."
        confirmLabel="Reset"
        variant="destructive"
        onConfirm={handleResetConfirmed}
        onCancel={() => setShowResetConfirm(false)}
      />
    </div>
  );
}
