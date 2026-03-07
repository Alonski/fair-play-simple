# Next Steps — Fair Play Simple

_Last updated: 2026-03-07_

---

## Status Overview

| Phase | Status |
|-------|--------|
| Firebase migration | ✅ Done |
| Google auth + email allowlist | ✅ Done |
| Mobile-first UI (bottom tabs) | ✅ Done |
| TanStack Router | ✅ Done |
| My Cards / Deal / More screens | ✅ Done |
| CI/CD → Firebase Hosting | ✅ Done |
| Visual design tokens (foundation) | ✅ Done |
| Visual polish (components) | 🔄 In progress |
| Real card data (official Fair Play deck) | ❌ Not started |
| Category fix | ❌ Not started |
| "Not in Play" state | ❌ Not started |
| Unicorn Space cards | ❌ Not started |
| MSC notes | ❌ Not started |
| Two-device sync test | ❌ Not tested |
| PWA / offline | ❌ Future |

---

## Phase 1: Visual Polish (CURRENT)

Foundation tokens already applied (`tailwind.config.js`, `globals.css`, `index.html`).
Remaining: fully restyle all components with warm/light/family design.

**Components to restyle:**
- `CardRow.tsx` — compact list row (new, needs full design treatment)
- `MyCardsScreen.tsx` — header, empty state
- `DealScreen.tsx` — controls, balance bar, segment control
- `MoreScreen.tsx` — settings rows
- `AuthScreen.tsx` — sign-in page
- `CardModal.tsx` — create/edit card modal
- `Background.tsx` — decorative background layer

---

## Phase 2: UX Model Fix (HIGH PRIORITY)

The app has the wrong mental model. Cards are ongoing responsibilities, not completable tasks.
See `research/fair-play-system.md` for full methodology context.

### 2a. Fix categories
- Current: `daily-grind`, `kids`, `home`, `magic`, `wild`
- Should be: `Home`, `Out`, `Caregiving`, `Magic`, `Wild`, `Unicorn Space`
- Files: `src/types/index.ts`, `src/utils/sampleCards.ts`, display logic

### 2b. Replace card data
- Replace ~67 invented cards with official Fair Play cards (~100)
- Full official list in `research/fair-play-system.md`
- Add CPE descriptions per card
- Hebrew translations (can add placeholder `""` and translate later)

### 2c. Add Unicorn Space cards
- Both partners hold one — non-negotiable
- Special card type, not part of the deal shuffle

### 2d. Add "Not in Play" state
- Couples select which cards apply to their household
- Card status: `held` | `unassigned` | `not-in-play`
- UI: toggle per card in Deal screen, or onboarding wizard (TBD)

### 2e. Add MSC notes
- Free-text field per card
- Both partners can edit
- Stored in Firestore card doc

---

## Phase 3: Firebase Real-World Testing

- Test real-time sync with both Alon + Moral logged in on separate devices simultaneously
- Verify card assignment propagates instantly
- Verify conflict handling (both editing same card)

---

## Phase 4: Polish & Future

- PWA — installable on home screen
- Offline support — Firestore persistent cache already enabled, needs UI indicators
- Push notifications — reminders for held cards
- Onboarding flow — guided card selection for new households

---

## Open Questions (from 2026-03-07 planning session)

1. **Card data scope**: Full ~100 official cards, or curated shorter deck for your household?
2. **Hebrew translations**: Translate now or add placeholders?
3. **"Not in Play" flow**: Onboarding wizard vs. per-card toggle in Deal screen?
4. **MSC notes**: Shared single field, or each partner writes their own?
