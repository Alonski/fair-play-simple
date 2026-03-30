# Fair Play — Implementation Plan

## Overview
A mobile-first PWA for couples managing household responsibilities using Eve Rodsky's Fair Play method. Cards represent responsibilities (not tasks) — they are held by a partner, not completed and checked off.

Design aesthetic: warm, light, family-friendly. Soft shadows, rounded surfaces, paper-like backgrounds, partner-colored accents.

## Current State

### Shipped (on main, deployed via Firebase Hosting)
- Three-tab mobile shell: My Cards, Deal, More
- Google sign-in auth (restricted to two emails)
- Real-time Firestore sync between partners
- Card assignment via Deal screen (random deal)
- Card detail editing via CardModal
- MSC (Minimum Standard of Care) notes per card
- Deal history with snapshot/restore
- Dark mode (functional, needs design polish)
- EN/HE language toggle (partial — see "Remaining Work")
- Gemini-powered EN↔HE translation buttons
- Firebase emulator support for local dev
- E2E tests (Playwright) + unit tests (Vitest)
- Lighthouse accessibility auditing

### Not Shipped
- Full i18n (most UI copy is hardcoded English)
- Offline-first local mode (exists technically but UX is incomplete)
- Quick-add card flow (current editor requires all fields)

## Remaining Work (prioritized)

### 1. i18n pass
Most UI strings are hardcoded English: nav labels, deal screen copy, dialog text, MSC labels, card editor fields, history labels. The architecture (react-i18next, locale files, RTL support) is in place — the strings just need to be moved into locale files.

### 2. Local/offline mode coherence
The app works without Firebase (`isFirebaseConfigured = false`) but the UX assumes auth context. `My Cards` shows wrong partner name when `partnerSlot` is missing. History and sign-out are hidden. Translation buttons silently fail. Either make local mode a first-class experience or remove it.

### 3. Dead code cleanup
The repo contains unused components from an earlier "game board" design direction: `Dashboard.tsx`, `GameBoard.tsx`, `PartnerZone.tsx`, `Card.tsx`, `CardStack.tsx`. These are not routed and should be deleted.

### 4. Hebrew card translations
100 sample cards need Hebrew translations. Can be done via the existing Gemini translation service.

### 5. Quick-add card flow
Current CardModal requires title (EN+HE), description (EN+HE), category, frequency, difficulty, time. Add a lightweight "title + category" quick-add path.

### 6. Two-device sync test
Core value prop — need to verify real-time sync works correctly between Alon and Moral's devices.

## Technical Stack
- **Frontend**: React 18 + TypeScript
- **Build**: Vite 5
- **Styling**: Tailwind CSS v4 + CSS custom properties
- **State**: Zustand + persist middleware
- **Backend**: Firebase (Auth, Firestore, Hosting)
- **AI**: Firebase AI / Gemini (translation)
- **Animation**: Framer Motion + CSS transitions
- **i18n**: react-i18next (EN + HE)
- **Testing**: Vitest + Playwright
- **Linter**: oxlint
- **Package manager**: bun

## Key Design Decisions
1. **Cards are responsibilities, not tasks** — held by a partner, not completed
2. **Two-person household** — hardcoded for Alon + Moral, not multi-tenant
3. **Mobile-first** — bottom tab nav, centered content, no desktop-specific layout
4. **List-based UI** — CardRow inline workflow, not a drag-and-drop game board
5. **Warm aesthetic** — soft shadows, partner colors, paper texture, gradient blobs
6. **Firebase-first** — auth, sync, hosting, AI all through Firebase
