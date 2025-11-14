import Dexie, { Table } from 'dexie';
import type { Card, Partner, GameState, Negotiation } from '@types/index';

export class FairPlayDatabase extends Dexie {
  cards!: Table<Card>;
  partners!: Table<Partner>;
  gameStates!: Table<GameState>;
  negotiations!: Table<Negotiation>;

  constructor() {
    super('FairPlayDB');
    this.version(1).stores({
      cards:
        '++id, category, holder, status, &metadata.createdAt',
      partners:
        '&id, name, &theme.color',
      gameStates:
        '++id, isActive, &createdAt',
      negotiations:
        '++id, initiator, status, &createdAt',
    });
  }
}

export const db = new FairPlayDatabase();

/**
 * Database utilities and operations
 */
export const dbOperations = {
  // Card Operations
  async createCard(card: Card): Promise<string> {
    return db.cards.add(card);
  },

  async getCard(id: string): Promise<Card | undefined> {
    return db.cards.get(id);
  },

  async getAllCards(): Promise<Card[]> {
    return db.cards.toArray();
  },

  async getCardsByCategory(category: string): Promise<Card[]> {
    return db.cards.where('category').equals(category).toArray();
  },

  async getCardsByHolder(partnerId: string): Promise<Card[]> {
    return db.cards.where('holder').equals(partnerId).toArray();
  },

  async updateCard(card: Card): Promise<void> {
    await db.cards.put(card);
  },

  async deleteCard(id: string): Promise<void> {
    await db.cards.delete(id);
  },

  // Partner Operations
  async createPartner(partner: Partner): Promise<string> {
    return db.partners.add(partner);
  },

  async getPartner(id: string): Promise<Partner | undefined> {
    return db.partners.get(id);
  },

  async getAllPartners(): Promise<Partner[]> {
    return db.partners.toArray();
  },

  async updatePartner(partner: Partner): Promise<void> {
    await db.partners.put(partner);
  },

  // Game State Operations
  async createGameState(gameState: GameState): Promise<string> {
    return db.gameStates.add(gameState);
  },

  async getGameState(id: string): Promise<GameState | undefined> {
    return db.gameStates.get(id);
  },

  async getAllGameStates(): Promise<GameState[]> {
    return db.gameStates.toArray();
  },

  async getActiveGameState(): Promise<GameState | undefined> {
    return db.gameStates.where('isActive').equals(true).first();
  },

  async updateGameState(gameState: GameState): Promise<void> {
    await db.gameStates.put(gameState);
  },

  // Negotiation Operations
  async createNegotiation(negotiation: Negotiation): Promise<string> {
    return db.negotiations.add(negotiation);
  },

  async getNegotiation(id: string): Promise<Negotiation | undefined> {
    return db.negotiations.get(id);
  },

  async getNegotiationsByStatus(status: string): Promise<Negotiation[]> {
    return db.negotiations.where('status').equals(status).toArray();
  },

  async getPendingNegotiations(): Promise<Negotiation[]> {
    return db.negotiations.where('status').equals('pending').toArray();
  },

  async updateNegotiation(negotiation: Negotiation): Promise<void> {
    await db.negotiations.put(negotiation);
  },

  // Bulk Operations
  async clearAllData(): Promise<void> {
    await Promise.all([
      db.cards.clear(),
      db.partners.clear(),
      db.gameStates.clear(),
      db.negotiations.clear(),
    ]);
  },

  async exportData(): Promise<object> {
    const [cards, partners, gameStates, negotiations] = await Promise.all([
      db.cards.toArray(),
      db.partners.toArray(),
      db.gameStates.toArray(),
      db.negotiations.toArray(),
    ]);

    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      data: {
        cards,
        partners,
        gameStates,
        negotiations,
      },
    };
  },

  async importData(data: any): Promise<void> {
    const { cards = [], partners = [], gameStates = [], negotiations = [] } =
      data.data || data;

    await Promise.all([
      cards.length > 0 ? db.cards.bulkAdd(cards) : Promise.resolve(),
      partners.length > 0 ? db.partners.bulkAdd(partners) : Promise.resolve(),
      gameStates.length > 0
        ? db.gameStates.bulkAdd(gameStates)
        : Promise.resolve(),
      negotiations.length > 0
        ? db.negotiations.bulkAdd(negotiations)
        : Promise.resolve(),
    ]);
  },
};

/**
 * Initialize database with sample data
 */
export async function initializeSampleData(): Promise<void> {
  const existingCards = await db.cards.toArray();

  if (existingCards.length === 0) {
    // This will be populated by the app or user
    console.log('Database initialized and ready for data');
  }
}
