import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from './firebase';
import type { Card, AISuggestion, AISkipSuggestion } from '@types';

const functions = app ? getFunctions(app) : null;

function serializeCards(cards: Card[]) {
  return cards
    .filter((c) => c.status !== 'deleted')
    .map((c) => ({
      id: c.id,
      title: c.title.en,
      category: c.category,
      frequency: c.metadata.frequency,
      timeEstimate: c.metadata.timeEstimate,
      holder: c.holder,
    }));
}

export async function suggestCardsToSkip(
  cards: Card[],
  householdContext: string,
): Promise<AISkipSuggestion[]> {
  if (!functions) return [];
  try {
    const callable = httpsCallable<unknown, { suggestions: AISkipSuggestion[] }>(functions, 'skipSuggest');
    const result = await callable({ cards: serializeCards(cards), householdContext });
    return result.data.suggestions;
  } catch (err) {
    console.error('AI skip suggestion error:', err);
    return [];
  }
}

export async function suggestInitialDeal(
  cards: Card[],
  partnerAName: string,
  partnerBName: string,
  householdContext: string,
): Promise<AISuggestion[]> {
  if (!functions) return [];
  const activeCards = cards.filter((c) => c.status !== 'not-in-play' && c.status !== 'deleted' && !c.holder);
  try {
    const callable = httpsCallable<unknown, { suggestions: AISuggestion[] }>(functions, 'dealSuggest');
    const result = await callable({ cards: serializeCards(activeCards), partnerAName, partnerBName, householdContext });
    return result.data.suggestions;
  } catch (err) {
    console.error('AI deal suggestion error:', err);
    return [];
  }
}

export async function suggestRebalance(
  cards: Card[],
  partnerAName: string,
  partnerBName: string,
): Promise<AISuggestion[]> {
  if (!functions) return [];
  const held = cards.filter((c) => c.holder && c.status !== 'not-in-play' && c.status !== 'deleted');
  try {
    const callable = httpsCallable<unknown, { suggestions: AISuggestion[] }>(functions, 'rebalance');
    const result = await callable({ cards: serializeCards(held), partnerAName, partnerBName });
    return result.data.suggestions;
  } catch (err) {
    console.error('AI rebalance suggestion error:', err);
    return [];
  }
}

export async function suggestMSC(
  cardTitle: string,
  cardDescription: string,
  cardCategory: string,
  language: 'en' | 'he',
): Promise<string> {
  if (!functions) return '';
  try {
    const callable = httpsCallable<unknown, { mscNote: string }>(functions, 'mscSuggest');
    const result = await callable({ cardTitle, cardDescription, cardCategory, language });
    return result.data.mscNote;
  } catch (err) {
    console.error('AI MSC suggestion error:', err);
    return '';
  }
}
