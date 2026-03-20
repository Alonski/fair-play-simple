# Production Readiness — Task List

_Created 2026-03-14. Completed 2026-03-14._
_Full plan: `.claude/plans/fluttering-baking-haven.md`_

## Batch 1: Quick Fixes (~45 min) ✅
- [x] 1.1 CardRow: replace hardcoded "Alon"/"Moral" with partner names from gameStore
- [x] 1.2 Fix `.env.example` — replace Supabase vars with Firebase vars
- [x] 1.3 MyCardsScreen: make "Head to Deal" a Link, not plain text
- [x] 1.4 CardRow: format category labels (`unicorn-space` → `Unicorn Space`)
- [x] 1.5 CardRow + MyCardsScreen: format time (`240m` → `4h`)

## Batch 2: Core Sync & Data Fixes (~3-4 hours) ✅
- [x] 2.1 Soft delete: add `'deleted'` to CardStatus, change `removeCard` to set status, update `diffCards`, filter deleted from all queries
- [x] 2.2 Fix NIP unreachable: remove auto-switch useEffect, show "All cards assigned" + NIP section together
- [x] 2.3 Fix auth: reset `initialized` on error, wrap onAuthStateChanged in try/catch, unsubscribe old listener on retry
- [x] 2.4 Error UI: add `readOnlyMode` to authStore, create ErrorScreen (retry + read-only), guard all mutation points including CardRow MSC editor
- [x] 2.5 Fix SyncService: named event listeners, remove in `stop()`
- [x] 2.6 Fix seeding race: gate on `partnerSlot === 'partner-a'`

## Batch 3: History System (~4-5 hours) ✅
- [x] 3.1 Create `DealHistoryEvent` type + `historyService.ts` (saveSnapshot, getHistory with limit(20), restoreSnapshot with WriteBatch)
- [x] 3.2 Add Firestore security rules for history (read + create only, no update/delete)
- [x] 3.3 Create `ConfirmDialog` component (variant: default/destructive, portal-rendered)
- [x] 3.4 Wire Deal + Reset to history: save snapshot before mutation, ConfirmDialog on Reset
- [x] 3.5 History UI in MoreScreen: collapsible section, event list, Restore with ConfirmDialog, clear labeling for 'restore' entries

## Batch 4: UI Features (~5-7 hours) ✅
- [x] 4.1 SyncStatusBar: fixed position, synced/syncing/error states, mount in App.tsx
- [x] 4.2 Styled delete confirmation: replace window.confirm in CardModal with ConfirmDialog
- [x] 4.3 Dark mode: CSS custom properties in globals.css, @custom-variant dark directive, fix inline hex styles, add dark: variants to all components

## Batch 5: Infrastructure (~1-2 hours) ✅
- [x] 5.1 CI: add Firestore rules deploy step to GitHub Actions
- [x] 5.2 Favicon + PWA: create icons, manifest.json, update index.html meta tags

## Batch 6: AI Translation (~3-4 hours) ✅
- [x] 6.1 Enable Firebase AI Logic + Gemini Developer API in console
- [x] 6.2 Create `translationService.ts` using firebase/ai with GoogleAIBackend
- [x] 6.3 Add translate buttons in CardModal between EN/HE field pairs

## Post-completion fix
- [x] CSS @import ordering fix (font import must precede @custom-variant)

---

## Next Steps (not part of this task list)
- [ ] Two-device sync test (Alon + Moral)
- [ ] Dark mode visual QA
- [ ] Translation QA (Gemini buttons end-to-end)
- [ ] Hebrew translations for 100 cards
- [ ] Nav tab translations (hardcoded English)
- [ ] Visual regression tests (E2E screenshots don't catch CSS issues)
