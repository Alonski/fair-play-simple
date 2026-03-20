# Accessibility & Performance Review

## Summary

The Fair Play Simple app has a solid visual design and good use of semantic `<main>` and `<nav>` elements, but it has significant accessibility gaps: no ARIA attributes on interactive widgets (segment controls, expandable rows, modal dialogs), no `<label>` associations on form inputs, missing skip-navigation, and insufficient contrast in several areas. Performance-wise, the Firebase chunk exceeds 550 KB (minified) and all routes are eagerly loaded, creating an unnecessarily large initial payload.

---

## Accessibility Findings

### A1. Segment controls lack ARIA tablist/tab semantics
- **Severity**: Critical
- **WCAG**: 4.1.2 Name, Role, Value
- **Location**: `DealScreen.tsx` segment control (lines 180-199), `MoreScreen.tsx` language/theme toggles
- **Current**: Segment buttons are plain `<button>` elements with no `role="tablist"`, `role="tab"`, `aria-selected`, or `aria-controls` attributes. Screen readers announce them as generic buttons with no indication of which is selected or that they form a group.
- **Fix**: Wrap each set of segment buttons in a `<div role="tablist">`. Each button should have `role="tab"`, `aria-selected={isActive}`, and `aria-controls` pointing to the corresponding panel. The card list panel should have `role="tabpanel"`.

### A2. CardRow expand/collapse has no ARIA expanded state
- **Severity**: Critical
- **WCAG**: 4.1.2 Name, Role, Value
- **Location**: `CardRow.tsx` line 108-146
- **Current**: The row header `<button>` toggles expanded content but has no `aria-expanded` attribute. Screen readers cannot determine whether the content is expanded or collapsed.
- **Fix**: Add `aria-expanded={expanded}` to the `<button>`. Optionally add `aria-controls` pointing to the expandable content `id`.

### A3. CardModal and ConfirmDialog missing dialog role and focus trap
- **Severity**: Critical
- **WCAG**: 4.1.2 Name, Role, Value; 2.4.3 Focus Order
- **Location**: `CardModal.tsx` (line 189), `ConfirmDialog.tsx` (line 40)
- **Current**: Both modals use `<motion.div>` without `role="dialog"`, `aria-modal="true"`, or `aria-labelledby`. There is no focus trap -- Tab can escape to background content. The backdrop `onClick` closes the modal, but Escape key is not handled in ConfirmDialog.
- **Fix**: Add `role="dialog"`, `aria-modal="true"`, and `aria-labelledby` (pointing to the heading). Implement a focus trap (e.g., `focus-trap-react` or manual). Add `onKeyDown` handler for Escape to close.

### A4. Form labels not programmatically associated with inputs
- **Severity**: Critical
- **WCAG**: 1.3.1 Info and Relationships; 4.1.2 Name, Role, Value
- **Location**: `CardModal.tsx` all `<label>` and `<input>`/`<select>`/`<textarea>` pairs
- **Current**: Every `<label>` in CardModal is a visual label only -- none use `htmlFor` and none of the inputs have `id` attributes. Screen readers cannot associate labels with their fields.
- **Fix**: Add unique `id` to each input and matching `htmlFor` on each label. Alternatively, nest the input inside the `<label>`.

### A5. DealScreen select and action buttons lack accessible names
- **Severity**: Major
- **WCAG**: 4.1.2 Name, Role, Value
- **Location**: `DealScreen.tsx` -- "+" add card button (line 143-148), "Deal Cards" button, "Reset" button
- **Current**: The "+" button has no `aria-label`. Its text content is just "+", which a screen reader announces as "plus". The deal mode `<select>` has no associated label.
- **Fix**: Add `aria-label="Add new card"` to the "+" button. Add a visually-hidden `<label>` or `aria-label` to the deal mode select.

### A6. Navigation bar links lack aria-current
- **Severity**: Major
- **WCAG**: 4.1.2 Name, Role, Value
- **Location**: `Navigation.tsx` lines 21-41
- **Current**: Active nav tab is indicated only by color change and a background highlight span. There is no `aria-current="page"` attribute on the active link.
- **Fix**: Add `aria-current={isActive ? 'page' : undefined}` to each `<Link>`.

### A7. No skip-navigation link
- **Severity**: Major
- **WCAG**: 2.4.1 Bypass Blocks
- **Location**: `App.tsx` -- top of the page layout
- **Current**: The bottom navigation bar is rendered in the DOM before `<main>` content (via fixed positioning). Keyboard users must Tab through all nav links on every page before reaching content. There is no "Skip to main content" link.
- **Fix**: Add a visually-hidden skip link as the first focusable element: `<a href="#main-content" className="sr-only focus:not-sr-only ...">Skip to content</a>`. Add `id="main-content"` to `<main>`.

### A8. Color-only indicators for card assignment and balance bar
- **Severity**: Major
- **WCAG**: 1.4.1 Use of Color
- **Location**: `DealScreen.tsx` balance bar (lines 154-157), `CardRow.tsx` left border color
- **Current**: The balance bar uses only partner-a (rose), partner-b (green), and unassigned (gold) colors to differentiate segments. The card rows use only a colored left border to indicate assignment. Users with color vision deficiencies cannot distinguish these.
- **Fix**: Add patterns, icons, or text labels alongside color. The balance bar legend (lines 159-175) partially mitigates this, but the bar segments themselves need additional differentiation (e.g., texture or pattern fills).

### A9. Low contrast text in several locations
- **Severity**: Major
- **WCAG**: 1.4.3 Contrast (Minimum)
- **Location**: Multiple components
- **Current**:
  - `text-concrete` (#6b7280) on `bg-paper` (#fafaf8) = approx 4.3:1 -- borderline for normal text, fails for the `text-[10px]` and `text-[11px]` small text used extensively (small text needs 4.5:1 minimum).
  - `text-concrete/70` (the chevron indicators in CardRow, MoreScreen) -- approximately 3:1, fails AA for any text size.
  - `text-ink/50` used on AuthScreen subtitle -- #2d3142 at 50% opacity on light background yields approx 3.5:1, fails AA.
  - `text-ink/65` used for card descriptions in CardRow -- approx 4.0:1, fails for small text.
  - `text-concrete/40` separator dots -- purely decorative, acceptable if truly decorative.
  - Dark mode: `text-concrete` (#7a8090) on `bg-paper` (#1a1a2e) = approx 3.7:1 -- fails AA.
- **Fix**: Increase opacity/darken text colors. `text-concrete` should be at least #525860 for small text. In dark mode, lighten `--color-concrete` to at least #9aa0b0.

### A10. Balance bar segments have no accessible text
- **Severity**: Major
- **WCAG**: 1.1.1 Non-text Content
- **Location**: `DealScreen.tsx` lines 154-157
- **Current**: The colored bar segments are empty `<div>` elements with no text alternative. Screen readers skip them entirely.
- **Fix**: Add `role="img"` and `aria-label` to the bar container describing the distribution, e.g., `aria-label="Card distribution: 3 Alon, 1 Moral, 0 Unassigned"`.

### A11. Decorative emoji card icon not hidden from screen readers
- **Severity**: Minor
- **WCAG**: 1.1.1 Non-text Content
- **Location**: `Navigation.tsx` tab icons (line 32), `MyCardsScreen.tsx` empty state (line 74), `AuthScreen.tsx` (line 55)
- **Current**: Emoji are rendered as `<span>` with no `aria-hidden="true"`. Screen readers may announce "playing card black joker" or similar, creating noise.
- **Fix**: Add `aria-hidden="true"` to decorative emoji spans, or use `role="img"` with a meaningful `aria-label` if they convey meaning.

### A12. Focus styles rely solely on outline color
- **Severity**: Minor
- **WCAG**: 2.4.7 Focus Visible
- **Location**: `globals.css` lines 97-100
- **Current**: `:focus-visible` uses a 2px solid accent (#a78bfa) outline. This is good, but on the light background the purple outline may be insufficient contrast for some users. The offset of 2px is appropriate.
- **Fix**: Consider adding a secondary indicator (e.g., a subtle box-shadow or thicker outline) to ensure the focus ring is visible against all backgrounds. Test on both light and dark themes.

### A13. History section expand/collapse missing aria-expanded
- **Severity**: Minor
- **WCAG**: 4.1.2 Name, Role, Value
- **Location**: `MoreScreen.tsx` line 125-143
- **Current**: The History toggle button has no `aria-expanded` attribute.
- **Fix**: Add `aria-expanded={historyExpanded}` to the button.

### A14. "Not in Play" section expand/collapse missing aria-expanded
- **Severity**: Minor
- **WCAG**: 4.1.2 Name, Role, Value
- **Location**: `DealScreen.tsx` lines 239-245
- **Current**: The "Not in Play" toggle button has no `aria-expanded` attribute.
- **Fix**: Add `aria-expanded={notInPlayExpanded}`.

### A15. Framer Motion animations not respecting prefers-reduced-motion fully
- **Severity**: Minor
- **WCAG**: 2.3.3 Animation from Interactions
- **Location**: `CardModal.tsx`, `ConfirmDialog.tsx`, `AuthScreen.tsx`, `CardStack.tsx`
- **Current**: The `globals.css` has a `prefers-reduced-motion: reduce` rule that sets `animation-duration` and `transition-duration` to 0.01ms. However, Framer Motion animations (scale, y-offset, opacity entrance effects) use the JS animation engine and are **not** affected by this CSS rule.
- **Fix**: Use `useReducedMotion()` from Framer Motion to conditionally disable `initial`/`animate`/`exit` props, or set `transition: { duration: 0 }` when reduced motion is preferred. The app already has a `useSettingsStore().animations` flag -- wire it into Framer Motion's `MotionConfig` provider with `reducedMotion="user"`.

### A16. Page title does not update per route
- **Severity**: Minor
- **WCAG**: 2.4.2 Page Titled
- **Location**: `index.html` -- static `<title>Fair Play Deck</title>`
- **Current**: The document title never changes when navigating between My Cards, Deal, and More screens. Screen reader users have no auditory indication that navigation occurred.
- **Fix**: Use TanStack Router's `meta` or a `useEffect` in each screen to update `document.title` (e.g., "My Cards -- Fair Play Deck", "Deal -- Fair Play Deck").

---

## Performance Findings

### P1. Firebase chunk is 550 KB (minified)
- **Metric**: Initial JS bundle size
- **Current**: `firebase-BIc3wfEI.js` -- 550.21 KB minified / 131.19 KB gzipped
- **Recommended**: < 200 KB minified per chunk
- **Fix**: Lazy-load Firebase behind the auth gate. Use `import('firebase/auth')` and `import('firebase/firestore')` dynamically only after the user initiates sign-in. Since the app has a local-only mode, non-Firebase users should never download this chunk.

### P2. Main index chunk is 422 KB (minified)
- **Metric**: Initial JS bundle size
- **Current**: `index-k3rHXDEW.js` -- 422.51 KB minified / 126.26 KB gzipped
- **Recommended**: < 200 KB minified for main chunk
- **Fix**: Code-split routes using `React.lazy()` and `Suspense`. The Deal screen, More screen, and CardModal are independent features that can be lazy-loaded. This would reduce the initial load to just the active route.

### P3. No route-level code splitting
- **Metric**: Time to Interactive
- **Current**: All screens (MyCards, Deal, More, Auth, Setup, Error, GameBoard, Dashboard) are eagerly imported and bundled into one chunk.
- **Recommended**: Each route should be a separate chunk loaded on demand.
- **Fix**: Use TanStack Router's lazy route loading: `Route({ component: lazy(() => import('./screens/DealScreen')) })`. This is straightforward with TanStack Router's `lazyRouteComponent`.

### P4. Three Google Fonts loaded via render-blocking CSS @import
- **Metric**: Largest Contentful Paint (LCP)
- **Current**: `globals.css` line 4 loads Plus Jakarta Sans (4 weights), Inter (4 weights), and Noto Sans Hebrew (3 weights) via a single `@import url(...)` from Google Fonts. This is render-blocking.
- **Recommended**: Preload critical fonts, defer non-critical ones.
- **Fix**: Move the Google Fonts `<link>` to `index.html` `<head>` with `rel="preconnect"` for `fonts.googleapis.com` and `fonts.gstatic.com`, then use `<link rel="preload">` for the most critical font (Plus Jakarta Sans). Alternatively, self-host the fonts and use `font-display: swap` (Google Fonts does this by default with `display=swap`).

### P5. Framer Motion included in main bundle (~30-50 KB gzipped)
- **Metric**: Bundle size
- **Current**: Framer Motion is imported in 8 components. It contributes roughly 30-50 KB gzipped to the vendor/index chunk. Used primarily for simple fade/scale entrance animations and whileHover/whileTap micro-interactions.
- **Recommended**: Use CSS animations or the smaller `motion` package (`framer-motion/m`) for simple transitions.
- **Fix**: For the entrance animations (fade-in, slide-up), CSS `@starting-style` or CSS transitions triggered by state changes would be sufficient and zero-JS-cost. If Framer Motion is retained, use the `LazyMotion` + `domAnimation` feature bundle to reduce size by ~60%.

### P6. No image optimization needed (good)
- **Metric**: LCP / FCP
- **Current**: The app uses emoji for icons and has no raster images. The Google icon SVG in AuthScreen is inline (good) and the decorative background blobs in `Background.tsx` use CSS (good). The noise texture in `globals.css` body::after uses an inline SVG data URI (good -- no network request).
- **Recommended**: N/A -- this is already well-handled.
- **Fix**: None needed. The emoji-based icon strategy avoids icon library bloat. No Hero Icons dependency exists.

### P7. Lighthouse audit script exists but is not in CI
- **Metric**: Regression prevention
- **Current**: `scripts/lighthouse-audit.js` exists and can be run via `make lighthouse`. It audits accessibility only on mobile viewport. It is not integrated into CI/CD.
- **Recommended**: Run Lighthouse in CI on every PR.
- **Fix**: Add a GitHub Actions step that runs `make lighthouse` and fails the build if the accessibility score drops below 90. Consider also auditing performance, best practices, and SEO categories.

---

## Priority Summary

| Priority | Finding | Impact |
|----------|---------|--------|
| P0 | A1: Segment controls lack tablist semantics | Screen reader users cannot navigate tabs |
| P0 | A3: Modal missing role/focus trap | Keyboard/SR users cannot use modals properly |
| P0 | A4: Labels not associated with inputs | Form is unusable for screen reader users |
| P1 | A2: CardRow missing aria-expanded | SR users cannot determine expand state |
| P1 | A5: Buttons/select missing accessible names | "+" button meaningless to SR users |
| P1 | A6: Nav missing aria-current | Active page not announced |
| P1 | A7: No skip-navigation link | Keyboard users must tab through nav every time |
| P1 | A8: Color-only assignment indicators | CVD users cannot distinguish partners |
| P1 | A9: Low contrast small text | Fails WCAG AA for body/meta text |
| P1 | A10: Balance bar inaccessible | Distribution invisible to SR users |
| P1 | P1: Firebase 550 KB chunk | Slow initial load, especially mobile |
| P2 | P2-P3: No code splitting | 970+ KB JS on first load |
| P2 | P4: Render-blocking font import | Delays FCP/LCP |
| P2 | A15: Framer Motion ignores reduced motion | Motion-sensitive users still see animations |
| P3 | A11, A12, A13, A14, A16 | Minor polish issues |
| P3 | P5: Framer Motion bundle weight | ~40 KB gzipped for simple animations |
