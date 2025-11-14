/**
 * Card Types
 */
export type Category = 'daily-grind' | 'kids' | 'home' | 'magic' | 'wild' | 'custom';
export type CardStatus = 'unassigned' | 'held' | 'in-negotiation' | 'shared' | 'paused';
export type DifficultyLevel = 1 | 2 | 3;
export type Frequency = 'daily' | 'weekly' | 'monthly' | 'occasional';
export type PartnerId = 'partner-a' | 'partner-b';

export interface LocalizedText {
  en: string;
  he: string;
}

export interface CustomField {
  id: string;
  name: string;
  value: string;
  type: 'text' | 'number' | 'date' | 'boolean';
}

export interface CardHistory {
  id: string;
  action: 'created' | 'assigned' | 'completed' | 'negotiated' | 'modified';
  timestamp: Date;
  performedBy: PartnerId;
  details: Record<string, unknown>;
}

export interface CardMetadata {
  createdAt: Date;
  modifiedAt: Date;
  isCustom: boolean;
  isActive: boolean;
  tags: string[];
  difficulty: DifficultyLevel;
  frequency: Frequency;
  timeEstimate: number; // minutes
}

export interface Card {
  id: string;
  category: Category;
  title: LocalizedText;
  description: LocalizedText;
  details: LocalizedText;
  holder: PartnerId | null;
  status: CardStatus;
  customFields?: CustomField[];
  metadata: CardMetadata;
  history: CardHistory[];
}

/**
 * Partner Types
 */
export interface Schedule {
  [day: string]: {
    available: boolean;
    hours: { start: number; end: number }[];
  };
}

export interface Pattern {
  type: 'solid' | 'dots' | 'stripes' | 'geometric';
  color: string;
}

export interface Streak {
  id: string;
  cardId: string;
  count: number;
  startDate: Date;
  lastCompleted: Date;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlockedAt: Date;
  icon: string;
}

export interface PartnerPreferences {
  favoriteCards: string[];
  avoidCards: string[];
  strongSuits: Category[];
  availability: Schedule;
}

export interface PartnerStats {
  currentCards: number;
  totalTimeCommitment: number;
  streaks: Streak[];
  achievements: Achievement[];
}

export interface PartnerTheme {
  color: string;
  pattern: Pattern;
  icon: string;
}

export interface Avatar {
  type: 'avatar-builder' | 'photo' | 'illustrated';
  data: string; // URL or data URI
  animated?: boolean;
}

export interface Partner {
  id: PartnerId;
  name: string;
  avatar: Avatar;
  preferences: PartnerPreferences;
  stats: PartnerStats;
  theme: PartnerTheme;
}

/**
 * Game & Negotiation Types
 */
export type DealMode = 'random' | 'weighted' | 'draft' | 'auction' | 'quick';
export type NegotiationStatus = 'pending' | 'accepted' | 'rejected' | 'counter';

export interface NegotiationProposal {
  from: PartnerId;
  to: PartnerId;
  cards: string[]; // Card IDs
  notes: string;
}

export interface NegotiationEvent {
  id: string;
  type: 'proposed' | 'countered' | 'accepted' | 'rejected';
  timestamp: Date;
  actor: PartnerId;
  details: Record<string, unknown>;
}

export interface Negotiation {
  id: string;
  initiator: PartnerId;
  cardIds: string[];
  proposal: NegotiationProposal;
  status: NegotiationStatus;
  history: NegotiationEvent[];
  createdAt: Date;
  modifiedAt: Date;
}

export interface GameRules {
  minCardsPerPartner: number;
  categoryBalanceRequired: boolean;
  checkDependencies: boolean;
  trackTime: boolean;
}

export interface GameState {
  id: string;
  partners: Partner[];
  cards: Card[];
  negotiations: Negotiation[];
  dealMode: DealMode;
  rules: GameRules;
  isActive: boolean;
  createdAt: Date;
  modifiedAt: Date;
}

/**
 * UI & Settings Types
 */
export interface AppSettings {
  language: 'en' | 'he';
  theme: 'light' | 'dark' | 'auto';
  animations: boolean;
  soundEnabled: boolean;
  notifications: boolean;
  defaultDealMode: DealMode;
}

export interface AnimationConfig {
  duration: number;
  easing: string;
  delay?: number;
}

/**
 * Component Props Interfaces
 */
export interface CardProps {
  card: Card;
  isSelected?: boolean;
  onClick?: () => void;
  onDragStart?: (e: React.DragEvent) => void;
}

export interface CardStackProps {
  cards: Card[];
  onCardClick: (card: Card) => void;
  orientation?: 'vertical' | 'horizontal';
}

export interface PartnerZoneProps {
  partner: Partner;
  cards: Card[];
  onCardDrop?: (cardId: string) => void;
}

export interface GameBoardProps {
  gameState: GameState;
  onDeal?: (mode: DealMode) => void;
  onNegotiate?: (negotiation: Negotiation) => void;
}
