# Interaction Design Review

## Summary

The Fair Play Simple app has a clean visual foundation, but several interactive elements fall short on tappability, state clarity, and feedback. The most pressing issues are undersized hit targets on mobile action buttons and card-row expand areas, no visual feedback after dealing/resetting cards, and drag-and-drop that is effectively undiscoverable on both touch and desktop. Segment tabs and navigation states work adequately but could be sharper in distinguishing active from inactive.

## Findings

### 1. CardRow action buttons are below 48px minimum touch target
- **Severity**: Critical
- **Location**: `src/components/cards/CardRow.tsx:209-246`
- **Current**: Assign/Unassign/Remove/Edit buttons use `text-[11px] px-3 py-1.5`, producing roughly 28-30px tall hit targets. These appear inside the expanded card detail area, where they are the primary interactive controls.
- **Recommended**: Increase to `py-2.5 min-h-[44px]` (ideally 48px) to meet WCAG 2.5.5 / Apple HIG minimum target size. Alternatively, wrap each in a container with `min-h-[48px]` and center content.
- **Rationale**: On 375px mobile (iPhone SE), these buttons are the primary way to assign cards. Mis-taps are likely at the current size, especially with multiple buttons side by side.

### 2. CardRow tap target height is borderline
- **Severity**: Major
- **Location**: `src/components/cards/CardRow.tsx:108-146`
- **Current**: The `<button>` row header uses `px-4 py-3.5`, which gives roughly 44-48px depending on content. The chevron target is just the 10px triangle glyph itself, with no additional padding.
- **Recommended**: The row height is acceptable but the chevron should not be the visual affordance for tapping. Consider adding a subtle hover/active highlight to the full row to make it clear the entire row is tappable. Also add `cursor-pointer` explicitly for desktop hover states.
- **Rationale**: Users may try to tap specifically on the tiny chevron rather than the full row. The `active:bg-black/[0.02]` feedback is nearly invisible.

### 3. CardRow active/pressed state is imperceptible
- **Severity**: Major
- **Location**: `src/components/cards/CardRow.tsx:109`
- **Current**: `active:bg-black/[0.02]` -- this is a 2% opacity black overlay, essentially invisible on the white card background.
- **Recommended**: Increase to `active:bg-black/[0.06]` or `active:bg-partner-a/[0.08]` to provide meaningful press feedback. Consider also adding `transition-colors duration-100` so it feels responsive.
- **Rationale**: Touch feedback is critical on mobile to confirm a tap was registered. The current value provides no perceptible change.

### 4. No visual feedback after Deal or Reset actions
- **Severity**: Major
- **Location**: `src/components/screens/DealScreen.tsx:32-66`
- **Current**: After `handleDeal()` completes, the segment tab switches to partner-a and the card list updates, but there is no toast, animation, or confirmation. After `handleResetConfirmed()`, same: the dialog closes silently and cards reappear in Unassigned.
- **Recommended**: Add a brief success toast or inline banner ("Cards dealt!" / "Cards reset") that appears for 2-3 seconds. The animation library already has `revealUp` and `bounce` keyframes that could be used. Alternatively, apply a stagger animation to the newly-dealt cards so the user sees them "arrive."
- **Rationale**: Dealing is the core action of the app. Without feedback, users may wonder if anything happened, especially if they were already on the partner-a tab.

### 5. Drag-and-drop is undiscoverable
- **Severity**: Major
- **Location**: `src/components/cards/CardRow.tsx:101-103`, `src/components/screens/DealScreen.tsx:221-224`
- **Current**: Cards have `draggable={true}` and an `onDragStart` handler that sets `cardId` in dataTransfer, but there is no visual drag handle, no drag cursor, no tooltip, and no drop zones rendered on screen. On touch devices, HTML5 drag-and-drop does not work at all without a polyfill.
- **Recommended**: Either (a) add a visible drag handle icon (e.g., 6-dot grip) on the left side of each card row with `cursor-grab`, plus rendered drop zones for each partner, or (b) remove the draggable prop entirely since the expand-and-tap-assign flow already works. If drag is kept, add a touch DnD library like `@dnd-kit/core`.
- **Rationale**: A draggable element with no visual indicator and no drop targets is dead functionality. It creates confusion if a user accidentally triggers a drag on desktop.

### 6. Deal button disabled state looks like low contrast text
- **Severity**: Minor
- **Location**: `src/components/screens/DealScreen.tsx:130-135`
- **Current**: `disabled:opacity-40` on a `bg-ink text-white` button. At 40% opacity, the button becomes a medium gray that still looks somewhat tappable, just muted.
- **Recommended**: Use `disabled:opacity-30 disabled:cursor-not-allowed` and consider changing the background to `disabled:bg-gray-300` for a more clearly "off" appearance. Adding a title/tooltip explaining why it is disabled ("No unassigned cards to deal") would also help.
- **Rationale**: Opacity-based disabled states on dark backgrounds can look like active-but-subtle buttons rather than truly disabled controls.

### 7. Segment tabs (Deal screen) lack sufficient active/inactive contrast
- **Severity**: Minor
- **Location**: `src/components/screens/DealScreen.tsx:180-199`
- **Current**: Active tab: `bg-white shadow-soft-sm text-ink`. Inactive tab: `text-concrete` (no background). The difference relies on a subtle shadow and slightly darker text color.
- **Recommended**: Add a bottom-border accent on the active tab (e.g., `border-b-2 border-partner-a`) or increase the background contrast. The count badge styling could also differentiate: active count in bold color, inactive count dimmed.
- **Rationale**: On the screenshots (deal-375.png), the active tab is distinguishable but requires a moment to parse. A stronger visual cue would speed up orientation.

### 8. Navigation bar active tab relies only on color and tint
- **Severity**: Minor
- **Location**: `src/components/layout/Navigation.tsx:26-39`
- **Current**: Active tab gets a `bg-partner-a/10` pill behind the icon and `text-partner-a` label color. Inactive tabs have `text-concrete` labels with no background.
- **Recommended**: The current treatment is functional and visible in the screenshots. However, the partner-a/10 pill at 10% opacity is very light. Consider increasing to `bg-partner-a/15` or adding a bolder indicator (e.g., a 2px dot below the active icon). Also ensure the active tab works for color-blind users: the shape (pill) helps, but the pill is so faint it may not register.
- **Rationale**: The bottom nav is the primary wayfinding element. It should leave zero doubt about which tab is active.

### 9. Expand/collapse animation works well but content shift is abrupt
- **Severity**: Cosmetic
- **Location**: `src/styles/globals.css:109-119`
- **Current**: The `expandable-grid` CSS uses `grid-template-rows: 0fr -> 1fr` with a 220ms cubic-bezier transition. This is a solid pattern for smooth height animation.
- **Recommended**: The animation is smooth. One improvement: add `will-change: grid-template-rows` for GPU optimization, and consider fading in the inner content with a slight delay (e.g., `opacity 0 -> 1` over 150ms starting at 100ms) so the text doesn't appear abruptly as the container opens.
- **Rationale**: Currently the text is visible immediately as the grid row opens, which can feel like it "pops" in. A subtle fade would polish the experience.

### 10. CardModal close button is undersized (32x32)
- **Severity**: Minor
- **Location**: `src/components/cards/CardModal.tsx:200-206`
- **Current**: `w-8 h-8` (32x32px) with a small "x" glyph. This is below the 44px minimum recommended by Apple and the 48px WCAG target.
- **Recommended**: Increase to `w-10 h-10` (40px) minimum, ideally `w-11 h-11` (44px). The visual size can remain smaller by using padding around the glyph.
- **Rationale**: Modal close buttons are frequently tapped, often in frustration. An undersized target adds friction.

### 11. ConfirmDialog buttons could use more visual weight differentiation
- **Severity**: Cosmetic
- **Location**: `src/components/ui/ConfirmDialog.tsx:48-60`
- **Current**: Destructive variant: `bg-red-500 text-white` for confirm, `bg-gray-100 text-concrete` for cancel. This is clear. However, both buttons are `flex-1` and equal width, giving equal visual weight.
- **Recommended**: Consider making the destructive confirm button slightly wider or adding an icon. The current layout is adequate but the equal sizing slightly undermines the hierarchy. The `py-2.5` height (roughly 40px) is also slightly below the 44px minimum.
- **Rationale**: For destructive actions (reset all cards, delete a card), the confirm button should be visually dominant but also harder to accidentally hit.

### 12. Settings toggle groups (Language, Theme) have no hover/active state
- **Severity**: Minor
- **Location**: `src/components/screens/MoreScreen.tsx:78-88, 106-116`
- **Current**: The segment buttons have `transition-all` but no `hover:` or `active:` class for unselected segments. Only the selected segment gets `bg-white shadow-soft-sm text-ink`.
- **Recommended**: Add `hover:bg-white/50` or `hover:text-ink/80` to inactive segments, and `active:scale-[0.98]` for press feedback.
- **Rationale**: On desktop, hovering over an inactive segment gives no cursor or visual feedback that it is clickable.

### 13. History section expand/collapse has no animated transition
- **Severity**: Cosmetic
- **Location**: `src/components/screens/MoreScreen.tsx:123-181`
- **Current**: The history content uses a conditional render (`{historyExpanded && (...)}`), which means it appears/disappears instantly. The chevron rotates smoothly, but the content does not animate.
- **Recommended**: Wrap the history content in the same `expandable-grid` / `expandable-inner` pattern used in CardRow for consistent expand/collapse behavior.
- **Rationale**: Inconsistency between the CardRow expand animation (smooth CSS grid transition) and the History section (instant mount/unmount) feels disjointed.

### 14. "Head to Deal to assign cards" link has no interactive styling
- **Severity**: Minor
- **Location**: `src/components/screens/MyCardsScreen.tsx:82`
- **Current**: The "Head to Deal to assign cards ->" text appears as a colored link (appears pink/partner-a in screenshots) but there is no underline, no hover state visible, and no button-like affordance.
- **Recommended**: Add `underline underline-offset-2` or style as a pill button (`px-4 py-2 bg-partner-a/10 rounded-xl`) to make it obviously interactive.
- **Rationale**: On the empty My Cards screen, this is the only call-to-action. It should look unmistakably tappable.

### 15. "+" add card button is only 36x36
- **Severity**: Minor
- **Location**: `src/components/screens/DealScreen.tsx:143-148`
- **Current**: `w-9 h-9` (36x36px) round button with "+" text. On mobile, this is below the 44px minimum.
- **Recommended**: Increase to `w-11 h-11` (44px) or `w-12 h-12` (48px). Maintain the current visual proportion by using a larger font size for the "+".
- **Rationale**: The "+" button is a frequently used control (adding new cards). It sits next to larger buttons (Deal, Reset) which makes the size difference more noticeable and the small target harder to hit.

### 16. Select dropdown for deal mode has no clear interactive affordance
- **Severity**: Cosmetic
- **Location**: `src/components/screens/DealScreen.tsx:120-128`
- **Current**: The select element is styled with `rounded-xl border border-gray-200 bg-white font-display font-bold text-sm` and a small native dropdown arrow. Two of its three options are disabled (Weighted, Draft).
- **Recommended**: Since two of three options are disabled, consider replacing the dropdown with a simple label ("Random Deal") until more modes are implemented. If keeping it, add a custom chevron icon to make the dropdown affordance more obvious on mobile Safari, where native select styling can obscure the arrow.
- **Rationale**: A dropdown with one usable option adds visual complexity without functional value. It also may confuse users who try the disabled options.

### 17. Sign out button has no confirmation
- **Severity**: Cosmetic
- **Location**: `src/components/screens/MoreScreen.tsx:189-194`
- **Current**: Single-tap sign out with no confirmation dialog.
- **Recommended**: Add a ConfirmDialog before signing out, consistent with the pattern used for Reset and Delete.
- **Rationale**: Accidental sign-out is a minor annoyance but breaks the pattern of confirming destructive actions established elsewhere in the app.
