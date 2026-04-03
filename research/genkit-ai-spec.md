# Spec: Conversational AI with Genkit + Vercel AI SDK

_Session: fair-play-genkit | Phase: seed_

## Problem Statement

The app currently uses one-shot client-side Gemini calls (`firebase/ai`) for translations and onboarding suggestions. There's no conversation memory, no server-side AI logic, no scheduled AI jobs, and no push notifications. The AI features feel bolted-on rather than integrated.

## Target Outcome

A conversational AI advisor ("Fair Play Expert") woven throughout the app — a dedicated chat tab, inline AI suggestions on every screen, scheduled weekly check-ins, and push notification reminders. Server-side Genkit flows on Cloud Functions handle the AI logic; Vercel AI SDK provides streaming chat UI on the client.

## Architecture

```
Browser (Vite + React)                    Firebase Cloud Functions
─────────────────────                    ─────────────────────────
Vercel AI SDK                            Genkit
  - useChat() for streaming chat    ──►  - chatFlow (multi-turn, tools)
  - useCompletion() for inline AI   ──►  - translateFlow
                                    ──►  - rebalanceFlow
                                    ──►  - skipSuggestFlow
                                    ──►  - dealSuggestFlow
                                    ──►  - mscSuggestFlow
                                    ──►  - cardInsightsFlow
                                         
                                         Scheduled Functions
                                         - weeklyCheckIn (pub/sub cron)
                                         - cardReminder (pub/sub cron)
                                         
                                         FCM Push Notifications
                                         - via scheduled functions
                                         - device token in Firestore
```

## Constraints

- Firebase Blaze plan required (upgrade from Spark)
- 2-user app (Alon + Moral), English + Hebrew
- Gemini 2.5 Flash for cost (upgrade to Pro later if needed)
- PWA push notifications (Android + iOS home screen)
- Firestore for chat persistence, device tokens, AI state

## In Scope

1. **Firebase Blaze upgrade + Cloud Functions + Genkit setup**
2. **Chat tab** — 4th nav tab with conversational AI
   - Two chat modes: "Private" (per-user, only I see it) and "Shared" (both partners see)
   - Chat history persisted in Firestore with compaction/summarization for long conversations
   - AI persona: "Fair Play Expert" — friendly, helpful, knowledgeable about Fair Play methodology
   - AI has tools: can read card state, suggest assignments, explain cards, cite Fair Play concepts
   - Streaming responses via Vercel AI SDK `useChat`
3. **Migrate existing AI to Genkit flows** — translate, skip suggestions, deal suggestions, rebalance
4. **Inline AI features across screens:**
   - Deal screen: "AI Suggest" button for rebalancing
   - CardRow: AI-generated MSC suggestions for empty MSC fields
   - CardRow: AI card insights ("held for 6 weeks — consider swapping")
   - Onboarding: migrate to Genkit flows
5. **Scheduled Cloud Functions:**
   - Weekly check-in: runs every Sunday, generates a summary of the week's card activity, stores as a "weekly report" in Firestore, sends push notification
   - Card reminder: runs daily, checks for cards held too long without MSC notes, sends nudge
6. **Push notifications via FCM:**
   - Service worker for PWA push
   - Device token registration in Firestore
   - Notifications from scheduled functions

## Out of Scope

- Voice/audio AI
- Image generation
- Gemini Pro (start with Flash)
- Third-party integrations (calendar, etc.)
- Real-time collaborative chat (both partners typing at once in shared chat)

## Assumptions

- User will upgrade to Blaze plan before deploying Cloud Functions
- Firebase AI Logic (Gemini API) is already enabled in the project
- The existing Firestore security rules will be extended for new collections
- PWA manifest and service worker are partially set up (favicon + manifest exist)

## Implementation Slices

### Slice 1: Infrastructure — Blaze + Cloud Functions + Genkit
- Create `functions/` directory with Genkit setup
- Configure Firebase for Cloud Functions deployment
- Create a simple "hello" Genkit flow callable from the client
- Verify round-trip: client → Cloud Function → Genkit → Gemini → response
- Update CI/CD to deploy functions alongside hosting + rules
- **Acceptance:** `firebase deploy` succeeds, client can call a test flow

### Slice 2: Migrate Existing AI to Genkit Flows
- Create Genkit flows: `translateFlow`, `skipSuggestFlow`, `dealSuggestFlow`, `rebalanceFlow`
- Expose as callable Cloud Functions
- Update client services to call Cloud Functions instead of `firebase/ai`
- Remove `firebase/ai` dependency
- **Acceptance:** Translations and onboarding AI work via Cloud Functions, no client-side Gemini calls

### Slice 3: Chat Backend — Genkit Chat Flow with Tools
- Create `chatFlow` — multi-turn Genkit flow with conversation history
- Define AI tools:
  - `getCardState` — read current card assignments
  - `getStats` — read stats/history
  - `suggestAssignment` — suggest card moves
  - `explainCard` — explain what a card means in Fair Play methodology
- Firestore collections: `households/{id}/chats/{chatId}/messages`
- Chat modes: private (`users/{uid}/chats`) and shared (`households/{id}/sharedChat`)
- Conversation compaction: after 50 messages, summarize older messages into a context block
- System prompt: Fair Play Expert persona with knowledge of all 100 cards
- **Acceptance:** Chat flow responds conversationally, uses tools, persists history

### Slice 4: Chat UI — New Nav Tab
- Install Vercel AI SDK (`ai` + `@ai-sdk/react`)
- Create `ChatScreen` component as 4th nav tab
- Wire `useChat()` to the Genkit chat Cloud Function endpoint
- UI: message list, input bar, streaming responses, mode toggle (Private/Shared)
- Show tool use results inline (e.g., "I checked your cards — Alon has 52, Moral has 48")
- Add chat nav icon + update Navigation component
- Hebrew translations for chat UI
- **Acceptance:** Can have multi-turn conversation, switch between private/shared, messages persist across reloads

### Slice 5: Inline AI Features
- **Deal screen:** "AI Suggest" button → calls `rebalanceFlow`, shows suggestions in a modal/drawer
- **CardRow:** "Suggest MSC" button on empty MSC fields → calls `mscSuggestFlow`, fills in suggestion
- **CardRow:** Card insights badge — on expand, show AI insight if card held > 4 weeks (lazy-loaded)
- **Acceptance:** Each inline feature works, calls Cloud Function, shows result

### Slice 6: Push Notifications + Scheduled Functions
- Set up Firebase Cloud Messaging (FCM) for web push
- Create service worker for push notification handling
- Device token registration: save to `users/{uid}/tokens` on app load
- Scheduled function: `weeklyCheckIn` — runs every Sunday at 9am, generates week summary, sends push to both partners
- Scheduled function: `cardReminder` — runs daily, finds cards without MSC held > 2 weeks, sends nudge
- Update PWA manifest with FCM config
- **Acceptance:** Push notifications received on mobile browser, weekly summary arrives on Sunday

### Slice 7: Polish + Integration Testing
- End-to-end testing of all AI features
- Error handling: graceful degradation when Cloud Functions are down
- Loading states and streaming UI polish
- Hebrew translations for all new UI strings
- Update CLAUDE.md, next-steps.md, and research docs
- **Acceptance:** All features work in production, both languages, both partners

## Verification Plan

Each slice:
1. `bun run lint && bun run build && bun run test --run` on client
2. Genkit/Cloud Functions tests where applicable
3. Manual testing against emulators (auth + Firestore + Functions)
4. Visual verification via Playwright CLI scripts

## Risks

1. **Cold start latency** — Cloud Functions may take 2-5s on first call. Mitigate with min instances (costs more) or accept the delay.
2. **Gemini rate limits** — Free tier has low RPM. Monitor and add retry logic.
3. **Push notification permission** — Users must grant permission. Handle denial gracefully.
4. **Chat cost** — Multi-turn with 100-card context could get expensive. Compaction helps.
5. **iOS PWA push** — Requires iOS 16.4+ and app installed to home screen. Document this.
