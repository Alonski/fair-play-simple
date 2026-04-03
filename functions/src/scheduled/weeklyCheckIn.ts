import { onSchedule } from 'firebase-functions/scheduler';
import * as admin from 'firebase-admin';
import { ai } from '../genkit.js';

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

export const weeklyCheckIn = onSchedule(
  { schedule: 'every sunday 09:00', timeZone: 'Asia/Jerusalem' },
  async () => {
    const householdId = 'shared';

    // Get card state
    const cardsSnap = await db.collection('households').doc(householdId).collection('cards').get();
    const householdDoc = await db.collection('households').doc(householdId).get();
    const household = householdDoc.data() || {};

    const cards = cardsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const active = cards.filter((c: any) => c.status !== 'not-in-play' && c.status !== 'deleted');
    const partnerACards = active.filter((c: any) => c.holder === 'partner-a');
    const partnerBCards = active.filter((c: any) => c.holder === 'partner-b');
    const unassigned = active.filter((c: any) => !c.holder);
    const partnerATime = partnerACards.reduce((s: number, c: any) => s + (c.metadata?.timeEstimate || 30), 0);
    const partnerBTime = partnerBCards.reduce((s: number, c: any) => s + (c.metadata?.timeEstimate || 30), 0);

    // Get recent stats
    const statsSnap = await db.collection('households').doc(householdId)
      .collection('stats')
      .orderBy('timestamp', 'desc')
      .limit(20)
      .get();

    const recentEvents = statsSnap.docs.map((d) => d.data());
    const transfers = recentEvents.filter((e: any) => e.type === 'card_transferred').length;
    const assignments = recentEvents.filter((e: any) => e.type === 'card_assigned').length;

    // Generate summary
    const { text: summary } = await ai.generate(`You are the Fair Play Expert. Write a brief, friendly weekly summary for ${household.partnerAName || 'Partner A'} and ${household.partnerBName || 'Partner B'}.

Current state:
- ${household.partnerAName || 'Partner A'}: ${partnerACards.length} cards, ~${partnerATime} min/week
- ${household.partnerBName || 'Partner B'}: ${partnerBCards.length} cards, ~${partnerBTime} min/week
- ${unassigned.length} unassigned cards
- This week: ${assignments} new assignments, ${transfers} transfers

Write 3-4 sentences max. Celebrate balance or gently suggest improvements. End with an encouraging note.`);

    // Save weekly report
    await db.collection('households').doc(householdId).collection('weeklyReports').add({
      summary,
      timestamp: new Date().toISOString(),
      snapshot: {
        partnerACards: partnerACards.length,
        partnerBCards: partnerBCards.length,
        unassigned: unassigned.length,
        partnerATime,
        partnerBTime,
        transfers,
        assignments,
      },
    });

    // Send push notifications to both partners
    const usersSnap = await db.collection('users').get();
    const tokens: string[] = [];
    for (const userDoc of usersSnap.docs) {
      const tokensSnap = await db.collection('users').doc(userDoc.id).collection('tokens').get();
      tokensSnap.docs.forEach((t) => {
        const token = t.data().token;
        if (token) tokens.push(token);
      });
    }

    if (tokens.length > 0) {
      await admin.messaging().sendEachForMulticast({
        tokens,
        notification: {
          title: '📊 Weekly Fair Play Check-in',
          body: summary.slice(0, 150),
        },
        webpush: {
          fcmOptions: { link: '/' },
        },
      });
    }
  },
);
