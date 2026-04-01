import { app } from './firebase';
import { getAI, getGenerativeModel, GoogleAIBackend } from 'firebase/ai';
import type { Card, AISuggestion, AISkipSuggestion } from '@types';

let model: ReturnType<typeof getGenerativeModel> | null = null;

function getModel() {
  if (model) return model;
  if (!app) return null;

  const ai = getAI(app, { backend: new GoogleAIBackend() });
  model = getGenerativeModel(ai, { model: 'gemini-2.5-flash' });
  return model;
}

/**
 * Ask AI to suggest which cards to skip (mark as Not in Play)
 * based on household profile.
 */
export async function suggestCardsToSkip(
  cards: Card[],
  householdContext: string,
): Promise<AISkipSuggestion[]> {
  const genModel = getModel();
  if (!genModel) return [];

  const cardList = cards
    .filter((c) => c.status !== 'deleted')
    .map((c) => `- ${c.id}: "${c.title.en}" (${c.category})`)
    .join('\n');

  const prompt = `You are a Fair Play household advisor. Given this household context:
${householdContext}

Here are the available Fair Play cards:
${cardList}

Suggest which cards should be marked as "Not in Play" (skipped) because they don't apply to this household. For example, if they have no kids, skip all kids-related cards. If they don't have pets, skip the pets card.

Return ONLY a JSON array of objects with "cardId" and "reason" fields. Example:
[{"cardId": "pets", "reason": "No pets in household"}]

Return an empty array [] if all cards apply.`;

  try {
    const result = await genModel.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];
    return JSON.parse(jsonMatch[0]) as AISkipSuggestion[];
  } catch (err) {
    console.error('AI skip suggestion error:', err);
    return [];
  }
}

/**
 * Ask AI to suggest initial card assignments based on household context.
 */
export async function suggestInitialDeal(
  cards: Card[],
  partnerAName: string,
  partnerBName: string,
  householdContext: string,
): Promise<AISuggestion[]> {
  const genModel = getModel();
  if (!genModel) return [];

  const activeCards = cards.filter((c) => c.status !== 'not-in-play' && c.status !== 'deleted' && !c.holder);
  const cardList = activeCards
    .map((c) => `- ${c.id}: "${c.title.en}" (${c.category}, ${c.metadata.frequency}, ~${c.metadata.timeEstimate}min)`)
    .join('\n');

  const prompt = `You are a Fair Play household advisor helping ${partnerAName} and ${partnerBName} divide household responsibilities fairly.

Household context:
${householdContext}

Here are the unassigned cards to distribute:
${cardList}

Suggest a fair initial assignment. Consider:
1. Balance the total time commitment between partners
2. Group related cards when it makes sense
3. Consider the household context for who might be better suited
4. Each partner's "Adult Friendships", "Self-Care", and "Unicorn Space" cards should go to the respective partner

Return ONLY a JSON array of objects with "cardId", "suggestedHolder" ("partner-a" for ${partnerAName}, "partner-b" for ${partnerBName}), and "reason" fields.`;

  try {
    const result = await genModel.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];
    return JSON.parse(jsonMatch[0]) as AISuggestion[];
  } catch (err) {
    console.error('AI deal suggestion error:', err);
    return [];
  }
}

/**
 * Ask AI for weekly rebalancing suggestions based on current state.
 */
export async function suggestRebalance(
  cards: Card[],
  partnerAName: string,
  partnerBName: string,
): Promise<AISuggestion[]> {
  const genModel = getModel();
  if (!genModel) return [];

  const held = cards.filter((c) => c.holder && c.status !== 'not-in-play' && c.status !== 'deleted');
  const partnerACards = held.filter((c) => c.holder === 'partner-a');
  const partnerBCards = held.filter((c) => c.holder === 'partner-b');
  const partnerATime = partnerACards.reduce((s, c) => s + c.metadata.timeEstimate, 0);
  const partnerBTime = partnerBCards.reduce((s, c) => s + c.metadata.timeEstimate, 0);

  const cardList = held
    .map((c) => `- ${c.id}: "${c.title.en}" held by ${c.holder === 'partner-a' ? partnerAName : partnerBName} (${c.category}, ~${c.metadata.timeEstimate}min)`)
    .join('\n');

  const prompt = `You are a Fair Play household advisor. Here is the current card distribution:

${partnerAName}: ${partnerACards.length} cards, ~${partnerATime} min/week
${partnerBName}: ${partnerBCards.length} cards, ~${partnerBTime} min/week

Current assignments:
${cardList}

If the distribution seems unbalanced, suggest 2-4 cards to swap or reassign to improve fairness. Consider time commitment, not just card count.

If the distribution is already fair, return an empty array [].

Return ONLY a JSON array of objects with "cardId", "suggestedHolder" ("partner-a" or "partner-b"), and "reason" fields.`;

  try {
    const result = await genModel.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];
    return JSON.parse(jsonMatch[0]) as AISuggestion[];
  } catch (err) {
    console.error('AI rebalance suggestion error:', err);
    return [];
  }
}
