# Fair Play Deck App - Phase 2 Session Start Guide

**Status**: Phase 1 Foundation COMPLETE ✅ | Ready for Phase 2 Implementation

**Last Session**: 2025-11-14
**Git Branch**: `claude/read-r-01UvsvDW8sJ6c8obvHjPqCRm`
**Build Status**: ✅ Passing (0 TypeScript errors, 146KB gzipped)

---

## 🎯 Phase 2 Objective: Core Features

Implement functional card dealing, assignment, and basic negotiation to make the app usable.

### Current State Summary

**What's Done (Phase 1)**
- ✅ React 18.3 + TypeScript 5.3 + Vite 5.x setup
- ✅ Tailwind CSS with "Organic Brutalism" design system
- ✅ 9 React components (Layout, Cards, Game)
- ✅ Zustand stores (cardStore, gameStore, settingsStore) with persistence
- ✅ Dexie.js database with 4 tables
- ✅ react-i18next (EN/HE with RTL)
- ✅ Type system complete
- ✅ Production build working

**What's Missing (Blocking Phase 2)**
- ❌ Sample card data (cards table is empty)
- ❌ Card CRUD operations (create/edit/delete UI)
- ❌ Partner profile setup wizard
- ❌ Functional drag-and-drop card assignment
- ❌ Deal algorithms (random, weighted, etc)
- ❌ Negotiation interface
- ❌ Time tracking UI
- ❌ Analytics dashboard

**Component State**
- `GameBoard` exists but shows empty state (no cards)
- `PartnerZone` exists but no cards to assign
- `Card` component done (with 3D flip animation)
- `CardStack` done but not used
- Dashboard shows welcome page when cardStore is empty

---

## 📋 Priority Task List (Recommended Order)

### TASK 1: Create Sample Card Templates ⭐ HIGHEST PRIORITY
**Why**: Unblocks UI testing for all downstream features
**File**: Create `src/utils/sampleCards.ts`
**What to do**:
- Create 50-100 Fair Play deck cards
- Include all 5 categories: daily-grind, kids, home, magic, wild
- Add English + Hebrew titles/descriptions
- Set time estimates and difficulty levels
- Load into cardStore on app init in `src/App.tsx`

**Expected Outcome**:
- GameBoard loads with visible cards
- Cards appear in gallery and partner zones
- No more empty welcome screen

**Success Criteria**:
```
✅ npm run build passes
✅ App shows cards in GameBoard
✅ Cards display in correct categories
✅ No console errors
```

---

### TASK 2: Implement Card CRUD Operations
**Files**:
- `src/components/cards/CardModal.tsx` (new)
- `src/stores/cardStore.ts` (update)

**What to do**:
- Create modal for adding/editing cards
- Add form validation
- Implement update & delete in store
- Add to GameBoard UI

---

### TASK 3: Partner Profile Setup Wizard
**Files**:
- `src/components/partners/PartnerSetupWizard.tsx` (new)
- `src/components/partners/PartnerForm.tsx` (new)
- Extend `gameStore.ts` for partner management

**What to do**:
- Create 3-step wizard: name, avatar, theme color
- Initialize 2 partners (Partner A & B)
- Save to gameStore
- Display on GameBoard

---

### TASK 4: Working Drag & Drop Card Assignment
**Files**:
- `src/components/game/GameBoard.tsx` (update)
- `src/utils/dragDropHelpers.ts` (new)
- `src/stores/cardStore.ts` (update updateCard)

**What to do**:
- Connect drag-and-drop events to store updates
- Update card.holder when dropped on partner zone
- Persist changes to IndexedDB
- Show visual feedback during drag

---

### TASK 5: Implement Deal Algorithms
**Files**:
- `src/utils/dealAlgorithms.ts` (new)
- `src/components/game/GameBoard.tsx` (update)

**What to do**:
- Random deal: shuffle and split evenly
- Weighted deal: based on preferences
- Draft mode: take turns picking
- Auction mode: bid system
- Quick deal: AI suggested

---

## 🚀 Getting Started

### Step 1: Verify Build Works
```bash
npm run build  # Should see ✓ built in 4.6s
```

### Step 2: Start Dev Server
```bash
npm run dev  # Should open http://localhost:5173
```

### Step 3: Create Sample Cards
1. Create `src/utils/sampleCards.ts`
2. Use Card type from `src/types/index.ts`
3. Create cards for all categories
4. Load in App.tsx useEffect

### Step 4: Test in Browser
- Navigate to Game Board tab
- Verify cards display
- Check unassigned, partner zones
- Test language toggle (EN/HE)

---

## 📁 Key Files Reference

| File | Purpose |
|------|---------|
| `src/stores/cardStore.ts` | Card state management |
| `src/types/index.ts` | Card and Partner types |
| `src/components/game/GameBoard.tsx` | Main game interface |
| `src/components/game/PartnerZone.tsx` | Partner card drop zone |
| `src/components/cards/Card.tsx` | Card display component |
| `src/App.tsx` | App initialization |
| `src/services/database.ts` | Dexie.js database |

---

## 💡 Implementation Tips

### Sample Cards Structure
```typescript
const sampleCards: Card[] = [
  {
    id: 'card-001',
    category: 'daily-grind',
    title: { en: 'Morning Dishes', he: 'כלים בבוקר' },
    description: { en: 'Wash breakfast dishes', he: 'לשטוף כלים של ארוחת בוקר' },
    details: { en: 'Every morning after breakfast', he: 'כל בוקר אחרי ארוחה' },
    holder: null,
    status: 'unassigned',
    metadata: {
      createdAt: new Date(),
      modifiedAt: new Date(),
      isCustom: false,
      isActive: true,
      tags: ['daily', 'morning'],
      difficulty: 1,
      frequency: 'daily',
      timeEstimate: 15,
    },
    history: [],
  },
  // ... more cards
];
```

### Load Cards in App.tsx
```typescript
useEffect(() => {
  initializeSampleData().catch(console.error);
  // Load sample cards into store on first run
  const hasCards = useCardStore.getState().getCards().length > 0;
  if (!hasCards) {
    sampleCards.forEach(card => {
      useCardStore.getState().addCard(card);
    });
  }
}, []);
```

---

## ✅ Definition of Done

Each phase 2 task is complete when:
1. ✅ Feature works in UI (testable)
2. ✅ Zero TypeScript errors
3. ✅ No console warnings/errors
4. ✅ Data persists to store and database
5. ✅ Committed with semantic commit message
6. ✅ Updated WORKLOG.md with progress

---

## 📊 Phase 2 Success Metrics

**Target**: Functional MVP with sample data

```
✅ 50+ sample cards loaded
✅ All categories represented
✅ Cards display in GameBoard
✅ Drag-and-drop works
✅ Deal mechanics function
✅ Data persists across refreshes
✅ EN/HE switching works
✅ Build size < 200KB gzipped
✅ 0 TypeScript errors
```

---

## 🔗 Related Documentation

- **PLANNING.md** - Overall project phases and architecture
- **WORKLOG.md** - Session history and metrics
- **AGENTS.md** - Agent workflow and responsibilities
- **Readme.md** - PRD with full feature specifications

---

## 🎬 Start Commands

```bash
# Install dependencies (if needed)
npm install

# Development server
npm run dev

# Build for production
npm run build

# Run type checking
tsc --noEmit

# Run tests
npm run test
```

---

**Next Session Start**: Read this file, verify build passes, then start with TASK 1 (Sample Cards)
