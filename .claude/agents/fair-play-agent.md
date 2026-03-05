# Fair Play Simple — Agent Context

## What This App Is
A digital version of Eve Rodsky's Fair Play card game. Two partners (a couple) use it on their phones to divide household responsibilities fairly. Real-time sync via Supabase so both see the same state.

## Users
- Alon (partner-a, Android)
- Moral (partner-b, iPhone)
- Auth: magic link sign-in, restricted to their two email addresses

## Architecture
```
React 18 + TypeScript + Vite 5
├── Tailwind CSS 3.4 (custom design tokens)
├── Zustand (state management + localStorage persistence)
├── Supabase (auth, database, real-time sync)
├── Framer Motion (animations)
├── react-i18next (English + Hebrew RTL)
└── oxlint (linting)
```

## Key Files
- `src/App.tsx` — auth gate + sync lifecycle + main layout
- `src/stores/authStore.ts` — Zustand auth store with magic link
- `src/services/syncService.ts` — bridges Zustand ↔ Supabase real-time
- `src/services/supabase.ts` — Supabase client init
- `src/components/game/GameBoard.tsx` — main game interface
- `src/components/game/PartnerZone.tsx` — partner card zones
- `src/components/cards/Card.tsx` — card display with 3D flip
- `src/components/cards/CardModal.tsx` — create/edit card form
- `src/components/auth/AuthScreen.tsx` — magic link login
- `src/components/auth/SetupScreen.tsx` — partner slot picker
- `src/components/layout/Navigation.tsx` — nav with connection status
- `src/components/layout/Background.tsx` — decorative background
- `src/utils/sampleCards.ts` — 67 sample cards (needs replacement with real Fair Play cards)
- `src/types/index.ts` — all TypeScript interfaces
- `tailwind.config.js` — design tokens (colors, fonts, shadows)
- `src/styles/globals.css` — CSS variables, font imports, base styles
- `src/styles/textures.css` — texture classes (being gutted in redesign)
- `src/styles/animations.css` — keyframe animations
- `supabase/migrations/20260304000000_initial_schema.sql` — DB schema

## Database Schema
- `households` — one row for the couple
- `profiles` — links auth.users to household, has partner_slot
- `cards` — all Fair Play cards per household (JSONB for title/desc/details)
- `game_state` — deal mode, partner names per household
- RLS policies scope everything to household via profiles

## Fair Play Methodology (Important!)
Cards are **responsibilities**, not tasks. Key concepts:
- **CPE**: Conception (noticing), Planning (logistics), Execution (doing) — card holder owns all three
- **MSC**: Minimum Standard of Care — agreed standard without micromanaging
- **5 Suits**: Home, Out, Caregiving, Magic, Wild + Unicorn Space
- **Re-dealing**: Periodic renegotiation, not daily tracking
- See `research/fair-play-system.md` for full details

## Design Direction
- Warm, light, family-oriented (not "grunge" or brutalist)
- Colors: warm rose (#E07A8E), sage green (#7FB69E), lavender accent (#A78BFA)
- Fonts: Plus Jakarta Sans (display), Inter (body), Noto Sans Hebrew (RTL)
- Soft shadows, rounded corners (16px cards, 12px buttons), 1px borders
- Mobile-first responsive design
- See `tmp/design-preview.html` for visual reference

## Process
- Always create a plan before implementing non-trivial changes
- Update `research/work-log.md` at the end of each session
- Research folder has Fair Play methodology docs and next steps
- Package manager: bun
- Linter: oxlint (not eslint)
- Never mention Claude in commit messages

## Known Issues / Technical Debt
- Supabase not yet deployed to Vercel (needs `vercel link` interactively)
- Auth not configured in Supabase dashboard yet (magic link, redirect URLs)
- Sample cards are invented, need replacement with official Fair Play cards
- Categories don't match official Fair Play suits
- Completion checkbox UX doesn't match Fair Play model (cards are held, not completed)
- Visual redesign started but not finished (foundation tokens applied, components pending)
