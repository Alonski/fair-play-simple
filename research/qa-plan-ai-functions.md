# QA Plan: AI Cloud Functions E2E Testing

## Scope
Verify all AI-powered features work end-to-end against deployed Cloud Functions.

## Prerequisites
- `make dev-emu-full` running (auth + firestore + functions emulators + dev server)
- Or: production app deployed with Cloud Functions

## Test Cases

### 1. Infrastructure
| # | Test | Expected | Priority |
|---|------|----------|----------|
| 1.1 | App loads and authenticates | Sign-in screen → home screen | Critical |
| 1.2 | Navigation has 4 tabs | My Cards, Deal, Chat, More visible | Critical |
| 1.3 | All 4 screens render with headings | Each screen shows its h1 | Critical |

### 2. Chat (Cloud Function: `chat`)
| # | Test | Expected | Priority |
|---|------|----------|----------|
| 2.1 | Chat screen renders with empty state | Shows "Ask your Fair Play Expert" | Critical |
| 2.2 | Send a message | Message appears in bubble, typing indicator shows | Critical |
| 2.3 | AI responds | AI response bubble appears within 15s | Critical |
| 2.4 | AI uses tools (getCardState) | Ask "how many cards do we have?" — AI references actual data | High |
| 2.5 | Shared/Private mode toggle | Both tabs work, switching clears messages | High |
| 2.6 | Chat persists across page reload | Reload page, previous messages still visible | Medium |

### 3. Translation (Cloud Function: `translate`)
| # | Test | Expected | Priority |
|---|------|----------|----------|
| 3.1 | Open CardModal, type English title | "Translate → HE" button appears | High |
| 3.2 | Click translate button | Hebrew title field fills with translation within 10s | High |
| 3.3 | Type Hebrew, translate to English | "Translate → EN" button works | Medium |

### 4. AI Rebalance (Cloud Function: `rebalance`)
| # | Test | Expected | Priority |
|---|------|----------|----------|
| 4.1 | ✨ AI button visible on Deal screen | Button present in action row | High |
| 4.2 | Button disabled when no cards assigned | Greyed out with no cards dealt | High |
| 4.3 | Click AI button (with cards assigned) | Dialog shows suggestions or "balanced" message | High |
| 4.4 | Apply All applies suggestions | Cards reassign per AI suggestions | Medium |

### 5. MSC Suggestions (Cloud Function: `mscSuggest`)
| # | Test | Expected | Priority |
|---|------|----------|----------|
| 5.1 | Expand card without MSC notes | ✨ AI button visible next to "Add MSC notes..." | High |
| 5.2 | Click AI MSC button | Draft fills with AI-generated MSC note within 10s | High |
| 5.3 | Card with existing MSC | No AI button shown (only manual edit) | Medium |

### 6. Onboarding (Cloud Functions: `skipSuggest` + `dealSuggest`)
| # | Test | Expected | Priority |
|---|------|----------|----------|
| 6.1 | Onboarding shows for new household | Welcome screen with "Get Started" | Medium |
| 6.2 | AI skip suggestions load | After entering context, skip suggestions appear | Medium |
| 6.3 | AI deal suggestions load | After confirming skips, deal suggestions appear | Medium |

### 7. Hebrew Mode
| # | Test | Expected | Priority |
|---|------|----------|----------|
| 7.1 | Switch to Hebrew | All UI labels switch to Hebrew | High |
| 7.2 | Chat tab shows צ׳אט | Hebrew nav label correct | High |
| 7.3 | Chat works in Hebrew | Can send Hebrew message, get Hebrew response | Medium |

### 8. Dark Mode
| # | Test | Expected | Priority |
|---|------|----------|----------|
| 8.1 | Chat screen in dark mode | Dark backgrounds, readable text | Medium |
| 8.2 | AI dialog in dark mode | Rebalance dialog renders correctly | Medium |

## Out of Scope (requires manual testing)
- Push notifications (requires real device + FCM)
- Scheduled functions (weeklyCheckIn, cardReminder — run on cron)
- Two-device sync (requires Moral's device)
- Production auth (Google sign-in popup)

## Pass Criteria
- All Critical tests pass
- At least 80% of High priority tests pass
- AI responses arrive within 15 seconds
- No console errors related to Cloud Functions
