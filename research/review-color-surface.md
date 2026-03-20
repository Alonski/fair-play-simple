# Color & Surface Review

## Summary

The Fair Play Simple palette succeeds at feeling warm and domestic rather than clinical -- the rose/sage/gold triad evokes a family kitchen, and the soft gradient blobs in `Background.tsx` reinforce that warmth without being distracting. However, several text-on-background pairings fall below WCAG AA contrast minimums (particularly partner-a, accent, and concrete used as body text), the card shadows are too faint to create meaningful separation on mobile, and dark mode has significant contrast failures that make it borderline unusable for everyday reading.

## Findings

### 1. Partner-A text on paper fails WCAG AA for normal text
- **Severity**: Critical
- **Location**: `src/styles/globals.css:13` (`--color-partner-a: #b84d63`) used as text on `--color-paper: #fafaf8`
- **Current**: `#b84d63` on `#fafaf8` -- approximately 4.3:1 contrast ratio
- **Recommended**: Darken to `#a3394f` (~5.2:1) or `#9e3048` (~5.6:1)
- **Rationale**: Partner-a is used extensively as normal-weight body text: card count numbers on the Deal screen, "Head to Deal to assign cards" CTA on My Cards, error messages in CardModal, active nav label, and card assignment badges. At 4.3:1 it barely misses the 4.5:1 AA threshold for normal text (<18px bold / <24px regular). Every instance visible in the screenshots uses text at 12-14px, well below the large-text threshold.

### 2. Accent color fails WCAG AA for all text sizes
- **Severity**: Critical
- **Location**: `src/styles/globals.css:12` (`--color-accent: #a78bfa`) used as text and interactive links
- **Current**: `#a78bfa` on `#fafaf8` -- approximately 3.2:1 contrast ratio
- **Recommended**: Darken to `#7c5cd4` (~5.0:1) for text use, keep `#a78bfa` for non-text decorative elements (focus rings, selection highlight) where contrast requirements do not apply
- **Rationale**: The accent purple is used for "Translate" action links in the CardModal (`card-modal.png`). At 3.2:1 it fails AA for both normal and large text. The focus-visible ring and ::selection uses are exempt from text contrast rules, but any clickable text link must meet 4.5:1.

### 3. Partner-A on partner-a-light badge fails WCAG AA
- **Severity**: Major
- **Location**: `src/components/game/PartnerZone.tsx:141` and `src/components/cards/CardRow.tsx:35` -- `text-partner-a` on `bg-partner-a-light`
- **Current**: `#b84d63` on `#fae0e6` -- approximately 3.5:1
- **Recommended**: Either darken partner-a to `#9e3048` (fixes this and Finding #1 simultaneously) or darken `--color-partner-a-light` to `#f0c5cf` (~4.5:1)
- **Rationale**: The soft-tinted badges showing card counts (e.g., "3" on a pink background in the expanded card row) use this pairing at 10-12px bold text. Even at bold weight, text this small is classified as "normal" under WCAG.

### 4. Partner-B on partner-b-light badge fails WCAG AA
- **Severity**: Major
- **Location**: `src/components/game/PartnerZone.tsx:141` -- `text-partner-b` on `bg-partner-b-light`
- **Current**: `#3a7359` on `#dff0e8` -- approximately 3.8:1
- **Recommended**: Darken `--color-partner-b` to `#2d5f48` (~5.1:1 on paper, ~4.6:1 on partner-b-light) or darken `--color-partner-b-light` to `#c5e4d2`
- **Rationale**: Same pattern as Finding #3. The green partner badges are small bold text that needs 4.5:1.

### 5. Concrete used as primary body text is borderline
- **Severity**: Minor
- **Location**: `src/styles/globals.css:11` (`--color-concrete: #6b7280`) used pervasively as `text-concrete`
- **Current**: `#6b7280` on `#fafaf8` -- approximately 4.9:1 (passes AA but barely)
- **Recommended**: Keep `#6b7280` for secondary/helper text but avoid using it for text smaller than 12px. For the 10px uppercase labels (`text-[10px]` in MoreScreen.tsx:73, :97, :129), either increase font size to 11px or darken to `#5b6370` (~5.8:1)
- **Rationale**: At 10px, even bold uppercase text is extremely small. The 4.9:1 ratio technically passes AA but is uncomfortably close to the threshold for text this tiny. The labels "LANGUAGE", "THEME", "HISTORY" visible in the Settings screenshots are hard to read at this size/contrast combination.

### 6. Card shadows too faint for mobile separation
- **Severity**: Major
- **Location**: `src/styles/globals.css:24-26`
- **Current**: `--shadow-soft: 0 4px 12px rgba(0,0,0,0.06)`, `--shadow-soft-sm: 0 1px 3px rgba(0,0,0,0.04)`
- **Recommended**: `--shadow-soft: 0 4px 12px rgba(0,0,0,0.10)`, `--shadow-soft-sm: 0 1px 4px rgba(0,0,0,0.07)`, `--shadow-soft-lg: 0 8px 24px rgba(0,0,0,0.12)`
- **Rationale**: In the deal-375.png and deal-412.png screenshots, the card rows (Groceries, School Pickup, Car Maintenance) are nearly indistinguishable from each other -- the 0.06 opacity shadow is effectively invisible against the warm paper background, especially on mobile screens viewed in daylight. The cards rely entirely on their thin left border accent for visual separation. Increasing shadow opacity to 0.10 would create subtle but visible lift without looking harsh. The `shadow-soft-sm` at 0.04 is used on buttons and smaller elements where it is completely invisible.

### 7. Background gradient blobs: good concept, nearly invisible on mobile
- **Severity**: Cosmetic
- **Location**: `src/components/layout/Background.tsx:6-10`
- **Current**: Three blurred circles at opacity 0.09 (rose, sage) and 0.07 (gold), each 480px or 320px diameter with 80-100px blur
- **Recommended**: Increase to opacity 0.12 for rose and sage, 0.09 for gold. Consider adding a very subtle radial gradient to the paper base itself (e.g., `radial-gradient(ellipse at 50% 0%, #faf5f0 0%, #fafaf8 70%)`) for additional warmth even without the blobs
- **Rationale**: On the 375px and 412px screenshots, the blobs are barely perceptible -- you can see a faint pink wash in the top-right corner and a faint green in the bottom-left, but the effect is so subtle it could be mistaken for screen color variation. The 1440px desktop screenshots show the effect more clearly because the blobs occupy a larger relative viewport area. A small opacity bump would make the warmth more intentional without becoming distracting.

### 8. Paper grain overlay at z-index 9999 is a stacking risk
- **Severity**: Minor
- **Location**: `src/styles/globals.css:70-80` (`body::after` with `z-index: 9999`)
- **Current**: `z-index: 9999; opacity: 0.025;`
- **Recommended**: Reduce to `z-index: 50` or use `isolation: isolate` on the app root with the grain at `z-index: 1` above it. Keep `pointer-events: none`
- **Rationale**: While `pointer-events: none` prevents interaction issues, a z-index of 9999 can interfere with third-party overlays (analytics tools, error reporters, browser extensions) and makes debugging stacking contexts confusing. The grain is purely decorative at 2.5% opacity -- it adds a very subtle tactile quality to the paper background that is nice but would work just as well at a lower z-index. The grain is invisible in all screenshots, which is correct for its purpose (subconscious texture).

### 9. Dark mode: partner-b text on dark paper fails both AA thresholds
- **Severity**: Critical
- **Location**: `src/styles/globals.css:44` -- dark mode does NOT override `--color-partner-b` (stays `#3a7359`)
- **Current**: `#3a7359` on `#1a1a2e` -- approximately 2.9:1 (fails AA normal AND large)
- **Recommended**: Add dark mode override: `--color-partner-b: #5cb88a;` (~5.8:1 on `#1a1a2e`) or `#4da67a` (~4.7:1)
- **Rationale**: The `.dark` block overrides ink, paper, concrete, accent, and the light backgrounds, but does NOT override `--color-partner-a` or `--color-partner-b` themselves. In the `deal-412-dark.png` screenshot, partner-b text and indicators would be nearly invisible. This is confirmed by the dark mode deal screenshot where the progress bar segments are hard to distinguish.

### 10. Dark mode: partner-a text on dark paper is below AA normal
- **Severity**: Major
- **Location**: `src/styles/globals.css:42-54` -- dark mode does NOT override `--color-partner-a` (stays `#b84d63`)
- **Current**: `#b84d63` on `#1a1a2e` -- approximately 3.3:1 (fails AA normal, passes large)
- **Recommended**: Add dark mode override: `--color-partner-a: #e07a90;` (~5.4:1 on `#1a1a2e`) or `#d4687e` (~4.6:1)
- **Rationale**: Same issue as Finding #9. The partner-a rose is used for card counts, nav labels, CTA text, and card row left borders. All of these are normal-sized text that needs 4.5:1. The `mycards-412-dark.png` and `deal-412-dark.png` screenshots show the pink text is legible but strained.

### 11. Dark mode: concrete text is borderline
- **Severity**: Minor
- **Location**: `src/styles/globals.css:45` (`--color-concrete: #7a8090` in dark mode)
- **Current**: `#7a8090` on `#1a1a2e` -- approximately 4.2:1 (fails AA normal, passes large)
- **Recommended**: Lighten to `#8d93a3` (~5.1:1) or `#9298a8` (~5.5:1)
- **Rationale**: Concrete is the most-used secondary text color, appearing on every screen for labels, helper text, and metadata. In dark mode at 4.2:1, the 10px uppercase labels (LANGUAGE, THEME, HISTORY) and card metadata (category, time estimate) become hard to read, especially on OLED screens where the deep navy background can appear true black.

### 12. Dark mode: "Deal Cards" button disappears
- **Severity**: Major
- **Location**: `src/components/screens/DealScreen.tsx:145` -- `bg-partner-a text-white` button
- **Current**: Visible in `deal-412-dark.png` -- the "Deal Cards" button uses `bg-partner-a` which is `#b84d63` in both light and dark. White text on `#b84d63` is approximately 4.4:1 (borderline). But the button itself against dark paper (`#1a1a2e`) has low distinction
- **Recommended**: In dark mode, use the lightened partner-a (`#e07a90` per Finding #10) as the button background with dark text (`#1a1a2e`), or keep the current rose but add a subtle border (`border border-partner-a/30`)
- **Rationale**: In the dark mode deal screenshot, the "Deal Cards" button label is missing/invisible, suggesting the button styling breaks in dark mode. The button background blends partially into the dark surroundings without enough contrast to read as a primary action.

### 13. Confirm dialog uses pure red for destructive action
- **Severity**: Minor
- **Location**: `confirm-dialog.png` -- the "Reset" button appears to use a saturated red (~`#ef4444`)
- **Current**: High-saturation red that clashes with the warm rose palette
- **Recommended**: Use `#c94a4a` or `--color-partner-a` (`#b84d63`) for destructive actions to stay on-palette. If a distinct "danger" tone is needed, define `--color-danger: #c94a4a` that harmonizes with the warm rose
- **Rationale**: The confirm-dialog screenshot shows a bright cherry-red "Reset" button that visually clashes with the otherwise warm, muted palette. Partner-a rose already connotes "alert" in this app's color language; using it (or a slightly more saturated variant) for destructive actions would maintain palette cohesion.

### 14. Unassigned gold color is never used as text
- **Severity**: Cosmetic
- **Location**: `src/styles/globals.css:15` (`--color-unassigned: #f5d89a`)
- **Current**: `#f5d89a` -- extremely low contrast against paper (~1.4:1) or white (~1.5:1). Only used as backgrounds (`bg-unassigned-light`, `bg-unassigned`)
- **Recommended**: No change needed for current usage. If unassigned text labels are ever needed, define a darker companion: `--color-unassigned-text: #8a6d1b` (~5.1:1 on paper)
- **Rationale**: The gold is well-used as a warm background tint for unassigned card badges and the background blob. It correctly avoids text use. This is a forward-looking note to prevent future contrast issues.

### 15. Auth screen: subtitle text may be too light
- **Severity**: Minor
- **Location**: `auth-screen.png` -- "Divide your household fairly, together." subtitle
- **Current**: Appears to use `text-concrete` (`#6b7280`) at approximately 16px on the paper background. Contrast ~4.9:1 passes AA
- **Recommended**: Acceptable, but the visual impression in the screenshot is faint because the text is lightweight (font-weight 400) and surrounded by large whitespace. Consider bumping to `font-medium` (500) for better perceived readability without changing color
- **Rationale**: The auth screen is the first impression. The subtitle is technically accessible but visually feels washed out due to the combination of gray color, normal weight, and generous spacing. A slightly heavier weight would improve scannability.

### 16. Navigation bar active state relies solely on color
- **Severity**: Minor
- **Location**: `src/components/layout/Navigation.tsx:35` -- active tab uses `text-partner-a`, inactive uses `text-concrete`
- **Current**: Active tab is rose, inactive is gray. The screenshots show a subtle pink pill background on the active tab
- **Recommended**: Good that there is a background pill indicator in addition to color change. Ensure the pill background has sufficient contrast differentiation (currently looks like `bg-partner-a/10` which is very faint). Consider `bg-partner-a/15` for the active pill
- **Rationale**: WCAG 1.4.1 requires that color is not the sole means of conveying information. The pill background helps, but at 10% opacity it is barely visible in the screenshots, especially on the 1440px desktop view.

## Palette Cohesion Assessment

The core palette works well for the "warm, family-friendly" design goal:

- **Rose (#b84d63) + Sage (#3a7359)**: These are natural complements that evoke garden/home aesthetics. They read as "partner A" and "partner B" without being gendered (not pink/blue).
- **Gold (#f5d89a)**: The unassigned warm gold bridges the rose and sage nicely and adds a sunny optimism.
- **Ink (#2d3142)**: The blue-tinted dark gray is softer than pure black, contributing to warmth.
- **Paper (#fafaf8)**: The warm white with a slight yellow cast is excellent -- noticeably warmer than `#ffffff` without looking yellowed.

The weakest link is **accent (#a78bfa)** -- the cool purple feels disconnected from the warm rose/sage/gold family. It is only used for focus rings, selection highlight, and translate links, so its visual impact is limited. Consider shifting it warmer: `#b08ad4` (a mauve-purple) would harmonize better while remaining distinct from partner-a rose.

## Dark Mode Assessment

Dark mode needs significant work before it is production-ready:

1. **Missing color overrides**: `--color-partner-a` and `--color-partner-b` are not overridden in the `.dark` block, causing both to fail contrast requirements on the dark paper background.
2. **UI elements breaking**: The Deal screen dark mode screenshot shows the "Deal Cards" button text is missing/invisible, suggesting component-level dark mode styles are incomplete.
3. **Background blobs**: The `Background.tsx` blobs use the same opacity (0.09) in dark mode, but on a `#1a1a2e` background they create muddy dark patches rather than warm glows. Consider increasing blob opacity to 0.15-0.20 in dark mode and using the lightened color variants.
4. **Settings screen**: The `more-412-dark.png` shows the Settings panels with white/light backgrounds that look correct, suggesting some components have proper dark mode handling while others do not.

### Recommended dark mode additions for `globals.css`:

```css
.dark {
  /* Add these missing overrides */
  --color-partner-a: #e07a90;
  --color-partner-b: #5cb88a;
  --color-concrete: #9298a8;
  --color-unassigned: #f5d89a; /* keep same, used as bg only */
}
```
