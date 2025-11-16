import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GameState, DealMode, Partner } from '@types';

interface GameStoreState {
  gameState: GameState | null;
  partners: Partner[];
  currentDealMode: DealMode;
  isDealing: boolean;
  dealHistory: string[];

  // Actions
  initializeGame: (gameState: GameState) => void;
  setGameState: (gameState: GameState) => void;
  getGameState: () => GameState | null;
  setPartners: (partners: Partner[]) => void;
  getPartners: () => Partner[];
  setCurrentDealMode: (mode: DealMode) => void;
  setIsDealing: (isDealing: boolean) => void;
  addToDealHistory: (dealId: string) => void;
  clearDealHistory: () => void;
  endGame: () => void;
  resetGame: () => void;
}

export const useGameStore = create<GameStoreState>()(
  persist(
    (set, get) => ({
      gameState: null,
      partners: [],
      currentDealMode: 'random',
      isDealing: false,
      dealHistory: [],

      initializeGame: (gameState) =>
        set(() => ({
          gameState,
          partners: gameState.partners,
          isDealing: false,
        })),

      setGameState: (gameState) =>
        set(() => ({
          gameState,
        })),

      getGameState: () => {
        const state = get();
        return state.gameState;
      },

      setPartners: (partners) =>
        set(() => ({
          partners,
        })),

      getPartners: () => {
        const state = get();
        return state.partners;
      },

      setCurrentDealMode: (mode) =>
        set(() => ({
          currentDealMode: mode,
        })),

      setIsDealing: (isDealing) =>
        set(() => ({
          isDealing,
        })),

      addToDealHistory: (dealId) =>
        set((state) => ({
          dealHistory: [...state.dealHistory, dealId],
        })),

      clearDealHistory: () =>
        set(() => ({
          dealHistory: [],
        })),

      endGame: () =>
        set((state) => {
          if (state.gameState) {
            return {
              gameState: {
                ...state.gameState,
                isActive: false,
              },
            };
          }
          return {};
        }),

      resetGame: () =>
        set(() => ({
          gameState: null,
          currentDealMode: 'random',
          isDealing: false,
          dealHistory: [],
        })),
    }),
    {
      name: 'game-store',
      version: 1,
    }
  )
);
