import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Card, Category, CardStatus } from '@types/index';

interface CardStore {
  cards: Card[];
  selectedCards: string[];
  searchQuery: string;
  filterCategory: Category | null;
  filterStatus: CardStatus | null;

  // Actions
  addCard: (card: Card) => void;
  removeCard: (cardId: string) => void;
  updateCard: (card: Card) => void;
  getCard: (cardId: string) => Card | undefined;
  getCards: () => Card[];
  getCardsByCategory: (category: Category) => Card[];
  getCardsByStatus: (status: CardStatus) => Card[];
  getCardsByHolder: (partnerId: string) => Card[];

  // Selection
  selectCard: (cardId: string) => void;
  deselectCard: (cardId: string) => void;
  toggleCard: (cardId: string) => void;
  clearSelection: () => void;
  getSelectedCards: () => Card[];

  // Search & Filter
  setSearchQuery: (query: string) => void;
  setFilterCategory: (category: Category | null) => void;
  setFilterStatus: (status: CardStatus | null) => void;
  getFilteredCards: () => Card[];

  // Bulk operations
  bulkAddCards: (cards: Card[]) => void;
  bulkRemoveCards: (cardIds: string[]) => void;
  clearAll: () => void;
}

export const useCardStore = create<CardStore>()(
  persist(
    (set, get) => ({
      cards: [],
      selectedCards: [],
      searchQuery: '',
      filterCategory: null,
      filterStatus: null,

      addCard: (card) =>
        set((state) => ({
          cards: [...state.cards, card],
        })),

      removeCard: (cardId) =>
        set((state) => ({
          cards: state.cards.filter((c) => c.id !== cardId),
          selectedCards: state.selectedCards.filter((id) => id !== cardId),
        })),

      updateCard: (card) =>
        set((state) => ({
          cards: state.cards.map((c) => (c.id === card.id ? card : c)),
        })),

      getCard: (cardId) => {
        const state = get();
        return state.cards.find((c) => c.id === cardId);
      },

      getCards: () => get().cards,

      getCardsByCategory: (category) => {
        const state = get();
        return state.cards.filter((c) => c.category === category);
      },

      getCardsByStatus: (status) => {
        const state = get();
        return state.cards.filter((c) => c.status === status);
      },

      getCardsByHolder: (partnerId) => {
        const state = get();
        return state.cards.filter((c) => c.holder === partnerId);
      },

      selectCard: (cardId) =>
        set((state) => ({
          selectedCards: [...new Set([...state.selectedCards, cardId])],
        })),

      deselectCard: (cardId) =>
        set((state) => ({
          selectedCards: state.selectedCards.filter((id) => id !== cardId),
        })),

      toggleCard: (cardId) =>
        set((state) => {
          const isSelected = state.selectedCards.includes(cardId);
          return {
            selectedCards: isSelected
              ? state.selectedCards.filter((id) => id !== cardId)
              : [...state.selectedCards, cardId],
          };
        }),

      clearSelection: () =>
        set(() => ({
          selectedCards: [],
        })),

      getSelectedCards: () => {
        const state = get();
        return state.cards.filter((c) => state.selectedCards.includes(c.id));
      },

      setSearchQuery: (query) =>
        set(() => ({
          searchQuery: query,
        })),

      setFilterCategory: (category) =>
        set(() => ({
          filterCategory: category,
        })),

      setFilterStatus: (status) =>
        set(() => ({
          filterStatus: status,
        })),

      getFilteredCards: () => {
        const state = get();
        let filtered = state.cards;

        if (state.searchQuery) {
          const query = state.searchQuery.toLowerCase();
          filtered = filtered.filter(
            (c) =>
              c.title.en.toLowerCase().includes(query) ||
              c.title.he.toLowerCase().includes(query) ||
              c.description.en.toLowerCase().includes(query) ||
              c.description.he.toLowerCase().includes(query)
          );
        }

        if (state.filterCategory) {
          filtered = filtered.filter((c) => c.category === state.filterCategory);
        }

        if (state.filterStatus) {
          filtered = filtered.filter((c) => c.status === state.filterStatus);
        }

        return filtered;
      },

      bulkAddCards: (cards) =>
        set((state) => ({
          cards: [...state.cards, ...cards],
        })),

      bulkRemoveCards: (cardIds) =>
        set((state) => ({
          cards: state.cards.filter((c) => !cardIds.includes(c.id)),
          selectedCards: state.selectedCards.filter((id) => !cardIds.includes(id)),
        })),

      clearAll: () =>
        set(() => ({
          cards: [],
          selectedCards: [],
          searchQuery: '',
          filterCategory: null,
          filterStatus: null,
        })),
    }),
    {
      name: 'card-store',
      version: 1,
    }
  )
);
