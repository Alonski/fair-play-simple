# UX Implications — Fair Play System vs. Our Current App

## The Big Realization

Our app currently treats Fair Play cards like **to-do items** (assign, complete, repeat). But Fair Play cards are actually about **ongoing ownership** — who is *responsible* for this area of household life, including all the mental load (conception + planning), not just execution.

**A card is not a task. A card is a responsibility.**

---

## What Needs to Change

### 1. Remove "Completed" Checkboxes
The current checkmark toggle (`handleToggleComplete`) doesn't fit the Fair Play model. You don't "complete" the Meals card — you *hold* it. It's yours until a re-deal.

**Instead**: Cards should show ownership status:
- **Held by [Partner]** — actively owned
- **Unassigned** — needs to be dealt
- **Not in play** — not relevant to this household

### 2. CPE Should Be Visible (But Simple)
Each card could optionally show what CPE looks like for that card. This helps partners understand they're not just "doing dishes" — they're noticing when dishes need doing (C), keeping dish soap stocked (P), and actually washing (E).

For MVP: just show a brief CPE description on the card back. No tracking.

### 3. MSC Notes
Partners should be able to add a note to each card describing their agreed Minimum Standard of Care. "Dishes done within 2 hours of meal, counters wiped." This is a free-text field, not a checklist.

### 4. Re-Deal Flow Is Primary
The main interaction isn't daily use — it's the periodic re-deal:
1. View current card distribution
2. See balance (who holds how many cards, time estimates)
3. Re-negotiate by dragging cards between partners
4. Confirm the new deal

Between re-deals, the app is mainly a **reference** — "who holds what?"

### 5. Categories Should Match Fair Play
Current: `daily-grind`, `kids`, `home`, `magic`, `wild`
Should be: `Home`, `Out`, `Caregiving`, `Magic`, `Wild`, `Unicorn Space`

"Daily Grinds" is not a category — it's a tag/attribute on cards that are recurring and can't be flexibly scheduled.

### 6. Unicorn Space Cards
Add Player 1 and Player 2 Unicorn Space cards. These are non-negotiable — both partners must have them.

### 7. "Not In Play" State
Couples select which of the 100 cards apply to their household. Cards that don't apply should be removable (not deleted, just hidden). E.g., no kids = hide all Caregiving cards.

---

## Revised App Flow

### First Time Setup
1. Sign in (magic link)
2. Choose partner slot
3. **Card Selection**: Go through cards together, mark which ones apply to your household
4. **Initial Deal**: Assign cards to partners (drag/tap or random deal as starting point)
5. **Optional**: Add MSC notes to important cards

### Day-to-Day Use
- Open app → see your cards (what you're responsible for)
- Tap a card → see CPE description, MSC notes
- That's it. No daily check-ins or completion tracking.

### Re-Deal (Periodic)
- Triggered manually ("Let's re-deal")
- See current distribution with balance stats
- Move cards between partners
- Add/remove cards from play
- Confirm new deal

---

## What This Means for the Current Redesign

The visual redesign can proceed — colors, fonts, shadows are independent of UX model. But we should be aware that:

1. **Remove the done/checkmark toggle** from PartnerZone cards
2. **Card state simplifies to**: `held` (by partner-a or partner-b), `unassigned`, `not-in-play`
3. **The summary footer** should show card count + total time estimate per partner (already there)
4. **Add "Not in Play" section** or filter
5. **Consider a "My Cards" view** — what the logged-in user holds

These UX changes could happen in a follow-up iteration after the visual redesign, or we could do them together.
