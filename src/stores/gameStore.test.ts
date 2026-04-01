import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from './gameStore';
import type { GameState } from '@types';

const makeGameState = (overrides: Partial<GameState> = {}): GameState => ({
  id: 'game-1',
  partners: [],
  cards: [],
  negotiations: [],
  isActive: true,
  dealMode: 'random',
  rules: {
    minCardsPerPartner: 0,
    categoryBalanceRequired: false,
    checkDependencies: false,
    trackTime: false,
  },
  createdAt: new Date(),
  modifiedAt: new Date(),
  ...overrides,
});

beforeEach(() => {
  useGameStore.setState({
    gameState: null,
    currentDealMode: 'random',
    isDealing: false,
    dealHistory: [],
    partnerAName: 'Alon',
    partnerBName: 'Moral',
  });
});

describe('gameStore', () => {
  describe('initializeGame', () => {
    it('sets gameState and resets isDealing', () => {
      useGameStore.setState({ isDealing: true });
      useGameStore.getState().initializeGame(makeGameState());
      expect(useGameStore.getState().gameState).not.toBeNull();
      expect(useGameStore.getState().isDealing).toBe(false);
    });
  });

  describe('setGameState', () => {
    it('updates gameState', () => {
      const gs = makeGameState({ isActive: false });
      useGameStore.getState().setGameState(gs);
      expect(useGameStore.getState().getGameState()?.isActive).toBe(false);
    });
  });

  describe('setCurrentDealMode', () => {
    it('updates deal mode', () => {
      useGameStore.getState().setCurrentDealMode('draft');
      expect(useGameStore.getState().currentDealMode).toBe('draft');
    });
  });

  describe('setIsDealing', () => {
    it('sets dealing flag', () => {
      useGameStore.getState().setIsDealing(true);
      expect(useGameStore.getState().isDealing).toBe(true);
      useGameStore.getState().setIsDealing(false);
      expect(useGameStore.getState().isDealing).toBe(false);
    });
  });

  describe('dealHistory', () => {
    it('addToDealHistory appends', () => {
      useGameStore.getState().addToDealHistory('deal-1');
      useGameStore.getState().addToDealHistory('deal-2');
      expect(useGameStore.getState().dealHistory).toEqual(['deal-1', 'deal-2']);
    });

    it('clearDealHistory empties history', () => {
      useGameStore.getState().addToDealHistory('deal-1');
      useGameStore.getState().clearDealHistory();
      expect(useGameStore.getState().dealHistory).toHaveLength(0);
    });
  });

  describe('endGame', () => {
    it('sets isActive to false on existing game', () => {
      useGameStore.getState().initializeGame(makeGameState({ isActive: true }));
      useGameStore.getState().endGame();
      expect(useGameStore.getState().gameState?.isActive).toBe(false);
    });

    it('does nothing when no game is active', () => {
      useGameStore.getState().endGame();
      expect(useGameStore.getState().gameState).toBeNull();
    });
  });

  describe('resetGame', () => {
    it('resets all game state', () => {
      useGameStore.getState().initializeGame(makeGameState());
      useGameStore.getState().setCurrentDealMode('auction');
      useGameStore.getState().setIsDealing(true);
      useGameStore.getState().addToDealHistory('deal-1');
      useGameStore.getState().resetGame();
      const s = useGameStore.getState();
      expect(s.gameState).toBeNull();
      expect(s.currentDealMode).toBe('random');
      expect(s.isDealing).toBe(false);
      expect(s.dealHistory).toHaveLength(0);
    });
  });

  describe('partner names', () => {
    it('setPartnerAName updates name', () => {
      useGameStore.getState().setPartnerAName('Alon');
      expect(useGameStore.getState().partnerAName).toBe('Alon');
    });

    it('setPartnerBName updates name', () => {
      useGameStore.getState().setPartnerBName('Moral');
      expect(useGameStore.getState().partnerBName).toBe('Moral');
    });
  });
});
