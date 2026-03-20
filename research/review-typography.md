# Typography & Content Review

## Summary

The app uses Plus Jakarta Sans (display) and Inter (body) loaded via a single Google Fonts import, with Noto Sans Hebrew for RTL. The type system is functional but has several issues: an overly fragmented size scale with too many bespoke pixel values (`text-[10px]`, `text-[11px]`, `text-[15px]`), pervasive use of `font-bold` that flattens hierarchy, and category labels at 10px that sit below comfortable legibility on small screens. The responsive typography classes defined in `textures.css` (`text-display-lg/md/sm`) are never actually used in any component, representing dead code.

## Findings

### 1. Unused responsive typography scale in textures.css
- **Severity**: Major
- **Location**: `src/styles/textures.css:38-78`
- **Current**: Three responsive `text-display-*` classes defined with media-query breakpoints (sm/md/lg)
- **Recommended**: Either adopt these classes in screen headers (replacing the hardcoded `text-3xl` everywhere) or remove them to reduce dead CSS
- **Rationale**: The display scale was designed to give headers breathing room on larger viewports, but every screen header uses `text-3xl` (1.875rem) at all breakpoints instead. On the 1440px screenshots the "Alon", "Fair Play", and "Settings" headings look undersized relative to the vast empty space. Using `text-display-lg` on these headings would scale them from 1.875rem on mobile to 2.5rem on desktop.

### 2. font-bold applied to nearly every text element
- **Severity**: Major
- **Location**: App-wide -- every component
- **Current**: `font-bold` on page titles, section labels, card titles, category labels, action buttons, segment controls, nav labels, badges, translate buttons, sign-out button, balance bar names, modal headers, form labels, form buttons
- **Recommended**: Reserve `font-bold` (700) for page titles and primary CTAs. Use `font-semibold` (600) for card titles and form labels. Use `font-medium` (500) for segment controls, nav labels, and secondary buttons. Use `font-normal` (400) for body text and captions (already the case for descriptions).
- **Rationale**: When everything is bold, nothing stands out. The visual hierarchy on the Deal screen is especially flat: the page title "Fair Play", the card titles "Groceries"/"School Pickup", the segment tabs "Alon (3)", the action buttons "Deal"/"Reset", and the category labels "HOME"/"CAREGIVING" are all `font-bold`. The reader's eye has no clear entry point.

### 3. Fragmented type scale with bespoke pixel sizes
- **Severity**: Major
- **Location**: Multiple components
- **Current sizes in use (mapped)**:
  - `style={{ fontSize: '2.75rem' }}` -- AuthScreen h1 (inline style, ~44px)
  - `text-3xl` (1.875rem / 30px) -- screen titles (MyCards, Deal, More)
  - `text-xl` (1.25rem / 20px) -- CardModal header
  - `text-lg` (1.125rem / 18px) -- empty state "No cards yet", ConfirmDialog title
  - `text-[15px]` -- card row title, auth sign-in button
  - `text-base` (1rem / 16px) -- auth subtitle
  - `text-sm` (0.875rem / 14px) -- card description, form labels, buttons, sign-out, segment selects
  - `text-xs` (0.75rem / 12px) -- screen kickers ("MY CARDS", "DEAL"), balance bar stats, badge counts, form labels (metadata grid), history event titles, sync bar
  - `text-[11px]` -- card row action buttons (Assign, Edit, Restore, Remove, Unassign), time estimate in card row
  - `text-[10px]` -- category label in card row, section labels ("LANGUAGE", "THEME", "HISTORY"), nav tab labels, translate buttons, history timestamps, history restore button, MSC Notes label, dot separators
- **Recommended**: Consolidate to Tailwind's standard scale. Map `text-[10px]` to `text-xs` (12px), `text-[11px]` to `text-xs` (12px), and `text-[15px]` to `text-base` (16px) or `text-sm` (14px). This reduces the scale from 10 distinct sizes to 7.
- **Rationale**: The 10px/11px/12px cluster creates three nearly-indistinguishable sizes that serve the same semantic role (small labels and secondary actions). The 1px differences are invisible to users but add cognitive load for developers maintaining the codebase.

### 4. Category labels and nav labels at 10px are below legibility threshold
- **Severity**: Major
- **Location**: `CardRow.tsx:121` (category), `Navigation.tsx:34` (nav labels), `MoreScreen.tsx:73,97,129` (section labels)
- **Current**: `text-[10px] font-bold uppercase tracking-wider text-concrete` (category); `text-[10px] font-display font-bold tracking-wide` (nav)
- **Recommended**: `text-xs` (12px) for all. Drop `uppercase tracking-wider` on category labels or keep uppercase but at 12px. For nav labels, 12px with `font-medium` instead of `font-bold`.
- **Rationale**: 10px text is below the WCAG minimum recommended size (12px for body, ideally 16px for body). The `uppercase` + `tracking-wider` treatment on category labels helps compensate slightly, but on the 375px screenshots "CAREGIVING" is hard to read. The nav labels "My Cards" / "Deal" / "More" at 10px are the app's primary navigation and should not be the smallest text on screen.

### 5. Card row action buttons at 11px are too small for touch targets
- **Severity**: Major
- **Location**: `CardRow.tsx:201-243` (Restore, Assign, Unassign, Remove, Edit buttons)
- **Current**: `text-[11px] px-3 py-1.5 font-display font-bold`
- **Recommended**: `text-xs px-3 py-2 font-display font-semibold`. The extra 1px in font size and 2px in vertical padding improve both legibility and touch target size (bringing closer to the 44px minimum recommended by Apple HIG).
- **Rationale**: These are the primary interaction points for the card deal flow. At 11px with only `py-1.5` (6px top+bottom), the rendered button height is roughly 28-30px -- well below the 44px iOS guideline. Users will misfire taps on mobile.

### 6. AuthScreen title uses inline style instead of Tailwind
- **Severity**: Minor
- **Location**: `AuthScreen.tsx:58-60`
- **Current**: `className="font-display font-bold text-ink leading-none mb-3"` with `style={{ fontSize: '2.75rem', letterSpacing: '-0.02em' }}`
- **Recommended**: `className="font-display font-bold text-ink leading-none mb-3 text-[2.75rem] -tracking-wide"` or better, use `text-4xl` (2.25rem) to stay within the Tailwind scale, or adopt the `text-display-lg` class from textures.css
- **Rationale**: Inline styles bypass Tailwind's utility system, make responsive overrides impossible (no `md:text-5xl`), and won't appear in Tailwind's class analysis tooling. The auth title is the only element using inline font-size.

### 7. font-display used on non-heading elements
- **Severity**: Minor
- **Location**: `CardRow.tsx:117` (card title), `CardRow.tsx:201-243` (action buttons), `DealScreen.tsx:123` (select), `DealScreen.tsx:132,139` (action buttons), `MoreScreen.tsx:81,109` (segment buttons), `Navigation.tsx:34` (nav labels), `ConfirmDialog.tsx:51,57` (dialog buttons), `SyncStatusBar.tsx:30` (status text)
- **Current**: `font-display` (Plus Jakarta Sans) on buttons, labels, selects, and small UI text
- **Recommended**: Use `font-display` only for headings (h1-h3) and the app brand name. Use `font-body` (Inter) for buttons, form controls, labels, nav text, and all running text.
- **Rationale**: Plus Jakarta Sans is a display face optimized for large sizes. At 10-14px in buttons and labels, Inter (the body face) would render more crisply due to its superior hinting at small sizes. Currently `font-display` is applied to ~80% of text in the app, undermining the display/body font pairing.

### 8. Google Fonts import loads unused weights
- **Severity**: Minor
- **Location**: `src/styles/globals.css:4`
- **Current**: `Plus+Jakarta+Sans:wght@400;500;600;700` and `Inter:wght@400;500;600;700`
- **Recommended**: Audit actual usage. If `font-bold` (700) is consolidated per finding #2 above, the weight set becomes: Plus Jakarta Sans 700 only (headings); Inter 400, 500 (body, labels). This cuts 4-5 font files from the download.
- **Rationale**: Each weight is a separate HTTP request (or woff2 file). The app currently loads 4 weights x 3 families = 12 weight/family combinations. Trimming unused weights improves first contentful paint.

### 9. RTL/Hebrew: only headings get font-family override
- **Severity**: Minor
- **Location**: `src/styles/globals.css:88-95`
- **Current**: `[dir='rtl'] h1, h2, h3, h4, h5, h6 { font-family: var(--font-hebrew); }`
- **Recommended**: Also apply `font-family: var(--font-hebrew)` to body text, buttons, and labels when `dir='rtl'` is active. Add: `[dir='rtl'] { font-family: var(--font-hebrew); }` as a base rule.
- **Rationale**: In RTL mode, Hebrew text in card descriptions, button labels, and form inputs will render in Inter (a Latin-optimized face) rather than Noto Sans Hebrew. Inter does include some Hebrew glyphs as a system fallback, but Noto Sans Hebrew has proper OpenType features for Hebrew (nikud positioning, correct glyph joining). The "Settings" screenshot shows Hebrew segment text ("...") that would benefit from the Hebrew-specific font.

### 10. No font-display fallback stack for slow connections
- **Severity**: Minor
- **Location**: `src/styles/globals.css:20-22`
- **Current**: `--font-display: 'Plus Jakarta Sans', sans-serif;` / `--font-body: 'Inter', sans-serif;`
- **Recommended**: Add intermediate system font fallbacks: `--font-display: 'Plus Jakarta Sans', -apple-system, 'Segoe UI', sans-serif;` and `--font-body: 'Inter', -apple-system, 'Segoe UI', sans-serif;`
- **Rationale**: The Google Fonts import uses `display=swap`, which means text renders immediately in the fallback font, then swaps to the web font. With only `sans-serif` as fallback, the browser picks its default sans-serif (often Helvetica on macOS, Arial on Windows). Adding `-apple-system` and `Segoe UI` produces a closer visual match to the web fonts, reducing the FOUT (flash of unstyled text) layout shift.

### 11. Card modal form labels mix text-sm and text-xs inconsistently
- **Severity**: Cosmetic
- **Location**: `CardModal.tsx:213,236,261,281,306,326,349` (main labels) vs. `CardModal.tsx:369,392,415` (metadata grid labels)
- **Current**: Main form labels use `text-sm` (14px); metadata grid labels (Frequency, Difficulty, Time) use `text-xs` (12px). Both use `font-display font-semibold`.
- **Recommended**: Use `text-sm` consistently for all form labels
- **Rationale**: The size change between label groups is not intentional design differentiation -- it's an artifact of the grid being cramped. Using consistent label sizing improves scannability.

### 12. Translate button text at 10px with accent color has low contrast
- **Severity**: Cosmetic
- **Location**: `CardModal.tsx:33`
- **Current**: `text-[10px] px-2.5 py-1 bg-accent/10 text-accent font-display font-bold`
- **Recommended**: `text-xs px-2.5 py-1 bg-accent/15 text-accent font-display font-medium`. Increase background opacity slightly and bump to 12px.
- **Rationale**: The accent purple (`#a78bfa`) on a 10% tinted background at 10px is difficult to read. The `font-bold` at 10px also renders poorly -- letter shapes blur together on non-retina screens.

### 13. Screen kicker labels ("MY CARDS", "DEAL", "MORE") have good pattern but inconsistent spacing
- **Severity**: Cosmetic
- **Location**: `MyCardsScreen.tsx:44`, `DealScreen.tsx:111`, `MoreScreen.tsx:61`
- **Current**: All three use `text-xs font-display font-bold uppercase tracking-widest text-concrete mb-1` -- consistent.
- **Recommended**: No change needed to the kicker itself, but note the padding differs: MyCards uses `px-5 pt-10 pb-6`, Deal uses `px-5 pt-10 pb-4`, More uses `px-5 pt-10 pb-6`. Standardize to `px-5 pt-10 pb-5` across all three for visual rhythm.
- **Rationale**: The kicker-to-title-to-content spacing should be identical across tabs so the eye learns a consistent header pattern. Currently Deal's header is tighter by 8px.

## Type Scale Recommendation

Consolidate to this minimal scale:

| Role | Current | Recommended | Tailwind class |
|------|---------|-------------|----------------|
| Page title (mobile) | `text-3xl` (30px) | Keep | `text-3xl` |
| Page title (desktop) | `text-3xl` (30px) | Increase | `md:text-4xl` or `text-display-lg` |
| Auth hero title | inline 2.75rem | Bring into system | `text-4xl md:text-5xl` |
| Section heading | `text-xl` (20px) | Keep | `text-xl` |
| Card title | `text-[15px]` | Standardize | `text-base` (16px) |
| Body / description | `text-sm` (14px) | Keep | `text-sm` |
| Small label / caption | `text-[10px]`, `text-[11px]`, `text-xs` | Merge to one | `text-xs` (12px) |
| Nav label | `text-[10px]` | Increase | `text-xs` (12px) |

This gives a clean 5-step scale: 30 - 20 - 16 - 14 - 12, with each step being a clear perceptual jump.

## Weight Recommendation

| Role | Current | Recommended |
|------|---------|-------------|
| Page title | `font-bold` (700) | `font-bold` (700) -- keep |
| Card title | `font-bold` (700) | `font-semibold` (600) |
| Form label | `font-semibold` (600) | `font-semibold` (600) -- keep |
| Button (primary) | `font-bold` (700) | `font-bold` (700) -- keep |
| Button (secondary) | `font-bold` (700) | `font-medium` (500) |
| Nav label | `font-bold` (700) | `font-medium` (500) |
| Section label (uppercase) | `font-bold` (700) | `font-semibold` (600) |
| Caption / meta | `font-bold` (700) or `font-medium` (500) | `font-medium` (500) |
| Body text | `font-normal` (400) | `font-normal` (400) -- keep |
