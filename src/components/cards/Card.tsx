import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import type { Card as CardType } from '@types';
import './Card.module.css';

interface CardProps {
  card: CardType;
  isSelected?: boolean;
  onClick?: () => void;
  onDragStart?: (e: React.DragEvent) => void;
  draggable?: boolean;
}

/**
 * Card component representing a Fair Play card
 * Features:
 * - 3D flip animation
 * - Drag and drop support
 * - Partner color indication
 * - Animated hover states
 * - Torn paper edge effect
 */
export default function Card({
  card,
  isSelected = false,
  onClick,
  onDragStart,
  draggable = true,
}: CardProps) {
  const { i18n } = useTranslation();
  const [isFlipped, setIsFlipped] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isRTL = i18n.language === 'he';
  const text = isRTL ? card.title.he : card.title.en;
  const description = isRTL ? card.description.he : card.description.en;

  // Determine card color based on holder
  const getCardColor = () => {
    switch (card.holder) {
      case 'partner-a':
        return 'bg-partner-a';
      case 'partner-b':
        return 'bg-partner-b';
      default:
        return 'bg-unassigned';
    }
  };

  const getCategoryColor = () => {
    switch (card.category) {
      case 'daily-grind':
        return 'border-partner-a';
      case 'kids':
        return 'border-partner-b';
      case 'home':
        return 'border-concrete';
      case 'magic':
        return 'border-unassigned';
      case 'wild':
        return 'border-ink';
      default:
        return 'border-concrete';
    }
  };

  const containerVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    hover: {
      y: -12,
      boxShadow: '0 12px 24px rgba(10, 9, 8, 0.15)',
    },
    selected: {
      boxShadow: '0 0 0 3px rgba(230, 57, 70, 0.5)',
    },
  };

  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        className={`relative w-full h-64 cursor-grab active:cursor-grabbing ${
          draggable ? 'hover:shadow-brutal' : ''
        }`}
        variants={containerVariants}
        initial="initial"
        animate={isSelected ? 'selected' : 'animate'}
        whileHover={draggable ? 'hover' : {}}
        onClick={() => {
          if (!draggable) {
            setIsFlipped(!isFlipped);
          }
          onClick?.();
        }}
      >
      {/* Card container with 3D perspective */}
      <motion.div
        className="w-full h-full relative"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
        style={{ transformStyle: 'preserve-3d' } as { [key: string]: string }}
      >
        {/* Front side */}
        <div
          className={`absolute w-full h-full ${getCardColor()} border-4 ${getCategoryColor()} rounded-lg p-6 flex flex-col justify-between torn-paper grain`}
          style={{ backfaceVisibility: 'hidden' } as { [key: string]: string }}
        >
          <div>
            <div className="text-xs font-display font-bold text-paper mb-2 opacity-80 uppercase tracking-wider">
              {card.category}
            </div>
            <h3
              className={`font-display text-xl font-bold text-paper mb-3 ${
                isRTL ? 'text-right' : 'text-left'
              }`}
            >
              {text}
            </h3>
            <p
              className={`text-sm font-body text-paper/90 line-clamp-3 ${
                isRTL ? 'text-right' : 'text-left'
              }`}
            >
              {description}
            </p>
          </div>

          {/* Card metadata */}
          <div className="flex justify-between items-center text-xs text-paper/70 mt-4">
            <div className="flex gap-2">
              {card.metadata.difficulty > 0 && (
                <span className="font-bold">
                  {'⚡'.repeat(card.metadata.difficulty)}
                </span>
              )}
              <span className="opacity-75">{card.metadata.timeEstimate}m</span>
            </div>
            {isHovered && draggable && (
              <span className="text-paper/50 text-xs italic">drag</span>
            )}
          </div>
        </div>

        {/* Back side */}
        <div
          className="absolute w-full h-full bg-paper border-4 border-ink rounded-lg p-6 flex flex-col justify-between torn-paper grain"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          } as { [key: string]: string }}
        >
          <div>
            <h4 className="font-display text-sm font-bold text-ink mb-3 uppercase">
              Details
            </h4>
            <p
              className={`text-sm font-body text-ink/80 ${
                isRTL ? 'text-right' : 'text-left'
              }`}
            >
              {isRTL ? card.details.he : card.details.en}
            </p>
          </div>

          {/* Tags and status */}
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="text-xs px-2 py-1 bg-unassigned text-ink rounded font-bold">
              {card.status}
            </span>
            {card.metadata.isCustom && (
              <span className="text-xs px-2 py-1 bg-concrete/20 text-ink rounded">
                Custom
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute -inset-2 border-3 border-partner-a rounded-lg pointer-events-none animate-pulse" />
      )}
      </motion.div>
    </div>
  );
}
