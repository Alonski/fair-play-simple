import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import Card from '@components/cards/Card';
import type { Partner, Card as CardType } from '@types';

interface PartnerZoneProps {
  partner: Partner;
  cards: CardType[];
  onCardDrop?: (cardId: string) => void;
  onNameChange?: (name: string) => void;
  onToggleComplete?: (cardId: string) => void;
  onTapAssign?: () => void;
  onCardTap?: (cardId: string) => void;
  tappedCardId?: string | null;
  isActive?: boolean;
  totalTime?: number;
}

/**
 * PartnerZone component - displays cards assigned to a partner
 * Supports drag-drop (desktop) and tap-to-assign (mobile)
 */
export default function PartnerZone({
  partner,
  cards,
  onCardDrop,
  onNameChange,
  onToggleComplete,
  onTapAssign,
  onCardTap,
  tappedCardId,
  isActive = true,
  totalTime = 0,
}: PartnerZoneProps) {
  const { t } = useTranslation();
  const [dragOver, setDragOver] = useState(false);
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState(partner.name);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const cardId = e.dataTransfer.getData('cardId');
    onCardDrop?.(cardId);
  };

  const handleNameSave = () => {
    const trimmed = nameInput.trim();
    if (trimmed && trimmed !== partner.name) {
      onNameChange?.(trimmed);
    } else {
      setNameInput(partner.name);
    }
    setEditing(false);
  };

  const partnerBg = partner.id === 'partner-a' ? 'bg-partner-a' : 'bg-partner-b';
  const partnerBorder = partner.id === 'partner-a' ? 'border-partner-a' : 'border-partner-b';
  const completedCount = cards.filter((c) => c.status === 'completed').length;

  return (
    <motion.div
      className={`flex-1 rounded-lg border-3 ${partnerBorder} p-6 transition-all ${
        dragOver ? 'ring-2 ring-offset-2 ring-ink shadow-brutal' : 'shadow-brutal-sm'
      } ${isActive ? 'opacity-100' : 'opacity-70'} ${tappedCardId ? 'cursor-pointer' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => {
        if (tappedCardId) onTapAssign?.();
      }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Partner Header */}
      <div className="mb-6 pb-4 border-b-2 border-ink">
        <div className="flex items-center gap-4 mb-3">
          <div
            className={`w-12 h-12 ${partnerBg} rounded-full flex items-center justify-center text-paper font-display font-bold text-lg shadow-brutal-sm`}
          >
            {partner.name.charAt(0).toUpperCase()}
          </div>

          <div>
            {editing ? (
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onBlur={handleNameSave}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleNameSave();
                  if (e.key === 'Escape') {
                    setNameInput(partner.name);
                    setEditing(false);
                  }
                }}
                autoFocus
                maxLength={30}
                className="font-display text-lg font-bold text-ink bg-paper/80 border-2 border-ink rounded px-2 py-1 outline-none focus:ring-2 focus:ring-partner-a"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <h3
                className="font-display text-lg font-bold text-ink cursor-pointer hover:underline"
                onClick={(e) => {
                  e.stopPropagation();
                  setNameInput(partner.name);
                  setEditing(true);
                }}
                title={t('game.clickToEditName')}
              >
                {partner.name}
              </h3>
            )}
            <p className="text-xs font-body text-concrete">
              {cards.length} {t('game.cardCount', { count: cards.length })}
            </p>
          </div>
        </div>

        {/* Tap-to-assign hint */}
        {tappedCardId && (
          <p className="text-xs font-bold text-partner-a animate-pulse mt-2">
            {t('game.tapHereToAssign')}
          </p>
        )}

        {/* Time commitment */}
        {totalTime > 0 && (
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs font-bold font-display text-concrete">
              {t('game.timeCommitment')}:
            </span>
            <span className={`px-2 py-1 rounded text-xs font-bold ${partnerBg} text-paper`}>
              {totalTime} {t('game.minutesPerWeek')}
            </span>
          </div>
        )}
      </div>

      {/* Cards Grid */}
      <div
        className={`grid grid-cols-1 md:grid-cols-2 gap-4 min-h-64 p-4 rounded ${
          dragOver ? 'bg-unassigned/10 border-2 border-dashed border-ink' : 'bg-paper/50'
        } transition-colors`}
      >
        {cards.length > 0 ? (
          cards.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative"
              onClick={(e) => e.stopPropagation()}
            >
              <Card
                card={card}
                draggable={true}
                isSelected={tappedCardId === card.id}
                onClick={() => onCardTap?.(card.id)}
                onDragStart={(e) => {
                  e.dataTransfer.effectAllowed = 'move';
                  e.dataTransfer.setData('cardId', card.id);
                }}
              />
              {/* Done toggle button */}
              <button
                onClick={(e) => { e.stopPropagation(); onToggleComplete?.(card.id); }}
                className={`absolute top-2 right-2 w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm transition-all z-10 ${
                  card.status === 'completed'
                    ? 'bg-green-500 text-white border-green-500'
                    : 'bg-white/80 border-concrete hover:border-ink'
                }`}
                title={card.status === 'completed' ? t('game.markNotDone') : t('game.markDone')}
              >
                {card.status === 'completed' ? '✓' : ''}
              </button>
            </motion.div>
          ))
        ) : (
          <motion.div
            className="col-span-full flex items-center justify-center h-48 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div>
              <p className="text-sm font-display font-bold text-concrete mb-2">
                {t('game.dropCardsHere')}
              </p>
              <p className="text-xs font-body text-concrete/70">
                {t('game.orTapToAssign')}
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Partner stats */}
      <div className="mt-4 pt-4 border-t-2 border-ink/20 flex gap-4 justify-between text-xs font-body">
        <div>
          <span className="block text-concrete font-bold mb-1">{t('game.difficulty')}</span>
          <span className="text-ink font-bold">
            {cards.reduce((sum, c) => sum + c.metadata.difficulty, 0)}/{cards.length * 3}
          </span>
        </div>
        <div>
          <span className="block text-concrete font-bold mb-1">{t('cards.completed')}</span>
          <span className="text-ink font-bold">{completedCount}/{cards.length}</span>
        </div>
        <div>
          <span className="block text-concrete font-bold mb-1">{t('game.status')}</span>
          <span className={`${partnerBg} text-paper px-2 py-1 rounded font-bold`}>
            {isActive ? t('game.active') : t('game.paused')}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
