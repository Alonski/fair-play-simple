# Fair Play Simple

A digital Fair Play card game for couples to divide household responsibilities fairly. Based on Eve Rodsky's Fair Play method.

## Quick Reference
- **Stack**: React 18 + TypeScript + Vite + Tailwind CSS v4 + Zustand + Firebase
- **Package manager**: bun (not npm)
- **Linter**: oxlint (`bun run lint`)
- **Build**: `bun run build` (runs tsc then vite build)
- **Dev**: `bun run dev`
- **Deploy**: Firebase Hosting via GitHub Actions (push to main)

## Project Documentation
- See `.claude/agents/fair-play-agent.md` for detailed project context, conventions, and decision log
- See `research/` folder for Fair Play methodology research and next steps
- See `research/work-log.md` for session-by-session progress

## Key Decisions
- Google sign-in auth, restricted to two emails (Alon + Moral)
- Firebase for auth, Firestore for real-time sync, Firebase Hosting for deployment
- Firestore data model: `households/shared` doc + `cards` subcollection + `users/{uid}` collection
- Warm/light/family design aesthetic (not the original "Organic Brutalism")
- Fair Play cards are **responsibilities** (held), not tasks (completed)
- Partner names default to Alon/Moral in gameStore and syncService fallbacks

## Local Dev with Emulators
To run the app with Firebase auth + Firestore locally (no production Firebase needed):
```bash
make dev-emu
```
This starts Firebase emulators (auth:9099, firestore:8080, UI:4000) and the Vite dev server together. The app auto-connects to emulators in dev mode. `make` with no args also runs `dev-emu`.

**Sign in from browser console:**
```js
window.__devSignIn('alonzorz@gmail.com', 'Alon')
```
- App-side email allowlist is skipped when using emulators, but Firestore rules still expect an allowlisted email
- Sample cards auto-seed on first sign-in as partner-a
- Emulator UI available at http://localhost:4000

**Local-only mode** (no Firebase at all — no auth, no sync, no card seeding):
```bash
VITE_FIREBASE_PROJECT_ID= VITE_FIREBASE_API_KEY= bun run dev
```

## Testing
- **Unit tests**: `bun run test --run` (Vitest)
- **E2E tests**: `bun run test:e2e` (Playwright, chromium)
- **After running E2E tests**: ALWAYS read the screenshot files in `test-results/*.png` to visually verify the UI renders correctly. The E2E assertions only check DOM structure — they will pass even if CSS is broken, the page is blank, or styles are missing. The screenshots are the only way to catch visual regressions.
- E2E tests bypass Firebase auth entirely (no env vars → `isFirebaseConfigured = false`). They seed data via localStorage. This means auth, sync, and Firestore are not tested in E2E.
- **Firebase E2E tests**: `bun run test:e2e:firebase` (requires Java for emulators)
  - Tests real auth flow via `window.__devSignIn()` against Firebase emulators
  - Config: `playwright-firebase.config.ts`
  - Tests in `e2e/firebase/`

## UI Components
- **Catalyst**: Adapted Tailwind Plus Catalyst components in `src/components/catalyst/` (Button, Dialog, Badge, Select, Input, Textarea, Fieldset, etc.)
  - Button colors include app tokens: `partner-a`, `partner-b`, `destructive`, `accent`, plus standard Catalyst colors
  - Badge colors include app tokens: `partner-a`, `partner-b`, `accent`
  - Dialog uses Headless UI with app dark mode colors (`dark:bg-[#252540]`)
  - Dependencies: `@headlessui/react` v2, `clsx`
- **ConfirmDialog**: Wrapper around Catalyst Dialog in `src/components/ui/ConfirmDialog.tsx`
- Card name templates: `{{partner-a}}` / `{{partner-b}}` in card data, substituted at display time in CardRow
- CardModal form uses Catalyst `Field` + `Label` + `Input`/`Select`/`Textarea` + `ErrorMessage`

## i18n
- Full English + Hebrew translations via react-i18next
- Translation files: `src/locales/en.json` and `src/locales/he.json`
- All 100 card titles and descriptions translated to Hebrew in `src/utils/sampleCards.ts`
- Nav tabs, settings labels, toasts, and dialogs all use `t()` — no hardcoded English in UI
- Language switcher on More screen; setting persisted in localStorage
- Card titles support `{{partner-a}}`/`{{partner-b}}` templates in both languages
- Legacy "Player 1"/"Player 2" text also substituted at display time for old Firestore data

## Conventions
- Never use grep, always ripgrep
- Never use cat for file creation, use Write tool
- Don't chain cd with other commands
- Commit messages should not mention Claude
- Run full test suite before committing
- Create plans before implementing non-trivial changes
- Never use Playwright or Chrome DevTools MCP tools for visual verification — write Playwright CLI scripts in `tmp/` instead
- For visual QA, write a standalone `.mjs` script and run it with `node`
