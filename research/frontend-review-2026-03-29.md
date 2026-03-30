# Frontend Review

Date: 2026-03-29

## Scope

This review covered:

- Source review of the current routed frontend, shared UI primitives, stores, and localization setup
- Headless Playwright capture of the main shipped flows at 375px, 412px dark mode, and 1440px
- Comparison against the current implementation plan in `PLANNING.md`

Artifacts captured during review live in `tmp/review-cli/`.

## Executive Summary

The app is strongest today as a warm, mobile-first responsibility manager with a clear three-tab shell, decent interaction polish, and a more human visual tone than a generic dashboard. The current shipped experience is coherent enough on phone-sized layouts, and several earlier frontend basics are already in place: route splitting, skip link, dark mode, confirmation dialogs, safe-area handling, and centered content on large screens.

The bigger problem is not raw polish. It is product and frontend coherence. The routed app is a compact list-based tool, while the repo still contains a separate, more ambitious board/gallery direction that is not actually shipped. At the same time, the plan promises a distinctive bilingual Fair Play PWA with a game-board layer and offline-first behavior, but the current UX only partially delivers that promise. The highest-leverage gaps are end-to-end localization, offline/local-mode coherence, and choosing one primary interaction model instead of carrying two competing ones.

## What Is Working

- The shipped screens feel intentionally mobile-first. The centered app shell in [`src/App.tsx:110-124`](../src/App.tsx) and the bottom-nav structure in [`src/components/layout/Navigation.tsx:16-52`](../src/components/layout/Navigation.tsx) keep the product focused instead of trying to behave like a desktop SaaS app.
- The visual base is warmer than average: semantic partner colors, soft paper background, blurred color fields, and gradient headers create a more domestic feel than a neutral productivity tool. See [`src/styles/globals.css:7-55`](../src/styles/globals.css) and [`src/components/layout/Background.tsx`](../src/components/layout/Background.tsx).
- The inline card workflow is the strongest current UI pattern. `CardRow` gives quick scanning, expandable detail, inline MSC notes, and direct assignment actions without forcing modal hops for every change. See [`src/components/cards/CardRow.tsx:98-252`](../src/components/cards/CardRow.tsx).
- The routed app already includes a few accessibility-aware decisions that many early projects skip: route-level code splitting in [`src/router.tsx:6-24`](../src/router.tsx), a skip link in [`src/App.tsx:112-114`](../src/App.tsx), tablist roles on segmented controls, and dialog focus handling in [`src/components/cards/CardModal.tsx:79-100`](../src/components/cards/CardModal.tsx) and [`src/components/ui/ConfirmDialog.tsx`](../src/components/ui/ConfirmDialog.tsx).

## Plan Alignment

### Aligned or mostly aligned

- Mobile-first shell and basic card assignment flow exist.
- A design-token layer, dark mode, and animation hooks exist.
- Card CRUD exists in practical terms through `CardModal`, even if the authoring flow is still heavy.

### Partially aligned

- The app does use `react-i18next`, English/Hebrew content objects, and RTL switching, but the UI is not actually localized end to end.
- The visual system is distinctive enough to avoid blandness, but the shipped UI reads more “soft tactile utility app” than the planned “Organic Brutalism”.
- Offline persistence exists via Zustand, but the actual product flow is not fully coherent without auth/Firebase context.

### Not yet aligned

- `PLANNING.md` calls out a “Basic game board UI” and a fuller card/game interaction model, but the routed app only ships `My Cards`, `Deal`, and `More` list screens. See [`PLANNING.md:22-29`](../PLANNING.md) versus [`src/router.tsx:7-24`](../src/router.tsx).
- Phase 1 still lists internationalization as incomplete, and the current UI confirms that status. See [`PLANNING.md:8-15`](../PLANNING.md).
- The repo contains a second frontend direction (`Dashboard`, `GameBoard`, `PartnerZone`, `Card`, `CardStack`) that is not surfaced to users. See [`src/components/layout/Dashboard.tsx:18-74`](../src/components/layout/Dashboard.tsx) and [`src/components/game/GameBoard.tsx:137-335`](../src/components/game/GameBoard.tsx).

## Findings

### 1. Major: localization is only partial, so the bilingual promise breaks in the actual UI

The app advertises EN/HE support in the plan and does switch `dir`/`lang` globally in [`src/App.tsx:63-70`](../src/App.tsx). But large parts of the shipped UI are still hardcoded English:

- Bottom nav labels in [`src/components/layout/Navigation.tsx:3-7`](../src/components/layout/Navigation.tsx)
- Deal toasts, “Skipped”, confirm-dialog copy, and “Your household is balanced” in [`src/components/screens/DealScreen.tsx:63`](../src/components/screens/DealScreen.tsx), [`src/components/screens/DealScreen.tsx:81`](../src/components/screens/DealScreen.tsx), [`src/components/screens/DealScreen.tsx:274`](../src/components/screens/DealScreen.tsx), [`src/components/screens/DealScreen.tsx:287`](../src/components/screens/DealScreen.tsx), and [`src/components/screens/DealScreen.tsx:311-327`](../src/components/screens/DealScreen.tsx)
- History labels, loading text, restore/sign-out dialog copy, and relative-time formatting in [`src/components/screens/MoreScreen.tsx:10-20`](../src/components/screens/MoreScreen.tsx), [`src/components/screens/MoreScreen.tsx:145-191`](../src/components/screens/MoreScreen.tsx), and [`src/components/screens/MoreScreen.tsx:217-236`](../src/components/screens/MoreScreen.tsx)
- MSC labels and action buttons in [`src/components/cards/CardRow.tsx:168-207`](../src/components/cards/CardRow.tsx) and [`src/components/cards/CardRow.tsx:225-250`](../src/components/cards/CardRow.tsx)
- Nearly the entire card editor in [`src/components/cards/CardModal.tsx:133-357`](../src/components/cards/CardModal.tsx)

There is also a direct locale mismatch: `SetupScreen` asks for `setup.*` keys that do not exist in the locale files, so those strings always fall back to English. See [`src/components/auth/SetupScreen.tsx:35-40`](../src/components/auth/SetupScreen.tsx) against [`src/locales/en.json:1-117`](../src/locales/en.json).

Why this matters: the app looks bilingual in architecture, but the lived experience is “English UI with some translated content.” That is fine for an internal prototype, but it is not aligned with the plan or with the effort already spent on RTL support.

Recommendation:

- Finish a full string audit before adding more screens.
- Move nav labels, dialogs, button copy, and relative-time strings into locale files.
- Add the missing `setup` namespace.
- Replace English-only plural logic like `card/cards` in [`src/components/screens/MyCardsScreen.tsx:66`](../src/components/screens/MyCardsScreen.tsx) with i18n pluralization.

### 2. Major: the frontend currently has two competing product directions

The shipped app is a compact tabbed list workflow:

- `My Cards`
- `Deal`
- `More`

That is the entire route tree in [`src/router.tsx:7-24`](../src/router.tsx).

But the repo also contains a fuller board-and-gallery direction with draggable card objects, partner zones, time commitment summaries, editable partner names, and a dashboard shell:

- [`src/components/layout/Dashboard.tsx:18-74`](../src/components/layout/Dashboard.tsx)
- [`src/components/game/GameBoard.tsx:137-335`](../src/components/game/GameBoard.tsx)
- [`src/components/game/PartnerZone.tsx:57-198`](../src/components/game/PartnerZone.tsx)
- [`src/components/cards/Card.tsx:70-176`](../src/components/cards/Card.tsx)
- [`src/components/cards/CardStack.tsx:18-111`](../src/components/cards/CardStack.tsx)

Those components are not the product users actually get. The result is design debt, not optional experimentation: the codebase contains one soft, list-based UX and one bolder, more game-like board UX, but the app does not make an explicit decision between them.

Why this matters: it becomes hard to judge whether the app “follows the plan” because the plan is closer to the unused board path, while the shipped routes are closer to a simple mobile organizer.

Recommendation:

- Decide which experience is the product.
- If the current list-based shell is the product, remove or archive the unused board/dashboard layer and tighten the plan around that.
- If the planned board metaphor is still the target, route it and make the current list screens supporting views rather than the whole product.

### 3. Major: offline/local mode is not a coherent primary experience yet

The plan calls for offline-first behavior in [`PLANNING.md:86-91`](../PLANNING.md), and there is local persistence in the stores. But the actual UX still assumes household/auth context in ways that break the local-only story.

The clearest issue is `My Cards`:

- Cards are only shown if `profile?.partnerSlot` exists in [`src/components/screens/MyCardsScreen.tsx:27`](../src/components/screens/MyCardsScreen.tsx)
- If that slot is missing, `myCards` becomes `[]`, but `myName` still resolves to partner B by default in [`src/components/screens/MyCardsScreen.tsx:29`](../src/components/screens/MyCardsScreen.tsx)

So a local/offline user can land on a screen titled with the wrong person and an empty-state message even when there are cards in local storage.

Other examples:

- `MoreScreen` hides history and sign-out unless Firebase is configured and the user is authenticated in [`src/components/screens/MoreScreen.tsx:137-214`](../src/components/screens/MoreScreen.tsx)
- Translation buttons depend on Firebase AI and silently return the original text when unavailable in [`src/services/translationService.ts:27-31`](../src/services/translationService.ts)

Why this matters: right now offline persistence exists technically, but the product flow does not read as intentionally offline-first. It reads as “online app with a partial local fallback.”

Recommendation:

- Define a first-class local household mode for review/demo/offline use.
- Fix the `My Cards` fallback so missing `partnerSlot` does not imply partner B.
- Expose a meaningful local-only undo/history story, or clearly remove that expectation from the offline path.

### 4. Medium: the product language still assumes Fair Play insider knowledge

The copy has improved in some places. The `My Cards` empty state now explains what cards are in [`src/components/screens/MyCardsScreen.tsx:85-92`](../src/components/screens/MyCardsScreen.tsx), which is a good correction.

But the rest of the app still leans on jargon that only makes sense if the user already understands the Fair Play method:

- “Deal” / “Random Deal” in [`src/components/screens/DealScreen.tsx:127-152`](../src/components/screens/DealScreen.tsx)
- “Skipped” in [`src/components/screens/DealScreen.tsx:279-288`](../src/components/screens/DealScreen.tsx)
- “MSC Notes” in [`src/components/cards/CardRow.tsx:166-196`](../src/components/cards/CardRow.tsx)
- Nav label “More” while the screen itself is really “Settings” in [`src/components/layout/Navigation.tsx:3-7`](../src/components/layout/Navigation.tsx) and [`src/components/screens/MoreScreen.tsx:71-77`](../src/components/screens/MoreScreen.tsx)

Why this matters: the UI feels self-explanatory only after you already understand the conceptual model. That is manageable for an internal tool, but weak for onboarding and for future productization.

Recommendation:

- Keep the Fair Play flavor, but add plain-language scaffolding.
- “Deal” can stay as a brand metaphor if paired with clearer support text like “Split responsibilities” or “Assign cards.”
- Expand or rename “MSC Notes” unless the audience already knows the term.

### 5. Medium: Settings/More under-delivers relative to the available frontend surface area

The settings store already supports:

- language
- theme
- animations
- sound
- notifications
- default deal mode

See [`src/stores/settingsStore.ts:17-24`](../src/stores/settingsStore.ts) and [`src/stores/settingsStore.ts:41-59`](../src/stores/settingsStore.ts).

The locale files also define settings labels beyond what is rendered in [`src/locales/en.json:107-116`](../src/locales/en.json).

But the actual `More` screen only exposes language and theme in the common case, with history/sign-out conditional on Firebase in [`src/components/screens/MoreScreen.tsx:80-214`](../src/components/screens/MoreScreen.tsx).

Why this matters: the screen feels thin, and the nav label “More” overpromises a place for secondary features that are not actually there.

Recommendation:

- Either expand `More` into a real settings/utility space using the store capabilities that already exist, or rename/simplify it so the information architecture matches what is shipped.
- If animations are user-configurable in `App.tsx`, expose that control in the UI.

### 6. Medium: custom-card creation is still too heavy for first-run use

The card editor is capable, but it is not lightweight:

- It asks for English and Hebrew title plus English and Hebrew description before save in [`src/components/cards/CardModal.tsx:133-145`](../src/components/cards/CardModal.tsx)
- It also asks for category, frequency, difficulty, time estimate, and optional details
- Translation buttons sit inline but rely on a Firebase AI path that may not be available in local/offline mode in [`src/services/translationService.ts:27-47`](../src/services/translationService.ts)

Why this matters: this is a lot of cognitive load for the first “add a missing household responsibility” moment. It suits power editing better than fast capture.

Recommendation:

- Add a quick-add path: title, category, optional note.
- Make Hebrew fields optional unless the user explicitly wants bilingual entry.
- Keep the full editor as an advanced path, not the only path.

### 7. Medium: desktop is contained, but it is still essentially a stretched mobile app

The app no longer has the worst version of desktop behavior; content is centered in [`src/App.tsx:118-121`](../src/App.tsx). That is good.

But the desktop story is still unresolved:

- Bottom tab navigation remains the only navigation pattern at 1440px in [`src/components/layout/Navigation.tsx:16-52`](../src/components/layout/Navigation.tsx)
- The main content stays single-column while the background occupies most of the screen
- The richer board-oriented components that would make desktop feel more intentional are not routed

Why this matters: on desktop the product feels like a phone UI placed on a large canvas, not a deliberately adapted experience.

Recommendation:

- If desktop support matters, add a proper large-screen shell.
- If it does not, lean into a phone-frame or explicitly app-like centered viewport so the empty space feels intentional rather than unfinished.

### 8. Minor: the shipped design is warm and polished, but not yet convincingly “Organic Brutalism”

The plan describes a distinctive “Organic Brutalism” aesthetic in [`PLANNING.md:3-5`](../PLANNING.md). The current shipped visuals are warm, rounded, soft-shadowed, and slightly blurred:

- rounded-2xl cards and panels
- gentle gradients
- paper texture
- subtle floating blobs

That is a coherent look, but it is not especially brutalist. The unused `Dashboard` and `GameBoard` path actually pushes closer to a bolder “card object / play surface” idea, but those surfaces are not shipped.

Why this matters: there is a mismatch between the design language promised in the plan and the softer product the user actually sees.

Recommendation:

- Either revise the plan language to match the shipped aesthetic, or intentionally push the routed UI further toward sharper structural contrast, stronger card-object presence, and a more signature interaction surface.

## Prioritized Recommendations

1. Pick one frontend direction and align the plan to it.
2. Finish the i18n pass before adding more surface area.
3. Define and polish a first-class offline/local mode.
4. Simplify the language around “Deal”, “Skipped”, and “MSC”.
5. Add a quick-add card flow and make bilingual entry progressive, not mandatory.
6. Decide whether desktop is supported or intentionally phone-framed.

## Suggested Next Step

If the goal is to keep momentum without a redesign, the most pragmatic sequence is:

1. Do an end-to-end copy/i18n pass.
2. Fix local/offline-state coherence.
3. Remove or route the unused board/dashboard path.
4. Then reassess whether the current list-based shell still needs a larger design rethink.

That sequence reduces confusion faster than chasing visual polish in isolation.
