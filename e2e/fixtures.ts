import type { Page } from '@playwright/test';

const now = new Date().toISOString();

export const SAMPLE_CARDS = [
  {
    id: 'card-1',
    category: 'home',
    title: { en: 'Groceries', he: 'קניות' },
    description: { en: 'Weekly grocery shopping', he: 'קניות שבועיות' },
    details: { en: '', he: '' },
    holder: null,
    status: 'unassigned',
    metadata: { createdAt: now, modifiedAt: now, isCustom: false, isActive: true, tags: [], difficulty: 2, frequency: 'weekly', timeEstimate: 90 },
    history: [],
  },
  {
    id: 'card-2',
    category: 'home',
    title: { en: 'Laundry', he: 'כביסה' },
    description: { en: 'Washing clothes', he: 'כיבוס בגדים' },
    details: { en: '', he: '' },
    holder: null,
    status: 'unassigned',
    metadata: { createdAt: now, modifiedAt: now, isCustom: false, isActive: true, tags: [], difficulty: 1, frequency: 'weekly', timeEstimate: 60 },
    history: [],
  },
  {
    id: 'card-3',
    category: 'caregiving',
    title: { en: 'School Pickup', he: 'איסוף מבית ספר' },
    description: { en: 'Pick up kids from school', he: 'לאסוף ילדים מבית הספר' },
    details: { en: '', he: '' },
    holder: null,
    status: 'unassigned',
    metadata: { createdAt: now, modifiedAt: now, isCustom: false, isActive: true, tags: [], difficulty: 1, frequency: 'daily', timeEstimate: 30 },
    history: [],
  },
  {
    id: 'card-4',
    category: 'out',
    title: { en: 'Car Maintenance', he: 'תחזוקת רכב' },
    description: { en: 'Oil changes and inspections', he: 'החלפת שמן ובדיקות' },
    details: { en: '', he: '' },
    holder: null,
    status: 'unassigned',
    metadata: { createdAt: now, modifiedAt: now, isCustom: false, isActive: true, tags: [], difficulty: 2, frequency: 'monthly', timeEstimate: 120 },
    history: [],
  },
  {
    id: 'card-5',
    category: 'magic',
    title: { en: 'Birthday Planning', he: 'תכנון יום הולדת' },
    description: { en: 'Plan and organize birthday parties', he: 'תכנון וארגון מסיבות יום הולדת' },
    details: { en: '', he: '' },
    holder: null,
    status: 'unassigned',
    metadata: { createdAt: now, modifiedAt: now, isCustom: false, isActive: true, tags: [], difficulty: 3, frequency: 'yearly', timeEstimate: 180 },
    history: [],
  },
  {
    id: 'card-6',
    category: 'home',
    title: { en: 'Dishes', he: 'כלים' },
    description: { en: 'Washing dishes after meals', he: 'שטיפת כלים אחרי ארוחות' },
    details: { en: '', he: '' },
    holder: null,
    status: 'unassigned',
    metadata: { createdAt: now, modifiedAt: now, isCustom: false, isActive: true, tags: [], difficulty: 1, frequency: 'daily', timeEstimate: 20 },
    history: [],
  },
];

export const CARD_STORE_STATE = {
  state: {
    cards: SAMPLE_CARDS,
    selectedCards: [],
    searchQuery: '',
    filterCategory: null,
    filterStatus: null,
  },
  version: 1,
};

export const GAME_STORE_STATE = {
  state: {
    gameState: null,
    currentDealMode: 'random',
    isDealing: false,
    dealHistory: [],
    partnerAName: 'Alon',
    partnerBName: 'Moral',
  },
  version: 1,
};

/**
 * Call this BEFORE page.goto() to seed localStorage with test cards.
 * addInitScript must be registered before navigation to take effect.
 */
export async function injectStoreData(page: Page, cardStore = CARD_STORE_STATE, gameStore = GAME_STORE_STATE) {
  await page.addInitScript((data) => {
    localStorage.setItem('card-store', JSON.stringify(data.cards));
    localStorage.setItem('game-store', JSON.stringify(data.game));
  }, { cards: cardStore, game: gameStore });
}
