import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useCardStore, useGameStore } from '@stores/index';
import { useAuthStore } from '@stores/authStore';
import Card from '@components/cards/Card';
import CardModal from '@components/cards/CardModal';
import PartnerZone from './PartnerZone';
import type { Card as CardType, Partner, DealMode, CardStatus } from '@types';

interface GameBoardProps {
  onDeal?: (mode: DealMode) => void;
}

export default function GameBoard({ onDeal }: GameBoardProps) {
  const { t } = useTranslation();
  const cards = useCardStore((state) => state.getCards());
  const { currentDealMode, setCurrentDealMode, partnerAName, partnerBName, setPartnerAName, setPartnerBName } = useGameStore();
  const myPartnerSlot = useAuthStore((state) => state.profile?.partnerSlot);

  const [unassignedCards, setUnassignedCards] = useState<CardType[]>([]);
  const [partnerACards, setPartnerACards] = useState<CardType[]>([]);
  const [partnerBCards, setPartnerBCards] = useState<CardType[]>([]);
  const [activeTab, setActiveTab] = useState<'deal' | 'gallery'>('deal');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editCard, setEditCard] = useState<CardType | undefined>();
  const [unassignedDragOver, setUnassignedDragOver] = useState(false);
  const [tappedCardId, setTappedCardId] = useState<string | null>(null);

  const partners: Partner[] = [
    {
      id: 'partner-a',
      name: partnerAName,
      avatar: { type: 'avatar-builder', data: 'A' },
      preferences: { favoriteCards: [], avoidCards: [], strongSuits: ['home'], availability: {} },
      stats: { currentCards: 0, totalTimeCommitment: 0, streaks: [], achievements: [] },
      theme: { color: '#E07A8E', pattern: { type: 'solid', color: '#E07A8E' }, icon: 'A' },
    },
    {
      id: 'partner-b',
      name: partnerBName,
      avatar: { type: 'avatar-builder', data: 'B' },
      preferences: { favoriteCards: [], avoidCards: [], strongSuits: ['caregiving'], availability: {} },
      stats: { currentCards: 0, totalTimeCommitment: 0, streaks: [], achievements: [] },
      theme: { color: '#7FB69E', pattern: { type: 'solid', color: '#7FB69E' }, icon: 'B' },
    },
  ];

  useEffect(() => {
    setUnassignedCards(cards.filter((c) => !c.holder || c.holder === null));
    setPartnerACards(cards.filter((c) => c.holder === 'partner-a'));
    setPartnerBCards(cards.filter((c) => c.holder === 'partner-b'));
  }, [cards]);

  const dealModes: DealMode[] = ['random', 'weighted', 'draft', 'auction', 'quick'];

  const handleDealMode = (mode: DealMode) => {
    setCurrentDealMode(mode);
    onDeal?.(mode);
  };

  const handleDealCards = () => {
    if (currentDealMode !== 'random') return;
    const unassigned = cards.filter((c) => !c.holder);
    if (unassigned.length === 0) return;

    const shuffled = [...unassigned];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const updates: Record<string, CardType['holder']> = {};
    shuffled.forEach((card, index) => {
      updates[card.id] = index % 2 === 0 ? 'partner-a' : 'partner-b';
    });

    useCardStore.setState((state) => ({
      cards: state.cards.map((c) =>
        updates[c.id] ? { ...c, holder: updates[c.id], status: 'held' as CardStatus } : c
      ),
    }));
  };

  const handleResetDeal = () => {
    setTappedCardId(null);
    useCardStore.setState((state) => ({
      cards: state.cards.map((c) => ({ ...c, holder: null, status: 'unassigned' as CardStatus })),
    }));
  };

  const handleCardDrop = (cardId: string, holderId: string | null) => {
    const card = cards.find((c) => c.id === cardId);
    if (card) {
      useCardStore.setState((state) => ({
        cards: state.cards.map((c) =>
          c.id === cardId
            ? { ...c, holder: holderId as CardType['holder'], status: (holderId ? 'held' : 'unassigned') as CardStatus }
            : c
        ),
      }));
    }
  };

  const handleCardTap = (cardId: string) => {
    setTappedCardId(tappedCardId === cardId ? null : cardId);
  };

  const handleZoneTapAssign = (holderId: string | null) => {
    if (tappedCardId) {
      handleCardDrop(tappedCardId, holderId);
      setTappedCardId(null);
    }
  };

  const handleOpenCreateModal = () => {
    setEditCard(undefined);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (card: CardType) => {
    setEditCard(card);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditCard(undefined);
  };

  const getTimeCommitment = (cardList: CardType[]) => {
    return cardList.reduce((sum, card) => sum + card.metadata.timeEstimate, 0);
  };

  const tappedCard = tappedCardId ? cards.find((c) => c.id === tappedCardId) : null;

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-display-md font-display font-bold text-ink">
            {t('navigation.gameBoard')}
          </h2>
          <motion.button
            onClick={handleOpenCreateModal}
            className="px-4 py-2 bg-partner-a text-white font-display font-bold rounded-xl hover:shadow-soft-lg transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            + {t('game.newCard')}
          </motion.button>
        </div>

        {/* Deal mode selector */}
        <div className="flex gap-3 flex-wrap mb-4">
          {dealModes.map((mode) => (
            <motion.button
              key={mode}
              onClick={() => handleDealMode(mode)}
              disabled={mode !== 'random'}
              className={`px-4 py-2 rounded-xl font-display font-bold transition-all ${
                currentDealMode === mode
                  ? 'bg-partner-a text-white shadow-soft'
                  : mode !== 'random'
                  ? 'bg-gray-100 text-concrete/50 cursor-not-allowed'
                  : 'bg-gray-100 text-ink hover:bg-gray-200'
              }`}
              whileHover={mode === 'random' ? { scale: 1.02 } : {}}
              whileTap={mode === 'random' ? { scale: 0.98 } : {}}
            >
              {t(`game.dealModes.${mode}`)}
              {mode !== 'random' && <span className="ml-1 text-xs">({t('game.comingSoon')})</span>}
            </motion.button>
          ))}
        </div>

        {/* Deal action buttons */}
        <div className="flex gap-3 mb-6">
          <motion.button
            onClick={handleDealCards}
            className="px-6 py-2.5 bg-ink text-white font-display font-bold rounded-xl hover:shadow-soft-lg transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {t('game.deal')}
          </motion.button>
          <motion.button
            onClick={handleResetDeal}
            className="px-6 py-2.5 bg-gray-100 text-ink font-display font-bold rounded-xl hover:bg-gray-200 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {t('game.reset')}
          </motion.button>
        </div>

        {/* Tab selector */}
        <div className="flex gap-2 border-b border-gray-200">
          {(['deal', 'gallery'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-display font-bold transition-colors ${
                activeTab === tab
                  ? 'text-partner-a border-b-2 border-partner-a'
                  : 'text-concrete hover:text-ink'
              }`}
            >
              {tab === 'deal' ? t('game.dealTab') : t('game.galleryTab')}
            </button>
          ))}
        </div>
      </div>

      {/* Tap-to-assign banner (mobile) */}
      {tappedCard && (
        <motion.div
          className="mb-4 p-3 bg-accent/10 text-ink border border-accent/20 rounded-xl flex items-center justify-between"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="font-display font-bold text-sm">
            {t('game.tapToAssign', { card: tappedCard.title.en })}
          </span>
          <button
            onClick={() => setTappedCardId(null)}
            className="ml-4 px-3 py-1 bg-gray-100 rounded-lg text-xs font-bold hover:bg-gray-200 transition-colors"
          >
            {t('common.cancel')}
          </button>
        </motion.div>
      )}

      {/* Main Content */}
      {activeTab === 'deal' ? (
        <div className="space-y-8">
          {/* Partner Zones */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {partners.map((partner) => (
              <PartnerZone
                key={partner.id}
                partner={partner}
                cards={partner.id === 'partner-a' ? partnerACards : partnerBCards}
                onCardDrop={(cardId) => handleCardDrop(cardId, partner.id)}
                onNameChange={(name) =>
                  partner.id === 'partner-a' ? setPartnerAName(name) : setPartnerBName(name)
                }
                onTapAssign={() => handleZoneTapAssign(partner.id)}
                onCardTap={handleCardTap}
                tappedCardId={tappedCardId}
                isActive={true}
                totalTime={getTimeCommitment(
                  partner.id === 'partner-a' ? partnerACards : partnerBCards
                )}
              />
            ))}
          </div>

          {/* Unassigned Cards Section */}
          <motion.div
            className={`bg-unassigned-light border border-unassigned/20 rounded-2xl p-6 transition-all ${
              unassignedDragOver ? 'ring-2 ring-accent/30 shadow-soft-lg' : ''
            } ${tappedCardId ? 'cursor-pointer' : ''}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onDragOver={(e) => { e.preventDefault(); setUnassignedDragOver(true); }}
            onDragLeave={() => setUnassignedDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setUnassignedDragOver(false);
              const cardId = e.dataTransfer.getData('cardId');
              if (cardId) handleCardDrop(cardId, null);
            }}
            onClick={() => {
              if (tappedCardId) handleZoneTapAssign(null);
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-bold text-ink">
                {t('cards.unassigned')} ({unassignedCards.length})
              </h3>
              {tappedCardId && (
                <span className="text-xs font-bold text-unassigned animate-pulse">
                  {t('game.tapHereToUnassign')}
                </span>
              )}
            </div>

            {unassignedCards.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {unassignedCards.map((card, index) => (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`group relative ${tappedCardId === card.id ? 'ring-2 ring-accent rounded-2xl' : ''}`}
                  >
                    <Card
                      card={card}
                      draggable={true}
                      isSelected={tappedCardId === card.id}
                      onClick={() => handleCardTap(card.id)}
                      onDragStart={(e) => {
                        e.dataTransfer.effectAllowed = 'move';
                        e.dataTransfer.setData('cardId', card.id);
                      }}
                    />
                    <button
                      onClick={(e) => { e.stopPropagation(); handleOpenEditModal(card); }}
                      className="absolute top-2 right-2 p-1.5 bg-white/90 text-concrete rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-soft-sm hover:text-ink"
                      title={t('common.edit')}
                    >
                      Edit
                    </button>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                className="text-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <p className="text-lg font-display font-bold text-concrete mb-2">
                  {t('game.allAssigned')}
                </p>
                <p className="text-sm font-body text-concrete/70">
                  {t('game.allAssignedDesc')}
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      ) : (
        // Gallery Tab
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {cards.length > 0 ? (
            cards.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="group relative"
              >
                <Card
                  card={card}
                  draggable={true}
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('cardId', card.id);
                  }}
                />
                <button
                  onClick={() => handleOpenEditModal(card)}
                  className="absolute top-2 right-2 p-1.5 bg-white/90 text-concrete rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-soft-sm hover:text-ink"
                  title={t('common.edit')}
                >
                  Edit
                </button>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-20">
              <p className="text-lg font-display font-bold text-concrete mb-2">
                {t('cards.noCards')}
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* Card Modal */}
      <CardModal
        isOpen={isModalOpen}
        card={editCard}
        onClose={handleCloseModal}
        onSuccess={() => {}}
      />

      {/* Summary Footer */}
      <motion.div
        className="mt-8 pt-6 border-t border-gray-200 grid grid-cols-3 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="text-center p-4 bg-partner-a-light rounded-2xl">
          <p className="text-sm font-body text-concrete mb-2">
            {partnerAName}
            {myPartnerSlot === 'partner-a' && (
              <span className="ml-1 text-xs bg-partner-a text-white px-1.5 py-0.5 rounded-full font-bold">
                {t('game.you', 'You')}
              </span>
            )}
          </p>
          <p className="text-2xl font-display font-bold text-partner-a">{partnerACards.length}</p>
          <p className="text-xs text-concrete/70 mt-1">{getTimeCommitment(partnerACards)}m/{t('game.week')}</p>
        </div>
        <div className="text-center p-4 bg-unassigned-light rounded-2xl">
          <p className="text-sm font-body text-concrete mb-2">{t('cards.unassigned')}</p>
          <p className="text-2xl font-display font-bold text-unassigned">{unassignedCards.length}</p>
          <p className="text-xs text-concrete/70 mt-1">{getTimeCommitment(unassignedCards)}m</p>
        </div>
        <div className="text-center p-4 bg-partner-b-light rounded-2xl">
          <p className="text-sm font-body text-concrete mb-2">
            {partnerBName}
            {myPartnerSlot === 'partner-b' && (
              <span className="ml-1 text-xs bg-partner-b text-white px-1.5 py-0.5 rounded-full font-bold">
                {t('game.you', 'You')}
              </span>
            )}
          </p>
          <p className="text-2xl font-display font-bold text-partner-b">{partnerBCards.length}</p>
          <p className="text-xs text-concrete/70 mt-1">{getTimeCommitment(partnerBCards)}m/{t('game.week')}</p>
        </div>
      </motion.div>
    </div>
  );
}
