# Fair Play Deck App - Product Requirements Document v2.0

## Executive Summary
A distinctive, production-grade Progressive Web App for couples to manage Fair Play cards with an unforgettable design aesthetic that breaks from generic app patterns. Built with modern frontend architecture using React, TypeScript, Catalyst UI, and innovative design principles.

## Design Philosophy & Aesthetic Direction

### Conceptual Direction: "Organic Brutalism"
A bold juxtaposition of raw, architectural brutalism with organic, paper-like textures that represents the structured yet fluid nature of domestic partnership.

### Visual Identity
- **Typography**: 
  - Display: "Bricolage Grotesque" - architectural, bold, slightly brutal
  - Body: "Crimson Pro" - warm serif for readability with human touch
  - Hebrew: "Frank Ruhl Libre" - distinctive Hebrew serif
  
- **Color System**:
  ```css
  --ink: #0A0908;          /* Deep charcoal */
  --paper: #FBF5F3;        /* Warm off-white */
  --concrete: #8B8680;     /* Brutalist gray */
  --partner-a: #E63946;    /* Bold red */
  --partner-b: #06AED5;    /* Electric cyan */
  --unassigned: #F1C453;   /* Warm amber */
  --shadow: rgba(10,9,8,0.15);
  ```

- **Distinctive Features**:
  - Torn paper edges on cards
  - Concrete texture overlays
  - Hand-drawn UI elements mixed with sharp geometry
  - Staggered, asymmetric layouts
  - Physical card flip animations with depth
  - Grain texture throughout
  - Custom cursor interactions

## Technical Architecture

### Core Stack
- **Framework**: React 18.3 with TypeScript 5.x
- **UI Library**: Catalyst UI by Tailwind CSS
- **State Management**: Zustand with persistence middleware
- **Styling**: Tailwind CSS 3.4 + CSS Modules for complex animations
- **Build Tool**: Vite 5.x
- **Testing**: Vitest + React Testing Library
- **Database**: IndexedDB with Dexie.js wrapper
- **Animation**: Framer Motion + CSS animations
- **Internationalization**: react-i18next with RTL support
- **PWA**: Workbox for service workers

### Project Structure
```
fair-play-app/
├── src/
│   ├── components/
│   │   ├── cards/
│   │   │   ├── Card.tsx
│   │   │   ├── CardStack.tsx
│   │   │   ├── CardEditor.tsx
│   │   │   └── CardAnimations.module.css
│   │   ├── layout/
│   │   │   ├── Navigation.tsx
│   │   │   ├── PageTransition.tsx
│   │   │   └── Background.tsx
│   │   ├── game/
│   │   │   ├── DealInterface.tsx
│   │   │   ├── PartnerZone.tsx
│   │   │   └── GameBoard.tsx
│   │   └── ui/ (Catalyst components)
│   ├── hooks/
│   │   ├── useCards.ts
│   │   ├── useGameState.ts
│   │   ├── useAnimation.ts
│   │   └── useGestures.ts
│   ├── stores/
│   │   ├── cardStore.ts
│   │   ├── gameStore.ts
│   │   └── settingsStore.ts
│   ├── services/
│   │   ├── database.ts
│   │   ├── sync.ts
│   │   └── export.ts
│   ├── utils/
│   │   ├── animations.ts
│   │   ├── cardLogic.ts
│   │   └── fairPlayRules.ts
│   ├── locales/
│   │   ├── en.json
│   │   └── he.json
│   └── styles/
│       ├── globals.css
│       ├── textures.css
│       └── animations.css
```

## Feature Specifications

### 1. Card System

#### 1.1 Card Data Model
```typescript
interface Card {
  id: string;
  category: Category;
  title: LocalizedText;
  description: LocalizedText;
  details: LocalizedText;
  holder: PartnerId | null;
  status: CardStatus;
  customFields?: CustomField[];
  metadata: {
    createdAt: Date;
    modifiedAt: Date;
    isCustom: boolean;
    isActive: boolean;
    tags: string[];
    difficulty: 1 | 2 | 3;
    frequency: 'daily' | 'weekly' | 'monthly' | 'occasional';
    timeEstimate: number; // minutes
  };
  history: CardHistory[];
}

type Category = 'daily-grind' | 'kids' | 'home' | 'magic' | 'wild' | 'custom';
type CardStatus = 'unassigned' | 'held' | 'in-negotiation' | 'shared' | 'paused';
```

#### 1.2 Card Interactions
- **Drag & Drop**: Smooth drag to assign cards between partners
- **Swipe Gestures**: Mobile-first swipe to assign/unassign
- **3D Flip**: Physical card flip with depth and shadow
- **Stack View**: Cards stack with slight rotation for organic feel
- **Quick Actions**: Long-press for context menu
- **Batch Operations**: Multi-select for bulk actions

#### 1.3 Card Templates
Pre-built card sets:
- Original Fair Play (100 cards)
- Minimalist Set (50 essential cards)
- Extended Set (150+ cards)
- Cultural variants (Jewish holidays, etc.)
- Custom templates by category

### 2. Game Mechanics

#### 2.1 Deal Modes
- **Random Deal**: Shuffle and split evenly
- **Weighted Deal**: Based on preferences/history
- **Draft Mode**: Take turns picking cards
- **Auction Mode**: Bid with "points" for cards
- **Quick Deal**: AI-suggested distribution

#### 2.2 Negotiation System
```typescript
interface Negotiation {
  id: string;
  initiator: PartnerId;
  cards: Card[];
  proposal: {
    from: PartnerId;
    to: PartnerId;
    cards: Card[];
    notes: string;
  };
  status: 'pending' | 'accepted' | 'rejected' | 'counter';
  history: NegotiationEvent[];
}
```

#### 2.3 Game Rules Engine
- Minimum cards per partner
- Category balance requirements
- Card dependencies (e.g., "Bedtime" requires "Bath time")
- Time balance tracking
- Fairness scoring algorithm

### 3. Partner Profiles

#### 3.1 Profile Data
```typescript
interface Partner {
  id: string;
  name: string;
  avatar: Avatar;
  preferences: {
    favoriteCards: string[];
    avoidCards: string[];
    strongSuits: Category[];
    availability: Schedule;
  };
  stats: {
    currentCards: number;
    totalTimeCommitment: number;
    streaks: Streak[];
    achievements: Achievement[];
  };
  theme: {
    color: string;
    pattern: Pattern;
    icon: string;
  };
}
```

#### 3.2 Avatar System
- Custom illustrated avatars
- Upload photo option
- Avatar builder with components
- Animated avatar reactions

### 4. Views & Navigation

#### 4.1 Main Views
1. **Dashboard**: Overview with data visualization
2. **Game Board**: Interactive card dealing space
3. **Card Gallery**: Browse and search all cards
4. **Insights**: Analytics and patterns
5. **Settings**: Preferences and customization

#### 4.2 Navigation Pattern
- Gesture-based navigation on mobile
- Keyboard shortcuts on desktop
- Breadcrumb trail for deep navigation
- Quick access dock for common actions

### 5. Data & Sync

#### 5.1 Offline-First Architecture
- Complete offline functionality
- Background sync when online
- Conflict resolution for multi-device
- Incremental data updates

#### 5.2 Backup & Export
- Automatic local backups
- Cloud backup (optional)
- Export formats: JSON, CSV, PDF report
- Import from other Fair Play apps
- Share game state via link

### 6. Unique Features

#### 6.1 Time Tracker
- Track actual time spent on cards
- Compare estimated vs. actual
- Weekly/monthly reports
- Time balance alerts

#### 6.2 Card Memory
- Photo attachments to cards
- Notes and comments
- Completion history
- Recurring card patterns

#### 6.3 Household Assistant (AI)
- Suggest card assignments
- Identify imbalances
- Recommend new cards
- Natural language card creation

#### 6.4 Celebration Mode
- Completion animations
- Streak celebrations
- Monthly awards
- Partner appreciation messages

## User Flows

### Primary Flow: First-Time Setup
1. **Splash Screen** → Animated logo with texture reveal
2. **Onboarding** → 3-step illustrated guide
3. **Partner Setup** → Create both profiles
4. **Card Selection** → Choose card set template
5. **Initial Deal** → Guided first distribution
6. **Dashboard** → Tour of main features

### Secondary Flow: Daily Check-in
1. **Quick View** → Today's cards at a glance
2. **Complete Cards** → Swipe to mark done
3. **Mini Celebration** → Positive reinforcement
4. **Tomorrow Preview** → What's coming up

### Advanced Flow: Negotiation
1. **Initiate Trade** → Select cards to trade
2. **Propose Terms** → Add notes/conditions
3. **Partner Review** → Notification to partner
4. **Counter/Accept** → Back and forth
5. **Confirmation** → Animated card exchange

## Animation & Interaction Design

### Signature Animations
```css
/* Card flip with depth */
.card-flip {
  transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

/* Torn paper edge */
.torn-edge {
  mask-image: url("data:image/svg+xml,...");
  mask-size: 100% 100%;
}

/* Stagger reveal on load */
.stagger-item {
  animation: revealUp 0.5s cubic-bezier(0.65, 0, 0.35, 1) forwards;
  animation-delay: calc(var(--index) * 0.05s);
}
```

### Micro-interactions
- Hover: Cards slightly lift with shadow
- Active: Pressed paper effect
- Loading: Organic pulse animation
- Success: Confetti burst with haptic feedback
- Error: Gentle shake with red glow

## Accessibility & Performance

### Accessibility Requirements
- WCAG 2.1 AA compliance
- Full keyboard navigation
- Screen reader optimization
- High contrast mode
- Reduced motion option
- Focus indicators with style

### Performance Targets
- Initial load: < 2s on 3G
- Time to Interactive: < 3s
- Lighthouse score: > 95
- Bundle size: < 200KB (gzipped)
- 60fps animations on mid-range devices

## Development Phases

### Phase 1: Foundation (Weeks 1-2)
- Project setup with Vite, TypeScript, Catalyst
- Design system implementation
- Basic card components with animations
- Database schema and migrations
- Internationalization setup

### Phase 2: Core Features (Weeks 3-4)
- Card CRUD operations
- Partner profiles
- Deal mechanics
- Basic game board
- Offline storage

### Phase 3: Game Logic (Weeks 5-6)
- Negotiation system
- Rules engine
- Time tracking
- Analytics dashboard
- Advanced animations

### Phase 4: Polish (Weeks 7-8)
- Unique visual effects
- Performance optimization
- Accessibility audit
- User testing
- Bug fixes and refinement

### Phase 5: Advanced Features (Weeks 9-10)
- AI suggestions
- Cloud sync
- Social features
- Premium templates
- Launch preparation

## Testing Strategy

### Unit Testing
- Component logic
- Store actions
- Utility functions
- Animation hooks

### Integration Testing
- User flows
- Data persistence
- State management
- API interactions

### E2E Testing
- Critical paths
- Cross-browser
- Mobile gestures
- PWA features

### Performance Testing
- Load testing
- Animation performance
- Memory leaks
- Bundle analysis

## Success Metrics

### User Engagement
- Daily Active Users: > 70%
- Session length: > 5 minutes
- Cards dealt per week: > 20
- Negotiation completion: > 80%

### Technical Metrics
- Crash rate: < 0.1%
- Load time: < 2s
- Error rate: < 0.5%
- Offline usage: > 40%

### Design Impact
- User satisfaction: > 4.5/5
- "Would recommend": > 80%
- Design recognition/awards
- Social media shares

## Risk Mitigation

### Technical Risks
- Browser compatibility → Progressive enhancement
- Performance on low-end devices → Adaptive quality
- Data loss → Multiple backup strategies
- Sync conflicts → Clear resolution UI

### UX Risks
- Complex onboarding → Progressive disclosure
- Feature overload → Phased rollout
- Cultural sensitivity → Localization testing
- Accessibility issues → Early testing

## Future Roadmap

### V2.0 Features
- Multi-household support
- Voice commands
- AR card visualization
- Smartwatch app
- Family mode (3+ partners)

### V3.0 Vision
- Community card sharing
- Therapist mode
- Predictive assignments
- Home automation integration
- Cross-platform native apps

## Conclusion

This Fair Play Deck App will stand out through its distinctive "Organic Brutalism" aesthetic, thoughtful animations, and production-grade architecture. By combining Catalyst UI's robust components with custom design elements and modern development practices, we'll create an unforgettable tool that makes domestic labor division both functional and delightful.

The key differentiator is the commitment to a bold aesthetic vision executed with technical excellence - not just another task management app, but a piece of interactive art that happens to solve a real relationship challenge.
