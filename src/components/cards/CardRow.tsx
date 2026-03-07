import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Card as CardType } from '@types';

interface CardRowProps {
  card: CardType;
  /** When true, shows an assign button in expanded state (for Deal mode) */
  dealMode?: boolean;
  onAssign?: (holderId: 'partner-a' | 'partner-b' | null) => void;
  onEdit?: () => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
}

const getCardBg = (holder: CardType['holder']) => {
  switch (holder) {
    case 'partner-a': return 'bg-partner-a-light';
    case 'partner-b': return 'bg-partner-b-light';
    default: return 'bg-unassigned-light';
  }
};

const getAccentBorder = (holder: CardType['holder']) => {
  switch (holder) {
    case 'partner-a': return 'border-l-partner-a';
    case 'partner-b': return 'border-l-partner-b';
    default: return 'border-l-unassigned';
  }
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

  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      className={`border-l-4 ${getAccentBorder(card.holder)} ${getCardBg(card.holder)} rounded-xl mb-2 overflow-hidden`}
    >
      <button
        className="w-full text-left px-4 py-3 flex items-center justify-between gap-3"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-ink text-sm truncate">{title}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-white/60 text-ink/60">
              {card.category}
            </span>
            <span className="text-xs text-concrete">{card.metadata.timeEstimate}m</span>
          </div>
        </div>
        <span
          className={`text-concrete text-xs flex-shrink-0 transition-transform duration-200 ${
            expanded ? 'rotate-90' : ''
          }`}
        >
          &#9654;
        </span>
      </button>

      {expanded && (
        <div className="px-4 pb-3">
          {description && (
            <p className={`text-sm text-ink/70 font-body mb-3 ${isRTL ? 'text-right' : 'text-left'}`}>
              {description}
            </p>
          )}
          <div className="flex items-center gap-2 flex-wrap">
            {dealMode && onAssign && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); onAssign('partner-a'); }}
                  className="text-xs px-3 py-1.5 bg-partner-a text-white font-bold rounded-lg"
                >
                  Alon
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onAssign('partner-b'); }}
                  className="text-xs px-3 py-1.5 bg-partner-b text-white font-bold rounded-lg"
                >
                  Moral
                </button>
                {card.holder && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onAssign(null); }}
                    className="text-xs px-3 py-1.5 bg-gray-100 text-concrete font-bold rounded-lg"
                  >
                    Unassign
                  </button>
                )}
              </>
            )}
            {onEdit && (
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(); }}
                className="text-xs px-3 py-1.5 bg-white/80 text-concrete font-bold rounded-lg border border-gray-200"
              >
                Edit
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
