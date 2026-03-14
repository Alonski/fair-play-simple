# Next Steps — Fair Play Simple

_Last updated: 2026-03-14_

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
| "Not in Play" state | ✅ Done |
| Playwright E2E tests (40 tests) | ✅ Done |
| MSC notes (inline + modal) | ✅ Done |
| Two-device sync test | ❌ Next |
| Hebrew translations | ❌ Not started |
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

## Phase 3: UX Model ✅ DONE

### 3a. "Not in Play" state ✅
- Toggle per card in Deal screen (Remove / Restore buttons in expanded row)
- Not-in-play cards hidden from deal shuffle and My Cards
- Collapsible "Not in Play (n)" section in Unassigned segment

### 3b. MSC Notes ✅
- Inline editing in expanded CardRow (click placeholder → textarea → auto-save on blur)
- Also editable in CardModal (relabeled from generic "Details")
- `details: LocalizedText` field — already on Card type and synced to Firestore
- MSC indicator dot shown in collapsed card header when note exists

### 3c. E2E Tests ✅
- Playwright: 40 tests (20 chromium × 2 projects incl. Pixel 7 mobile)
- Auth bypass via missing Firebase env vars
- Covers: navigation, deal flow, not-in-play, my cards, MSC notes

---

## Phase 4: Firebase Real-World Testing ← NEXT

- **Test real-time sync**: both Alon + Moral logged in on separate devices simultaneously
- Verify card assignment propagates instantly
- Verify MSC notes sync (write on one device, appear on other)
- Verify not-in-play toggles sync
- Check conflict handling (both editing same card)

---

## Phase 5: Polish & Future

- **Hebrew translations**: Translate all 100 card titles/descriptions from English placeholders
- **PWA** — installable on home screen
- **Offline support** — Firestore persistent cache already enabled, needs UI indicators
- **Push notifications** — reminders for held cards
- **Onboarding flow** — guided card selection for new households

---

## Open Questions

1. **Hebrew translations**: Translate now or keep English placeholders?
2. **MSC notes language**: Both `en` and `he` fields are set to the same text by inline edit — is that OK, or do we need separate per-language notes?
3. **MSC notes for official cards**: Should there be starter MSC suggestions for common cards?
