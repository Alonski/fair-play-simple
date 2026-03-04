import { supabase } from './supabase';
import { useCardStore } from '@stores/cardStore';
import { useGameStore } from '@stores/gameStore';
import type { Card, CardMetadata, CardHistory, DbCard, LocalizedText } from '@types';
import type { RealtimeChannel } from '@supabase/supabase-js';

// Convert local Card to DB row
function localCardToDb(card: Card, householdId: string, userId: string): DbCard {
  return {
    id: card.id,
    household_id: householdId,
    category: card.category,
    title: card.title,
    description: card.description,
    details: card.details,
    holder: card.holder,
    status: card.status,
    metadata: card.metadata as unknown as Record<string, unknown>,
    history: card.history as unknown as Record<string, unknown>[],
    updated_at: new Date().toISOString(),
    updated_by: userId,
  };
}

// Convert DB row to local Card
function dbCardToLocal(dbCard: DbCard): Card {
  return {
    id: dbCard.id,
    category: dbCard.category as Card['category'],
    title: dbCard.title as LocalizedText,
    description: dbCard.description as LocalizedText,
    details: dbCard.details as LocalizedText,
    holder: (dbCard.holder as Card['holder']) || null,
    status: (dbCard.status as Card['status']) || 'unassigned',
    metadata: dbCard.metadata as unknown as CardMetadata,
    history: (dbCard.history || []) as unknown as CardHistory[],
  };
}

export class SyncService {
  private isRemoteUpdate = false;
  private offlineQueue: Array<{ table: string; data: Record<string, unknown> }> = [];
  private channel: RealtimeChannel | null = null;
  private unsubscribeCards: (() => void) | null = null;
  private unsubscribeGame: (() => void) | null = null;
  private householdId: string;
  private userId: string;
  private _status: 'connected' | 'syncing' | 'offline' = 'offline';
  private statusListeners: Set<(status: string) => void> = new Set();

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
    this.setStatus('syncing');
    await this.pullInitialData();
    this.subscribeToRealtime();
    this.subscribeToLocalChanges();
    this.setStatus('connected');

    // Flush offline queue when coming back online
    window.addEventListener('online', () => this.flushOfflineQueue());
    window.addEventListener('offline', () => this.setStatus('offline'));
  }

  stop() {
    if (this.channel) {
      supabase.removeChannel(this.channel);
      this.channel = null;
    }
    this.unsubscribeCards?.();
    this.unsubscribeGame?.();
    this.unsubscribeCards = null;
    this.unsubscribeGame = null;
  }

  // Pull all data from Supabase into Zustand
  async pullInitialData() {
    const { data: cards, error: cardsError } = await supabase
      .from('cards')
      .select('*')
      .eq('household_id', this.householdId);

    if (cardsError) {
      console.error('Error pulling cards:', cardsError);
      return;
    }

    const { data: gameState, error: gameError } = await supabase
      .from('game_state')
      .select('*')
      .eq('household_id', this.householdId)
      .single();

    // Apply to stores
    this.isRemoteUpdate = true;

    if (cards && cards.length > 0) {
      const localCards = cards.map((c) => dbCardToLocal(c as DbCard));
      useCardStore.setState({ cards: localCards });
    }

    if (gameState && !gameError) {
      useGameStore.setState({
        partnerAName: gameState.partner_a_name || 'Partner A',
        partnerBName: gameState.partner_b_name || 'Partner B',
        currentDealMode: gameState.deal_mode || 'random',
      });
    }

    this.isRemoteUpdate = false;
  }

  // Subscribe to Supabase Realtime changes
  private subscribeToRealtime() {
    this.channel = supabase
      .channel(`household:${this.householdId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cards',
          filter: `household_id=eq.${this.householdId}`,
        },
        (payload) => this.handleRemoteCardChange(payload)
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_state',
          filter: `household_id=eq.${this.householdId}`,
        },
        (payload) => this.handleRemoteGameStateChange(payload)
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          this.setStatus('connected');
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          this.setStatus('offline');
        }
      });
  }

  // Handle remote card changes
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private handleRemoteCardChange(payload: any) {
    // Skip if this change was made by us
    if (payload.new?.updated_by === this.userId) return;

    this.isRemoteUpdate = true;

    const eventType = payload.eventType;
    if (eventType === 'INSERT' || eventType === 'UPDATE') {
      const card = dbCardToLocal(payload.new as DbCard);
      const existingCards = useCardStore.getState().cards;
      const exists = existingCards.some((c) => c.id === card.id);

      if (exists) {
        useCardStore.setState({
          cards: existingCards.map((c) => (c.id === card.id ? card : c)),
        });
      } else {
        useCardStore.setState({
          cards: [...existingCards, card],
        });
      }
    } else if (eventType === 'DELETE') {
      const deletedId = payload.old?.id;
      if (deletedId) {
        useCardStore.setState({
          cards: useCardStore.getState().cards.filter((c) => c.id !== deletedId),
        });
      }
    }

    this.isRemoteUpdate = false;
  }

  // Handle remote game state changes
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private handleRemoteGameStateChange(payload: any) {
    if (!payload.new) return;

    this.isRemoteUpdate = true;

    const gs = payload.new;
    useGameStore.setState({
      partnerAName: gs.partner_a_name || 'Partner A',
      partnerBName: gs.partner_b_name || 'Partner B',
      currentDealMode: gs.deal_mode || 'random',
    });

    this.isRemoteUpdate = false;
  }

  // Watch Zustand stores for local changes and push to Supabase
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
        this.pushCardToSupabase(card);
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
        this.pushGameStateToSupabase(state);
      }
    });
  }

  // Find cards that changed between two snapshots
  private diffCards(prev: Card[], curr: Card[]): Card[] {
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

  // Push a single card to Supabase
  private async pushCardToSupabase(card: Card) {
    const dbCard = localCardToDb(card, this.householdId, this.userId);
    const { error } = await supabase.from('cards').upsert(dbCard);

    if (error) {
      console.error('Error pushing card:', error);
      this.offlineQueue.push({ table: 'cards', data: dbCard as unknown as Record<string, unknown> });
    }
  }

  // Push game state to Supabase
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async pushGameStateToSupabase(state: any) {
    const data = {
      household_id: this.householdId,
      deal_mode: state.currentDealMode,
      partner_a_name: state.partnerAName,
      partner_b_name: state.partnerBName,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('game_state').upsert(data);

    if (error) {
      console.error('Error pushing game state:', error);
      this.offlineQueue.push({ table: 'game_state', data });
    }
  }

  // Flush queued operations that failed while offline
  async flushOfflineQueue() {
    this.setStatus('syncing');

    while (this.offlineQueue.length > 0) {
      const op = this.offlineQueue[0];
      const { error } = await supabase.from(op.table).upsert(op.data);

      if (error) {
        // Still offline, stop flushing
        this.setStatus('offline');
        return;
      }

      this.offlineQueue.shift();
    }

    this.setStatus('connected');
  }

  // Seed cards from local sampleCards to Supabase (first-time only)
  async seedCards(cards: Card[]) {
    const dbCards = cards.map((c) => localCardToDb(c, this.householdId, this.userId));

    const { error } = await supabase.from('cards').upsert(dbCards);
    if (error) {
      console.error('Error seeding cards:', error);
    }

    // Also ensure game_state row exists
    await supabase.from('game_state').upsert({
      household_id: this.householdId,
      deal_mode: 'random',
      partner_a_name: useGameStore.getState().partnerAName,
      partner_b_name: useGameStore.getState().partnerBName,
      updated_at: new Date().toISOString(),
    });
  }
}
