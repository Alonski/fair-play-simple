# Firebase E2E Tests

These tests run against Firebase Emulators to test real auth, Firestore sync, and card seeding.

## Prerequisites
- Java (required by Firebase Emulators)
- Firebase CLI (`npm install -g firebase-tools`)

## How it works
1. `playwright-firebase.config.ts` starts Firebase emulators + dev server
2. Tests use `window.__devSignIn(email, name)` to authenticate via emulator
3. Firestore emulator handles real sync, card seeding, and history
4. Tests verify the full auth → seed → deal → sync flow

## Running
```bash
bun run test:e2e:firebase
```

## What's tested (that regular E2E can't test)
- Google sign-in flow (via emulator)
- Card auto-seeding on first sign-in as partner-a
- Real-time Firestore sync
- Deal history save/restore via Firestore
- Offline read-only mode
- Setup screen partner slot selection
