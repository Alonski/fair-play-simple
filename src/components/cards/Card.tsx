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

  // Light tinted background based on holder
  const getCardBg = () => {
    switch (card.holder) {
      case 'partner-a':
        return 'bg-partner-a-light';
      case 'partner-b':
        return 'bg-partner-b-light';
      default:
        return 'bg-unassigned-light';
    }
  };

  // Left accent border color based on holder
  const getAccentBorder = () => {
    switch (card.holder) {
      case 'partner-a':
        return 'border-l-partner-a';
      case 'partner-b':
        return 'border-l-partner-b';
      default:
        return 'border-l-unassigned';
    }
  };

  // Text color for category label
  const getCategoryColor = () => {
    switch (card.holder) {
      case 'partner-a':
        return 'text-partner-a';
      case 'partner-b':
        return 'text-partner-b';
      default:
        return 'text-concrete';
    }
  };

  const containerVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    hover: {
      y: -4,
      boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
    },
    selected: {
      boxShadow: '0 0 0 2px rgba(167, 139, 250, 0.5)',
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
          draggable ? 'hover:shadow-soft-lg' : ''
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
        {/* Front side — light tinted bg with dark text */}
        <div
          className={`absolute w-full h-full ${getCardBg()} border border-gray-200 border-l-4 ${getAccentBorder()} rounded-2xl p-6 flex flex-col justify-between shadow-soft`}
          style={{ backfaceVisibility: 'hidden' } as { [key: string]: string }}
        >
          <div>
            <div className={`text-xs font-display font-bold ${getCategoryColor()} mb-2 uppercase tracking-wider`}>
              {card.category}
            </div>
            <h3
              className={`font-display text-xl font-bold text-ink mb-3 ${
                isRTL ? 'text-right' : 'text-left'
              }`}
            >
              {text}
            </h3>
            <p
              className={`text-sm font-body text-ink/70 line-clamp-3 ${
                isRTL ? 'text-right' : 'text-left'
              }`}
            >
              {description}
            </p>
          </div>

          {/* Card metadata */}
          <div className="flex justify-between items-center text-xs text-concrete mt-4">
            <div className="flex gap-2">
              {card.metadata.difficulty > 0 && (
                <span className="font-bold">
                  {'⚡'.repeat(card.metadata.difficulty)}
                </span>
              )}
              <span className="opacity-75">{card.metadata.timeEstimate}m</span>
            </div>
            {isHovered && draggable && (
              <span className="text-concrete/70 text-xs italic">drag</span>
            )}
          </div>
        </div>

        {/* Back side */}
        <div
          className="absolute w-full h-full bg-white border border-gray-200 rounded-2xl p-6 flex flex-col justify-between shadow-soft"
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
              className={`text-sm font-body text-ink/70 ${
                isRTL ? 'text-right' : 'text-left'
              }`}
            >
              {isRTL ? card.details.he : card.details.en}
            </p>
          </div>

          {/* Tags and status */}
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="text-xs px-2 py-1 bg-unassigned-light text-ink rounded-lg font-bold">
              {card.status}
            </span>
            {card.metadata.isCustom && (
              <span className="text-xs px-2 py-1 bg-gray-100 text-ink rounded-lg">
                Custom
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute -inset-2 border-2 border-accent rounded-2xl pointer-events-none animate-pulse" />
      )}
      </motion.div>
    </div>
  );
}
