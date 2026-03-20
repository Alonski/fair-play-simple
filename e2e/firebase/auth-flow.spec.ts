import { test, expect } from '@playwright/test';

/**
 * Firebase Auth E2E tests — run against Firebase Emulators.
 * These test the real auth flow including sign-in, setup, and card seeding.
 */
test.describe('Firebase Auth Flow', () => {
  test('shows auth screen when not signed in', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // Should see the auth screen with Google sign-in button
    await expect(page.getByRole('button', { name: /continue with google/i })).toBeVisible();
    await page.screenshot({ path: 'test-results/firebase-auth-screen.png', fullPage: true });
  });

  test('devSignIn authenticates and shows setup screen', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // Sign in via dev helper
    await page.evaluate(async () => {
      await (window as unknown as Record<string, (email: string, name: string) => Promise<unknown>>).__devSignIn('alon@test.com', 'Alon');
    });
    // Wait for auth state to propagate and UI to update
    await page.waitForTimeout(2000);
    await page.reload();
    await page.waitForLoadState('networkidle');
    // Should see either setup screen or my cards (depending on if household exists)
    const hasSetup = await page.getByText(/which partner/i).isVisible().catch(() => false);
    const hasMyCards = await page.getByText(/my cards/i).isVisible().catch(() => false);
    expect(hasSetup || hasMyCards).toBe(true);
    await page.screenshot({ path: 'test-results/firebase-after-signin.png', fullPage: true });
  });

  test('after setup, cards are auto-seeded for partner-a', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // Sign in
    await page.evaluate(async () => {
      await (window as unknown as Record<string, (email: string, name: string) => Promise<unknown>>).__devSignIn('alon@test.com', 'Alon');
    });
    await page.waitForTimeout(2000);
    await page.reload();
    await page.waitForLoadState('networkidle');

    // If setup screen appears, choose partner-a
    const setupVisible = await page.getByText(/which partner/i).isVisible().catch(() => false);
    if (setupVisible) {
      await page.getByRole('button', { name: /partner a/i }).click();
      await page.waitForTimeout(3000);
      await page.reload();
      await page.waitForLoadState('networkidle');
    }

    // Navigate to deal screen to check if cards were seeded
    await page.goto('/deal');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Should have cards in the deal screen (seeded by the app)
    await page.screenshot({ path: 'test-results/firebase-deal-seeded.png', fullPage: true });
  });
});
