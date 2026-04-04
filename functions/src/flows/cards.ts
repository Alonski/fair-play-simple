import { z } from 'genkit';
import { ai } from '../genkit.js';

const cardSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: z.string(),
  frequency: z.string().optional(),
  timeEstimate: z.number().optional(),
  holder: z.string().nullable().optional(),
});

// --- Skip suggestions ---

export const skipSuggestFlow = ai.defineFlow(
  {
    name: 'skipSuggestFlow',
    inputSchema: z.object({
      cards: z.array(cardSchema),
      householdContext: z.string(),
    }),
    outputSchema: z.object({
      suggestions: z.array(z.object({
        cardId: z.string(),
        reason: z.string(),
      })),
    }),
  },
  async ({ cards, householdContext }) => {
    const cardList = cards.map((c) => `- ${c.id}: "${c.title}" (${c.category})`).join('\n');

    const prompt = `You are a Fair Play household advisor. Given this household context:
${householdContext}

Here are the available Fair Play cards:
${cardList}

Suggest which cards should be marked as "Not in Play" (skipped) because they don't apply to this household. For example, if they have no kids, skip all kids-related cards. If they don't have pets, skip the pets card.

Return ONLY a JSON array of objects with "cardId" and "reason" fields. Example:
[{"cardId": "pets", "reason": "No pets in household"}]

Return an empty array [] if all cards apply.`;

    const { text } = await ai.generate(prompt);
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return { suggestions: [] };
    try {
      return { suggestions: JSON.parse(jsonMatch[0]) };
    } catch {
      return { suggestions: [] };
    }
  },
);

// --- Deal suggestions ---

export const dealSuggestFlow = ai.defineFlow(
  {
    name: 'dealSuggestFlow',
    inputSchema: z.object({
      cards: z.array(cardSchema),
      partnerAName: z.string(),
      partnerBName: z.string(),
      householdContext: z.string(),
    }),
    outputSchema: z.object({
      suggestions: z.array(z.object({
        cardId: z.string(),
        suggestedHolder: z.string(),
        reason: z.string(),
      })),
    }),
  },
  async ({ cards, partnerAName, partnerBName, householdContext }) => {
    const cardList = cards
      .map((c) => `- ${c.id}: "${c.title}" (${c.category}, ${c.frequency || 'weekly'}, ~${c.timeEstimate || 30}min)`)
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

    const { text } = await ai.generate(prompt);
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return { suggestions: [] };
    try {
      return { suggestions: JSON.parse(jsonMatch[0]) };
    } catch {
      return { suggestions: [] };
    }
  },
);

// --- Rebalance suggestions ---

export const rebalanceFlow = ai.defineFlow(
  {
    name: 'rebalanceFlow',
    inputSchema: z.object({
      cards: z.array(cardSchema.extend({ holder: z.string().nullable() })),
      partnerAName: z.string(),
      partnerBName: z.string(),
    }),
    outputSchema: z.object({
      suggestions: z.array(z.object({
        cardId: z.string(),
        suggestedHolder: z.string(),
        reason: z.string(),
      })),
    }),
  },
  async ({ cards, partnerAName, partnerBName }) => {
    const held = cards.filter((c) => c.holder);
    const partnerACards = held.filter((c) => c.holder === 'partner-a');
    const partnerBCards = held.filter((c) => c.holder === 'partner-b');
    const partnerATime = partnerACards.reduce((s, c) => s + (c.timeEstimate || 30), 0);
    const partnerBTime = partnerBCards.reduce((s, c) => s + (c.timeEstimate || 30), 0);

    const cardList = held
      .map((c) => `- ${c.id}: "${c.title}" held by ${c.holder === 'partner-a' ? partnerAName : partnerBName} (${c.category}, ~${c.timeEstimate || 30}min)`)
      .join('\n');

    const prompt = `You are a Fair Play household advisor. Here is the current card distribution:

${partnerAName}: ${partnerACards.length} cards, ~${partnerATime} min/week
${partnerBName}: ${partnerBCards.length} cards, ~${partnerBTime} min/week

Current assignments:
${cardList}

If the distribution seems unbalanced, suggest 2-4 cards to swap or reassign to improve fairness. Consider time commitment, not just card count.

If the distribution is already fair, return an empty array [].

Return ONLY a JSON array of objects with "cardId", "suggestedHolder" ("partner-a" or "partner-b"), and "reason" fields.`;

    const { text } = await ai.generate(prompt);
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return { suggestions: [] };
    try {
      return { suggestions: JSON.parse(jsonMatch[0]) };
    } catch {
      return { suggestions: [] };
    }
  },
);

// --- MSC suggestion ---

export const mscSuggestFlow = ai.defineFlow(
  {
    name: 'mscSuggestFlow',
    inputSchema: z.object({
      cardTitle: z.string(),
      cardDescription: z.string(),
      cardCategory: z.string(),
      language: z.enum(['en', 'he']),
    }),
    outputSchema: z.object({ mscNote: z.string() }),
  },
  async ({ cardTitle, cardDescription, cardCategory, language }) => {
    const lang = language === 'he' ? 'Hebrew' : 'English';
    const prompt = `You are a Fair Play household advisor. Write a brief "Minimum Standard of Care" (MSC) note for this household responsibility card. The MSC defines what "done right" looks like — the minimum acceptable standard both partners agree on.

Card: "${cardTitle}" (Category: ${cardCategory})
Description: ${cardDescription}

Write 2-3 bullet points in ${lang} describing the minimum standard. Be practical and specific. Return ONLY the bullet points, no extra text.`;

    const { text } = await ai.generate(prompt);
    return { mscNote: text?.trim() || '' };
  },
);
