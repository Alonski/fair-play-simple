# Next Steps — Fair Play Simple

_Last updated: 2026-04-01_

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
| Catalyst UI kit adoption | ✅ Done |
| Hebrew translations (100 cards) | ✅ Done |
| Nav tab + UI string i18n | ✅ Done |
| Dark mode visual QA | ✅ Done |
| Two-device sync test | ❌ Next |

---

## Manual Steps Required

### Enable Firebase AI Logic (required for translate buttons)
1. Go to **console.firebase.google.com** → Fair Play Simple project
2. Click **AI** in the left sidebar (or search for "AI Logic")
3. Enable **Gemini Developer API** (free on Spark plan)
4. The translate buttons in CardModal will start working immediately

---

## Phase 1-4: ✅ DONE

Visual polish, card data, UX model (Not in Play, MSC notes, E2E tests), production readiness — all complete.

---

## Phase 4.5: UI Component System + i18n ✅ DONE

- **Catalyst UI kit**: Adopted Tailwind Plus Catalyst components (Button, Dialog, Badge, Select, Input, Textarea, Fieldset) with custom color tokens (partner-a, partner-b, destructive, accent)
- **Hebrew translations**: All 100 card titles/descriptions translated; all UI strings use i18n
- **Nav tabs**: Wired to i18n — Hebrew shows הכרטיסים שלי / חלוקה / עוד
- **Dark mode polish**: Warmed palette, nav active state rework, MSC textarea dark mode fix
- **Card name templates**: `{{partner-a}}`/`{{partner-b}}` in card data, substituted at display time

---

## Phase 5: Real-World Testing ← NEXT

- **Two-device sync test**: Alon + Moral logged in simultaneously on separate devices
  - Verify card assignments propagate instantly
  - Verify MSC notes sync
  - Verify Not in Play toggles sync
  - Verify Deal/Reset history appears on both devices
  - Test conflict handling (both editing same card)
- **Translation QA**: Test Gemini translate buttons work end-to-end (requires Firebase AI Logic enabled)

---

## Phase 6: Polish & Future

- **Offline support** — Firestore persistent cache is enabled; add UI indicator for offline state
- **Push notifications** — reminders for held cards
- **Onboarding flow** — guided card selection for new households (mark irrelevant cards as Not in Play)
- **CardModal → Catalyst Dialog migration** — CardModal still uses framer-motion; could use Catalyst Dialog for consistency and native focus/escape handling
- **RTL layout** — Hebrew text renders RTL via `dir` attribute, but full page layout (header alignment, nav order) doesn't flip yet

---

## Open Questions

1. **MSC notes language**: Inline edit writes same text to both `en` and `he` — is that OK, or add a language toggle?
2. **MSC starter suggestions**: Should common cards have pre-written MSC examples?
3. **Stale emulator data**: When emulator Firestore has old card data (with "Player 1"/"Player 2"), display-time substitution handles it, but re-seeding would give cleaner Hebrew titles
