import { z } from 'genkit';
import { FieldValue } from 'firebase-admin/firestore';
import { HttpsError } from 'firebase-functions/https';
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

You have a long-term memory system. Use it proactively:
- When you learn something important about the family (kids, pets, work schedules, preferences), SAVE it using the saveMemory tool with scope "family"
- When you learn something specific to one partner (personal preferences, strengths, frustrations), SAVE it with scope "personal"
- At the START of conversations, RECALL memories to ground yourself in what you already know
- When answering questions, RECALL relevant memories before responding
- Categories: "profile" (facts about the family), "preference" (likes/dislikes), "decision" (agreements made), "context" (situational info), "note" (misc)

Keep responses concise — 2-3 paragraphs max unless the user asks for more detail.`;
const MAX_MESSAGES_BEFORE_COMPACT = 50;
const COMPACT_KEEP_RECENT = 10;
// --- Tools the AI can use ---
const getCardStateTool = ai.defineTool({
    name: 'getCardState',
    description: 'Get the current card assignments for the household. Returns how many cards each partner holds, total time commitment, and lists the cards.',
    inputSchema: z.object({}),
    outputSchema: z.object({
        partnerA: z.object({ name: z.string(), cardCount: z.number(), timeMinutes: z.number(), cards: z.array(z.string()) }),
        partnerB: z.object({ name: z.string(), cardCount: z.number(), timeMinutes: z.number(), cards: z.array(z.string()) }),
        unassigned: z.number(),
        notInPlay: z.number(),
    }),
}, async (_input, { context }) => {
    const householdId = context?.householdId || 'shared';
    const householdDoc = await db.collection('households').doc(householdId).get();
    const household = householdDoc.data() || {};
    const cardsSnap = await db.collection('households').doc(householdId).collection('cards').get();
    const cards = cardsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const active = cards.filter((c) => c.status !== 'not-in-play' && c.status !== 'deleted');
    const partnerACards = active.filter((c) => c.holder === 'partner-a');
    const partnerBCards = active.filter((c) => c.holder === 'partner-b');
    return {
        partnerA: {
            name: household.partnerAName || 'Partner A',
            cardCount: partnerACards.length,
            timeMinutes: partnerACards.reduce((s, c) => s + (c.metadata?.timeEstimate || 30), 0),
            cards: partnerACards.map((c) => c.title?.en || c.id).slice(0, 20),
        },
        partnerB: {
            name: household.partnerBName || 'Partner B',
            cardCount: partnerBCards.length,
            timeMinutes: partnerBCards.reduce((s, c) => s + (c.metadata?.timeEstimate || 30), 0),
            cards: partnerBCards.map((c) => c.title?.en || c.id).slice(0, 20),
        },
        unassigned: active.filter((c) => !c.holder).length,
        notInPlay: cards.filter((c) => c.status === 'not-in-play').length,
    };
});
const getStatsTool = ai.defineTool({
    name: 'getStats',
    description: 'Get recent activity stats — how many deals, resets, and card changes happened recently.',
    inputSchema: z.object({}),
    outputSchema: z.object({
        recentEvents: z.array(z.object({ type: z.string(), timestamp: z.string() })),
        totalEvents: z.number(),
    }),
}, async (_input, { context }) => {
    const householdId = context?.householdId || 'shared';
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
});
const explainCardTool = ai.defineTool({
    name: 'explainCard',
    description: 'Explain what a specific Fair Play card means, including its CPE (Conception, Planning, Execution) breakdown. Use this when the user asks about a specific card.',
    inputSchema: z.object({ cardTitle: z.string() }),
    outputSchema: z.object({ explanation: z.string() }),
}, async ({ cardTitle }, { context }) => {
    const householdId = context?.householdId || 'shared';
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
});
// --- Memory tools ---
const saveMemoryTool = ai.defineTool({
    name: 'saveMemory',
    description: 'Save something important to long-term memory so you can recall it in future conversations. Use this proactively when you learn key facts about the family, preferences, decisions, or anything worth remembering. Memories persist across conversations.',
    inputSchema: z.object({
        content: z.string().describe('What to remember — be specific and concise'),
        scope: z.enum(['family', 'personal']).describe('family = both partners can see, personal = only this partner'),
        category: z.enum(['profile', 'preference', 'decision', 'context', 'note']).describe('Type of memory'),
    }),
    outputSchema: z.object({ saved: z.boolean(), id: z.string() }),
}, async ({ content, scope, category }, { context }) => {
    const ctx = context;
    const householdId = ctx.householdId || 'shared';
    const userId = ctx.userId || '';
    const memoryPath = scope === 'family'
        ? `households/${householdId}/memories`
        : `users/${userId}/memories`;
    // Cap memories at 100 per scope — delete oldest if at limit
    const countSnap = await db.collection(memoryPath).orderBy('createdAt', 'asc').get();
    if (countSnap.size >= 100) {
        // Delete the oldest memory to make room
        await countSnap.docs[0].ref.delete();
    }
    const ref = await db.collection(memoryPath).add({
        content,
        category,
        scope,
        createdAt: FieldValue.serverTimestamp(),
        createdBy: userId,
    });
    return { saved: true, id: ref.id };
});
const recallMemoriesTool = ai.defineTool({
    name: 'recallMemories',
    description: 'Recall memories from long-term storage. Use this at the start of conversations or when you need context about the family, their preferences, or past decisions. Always recall memories when a user asks you something that might be informed by what you previously learned.',
    inputSchema: z.object({
        scope: z.enum(['family', 'personal', 'all']).describe('Which memories to recall'),
        category: z.enum(['profile', 'preference', 'decision', 'context', 'note', 'all']).optional().describe('Filter by category, or all'),
    }),
    outputSchema: z.object({
        memories: z.array(z.object({
            id: z.string(),
            content: z.string(),
            category: z.string(),
            scope: z.string(),
            createdAt: z.string().optional(),
        })),
    }),
}, async ({ scope, category }, { context }) => {
    const ctx = context;
    const householdId = ctx.householdId || 'shared';
    const userId = ctx.userId || '';
    const memories = [];
    // Load family memories
    if (scope === 'family' || scope === 'all') {
        let q = db.collection(`households/${householdId}/memories`);
        if (category && category !== 'all')
            q = q.where('category', '==', category);
        q = q.orderBy('createdAt', 'desc').limit(50);
        const snap = await q.get();
        snap.docs.forEach((d) => {
            const data = d.data();
            memories.push({
                id: d.id,
                content: data.content,
                category: data.category,
                scope: 'family',
                createdAt: data.createdAt?.toDate?.()?.toISOString() || '',
            });
        });
    }
    // Load personal memories
    if ((scope === 'personal' || scope === 'all') && userId) {
        let q = db.collection(`users/${userId}/memories`);
        if (category && category !== 'all')
            q = q.where('category', '==', category);
        q = q.orderBy('createdAt', 'desc').limit(50);
        const snap = await q.get();
        snap.docs.forEach((d) => {
            const data = d.data();
            memories.push({
                id: d.id,
                content: data.content,
                category: data.category,
                scope: 'personal',
                createdAt: data.createdAt?.toDate?.()?.toISOString() || '',
            });
        });
    }
    return { memories };
});
const forgetMemoryTool = ai.defineTool({
    name: 'forgetMemory',
    description: 'Delete a specific memory by ID. Use when the user says to forget something or when a memory is outdated.',
    inputSchema: z.object({
        id: z.string(),
        scope: z.enum(['family', 'personal']),
    }),
    outputSchema: z.object({ deleted: z.boolean() }),
}, async ({ id, scope }, { context }) => {
    const ctx = context;
    const householdId = ctx.householdId || 'shared';
    const userId = ctx.userId || '';
    const path = scope === 'family'
        ? `households/${householdId}/memories/${id}`
        : `users/${userId}/memories/${id}`;
    await db.doc(path).delete();
    return { deleted: true };
});
// --- Chat history management ---
async function loadHistory(chatPath) {
    const messagesSnap = await db.collection(chatPath)
        .orderBy('createdAt', 'asc')
        .get();
    return messagesSnap.docs.map((d) => {
        const data = d.data();
        return { role: data.role, content: data.content };
    });
}
async function saveMessage(chatPath, message) {
    await db.collection(chatPath).add({
        role: message.role,
        content: message.content,
        createdAt: FieldValue.serverTimestamp(),
    });
}
async function compactHistory(chatPath, messages) {
    if (messages.length < MAX_MESSAGES_BEFORE_COMPACT)
        return messages;
    // Summarize older messages, keep recent ones
    const older = messages.slice(0, -COMPACT_KEEP_RECENT);
    const recent = messages.slice(-COMPACT_KEEP_RECENT);
    const olderText = older
        .map((m) => `${m.role}: ${m.content.map((c) => c.text || '').join(' ')}`)
        .join('\n');
    const { text: summary } = await ai.generate(`Summarize this conversation history in 3-5 bullet points, preserving key decisions, card assignments discussed, and any commitments made:\n\n${olderText}`);
    // Find the cutoff timestamp: the oldest "recent" message
    // Query all messages in order to find the timestamp at the boundary
    const allSnap = await db.collection(chatPath).orderBy('createdAt', 'asc').get();
    const cutoffIndex = allSnap.docs.length - COMPACT_KEEP_RECENT;
    if (cutoffIndex <= 0)
        return messages;
    const cutoffTimestamp = allSnap.docs[cutoffIndex].data().createdAt;
    // Delete messages older than the cutoff using timestamp, not limit
    const oldSnap = await db.collection(chatPath)
        .where('createdAt', '<', cutoffTimestamp)
        .get();
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
export const chatFlow = ai.defineFlow({
    name: 'chatFlow',
    inputSchema: z.object({
        message: z.string(),
        chatMode: z.enum(['private', 'shared']),
    }),
    outputSchema: z.object({ response: z.string() }),
}, async ({ message, chatMode }, { context }) => {
    // Derive userId from auth context (set by onCallGenkit)
    const userId = context.auth?.uid;
    if (!userId) {
        throw new HttpsError('unauthenticated', 'You must be signed in to use chat.');
    }
    // Look up householdId from user's Firestore profile
    const userDoc = await db.doc(`users/${userId}`).get();
    const householdId = userDoc.data()?.householdId || 'shared';
    // Determine chat path based on mode
    const chatPath = chatMode === 'shared'
        ? `households/${householdId}/chats/shared/messages`
        : `users/${userId}/chats/private/messages`;
    // Load and compact history
    let history = await loadHistory(chatPath);
    history = await compactHistory(chatPath, history);
    // Add user message
    const userMessage = { role: 'user', content: [{ text: message }] };
    await saveMessage(chatPath, userMessage);
    history.push(userMessage);
    // Generate response with tools
    const response = await ai.generate({
        system: SYSTEM_PROMPT,
        messages: history,
        tools: [getCardStateTool, getStatsTool, explainCardTool, saveMemoryTool, recallMemoriesTool, forgetMemoryTool],
        context: { householdId, userId },
    });
    // Save AI response
    const aiMessage = { role: 'model', content: [{ text: response.text }] };
    await saveMessage(chatPath, aiMessage);
    return { response: response.text };
});
//# sourceMappingURL=chat.js.map