import { z } from 'genkit';
import { MessageData } from 'genkit/beta';
import { FieldValue } from 'firebase-admin/firestore';
import { ai } from '../genkit.js';
import { db } from '../admin.js';

const SYSTEM_PROMPT = `You are the Fair Play Expert — a friendly, helpful advisor who knows everything about Eve Rodsky's Fair Play method for dividing household responsibilities fairly between partners.

You help couples:
- Understand what each Fair Play card means and why it matters
- Decide how to distribute cards fairly based on CPE (Conception, Planning, Execution)
- Set Minimum Standards of Care (MSC) for each card
- Resolve disagreements about card ownership
- Rebalance when things feel unfair

You speak warmly and practically. You reference Fair Play concepts naturally (CPE, Unicorn Space, Wild cards, etc.) without being preachy. You give specific, actionable advice.

When you have access to the household's card data, reference it specifically. For example: "I see Alon currently holds 52 cards including Groceries and Laundry. That's a lot of daily grind cards."

Keep responses concise — 2-3 paragraphs max unless the user asks for more detail.`;

const MAX_MESSAGES_BEFORE_COMPACT = 50;
const COMPACT_KEEP_RECENT = 10;

// --- Tools the AI can use ---

const getCardStateTool = ai.defineTool(
  {
    name: 'getCardState',
    description: 'Get the current card assignments for the household. Returns how many cards each partner holds, total time commitment, and lists the cards.',
    inputSchema: z.object({}),
    outputSchema: z.object({
      partnerA: z.object({ name: z.string(), cardCount: z.number(), timeMinutes: z.number(), cards: z.array(z.string()) }),
      partnerB: z.object({ name: z.string(), cardCount: z.number(), timeMinutes: z.number(), cards: z.array(z.string()) }),
      unassigned: z.number(),
      notInPlay: z.number(),
    }),
  },
  async (_input, { context }) => {
    const householdId = (context as { householdId?: string })?.householdId || 'shared';
    const householdDoc = await db.collection('households').doc(householdId).get();
    const household = householdDoc.data() || {};
    const cardsSnap = await db.collection('households').doc(householdId).collection('cards').get();

    const cards = cardsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const active = cards.filter((c: any) => c.status !== 'not-in-play' && c.status !== 'deleted');
    const partnerACards = active.filter((c: any) => c.holder === 'partner-a');
    const partnerBCards = active.filter((c: any) => c.holder === 'partner-b');

    return {
      partnerA: {
        name: household.partnerAName || 'Partner A',
        cardCount: partnerACards.length,
        timeMinutes: partnerACards.reduce((s: number, c: any) => s + (c.metadata?.timeEstimate || 30), 0),
        cards: partnerACards.map((c: any) => c.title?.en || c.id).slice(0, 20),
      },
      partnerB: {
        name: household.partnerBName || 'Partner B',
        cardCount: partnerBCards.length,
        timeMinutes: partnerBCards.reduce((s: number, c: any) => s + (c.metadata?.timeEstimate || 30), 0),
        cards: partnerBCards.map((c: any) => c.title?.en || c.id).slice(0, 20),
      },
      unassigned: active.filter((c: any) => !c.holder).length,
      notInPlay: cards.filter((c: any) => c.status === 'not-in-play').length,
    };
  },
);

const getStatsTool = ai.defineTool(
  {
    name: 'getStats',
    description: 'Get recent activity stats — how many deals, resets, and card changes happened recently.',
    inputSchema: z.object({}),
    outputSchema: z.object({
      recentEvents: z.array(z.object({ type: z.string(), timestamp: z.string() })),
      totalEvents: z.number(),
    }),
  },
  async (_input, { context }) => {
    const householdId = (context as { householdId?: string })?.householdId || 'shared';
    const statsSnap = await db.collection('households').doc(householdId)
      .collection('stats')
      .orderBy('timestamp', 'desc')
      .limit(10)
      .get();

    const events = statsSnap.docs.map((d) => {
      const data = d.data();
      return { type: data.type, timestamp: data.timestamp };
    });

    return { recentEvents: events, totalEvents: statsSnap.size };
  },
);

const explainCardTool = ai.defineTool(
  {
    name: 'explainCard',
    description: 'Explain what a specific Fair Play card means, including its CPE (Conception, Planning, Execution) breakdown. Use this when the user asks about a specific card.',
    inputSchema: z.object({ cardTitle: z.string() }),
    outputSchema: z.object({ explanation: z.string() }),
  },
  async ({ cardTitle }, { context }) => {
    const householdId = (context as { householdId?: string })?.householdId || 'shared';
    const cardsSnap = await db.collection('households').doc(householdId).collection('cards')
      .where('title.en', '>=', cardTitle)
      .where('title.en', '<=', cardTitle + '\uf8ff')
      .limit(1)
      .get();

    if (cardsSnap.empty) {
      return { explanation: `I couldn't find a card matching "${cardTitle}". Could you try the exact card name?` };
    }

    const card = cardsSnap.docs[0].data();
    return {
      explanation: `Card: ${card.title?.en || cardTitle}\nCategory: ${card.category}\nDescription: ${card.description?.en || 'No description'}\nFrequency: ${card.metadata?.frequency || 'weekly'}\nTime estimate: ~${card.metadata?.timeEstimate || 30} min/week\nCurrently held by: ${card.holder || 'unassigned'}`,
    };
  },
);

// --- Chat history management ---

async function loadHistory(chatPath: string): Promise<MessageData[]> {
  const messagesSnap = await db.collection(chatPath)
    .orderBy('createdAt', 'asc')
    .get();

  return messagesSnap.docs.map((d) => {
    const data = d.data();
    return { role: data.role, content: data.content } as MessageData;
  });
}

async function saveMessage(chatPath: string, message: MessageData) {
  await db.collection(chatPath).add({
    role: message.role,
    content: message.content,
    createdAt: FieldValue.serverTimestamp(),
  });
}

async function compactHistory(chatPath: string, messages: MessageData[]): Promise<MessageData[]> {
  if (messages.length < MAX_MESSAGES_BEFORE_COMPACT) return messages;

  // Summarize older messages, keep recent ones
  const older = messages.slice(0, -COMPACT_KEEP_RECENT);
  const recent = messages.slice(-COMPACT_KEEP_RECENT);

  const olderText = older
    .map((m) => `${m.role}: ${m.content.map((c: any) => c.text || '').join(' ')}`)
    .join('\n');

  const { text: summary } = await ai.generate(
    `Summarize this conversation history in 3-5 bullet points, preserving key decisions, card assignments discussed, and any commitments made:\n\n${olderText}`
  );

  // Delete old messages from Firestore
  const oldSnap = await db.collection(chatPath).orderBy('createdAt', 'asc').limit(older.length).get();
  const batch = db.batch();
  oldSnap.docs.forEach((d) => batch.delete(d.ref));

  // Add summary as a system message
  const summaryRef = db.collection(chatPath).doc();
  batch.set(summaryRef, {
    role: 'model',
    content: [{ text: `[Previous conversation summary]\n${summary}` }],
    createdAt: FieldValue.serverTimestamp(),
    isSummary: true,
  });
  await batch.commit();

  return [
    { role: 'model', content: [{ text: `[Previous conversation summary]\n${summary}` }] },
    ...recent,
  ];
}

// --- Main chat flow ---

export const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: z.object({
      message: z.string(),
      chatMode: z.enum(['private', 'shared']),
      userId: z.string(),
      householdId: z.string().default('shared'),
    }),
    outputSchema: z.object({ response: z.string() }),
  },
  async ({ message, chatMode, userId, householdId }) => {
    // Determine chat path based on mode
    const chatPath = chatMode === 'shared'
      ? `households/${householdId}/chats/shared/messages`
      : `users/${userId}/chats/private/messages`;

    // Load and compact history
    let history = await loadHistory(chatPath);
    history = await compactHistory(chatPath, history);

    // Add user message
    const userMessage: MessageData = { role: 'user', content: [{ text: message }] };
    await saveMessage(chatPath, userMessage);
    history.push(userMessage);

    // Generate response with tools
    const response = await ai.generate({
      system: SYSTEM_PROMPT,
      messages: history,
      tools: [getCardStateTool, getStatsTool, explainCardTool],
      context: { householdId },
    });

    // Save AI response
    const aiMessage: MessageData = { role: 'model', content: [{ text: response.text }] };
    await saveMessage(chatPath, aiMessage);

    return { response: response.text };
  },
);
