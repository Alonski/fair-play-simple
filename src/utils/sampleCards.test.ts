import { describe, it, expect } from 'vitest';
import { sampleCards } from './sampleCards';

const VALID_CATEGORIES = ['daily-grind', 'home', 'kids', 'magic', 'wild', 'custom'];
const VALID_STATUSES = ['unassigned', 'held', 'completed'];
const VALID_FREQUENCIES = ['daily', 'weekly', 'monthly', 'occasional'];

describe('sampleCards', () => {
  it('is a non-empty array', () => {
    expect(Array.isArray(sampleCards)).toBe(true);
    expect(sampleCards.length).toBeGreaterThan(0);
  });

  it('all card ids are unique', () => {
    const ids = sampleCards.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every card has required fields', () => {
    for (const card of sampleCards) {
      expect(card.id, `card missing id`).toBeTruthy();
      expect(card.category, `${card.id} missing category`).toBeTruthy();
      expect(card.title?.en, `${card.id} missing title.en`).toBeTruthy();
      expect(card.title?.he, `${card.id} missing title.he`).toBeTruthy();
      expect(card.description?.en, `${card.id} missing description.en`).toBeTruthy();
      expect(card.description?.he, `${card.id} missing description.he`).toBeTruthy();
    }
  });

  it('every card has a valid category', () => {
    for (const card of sampleCards) {
      expect(VALID_CATEGORIES, `${card.id} has invalid category: ${card.category}`).toContain(card.category);
    }
  });

  it('every card starts unassigned with null holder', () => {
    for (const card of sampleCards) {
      expect(card.holder, `${card.id} should have null holder`).toBeNull();
      expect(VALID_STATUSES, `${card.id} has invalid status`).toContain(card.status);
    }
  });

  it('every card has valid metadata', () => {
    for (const card of sampleCards) {
      const m = card.metadata;
      expect(m, `${card.id} missing metadata`).toBeDefined();
      expect(typeof m.timeEstimate, `${card.id} timeEstimate should be number`).toBe('number');
      expect(m.timeEstimate, `${card.id} timeEstimate should be positive`).toBeGreaterThan(0);
      expect(typeof m.difficulty, `${card.id} difficulty should be number`).toBe('number');
      expect(m.difficulty, `${card.id} difficulty should be >= 1`).toBeGreaterThanOrEqual(1);
      expect(m.difficulty, `${card.id} difficulty should be <= 5`).toBeLessThanOrEqual(5);
      expect(VALID_FREQUENCIES, `${card.id} invalid frequency`).toContain(m.frequency);
      expect(Array.isArray(m.tags), `${card.id} tags should be array`).toBe(true);
    }
  });

  it('every card has a history array', () => {
    for (const card of sampleCards) {
      expect(Array.isArray(card.history), `${card.id} history should be array`).toBe(true);
    }
  });
});
