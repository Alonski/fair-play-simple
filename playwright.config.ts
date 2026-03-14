import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  reporter: [['html'], ['list']],
  use: {
    baseURL: 'http://localhost:5173',
    screenshot: 'on',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: 'bun run dev --no-open',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    env: {
      // No Firebase vars → isFirebaseConfigured = false → auth bypassed
      VITE_FIREBASE_PROJECT_ID: '',
      VITE_FIREBASE_API_KEY: '',
    },
  },
});
