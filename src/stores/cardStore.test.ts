import { describe, it, expect, beforeEach } from 'vitest';
import { useCardStore } from './cardStore';
import type { Card } from '@types';

const makeCard = (id: string, overrides: Partial<Card> = {}): Card => ({
  id,
  category: 'daily-grind',
  title: { en: `Card ${id}`, he: `כרטיס ${id}` },
  description: { en: 'desc', he: 'תיאור' },
  details: { en: 'details', he: 'פרטים' },
  holder: null,
  status: 'unassigned',
  metadata: {
    createdAt: new Date(),
    modifiedAt: new Date(),
    isCustom: false,
    isActive: true,
    tags: [],
    difficulty: 1,
    frequency: 'daily',
    timeEstimate: 15,
  },
  history: [],
  ...overrides,
});

beforeEach(() => {
  useCardStore.setState({
    cards: [],
    selectedCards: [],
    searchQuery: '',
    filterCategory: null,
    filterStatus: null,
  });
});

describe('cardStore', () => {
  describe('addCard', () => {
    it('adds a single card', () => {
      useCardStore.getState().addCard(makeCard('1'));
      expect(useCardStore.getState().cards).toHaveLength(1);
    });

    it('preserves existing cards', () => {
      useCardStore.getState().addCard(makeCard('1'));
      useCardStore.getState().addCard(makeCard('2'));
      expect(useCardStore.getState().cards).toHaveLength(2);
    });
  });

  describe('removeCard', () => {
    it('removes a card by id', () => {
      useCardStore.getState().addCard(makeCard('1'));
      useCardStore.getState().addCard(makeCard('2'));
      useCardStore.getState().removeCard('1');
      expect(useCardStore.getState().cards).toHaveLength(1);
      expect(useCardStore.getState().cards[0].id).toBe('2');
    });

    it('also removes card from selectedCards', () => {
      useCardStore.getState().addCard(makeCard('1'));
      useCardStore.getState().selectCard('1');
      useCardStore.getState().removeCard('1');
      expect(useCardStore.getState().selectedCards).toHaveLength(0);
    });
  });

  describe('updateCard', () => {
    it('updates a card in place', () => {
      useCardStore.getState().addCard(makeCard('1'));
      const updated = makeCard('1', { status: 'held', holder: 'partner-a' });
      useCardStore.getState().updateCard(updated);
      expect(useCardStore.getState().cards[0].status).toBe('held');
      expect(useCardStore.getState().cards[0].holder).toBe('partner-a');
    });

    it('does not affect other cards', () => {
      useCardStore.getState().addCard(makeCard('1'));
      useCardStore.getState().addCard(makeCard('2'));
      useCardStore.getState().updateCard(makeCard('1', { status: 'held' }));
      expect(useCardStore.getState().cards[1].status).toBe('unassigned');
    });
  });

  describe('getCard', () => {
    it('returns card by id', () => {
      useCardStore.getState().addCard(makeCard('abc'));
      expect(useCardStore.getState().getCard('abc')?.id).toBe('abc');
    });

    it('returns undefined for unknown id', () => {
      expect(useCardStore.getState().getCard('nope')).toBeUndefined();
    });
  });

  describe('getCardsByCategory', () => {
    it('filters by category', () => {
      useCardStore.getState().addCard(makeCard('1', { category: 'daily-grind' }));
      useCardStore.getState().addCard(makeCard('2', { category: 'kids' }));
      const result = useCardStore.getState().getCardsByCategory('kids');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
    });
  });

  describe('getCardsByStatus', () => {
    it('filters by status', () => {
      useCardStore.getState().addCard(makeCard('1', { status: 'held' }));
      useCardStore.getState().addCard(makeCard('2', { status: 'unassigned' }));
      expect(useCardStore.getState().getCardsByStatus('held')).toHaveLength(1);
    });
  });

  describe('getCardsByHolder', () => {
    it('filters by holder', () => {
      useCardStore.getState().addCard(makeCard('1', { holder: 'partner-a' }));
      useCardStore.getState().addCard(makeCard('2', { holder: 'partner-b' }));
      useCardStore.getState().addCard(makeCard('3', { holder: null }));
      expect(useCardStore.getState().getCardsByHolder('partner-a')).toHaveLength(1);
    });
  });

  describe('selection', () => {
    it('selectCard adds to selection (no duplicates)', () => {
      useCardStore.getState().selectCard('1');
      useCardStore.getState().selectCard('1');
      expect(useCardStore.getState().selectedCards).toHaveLength(1);
    });

    it('deselectCard removes from selection', () => {
      useCardStore.getState().selectCard('1');
      useCardStore.getState().deselectCard('1');
      expect(useCardStore.getState().selectedCards).toHaveLength(0);
    });

    it('toggleCard selects when not selected', () => {
      useCardStore.getState().toggleCard('1');
      expect(useCardStore.getState().selectedCards).toContain('1');
    });

    it('toggleCard deselects when already selected', () => {
      useCardStore.getState().selectCard('1');
      useCardStore.getState().toggleCard('1');
      expect(useCardStore.getState().selectedCards).not.toContain('1');
    });

    it('clearSelection empties selection', () => {
      useCardStore.getState().selectCard('1');
      useCardStore.getState().selectCard('2');
      useCardStore.getState().clearSelection();
      expect(useCardStore.getState().selectedCards).toHaveLength(0);
    });

    it('getSelectedCards returns selected card objects', () => {
      useCardStore.getState().addCard(makeCard('1'));
      useCardStore.getState().addCard(makeCard('2'));
      useCardStore.getState().selectCard('1');
      const selected = useCardStore.getState().getSelectedCards();
      expect(selected).toHaveLength(1);
      expect(selected[0].id).toBe('1');
    });
  });

  describe('search and filter', () => {
    beforeEach(() => {
      useCardStore.getState().addCard(makeCard('1', {
        category: 'daily-grind',
        status: 'unassigned',
        title: { en: 'Morning Dishes', he: 'כלים' },
        description: { en: 'Wash dishes', he: 'לשטוף' },
      }));
      useCardStore.getState().addCard(makeCard('2', {
        category: 'kids',
        status: 'held',
        title: { en: 'School Run', he: 'הסעות' },
        description: { en: 'Drop kids off', he: 'לקחת ילדים' },
      }));
    });

    it('setSearchQuery filters by English title', () => {
      useCardStore.getState().setSearchQuery('morning');
      expect(useCardStore.getState().getFilteredCards()).toHaveLength(1);
    });

    it('setSearchQuery filters by Hebrew title', () => {
      useCardStore.getState().setSearchQuery('כלים');
      expect(useCardStore.getState().getFilteredCards()).toHaveLength(1);
    });

    it('setSearchQuery filters by description', () => {
      useCardStore.getState().setSearchQuery('drop');
      expect(useCardStore.getState().getFilteredCards()).toHaveLength(1);
    });

    it('setFilterCategory filters results', () => {
      useCardStore.getState().setFilterCategory('kids');
      expect(useCardStore.getState().getFilteredCards()).toHaveLength(1);
    });

    it('setFilterStatus filters results', () => {
      useCardStore.getState().setFilterStatus('held');
      expect(useCardStore.getState().getFilteredCards()).toHaveLength(1);
    });

    it('empty query returns all cards', () => {
      useCardStore.getState().setSearchQuery('');
      expect(useCardStore.getState().getFilteredCards()).toHaveLength(2);
    });
  });

  describe('bulk operations', () => {
    it('bulkAddCards adds multiple at once', () => {
      useCardStore.getState().bulkAddCards([makeCard('1'), makeCard('2'), makeCard('3')]);
      expect(useCardStore.getState().cards).toHaveLength(3);
    });

    it('bulkRemoveCards removes multiple at once', () => {
      useCardStore.getState().bulkAddCards([makeCard('1'), makeCard('2'), makeCard('3')]);
      useCardStore.getState().bulkRemoveCards(['1', '2']);
      expect(useCardStore.getState().cards).toHaveLength(1);
      expect(useCardStore.getState().cards[0].id).toBe('3');
    });

    it('bulkRemoveCards also clears selection', () => {
      useCardStore.getState().bulkAddCards([makeCard('1'), makeCard('2')]);
      useCardStore.getState().selectCard('1');
      useCardStore.getState().bulkRemoveCards(['1']);
      expect(useCardStore.getState().selectedCards).not.toContain('1');
    });

    it('clearAll resets everything', () => {
      useCardStore.getState().bulkAddCards([makeCard('1'), makeCard('2')]);
      useCardStore.getState().selectCard('1');
      useCardStore.getState().setSearchQuery('hello');
      useCardStore.getState().setFilterCategory('kids');
      useCardStore.getState().clearAll();
      const s = useCardStore.getState();
      expect(s.cards).toHaveLength(0);
      expect(s.selectedCards).toHaveLength(0);
      expect(s.searchQuery).toBe('');
      expect(s.filterCategory).toBeNull();
      expect(s.filterStatus).toBeNull();
    });
  });
});
