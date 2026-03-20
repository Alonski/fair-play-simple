# Layout & Spacing Review

## Summary

The app has a clean, warm visual identity and reads well on mobile. However, horizontal padding is inconsistent across screens (`px-5` in headers vs `px-4` in card lists), the desktop experience lacks a max-width constraint on page content so everything stretches edge-to-edge at 1440px, and the bottom navigation safe-area padding relies on a custom class that may not integrate with Tailwind's utility system. Several spacing details in CardRow, the Deal header, and the More screen panels would benefit from tightening for better visual rhythm.

## Findings

### 1. Inconsistent horizontal padding between headers and card lists
- **Severity**: Major
- **Location**: `src/components/screens/DealScreen.tsx:110` (header `px-5`), `src/components/screens/DealScreen.tsx:203` (card list `px-4`), `src/components/screens/MyCardsScreen.tsx:31` (header `px-5`), `src/components/screens/MyCardsScreen.tsx:71` (card list `px-4`), `src/components/screens/MoreScreen.tsx:60` (header `px-5`), `src/components/screens/MoreScreen.tsx:69` (list `px-4`)
- **Current**: Headers use `px-5` (20px), card/content areas use `px-4` (16px)
- **Recommended**: Standardize on `px-5` everywhere, or use `px-4 sm:px-5` for all content regions. The header and list should share the same horizontal inset so the left edge of card rows aligns with the "DEAL" / "MY CARDS" label above.
- **Rationale**: The 4px shift between header and content creates a subtle but noticeable misalignment when scrolling. On the 375px screenshots the card list appears indented relative to the header text.

### 2. No max-width constraint on screen content at desktop
- **Severity**: Major
- **Location**: `src/App.tsx:114-117` (main wrapper), all three screen components
- **Current**: `<main className="flex-1 overflow-y-auto pb-16">` with no `max-w-*` or centering. Individual screens have no max-width either — DealScreen, MyCardsScreen, and MoreScreen all use `flex flex-col h-full` with no width cap.
- **Recommended**: Add a container wrapper inside `<main>`: `<main className="flex-1 overflow-y-auto pb-16"><div className="max-w-2xl mx-auto w-full h-full">`. Alternatively, each screen can add `max-w-2xl mx-auto` to its outermost div. The nav already caps at `max-w-lg`.
- **Rationale**: At 1440px, the Deal screen card rows stretch the full viewport width, the progress bar is ~700px wide, and the segment control tabs become enormous. The More screen language/theme toggles span the entire width. Content should stay in a comfortable reading column (~672px / `max-w-2xl`).

### 3. Bottom padding insufficient — cards can hide behind nav
- **Severity**: Major
- **Location**: `src/App.tsx:115` (`pb-16`), `src/components/layout/Navigation.tsx:14` (nav `h-16` plus `pb-safe`)
- **Current**: Main content has `pb-16` (64px). Nav bar is `h-16` (64px) plus `pb-safe` (safe area inset). On devices with a home indicator (e.g. iPhone 14), the nav is ~84px tall. Each screen's inner scrollable area also adds only `pb-4`.
- **Recommended**: Change `pb-16` on `<main>` to `pb-20` (80px) to give breathing room below the last card row. Or better: `pb-[calc(4rem+env(safe-area-inset-bottom,0px)+1rem)]` via a custom utility so it adapts to the actual safe area.
- **Rationale**: On iPhones with the home bar, the last card row sits right against the nav with no gap. The `pb-16` only accounts for the nav height, not the safe area addition.

### 4. CardRow: chevron hit target too small and misaligned
- **Severity**: Minor
- **Location**: `src/components/cards/CardRow.tsx:136-145`
- **Current**: Chevron is a bare `<span>` with `fontSize: 10` and no explicit width/height. It relies on the parent button's padding for tap area.
- **Recommended**: Wrap the chevron in a `w-6 h-6 flex items-center justify-center` container so it has a minimum 24px tap target and stays vertically centered regardless of row height.
- **Rationale**: At 10px font size the chevron glyph is tiny. While the whole row is tappable, the visual indicator should feel intentionally placed, not floating.

### 5. CardRow: category label and time metadata too small
- **Severity**: Minor
- **Location**: `src/components/cards/CardRow.tsx:121-125`
- **Current**: Category is `text-[10px]`, time is `text-[11px]`, dot separator is `text-[10px]`. The MSC badge is also `text-[10px]`.
- **Recommended**: Bump category and time to `text-[11px]`, and the dot separator to `text-[11px]`. Alternatively, use a consistent `text-2xs` custom size (11px) for all metadata.
- **Rationale**: 10px text is below WCAG recommended minimum for body text. On the 375px screenshots the category labels ("HOME", "CAREGIVING") are barely legible. A 1px increase preserves the hierarchy while improving readability.

### 6. CardRow expanded state: no visual divider between header and body
- **Severity**: Cosmetic
- **Location**: `src/components/cards/CardRow.tsx:151`
- **Current**: Expanded content starts at `px-4 pb-4 pt-0` — it flows directly below the row header with no separator.
- **Recommended**: Add a subtle divider: `<div className="mx-4 border-t border-gray-100 dark:border-white/5" />` before the expandable content, or change `pt-0` to `pt-2` for more breathing room.
- **Rationale**: In the `cardrow-expanded.png` screenshot, the description text runs into the bottom of the title area. A thin rule or extra top padding would visually separate the summary row from the detail region.

### 7. DealScreen header: too many vertical sections crammed together
- **Severity**: Minor
- **Location**: `src/components/screens/DealScreen.tsx:110-200`
- **Current**: The header contains title (`mb-4`), action row (`mb-4`), balance bar (`mb-4`), and segment control — all inside `pt-10 pb-4`. Total header is quite tall with uniform 16px gaps.
- **Recommended**: Reduce `mb-4` on the title to `mb-3`, keep action row at `mb-4`, change balance bar to `mb-3`, and add `pb-5` to the header wrapper. This creates a subtle visual rhythm: tighter near the top, more space before the tab bar.
- **Rationale**: On 375px the Deal header consumes roughly 55% of the viewport before any cards appear. Tightening the top section by 8-12px total would let one more card row peek above the fold.

### 8. DealScreen: segment control padding inconsistent with MoreScreen toggles
- **Severity**: Minor
- **Location**: `src/components/screens/DealScreen.tsx:180` (`rounded-2xl p-1`), `src/components/screens/MoreScreen.tsx:76` (`rounded-xl p-0.5`)
- **Current**: DealScreen segment control uses `rounded-2xl p-1`. MoreScreen language/theme toggles use `rounded-xl p-0.5`.
- **Recommended**: Standardize on `rounded-xl p-1` for all segmented controls. The rounded-2xl on the Deal segment makes it look like a different component from the More screen toggles.
- **Rationale**: Visual consistency. Both are functionally identical segmented controls but look slightly different.

### 9. MoreScreen: settings panels have asymmetric internal padding
- **Severity**: Minor
- **Location**: `src/components/screens/MoreScreen.tsx:72` (`px-4 pt-4 pb-3`), `src/components/screens/MoreScreen.tsx:127` (History button `py-4`)
- **Current**: Language and Theme panels use `px-4 pt-4 pb-3` — 16px top, 12px bottom. The History row uses `py-4` (16px symmetric). Sign out button has no inner wrapper.
- **Recommended**: Standardize on `px-4 py-4` for all settings panels. For Language/Theme, change `pt-4 pb-3` to `pt-4 pb-4` so the bottom padding matches the top.
- **Rationale**: The 4px difference is visible when panels stack vertically — the Language panel feels bottom-heavy compared to the History row.

### 10. Navigation: active indicator pill doesn't account for label width
- **Severity**: Cosmetic
- **Location**: `src/components/layout/Navigation.tsx:27-29`
- **Current**: Active pill is `absolute top-2 inset-x-3 h-8 rounded-xl bg-partner-a/10`. It spans the full tab width minus 12px on each side.
- **Recommended**: Keep as-is, or narrow to `inset-x-6` for a tighter pill that hugs closer to the icon. The current width is acceptable but looks slightly wide for the "Deal" tab (short label).
- **Rationale**: Minor polish. The pill width is fixed regardless of label length, which means "My Cards" fills its pill nicely but "Deal" has visible negative space.

### 11. Navigation: no max-width constraint causes wide spread at 1440px
- **Severity**: Cosmetic
- **Location**: `src/components/layout/Navigation.tsx:17`
- **Current**: Inner div has `max-w-lg mx-auto` (512px max). The outer nav spans `inset-x-0`.
- **Recommended**: This is actually handled well already — `max-w-lg` keeps the tabs centered. However, the nav background spans full-width while content is capped at 512px. Consider matching the content max-width (suggested `max-w-2xl` from Finding 2) for visual consistency, or keep as-is since the frosted background spanning full-width is intentional.
- **Rationale**: No change strictly needed, but noting for completeness.

### 12. MyCardsScreen empty state: excessive vertical centering area
- **Severity**: Cosmetic
- **Location**: `src/components/screens/MyCardsScreen.tsx:73`
- **Current**: Empty state container is `h-52` (208px) with `items-center justify-center`. The emoji, title, and link are vertically centered within this box.
- **Recommended**: Change to `h-40` or `min-h-[40vh]` so the empty state sits higher on the page, closer to where card content would begin. Currently it feels like it's floating in the middle of nowhere.
- **Rationale**: On the 375px screenshot the "No cards yet" message is pushed noticeably low, almost at the vertical center of the screen, leaving a large blank gap between the header and the message.

### 13. Card modal: no horizontal padding consistency
- **Severity**: Minor
- **Location**: `src/components/cards/CardModal.tsx:193` (modal positioning `inset-4`)
- **Current**: Modal uses `inset-4` on mobile (16px from all edges). The card rows and screen headers use 16-20px horizontal padding.
- **Recommended**: Change to `inset-x-5 inset-y-4` on mobile to match the 20px horizontal rhythm if you standardize on `px-5`.
- **Rationale**: The modal feels slightly narrower than the content it overlays. Matching the horizontal inset to the page padding creates a more cohesive feel.

### 14. Confirm dialog: button sizing could be more generous
- **Severity**: Cosmetic
- **Location**: `src/components/ui/ConfirmDialog.tsx:44` (visible in `confirm-dialog.png`)
- **Current**: Buttons appear compact in the screenshot. The dialog container uses `p-6`.
- **Recommended**: Ensure action buttons use at least `py-3 px-6` for comfortable tap targets (minimum 44px height per Apple HIG). The dialog padding of `p-6` is good.
- **Rationale**: In the confirm dialog screenshot, the red "Reset" button looks slightly short. Generous button sizing on destructive actions reduces mis-taps.

### 15. DealScreen card list: `pt-3` creates tight gap after segment control
- **Severity**: Minor
- **Location**: `src/components/screens/DealScreen.tsx:203`
- **Current**: Card list area has `pt-3` (12px) top padding after the segment control.
- **Recommended**: Change to `pt-4` (16px) so the first card row has the same breathing room as the gap between the segment control and the balance bar above it.
- **Rationale**: The first card row feels cramped against the tab bar. An extra 4px top padding creates consistent vertical rhythm throughout the Deal screen.

### 16. Global: no content max-width utility defined
- **Severity**: Minor
- **Location**: `src/styles/globals.css`
- **Current**: No shared content-width utility. Each component would need to independently add `max-w-2xl mx-auto`.
- **Recommended**: Add a utility class in globals.css: `.content-container { max-width: 42rem; margin-left: auto; margin-right: auto; width: 100%; }` or define it as a Tailwind component via `@layer components`. Then apply it in `App.tsx`'s main wrapper.
- **Rationale**: Centralizing the content width constraint avoids repetition and ensures all screens respect the same column width on desktop.
