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
| CI/CD → Firebase Hosting + rules | ✅ Done |
| Visual design tokens (foundation) | ✅ Done |
| Visual polish (components) | ✅ Done |
| Real card data (official Fair Play deck) | ✅ Done |
| Category fix + label formatting | ✅ Done |
| Unicorn Space cards | ✅ Done (in deck) |
| "Not in Play" state | ✅ Done |
| MSC notes (inline + modal) | ✅ Done |
| Soft delete + sync | ✅ Done |
| Deal/Reset history + undo | ✅ Done |
| Auth error handling + read-only mode | ✅ Done |
| Dark mode | ✅ Done |
| Sync status bar | ✅ Done |
| Styled confirmation dialogs | ✅ Done |
| Favicon + PWA manifest | ✅ Done |
| Gemini EN↔HE translation | ✅ Done (code) |
| Playwright E2E tests (20 × 2) | ✅ Done |
| Two-device sync test | ❌ Next |

---

## Manual Steps Required

### Enable Firebase AI Logic (required for translate buttons)
1. Go to **console.firebase.google.com** → Fair Play Simple project
2. Click **AI** in the left sidebar (or search for "AI Logic")
3. Enable **Gemini Developer API** (free on Spark plan)
4. The translate buttons in CardModal will start working immediately

---

## Phase 1-3: ✅ DONE

Visual polish, card data, UX model (Not in Play, MSC notes, E2E tests) — all complete.

---

## Phase 4: Production Readiness ✅ DONE

All items from the production readiness audit have been addressed:

- **Soft delete**: Cards use `status: 'deleted'` instead of hard removal; syncs to Firestore correctly
- **Deal/Reset history**: Persistent Firestore subcollection (`households/shared/history`), snapshot before each Deal/Reset, restore from More screen
- **Auth error handling**: try/catch in onAuthStateChanged, retry button, read-only offline mode
- **Sync feedback**: SyncStatusBar shows syncing/offline state
- **Seeding race fix**: Only partner-a seeds cards
- **Event listener leak fix**: Named listeners cleaned up in SyncService.stop()
- **Dark mode**: CSS custom properties overridden under `.dark`, inline hex replaced with vars, `dark:` variants on all components
- **Confirmation dialogs**: Styled ConfirmDialog replaces window.confirm for Reset and card delete
- **PWA**: favicon.svg, manifest.json, apple-touch-icon, theme-color
- **CI**: Firestore rules now deployed alongside hosting
- **Translation**: Gemini 2.5 Flash via Firebase AI Logic, translate buttons between EN/HE fields in CardModal

---

## Phase 5: Real-World Testing ← NEXT

- **Two-device sync test**: Alon + Moral logged in simultaneously on separate devices
  - Verify card assignments propagate instantly
  - Verify MSC notes sync
  - Verify Not in Play toggles sync
  - Verify Deal/Reset history appears on both devices
  - Test conflict handling (both editing same card)
- **Dark mode visual QA**: Check all screens in dark mode on mobile + desktop
- **Translation QA**: Test Gemini translate buttons work end-to-end

---

## Phase 6: Polish & Future

- **Hebrew translations**: Use Gemini translate buttons to translate all 100 card titles/descriptions
- **Offline support** — Firestore persistent cache is enabled; add UI indicator for offline state
- **Push notifications** — reminders for held cards
- **Onboarding flow** — guided card selection for new households (mark irrelevant cards as Not in Play)
- **Nav tab translations** — tab labels are currently hardcoded English

---

## Open Questions

1. **Hebrew translations**: Use the new translate feature to batch-translate, or translate manually for quality?
2. **MSC notes language**: Inline edit writes same text to both `en` and `he` — is that OK, or add a language toggle?
3. **MSC starter suggestions**: Should common cards have pre-written MSC examples?
