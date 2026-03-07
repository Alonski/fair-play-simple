# Work Log — Fair Play Simple

## 2026-03-04

### Session 1
- Set up Supabase, auth infrastructure, database migration
- Migrated from npm to bun, replaced ESLint with oxlint

### Session 2
- Visual redesign planned — warm/family aesthetic
- Design tokens applied to foundation (`tailwind.config.js`, `globals.css`)
- Research pivot: studied Fair Play methodology
- Key finding: cards are responsibilities (held), not tasks (completed)
- CPE model, MSC, 5 suits documented in `research/fair-play-system.md`

---

## 2026-03-06

### Session 3
- **Migrated from Supabase → Firebase** (auth, Firestore, hosting)
- Google sign-in with email allowlist (Alon + Moral)
- Firestore data model: `households/shared` + `cards` subcollection + `users/{uid}`
- CI/CD via GitHub Actions → Firebase Hosting
- Added 81% test coverage (69 tests)

---

## 2026-03-07

### Session 4
- **Mobile-first UX redesign**
  - Replaced hamburger nav + drawer with fixed bottom tab bar
  - 3 new screens: `MyCardsScreen`, `DealScreen`, `MoreScreen`
  - New `CardRow` component — compact expandable rows
  - Default view is now personal "My Cards" screen
- **Added TanStack Router**
  - Routes: `/` (My Cards), `/deal`, `/more`, `*` → redirect to `/`
  - Refresh works, back button works, deep links work
  - Firebase Hosting rewrite already in place
- **Visual polish — "Warm Paper" aesthetic**
  - AuthScreen: split hero layout with decorative card shapes
  - CardRow: white card surface, shadow, smooth CSS grid expand animation
  - MyCardsScreen: gradient header with partner colour identity
  - DealScreen: proportional balance bar (rose/sage/gold segments)
  - MoreScreen: sectioned settings cards
  - Navigation: rose pill indicator for active tab
  - Background: larger corner blobs
  - `globals.css`: paper grain overlay, expandable-grid utility

### Current state
- Visual polish: **complete**
- Routing: **complete**
- Firebase: **deployed** (CI/CD on push to main)
- Next: UX model fix (real card data, correct categories, Not in Play, Unicorn Space, MSC notes)
