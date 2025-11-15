import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useCardStore, useGameStore } from '@stores/index';
import Card from '@components/cards/Card';
import CardModal from '@components/cards/CardModal';
import PartnerZone from './PartnerZone';
import type { Card as CardType, Partner, DealMode } from '@types';

interface GameBoardProps {
  onDeal?: (mode: DealMode) => void;
}

/**
 * GameBoard component - main game interface
 * Features:
 * - Deal mode selection
 * - Partner zones with drag and drop
 * - Card gallery view
 * - Negotiation interface
 */
export default function GameBoard({ onDeal }: GameBoardProps) {
  const { t } = useTranslation();
  const cards = useCardStore((state) => state.getCards());
  const { currentDealMode, setCurrentDealMode } = useGameStore();

  const [unassignedCards, setUnassignedCards] = useState<CardType[]>([]);
  const [partnerACards, setPartnerACards] = useState<CardType[]>([]);
  const [partnerBCards, setPartnerBCards] = useState<CardType[]>([]);
  const [activeTab, setActiveTab] = useState<'deal' | 'gallery'>('deal');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CardType | undefined>();

  // Initialize sample partners
  const [partners] = useState<Partner[]>([
    {
      id: 'partner-a',
      name: t('partners.partnerA'),
      avatar: { type: 'avatar-builder', data: 'A' },
      preferences: {
        favoriteCards: [],
        avoidCards: [],
        strongSuits: ['home'],
        availability: {},
      },
      stats: { currentCards: 0, totalTimeCommitment: 0, streaks: [], achievements: [] },
      theme: { color: '#E63946', pattern: { type: 'solid', color: '#E63946' }, icon: 'A' },
    },
    {
      id: 'partner-b',
      name: t('partners.partnerB'),
      avatar: { type: 'avatar-builder', data: 'B' },
      preferences: {
        favoriteCards: [],
        avoidCards: [],
        strongSuits: ['kids'],
        availability: {},
      },
      stats: { currentCards: 0, totalTimeCommitment: 0, streaks: [], achievements: [] },
      theme: { color: '#06AED5', pattern: { type: 'solid', color: '#06AED5' }, icon: 'B' },
    },
  ]);

  // Update card assignments
  useEffect(() => {
    const unassigned = cards.filter((c) => !c.holder || c.holder === null);
    const aCards = cards.filter((c) => c.holder === 'partner-a');
    const bCards = cards.filter((c) => c.holder === 'partner-b');

    setUnassignedCards(unassigned);
    setPartnerACards(aCards);
    setPartnerBCards(bCards);
  }, [cards]);

  const dealModes: DealMode[] = ['random', 'weighted', 'draft', 'auction', 'quick'];

  const handleDealMode = (mode: DealMode) => {
    setCurrentDealMode(mode);
    onDeal?.(mode);
  };

  const handleCardDrop = (cardId: string, holderId: string | null) => {
    const card = cards.find((c) => c.id === cardId);
    if (card) {
      useCardStore.setState((state) => ({
        cards: state.cards.map((c) =>
          c.id === cardId ? { ...c, holder: holderId as any } : c
        ),
      }));
    }
  };

  const handleOpenCreateModal = () => {
    setSelectedCard(undefined);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (card: CardType) => {
    setSelectedCard(card);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCard(undefined);
  };

  const getTimeCommitment = (cardList: CardType[]) => {
    return cardList.reduce((sum, card) => sum + card.metadata.timeEstimate, 0);
  };

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
            className="px-4 py-2 bg-partner-a text-paper font-display font-bold rounded-lg hover:shadow-brutal transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Add a new card"
          >
            + New Card
          </motion.button>
        </div>

        {/* Deal mode selector */}
        <div className="flex gap-3 flex-wrap mb-6">
          {dealModes.map((mode) => (
            <motion.button
              key={mode}
              onClick={() => handleDealMode(mode)}
              className={`px-4 py-2 rounded-lg font-display font-bold transition-all ${
                currentDealMode === mode
                  ? 'bg-partner-a text-paper shadow-brutal'
                  : 'bg-concrete/20 text-ink hover:bg-concrete/30'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {t(`game.dealModes.${mode}`)}
            </motion.button>
          ))}
        </div>

        {/* Tab selector */}
        <div className="flex gap-2 border-b-2 border-ink">
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
              {tab === 'deal' ? 'Deal' : 'Gallery'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      {activeTab === 'deal' ? (
        // Deal Tab - Partner zones
        <div className="space-y-8">
          {/* Partner Zones */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {partners.map((partner) => (
              <PartnerZone
                key={partner.id}
                partner={partner}
                cards={
                  partner.id === 'partner-a'
                    ? partnerACards
                    : partnerBCards
                }
                onCardDrop={(cardId) => handleCardDrop(cardId, partner.id)}
                isActive={true}
                totalTime={getTimeCommitment(
                  partner.id === 'partner-a' ? partnerACards : partnerBCards
                )}
              />
            ))}
          </div>

          {/* Unassigned Cards Section */}
          <motion.div
            className="bg-unassigned/10 border-3 border-unassigned rounded-lg p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="font-display text-lg font-bold text-ink mb-4">
              {t('cards.unassigned')} ({unassignedCards.length})
            </h3>

            {unassignedCards.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {unassignedCards.map((card, index) => (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group relative"
                  >
                    <Card card={card} draggable={true} />
                    <button
                      onClick={() => handleOpenEditModal(card)}
                      className="absolute top-2 right-2 p-1 bg-white/90 text-ink rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Edit card"
                    >
                      ✏️
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
                  All cards assigned!
                </p>
                <p className="text-sm font-body text-concrete/70">
                  Great job distributing the workload.
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      ) : (
        // Gallery Tab - All cards view
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
                    e.dataTransfer.setData('cardId', card.id);
                  }}
                />
                <button
                  onClick={() => handleOpenEditModal(card)}
                  className="absolute top-2 right-2 p-1 bg-white/90 text-ink rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Edit card"
                >
                  ✏️
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
        card={selectedCard}
        onClose={handleCloseModal}
        onSuccess={() => {
          // Modal will close automatically, cards will update via Zustand
        }}
      />

      {/* Summary Footer */}
      <motion.div
        className="mt-8 pt-6 border-t-2 border-ink grid grid-cols-3 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="text-center p-4 bg-partner-a/10 rounded-lg">
          <p className="text-sm font-body text-concrete mb-2">Partner A</p>
          <p className="text-2xl font-display font-bold text-partner-a">
            {partnerACards.length}
          </p>
          <p className="text-xs text-concrete/70 mt-1">
            {getTimeCommitment(partnerACards)}m/week
          </p>
        </div>
        <div className="text-center p-4 bg-unassigned/10 rounded-lg">
          <p className="text-sm font-body text-concrete mb-2">Unassigned</p>
          <p className="text-2xl font-display font-bold text-unassigned">
            {unassignedCards.length}
          </p>
          <p className="text-xs text-concrete/70 mt-1">
            {getTimeCommitment(unassignedCards)}m
          </p>
        </div>
        <div className="text-center p-4 bg-partner-b/10 rounded-lg">
          <p className="text-sm font-body text-concrete mb-2">Partner B</p>
          <p className="text-2xl font-display font-bold text-partner-b">
            {partnerBCards.length}
          </p>
          <p className="text-xs text-concrete/70 mt-1">
            {getTimeCommitment(partnerBCards)}m/week
          </p>
        </div>
      </motion.div>
    </div>
  );
}
