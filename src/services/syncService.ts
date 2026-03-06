import { db } from './firebase';
import { useCardStore } from '@stores/cardStore';
import { useGameStore } from '@stores/gameStore';
import type { Card, CardMetadata, CardHistory, FirestoreCard, LocalizedText } from '@types';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  getDocs,
  type Unsubscribe,
} from 'firebase/firestore';

export function localCardToFirestore(card: Card, userId: string): FirestoreCard {
  return {
    category: card.category,
    title: card.title,
    description: card.description,
    details: card.details,
    holder: card.holder,
    status: card.status,
    metadata: card.metadata as unknown as Record<string, unknown>,
    history: card.history as unknown as Record<string, unknown>[],
    updatedAt: new Date().toISOString(),
    updatedBy: userId,
  };
}

export function firestoreCardToLocal(id: string, data: FirestoreCard): Card {
  return {
    id,
    category: data.category as Card['category'],
    title: data.title as LocalizedText,
    description: data.description as LocalizedText,
    details: data.details as LocalizedText,
    holder: (data.holder as Card['holder']) || null,
    status: (data.status as Card['status']) || 'unassigned',
    metadata: data.metadata as unknown as CardMetadata,
    history: (data.history || []) as unknown as CardHistory[],
  };
}

export class SyncService {
  private isRemoteUpdate = false;
  private unsubscribeCards: (() => void) | null = null;
  private unsubscribeGame: (() => void) | null = null;
  private unsubscribeFirestoreCards: Unsubscribe | null = null;
  private unsubscribeFirestoreHousehold: Unsubscribe | null = null;
  private householdId: string;
  private userId: string;
  private _status: 'connected' | 'syncing' | 'offline' = 'offline';
  private statusListeners: Set<(status: string) => void> = new Set();
  private initialCardLoadComplete = false;
  private resolveInitialLoad: (() => void) | null = null;

  constructor(householdId: string, userId: string) {
    this.householdId = householdId;
    this.userId = userId;
  }

  get status() {
    return this._status;
  }

  onStatusChange(listener: (status: string) => void) {
    this.statusListeners.add(listener);
    return () => this.statusListeners.delete(listener);
  }

  private setStatus(status: 'connected' | 'syncing' | 'offline') {
    this._status = status;
    this.statusListeners.forEach((fn) => fn(status));
  }

  async start() {
    if (!db) return;

    this.setStatus('syncing');

    // Wait for the first Firestore snapshot before resolving
    const initialLoadPromise = new Promise<void>((resolve) => {
      this.resolveInitialLoad = resolve;
    });

    this.subscribeToFirestore();
    this.subscribeToLocalChanges();

    // Wait for first cards snapshot to arrive
    await initialLoadPromise;

    this.setStatus('connected');

    window.addEventListener('online', () => this.setStatus('connected'));
    window.addEventListener('offline', () => this.setStatus('offline'));
  }

  stop() {
    this.unsubscribeFirestoreCards?.();
    this.unsubscribeFirestoreHousehold?.();
    this.unsubscribeCards?.();
    this.unsubscribeGame?.();
    this.unsubscribeFirestoreCards = null;
    this.unsubscribeFirestoreHousehold = null;
    this.unsubscribeCards = null;
    this.unsubscribeGame = null;
  }

  private subscribeToFirestore() {
    if (!db) return;

    // Listen to cards subcollection
    const cardsRef = collection(db, 'households', this.householdId, 'cards');
    this.unsubscribeFirestoreCards = onSnapshot(cardsRef, (snapshot) => {
      // Resolve the initial load promise on first snapshot
      if (!this.initialCardLoadComplete) {
        this.initialCardLoadComplete = true;
        this.resolveInitialLoad?.();
      }

      this.isRemoteUpdate = true;

      // Process only changes not authored by this user
      const currentCards = [...useCardStore.getState().cards];
      const currentMap = new Map(currentCards.map((c) => [c.id, c]));

      for (const change of snapshot.docChanges()) {
        const data = change.doc.data() as FirestoreCard;

        if (change.type === 'removed') {
          currentMap.delete(change.doc.id);
        } else {
          // Skip echoes of our own writes
          if (data.updatedBy === this.userId && !snapshot.metadata.fromCache) {
            // Our write confirmed by server — keep our local version
            continue;
          }
          currentMap.set(change.doc.id, firestoreCardToLocal(change.doc.id, data));
        }
      }

      useCardStore.setState({ cards: Array.from(currentMap.values()) });
      this.isRemoteUpdate = false;
    });

    // Listen to household document (for game state: partner names, deal mode)
    const householdRef = doc(db, 'households', this.householdId);
    this.unsubscribeFirestoreHousehold = onSnapshot(householdRef, (snapshot) => {
      if (snapshot.metadata.hasPendingWrites) return;
      if (!snapshot.exists()) return;

      const data = snapshot.data();
      this.isRemoteUpdate = true;
      useGameStore.setState({
        partnerAName: data.partnerAName || 'Partner A',
        partnerBName: data.partnerBName || 'Partner B',
        currentDealMode: data.dealMode || 'random',
      });
      this.isRemoteUpdate = false;
    });
  }

  private subscribeToLocalChanges() {
    let prevCards = useCardStore.getState().cards;

    this.unsubscribeCards = useCardStore.subscribe((state) => {
      if (this.isRemoteUpdate) {
        prevCards = state.cards;
        return;
      }

      const changed = this.diffCards(prevCards, state.cards);
      prevCards = state.cards;

      for (const card of changed) {
        this.pushCardToFirestore(card);
      }
    });

    let prevPartnerAName = useGameStore.getState().partnerAName;
    let prevPartnerBName = useGameStore.getState().partnerBName;
    let prevDealMode = useGameStore.getState().currentDealMode;

    this.unsubscribeGame = useGameStore.subscribe((state) => {
      if (this.isRemoteUpdate) {
        prevPartnerAName = state.partnerAName;
        prevPartnerBName = state.partnerBName;
        prevDealMode = state.currentDealMode;
        return;
      }

      if (
        state.partnerAName !== prevPartnerAName ||
        state.partnerBName !== prevPartnerBName ||
        state.currentDealMode !== prevDealMode
      ) {
        prevPartnerAName = state.partnerAName;
        prevPartnerBName = state.partnerBName;
        prevDealMode = state.currentDealMode;
        this.pushGameStateToFirestore(state);
      }
    });
  }

  diffCards(prev: Card[], curr: Card[]): Card[] {
    const changed: Card[] = [];
    const prevMap = new Map(prev.map((c) => [c.id, c]));

    for (const card of curr) {
      const prevCard = prevMap.get(card.id);
      if (!prevCard || JSON.stringify(prevCard) !== JSON.stringify(card)) {
        changed.push(card);
      }
    }

    return changed;
  }

  private async pushCardToFirestore(card: Card) {
    if (!db) return;
    const cardRef = doc(db, 'households', this.householdId, 'cards', card.id);
    const firestoreCard = localCardToFirestore(card, this.userId);

    try {
      await setDoc(cardRef, firestoreCard, { merge: true });
    } catch (err) {
      console.error('Error pushing card:', err);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async pushGameStateToFirestore(state: any) {
    if (!db) return;
    const householdRef = doc(db, 'households', this.householdId);

    try {
      await setDoc(householdRef, {
        dealMode: state.currentDealMode,
        partnerAName: state.partnerAName,
        partnerBName: state.partnerBName,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (err) {
      console.error('Error pushing game state:', err);
    }
  }

  async seedCards(cards: Card[]) {
    if (!db) return;

    // Check if cards already exist in Firestore before seeding
    const cardsRef = collection(db, 'households', this.householdId, 'cards');
    const existing = await getDocs(cardsRef);
    if (!existing.empty) return;

    for (const card of cards) {
      const cardRef = doc(db, 'households', this.householdId, 'cards', card.id);
      const firestoreCard = localCardToFirestore(card, this.userId);
      await setDoc(cardRef, firestoreCard).catch((err) =>
        console.error('Error seeding card:', err)
      );
    }

    // Ensure household has game state fields
    const householdRef = doc(db, 'households', this.householdId);
    await setDoc(householdRef, {
      dealMode: useGameStore.getState().currentDealMode,
      partnerAName: useGameStore.getState().partnerAName,
      partnerBName: useGameStore.getState().partnerBName,
      updatedAt: new Date().toISOString(),
    }, { merge: true }).catch((err) => console.error('Error seeding game state:', err));
  }
}
