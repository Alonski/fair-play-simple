# Visual Design Review — 2026-03-20

## Overall Assessment

Fair Play Simple has a warm, family-friendly visual identity that successfully avoids clinical/corporate aesthetics — the rose/sage/gold palette evokes a domestic warmth, and the paper texture plus gradient blobs reinforce this personality. The app reads well on mobile at 375-412px. However, the review uncovered **critical accessibility failures** (WCAG AA contrast violations, missing ARIA semantics, no focus traps on modals), **major interaction gaps** (undersized touch targets, no deal feedback, undiscoverable drag-and-drop), and **significant dark mode breakage** (partner colors not overridden, Deal button invisible). Typography suffers from `font-bold` overuse that flattens hierarchy and a fragmented size scale with too many bespoke pixel values. The desktop experience at 1440px lacks a max-width constraint, causing content to stretch edge-to-edge. The Firebase chunk (550KB) and lack of code splitting create a heavy initial payload.

---

## Critical (blocks usability)

### C1. Partner-A text fails WCAG AA contrast
- **Source**: Color review #1
- **Current**: `#b84d63` on `#fafaf8` = ~4.3:1 (needs 4.5:1)
- **Fix**: In `globals.css:13`, change `--color-partner-a: #b84d63` to `--color-partner-a: #a3394f` (~5.2:1)

### C2. Accent color fails WCAG AA for all text
- **Source**: Color review #2
- **Current**: `#a78bfa` on `#fafaf8` = ~3.2:1
- **Fix**: In `globals.css:12`, change `--color-accent: #a78bfa` to `--color-accent: #7c5cd4` (~5.0:1) for text use. Keep `#a78bfa` for decorative (focus rings, selection)

### C3. Dark mode: partner-b text invisible
- **Source**: Color review #9
- **Current**: `#3a7359` on `#1a1a2e` = ~2.9:1 (fails both AA thresholds)
- **Fix**: Add to `.dark` in `globals.css`: `--color-partner-b: #5cb88a;` (~5.8:1)

### C4. Segment controls lack ARIA tablist semantics
- **Source**: Accessibility #A1
- **WCAG**: 4.1.2 Name, Role, Value
- **Fix**: Wrap segment buttons in `<div role="tablist">`, add `role="tab"`, `aria-selected={isActive}`, `aria-controls` to each button. Apply to `DealScreen.tsx` segments and `MoreScreen.tsx` language/theme toggles

### C5. Modals missing dialog role and focus trap
- **Source**: Accessibility #A3
- **WCAG**: 4.1.2, 2.4.3
- **Fix**: Add `role="dialog"`, `aria-modal="true"`, `aria-labelledby` to `CardModal.tsx` and `ConfirmDialog.tsx`. Implement focus trap. Add Escape key handler to ConfirmDialog

### C6. Form labels not associated with inputs
- **Source**: Accessibility #A4
- **WCAG**: 1.3.1, 4.1.2
- **Fix**: Add `id` to each input and `htmlFor` to each label in `CardModal.tsx`

### C7. CardRow action buttons below 48px touch target
- **Source**: Interactions #1
- **Fix**: In `CardRow.tsx:209-246`, change `py-1.5` to `py-2.5 min-h-[44px]`

---

## Major (significant polish)

### M1. Dark mode: partner-a text below AA
- **Source**: Color review #10
- **Current**: `#b84d63` on `#1a1a2e` = ~3.3:1
- **Fix**: Add to `.dark` in `globals.css`: `--color-partner-a: #e07a90;` (~5.4:1)

### M2. Dark mode: Deal Cards button invisible
- **Source**: Color review #12, Product #16
- **Fix**: In dark mode, use lightened partner-a as button bg with dark text, or add `border border-partner-a/30`

### M3. Card shadows too faint for separation
- **Source**: Color review #6
- **Fix**: In `globals.css:24-26`, change shadow opacities: `--shadow-soft: 0 4px 12px rgba(0,0,0,0.10)`, `--shadow-soft-sm: 0 1px 4px rgba(0,0,0,0.07)`, `--shadow-soft-lg: 0 8px 24px rgba(0,0,0,0.12)`

### M4. Partner badge contrast failures
- **Source**: Color review #3, #4
- **Fix**: Darken `--color-partner-a` to `#a3394f` (fixes C1 too). Darken `--color-partner-b` to `#2d5f48`

### M5. No max-width on desktop (1440px stretches edge-to-edge)
- **Source**: Layout #2, Product #15
- **Fix**: In `App.tsx:115`, wrap content in `<div className="max-w-2xl mx-auto w-full">`. Or add utility `.content-container { max-width: 42rem; margin: 0 auto; width: 100%; }` in `globals.css`

### M6. Inconsistent horizontal padding
- **Source**: Layout #1
- **Fix**: Standardize all headers and content areas to `px-5` (currently headers use `px-5`, card lists use `px-4`)

### M7. Bottom padding insufficient for safe area
- **Source**: Layout #3
- **Fix**: Change `pb-16` on `<main>` in `App.tsx` to `pb-20` or `pb-[calc(4rem+env(safe-area-inset-bottom,0px)+1rem)]`

### M8. font-bold overused — hierarchy flattened
- **Source**: Typography #2
- **Fix**: Reserve `font-bold` (700) for page titles and primary CTAs. Use `font-semibold` (600) for card titles and form labels. Use `font-medium` (500) for segment controls, nav labels, secondary buttons

### M9. Fragmented type scale (10 distinct sizes)
- **Source**: Typography #3
- **Fix**: Consolidate — map `text-[10px]` → `text-xs` (12px), `text-[11px]` → `text-xs` (12px), `text-[15px]` → `text-base` (16px). Result: clean 5-step scale: 30-20-16-14-12

### M10. 10px text below legibility threshold
- **Source**: Typography #4
- **Fix**: Change `text-[10px]` to `text-xs` (12px) in: `CardRow.tsx:121` (category), `Navigation.tsx:34` (nav labels), `MoreScreen.tsx:73,97,129` (section labels)

### M11. No visual feedback after Deal/Reset
- **Source**: Interactions #4
- **Fix**: Add success toast or stagger animation in `DealScreen.tsx` after `handleDeal()` and `handleResetConfirmed()`

### M12. Drag-and-drop undiscoverable
- **Source**: Interactions #5
- **Fix**: Either add visible drag handles + drop zones + touch DnD library, or remove `draggable={true}` from `CardRow.tsx:101` since tap-assign flow works

### M13. No onboarding or first-run experience
- **Source**: Product #17
- **Fix**: Add 2-3 step welcome flow after first sign-in. The `en.json` already has onboarding strings — wire them into a brief overlay or inline wizard

### M14. "Deal Cards" has no confirmation step
- **Source**: Product #4
- **Fix**: Add ConfirmDialog before dealing: "This will randomly assign N unassigned cards between partners. Continue?"

### M15. CardRow active/pressed state imperceptible
- **Source**: Interactions #3
- **Fix**: In `CardRow.tsx:109`, change `active:bg-black/[0.02]` to `active:bg-black/[0.06]`

### M16. Missing aria-expanded on CardRow
- **Source**: Accessibility #A2
- **Fix**: Add `aria-expanded={expanded}` to the button in `CardRow.tsx:108`

### M17. Nav missing aria-current
- **Source**: Accessibility #A6
- **Fix**: Add `aria-current={isActive ? 'page' : undefined}` to each `<Link>` in `Navigation.tsx`

### M18. No skip-navigation link
- **Source**: Accessibility #A7
- **Fix**: Add `<a href="#main-content" className="sr-only focus:not-sr-only ...">Skip to content</a>` as first element in App.tsx. Add `id="main-content"` to `<main>`

### M19. Color-only assignment indicators
- **Source**: Accessibility #A8
- **Fix**: Add patterns or text labels alongside color in balance bar segments and card row borders

### M20. Low contrast small text in multiple locations
- **Source**: Accessibility #A9
- **Fix**: `text-concrete` at small sizes needs darkening to `#525860`. Dark mode `--color-concrete` should be at least `#9aa0b0`

### M21. Balance bar segments inaccessible
- **Source**: Accessibility #A10
- **Fix**: Add `role="img"` and `aria-label` describing distribution to balance bar container

### M22. Firebase chunk 550KB
- **Source**: Accessibility/Perf #P1
- **Fix**: Lazy-load Firebase behind auth gate using dynamic `import()`. Non-Firebase users should never download this chunk

---

## Minor (refinement)

### m1. Background blobs nearly invisible on mobile
- **Source**: Color review #7
- **Fix**: In `Background.tsx`, increase opacity from 0.09 to 0.12 for rose/sage, 0.07 to 0.09 for gold

### m2. Paper grain z-index 9999 stacking risk
- **Source**: Color review #8
- **Fix**: In `globals.css:75`, reduce `z-index: 9999` to `z-index: 50`

### m3. Concrete text at 10px borderline
- **Source**: Color review #5
- **Fix**: For `text-[10px]` usage, either increase to 12px (see M10) or darken concrete to `#5b6370`

### m4. CardRow chevron too small
- **Source**: Layout #4
- **Fix**: Wrap chevron in `w-6 h-6 flex items-center justify-center` in `CardRow.tsx:136`

### m5. Deal header consumes 55% viewport on mobile
- **Source**: Layout #7
- **Fix**: Reduce `mb-4` to `mb-3` on title and balance bar in `DealScreen.tsx`

### m6. Segment control styling inconsistent between screens
- **Source**: Layout #8
- **Fix**: Standardize on `rounded-xl p-1` for all segmented controls (DealScreen uses `rounded-2xl p-1`, MoreScreen uses `rounded-xl p-0.5`)

### m7. MoreScreen panels asymmetric padding
- **Source**: Layout #9
- **Fix**: Change `pt-4 pb-3` to `pt-4 pb-4` in `MoreScreen.tsx:72`

### m8. Unused responsive type scale in textures.css
- **Source**: Typography #1
- **Fix**: Either adopt `text-display-lg/md/sm` in screen headers, or remove from `textures.css:38-78`

### m9. RTL Hebrew font only applied to headings
- **Source**: Typography #9
- **Fix**: Add `[dir='rtl'] { font-family: var(--font-hebrew); }` as base rule in `globals.css`

### m10. font-display used on non-heading elements
- **Source**: Typography #7
- **Fix**: Reserve `font-display` for h1-h3 and brand. Use `font-body` (Inter) for buttons, labels, nav text

### m11. Deal button disabled state unclear
- **Source**: Interactions #6
- **Fix**: Use `disabled:opacity-30 disabled:cursor-not-allowed` and consider `disabled:bg-gray-300` in `DealScreen.tsx:130`

### m12. Segment tabs lack active/inactive contrast
- **Source**: Interactions #7
- **Fix**: Add `border-b-2 border-partner-a` to active tab in `DealScreen.tsx:180`

### m13. Nav active pill too faint
- **Source**: Interactions #8, Color #16
- **Fix**: Increase `bg-partner-a/10` to `bg-partner-a/15` in `Navigation.tsx:27`

### m14. CardModal close button undersized (32x32)
- **Source**: Interactions #10
- **Fix**: Change `w-8 h-8` to `w-11 h-11` (44px) in `CardModal.tsx:200`

### m15. Settings toggles no hover/active state
- **Source**: Interactions #12
- **Fix**: Add `hover:bg-white/50 active:scale-[0.98]` to inactive segments in `MoreScreen.tsx:78-88`

### m16. "Head to Deal" link has no interactive styling
- **Source**: Interactions #14, Product #2
- **Fix**: Style as pill button: `px-4 py-2 bg-partner-a/10 rounded-xl` in `MyCardsScreen.tsx:82`

### m17. "+" button only 36x36
- **Source**: Interactions #15
- **Fix**: Change `w-9 h-9` to `w-11 h-11` in `DealScreen.tsx:143`

### m18. "Not in Play" label confusing
- **Source**: Product #6
- **Fix**: Rename to "Skipped" or "Not relevant to us" with subtitle "Cards you've decided not to divide right now"

### m19. App name inconsistent ("Fair Play Deck" vs "Fair Play")
- **Source**: Product #1
- **Fix**: Standardize to "Fair Play" in `index.html` title, `en.json` `common.appName`

### m20. Setup screen shows "Partner A/B" instead of names
- **Source**: Product #20
- **Fix**: Show partner names on buttons if configured, or "I'm the first to join" / "My partner already set this up"

### m21. Framer Motion ignores prefers-reduced-motion
- **Source**: Accessibility #A15
- **Fix**: Use `useReducedMotion()` from Framer Motion or set `MotionConfig reducedMotion="user"`. Wire into existing `useSettingsStore().animations` flag

### m22. Page title doesn't update per route
- **Source**: Accessibility #A16
- **Fix**: Use `useEffect` in each screen to update `document.title` (e.g., "My Cards — Fair Play")

### m23. No route-level code splitting
- **Source**: Accessibility/Perf #P2, P3
- **Fix**: Use TanStack Router's `lazyRouteComponent` for each route

### m24. Render-blocking font import
- **Source**: Accessibility/Perf #P4
- **Fix**: Move Google Fonts to `<link>` in `index.html` with `rel="preconnect"` and `rel="preload"` for critical font

---

## Cosmetic (nice to have)

### c1. Confirm dialog red clashes with warm palette
- **Source**: Color review #13
- **Fix**: Change destructive button from `bg-red-500` to `bg-[#c94a4a]` or use `bg-partner-a` in `ConfirmDialog.tsx`

### c2. CardRow expanded needs subtle divider
- **Source**: Layout #6
- **Fix**: Add `<div className="mx-4 border-t border-gray-100" />` before expandable content in `CardRow.tsx:151`

### c3. Expand/collapse content fade-in
- **Source**: Interactions #9
- **Fix**: Add opacity transition to `.expandable-inner` in `globals.css`

### c4. History expand has no animation
- **Source**: Interactions #13
- **Fix**: Use `expandable-grid` pattern from CardRow in `MoreScreen.tsx:123`

### c5. Sign out has no confirmation
- **Source**: Interactions #17
- **Fix**: Add ConfirmDialog before `signOut()` in `MoreScreen.tsx:189`

### c6. Auth screen subtitle visually faint
- **Source**: Color review #15
- **Fix**: Add `font-medium` to subtitle in `AuthScreen.tsx`

### c7. Google Fonts loads unused weights
- **Source**: Typography #8
- **Fix**: Trim to only used weights after consolidating font-weight usage

### c8. No intermediate fallback fonts
- **Source**: Typography #10
- **Fix**: Change font stacks to include `-apple-system, 'Segoe UI'` before `sans-serif`

### c9. History empty state uses jargon
- **Source**: Product #11
- **Fix**: Change "Deal or Reset to create entries" to "After you assign or redistribute cards, you'll see a timeline here"

### c10. ConfirmDialog button height below 44px
- **Source**: Interactions #11
- **Fix**: Ensure `py-3` minimum on dialog buttons in `ConfirmDialog.tsx`

---

## Dark Mode Assessment

**Verdict: Not shippable in current state.** Dark mode has 4 critical/major issues:

1. **Partner colors not overridden** — `--color-partner-a` and `--color-partner-b` retain their light-mode values, causing contrast failures on the `#1a1a2e` dark background (2.9:1 and 3.3:1 respectively)
2. **Deal Cards button invisible** — the primary action button disappears or becomes unreadable
3. **Concrete text borderline** — `#7a8090` on `#1a1a2e` = ~4.2:1, fails for small text
4. **Background blobs create muddy patches** — same opacity on dark bg produces dark spots instead of warm glows

**Minimum fix to ship dark mode** — add to `.dark` in `globals.css`:
```css
.dark {
  --color-partner-a: #e07a90;
  --color-partner-b: #5cb88a;
  --color-concrete: #9298a8;
}
```
Plus fix the Deal button styling to use the lightened partner-a with dark text.

**Alternative**: Hide the Dark theme option until these are fixed. Change `MoreScreen.tsx` to only show Light/Auto.

---

## Performance Summary

| Metric | Current | Target | Fix |
|--------|---------|--------|-----|
| Firebase chunk | 550 KB / 131 KB gz | < 200 KB | Lazy-load behind auth gate |
| Main chunk | 422 KB / 126 KB gz | < 200 KB | Route-level code splitting |
| Total initial JS | ~970 KB | < 400 KB | Combined lazy loading |
| Font loading | Render-blocking @import | Preloaded | Move to `<link>` in HTML |
| Framer Motion | ~40 KB gz in main bundle | < 15 KB | Use `LazyMotion` + `domAnimation` |
| Lighthouse a11y | Not in CI | > 90, enforced | Add to GitHub Actions |

---

## Individual Review Files

Full details for each perspective:
- [Color & Surface](review-color-surface.md) — 16 findings
- [Layout & Spacing](review-layout-spacing.md) — 16 findings
- [Typography & Content](review-typography.md) — 13 findings
- [Interaction Design](review-interactions.md) — 17 findings
- [Product & UX](review-product-ux.md) — 20 findings
- [Accessibility & Performance](review-accessibility.md) — 23 findings
