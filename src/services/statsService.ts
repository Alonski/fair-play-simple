import { collection, addDoc, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { db } from './firebase';
import type { Card, PartnerId } from '@types';

// Event types for the stats collection
export type StatsEventType =
  | 'card_assigned'     // Card assigned to a partner
  | 'card_unassigned'   // Card moved back to unassigned
  | 'card_transferred'  // Card moved from one partner to another
  | 'deal_random'       // Random deal executed
  | 'deal_reset'        // All cards reset
  | 'deal_restored'     // Historical state restored
  | 'card_created'      // Custom card added
  | 'card_deleted'      // Card soft-deleted
  | 'card_skipped'      // Card marked as not-in-play
  | 'card_unskipped';   // Card restored from not-in-play

export interface StatsEvent {
  id?: string;
  type: StatsEventType;
  timestamp: string;
  performedBy: string; // uid
  cardId?: string;
  cardTitle?: string;
  category?: string;
  fromHolder?: PartnerId | null;
  toHolder?: PartnerId | null;
  // Snapshot of the balance at this moment
  snapshot: {
    partnerACards: number;
    partnerBCards: number;
    unassignedCards: number;
    notInPlayCards: number;
    partnerATimeMin: number;
    partnerBTimeMin: number;
  };
}

const HOUSEHOLD_ID = 'shared';

function getStatsCollection() {
  if (!db) return null;
  return collection(db, 'households', HOUSEHOLD_ID, 'stats');
}

function buildSnapshot(cards: Card[]): StatsEvent['snapshot'] {
  const active = cards.filter((c) => c.status !== 'not-in-play' && c.status !== 'deleted');
  const partnerACards = active.filter((c) => c.holder === 'partner-a');
  const partnerBCards = active.filter((c) => c.holder === 'partner-b');
  const unassigned = active.filter((c) => !c.holder);
  const notInPlay = cards.filter((c) => c.status === 'not-in-play');

  return {
    partnerACards: partnerACards.length,
    partnerBCards: partnerBCards.length,
    unassignedCards: unassigned.length,
    notInPlayCards: notInPlay.length,
    partnerATimeMin: partnerACards.reduce((sum, c) => sum + c.metadata.timeEstimate, 0),
    partnerBTimeMin: partnerBCards.reduce((sum, c) => sum + c.metadata.timeEstimate, 0),
  };
}

export async function recordEvent(
  type: StatsEventType,
  userId: string,
  cards: Card[],
  details?: {
    cardId?: string;
    cardTitle?: string;
    category?: string;
    fromHolder?: PartnerId | null;
    toHolder?: PartnerId | null;
  },
): Promise<void> {
  const col = getStatsCollection();
  if (!col) return;

  const event: Omit<StatsEvent, 'id'> = {
    type,
    timestamp: new Date().toISOString(),
    performedBy: userId,
    ...details,
    snapshot: buildSnapshot(cards),
  };

  try {
    await addDoc(col, event);
  } catch (err) {
    console.error('Failed to record stats event:', err);
  }
}

export async function getStats(
  limitCount = 100,
  eventType?: StatsEventType,
): Promise<StatsEvent[]> {
  const col = getStatsCollection();
  if (!col) return [];

  try {
    const q = eventType
      ? query(col, where('type', '==', eventType), orderBy('timestamp', 'desc'), limit(limitCount))
      : query(col, orderBy('timestamp', 'desc'), limit(limitCount));
    const snap = await getDocs(q);
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as StatsEvent));
  } catch (err) {
    console.error('Failed to fetch stats:', err);
    return [];
  }
}

// Convenience helpers for common events

export function recordAssignment(
  userId: string,
  cards: Card[],
  cardId: string,
  cardTitle: string,
  category: string,
  fromHolder: PartnerId | null,
  toHolder: PartnerId | null,
): Promise<void> {
  const type: StatsEventType = fromHolder && toHolder
    ? 'card_transferred'
    : toHolder
      ? 'card_assigned'
      : 'card_unassigned';

  return recordEvent(type, userId, cards, { cardId, cardTitle, category, fromHolder, toHolder });
}

export function recordDeal(userId: string, cards: Card[]): Promise<void> {
  return recordEvent('deal_random', userId, cards);
}

export function recordReset(userId: string, cards: Card[]): Promise<void> {
  return recordEvent('deal_reset', userId, cards);
}

export function recordRestore(userId: string, cards: Card[]): Promise<void> {
  return recordEvent('deal_restored', userId, cards);
}
