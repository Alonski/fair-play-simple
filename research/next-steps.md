# Next Steps — Fair Play Simple

## Phase 1: Visual Redesign (IN PROGRESS)
Warm, light, family-oriented design replacing the "Organic Brutalism" aesthetic.
- Plan file: `~/.claude/plans/glowing-snuggling-wilkes.md`
- Preview: `tmp/design-preview.html`
- Foundation tokens already applied: `tailwind.config.js`, `globals.css`, `index.html`
- Remaining: apply new styles to all 10+ component files (see plan for full list)
- Status: **Paused** — doing research first, then resuming

## Phase 2: UX Model Fix
Based on Fair Play research (see `research/fair-play-system.md`), our app has the wrong mental model. Cards are ongoing responsibilities, not tasks to check off.

### Changes needed:
1. **Remove completion checkboxes** — cards are "held," not "completed"
   - Remove `handleToggleComplete` from `GameBoard.tsx`
   - Remove done-check button from `PartnerZone.tsx`
   - Simplify card status to: `held`, `unassigned`, `not-in-play`

2. **Fix categories** to match official Fair Play suits:
   - Current: `daily-grind`, `kids`, `home`, `magic`, `wild`
   - Should be: `Home`, `Out`, `Caregiving`, `Magic`, `Wild`, `Unicorn Space`
   - Update `sampleCards.ts`, `types/index.ts`, card filter/display logic

3. **Update card data** to match official Fair Play cards:
   - See `research/fair-play-system.md` for full official card list
   - Replace our 67 invented cards with real Fair Play cards
   - Add CPE descriptions to each card (what C, P, and E mean for that card)
   - Add Hebrew translations

4. **Add "Not in Play" state**:
   - Couples select which cards apply to their household
   - Irrelevant cards hidden but not deleted
   - Needs a setup flow or settings screen

5. **Add MSC notes**:
   - Free-text field per card for "Minimum Standard of Care"
   - Partners agree on what "done well enough" means
   - Stored in card metadata

6. **Add Unicorn Space cards**:
   - Player 1 and Player 2 each get one — non-negotiable
   - These are special cards that both partners must hold

7. **"My Cards" view**:
   - Show logged-in user's held cards as the default view
   - Quick reference for "what am I responsible for?"

8. **Re-deal flow**:
   - Primary interaction: periodic re-negotiation
   - View balance, drag cards between partners, confirm

## Phase 3: Supabase & Deployment
Already built but not yet deployed/tested:
- Vercel deployment (user needs to `vercel link` interactively)
- Supabase auth config (enable magic link, set redirect URLs, restrict emails)
- Test real-time sync between two devices
- Database schema may need updates for new card statuses/categories

## Phase 4: Polish
- Push notifications (future)
- Better offline handling
- PWA improvements
- Onboarding flow for card selection
