import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCardStore, useGameStore } from '@stores/index';
import { useAuthStore } from '@stores/authStore';
import { Button } from '@components/catalyst/button';
import { Textarea } from '@components/catalyst/textarea';
import { Field, Label, Description } from '@components/catalyst/fieldset';
import { Badge } from '@components/catalyst/badge';
import { suggestCardsToSkip, suggestInitialDeal } from '@services/aiAdvisorService';
import { recordEvent } from '@services/statsService';
import type { CardStatus, AISuggestion, AISkipSuggestion } from '@types';

type Step = 'welcome' | 'context' | 'skip-review' | 'deal-review' | 'done';

const STEPS_WITH_INDICATOR: Step[] = ['welcome', 'context', 'skip-review', 'deal-review'];

function Spinner() {
  return (
    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
  );
}

function StepIndicator({ current }: { current: Step }) {
  const idx = STEPS_WITH_INDICATOR.indexOf(current);
  if (idx === -1) return null;
  return (
    <div className="flex items-center justify-center gap-2 py-3">
      {STEPS_WITH_INDICATOR.map((s, i) => (
        <div
          key={s}
          className={`h-2 rounded-full transition-all ${
            i === idx
              ? 'w-6 bg-partner-a'
              : i < idx
                ? 'w-2 bg-partner-a/40'
                : 'w-2 bg-gray-300 dark:bg-white/20'
          }`}
        />
      ))}
    </div>
  );
}

export default function OnboardingScreen({ onComplete }: { onComplete: () => void }) {
  const { t } = useTranslation();
  const cards = useCardStore((state) => state.getCards());
  const { partnerAName, partnerBName } = useGameStore();
  const userId = useAuthStore((s) => s.user?.uid ?? '');

  const [step, setStep] = useState<Step>('welcome');
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [skipSuggestions, setSkipSuggestions] = useState<AISkipSuggestion[]>([]);
  const [dealSuggestions, setDealSuggestions] = useState<AISuggestion[]>([]);
  // selectedSkips contains card IDs that will be SKIPPED (i.e. unchecked cards)
  const [selectedSkips, setSelectedSkips] = useState<Set<string>>(new Set());
  const [selectedDeals, setSelectedDeals] = useState<Map<string, 'partner-a' | 'partner-b'>>(new Map());

  const handleContextSubmit = async () => {
    setLoading(true);
    const suggestions = await suggestCardsToSkip(cards, context);
    setSkipSuggestions(suggestions);
    // AI-suggested cards start as skipped (unchecked)
    setSelectedSkips(new Set(suggestions.map((s) => s.cardId)));
    setLoading(false);
    setStep('skip-review');
  };

  const handleSkipConfirm = async () => {
    // Apply skips
    if (selectedSkips.size > 0) {
      useCardStore.setState((state) => ({
        cards: state.cards.map((c) =>
          selectedSkips.has(c.id)
            ? { ...c, status: 'not-in-play' as CardStatus, holder: null }
            : c
        ),
      }));
    }

    // Now get deal suggestions for remaining cards
    setLoading(true);
    const remaining = useCardStore.getState().getCards();
    const suggestions = await suggestInitialDeal(remaining, partnerAName, partnerBName, context);
    setDealSuggestions(suggestions);
    const initialDeals = new Map<string, 'partner-a' | 'partner-b'>();
    for (const s of suggestions) {
      if (s.suggestedHolder === 'partner-a' || s.suggestedHolder === 'partner-b') {
        initialDeals.set(s.cardId, s.suggestedHolder);
      }
    }
    setSelectedDeals(initialDeals);
    setLoading(false);
    setStep('deal-review');
  };

  const handleDealConfirm = () => {
    // Apply deals
    useCardStore.setState((state) => ({
      cards: state.cards.map((c) => {
        const holder = selectedDeals.get(c.id);
        if (!holder) return c;
        return { ...c, holder, status: 'held' as CardStatus };
      }),
    }));

    recordEvent('deal_random', userId, useCardStore.getState().getCards()).catch(console.error);
    setStep('done');
  };

  const toggleSkip = (cardId: string) => {
    setSelectedSkips((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) next.delete(cardId);
      else next.add(cardId);
      return next;
    });
  };

  const toggleDeal = (cardId: string) => {
    setSelectedDeals((prev) => {
      const next = new Map(prev);
      const current = next.get(cardId);
      if (!current) next.set(cardId, 'partner-a');
      else if (current === 'partner-a') next.set(cardId, 'partner-b');
      else next.delete(cardId);
      return next;
    });
  };

  if (step === 'welcome') {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6 text-center">
        <StepIndicator current={step} />
        <h1 className="text-3xl font-display font-bold text-ink mb-3">
          {t('onboarding.welcome', 'Welcome to Fair Play')}
        </h1>
        <p className="text-sm font-body text-concrete mb-8 max-w-sm leading-relaxed">
          Let's set up your household cards. Our AI assistant will help you decide which cards apply to your household and suggest an initial fair distribution.
        </p>
        <Button color="partner-a" onClick={() => setStep('context')} className="px-8">
          Get Started
        </Button>
        <Button plain onClick={onComplete} className="mt-3 text-concrete">
          Skip — I'll do it manually
        </Button>
      </div>
    );
  }

  if (step === 'context') {
    return (
      <div className="flex flex-col h-full px-6 pt-6 pb-6">
        <StepIndicator current={step} />
        <h2 className="text-2xl font-display font-bold text-ink mb-2 mt-4">Tell us about your household</h2>
        <p className="text-sm font-body text-concrete mb-6 leading-relaxed">
          This helps our AI suggest which cards to skip and how to divide responsibilities.
        </p>
        <Field>
          <Label className="font-display font-semibold">Household description</Label>
          <Description>
            Include: number/ages of kids, pets, who works from home, any special circumstances
          </Description>
          <Textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="e.g., We have 2 kids (ages 3 and 7), a dog, Alon works from home, Moral works part-time..."
            rows={4}
            resizable={false}
          />
        </Field>
        <div className="flex gap-3 mt-6">
          <Button color="partner-a" onClick={handleContextSubmit} disabled={!context.trim() || loading}>
            {loading ? <span className="flex items-center gap-2"><Spinner /> Analyzing...</span> : 'Continue'}
          </Button>
          <Button plain onClick={() => setStep('welcome')}>Back</Button>
        </div>
      </div>
    );
  }

  if (step === 'skip-review') {
    return (
      <div className="flex flex-col h-full">
        <div className="px-6 pt-6 pb-4">
          <StepIndicator current={step} />
          <h2 className="text-2xl font-display font-bold text-ink mb-2 mt-4">Review your cards</h2>
          <p className="text-sm font-body text-concrete mb-4 leading-relaxed">
            Uncheck cards that don't apply to your household. AI suggested unchecking {skipSuggestions.length} cards.
          </p>
        </div>
        <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-2">
          {skipSuggestions.length === 0 ? (
            <p className="text-sm text-concrete font-body py-4">All cards seem relevant to your household!</p>
          ) : (
            skipSuggestions.map((s) => {
              const card = cards.find((c) => c.id === s.cardId);
              if (!card) return null;
              // isSkipped = card is in the skip set = unchecked
              const isSkipped = selectedSkips.has(s.cardId);
              // isKept = card is NOT in the skip set = checked
              const isKept = !isSkipped;
              return (
                <button
                  key={s.cardId}
                  onClick={() => toggleSkip(s.cardId)}
                  className={`w-full text-start p-3 rounded-xl border transition-all ${
                    isKept
                      ? 'bg-white dark:bg-white/10 border-gray-200 dark:border-white/10'
                      : 'bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-5 h-5 rounded border-2 flex items-center justify-center text-xs ${
                      isKept ? 'bg-partner-a border-partner-a text-white' : 'border-gray-300'
                    }`}>
                      {isKept && '\u2713'}
                    </span>
                    <span className={`font-display font-semibold text-ink text-sm ${isSkipped ? 'line-through' : ''}`}>{card.title.en}</span>
                    <Badge color="zinc" className="ms-auto">{card.category}</Badge>
                  </div>
                  <p className="text-xs text-concrete mt-1 ps-7">{s.reason}</p>
                </button>
              );
            })
          )}
        </div>
        <div className="flex gap-3 px-6 py-4 border-t border-gray-200 dark:border-white/10">
          <Button color="partner-a" onClick={handleSkipConfirm} disabled={loading}>
            {loading ? <span className="flex items-center gap-2"><Spinner /> Preparing deal...</span> : `Skip ${selectedSkips.size} cards & continue`}
          </Button>
          <Button plain onClick={() => setStep('context')}>Back</Button>
        </div>
      </div>
    );
  }

  if (step === 'deal-review') {
    const partnerACt = [...selectedDeals.values()].filter((v) => v === 'partner-a').length;
    const partnerBCt = [...selectedDeals.values()].filter((v) => v === 'partner-b').length;
    const unassigned = dealSuggestions.length - partnerACt - partnerBCt;

    return (
      <div className="flex flex-col h-full">
        <div className="px-6 pt-6 pb-4">
          <StepIndicator current={step} />
          <h2 className="text-2xl font-display font-bold text-ink mb-2 mt-4">AI-suggested deal</h2>
          <p className="text-sm font-body text-concrete mb-2 leading-relaxed">
            Tap cards to cycle assignment: {partnerAName} → {partnerBName} → unassigned
          </p>
          <div className="flex gap-4 text-xs font-display font-bold">
            <span className="text-partner-a">{partnerAName}: {partnerACt}</span>
            <span className="text-partner-b">{partnerBName}: {partnerBCt}</span>
            {unassigned > 0 && <span className="text-concrete">Unassigned: {unassigned}</span>}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-1.5">
          {dealSuggestions.map((s) => {
            const card = cards.find((c) => c.id === s.cardId);
            if (!card) return null;
            const holder = selectedDeals.get(s.cardId);
            return (
              <button
                key={s.cardId}
                onClick={() => toggleDeal(s.cardId)}
                className="w-full text-start p-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/10 transition-all"
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    holder === 'partner-a' ? 'bg-partner-a' : holder === 'partner-b' ? 'bg-partner-b' : 'bg-gray-300'
                  }`} />
                  <span className="font-display font-semibold text-ink text-sm flex-1 truncate">{card.title.en}</span>
                  <Badge color={holder === 'partner-a' ? 'partner-a' : holder === 'partner-b' ? 'partner-b' : 'zinc'}>
                    {holder === 'partner-a' ? partnerAName : holder === 'partner-b' ? partnerBName : 'None'}
                  </Badge>
                </div>
                <p className="text-xs text-concrete mt-1 ps-4 truncate">{s.reason}</p>
              </button>
            );
          })}
        </div>
        <div className="flex gap-3 px-6 py-4 border-t border-gray-200 dark:border-white/10">
          <Button color="partner-a" onClick={handleDealConfirm}>
            Apply this deal
          </Button>
          <Button plain onClick={() => setStep('skip-review')}>Back</Button>
        </div>
      </div>
    );
  }

  // step === 'done' — show summary
  const allCards = useCardStore.getState().cards;
  const skippedCount = allCards.filter((c) => c.status === 'not-in-play').length;
  const partnerACards = allCards.filter((c) => c.holder === 'partner-a' && c.status === 'held');
  const partnerBCards = allCards.filter((c) => c.holder === 'partner-b' && c.status === 'held');
  const partnerAMinutes = partnerACards.reduce((sum, c) => sum + (c.metadata?.timeEstimate ?? 0), 0);
  const partnerBMinutes = partnerBCards.reduce((sum, c) => sum + (c.metadata?.timeEstimate ?? 0), 0);

  const formatTime = (mins: number) => {
    if (mins < 60) return `${mins} min/week`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m/week` : `${h}h/week`;
  };

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center">
      <span className="text-5xl mb-4">🎉</span>
      <h2 className="text-2xl font-display font-bold text-ink mb-2">You're all set!</h2>
      <p className="text-sm font-body text-concrete mb-6 max-w-sm leading-relaxed">
        Cards have been distributed. You can always reassign them from the Deal screen.
      </p>

      <div className="w-full max-w-xs space-y-3 mb-8">
        {skippedCount > 0 && (
          <div className="flex justify-between text-sm font-body px-3 py-2 bg-gray-100 dark:bg-white/5 rounded-lg">
            <span className="text-concrete">Cards skipped</span>
            <span className="font-display font-bold text-ink">{skippedCount}</span>
          </div>
        )}
        <div className="flex justify-between text-sm font-body px-3 py-2 bg-partner-a/10 rounded-lg">
          <span className="text-partner-a font-semibold">{partnerAName}</span>
          <span className="font-display font-bold text-ink">
            {partnerACards.length} cards{partnerAMinutes > 0 ? ` \u00B7 ${formatTime(partnerAMinutes)}` : ''}
          </span>
        </div>
        <div className="flex justify-between text-sm font-body px-3 py-2 bg-partner-b/10 rounded-lg">
          <span className="text-partner-b font-semibold">{partnerBName}</span>
          <span className="font-display font-bold text-ink">
            {partnerBCards.length} cards{partnerBMinutes > 0 ? ` \u00B7 ${formatTime(partnerBMinutes)}` : ''}
          </span>
        </div>
      </div>

      <Button color="partner-a" onClick={onComplete} className="px-8">
        Go to My Cards
      </Button>
    </div>
  );
}
