import { describe, it, expect, vi, beforeEach } from 'vitest';
import { localCardToFirestore, firestoreCardToLocal, SyncService } from './syncService';
import type { Card, FirestoreCard } from '@types';

// Mock Firebase modules
vi.mock('./firebase', () => ({
  db: {},
  isFirebaseConfigured: true,
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(() => ({ id: 'mock-doc' })),
  onSnapshot: vi.fn(() => vi.fn()),
  setDoc: vi.fn(() => Promise.resolve()),
  getDocs: vi.fn(() => Promise.resolve({ empty: true, docs: [] })),
}));

vi.mock('@stores/cardStore', () => ({
  useCardStore: {
    getState: vi.fn(() => ({ cards: [] })),
    setState: vi.fn(),
    subscribe: vi.fn(() => vi.fn()),
  },
}));

vi.mock('@stores/gameStore', () => ({
  useGameStore: {
    getState: vi.fn(() => ({
      partnerAName: 'Alon',
      partnerBName: 'Moral',
      currentDealMode: 'random',
    })),
    setState: vi.fn(),
    subscribe: vi.fn(() => vi.fn()),
  },
}));

const makeCard = (id: string, overrides: Partial<Card> = {}): Card => ({
  id,
  category: 'home',
  title: { en: `Card ${id}`, he: `כרטיס ${id}` },
  description: { en: 'desc', he: 'תיאור' },
  details: { en: 'details', he: 'פרטים' },
  holder: null,
  status: 'unassigned',
  metadata: {
    createdAt: new Date('2024-01-01'),
    modifiedAt: new Date('2024-01-01'),
    isCustom: false,
    isActive: true,
    tags: ['daily'],
    difficulty: 2,
    frequency: 'weekly',
    timeEstimate: 30,
  },
  history: [],
  ...overrides,
});

describe('localCardToFirestore', () => {
  it('maps all card fields correctly', () => {
    const card = makeCard('test-1', { holder: 'partner-a', status: 'held' });
    const result = localCardToFirestore(card, 'user-123');

    expect(result.category).toBe('home');
    expect(result.title).toEqual({ en: 'Card test-1', he: 'כרטיס test-1' });
    expect(result.holder).toBe('partner-a');
    expect(result.status).toBe('held');
    expect(result.updatedBy).toBe('user-123');
    expect(typeof result.updatedAt).toBe('string');
  });

  it('preserves null holder', () => {
    const card = makeCard('1', { holder: null });
    const result = localCardToFirestore(card, 'uid');
    expect(result.holder).toBeNull();
  });

  it('includes metadata and history as records', () => {
    const card = makeCard('1');
    const result = localCardToFirestore(card, 'uid');
    expect(result.metadata).toBeDefined();
    expect(Array.isArray(result.history)).toBe(true);
  });

  it('sets updatedAt to a valid ISO string', () => {
    const result = localCardToFirestore(makeCard('1'), 'uid');
    expect(() => new Date(result.updatedAt)).not.toThrow();
    expect(new Date(result.updatedAt).getTime()).not.toBeNaN();
  });
});

describe('firestoreCardToLocal', () => {
  const makeFirestoreCard = (overrides: Partial<FirestoreCard> = {}): FirestoreCard => ({
    category: 'kids',
    title: { en: 'School Run', he: 'הסעות' },
    description: { en: 'Drop kids', he: 'לקחת ילדים' },
    details: { en: 'daily', he: 'יומי' },
    holder: 'partner-b',
    status: 'held',
    metadata: {},
    history: [],
    updatedAt: new Date().toISOString(),
    updatedBy: 'uid-abc',
    ...overrides,
  });

  it('maps all firestore fields to local card', () => {
    const result = firestoreCardToLocal('card-42', makeFirestoreCard());
    expect(result.id).toBe('card-42');
    expect(result.category).toBe('kids');
    expect(result.holder).toBe('partner-b');
    expect(result.status).toBe('held');
  });

  it('defaults holder to null when missing', () => {
    const result = firestoreCardToLocal('1', makeFirestoreCard({ holder: undefined }));
    expect(result.holder).toBeNull();
  });

  it('defaults status to unassigned when missing', () => {
    const result = firestoreCardToLocal('1', makeFirestoreCard({ status: undefined }));
    expect(result.status).toBe('unassigned');
  });

  it('defaults history to empty array when missing', () => {
    const result = firestoreCardToLocal('1', makeFirestoreCard({ history: undefined }));
    expect(result.history).toEqual([]);
  });
});

describe('SyncService.diffCards', () => {
  let service: SyncService;

  beforeEach(() => {
    service = new SyncService('household-1', 'user-1');
  });

  it('returns empty array when cards are identical', () => {
    const cards = [makeCard('1'), makeCard('2')];
    expect(service.diffCards(cards, cards)).toHaveLength(0);
  });

  it('detects a changed card', () => {
    const prev = [makeCard('1'), makeCard('2')];
    const curr = [makeCard('1', { status: 'held' }), makeCard('2')];
    const diff = service.diffCards(prev, curr);
    expect(diff).toHaveLength(1);
    expect(diff[0].id).toBe('1');
  });

  it('detects a new card', () => {
    const prev = [makeCard('1')];
    const curr = [makeCard('1'), makeCard('2')];
    const diff = service.diffCards(prev, curr);
    expect(diff).toHaveLength(1);
    expect(diff[0].id).toBe('2');
  });

  it('detects all changed cards', () => {
    const prev = [makeCard('1'), makeCard('2')];
    const curr = [makeCard('1', { status: 'held' }), makeCard('2', { holder: 'partner-a' })];
    expect(service.diffCards(prev, curr)).toHaveLength(2);
  });

  it('returns empty array for empty inputs', () => {
    expect(service.diffCards([], [])).toHaveLength(0);
  });

  it('returns all cards when prev is empty (all are new)', () => {
    const curr = [makeCard('1'), makeCard('2')];
    expect(service.diffCards([], curr)).toHaveLength(2);
  });
});
