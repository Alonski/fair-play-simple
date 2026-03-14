import { test, expect } from '@playwright/test';
import { injectStoreData } from './fixtures';

test.describe('Deal screen', () => {
  test.beforeEach(async ({ page }) => {
    await injectStoreData(page);
    await page.goto('/deal');
    await page.waitForLoadState('networkidle');
  });

  test('shows cards in Unassigned segment', async ({ page }) => {
    const unassignedBtn = page.getByRole('button', { name: /unassigned/i });
    await expect(unassignedBtn).toBeVisible();
    await page.screenshot({ path: 'test-results/deal-unassigned.png', fullPage: true });
  });

  test('Deal button distributes cards to partners', async ({ page }) => {
    const dealBtn = page.locator('button', { hasText: 'Deal' });
    await expect(dealBtn).toBeEnabled();
    await dealBtn.click();
    // After deal, view switches to Alon's cards
    await page.screenshot({ path: 'test-results/deal-after-deal.png', fullPage: true });
    // Alon segment button should be visible
    await expect(page.getByRole('button', { name: /alon/i }).first()).toBeVisible();
  });

  test('Reset moves all cards back to Unassigned', async ({ page }) => {
    // Deal first
    await page.locator('button', { hasText: 'Deal' }).click();
    // Then reset — now shows confirmation dialog
    await page.locator('button', { hasText: 'Reset' }).click();
    // Confirm the reset in the dialog
    await page.locator('button', { hasText: 'Reset' }).nth(1).click();
    // Unassigned button with count (6) should be visible
    const unassignedBtn = page.getByRole('button', { name: /unassigned/i });
    await expect(unassignedBtn).toBeVisible();
    await expect(unassignedBtn).toContainText('6');
  });

  test('segment switcher switches between partners and Unassigned', async ({ page }) => {
    await page.getByRole('button', { name: /alon/i }).first().click();
    await page.getByRole('button', { name: /moral/i }).first().click();
    await page.getByRole('button', { name: /unassigned/i }).click();
    await expect(page.getByRole('button', { name: /unassigned/i })).toBeVisible();
  });
});
