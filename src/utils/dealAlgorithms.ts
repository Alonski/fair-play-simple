import type { Card, Partner, PartnerId, DealMode, Category } from '@/types';

/**
 * Deal Algorithms for Fair Play Cards
 * Implements various strategies for distributing cards between partners
 */

/**
 * Shuffle array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Random Deal: Shuffle cards and split evenly between partners
 *
 * @param cards - Array of unassigned cards
 * @param partners - Array of partners
 * @returns Updated cards with holder assignments
 */
export function randomDeal(cards: Card[], partners: Partner[]): Card[] {
  if (partners.length < 2) {
    console.warn('Need at least 2 partners for random deal');
    return cards;
  }

  const shuffled = shuffleArray(cards);
  const updatedCards: Card[] = [];

  shuffled.forEach((card, index) => {
    const partnerIndex = index % partners.length;
    const partnerId = partners[partnerIndex].id as PartnerId;

    updatedCards.push({
      ...card,
      holder: partnerId,
      status: 'held',
    });
  });

  return updatedCards;
}

/**
 * Weighted Deal: Distribute based on partner preferences and strengths
 * Cards from a partner's strong suits go to them first
 *
 * @param cards - Array of unassigned cards
 * @param partners - Array of partners
 * @returns Updated cards with holder assignments
 */
export function weightedDeal(cards: Card[], partners: Partner[]): Card[] {
  if (partners.length < 2) {
    console.warn('Need at least 2 partners for weighted deal');
    return cards;
  }

  const updatedCards: Card[] = [];
  const remainingCards = [...cards];

  // Calculate partner loads
  const partnerLoads: Record<string, number> = {};
  partners.forEach(p => {
    partnerLoads[p.id] = 0;
  });

  // First pass: Assign cards based on strong suits
  partners.forEach(partner => {
    const strongSuits = partner.preferences.strongSuits || [];
    const avoidCards = partner.preferences.avoidCards || [];

    for (let i = remainingCards.length - 1; i >= 0; i--) {
      const card = remainingCards[i];

      // Skip if card should be avoided
      if (avoidCards.includes(card.id)) {
        continue;
      }

      // Assign if card is in strong suit
      if (strongSuits.includes(card.category)) {
        updatedCards.push({
          ...card,
          holder: partner.id as PartnerId,
          status: 'held',
        });
        partnerLoads[partner.id] += card.metadata.timeEstimate;
        remainingCards.splice(i, 1);
      }
    }
  });

  // Second pass: Distribute remaining cards to balance time commitment
  remainingCards.forEach(card => {
    // Find partner with lowest time commitment
    const partnerWithLeastLoad = partners.reduce((prev, curr) => {
      return partnerLoads[curr.id] < partnerLoads[prev.id] ? curr : prev;
    });

    updatedCards.push({
      ...card,
      holder: partnerWithLeastLoad.id as PartnerId,
      status: 'held',
    });
    partnerLoads[partnerWithLeastLoad.id] += card.metadata.timeEstimate;
  });

  return updatedCards;
}

/**
 * Quick Deal: AI-suggested distribution based on card difficulty and time
 * Aims for balanced time commitment and difficulty distribution
 *
 * @param cards - Array of unassigned cards
 * @param partners - Array of partners
 * @returns Updated cards with holder assignments
 */
export function quickDeal(cards: Card[], partners: Partner[]): Card[] {
  if (partners.length < 2) {
    console.warn('Need at least 2 partners for quick deal');
    return cards;
  }

  const updatedCards: Card[] = [];

  // Sort cards by difficulty and time (harder/longer cards first)
  const sortedCards = [...cards].sort((a, b) => {
    const scoreA = a.metadata.difficulty * 10 + a.metadata.timeEstimate;
    const scoreB = b.metadata.difficulty * 10 + b.metadata.timeEstimate;
    return scoreB - scoreA;
  });

  // Track partner loads
  const partnerLoads: Record<string, { time: number; difficulty: number; count: number }> = {};
  partners.forEach(p => {
    partnerLoads[p.id] = { time: 0, difficulty: 0, count: 0 };
  });

  // Distribute cards to maintain balance
  sortedCards.forEach(card => {
    // Find partner with lowest combined score
    const partnerWithLeastLoad = partners.reduce((prev, curr) => {
      const prevScore = partnerLoads[prev.id].time + partnerLoads[prev.id].difficulty * 50;
      const currScore = partnerLoads[curr.id].time + partnerLoads[curr.id].difficulty * 50;
      return currScore < prevScore ? curr : prev;
    });

    updatedCards.push({
      ...card,
      holder: partnerWithLeastLoad.id as PartnerId,
      status: 'held',
    });

    partnerLoads[partnerWithLeastLoad.id].time += card.metadata.timeEstimate;
    partnerLoads[partnerWithLeastLoad.id].difficulty += card.metadata.difficulty;
    partnerLoads[partnerWithLeastLoad.id].count += 1;
  });

  return updatedCards;
}

/**
 * Draft Mode: Partners take turns picking cards (snake draft)
 * This returns the initial state; actual picking should be handled by UI
 *
 * @param cards - Array of unassigned cards
 * @param partners - Array of partners
 * @param picks - Array of partner IDs in pick order (for snake draft simulation)
 * @returns Updated cards with holder assignments
 */
export function draftDeal(
  cards: Card[],
  partners: Partner[],
  picks?: PartnerId[]
): Card[] {
  if (partners.length < 2) {
    console.warn('Need at least 2 partners for draft deal');
    return cards;
  }

  // If no picks provided, simulate a snake draft
  if (!picks || picks.length === 0) {
    const updatedCards: Card[] = [];
    const sortedCards = [...cards].sort((a, b) => {
      // Sort by category and difficulty
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      return b.metadata.difficulty - a.metadata.difficulty;
    });

    let partnerIndex = 0;
    let direction = 1; // 1 for forward, -1 for backward (snake)

    sortedCards.forEach((card) => {
      const partner = partners[partnerIndex];

      updatedCards.push({
        ...card,
        holder: partner.id as PartnerId,
        status: 'held',
      });

      // Snake draft: reverse direction at ends
      partnerIndex += direction;
      if (partnerIndex >= partners.length) {
        partnerIndex = partners.length - 1;
        direction = -1;
      } else if (partnerIndex < 0) {
        partnerIndex = 0;
        direction = 1;
      }
    });

    return updatedCards;
  }

  // Process provided picks
  const updatedCards: Card[] = [];
  const availableCards = [...cards];

  picks.forEach((partnerId) => {
    if (availableCards.length === 0) return;

    // Pick first available card (in real UI, user would choose)
    const card = availableCards.shift()!;
    updatedCards.push({
      ...card,
      holder: partnerId,
      status: 'held',
    });
  });

  // Assign any remaining cards randomly
  availableCards.forEach(card => {
    const randomPartner = partners[Math.floor(Math.random() * partners.length)];
    updatedCards.push({
      ...card,
      holder: randomPartner.id as PartnerId,
      status: 'held',
    });
  });

  return updatedCards;
}

/**
 * Auction Mode: Assign based on bidding points
 * Each partner starts with equal points and bids on cards
 * This is a simplified simulation; real implementation would need UI
 *
 * @param cards - Array of unassigned cards
 * @param partners - Array of partners
 * @returns Updated cards with holder assignments
 */
export function auctionDeal(cards: Card[], partners: Partner[]): Card[] {
  if (partners.length < 2) {
    console.warn('Need at least 2 partners for auction deal');
    return cards;
  }

  const updatedCards: Card[] = [];

  // Each partner starts with 1000 points
  const partnerPoints: Record<string, number> = {};
  partners.forEach(p => {
    partnerPoints[p.id] = 1000;
  });

  // Sort cards by desirability (easier/shorter cards are more desirable)
  const sortedCards = [...cards].sort((a, b) => {
    const scoreA = a.metadata.difficulty * 10 + a.metadata.timeEstimate;
    const scoreB = b.metadata.difficulty * 10 + b.metadata.timeEstimate;
    return scoreA - scoreB; // Lower score = more desirable
  });

  // Simulate auction
  sortedCards.forEach(card => {
    // Determine desirability (inverse of difficulty * time)
    const baseValue = Math.max(1, 100 - (card.metadata.difficulty * 10 + card.metadata.timeEstimate / 2));

    // Partners bid based on available points and preferences
    const bids: { partnerId: string; amount: number }[] = [];

    partners.forEach(partner => {
      const strongSuits = partner.preferences.strongSuits || [];
      const avoidCards = partner.preferences.avoidCards || [];

      // Don't bid if card should be avoided
      if (avoidCards.includes(card.id)) {
        bids.push({ partnerId: partner.id, amount: 0 });
        return;
      }

      // Bid more for cards in strong suits
      let bidAmount = baseValue;
      if (strongSuits.includes(card.category)) {
        bidAmount = Math.min(partnerPoints[partner.id], baseValue * 0.3);
      } else {
        bidAmount = Math.min(partnerPoints[partner.id], baseValue * 0.2);
      }

      bids.push({ partnerId: partner.id, amount: bidAmount });
    });

    // Winner is highest bidder
    const winner = bids.reduce((prev, curr) => {
      return curr.amount > prev.amount ? curr : prev;
    });

    // Assign card to winner and deduct points
    updatedCards.push({
      ...card,
      holder: winner.partnerId as PartnerId,
      status: 'held',
    });
    partnerPoints[winner.partnerId] -= winner.amount;
  });

  return updatedCards;
}

/**
 * Main deal function that routes to appropriate algorithm
 *
 * @param mode - Deal mode to use
 * @param cards - Array of cards to deal
 * @param partners - Array of partners
 * @returns Updated cards with holder assignments
 */
export function dealCards(
  mode: DealMode,
  cards: Card[],
  partners: Partner[]
): Card[] {
  // Filter to only unassigned cards
  const unassignedCards = cards.filter(c => !c.holder || c.holder === null);

  if (unassignedCards.length === 0) {
    console.warn('No unassigned cards to deal');
    return cards;
  }

  let dealtCards: Card[] = [];

  switch (mode) {
    case 'random':
      dealtCards = randomDeal(unassignedCards, partners);
      break;
    case 'weighted':
      dealtCards = weightedDeal(unassignedCards, partners);
      break;
    case 'draft':
      dealtCards = draftDeal(unassignedCards, partners);
      break;
    case 'auction':
      dealtCards = auctionDeal(unassignedCards, partners);
      break;
    case 'quick':
      dealtCards = quickDeal(unassignedCards, partners);
      break;
    default:
      console.warn(`Unknown deal mode: ${mode}`);
      return cards;
  }

  // Merge dealt cards back with already assigned cards
  const assignedCards = cards.filter(c => c.holder !== null);
  return [...assignedCards, ...dealtCards];
}

/**
 * Reset all cards to unassigned
 *
 * @param cards - Array of cards to reset
 * @returns Cards with holder set to null
 */
export function resetDeal(cards: Card[]): Card[] {
  return cards.map(card => ({
    ...card,
    holder: null,
    status: 'unassigned',
  }));
}

/**
 * Get deal statistics for reporting
 *
 * @param cards - Array of cards
 * @param partners - Array of partners
 * @returns Statistics object
 */
export function getDealStats(cards: Card[], partners: Partner[]) {
  const stats: Record<string, {
    cardCount: number;
    totalTime: number;
    avgDifficulty: number;
    categories: Record<Category, number>;
  }> = {};

  // Initialize stats for each partner
  partners.forEach(partner => {
    stats[partner.id] = {
      cardCount: 0,
      totalTime: 0,
      avgDifficulty: 0,
      categories: {
        'daily-grind': 0,
        'kids': 0,
        'home': 0,
        'magic': 0,
        'wild': 0,
        'custom': 0,
      },
    };
  });

  // Calculate stats
  cards.forEach(card => {
    if (card.holder && stats[card.holder]) {
      const partnerStats = stats[card.holder];
      partnerStats.cardCount++;
      partnerStats.totalTime += card.metadata.timeEstimate;
      partnerStats.avgDifficulty += card.metadata.difficulty;
      partnerStats.categories[card.category]++;
    }
  });

  // Calculate averages
  Object.values(stats).forEach(partnerStats => {
    if (partnerStats.cardCount > 0) {
      partnerStats.avgDifficulty /= partnerStats.cardCount;
    }
  });

  return stats;
}
