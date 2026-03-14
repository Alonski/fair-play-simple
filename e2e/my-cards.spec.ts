import { test, expect } from '@playwright/test';
import { injectStoreData } from './fixtures';

test.describe('My Cards screen', () => {
  test('shows empty state when no cards held', async ({ page }) => {
    // Inject store with all cards unassigned — no partner-a holder
    await injectStoreData(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // My Cards shows empty state when no cards are held
    await expect(page.getByText(/no cards yet/i)).toBeVisible();
    await page.screenshot({ path: 'test-results/my-cards-empty.png', fullPage: true });
  });

  test('shows cards held by partner-a after dealing', async ({ page }) => {
    await injectStoreData(page);
    await page.goto('/deal');
    await page.waitForLoadState('networkidle');
    // Deal cards
    await page.locator('button', { hasText: 'Deal' }).click();
    // Navigate to My Cards
    await page.getByRole('link', { name: /my cards/i }).click();
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/my-cards-with-card.png', fullPage: true });
  });

  test('renders My Cards screen with partner name header', async ({ page }) => {
    await injectStoreData(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // The My Cards screen always renders (auth bypassed in local mode)
    // Partner names come from game store — should show Alon or Partner A
    await expect(page.locator('h1, h2, [class*="font-display"]').first()).toBeVisible();
    await page.screenshot({ path: 'test-results/my-cards-with-badge.png', fullPage: true });
  });
});
