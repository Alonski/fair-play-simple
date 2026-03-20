import { defineConfig, devices } from '@playwright/test';

/**
 * Firebase E2E config — runs tests against Firebase Emulators.
 * Tests real auth, Firestore sync, and card seeding flows.
 *
 * Requires: Java (for Firebase Emulators)
 * Run: bun run test:e2e:firebase
 */
export default defineConfig({
  testDir: './e2e/firebase',
  fullyParallel: false, // sequential — auth state matters
  reporter: [['html', { outputFolder: 'test-results/firebase-report' }], ['list']],
  timeout: 30_000,
  use: {
    baseURL: 'http://localhost:5173',
    screenshot: 'on',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'firebase emulators:exec --only auth,firestore "bun run dev --no-open"',
    url: 'http://localhost:5173',
    reuseExistingServer: false,
    timeout: 60_000,
    // Real Firebase env vars — app connects to emulators in dev mode
    env: {
      VITE_FIREBASE_PROJECT_ID: 'fair-play-simple',
      VITE_FIREBASE_API_KEY: 'fake-api-key-for-emulator',
      VITE_FIREBASE_AUTH_DOMAIN: 'fair-play-simple.firebaseapp.com',
    },
  },
});
