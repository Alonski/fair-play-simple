# Visual QA Findings — 2026-03-20

## Setup
- Firebase Auth + Firestore emulators running locally
- Dev sign-in via `window.__devSignIn(email, name)` helper
- Chrome DevTools MCP for screenshots and inspection

## Issues Found

### 1. Dark mode auto-activates (FIXED)
- **Cause:** Default theme was `'auto'`, respects `prefers-color-scheme: dark`
- **Fix:** Changed default to `'light'` in `settingsStore.ts`
- **Status:** Fixed, not yet committed

### 2. Dark mode palette looks bad
- `partner-a-light: #3d1f27` and `partner-b-light: #1f3d2c` create muddy red/green gradient on auth screen
- Dark mode needs proper design work before enabling
- **Status:** Deferred — dark mode QA is a separate task

### 3. Text contrast is very low across all screens
- Card rows, headings, labels are in the DOM but nearly invisible in screenshots
- Computed styles show correct `color: rgb(45, 49, 66)` and `opacity: 1`
- Card containers have `bg-white` with `shadow-soft` but shadows appear to render as `rgba(0,0,0,0)` — no visible shadow
- The `--shadow-soft` CSS variable may not be applying correctly via Tailwind
- Background gradient blobs (`Background.tsx`) may be washing out content
- **Status:** Needs investigation — run Lighthouse contrast audit

### 4. ErrorScreen invisible when shown
- When Firestore rules block access (wrong email), ErrorScreen renders but text is invisible
- "Something went wrong" and "Retry" button exist in DOM but can't be seen
- Same contrast issue as #3
- **Status:** Blocked by #3

### 5. Firestore rules block emulator test users
- `firestore.rules` has hardcoded email allowlist: `alonzorz@gmail.com`, `swaddlesnaps@gmail.com`
- Emulator test users with other emails get Firestore permission denied
- Must use allowed emails when creating emulator accounts
- **Status:** Workaround in place (use allowed email)

### 6. Auth emulator popup breaks in Chrome DevTools MCP
- `signInWithPopup` opens emulator auth page in new tab
- Selecting that tab in DevTools breaks iframe relay → "No matching frame" error
- Workaround: `window.__devSignIn()` helper uses `signInWithCredential` directly
- **Status:** Workaround in place

### 7. App title says "Fair Play Deck"
- Auth screen and browser tab show "Fair Play Deck" instead of "Fair Play"
- Minor branding issue
- **Status:** Not fixed

## Code Changes Made (not yet committed)
1. `src/stores/settingsStore.ts` — default theme `'light'`
2. `src/stores/settingsStore.test.ts` — updated test expectation
3. `src/stores/authStore.ts` — `SKIP_EMAIL_CHECK` for emulators, `getPartnerName()` helper
4. `src/services/firebase.ts` — emulator connection, `__devSignIn()` helper
5. `firebase.json` — emulator config (auth:9099, firestore:8080, ui:4000)
6. `.github/workflows/ci-cd.yml` — removed Firestore rules deploy step

## Next Steps
1. Run Lighthouse accessibility audit on all pages to quantify contrast issues
2. Fix shadow/contrast problems identified by audit
3. Re-run audit to verify fixes
4. Commit all changes
