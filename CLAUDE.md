# Fair Play Simple

A digital Fair Play card game for couples to divide household responsibilities fairly. Based on Eve Rodsky's Fair Play method.

## Quick Reference
- **Stack**: React 18 + TypeScript + Vite + Tailwind CSS + Zustand + Firebase
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

## Testing
- **Unit tests**: `bun run test --run` (Vitest)
- **E2E tests**: `bun run test:e2e` (Playwright, chromium)
- **After running E2E tests**: ALWAYS read the screenshot files in `test-results/*.png` to visually verify the UI renders correctly. The E2E assertions only check DOM structure — they will pass even if CSS is broken, the page is blank, or styles are missing. The screenshots are the only way to catch visual regressions.
- E2E tests bypass Firebase auth entirely (no env vars → `isFirebaseConfigured = false`). They seed data via localStorage. This means auth, sync, and Firestore are not tested in E2E.

## Conventions
- Never use grep, always ripgrep
- Never use cat for file creation, use Write tool
- Don't chain cd with other commands
- Commit messages should not mention Claude
- Run full test suite before committing
- Create plans before implementing non-trivial changes
