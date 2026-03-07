import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Card as CardType } from '@types';

interface CardRowProps {
  card: CardType;
  dealMode?: boolean;
  onAssign?: (holderId: 'partner-a' | 'partner-b' | null) => void;
  onEdit?: () => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
}

const holderStyles = {
  'partner-a': {
    border: 'border-l-partner-a',
    bg: 'bg-white',
    dot: 'bg-partner-a',
    badge: 'bg-partner-a/10 text-partner-a',
  },
  'partner-b': {
    border: 'border-l-partner-b',
    bg: 'bg-white',
    dot: 'bg-partner-b',
    badge: 'bg-partner-b/10 text-partner-b',
  },
  unassigned: {
    border: 'border-l-unassigned',
    bg: 'bg-white',
    dot: 'bg-unassigned',
    badge: 'bg-unassigned/30 text-ink/60',
  },
};

export default function CardRow({
  card,
  dealMode = false,
  onAssign,
  onEdit,
  draggable = false,
  onDragStart,
}: CardRowProps) {
  const { i18n } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  const isRTL = i18n.language === 'he';
  const title = isRTL ? card.title.he : card.title.en;
  const description = isRTL ? card.description.he : card.description.en;

  const styles = holderStyles[card.holder ?? 'unassigned'];

  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      className={`border-l-4 ${styles.border} ${styles.bg} rounded-2xl mb-2.5 shadow-soft-sm overflow-hidden`}
      style={{ transition: 'box-shadow 150ms' }}
    >
      {/* Row header — always visible */}
      <button
        className="w-full text-left px-4 py-3.5 flex items-center gap-3 active:bg-black/[0.02]"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Category dot */}
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${styles.dot}`} />

        {/* Title + meta */}
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-ink text-[15px] leading-snug truncate">
            {title}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-concrete/70">
              {card.category}
            </span>
            <span className="text-concrete/40 text-[10px]">·</span>
            <span className="text-[11px] text-concrete font-medium">{card.metadata.timeEstimate}m</span>
          </div>
        </div>

        {/* Chevron */}
        <span
          className="text-concrete/50 flex-shrink-0"
          style={{
            transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
            fontSize: 10,
          }}
        >
          ▶
        </span>
      </button>

      {/* Expandable content */}
      <div className={`expandable-grid ${expanded ? 'open' : ''}`}>
        <div className="expandable-inner">
          <div className="px-4 pb-4 pt-0">
            {description && (
              <p
                className={`text-sm text-ink/65 font-body leading-relaxed mb-3 ${
                  isRTL ? 'text-right' : 'text-left'
                }`}
              >
                {description}
              </p>
            )}

            <div className="flex items-center gap-2 flex-wrap">
              {dealMode && onAssign && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); onAssign('partner-a'); }}
                    className="text-[11px] px-3 py-1.5 bg-partner-a text-white font-display font-bold rounded-lg tracking-wide"
                  >
                    Alon
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onAssign('partner-b'); }}
                    className="text-[11px] px-3 py-1.5 bg-partner-b text-white font-display font-bold rounded-lg tracking-wide"
                  >
                    Moral
                  </button>
                  {card.holder && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onAssign(null); }}
                      className="text-[11px] px-3 py-1.5 bg-gray-100 text-concrete font-display font-bold rounded-lg"
                    >
                      Unassign
                    </button>
                  )}
                </>
              )}
              {onEdit && (
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit(); }}
                  className="text-[11px] px-3 py-1.5 bg-gray-50 text-concrete font-display font-bold rounded-lg border border-gray-100 ml-auto"
                >
                  Edit
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
