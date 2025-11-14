import { motion, AnimatePresence } from 'framer-motion';
import Card from './Card';
import type { Card as CardType } from '@types';

interface CardStackProps {
  cards: CardType[];
  onCardClick?: (card: CardType) => void;
  onCardDrop?: (card: CardType) => void;
  orientation?: 'vertical' | 'horizontal';
  maxVisible?: number;
  showCount?: boolean;
}

/**
 * CardStack component - displays cards in a stacked arrangement
 * with staggered animations and rotation for organic feel
 */
export default function CardStack({
  cards,
  onCardClick,
  orientation = 'vertical',
  maxVisible = 3,
  showCount = true,
}: CardStackProps) {
  const displayCards = cards.slice(0, maxVisible);

  const handleCardClick = (card: CardType) => {
    onCardClick?.(card);
  };

  const staggerDelays = [0, 8, 16];
  const rotations = [-2, 1, -1];

  return (
    <div className="relative w-full">
      <div
        className={`relative ${
          orientation === 'vertical' ? 'h-96' : 'h-48'
        } flex items-center justify-center`}
      >
        <AnimatePresence>
          {displayCards.map((card, index) => (
            <motion.div
              key={card.id}
              className="absolute w-80"
              initial={{
                opacity: 0,
                y: -20,
                rotate: rotations[index] || 0,
              }}
              animate={{
                opacity: 1,
                y: index * staggerDelays[index] || 0,
                rotate: rotations[index] || 0,
              }}
              exit={{
                opacity: 0,
                y: -100,
                scale: 0.8,
              }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                type: 'spring',
                stiffness: 100,
              }}
              style={{
                zIndex: displayCards.length - index,
              }}
            >
              <Card
                card={card}
                onClick={() => handleCardClick(card)}
                onDragStart={(e) => {
                  e.dataTransfer.setData('cardId', card.id);
                }}
                draggable={true}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Card count indicator */}
      {showCount && cards.length > 0 && (
        <div className="text-center mt-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-unassigned/20 rounded-full">
            <span className="text-sm font-display font-bold text-ink">
              {cards.length}
            </span>
            <span className="text-xs font-body text-concrete">
              cards remaining
            </span>
          </div>
        </div>
      )}

      {/* Empty state */}
      {cards.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="text-center">
            <p className="text-lg font-display font-bold text-concrete mb-2">
              All cards dealt!
            </p>
            <p className="text-sm font-body text-concrete/70">
              Ready for the next round?
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
