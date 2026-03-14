import { db } from './firebase';
import { useCardStore } from '@stores/cardStore';
import type { Card, DealHistoryEvent, CardSnapshot } from '@types';
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  limit,
  writeBatch,
} from 'firebase/firestore';

const HOUSEHOLD_ID = 'shared';

function cardsToSnapshot(cards: Card[]): CardSnapshot[] {
  return cards
    .filter((c) => c.status !== 'deleted')
    .map((c) => ({ id: c.id, holder: c.holder, status: c.status }));
}

export async function saveSnapshot(
  type: 'deal' | 'reset' | 'restore',
  userId: string,
  eventLabel?: string,
): Promise<void> {
  if (!db) return;

  const cards = useCardStore.getState().getCards();
  const snapshot = cardsToSnapshot(cards);

  const historyRef = collection(db, 'households', HOUSEHOLD_ID, 'history');
  await addDoc(historyRef, {
    type,
    timestamp: new Date().toISOString(),
    performedBy: userId,
    label: eventLabel || null,
    snapshot,
  });
}

export async function getHistory(maxResults = 20): Promise<DealHistoryEvent[]> {
  if (!db) return [];

  const historyRef = collection(db, 'households', HOUSEHOLD_ID, 'history');
  const q = query(historyRef, orderBy('timestamp', 'desc'), limit(maxResults));
  const snap = await getDocs(q);

  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as DealHistoryEvent[];
}

export async function restoreSnapshot(
  eventId: string,
  userId: string,
): Promise<void> {
  if (!db) return;

  // Read the snapshot to restore
  const eventRef = doc(db, 'households', HOUSEHOLD_ID, 'history', eventId);
  const eventSnap = await getDoc(eventRef);
  if (!eventSnap.exists()) return;

  const event = eventSnap.data() as DealHistoryEvent;
  const snapshotToRestore = event.snapshot;

  // Save current state as a 'restore' history entry before overwriting
  const originalTimestamp = new Date(event.timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
  await saveSnapshot('restore', userId, `Reverted to state from ${originalTimestamp}`);

  // Use WriteBatch to atomically update all card assignments
  const batch = writeBatch(db);
  const snapshotMap = new Map(snapshotToRestore.map((s) => [s.id, s]));

  for (const [cardId, snap] of snapshotMap) {
    const cardRef = doc(db, 'households', HOUSEHOLD_ID, 'cards', cardId);
    batch.update(cardRef, {
      holder: snap.holder,
      status: snap.status,
      updatedAt: new Date().toISOString(),
      updatedBy: userId,
    });
  }

  await batch.commit();

  // Update local Zustand store to match
  useCardStore.setState((state) => ({
    cards: state.cards.map((c) => {
      const snap = snapshotMap.get(c.id);
      if (snap) {
        return { ...c, holder: snap.holder as Card['holder'], status: snap.status as Card['status'] };
      }
      return c;
    }),
  }));
}
