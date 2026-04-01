import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useCardStore } from '@stores/index';
import { useGameStore } from '@stores/gameStore';
import { useAuthStore } from '@stores/authStore';
import { Button } from '@components/catalyst/button';
import { Badge } from '@components/catalyst/badge';
import type { Card as CardType, Category } from '@types';

function formatCategory(category: Category): string {
  return category.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function formatTime(minutes: number): string {
  if (minutes >= 60) {
    const h = minutes / 60;
    return h % 1 === 0 ? `${h}h` : `${h.toFixed(1)}h`;
  }
  return `${minutes}m`;
}

interface CardRowProps {
  card: CardType;
  index?: number;
  dealMode?: boolean;
  onAssign?: (holderId: 'partner-a' | 'partner-b' | null) => void;
  onEdit?: () => void;
  onToggleNotInPlay?: () => void;
}

const holderStyles = {
  'partner-a': {
    border: 'border-l-partner-a',
    bg: 'bg-white dark:bg-white/10',
    dot: 'bg-partner-a',
    badge: 'bg-partner-a/10 text-partner-a',
  },
  'partner-b': {
    border: 'border-l-partner-b',
    bg: 'bg-white dark:bg-white/10',
    dot: 'bg-partner-b',
    badge: 'bg-partner-b/10 text-partner-b',
  },
  unassigned: {
    border: 'border-l-unassigned',
    bg: 'bg-white dark:bg-white/10',
    dot: 'bg-unassigned',
    badge: 'bg-unassigned/30 text-ink/60',
  },
};

export default function CardRow({
  card,
  index = 0,
  dealMode = false,
  onAssign,
  onEdit,
  onToggleNotInPlay,
}: CardRowProps) {
  const { i18n } = useTranslation();
  const { partnerAName, partnerBName } = useGameStore();
  const readOnlyMode = useAuthStore((s) => s.readOnlyMode);
  const [expanded, setExpanded] = useState(false);
  const [editingMsc, setEditingMsc] = useState(false);
  const [mscDraft, setMscDraft] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isRTL = i18n.language === 'he';
  const rawTitle = isRTL ? card.title.he : card.title.en;
  const title = rawTitle
    .replace('{{partner-a}}', partnerAName).replace('{{partner-b}}', partnerBName)
    .replace('Player 1', partnerAName).replace('Player 2', partnerBName);
  const description = isRTL ? card.description.he : card.description.en;
  const mscNote = card.details.en; // shared household note field

  const styles = holderStyles[card.holder ?? 'unassigned'];

  const startEditingMsc = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (readOnlyMode) return;
    setMscDraft(mscNote);
    setEditingMsc(true);
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const saveMsc = () => {
    const trimmed = mscDraft.trim();
    if (trimmed !== mscNote) {
      useCardStore.getState().updateCard({
        ...card,
        details: { en: trimmed, he: trimmed },
      });
    }
    setEditingMsc(false);
  };

  const handleMscKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setEditingMsc(false);
    }
  };

  return (
    <div
      className={`border-l-[5px] ${styles.border} ${styles.bg} rounded-2xl mb-2.5 shadow-soft-sm overflow-hidden hover:shadow-soft hover:-translate-y-0.5 hover:scale-[1.005] transition-all duration-200 ${expanded ? 'shadow-soft ring-1 ring-black/[0.03]' : ''}`}
      style={{
        animation: 'revealUp 0.35s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        animationDelay: `${index * 50}ms`,
        opacity: 0,
      }}
    >
      {/* Row header — always visible */}
      <button
        aria-expanded={expanded}
        className="w-full text-start px-4 py-3.5 flex items-center gap-3 active:bg-black/[0.06] transition-colors duration-100"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Category dot */}
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${styles.dot}`} />

        {/* Title + meta */}
        <div className="flex-1 min-w-0">
          <p className="font-display font-semibold text-ink text-[15px] leading-snug truncate">
            {title}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs font-bold uppercase tracking-wider text-concrete">
              {formatCategory(card.category)}
            </span>
            <span className="text-concrete/40 text-xs">·</span>
            <span className="text-xs text-concrete font-medium">{formatTime(card.metadata.timeEstimate)}</span>
            {mscNote && (
              <>
                <span className="text-concrete/40 text-xs">·</span>
                <Badge color="amber" className="!text-[10px]">MSC</Badge>
              </>
            )}
          </div>
        </div>

        {/* Chevron */}
        <span className="w-6 h-6 flex items-center justify-center flex-shrink-0">
          <span
            className="text-concrete/70"
            style={{
              transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
              fontSize: 10,
            }}
          >
            ▶
          </span>
        </span>
      </button>

      {/* Expandable content */}
      <div className={`expandable-grid ${expanded ? 'open' : ''}`}>
        <div className="expandable-inner">
          <div className="mx-4 border-t border-gray-100 dark:border-white/5" />
          <div className="px-4 pb-4 pt-0">
            {description && (
              <p
                className={`text-sm text-ink/70 font-body leading-relaxed mb-3 ${
                  isRTL ? 'text-right' : 'text-left'
                }`}
              >
                {description}
              </p>
            )}

            {/* MSC Notes section */}
            <div className="mb-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-amber-700/60 mb-1">
                MSC Notes
              </p>
              {editingMsc ? (
                <textarea
                  ref={textareaRef}
                  value={mscDraft}
                  onChange={(e) => setMscDraft(e.target.value)}
                  onBlur={saveMsc}
                  onKeyDown={handleMscKeyDown}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="What does 'done right' look like for this card?"
                  rows={3}
                  className="w-full px-3 py-2 text-sm font-body text-ink bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300/40 resize-none"
                />
              ) : mscNote ? (
                <button
                  onClick={startEditingMsc}
                  className="w-full text-start px-3 py-2 text-sm font-body text-ink/75 bg-amber-50/70 rounded-xl border border-amber-100 hover:bg-amber-50 transition-colors leading-relaxed"
                >
                  {mscNote}
                </button>
              ) : (
                <button
                  onClick={startEditingMsc}
                  className="w-full text-start px-3 py-2 text-sm font-body text-concrete/70 bg-amber-50/40 rounded-xl border border-dashed border-amber-200/60 hover:bg-amber-50/70 hover:text-concrete transition-colors"
                >
                  Add MSC notes…
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {dealMode && card.status === 'not-in-play' ? (
                onToggleNotInPlay && (
                  <Button color="dark/zinc" onClick={(e: React.MouseEvent) => { e.stopPropagation(); onToggleNotInPlay(); }}>
                    Restore
                  </Button>
                )
              ) : (
                dealMode && onAssign && (
                  <>
                    <Button color="partner-a" onClick={(e: React.MouseEvent) => { e.stopPropagation(); onAssign('partner-a'); }}>
                      {partnerAName}
                    </Button>
                    <Button color="partner-b" onClick={(e: React.MouseEvent) => { e.stopPropagation(); onAssign('partner-b'); }}>
                      {partnerBName}
                    </Button>
                    {card.holder && (
                      <Button outline onClick={(e: React.MouseEvent) => { e.stopPropagation(); onAssign(null); }}>
                        Unassign
                      </Button>
                    )}
                    {onToggleNotInPlay && (
                      <Button plain onClick={(e: React.MouseEvent) => { e.stopPropagation(); onToggleNotInPlay(); }}>
                        Remove
                      </Button>
                    )}
                  </>
                )
              )}
              {onEdit && (
                <Button
                  plain
                  onClick={(e: React.MouseEvent) => { e.stopPropagation(); onEdit(); }}
                  className="ms-auto"
                >
                  Edit
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
