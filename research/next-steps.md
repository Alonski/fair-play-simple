# Next Steps — Fair Play Simple

_Last updated: 2026-04-03_

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
| Playwright E2E tests (20 × 2) | ✅ Done |
| Catalyst UI kit adoption | ✅ Done |
| Hebrew translations (100 cards) | ✅ Done |
| Nav tab + UI string i18n | ✅ Done |
| Dark mode visual QA | ✅ Done |
| CardModal → Catalyst Dialog | ✅ Done |
| RTL layout support | ✅ Done |
| Statistics tracking | ✅ Done |
| UX review (18 issues fixed) | ✅ Done |
| Cloud Functions + Genkit setup | ✅ Done |
| AI migrated to Genkit flows | ✅ Done |
| Chat backend (multi-turn + tools) | ✅ Done |
| Chat UI (4th nav tab) | ✅ Done |
| Inline AI (rebalance + MSC suggest) | ✅ Done |
| Push notifications + scheduled functions | ✅ Done |
| Two-device sync test | ❌ Next |

---

## Pre-Deployment Checklist

Before deploying the new AI features to production:

1. **Upgrade to Firebase Blaze plan** in console.firebase.google.com
2. **Set Gemini API key**: `firebase functions:secrets:set GEMINI_API_KEY`
3. **Generate VAPID key** for web push: Firebase Console → Project Settings → Cloud Messaging → Web Push certificates
4. **Set VITE_FIREBASE_VAPID_KEY** in `.env` and GitHub Secrets
5. **Deploy**: `firebase deploy --only functions,hosting,firestore:rules`
6. **Test**: Two-device sync test with Alon + Moral

---

## Phase 5: Real-World Testing ← NEXT

- **Two-device sync test**: Alon + Moral logged in simultaneously on separate devices
  - Verify card assignments propagate instantly
  - Verify MSC notes sync
  - Verify Not in Play toggles sync
  - Verify Deal/Reset history appears on both devices
  - Test conflict handling (both editing same card)
  - Test chat (shared mode — both see same messages)
  - Test push notifications on mobile

---

## Phase 7: Future Ideas

- **Offline support** — UI indicator for offline state (SyncStatusBar partially covers this)
- **Onboarding polish** — more household context questions, better AI prompts
- **Chat streaming** — Vercel AI SDK `useChat` with streaming HTTP endpoint instead of callable
- **AI card insights** — badge on CardRow when a card has been held too long
- **Weekly report UI** — show weekly summaries on More screen (data already saved to Firestore)
- **Partner name editing** — Settings UI to change names (currently hardcoded)
- **Gemini Pro upgrade** — for deeper reasoning on complex rebalancing
- **Voice input** — speech-to-text for chat

---

## Open Questions

1. **MSC notes language**: Inline edit writes same text to both `en` and `he` — is that OK, or add a language toggle?
2. **Chat compaction quality**: Does the 50-message summarization preserve enough context?
3. **Push notification opt-in UX**: Should we add a dedicated permissions prompt, or rely on browser default?
