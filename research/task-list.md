# Production Readiness — Task List

_Created 2026-03-14. Full plan: `.claude/plans/fluttering-baking-haven.md`_

## Batch 1: Quick Fixes (~45 min)
- [ ] 1.1 CardRow: replace hardcoded "Alon"/"Moral" with partner names from gameStore
- [ ] 1.2 Fix `.env.example` — replace Supabase vars with Firebase vars
- [ ] 1.3 MyCardsScreen: make "Head to Deal" a Link, not plain text
- [ ] 1.4 CardRow: format category labels (`unicorn-space` → `Unicorn Space`)
- [ ] 1.5 CardRow + MyCardsScreen: format time (`240m` → `4h`)

## Batch 2: Core Sync & Data Fixes (~3-4 hours)
- [ ] 2.1 Soft delete: add `'deleted'` to CardStatus, change `removeCard` to set status, update `diffCards`, update Firestore converters, filter deleted from all queries
- [ ] 2.2 Fix NIP unreachable: remove auto-switch useEffect, show "All cards assigned" + NIP section together
- [ ] 2.3 Fix auth: reset `initialized` on error, wrap onAuthStateChanged in try/catch, unsubscribe old listener on retry
- [ ] 2.4 Error UI: add `readOnlyMode` to authStore, create ErrorScreen (retry + read-only), guard all mutation points including CardRow MSC editor
- [ ] 2.5 Fix SyncService: named event listeners, remove in `stop()`
- [ ] 2.6 Fix seeding race: gate on `partnerSlot === 'partner-a'`

## Batch 3: History System (~4-5 hours)
- [ ] 3.1 Create `DealHistoryEvent` type + `historyService.ts` (saveSnapshot, getHistory with limit(20), restoreSnapshot with WriteBatch)
- [ ] 3.2 Add Firestore security rules for history (read + create only, no update/delete)
- [ ] 3.3 Create `ConfirmDialog` component (variant: default/destructive, portal-rendered)
- [ ] 3.4 Wire Deal + Reset to history: save snapshot before mutation, ConfirmDialog on Reset
- [ ] 3.5 History UI in MoreScreen: collapsible section, event list, Restore with ConfirmDialog, clear labeling for 'restore' entries

## Batch 4: UI Features (~5-7 hours)
- [ ] 4.1 SyncStatusBar: fixed position, synced/syncing/error states, mount in App.tsx
- [ ] 4.2 Styled delete confirmation: replace window.confirm in CardModal with ConfirmDialog
- [ ] 4.3 Dark mode: CSS custom properties in globals.css, @variant dark directive, fix inline hex styles, add dark: variants to all components, test light/dark/RTL

## Batch 5: Infrastructure (~1-2 hours)
- [ ] 5.1 CI: add Firestore rules deploy step to GitHub Actions
- [ ] 5.2 Favicon + PWA: create icons, manifest.json, update index.html meta tags

## Batch 6: AI Translation (~3-4 hours)
- [ ] 6.1 Enable Firebase AI Logic + Gemini Developer API in console
- [ ] 6.2 Create `translationService.ts` using firebase/ai with GoogleAIBackend
- [ ] 6.3 Add translate buttons in CardModal between EN/HE field pairs

---

## Status Key
- [ ] Not started
- [~] In progress
- [x] Done
- [-] Skipped

## Notes
- Batch 2.1 must complete before Batch 3.4 (restore needs soft delete model)
- Batch 3.3 must complete before Batch 4.2 (delete dialog uses ConfirmDialog)
- Dark mode (4.3) is the highest-risk item — estimated 4-6 hours alone
- Total estimated effort: ~20 hours across all batches
