import { onSchedule } from 'firebase-functions/scheduler';
import { db, messaging } from '../admin.js';
const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000;
export const cardReminder = onSchedule({ schedule: 'every day 10:00', timeZone: 'Asia/Jerusalem' }, async () => {
    const householdId = 'shared';
    const householdDoc = await db.collection('households').doc(householdId).get();
    const household = householdDoc.data() || {};
    const cardsSnap = await db.collection('households').doc(householdId).collection('cards').get();
    const now = Date.now();
    const staleCards = [];
    for (const doc of cardsSnap.docs) {
        const card = doc.data();
        if (card.status !== 'held' && card.status !== 'unassigned')
            continue;
        if (!card.holder)
            continue;
        // Check if card has MSC notes
        const hasMsc = card.details?.en?.trim() || card.details?.he?.trim();
        if (hasMsc)
            continue;
        // Check how long since last update
        const updatedAt = card.updatedAt ? new Date(card.updatedAt).getTime() : 0;
        const age = now - updatedAt;
        if (age > TWO_WEEKS_MS) {
            staleCards.push({
                title: card.title?.en || doc.id,
                holder: card.holder === 'partner-a' ? (household.partnerAName || 'Partner A') : (household.partnerBName || 'Partner B'),
                daysSinceUpdate: Math.floor(age / (24 * 60 * 60 * 1000)),
            });
        }
    }
    if (staleCards.length === 0)
        return;
    // Build notification message
    const cardList = staleCards.slice(0, 3).map((c) => `${c.title} (${c.holder})`).join(', ');
    const body = staleCards.length <= 3
        ? `${cardList} — consider adding MSC notes`
        : `${cardList} and ${staleCards.length - 3} more — consider adding MSC notes`;
    // Send push to all users
    const usersSnap = await db.collection('users').get();
    const tokens = [];
    for (const userDoc of usersSnap.docs) {
        const tokensSnap = await db.collection('users').doc(userDoc.id).collection('tokens').get();
        tokensSnap.docs.forEach((t) => {
            const token = t.data().token;
            if (token)
                tokens.push(token);
        });
    }
    if (tokens.length > 0) {
        await messaging.sendEachForMulticast({
            tokens,
            notification: {
                title: '📝 Cards need attention',
                body,
            },
            webpush: {
                fcmOptions: { link: '/deal' },
            },
        });
    }
});
//# sourceMappingURL=cardReminder.js.map