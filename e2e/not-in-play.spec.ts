import { test, expect } from '@playwright/test';
import { injectStoreData } from './fixtures';

test.describe('Not in Play', () => {
  test.beforeEach(async ({ page }) => {
    await injectStoreData(page);
    await page.goto('/deal');
    await page.waitForLoadState('networkidle');
  });

  test('expanding a card shows Remove button', async ({ page }) => {
    // Click the first card row header to expand it
    const firstCardHeader = page.locator('[class*="border-l-"]').first().getByRole('button').first();
    await firstCardHeader.click();
    // Remove button should be visible
    await expect(page.getByRole('button', { name: 'Remove' }).first()).toBeVisible();
    await page.screenshot({ path: 'test-results/card-expanded-with-remove.png', fullPage: true });
  });

  test('clicking Remove hides card and shows Not in Play section', async ({ page }) => {
    // Expand first card and click Remove
    const firstCardHeader = page.locator('[class*="border-l-"]').first().getByRole('button').first();
    await firstCardHeader.click();
    await page.getByRole('button', { name: 'Remove' }).first().click();
    // Not in Play toggle should appear
    await expect(page.getByRole('button', { name: /skipped/i })).toBeVisible();
    await page.screenshot({ path: 'test-results/not-in-play-section.png', fullPage: true });
  });

  test('expanding Not in Play section shows Restore button', async ({ page }) => {
    // Remove a card
    const firstCardHeader = page.locator('[class*="border-l-"]').first().getByRole('button').first();
    await firstCardHeader.click();
    await page.getByRole('button', { name: 'Remove' }).first().click();
    // Expand Not in Play section
    await page.getByRole('button', { name: /skipped/i }).click();
    // Expand the card inside it
    const notInPlayCardHeader = page.locator('[class*="border-l-"]').first().getByRole('button').first();
    await notInPlayCardHeader.click();
    await expect(page.getByRole('button', { name: 'Restore' })).toBeVisible();
  });

  test('clicking Restore returns card to Unassigned', async ({ page }) => {
    // Remove a card
    const firstCardHeader = page.locator('[class*="border-l-"]').first().getByRole('button').first();
    await firstCardHeader.click();
    await page.getByRole('button', { name: 'Remove' }).first().click();
    // Expand Not in Play section
    await page.getByRole('button', { name: /skipped/i }).click();
    // Expand the card inside Not in Play
    const notInPlayCardHeader = page.locator('[class*="border-l-"]').first().getByRole('button').first();
    await notInPlayCardHeader.click();
    // Wait for the Restore button and CSS animation to settle
    const restoreBtn = page.getByRole('button', { name: 'Restore' });
    await expect(restoreBtn).toBeVisible();
    // Use dispatchEvent to bypass scroll-container pointer intercept
    await restoreBtn.dispatchEvent('click');
    // Not in Play section should be gone
    await expect(page.getByRole('button', { name: /skipped/i })).not.toBeVisible();
  });
});
