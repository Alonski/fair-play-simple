# Next Steps — Fair Play Simple

_Last updated: 2026-03-08_

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
| Visual polish (components) | ✅ Done |
| Real card data (official Fair Play deck) | ✅ Done |
| Category fix | ✅ Done |
| Unicorn Space cards | ✅ Done (in deck) |
| "Not in Play" state | ❌ Next |
| MSC notes | ❌ Not started |
| Two-device sync test | ❌ Not tested |
| PWA / offline | ❌ Future |

---

## Phase 1: Visual Polish ✅ DONE

All components restyled with warm paper aesthetic. TanStack Router added for URL-based navigation.

---

## Phase 2: Card Data ✅ DONE

- 100 official Fair Play cards from fairplaypolicy.org (extracted via Chrome DevTools)
- Correct categories: Home(22), Out(22), Caregiving(23), Magic(21), Wild(10), Unicorn Space(2)
- Raw CPE data saved to `research/official-cards-data.json`
- Hebrew placeholders use English text (to be translated later)

---

## Phase 3: UX Model (CURRENT)

### 3a. "Not in Play" state ← NEXT
- Couples mark cards irrelevant to their household (no kids → most Caregiving cards out)
- Add `'not-in-play'` to `CardStatus` type
- UI: toggle per card in Deal screen (long-press or swipe, or button in expanded row)
- Not-in-play cards hidden from deal shuffle and My Cards
- Stored in Firestore (persists across devices)

### 3b. MSC notes
- Free-text field per card, both partners can edit
- Stored in Firestore card doc
- Shown in expanded CardRow

---

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

## Open Questions

1. **Hebrew translations**: Translate now or keep English placeholders?
2. **"Not in Play" flow**: Per-card toggle in Deal screen (decided: yes), or also an onboarding wizard?
3. **MSC notes**: Shared single field, or each partner writes their own?
