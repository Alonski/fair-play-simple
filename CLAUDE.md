# Fair Play Simple

A digital Fair Play card game for couples to divide household responsibilities fairly. Based on Eve Rodsky's Fair Play method.

## Quick Reference
- **Stack**: React 18 + TypeScript + Vite + Tailwind CSS + Zustand + Supabase
- **Package manager**: bun (not npm)
- **Linter**: oxlint (`bun run lint`)
- **Build**: `bun run build` (runs tsc then vite build)
- **Dev**: `bun run dev`
- **Local Supabase**: `supabase start` (requires Docker/Rancher Desktop, analytics disabled)

## Project Documentation
- See `.claude/agents/fair-play-agent.md` for detailed project context, conventions, and decision log
- See `research/` folder for Fair Play methodology research and next steps
- See `research/work-log.md` for session-by-session progress

## Key Decisions
- Magic link auth (no passwords), restricted to two emails
- Supabase for real-time sync between two phones (Android + iPhone)
- Vercel deployment (replacing GitHub Pages)
- Warm/light/family design aesthetic (not the original "Organic Brutalism")
- Fair Play cards are **responsibilities** (held), not tasks (completed)

## Conventions
- Never use grep, always ripgrep
- Never use cat for file creation, use Write tool
- Don't chain cd with other commands
- Commit messages should not mention Claude
- Run full test suite before committing
- Create plans before implementing non-trivial changes
